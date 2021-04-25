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
  //private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

  constructor() {
    super(sceneConfig);
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

      let x = allPlayers[socket.id].x;
      let y = allPlayers[socket.id].y;
      socket.emit('playerMovement', { x: x, y: y});
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
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);