import * as Phaser from 'phaser'
import { Socket } from "socket.io-client"

// Components
import addPlayer from '../../components/add_player'
import addOtherPlayer from '../../components/add_other_player'
import addGun from '../../components/add_gun'
import addOtherPlayerGun from '../../components/add_other_player_gun'
import spawnMyPlayerBullet from '../../components/spawn_my_player_bullet'
import spawnOtherPlayerBullet from '../../components/spawn_other_player_bullet'
import roomChat from '../../components/room_chat'
import playerBalloonChat from '../../components/player_balloon_chat'
import { healthBar } from '../../components/health_bar'
import playerHitFeedback from '../../components/player_hit_feedback'
import roomActionsLog from '../../components/room_actions_log'

//Triggers
import onMyPlayerHit from '../../triggers/onMyPlayerHit'
import onOtherPlayerHit from '../../triggers/onOtherPlayerHit'

//Custom Interfaces
import {
  InitialPlayerInformations,
  RoomInfoGame,
  IPlayer,
  IWhoKilledWho
} from '../../interfaces/interfaces'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: true,
  visible: true,
  key: 'Gravel',
};

let allPlayers: { 
  [playerId: string]: Phaser.Physics.Arcade.Sprite
} = {};
let allGuns: { 
  [playerId: string]: Phaser.Physics.Arcade.Sprite
} = {};

export let playerHealth = { heath: 100 }
const playerVelocity = 500
let referenceTime = 0;
let bulletInterval = 130;
let mouseInfo: {
  x: number,
  y: number,
  getXY: () => { x: number, y: number }
}

export default class Game extends Phaser.Scene {
  constructor(private socket: Socket) {
    super(sceneConfig);
  }

  private roomInfo!: RoomInfoGame;

  //BulletsGroups
  private myPlayerBulletsGroup!: Phaser.Physics.Arcade.Group;
  private otherPlayerBulletGroup!: Phaser.Physics.Arcade.Group;
  
  init (roomInfo: RoomInfoGame) {
    this.roomInfo = roomInfo;
  }

