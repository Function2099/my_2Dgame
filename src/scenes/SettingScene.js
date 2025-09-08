import { createTitleText, createSceneButton } from '../ui/UITextHelper.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init() {
    this.isTransitioning = false;  // ✅ 防止重複切換
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
    const keyConfigBtn = createSceneButton(this, centerX, centerY, '按鍵設定', 'KeyConfigScene');
    const soundBtn = createSceneButton(this, centerX, centerY + buttonSpacing, '聲音設定', 'SoundSettingsScene');
    const backBtn = createSceneButton(this, centerX, centerY + buttonSpacing * 2, '返回主畫面', 'MainMenuScene');

    // 淡入動畫
    this.tweens.add({
      targets: [title, keyConfigBtn, soundBtn, backBtn],
      alpha: { from: 0, to: 1 },
      duration: 900,
      ease: 'Power2',
    });
    this.cameras.main.fadeIn(500, 0, 0, 0);

  }
}
