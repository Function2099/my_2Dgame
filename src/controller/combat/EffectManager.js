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

    spawnDashTrail(x, y, direction = 1) {
        const trailGroup = [];

        const yOffsets = [-25, 0, 40]; // 上中下三層
        const segmentLength = 60;     // 每段線長度
        const segmentSpacing = 16;    // 每段間距

        for (const yOffset of yOffsets) {
            const trail = this.scene.add.graphics();
            trail.setDepth(15);
            trail.setScrollFactor(1);
            trail.lineStyle(4, 0xffffff, 0.8);

            for (let i = 0; i < 3; i++) {
                const offset = i * segmentSpacing;
                trail.beginPath();
                trail.moveTo(x - direction * offset, y + yOffset);
                trail.lineTo(x - direction * (offset + segmentLength), y + yOffset);
                trail.strokePath();
            }

            this.scene.tweens.add({
                targets: trail,
                alpha: 0,
                duration: 250,
                ease: 'Cubic.easeOut',
                onComplete: () => trail.destroy()
            });

            trailGroup.push(trail);
        }
    }
}