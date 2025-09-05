import { createTitleText, createMainMenuButton } from './UITextHelper.js';

export default class PauseMenu {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        const { width, height } = this.scene.scale;

        // 半透明背景 (保持原樣)
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.5);
        this.overlay.fillRect(0, 0, width, height);
        this.overlay.setScrollFactor(0).setDepth(100);

        // 標題 (改用UITextHelper的createTitleText)
        this.title = createTitleText(this.scene, width / 2, 150, '暫停選單')
            .setScrollFactor(0)
            .setDepth(101);

        // 按鈕 (改用UITextHelper的createMainMenuButton)
        this.resumeBtn = createMainMenuButton(this.scene, width / 2, 250, '繼續遊戲', () => this.resume())
            .setScrollFactor(0)
            .setDepth(101);

        this.menuBtn = createMainMenuButton(this.scene, width / 2, 320, '回主選單', () => {
            this.scene.physics.world.resume();
            this.scene.anims.resumeAll();
            this.scene.time.timeScale = 1;
            this.scene.isGameActive = true;
            this.scene.scene.stop('GameScene');
            this.scene.scene.start('MainMenuScene');
        }).setScrollFactor(0).setDepth(101);

        this.setVisible(false);
    }

    pause() {
        this.scene.isGameActive = false;
        this.scene.physics.world.pause();
        this.scene.anims.pauseAll();
        this.scene.time.timeScale = 0;
        this.setVisible(true);
    }

    resume() {
        this.scene.isGameActive = true;
        this.scene.physics.world.resume();
        this.scene.anims.resumeAll();
        this.scene.time.timeScale = 1;
        this.setVisible(false);
    }

    setVisible(visible) {
        this.overlay.setVisible(visible);
        this.title.setVisible(visible);
        this.resumeBtn.setVisible(visible);
        this.menuBtn.setVisible(visible);
    }

    bindEvents() {
        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.scene.isGameActive) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // 角落「≡」按鈕，保持原本樣式與行為
        this.pauseBtn = this.scene.add.text(20, 20, '≡', {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            padding: { left: 12, right: 12, top: 6, bottom: 6 },
            stroke: '#444444',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 3,
                stroke: true,
                fill: true
            }
        })
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(101);

        this.pauseBtn.on('pointerdown', () => {
            if (this.scene.isGameActive) {
                this.pause();
            }
        });
    }
}
