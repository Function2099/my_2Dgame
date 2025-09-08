// src/ui/UITextHelper.js

/**
 * 建立主選單用的標題樣式文字
 */
export function createTitleText(scene, x, y, text) {
    return scene.add.text(x, y, text, {
        fontFamily: 'Microsoft JhengHei',
        fontSize: '64px',
        color: '#ffffffff',
        stroke: '#053535',
        strokeThickness: 6,
        shadow: {
            offsetX: 3,
            offsetY: 3,
            color: '#041f1f',
            blur: 6,
            stroke: true,
            fill: true,
        },
    }).setOrigin(0.5);
}

/**
 * 建立樣式一致的主選單按鈕
 */
export function createMainMenuButton(scene, x, y, text, callback) {
    const style = {
        fontFamily: 'Microsoft JhengHei',
        fontSize: '28px',
        color: '#ffffffff',
        backgroundColor: '#12151a',
        padding: { left: 15, right: 15, top: 6, bottom: 6 },
        stroke: '#585858ff',
        strokeThickness: 3,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#042a2a',
            blur: 4,
            stroke: true,
            fill: true,
        },
        align: 'center',
    };

    const btn = scene.add.text(x, y, text, style)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);

    btn.on('pointerover', () => {
        btn.setStyle({
            backgroundColor: '#27414a',
            color: '#ffffffff',
        });
        scene.tweens.add({
            targets: btn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 180,
            ease: 'Power1',
        });
    });

    btn.on('pointerout', () => {
        btn.setStyle({
            backgroundColor: '#12151a',
            color: '#ffffffff',
        });
        scene.tweens.add({
            targets: btn,
            scaleX: 1,
            scaleY: 1,
            duration: 180,
            ease: 'Power1',
        });
    });

    btn.on('pointerdown', callback);

    return btn;
}


// 切換場景淡入淡出
export function createSceneButton(scene, x, y, text, targetScene) {
    const btn = createMainMenuButton(scene, x, y, text, () => {
        scene.cameras.main.fadeOut(500, 0, 0, 0);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.scene.start(targetScene);
        });
    });
    return btn;
}