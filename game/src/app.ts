import * as Phaser from 'phaser';

import { io } from "socket.io-client";
const socket = io("http://localhost:8050")

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let allPlayers: { [key: string]: any } = {};

let allBullets: { [key: string]: any } = {};

var bullet: any;

export class GameScene extends Phaser.Scene {
  private bulletsGroup!: Phaser.GameObjects.Group;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('bullet', 'assets/sprites/bullet.png');

  }

  shoot() {

    bullet = this.bulletsGroup.get(allPlayers[socket.id].x, allPlayers[socket.id].y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      let angle = Phaser.Math.Angle.Between(allPlayers[socket.id].x, allPlayers[socket.id].y, this.input.activePointer.x, this.input.activePointer.y);
      bullet.rotation = angle

      let angleVelocityX = 200 * Math.cos(angle)
      let angleVelocityY = 200 * Math.sin(angle)
      bullet.body.velocity.x = angleVelocityX;
      bullet.body.velocity.y = angleVelocityY;
                              //spawn bullet position
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
      console.log('Received players!')
      console.log(allPlayers)
      Object.keys(players).forEach( (id) => {
        if (players[id].playerId === socket.id) {
          this.addPlayer(players[id]);
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
    });
    
    //HANDLE BULLET
    socket.on('playerShoted', (bullets: any) => {

      Object.keys(bullets).forEach( (id) => {
        //Disable update my bullet position
        if (bullets[id].playerId !== socket.id) {
          //updating myself, can cause lag in the controls
          //So, update only other players
          allBullets[bullets[id].playerId].setPosition(bullets[id].x, bullets[id].y)
        }
      });
    });

    this.bulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 10,
      setRotation: { value: 0, step: 0.06 }
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

      //HANDLE BULLET
      if (bullet) {
        let bulletX = allBullets[socket.id].body.position.x;
        let bulletY = allBullets[socket.id].body.position.y;

        socket.emit("playerShot", {x: bulletX, y: bulletY})
      }
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