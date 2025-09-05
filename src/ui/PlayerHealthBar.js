export default class PlayerHealthBar {
    constructor(scene, width = 150, height = 16, maxHP = 15) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.maxHP = maxHP;
        this.currentHP = maxHP;

        const screenW = scene.scale.width;

        this.x = screenW - width - 60; // 右邊留 20px 邊距
        this.y = 20;                   // 上方留 20px 邊距

        this.bar = scene.add.graphics();
        this.bar.setScrollFactor(0); // ✅ 固定在畫面上
        this.bar.setDepth(10);      // ✅ 保證在 UI 層級之上

        this.draw();
    }

    setHP(value) {
        this.currentHP = Phaser.Math.Clamp(value, 0, this.maxHP);
        this.draw();
    }

    draw() {
        this.bar.clear();

        // 背景
        this.bar.fillStyle(0x222222);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        // 血量條（從右往左減）
        const hpRatio = this.currentHP / this.maxHP;
        const barWidth = this.width * hpRatio;

        const rightEdge = this.x + this.width;
        const barX = rightEdge - barWidth; // ✅ 從右邊開始畫

        this.bar.fillStyle(0xff4444);
        this.bar.fillRect(barX, this.y, barWidth, this.height);

        // 邊框
        this.bar.lineStyle(2, 0xffffff);
        this.bar.strokeRect(this.x, this.y, this.width, this.height);
    }
}