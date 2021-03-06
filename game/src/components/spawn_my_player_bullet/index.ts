import { Socket } from 'socket.io-client';

//Effects
import SparkEffect from '../../effects/spark.effect'

export default function spawnMyPlayerBullet(
  scene: Phaser.Scene,
  socket: Socket,
  roomId: string,
  mouseInfo: {x: number, y: number},
  allPlayers: { [playerId: string]: Phaser.Physics.Arcade.Sprite },
  allGuns: { [playerId: string]: Phaser.Physics.Arcade.Sprite },
  myPlayerBulletsGroup: Phaser.Physics.Arcade.Group
  ) {
  
  const bulletVelocity = 1000;
  const bulletSpawnX = allGuns[socket.id].x
  const bulletSpawnY = allGuns[socket.id].y

  const myBullet: Phaser.Physics.Arcade.Sprite =
  myPlayerBulletsGroup.get(bulletSpawnX, bulletSpawnY);

  if (myBullet) {
    myBullet.setScale(0.4);
    myBullet.setOrigin(-0.4, 0.7); //spawn position in weapon
    scene.cameras.main.shake(100, 0.004);

    let crosshairX = mouseInfo.x + scene.cameras.main.worldView.x
    let crosshairY = mouseInfo.y + scene.cameras.main.worldView.y

    let angle = Phaser.Math.Angle.Between(myBullet.x, myBullet.y, crosshairX, crosshairY);
    let angleVelocityX = bulletVelocity * Math.cos(angle)
    let angleVelocityY = bulletVelocity * Math.sin(angle)
    myBullet.setRotation(angle)

    scene.physics.moveTo(myBullet, crosshairX, crosshairY, bulletVelocity);
    
    const currentBullet = myBullet // create reference for a single bullet

    // handle on collide in world bounds
    scene.events.on('update', () => {
      if(!scene.physics.world.bounds.contains(currentBullet.x, currentBullet.y)) {
        if (scene.children.exists(currentBullet)) {
          scene.add.existing(new SparkEffect(scene, currentBullet, 3));//effect on collide bounds
        }
        currentBullet.destroy()
      }
    })

    // handle on collide in any object in game except the players
    // in any object the bullet is destroyed and emit a effect of spark
    currentBullet.body.onOverlap = true
    currentBullet.body.world.on('overlap', (object: any) => {
      const foundObject = Object.entries(allPlayers)
      .find(([key, val]) => val === object )

      // filter the players, because they have a existing collider
      if (!foundObject) {
        scene.add.existing(new SparkEffect(scene, currentBullet, 3));
        currentBullet.destroy()
      }
    })

    let bulletInfo = {
      playerId: socket.id,
      initalPositionX: allGuns[socket.id].x,
      initalPositionY: allGuns[socket.id].y,
      velocityX: angleVelocityX,
      velocityY: angleVelocityY,
      angle: angle
    }

    socket.emit('playerShot', {roomId: roomId, bulletInfo})
  }
}