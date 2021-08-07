// Effects
import SparkEffect from '../effects/spark.effect';

import { Socket } from 'socket.io-client'

//Props
import { playerHealth } from '../scenes/gravel';

export default function onMyPlayerHit(
    //from callback
    player: any, //my player
    bullet: Phaser.GameObjects.GameObject, // colided object in my player

    //---
    scene: Phaser.Scene,
    socket: Socket,
    roomId: string) {

    scene.add.existing(new SparkEffect(scene, 10, bullet.body.position.x, bullet.body.position.y));
    const killerId = bullet.getData('playerId')
    bullet.destroy()

    if (playerHealth.heath > 0) {
      //if (bulletType === 'pistol') {
        playerHealth.heath -= 10;
      //}
    } else {
        //Animation, show one time
        if (player.anims.getName() !== 'death') {
            player.anims.play('death', true);
            const deathInfo = {
              roomId: roomId,
              killerId: killerId,
              playerId: socket.id
            }
            socket.emit('playerDeath', deathInfo)
        }
    }
}