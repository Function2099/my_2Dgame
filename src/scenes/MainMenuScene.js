export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
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

    this.add.text(centerX, centerY - buttonSpacing, '開始遊戲', textStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });

    this.add.text(centerX, centerY + buttonSpacing, '設定', textStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('SettingsScene');
      });
  }
}