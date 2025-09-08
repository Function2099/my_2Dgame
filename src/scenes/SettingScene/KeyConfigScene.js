import KeyBindingMenu from "../../../utils/KeyBindingMenu.js";
import { createTitleText, createMainMenuButton } from '../../ui/UITextHelper.js';

export class KeyConfigScene extends Phaser.Scene {
    constructor() {
        super('KeyConfigScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const bottomY = this.cameras.main.height - 60;

        // 背景：深色背景
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0b0c10)
            .setAlpha(1);

        // 標題，改用共用函數
        const title = createTitleText(this, centerX, 60, '按鍵設定');

        // 初始化你原本的按鍵設定物件（不變）
        this.keyBindingMenu = new KeyBindingMenu(this);

        // 建立共用按鈕函數，稍作改寫：  
        // 由於這邊兩個按鈕在底部兩側，改為接受 x,y 參數
        // 直接用 helper 的 createMainMenuButton 也行，但它是居中按鈕，如果想要更自由位置，helper 需要改進
        // 這裡先直接用 helper，位置放中間，做微調就好

        // 先用共用的 createMainMenuButton（居中），再用 setX 調整位置
        const backToSettingsBtn = createMainMenuButton(this, centerX, bottomY, '返回設定', () => {
            this.registry.set('keyBindings', this.keyBindingMenu.getBindings());
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SettingsScene');
            });
        });

        backToSettingsBtn.setX(centerX - 180);

        const resetBtn = createMainMenuButton(this, centerX, bottomY, '重設', () => {
            this.keyBindingMenu.resetToDefault(); // 重設為預設綁定
            this.registry.set('keyBindings', this.keyBindingMenu.getBindings());
            this.scene.restart(); // 重新載入場景以更新顯示
        });
        resetBtn.setX(centerX);

        const backToMainBtn = createMainMenuButton(this, centerX, bottomY, '返回主選單', () => {
            this.registry.set('keyBindings', this.keyBindingMenu.getBindings());
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });

        });
        backToMainBtn.setX(centerX + 180);

        // 動畫淡入
        this.tweens.add({
            targets: [title, backToSettingsBtn, backToMainBtn],
            alpha: { from: 0, to: 1 },
            duration: 900,
            ease: 'Power2',
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);

    }
}
