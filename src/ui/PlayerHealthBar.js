export default class PlayerHealthBar {
    constructor(scene, width = 150, height = 16, playerStatus) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.playerStatus = playerStatus;

        this.maxHP = playerStatus.maxHp;
        this.currentHP = playerStatus.hp;

        const screenW = scene.scale.width;
        this.x = screenW - width - 60;
        this.y = 20;

        this.bar = scene.add.graphics();
        this.bar.setScrollFactor(0);
        this.bar.setDepth(10);

        this.draw();
    }

    setHP(value) {
        this.currentHP = Phaser.Math.Clamp(value, 0, this.maxHP);
        this.draw();
    }

    setMaxHP(newMax) {
        this.maxHP = newMax;
        this.currentHP = Phaser.Math.Clamp(this.currentHP, 0, newMax);
        this.draw();
    }

    flash() {
        this.scene.tweens.add({
            targets: this.bar,
            alpha: { from: 1, to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 2
        });
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
        const barX = rightEdge - barWidth;

        this.bar.fillStyle(0xff4444);
        this.bar.fillRect(barX, this.y, barWidth, this.height);

        // 邊框
        this.bar.lineStyle(2, 0xffffff);
        this.bar.strokeRect(this.x, this.y, this.width, this.height);
    }
}