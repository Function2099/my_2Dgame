import { loadAssets } from "../animation/AssetLoader.js";
export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
    }

    preload() {
        // 顯示載入文字或進度條
        const loadingText = this.add.text(400, 300, '載入中...', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 美術資源
        loadAssets(this);

        // 子彈
        const bulletGfx = this.add.graphics();
        bulletGfx.fillStyle(0xffffff, 1);
        bulletGfx.fillCircle(16, 16, 12);
        bulletGfx.generateTexture('enemyBullet', 32, 32); // 貼圖大小 32x32
        bulletGfx.destroy();

        // 可選：進度條
        this.load.on('progress', (value) => {
            loadingText.setText(`載入中... ${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            loadingText.setText('載入完成');
        });
    }

    create() {
        // 載入完成後切換到主場景
        this.scene.start('GameScene');
    }
}