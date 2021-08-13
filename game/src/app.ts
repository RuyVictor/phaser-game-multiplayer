import socket from './services/socket'

import Menu from "./scenes/menu";
import ListRooms from "./scenes/list_rooms";
import CreateRoom from "./scenes/create_room";
import Gravel from "./scenes/gravel";

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
  
  scene: [
    new Menu(socket),
    new ListRooms(socket),
    new CreateRoom(socket),
    new Gravel(socket),
  ],
  
  scale: {
    width: 1280,
    height: 720,
  },
  
  pixelArt: true,

  dom: {
    createContainer: true
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    },
  },
 
  parent: 'game',
  backgroundColor: '#5c5c5c',
};
 
export const game = new Phaser.Game(gameConfig);