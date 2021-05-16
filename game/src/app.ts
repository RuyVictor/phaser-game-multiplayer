import Gravel from "./scenes/gravel";

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
  
  scene:  [Gravel],
  
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  
  pixelArt: true,
  dom: {
    createContainer: true
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