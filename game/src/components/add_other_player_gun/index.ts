import Phaser from 'phaser'

export default function addOtherPlayerGun(
  scene: Phaser.Scene,
  playerId: string,
  allPlayers: { [playerId: string]: Phaser.Physics.Arcade.Sprite },
  allGuns: { [playerId: string]: Phaser.Physics.Arcade.Sprite }
  ) {

  const weapon = scene.physics.add.sprite(allPlayers[playerId].x, allPlayers[playerId].y, 'ak-47');
  allGuns[playerId] = weapon
  weapon.setScale(0.2)
}