import * as Phaser from 'phaser';

import { io } from "socket.io-client";
const socket = io("http://localhost:8050")

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let allPlayers: { [key: string]: any } = {};

export class GameScene extends Phaser.Scene {
  private bulletsGroup!: Phaser.GameObjects.Group;
  private otherPlayerBulletGroup!: Phaser.GameObjects.Group;
  private otherPlayerBullet!: Phaser.GameObjects.Sprite;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('bullet', "./assets/sprites/bullet.png");

  }

  shoot() {

    let bullet = this.bulletsGroup.get(allPlayers[socket.id].x, allPlayers[socket.id].y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      let angle = Phaser.Math.Angle.Between(allPlayers[socket.id].x, allPlayers[socket.id].y, this.input.activePointer.x, this.input.activePointer.y);
      bullet.rotation = angle

      let angleVelocityX = 200 * Math.cos(angle)
      let angleVelocityY = 200 * Math.sin(angle)
      bullet.body.velocity.x = angleVelocityX;
      bullet.body.velocity.y = angleVelocityY;

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
      this.otherPlayerBullet.setActive(true);
      this.otherPlayerBullet.setVisible(true);
      this.otherPlayerBullet.rotation = bulletInfo.rotation;

      //PHASER BUG, CANT HANDLE SPRITE MOVEMENT
      this.otherPlayerBullet.body.velocity.x = bulletInfo.velocityX;
      this.otherPlayerBullet.body.velocity.y = bulletInfo.velocityY;
    }
  }

  addOtherPlayer(playerInfo: any) {
    let otherPlayer = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0x0000ff) as any;
    this.physics.add.existing(otherPlayer);
    allPlayers[playerInfo.playerId] = otherPlayer; //store a player with key & value
  }

  //Same function, but change color for my actual player.
  addPlayer(playerInfo: any) {
    let player = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0xFFFFFF) as any;
    this.physics.add.existing(player);
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
        }
      });
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

    this.bulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10
    });

    this.otherPlayerBulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
    });

    this.input.on('pointerdown', this.shoot, this);
  }
 
  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    
    //wait load player
    if (socket.id in allPlayers) {
      if (cursorKeys.up.isDown) {
        allPlayers[socket.id].body.setVelocityY(-500);
      } else if (cursorKeys.down.isDown) {
        allPlayers[socket.id].body.setVelocityY(500);
      } else {
        allPlayers[socket.id].body.setVelocityY(0);
      }
      
      if (cursorKeys.right.isDown) {
        allPlayers[socket.id].body.setVelocityX(500);
      } else if (cursorKeys.left.isDown) {
        allPlayers[socket.id].body.setVelocityX(-500);
      } else {
        allPlayers[socket.id].body.setVelocityX(0);
      }

      let playerX = allPlayers[socket.id].x;
      let playery = allPlayers[socket.id].y;
      socket.emit('playerMovement', { x: playerX, y: playery});
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
      debug: true,
    },
  },
 
  parent: 'game',
  backgroundColor: '#5c5c5c',
};
 
export const game = new Phaser.Game(gameConfig);