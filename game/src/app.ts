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
  private square!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
 
  constructor() {
    super(sceneConfig);
  }

  addPlayer(playerInfo: any) {
    this.square = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0xFFFFFF) as any;
    this.physics.add.existing(this.square);
  }

  addOtherPlayer(playerInfo: any) {
    this.square = this.add.rectangle(playerInfo.x, playerInfo.y, 100, 100, 0x0000ff) as any;
    this.physics.add.existing(this.square);
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
      client_players = server_players
    });
  }
 
  public update() {
    const cursorKeys = this.input.keyboard.createCursorKeys();
 
    if (cursorKeys.up.isDown) {
      this.square.body.setVelocityY(-500);
    } else if (cursorKeys.down.isDown) {
      this.square.body.setVelocityY(500);
    } else {
      this.square.body.setVelocityY(0);
    }
    
    if (cursorKeys.right.isDown) {
      this.square.body.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      this.square.body.setVelocityX(-500);
    } else {
      this.square.body.setVelocityX(0);
    }

    var x = this.square.x;
    var y = this.square.y;
    var r = this.square.rotation;
    socket.emit('playerMovement', { x: x, y: y, rotation: r });
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