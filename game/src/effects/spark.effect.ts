export default class SparkEffect extends Phaser.GameObjects.Particles.ParticleEmitterManager {

    constructor (scene: Phaser.Scene, count: number, x: number, y: number) {
        super(scene, 'grass-tiles');
        this.createEmitter({
            x,
            y,
            speed: { min: 100, max: -500 },
            gravityY: 0,
            scale: { start: 0.02, end: 0.0 },
            lifespan: 500,
            blendMode: 'ADD',
        }).explode(count, x, y)
    }
}