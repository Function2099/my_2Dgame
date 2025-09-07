export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'enemy') {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5);
        this.setCollideWorldBounds(true); // 防止掉出世界
        this.body.onWorldBounds = true;
        this.body.setBounce(0);           // 不彈跳
        this.body.setGravityY(0);         // 可選：用全局重力即可
        this.body.setImmovable(false);    // 被重力影響
        this.body.allowGravity = true;    // 開啟重力影響

        // 敵人AI
        this.state = 'idle'; // idle, patrol, chase, attack

    }

    // 避免離開世界邊框
    enforceWorldBounds() {
        const bounds = this.scene.physics.world.bounds;
        const margin = 20;

        if (this.x < bounds.x + margin) {
            this.setX(bounds.x + margin);
            this.escapeDirection = 1;
        }
        if (this.x > bounds.width - margin) {
            this.setX(bounds.width - margin);
            this.escapeDirection = -1;
        }

        if (this.y < bounds.y + margin) {
            this.setY(bounds.y + margin);
        }
        if (this.y > bounds.height - margin) {
            this.setY(bounds.height - margin);
        }
    }

    die(config) {
        if (!config || !config.animation) {
            throw new Error('die() 必須提供 animation 屬性');
        }

        if (this.state === 'dead') return;
        this.state = 'dead';
        this.isHit = true;

        // 撥放死亡動畫（立即）
        this.play(config.animation);

        // 不要馬上關掉 physics，讓彈飛能發生
        if (config.knockback) {
            this.setVelocityX(config.knockback);
        }

        // 等動畫結束後再摧毀
        this.once('animationcomplete', () => {
            // console.log('[die] 關閉 physics');
            if (config.disablePhysics) {
                this.body.enable = false;
                this.attackBox?.body?.enable && (this.attackBox.body.enable = false);
            }
            // console.log('[die] 銷毀角色');
            this.destroy();
        });
    }

    takeHitEffect(x, y, color = 0xffffff, count = 6) {
        this.setTint(0xffffff);

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.4 },
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                this.setAlpha(1);
            }
        });

        for (let i = 0; i < count; i++) {
            const px = this.scene.add.rectangle(x, y, 4, 4, color);
            this.scene.physics.add.existing(px);
            px.body.setVelocity(
                Phaser.Math.Between(-80, 80),
                Phaser.Math.Between(-120, -40)
            );
            px.body.allowGravity = false;
            px.body.setImmovable(true);

            this.scene.time.delayedCall(300, () => {
                if (px.active) px.destroy();
            });
        }
    }

    canSeePlayer(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > this.detectionRange) return false;

        const layer = this.scene.platformManager.getLayer();
        const steps = 4;

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = Phaser.Math.Interpolation.Linear([this.x, player.x], t);
            const checkY = Phaser.Math.Interpolation.Linear([this.y, player.y], t);
            const tile = layer.getTileAtWorldXY(checkX, checkY);
            const isBlocked = tile && !tile.properties?.thin;
            if (isBlocked) return false;
        }

        return true;
    }
}