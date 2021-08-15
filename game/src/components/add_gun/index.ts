import Phaser from 'phaser'
import { Socket } from 'socket.io-client'
import { IWhoKilledWho } from '../../interfaces/interfaces';

export default function addGun(
  scene: Phaser.Scene,
  socket: Socket,
  roomId: string,
  mouseInfo: {getXY: () => {x: number, y: number}},
  allPlayers: { [playerId: string]: Phaser.Physics.Arcade.Sprite },
  allGuns: { [playerId: string]: Phaser.Physics.Arcade.Sprite }
  ) {

  const weapon = scene.physics.add.sprite(allPlayers[socket.id].x, allPlayers[socket.id].y, 'ak-47');
  allGuns[socket.id] = weapon
  weapon.setScale(0.2)

  scene.events.on('update', () => {
    let crosshairX = mouseInfo.getXY().x + scene.cameras.main.worldView.x
    let crosshairY = mouseInfo.getXY().y + scene.cameras.main.worldView.y
    let angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(
      weapon.x, weapon.y, crosshairX, crosshairY
    );
    weapon.setAngle(angle);
    weapon.setPosition(allPlayers[socket.id].x, allPlayers[socket.id].y)
    
    if (angle >= 90 || angle < -90) {
      weapon.setFlipY(true)
      allPlayers[socket.id].setFlipX(true)
    } else {
      weapon.setFlipY(false)
      allPlayers[socket.id].setFlipX(false)
    }

    let weaponInfo = {
      playerId: socket.id,
      angle,
      flipped: weapon.flipY,
      x: weapon.x,
      y: weapon.y
    }
  
    socket.emit('playerWeapon', {roomId: roomId, weaponInfo})
  })

  socket.on('receivedWeaponInfo', (weaponInfo: any) => {
    allGuns[weaponInfo.playerId].setAngle(weaponInfo.angle)
    allGuns[weaponInfo.playerId].setFlipY(weaponInfo.flipped)
    allGuns[weaponInfo.playerId].setPosition(weaponInfo.x, weaponInfo.y)
  })

  socket.on('removePlayer', (playerId: string) => {
    if (playerId in allGuns) {
      allGuns[playerId].destroy()
      delete allGuns[playerId];
    }
  });

  socket.on('playerDied', (data: IWhoKilledWho) => {
      if (data.playerId in allGuns)
      allGuns[data.playerId].setVisible(false)
  });
}