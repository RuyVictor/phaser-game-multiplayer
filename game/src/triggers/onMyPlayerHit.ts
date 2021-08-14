import { Socket } from 'socket.io-client'

// Effects
import BloodEffect from '../effects/blood.effect';

//Props
import { playerHealth } from '../scenes/game';
import { allHealthBar } from '../components/health_bar';

//Helpers
import getRandomDamage from '../helpers/getRandomDamage'

export default function onMyPlayerHit(
    //from callback
    player: any, //my player
    bullet: Phaser.GameObjects.GameObject, // colided object in my player

    //---
    scene: Phaser.Scene,
    socket: Socket,
    roomId: string) {

    //effects
    scene.add.existing(new BloodEffect(scene, 4, bullet));
    allHealthBar[socket.id].tween.restart() // change my healthBar opacity on hit
    
    const killerId = bullet.getData('playerId')
    bullet.destroy()
    
    if (playerHealth.heath > 0) {
      //if (bulletType === 'pistol') {
        const damage = getRandomDamage(3, 7)
        playerHealth.heath -= damage;
        const damageInfo = {
          damage: damage,
          roomId: roomId,
          playerId: socket.id
        }
        socket.emit('playerDamage', damageInfo)
      //}
    } else {
        //Animation, show one time
        if (player.anims.getName() !== 'death') {
          player.anims.play('death', true);
          player.setImmovable(true)
          const whoKilledWhoInfo = {
            roomId: roomId,
            killerId: killerId,
            playerId: socket.id
          }
          socket.emit('playerDeath', whoKilledWhoInfo)
        }
    }
}