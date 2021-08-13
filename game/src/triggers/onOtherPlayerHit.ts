// Effects
import BloodEffect from '../effects/blood.effect';

export default function onOtherPlayerHit(
  player: any, // is my player
  bullet: Phaser.GameObjects.GameObject, // colided object in my player

  scene: Phaser.Scene
  ) {

  scene.add.existing(new BloodEffect(scene, 4, bullet.body.position.x, bullet.body.position.y));
  bullet.destroy()
}