export default class SparkEffect extends Phaser.GameObjects.Particles.ParticleEmitterManager {

    constructor (scene: Phaser.Scene, object: any, count: number) {
        super(scene, 'spark');
        this.createEmitter({
            speed: { min: 100, max: -200 },
            angle: { min: 0, max: 360},
            gravityY: 0,
            scale: { start: 0.06, end: 0.0 },
            lifespan: 300,
            blendMode: 'ADD',
        }).explode(count, object.body.x, object.body.y)
    }
}