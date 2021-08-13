export default class BloodEffect extends Phaser.GameObjects.Particles.ParticleEmitterManager {

    constructor (scene: Phaser.Scene, count: number, x: number, y: number) {
        super(scene, 'blood');
        this.createEmitter({
            x,
            y,
            speed: { min: 100, max: -200 },
            angle: { min: 0, max: 360},
            gravityY: 0,
            scale: { start: 0.08, end: 0.0 },
            lifespan: 500,
            blendMode: 'NORMAL',
        }).explode(count, x, y)
    }
}