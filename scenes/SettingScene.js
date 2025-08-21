export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const buttonSpacing = 30;

    this.add.text(centerX, centerY - buttonSpacing, '按鍵設定', { fontSize: '28px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        console.log('尚未實作 KeyConfigScene');
        // this.scene.start('KeyConfigScene');
      });

    this.add.text(centerX, centerY + buttonSpacing, '聲音設定', { fontSize: '28px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        // 這裡可以跳轉到 SoundConfigScene 或開啟音量調整 UI
      });
    this.add.text(centerX, centerY + 2 * buttonSpacing, '返回主畫面', { fontSize: '28px', fill: '#00f0ff' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    backText.on('pointerover', () => backText.setStyle({ fill: '#00c0cc' }));
    backText.on('pointerout', () => backText.setStyle({ fill: '#00f0ff' }));
    backText.on('pointerdown', () => {
      this.scene.start('MainMenuScene'); // 替換成你的主畫面 scene 名稱
    });
  }
}