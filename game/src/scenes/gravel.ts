import * as Phaser from 'phaser';
import { Socket } from "socket.io-client";

//Custom Interfaces
import { InitialPlayerInformations, Chat, RoomInfoGame, Player } from '../interfaces/interfaces'

//Components
import GlobalChatStyle from '../css/game_css/global_chat.styles';
import MessageChatStyle from '../css/game_css/message_chat.styles';
import PlayerChatStyle from '../css/game_css/player_chat.styles';
import TextfieldChatStyle from '../css/game_css/textfield_chat.styles';
import sendButtonStyle from '../css/game_css/send_button.styles';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Gravel',
};

let allPlayers: { [key: string]: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody } = {};

let playerHealth = 100;
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
  private myBulletsGroup!: Phaser.GameObjects.Group;
  private myBullet!: Phaser.GameObjects.Sprite | any;

  private otherPlayerBulletGroup!: Phaser.GameObjects.Group;
  private otherPlayerBullet!: Phaser.GameObjects.Sprite;

  //Plataforms
  private plataforms!: Phaser.GameObjects.Group;

  //Player Actions
  private gameChat!: Phaser.GameObjects.DOMElement;
  private myPlayerChat!: Phaser.GameObjects.DOMElement;
  private texfieldChat!: Phaser.GameObjects.DOMElement;
  private sendButton!: Phaser.GameObjects.DOMElement;

  init (roomInfo: RoomInfoGame) {
    this.roomInfo = roomInfo;
  }

  preload() {

    this.load.image('bullet', require('../assets/sprites/bullets/pistol_bullet.png').default);
    this.load.spritesheet('player_idle', require('../assets/sprites/player/idle.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_run', require('../assets/sprites/player/run.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_death', require('../assets/sprites/player/death.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.tilemapTiledJSON('map', require('../maps/gravel.json').default);
    this.load.image('grass-tiles', require('../assets/tilemaps/gravel_tilemap/grass.png').default);
  }

  onOtherPlayerHit(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {
    bullet.destroy()
  }

  //COLIDE FUNCTION CAN GET PARAMETERS FROM OVERLAP TEST CALLBACK
  //PASSING 2, WITH SECOND I CAN GET THE COLIDED OBJECT FROM THE BULLET GROUP TO MANIPULATE IT
  onMyPlayerHit(player: Phaser.GameObjects.GameObject, bullet: Phaser.GameObjects.GameObject) {

    bullet.destroy()
    if (playerHealth > 0) {
      //if (bulletType === 'pistol') {
        playerHealth -= 20;
      //}
    } else {
      //allPlayers[socket.id].disableBody(false, true);
      //Animation, show one time
      if (allPlayers[this.socket.id].anims.getName() !== 'death') {
        allPlayers[this.socket.id].anims.play('death', true);
        this.socket.emit('playerDeath', this.roomInfo.roomId)
      }
    }
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

      this.myBullet.setScale(6);
      this.myBullet.rotation = angle
      
      this.physics.moveTo(this.myBullet,crosshairX,crosshairY, bulletVelocity);

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
    }
  }

  addOtherPlayer(id: string, playerInfo: Player) {
    let otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_idle');
    otherPlayer.setScale(2.5);

    allPlayers[id] = otherPlayer; //store a player with key & value

    this.physics.add.overlap(otherPlayer, this.myBulletsGroup, this.onOtherPlayerHit, undefined, this);
    otherPlayer.body.setCollideWorldBounds(true);
  }

  addPlayer(id: string, playerInfo: Player) {
    let player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_idle');
    this.cameras.main.startFollow(player, false, 0.2, 0.2);
    player.setCollideWorldBounds(true);
    player.setScale(2.5);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: -1 // -1 = infinte animation
    });

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1 // -1 = infinte animation
    });

    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('player_death', { start: 0, end: 7 }),
      frameRate: 10,
    });

    this.physics.add.overlap(player, this.otherPlayerBulletGroup, this.onMyPlayerHit, undefined, this);
    allPlayers[id] = player;
  }
  
  loadChat (chat: Chat[]) {
    let textfieldChatHTML = `
      <input type="text"
      name="field_chat"
      placeholder="Message..."
      style="${TextfieldChatStyle}">
    `;

    this.texfieldChat = this.add.dom(21, 180).createFromHTML(textfieldChatHTML).setOrigin(0);

    this.sendButton = this.add.dom(272, 180, 'button', sendButtonStyle, 'Send').setOrigin(0);
    let inputText = this.texfieldChat.getChildByName('field_chat') as HTMLInputElement;

    const chatInfo = (message: string) => ({
      playerId: this.socket.id,
      playerName: this.socket.id,
      message: message
    })

    this.sendButton.addListener('click').on('click', () => {
      if (inputText.value !== '') {
        this.socket.emit("playerMessage", { roomId: this.roomInfo.roomId, chatInfo: chatInfo(inputText.value)})
        inputText.value = ''
      }
    })

    this.texfieldChat.addListener('keydown').on('keydown', (event: { code: string; }) => {
      if (event.code === 'Space') {
        inputText.value += " "
      } else if (event.code === 'Enter') {
        this.socket.emit("playerMessage", { roomId: this.roomInfo.roomId, chatInfo: chatInfo(inputText.value)})
        inputText.value = ""
      }
    })

    let gameChatHTML = `
      <div id="global_chat"
      style="${GlobalChatStyle}">
    `;

    this.gameChat = this.add.dom(20, 20).createFromHTML(gameChatHTML).setOrigin(0);
    let gameChatChild = this.gameChat.getChildByID('global_chat') as HTMLDivElement;

    const generateChatElement = (value: Chat) =>
    `
      <p style="${MessageChatStyle}">
        <b>${value.playerName}</b>: ${value.message}
      </p>
    `
    //Request all messages from player when enter in game
    chat.forEach((value: Chat) => {
      gameChatChild.innerHTML += generateChatElement(value)
    });
    gameChatChild.scrollTop = gameChatChild.scrollHeight;

    this.socket.on('receivedPlayerMessage', (value: Chat) => {
      gameChatChild.innerHTML += generateChatElement(value)
      gameChatChild.scrollTop = gameChatChild.scrollHeight;
    });

    //remove scroll movement from dom elements based in camera movement
    this.gameChat.setScrollFactor(0)
    this.texfieldChat.setScrollFactor(0)
    this.sendButton.setScrollFactor(0)
  }

  loadMap() {
    //let map = this.make.tilemap({ key: 'map' });
    //let tiles = map.addTilesetImage("wqe", 'grass-tiles', 512, 512);
    //let layer = map.createLayer(0, tiles, 0, 0)//.setScale(1.8);
    //.setCollisionByProperty({ collides: true })

    //this.physics.world.setBounds( 0, 0, map.widthInPixels, map.heightInPixels );
    //this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  create() {
    //When i enter in game, warn to all players to receive my information
    this.socket.emit("playerEntered", this.roomInfo.roomId)
    //Return of all informations of this current game
    this.socket.on('currentPlayers', ({players, chat}: InitialPlayerInformations) => {
      Object.keys(players).forEach(id => {
        if (id == this.socket.id && !(id in allPlayers)) {
          this.addPlayer(id, players[id]);
          this.loadChat(chat)
          this.loadMap()
        } else {
          if (!(id in allPlayers)) {
            this.addOtherPlayer(id, players[id]);
          }
        }
      });
    });

    this.socket.on('playerMoved', (players: { [key: string]: Player }) => {

      Object.keys(players).forEach(id => {
        //Disable position update for my player, updating myself, can cause lag in the controls...
        if (id !== this.socket.id) {
          //So, update position only for other players
          allPlayers[id].setPosition(players[id].x, players[id].y)
          allPlayers[id].flipX = players[id].flipped
          if (allPlayers[id].anims.getName() !== players[id].animation) {
            // Not repeate same animation
            // Because this function of socket is listen in realtime
            allPlayers[id].anims.play(players[id].animation, true);
          }
        }
      });
    });

    //HANDLE PLAYER DIED

    this.socket.on('playerDied', (playerId: string) => {
      allPlayers[playerId].anims.play('death', true);
      console.log('DIEDD')
    });

    this.socket.on('removePlayer', (playerId: string) => {
      allPlayers[playerId].destroy();
      delete allPlayers[this.socket.id];
    });
    
    //HANDLE BULLET

    this.socket.on('receivedBulletInfo', (bulletInfo: any) => {
      if (bulletInfo.playerId !== this.socket.id) {
        this.spawnOtherPlayerBullet(bulletInfo)
      }
    });

    this.myBulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 600, //total bullets in weapon
    });

    this.otherPlayerBulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
    });

    //HANDLE PLATAFORMS

    let handleMousemove = (event: any) => {
      mouseX = event.x
      mouseY = event.y
    };
    
    document.addEventListener('mousemove', handleMousemove);

    this.plataforms = this.physics.add.staticGroup();

    //this.myPlayerChat = this.add.dom(0, 0, 'div', PlayerChatStyle, 'button');
  }
 
  update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    const cursorPointer = this.input.activePointer;
    //wait load my player to get controlls
    if (this.socket.id in allPlayers) {

      //Load player chat baloon
      //this.myPlayerChat.x = allPlayers[socket.id].x
      //this.myPlayerChat.y = allPlayers[socket.id].y - 100

      if (playerHealth > 0) {
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
        animation: allPlayers[this.socket.id].anims.getName()
      }

      //IF MY PLAYER DIE, HE CAN CONTINUE RECEIVING THE OTHER PLAYERS INFORMATIONS
      this.socket.emit('playerMovement', { roomId: this.roomInfo.roomId, playerInfo});
    }
  }
}