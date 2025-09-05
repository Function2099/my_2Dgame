import { createTitleText, createMainMenuButton } from '../ui/UITextHelper.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const buttonSpacing = 80;

    // 深色背景
    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0b0c10)
      .setAlpha(1);

    // 標題
    const title = createTitleText(this, centerX, centerY - 150, '設定');

    // 按鈕
    const keyConfigBtn = createMainMenuButton(this, centerX, centerY, '按鍵設定', () => {
      this.scene.start('KeyConfigScene');
    });

    const soundBtn = createMainMenuButton(this, centerX, centerY + buttonSpacing, '聲音設定', () => {
      console.log('還沒做聲音設定介面');
    });

    const backBtn = createMainMenuButton(this, centerX, centerY + buttonSpacing * 2, '返回主畫面', () => {
      this.scene.start('MainMenuScene');
    });

    // 淡入動畫
    this.tweens.add({
      targets: [title, keyConfigBtn, soundBtn, backBtn],
      alpha: { from: 0, to: 1 },
      duration: 900,
      ease: 'Power2',
    });
  }
}
