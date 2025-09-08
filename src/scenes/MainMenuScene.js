import { createTitleText, createSceneButton } from '../ui/UITextHelper.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const buttonSpacing = 100;

    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0b0c10)
      .setAlpha(1);

    const title = createTitleText(this, centerX, centerY - 150, '遊戲主選單');

    const startBtn = createSceneButton(this, centerX, centerY, '開始遊戲', 'LoadingScene');
    const settingsBtn = createSceneButton(this, centerX, centerY + buttonSpacing, '設定', 'SettingsScene');

    this.tweens.add({
      targets: [title, startBtn, settingsBtn],
      alpha: { from: 0, to: 1 },
      duration: 900,
      ease: 'Power2'
    });
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
