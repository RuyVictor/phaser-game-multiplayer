import * as Phaser from 'phaser';

//Components
import GlobalChatStyle from '../css/game_css/global_chat.styles';
import MessageChatStyle from '../css/game_css/message_chat.styles';
import PlayerChatStyle from '../css/game_css/player_chat.styles';
import TextfieldChatStyle from '../css/game_css/textfield_chat.styles';
import sendButtonStyle from '../css/game_css/send_button.styles';


import { io } from "socket.io-client";
const socket = io("http://localhost:8050")

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};


let allPlayers: { [key: string]: any } = {};

let allChat: {playerId: string, playerName: string, message: string}[] = [];

let playerHealth = 100;

export default class Gravel extends Phaser.Scene {
  //Bullets
  private myBulletsGroup!: Phaser.GameObjects.Group;
  private myBullet!: Phaser.GameObjects.Sprite | any;

  private otherPlayerBulletGroup!: Phaser.GameObjects.Group;
  private otherPlayerBullet!: Phaser.GameObjects.Sprite;

  //Plataforms
  private plataforms!: Phaser.GameObjects.Group;


  //Player Actions
  private globalChat!: Phaser.GameObjects.DOMElement;
  private myPlayerChat!: Phaser.GameObjects.DOMElement;
  private texfieldChat!: Phaser.GameObjects.DOMElement;
  private sendButton!: Phaser.GameObjects.DOMElement;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('bullet', require('../assets/sprites/bullets/pistol_bullet.png').default);
    this.load.spritesheet('player_idle', require('../assets/sprites/player/idle.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_run', require('../assets/sprites/player/run.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_death', require('../assets/sprites/player/death.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.tilemapTiledJSON('map', require('../maps/gravel.json').default);
    this.load.image('grass-tiles', require('../assets/tilemaps/gravel_tilemap/grass.png').default);
  }

  onOtherPlayerHit(player: any, bullet: any) {
    bullet.destroy()
  }

  //COLIDE FUNCTION CAN GET PARAMETERS FROM OVERLAP TEST CALLBACK
  //PASSING 2, WITH SECOND I CAN GET THE COLIDED OBJECT FROM THE BULLET GROUP TO MANIPULATE IT
  onMyPlayerHit(player: any, bullet: any) {

    bullet.destroy()
    if (playerHealth > 0) {
      //if (bulletType === 'pistol') {
        playerHealth -= 50;
      //}
    } else {
      allPlayers[socket.id].anims.play('death', true);
      //allPlayers[socket.id].disableBody(false, true);
      socket.emit('playerDeath')
    }
  }

  spawnPlayerBullet() {
    this.myBullet = this.myBulletsGroup.get(allPlayers[socket.id].x, allPlayers[socket.id].y);

    if (this.myBullet) {

      this.cameras.main.shake(100, 0.007);

      let bulletVelocity = 1000;

      let angle = Phaser.Math.Angle.Between(this.myBullet.x, this.myBullet.y, this.input.x, this.input.y);
      let angleVelocityX = bulletVelocity * Math.cos(angle)
      let angleVelocityY = bulletVelocity * Math.sin(angle)

      this.myBullet.setScale(8);
      this.myBullet.rotation = angle

      this.myBullet.body.velocity.x = angleVelocityX;
      this.myBullet.body.velocity.y = angleVelocityY;

      let bulletInfo = {
        playerId: socket.id,
        initalPositionX: allPlayers[socket.id].x,
        initalPositionY: allPlayers[socket.id].y,
        velocityX: angleVelocityX,
        velocityY: angleVelocityY,
        rotation: angle
      }

      socket.emit('playerShot', bulletInfo)
    }
  }

  spawnOtherPlayerBullet(bulletInfo: any) {

    this.otherPlayerBullet = this.otherPlayerBulletGroup.get(bulletInfo.initalPositionX, bulletInfo.initalPositionY, 'bullet');

    if (this.otherPlayerBullet) {
      this.otherPlayerBullet.rotation = bulletInfo.rotation;
      this.otherPlayerBullet.body.velocity.x = bulletInfo.velocityX;
      this.otherPlayerBullet.body.velocity.y = bulletInfo.velocityY;
    }
  }

  addOtherPlayer(playerInfo: any) {
    let otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_idle');
    otherPlayer.setScale(2.5);

    allPlayers[playerInfo.playerId] = otherPlayer; //store a player with key & value

    this.physics.add.overlap(otherPlayer, this.myBulletsGroup, this.onOtherPlayerHit, undefined, this);
    otherPlayer.body.setCollideWorldBounds(true);
  }

  addPlayer(playerInfo: any) {
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
    allPlayers[playerInfo.playerId] = player;
  }

  public create() {
    //WORLDMAP

    let map = this.make.tilemap({ key: 'map' });
    let tiles = map.addTilesetImage(0, 'grass-tiles');
    let layer = map.createLayer(0, tiles, 0, 0)//.setScale(1.8);
    //.setCollisionByProperty({ collides: true })

    //this.physics.world.setBounds( 0, 0, map.widthInPixels, map.heightInPixels );
    //this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //HANDLE PLAYERS
    socket.emit("create", 'player created!')

    socket.on('currentPlayers', (players: any) => {

      Object.keys(players).forEach( (id) => {
        if (players[id].playerId === socket.id) {
          if (!(socket.id in allPlayers)) {
            this.addPlayer(players[id]);
          }
        } else {
          this.addOtherPlayer(players[id]);
        }
      });
    });

    socket.on('playerMoved', (players: any) => {

      Object.keys(players).forEach( (id) => {
        //Disable update my player position
        if (players[id].playerId !== socket.id) {
          //updating myself, can cause lag in the controls
          //So, update only other players
          allPlayers[players[id].playerId].setPosition(players[id].x, players[id].y)
          allPlayers[players[id].playerId].flipX = players[id].flipped
          allPlayers[players[id].playerId].anims.play(players[id].animation, true);
        }
      });
    });

    //HANDLE PLAYER DIED

    socket.on('playerDied', (player_id: string) => {
      allPlayers[player_id].anims.play('death');
    });

    socket.on('removePlayer', (player_id: any) => {
      allPlayers[player_id].destroy();
      delete allPlayers[socket.id];
    });
    
    //HANDLE BULLET

    socket.on('receivedBulletInfo', (bulletInfo: any) => {
      if (bulletInfo.playerId !== socket.id) {
        this.spawnOtherPlayerBullet(bulletInfo)
      }
    });

    this.myBulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30 //total bullets in weapon
    });

    this.otherPlayerBulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
    });

