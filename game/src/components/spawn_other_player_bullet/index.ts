//Effects
import SparkEffect from '../../effects/spark.effect'

export default function spawnOtherPlayerBullet(
  scene: Phaser.Scene,
  bulletInfo: any,
  allPlayers: { [playerId: string]: Phaser.Physics.Arcade.Sprite },
  otherPlayerBulletsGroup: Phaser.Physics.Arcade.Group
  ) {

  const otherPlayerBullet: Phaser.Physics.Arcade.Sprite =
  otherPlayerBulletsGroup.get(bulletInfo.initalPositionX, bulletInfo.initalPositionY, 'bullet');

  if (otherPlayerBullet) {
    otherPlayerBullet.setScale(6);
    otherPlayerBullet.rotation = bulletInfo.angle;
    otherPlayerBullet.body.velocity.x = bulletInfo.velocityX;
    otherPlayerBullet.body.velocity.y = bulletInfo.velocityY;
    otherPlayerBullet.setData({playerId: bulletInfo.playerId}) // save the owner of bullet

    const currentBullet = otherPlayerBullet // create reference for a single bullet

    // handle on collide in world bounds
    scene.events.on('update', () => {
      if(!scene.physics.world.bounds.contains(currentBullet.x, currentBullet.y)) {
        if (scene.children.exists(currentBullet)) {
          scene.add.existing(new SparkEffect(scene, currentBullet, 3));
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
  }
}