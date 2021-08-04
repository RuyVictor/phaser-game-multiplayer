// Interfaces
import { IPlayer } from '../../interfaces/interfaces'

// Objects
import Player from '../player'

export default function addPlayer(scene: Phaser.Scene, playerInfo: IPlayer) {

    const player = scene.physics.add.existing(new Player(scene, playerInfo));
    scene.cameras.main.startFollow(player, false, 0.2, 0.2);

    scene.anims.create({
      key: 'idle',
      frames: scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: -1 // -1 = infinte animation
    });

    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1 // -1 = infinte animation
    });

    scene.anims.create({
      key: 'death',
      frames: scene.anims.generateFrameNumbers('player_death', { start: 0, end: 7 }),
      frameRate: 10,
    });
    
    return player
}