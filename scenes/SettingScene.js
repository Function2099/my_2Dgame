export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    this.add.text(400, 200, '按鍵設定', { fontSize: '28px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        console.log('尚未實作 KeyConfigScene');
        // this.scene.start('KeyConfigScene');
      });

    this.add.text(400, 300, '聲音設定', { fontSize: '28px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        // 這裡可以跳轉到 SoundConfigScene 或開啟音量調整 UI
      });
  }
}