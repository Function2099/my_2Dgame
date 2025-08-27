export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'enemy') {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5);
        this.setCollideWorldBounds(true); // 防止掉出世界
        this.body.setBounce(0);           // 不彈跳
        this.body.setGravityY(0);         // 可選：用全局重力即可
        this.body.setImmovable(false);    // 被重力影響
        this.body.allowGravity = true;    // 開啟重力影響

        this.hitCount = 0;

        // 敵人AI
        this.state = 'idle'; // idle, patrol, chase, attack

    }

    takeHit() {
        this.hitCount++;
        console.log(`Enemy 被打第 ${this.hitCount} 次`);
        if (this.hitCount >= 3) {
            this.destroy(); // 或播放死亡動畫
        }
    }

    die(config) {
        if (!config || !config.animation) {
            throw new Error('die() 必須提供 animation 屬性');
        }

        if (this.state === 'dead') return;
        this.state = 'dead';
        this.isHit = true;

        // ✅ 撥放死亡動畫（立即）
        this.play(config.animation);

        // ✅ 不要馬上關掉 physics，讓彈飛能發生
        if (config.knockback) {
            this.setVelocityX(config.knockback);
        }

        // ✅ 等動畫結束後再摧毀
        this.once('animationcomplete', () => {
            if (config.disablePhysics) {
                this.body.enable = false;
                this.attackBox?.body?.enable && (this.attackBox.body.enable = false);
            }
            this.destroy();
        });
    }
}