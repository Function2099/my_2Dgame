export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const buttonSpacing = 30;

    const textStyle = {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      padding: { top: 10, bottom: 10 }, // 增加上下空間避免裁切
      align: 'center'
    };


    this.add.text(centerX, centerY - buttonSpacing, '按鍵設定', textStyle)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        console.log('尚未實作 KeyConfigScene');
        // this.scene.start('KeyConfigScene');
      });

    this.add.text(centerX, centerY + buttonSpacing, '聲音設定', textStyle)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        console.log('還沒做聲音設定介面');
        // 這裡可以跳轉到 SoundConfigScene 或開啟音量調整 UI
      });


    const backText = this.add.text(centerX, centerY + (3 * buttonSpacing), '返回主畫面', textStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

  }
}