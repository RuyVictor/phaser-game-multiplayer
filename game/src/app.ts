import * as Phaser from 'phaser';

import { io } from "socket.io-client";
const socket = io("http://localhost:8050")

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let allPlayers: { [key: string]: any } = {};

let playerHealth = 100;

export class GameScene extends Phaser.Scene {
  private myBulletsGroup!: Phaser.GameObjects.Group;
  private myBullet!: Phaser.GameObjects.Sprite;

  private otherPlayerBulletGroup!: Phaser.GameObjects.Group;
  private otherPlayerBullet!: Phaser.GameObjects.Sprite;

  private plataforms!: Phaser.GameObjects.Group;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('bullet', require('./assets/sprites/bullets/pistol_bullet.png').default);
    this.load.spritesheet('player_idle', require('./assets/sprites/player/idle.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_run', require('./assets/sprites/player/run.png').default, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('player_death', require('./assets/sprites/player/death.png').default, { frameWidth: 48, frameHeight: 48 });
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

      let bulletVelocity = 1000;

      let angle = Phaser.Math.Angle.Between(allPlayers[socket.id].x, allPlayers[socket.id].y, this.input.activePointer.x, this.input.activePointer.y);
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

  //Same function, but change color for my actual player.
  addPlayer(playerInfo: any) {
    let player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_idle');
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
  }
 
  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    //wait load player

    if (socket.id in allPlayers) {

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

      socket.emit('playerMovement', {
        x: playerX, y: playerY, flipped: playerFlipped, animation: playerAnimation
      });
    }
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
  
  scene:  GameScene,
  
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
 
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    },
  },
 
  parent: 'game',
  backgroundColor: '#5c5c5c',
};
 
export const game = new Phaser.Game(gameConfig);