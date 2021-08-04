// Interfaces
import { IPlayer } from '../../interfaces/interfaces'
import Phaser from 'phaser'

export default class addPlayer extends Phaser.Physics.Arcade.Sprite {
    
    constructor (scene: Phaser.Scene, playerInfo: IPlayer) {
        super(scene, playerInfo.x, playerInfo.y, 'player_idle')
        scene.add.existing(this)
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setScale(2.5)
        this.setSize(25, 30);
    }
}