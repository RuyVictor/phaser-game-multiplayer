export default class SparkEffect extends Phaser.GameObjects.Particles.ParticleEmitterManager {

    constructor (scene: Phaser.Scene, object: any, count: number) {
        super(scene, 'spark');
        this.createEmitter({
            speed: 100,
            angle: { min: 0, max: 360},
            gravityY: 0,
            scale: { start: 0.06, end: 0.0 },
            lifespan: 300,
            blendMode: 'ADD',
            quantity: count,
        }).startFollow(object)
    }
}