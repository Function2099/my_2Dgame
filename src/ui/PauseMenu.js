// ui/PauseMenu.js
export default class PauseMenu {
    constructor(scene) {
        this.scene = scene;
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        const { width, height } = this.scene.scale;

        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.5);
        this.overlay.fillRect(0, 0, width, height);
        this.overlay.setScrollFactor(0).setDepth(100);

        this.title = this.scene.add.text(width / 2, 150, '暫停選單', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        this.resumeBtn = this.createButton(width / 2, 250, '繼續遊戲', () => this.resume());
        this.menuBtn = this.createButton(width / 2, 320, '回主選單', () => this.scene.scene.start('MainMenuScene'));
        this.settingsBtn = this.createButton(width / 2, 390, '設定', () => this.scene.scene.start('SettingsScene'));

        this.setVisible(false);
    }

    createButton(x, y, text, callback) {
        const btn = this.scene.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: '32px',
            backgroundColor: '#444',
            padding: { x: 10, y: 5 },
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(101);

        btn.on('pointerdown', callback);
        return btn;
    }

    pause() {
        this.scene.isGameActive = false;
        this.scene.physics.world.pause()
        this.setVisible(true);
    }

    resume() {
        this.scene.isGameActive = true;
        this.scene.physics.world.resume()
        this.setVisible(false);
    }

    setVisible(visible) {
        this.overlay.setVisible(visible);
        this.title.setVisible(visible);
        this.resumeBtn.setVisible(visible);
        this.menuBtn.setVisible(visible);
        this.settingsBtn.setVisible(visible);
    }

    bindEvents() {
        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.scene.isGameActive) {
                this.pause();
            } else {
                this.resume();
            }
        });

        this.pauseBtn = this.scene.add.text(20, 20, '≡', {
            fontSize: '32px',
            backgroundColor: '#222',
            color: '#fff',
            padding: { x: 10, y: 5 }
        }).setInteractive().setScrollFactor(0).setDepth(101);

        this.pauseBtn.on('pointerdown', () => {
            if (this.scene.isGameActive) {
                this.pause();
            }
        });
    }
}