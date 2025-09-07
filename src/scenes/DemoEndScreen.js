export default class DemoEndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DemoEndScene', transparent: true });
    }

    create() {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
            .setAlpha(0)
            .setScrollFactor(0);

        const title = this.add.text(width / 2, height / 2 - 70, 'Demo模式結束', {
            fontSize: '56px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setAlpha(0)
            .setScrollFactor(0);

        const btnWidth = 220;
        const btnHeight = 60;
        const radius = 15;

        const backBtnContainer = this.add.container(width / 2, height / 2 + 80)
            .setAlpha(0)
            .setDepth(101)
            .setScrollFactor(0);

        // 按鈕背景 (Graphics)
        const backBtnBg = this.add.graphics();
        backBtnBg.fillStyle(0x555555, 1);
        backBtnBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, radius);

        // 把 backBtnBg 設為互動區域，範圍是剛畫的矩形
        backBtnBg.setInteractive(new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

        // 按鈕文字
        const backBtnText = this.add.text(0, 0, '返回主選單', {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        backBtnContainer.add([backBtnBg, backBtnText]);

        // 用 backBtnBg 監聽互動事件
        backBtnBg.on('pointerover', () => {
            this.tweens.add({
                targets: backBtnContainer,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Power1'
            });
            backBtnBg.clear();
            backBtnBg.fillStyle(0x777777, 1);
            backBtnBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, radius);
        });

        backBtnBg.on('pointerout', () => {
            this.tweens.add({
                targets: backBtnContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power1'
            });
            backBtnBg.clear();
            backBtnBg.fillStyle(0x555555, 1);
            backBtnBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, radius);
        });

        backBtnBg.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        this.tweens.add({
            targets: [overlay, title, backBtnContainer],
            alpha: 1,
            duration: 2000,
            ease: 'Power2'
        });
    }
}
