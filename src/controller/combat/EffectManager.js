export default class EffectManager {
    constructor(scene) {
        this.scene = scene;

        this.sparkEmitter = scene.add.particles(0, 0, 'spark_white', {
            speed: { min: 100, max: 250 },
            angle: { min: 0, max: 360 },
            lifespan: { min: 200, max: 500 },
            quantity: 0,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: { onEmit: () => Phaser.Utils.Array.GetRandom([0x00aaff, 0xffffff]) },
            blendMode: 'ADD',
            emitting: false
        });
        this.sparkEmitter.setDepth(20);
    }

    spawnParticles(x, y, quantity = 12) {
        this.sparkEmitter.setPosition(x, y);
        this.sparkEmitter.explode(quantity);
    }

    spawnExplosionCircle(x, y, radius = 60) {
        const circle = this.scene.add.circle(x, y, radius, 0x00aaff, 0.4)
            .setStrokeStyle(3, 0xffffff, 0.8)
            .setDepth(20);

        this.scene.tweens.add({
            targets: circle,
            scale: { from: 1, to: 0 },
            alpha: { from: 0.8, to: 0 },
            ease: 'Cubic.easeOut',
            duration: 400,
            onComplete: () => circle.destroy()
        });
    }
}