    this.input.on('pointerdown', this.spawnPlayerBullet, this);

    //HANDLE PLATAFORMS

    this.plataforms = this.physics.add.staticGroup();


    //HANDLE CHAT ELEMENTS

    let textfieldChatForm = `
      <input type="text"
      name="field_chat"
      placeholder="Message..."
      style="${TextfieldChatStyle}">
    `;

    this.texfieldChat = this.add.dom(21, 180).createFromHTML(textfieldChatForm).setOrigin(0);

    this.sendButton = this.add.dom(272, 180, 'button', sendButtonStyle, 'Send').setOrigin(0);
    this.sendButton.addListener('click').on('click', () => {
      let inputText = this.texfieldChat.getChildByName('field_chat') as any;
      if (inputText.value !== '') {

        let messageInfo = {
          playerName: socket.id,
          message: inputText.value
        }

        inputText.value = ''
        socket.emit("playerMessage", messageInfo)
      }
    })

    let globalChatForm = `
      <div id="global_chat"
      style="${GlobalChatStyle}">
    `;

    this.globalChat = this.add.dom(20, 20).createFromHTML(globalChatForm).setOrigin(0);

    let globalChatChild = this.globalChat.getChildByID('global_chat') as any;

    socket.on('receivedPlayerMessage', (chat: any) => {
      //NEW PLAYERS CAN READ THE LAST MENSAGES

      let singleChatElements = '';

      chat.forEach((value: any) => {
        singleChatElements += `
          <p style="${MessageChatStyle}">
            <b>${value.playerName}</b>: ${value.message}
          </p>
        `
      });

      globalChatChild.innerHTML = singleChatElements

      globalChatChild.scrollTop = globalChatChild.scrollHeight;
    });

    //remove movement from dom elements based in camera movement
    this.globalChat.scrollFactorX = 0
    this.globalChat.scrollFactorY = 0
    this.texfieldChat.scrollFactorX = 0
    this.texfieldChat.scrollFactorY = 0
    this.sendButton.scrollFactorX = 0
    this.sendButton.scrollFactorY = 0
    //this.myPlayerChat = this.add.dom(0, 0, 'div', PlayerChatStyle, 'button');
  }
 
  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    //wait load player

    if (socket.id in allPlayers) {

      //this.myPlayerChat.x = allPlayers[socket.id].x
      //this.myPlayerChat.y = allPlayers[socket.id].y - 100

      if (playerHealth > 0) {
        if (cursorKeys.up.isDown) {
          allPlayers[socket.id].setVelocityY(-500);
        } else if (cursorKeys.down.isDown) {
          allPlayers[socket.id].setVelocityY(500);
        } else {
          allPlayers[socket.id].setVelocityY(0);
        }
        
        if (cursorKeys.right.isDown) {
          allPlayers[socket.id].setVelocityX(500);
          allPlayers[socket.id].anims.play('run', true);
          allPlayers[socket.id].flipX = false;
        } else if (cursorKeys.left.isDown) {
          allPlayers[socket.id].setVelocityX(-500);
          allPlayers[socket.id].anims.play('run', true);
          allPlayers[socket.id].flipX = true;
        } else {
          allPlayers[socket.id].setVelocityX(0);
          allPlayers[socket.id].anims.play('idle', true);
        }
      }

      let playerX = allPlayers[socket.id].x;
      let playerY = allPlayers[socket.id].y;
      let playerFlipped = allPlayers[socket.id].flipX;
      let playerAnimation = allPlayers[socket.id].anims.getName()

      //IF MY PLAYER DIED, HE CAN RECEIVE OTHER PLAYERS POSITION
      socket.emit('playerMovement', {
        x: playerX, y: playerY, flipped: playerFlipped, animation: playerAnimation
      });
    }
  }
}