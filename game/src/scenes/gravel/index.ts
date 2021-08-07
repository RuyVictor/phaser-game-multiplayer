import * as Phaser from 'phaser'
import { Socket } from "socket.io-client"

// Components
import addPlayer from '../../components/add_player'
import addOtherPlayer from '../../components/add_other_player'
import roomChat from '../../components/room_chat'
import playerBalloonChat from '../../components/player_balloon_chat'
import healthBar from '../../components/health_bar'
import roomActionsLog from '../../components/room_actions_log'

//Triggers
import onMyPlayerHit from '../../triggers/onMyPlayerHit'
import onOtherPlayerHit from '../../triggers/onOtherPlayerHit'

//Custom Interfaces
import { InitialPlayerInformations, RoomInfoGame, IPlayer, IWhoKilledWho } from '../../interfaces/interfaces'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: true,
  visible: true,
  key: 'Gravel',
};

let allPlayers: { 
  [playerId: string]: Phaser.Physics.Arcade.Sprite
} = {};

export let playerHealth = { heath: 100 }
let bulletInterval = 0;
let bulletVelocity = 1000;
let mouseX = 0;
let mouseY = 0;

export default class Gravel extends Phaser.Scene {
  constructor(private socket: Socket) {
    super(sceneConfig);
  }

  private roomInfo!: RoomInfoGame;

  //Bullets
  private myBulletsGroup!: Phaser.Physics.Arcade.Group;
  private myBullet!: Phaser.Physics.Arcade.Sprite;

  private otherPlayerBulletGroup!: Phaser.Physics.Arcade.Group;
  private otherPlayerBullet!: Phaser.Physics.Arcade.Sprite;
  
  init (roomInfo: RoomInfoGame) {
    this.roomInfo = roomInfo;
  }

  preload() {
    this.load.image('bullet', require('../../assets/sprites/bullets/pistol_bullet.png').default);
    this.load.spritesheet('player_idle', require('../../assets/sprites/player/idle.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_run', require('../../assets/sprites/player/run.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_death', require('../../assets/sprites/player/death.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.image('grass-tiles', require('../../assets/tilemaps/gravel_tilemap/grass.png').default);
  }

  spawnPlayerBullet() {
    this.myBullet = this.myBulletsGroup.get(allPlayers[this.socket.id].x, allPlayers[this.socket.id].y);

    if (this.myBullet) {
      this.cameras.main.shake(100, 0.004);

      let crosshairX = mouseX + this.cameras.main.worldView.x
      let crosshairY = mouseY + this.cameras.main.worldView.y

      let angle = Phaser.Math.Angle.Between(this.myBullet.x, this.myBullet.y, crosshairX, crosshairY);
      let angleVelocityX = bulletVelocity * Math.cos(angle)
      let angleVelocityY = bulletVelocity * Math.sin(angle)
      this.myBullet.rotation = angle
      this.myBullet.setScale(6);
      this.physics.moveTo(this.myBullet,crosshairX,crosshairY, bulletVelocity);

      setInterval((bullet: Phaser.Physics.Arcade.Sprite) => {
        if(!this.physics.world.bounds.contains(bullet.x, bullet.y)) {
          bullet.destroy()
        }
      }, 0, this.myBullet)

      let bulletInfo = {
        playerId: this.socket.id,
        initalPositionX: allPlayers[this.socket.id].x,
        initalPositionY: allPlayers[this.socket.id].y,
        velocityX: angleVelocityX,
        velocityY: angleVelocityY,
        angle: angle
      }

      this.socket.emit('playerShot', {roomId: this.roomInfo.roomId, bulletInfo})
    }
  }

  spawnOtherPlayerBullet(bulletInfo: any) {
    this.otherPlayerBullet = this.otherPlayerBulletGroup.get(bulletInfo.initalPositionX, bulletInfo.initalPositionY, 'bullet');

    if (this.otherPlayerBullet) {
      this.otherPlayerBullet.setScale(6);
      this.otherPlayerBullet.rotation = bulletInfo.angle;
      this.otherPlayerBullet.body.velocity.x = bulletInfo.velocityX;
      this.otherPlayerBullet.body.velocity.y = bulletInfo.velocityY;

      setInterval((bullet: Phaser.Physics.Arcade.Sprite) => {
        if(!this.physics.world.bounds.contains(bullet.x, bullet.y)) {
          bullet.destroy()
        }
      }, 0, this.otherPlayerBullet)

      this.otherPlayerBullet.setData({playerId: bulletInfo.playerId})
    }
  }

  create() {
    this.socket.emit("playerEntered", this.roomInfo.roomId)
    //Return of all informations of this current game
    this.socket.on('currentPlayers', ({players, chat}: InitialPlayerInformations) => {
      Object.keys(players).forEach(id => {
        if (id == this.socket.id && !(id in allPlayers)) {
          allPlayers[id] = addPlayer(this, players[id]);

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
          roomActionsLog(this, allPlayers,this.socket)
        } else {
          if (!(id in allPlayers)) {
            allPlayers[id] = addOtherPlayer(this, players[id]);
            this.physics.add.overlap(allPlayers[id], this.myBulletsGroup,
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

    this.socket.on('receivedBulletInfo', (bulletInfo: any) => {
      if (bulletInfo.playerId !== this.socket.id) {
        this.spawnOtherPlayerBullet(bulletInfo)
      }
    });

    this.myBulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 600 //total bullets in weapon
    });

    this.otherPlayerBulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
    });

    let handleMousemove = (event: any) => {
      mouseX = event.x
      mouseY = event.y
    };
    document.addEventListener('mousemove', handleMousemove);
  }
 
  update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    const cursorPointer = this.input.activePointer;
    //wait load my player to get controlls
    
    if (this.socket.id in allPlayers) {

      if (playerHealth.heath > 0) {
        if (cursorKeys.up.isDown) {
          allPlayers[this.socket.id].setVelocityY(-500);
        } else if (cursorKeys.down.isDown) {
          allPlayers[this.socket.id].setVelocityY(500);
        } else {
          allPlayers[this.socket.id].setVelocityY(0);
        }
        
        if (cursorKeys.right.isDown) {
          allPlayers[this.socket.id].setVelocityX(500);
          allPlayers[this.socket.id].anims.play('run', true);
          allPlayers[this.socket.id].flipX = false;
        } else if (cursorKeys.left.isDown) {
          allPlayers[this.socket.id].setVelocityX(-500);
          allPlayers[this.socket.id].anims.play('run', true);
          allPlayers[this.socket.id].flipX = true;
        } else {
          allPlayers[this.socket.id].setVelocityX(0);
          allPlayers[this.socket.id].anims.play('idle', true);
        }

        if (cursorPointer.leftButtonDown() && this.time.now > bulletInterval) {
          this.spawnPlayerBullet()
          bulletInterval = this.time.now + 130;
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