// Interfaces
import { IPlayer } from '../../interfaces/interfaces'

// Objects
import Player from '../player'

export default function addOtherPlayer(scene: Phaser.Scene, playerInfo: IPlayer) {

  const otherPlayer = scene.add.existing(new Player(scene, playerInfo))
  return otherPlayer;
}