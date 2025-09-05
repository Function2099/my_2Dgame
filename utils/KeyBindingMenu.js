export default class KeyBindingMenu {
    constructor(scene) {
        this.scene = scene;
        const saved = this.scene.registry.get('keyBindings');

        this.keyMap = saved || {
            moveLeft: 'LEFT',
            moveRight: 'RIGHT',
            Up: 'UP',
            Down: 'DOWN',
            jump: 'SPACE',
            dash: 'X',
            attack: 'Z',
        };
        this.labelMap = {
            moveLeft: '向左移動',
            moveRight: '向右移動',
            Up: '向上視角',
            Down: '向下視角',
            jump: '跳躍',
            dash: '衝刺',
            attack: '攻擊',
        };
        this.waitingForKey = null;
        this.createUI();
    }

    createUI() {
        const { width } = this.scene.scale;
        const startY = 140;
        const gapY = 54;

        this.labels = {};

        Object.keys(this.keyMap).forEach((action, index) => {
            const y = startY + index * gapY;
            const labelText = this.labelMap[action] || action.toUpperCase();

            // 動作名稱（左側）
            const label = this.scene.add.text(width / 2 - 120, y, `${labelText}:`, {
                fontSize: '22px',
                fontFamily: 'Microsoft JhengHei',
                color: '#ffffff',
                stroke: '#444',
                strokeThickness: 2,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#111',
                    blur: 3,
                    stroke: true,
                    fill: true,
                },
            })
                .setOrigin(1, 0.5)
                .setScrollFactor(0)
                .setDepth(10);

            // 鍵位（右側）
            const keyText = this.scene.add.text(width / 2 + 20, y, this.keyMap[action], {
                fontSize: '20px',
                fontFamily: 'Microsoft JhengHei',
                color: '#ffffff',
                backgroundColor: '#1a1a1a',
                padding: { left: 12, right: 12, top: 6, bottom: 6 },
                align: 'center',
                stroke: '#585858',
                strokeThickness: 2,
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: '#000000',
                    blur: 3,
                    stroke: true,
                    fill: true,
                },
            })
                .setOrigin(0, 0.5)
                .setInteractive({ useHandCursor: true })
                .setScrollFactor(0)
                .setDepth(10);

            keyText.on('pointerover', () => {
                if (this.waitingForKey !== action) {
                    keyText.setStyle({
                        backgroundColor: '#27414a',
                        color: '#ffffff',
                    });
                    this.scene.tweens.add({
                        targets: keyText,
                        scaleX: 1.08,
                        scaleY: 1.08,
                        duration: 120,
                        ease: 'Power1',
                    });
                }
            });

            keyText.on('pointerout', () => {
                if (this.waitingForKey !== action) {
                    keyText.setStyle({
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                    });
                    this.scene.tweens.add({
                        targets: keyText,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 120,
                        ease: 'Power1',
                    });
                }
            });

            keyText.on('pointerdown', () => {
                this.waitingForKey = action;
                keyText.setText('...');
                keyText.setStyle({
                    backgroundColor: '#333333',
                    color: '#aaaaaa',
                });
            });

            this.labels[action] = keyText;
        });

        // 鍵盤輸入處理
        this.scene.input.keyboard.on('keydown', (event) => {
            if (this.waitingForKey) {
                const newKey = event.key.toUpperCase();
                this.keyMap[this.waitingForKey] = newKey;
                this.labels[this.waitingForKey].setText(newKey);
                this.labels[this.waitingForKey].setStyle({
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                });

                this.waitingForKey = null;

                this.scene.registry.set('keyBindings', this.keyMap);
            }
        });
    }

    getBindings() {
        return this.keyMap;
    }
}
