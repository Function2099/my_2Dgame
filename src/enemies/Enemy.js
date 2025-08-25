export default class Enemy extends Phaser.Physics.Arcade.Sprite {
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
    }

    takeHit() {
        this.hitCount++;
        console.log(`Enemy 被打第 ${this.hitCount} 次`);
        if (this.hitCount >= 15) {
            this.destroy(); // 或播放死亡動畫
        }
    }

    update() {
        // 之後可以加巡邏、追擊邏輯
    }
}