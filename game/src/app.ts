import * as Phaser from 'phaser';

import { io } from "socket.io-client";
const socket = io("http://localhost:8050")

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

let client_players:
{
  playerId: string,
  rotation: number,
  x: number,
  y: number,
}[] = [];

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
 
  constructor() {
    super(sceneConfig);
  }

  addOtherPlayer(playerInfo: any) {
    this.player = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0xFFFFFF) as any;
    this.player.name = playerInfo.playerId
    this.physics.add.existing(this.player);
  }

  addPlayer(playerInfo: any) {
    this.player = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0x0000ff) as any;
    this.physics.add.existing(this.player);
  }

  public create() {

    socket.emit("create", 'player created!')

    socket.on('currentPlayers', (players: any) => {
      console.log('Received players!')
      Object.keys(players).forEach( (id) => {
        if (players[id].playerId === socket.id) {
          this.addPlayer(players[id]);
        } else {
          this.addOtherPlayer(players[id]);
        }
      });
    });

    socket.on('playerMoved', (server_players: any) => {
      //update all players
      Object.keys(server_players).forEach( (id) => {
          this.player.setPosition(server_players[id].x, server_players[id].y);
      });
    });
  }
 
  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
    
    //wait load sprite
    if (this.player) {
      if (cursorKeys.up.isDown) {
        this.player.body.setVelocityY(-500);
      } else if (cursorKeys.down.isDown) {
        this.player.body.setVelocityY(500);
      } else {
        this.player.body.setVelocityY(0);
      }
      
      if (cursorKeys.right.isDown) {
        this.player.body.setVelocityX(500);
      } else if (cursorKeys.left.isDown) {
        this.player.body.setVelocityX(-500);
      } else {
        this.player.body.setVelocityX(0);
      }

      let x = this.player.x;
      let y = this.player.y;
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