  preload() {
    this.load.image('ak-47', require('../../assets/sprites/guns/ak-47.png').default);
    this.load.image('bullet', require('../../assets/sprites/bullets/bullet.png').default);
    this.load.image('blood', require('../../assets/sprites/particles/blood.png').default);
    this.load.image('spark', require('../../assets/sprites/particles/spark.png').default);
    this.load.spritesheet('player_idle', require('../../assets/sprites/player/idle.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_run', require('../../assets/sprites/player/run.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_death', require('../../assets/sprites/player/death.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.image('grass-tiles', require('../../assets/tilemaps/gravel_tilemap/grass.png').default);
  }

  create() {
    let handleMouseMove = (event: any) => {
      mouseInfo = {
        x: event.x,
        y: event.y,
        getXY: () => {
          return { x: mouseInfo.x, y: mouseInfo.y }
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    this.socket.emit("playerEntered", this.roomInfo.roomId)
    //Return of all informations of this current game
    this.socket.on('currentPlayers', ({players, chat}: InitialPlayerInformations) => {
      Object.keys(players).forEach(id => {
        if (id == this.socket.id && !(id in allPlayers)) {
          allPlayers[id] = addPlayer(this, players[id]);
          addGun(this, this.socket, this.roomInfo.roomId, mouseInfo, allPlayers, allGuns)
          //create overlap trigger for this player
          this.physics.add.overlap(allPlayers[id], this.otherPlayerBulletGroup,
            (player, bullet) =>
            onMyPlayerHit(
              player,
              bullet,
              this,
              this.socket,
              this.roomInfo.roomId
            ),
            undefined,
            this);

          roomChat(this, this.socket, this.roomInfo.roomId, chat)
          playerBalloonChat(this, allPlayers, this.socket)
          healthBar(this, allPlayers, this.socket)
          playerHitFeedback(this, allPlayers, this.socket)
          roomActionsLog(this,this.socket)
        } else {
          if (!(id in allPlayers)) {
            allPlayers[id] = addOtherPlayer(this, players[id]);
            addOtherPlayerGun(this, id, allPlayers, allGuns)
            this.physics.add.overlap(allPlayers[id], this.myPlayerBulletsGroup,
              (player, bullet) => onOtherPlayerHit(player, bullet, this), undefined, this);
          }
        }
      });
    });

    this.socket.on('playerMoved', (players: { [key: string]: IPlayer }) => {

      Object.keys(players).forEach(id => {
        //SYNC PLAYER --------------------------
        //Disable position update for my player, updating myself, can cause lag in the controls...
        if (id !== this.socket.id) {
          //So, update position only for other players
          allPlayers[id].setPosition(players[id].x, players[id].y)
          allPlayers[id].flipX = players[id].flipped
          if (allPlayers[id].anims.getName() !== players[id].animation) {
            // Not repeat the same animation every time
            // Because this function of socket is listen in realtime
            allPlayers[id].anims.play(players[id].animation, true);
          }
        }
      });
    });

    //HANDLE PLAYER DIED

    this.socket.on('playerDied', (data: IWhoKilledWho) => {
      allPlayers[data.playerId].anims.play('death', true);
    });

    this.socket.on('removePlayer', (playerId: string) => {
      if (playerId in allPlayers) {
        allPlayers[playerId].destroy();
        delete allPlayers[playerId];
      }
    });
    
    //HANDLE BULLET
    
    this.myPlayerBulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 600 //total bullets in weapon
    });

    this.otherPlayerBulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
    });

    this.socket.on('receivedBulletInfo', (bulletInfo: any) => {
      if (bulletInfo.playerId !== this.socket.id) {
        spawnOtherPlayerBullet(this, bulletInfo, allPlayers, this.otherPlayerBulletGroup)
      }
    });
  }
 
  update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    const cursorPointer = this.input.activePointer;
    //wait load my player to get controlls
    
    if (this.socket.id in allPlayers) {

      if (playerHealth.heath > 0) {
        if (cursorKeys.up.isDown) {
          allPlayers[this.socket.id].setVelocityY(-playerVelocity);
        } else if (cursorKeys.down.isDown) {
          allPlayers[this.socket.id].setVelocityY(playerVelocity);
        } else {
          allPlayers[this.socket.id].setVelocityY(0);
        }
        
        if (cursorKeys.right.isDown) {
          allPlayers[this.socket.id].setVelocityX(playerVelocity);
          allPlayers[this.socket.id].anims.play('run', true);
          allPlayers[this.socket.id].flipX = false;
        } else if (cursorKeys.left.isDown) {
          allPlayers[this.socket.id].setVelocityX(-playerVelocity);
          allPlayers[this.socket.id].anims.play('run', true);
          allPlayers[this.socket.id].flipX = true;
        } else {
          allPlayers[this.socket.id].setVelocityX(0);
          allPlayers[this.socket.id].anims.play('idle', true);
        }

        if (cursorPointer.leftButtonDown() && this.time.now > referenceTime) {
          spawnMyPlayerBullet(
            this,
            this.socket,
            this.roomInfo.roomId,
            mouseInfo,
            allPlayers,
            allGuns,
            this.myPlayerBulletsGroup
          )
          referenceTime = this.time.now + bulletInterval;
        }
      }

      // My player information
      const playerInfo = {
        x: allPlayers[this.socket.id].x,
        y: allPlayers[this.socket.id].y,
        flipped: allPlayers[this.socket.id].flipX,
        animation: allPlayers[this.socket.id].anims.getName(),
        health: playerHealth.heath
      }

      //IF MY PLAYER DIE, HE CAN CONTINUE RECEIVING THE OTHER PLAYERS INFORMATIONS
      this.socket.emit('playerMovement', { roomId: this.roomInfo.roomId, playerInfo});
    }
  }
}