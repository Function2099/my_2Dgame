import PlayerController from "../controller/PlayerController.js"
import PauseMenu from "../ui/PauseMenu.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isGameActive = false;
    }

    // 資源加載
    preload() {
        // 使用簡單幾何圖形代替精靈（暫時不用美術資源）
        // 玩家：紅色方塊
        const playerGfx = this.add.graphics();
        playerGfx.fillStyle(0xff0000, 1);
        playerGfx.fillRect(0, 0, 40, 56);
        playerGfx.generateTexture('player', 40, 56);
        playerGfx.destroy();

        // 平台：棕色長條
        const platformGfx = this.add.graphics();
        platformGfx.fillStyle(0x8B4513, 1);
        platformGfx.fillRect(0, 0, 100, 20);
        platformGfx.generateTexture('platform', 100, 20);
        platformGfx.destroy();

        // 敵人：藍色方塊
        const enemyGfx = this.add.graphics();
        enemyGfx.fillStyle(0x0000ff, 1);
        enemyGfx.fillRect(0, 0, 40, 60);
        enemyGfx.generateTexture('enemy', 40, 60);
        enemyGfx.destroy();
    }

    // 測試
    create() {
        console.log('創建遊戲場景...');

        // esc暫停和回到主選單功能
        this.pauseMenu = new PauseMenu(this);

        // 玩家生成位置
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setTint(0xff0000); // 紅色標記
        this.player.setCollideWorldBounds(true);

        // 生成敵人群組（靜態）
        this.enemies = this.physics.add.staticGroup();
        this.enemyGroup = this.enemies;

        // 生成敵人（使用 sprite）
        const enemy = this.enemies.create(500, 300, 'enemy');
        enemy.setOrigin(0.5);
        enemy.hitCount = 0;
        enemy.takeHit = function () {
            this.hitCount += 1;
            console.log(`Enemy 被打第 ${this.hitCount} 次`);
        };

        // 測試平台
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(10, 1).refreshBody();
        this.platforms.create(600, 400, 'platform').setScale(3, 1).refreshBody();
        this.platforms.create(200, 250, 'platform').setScale(3, 1).refreshBody();
        this.platforms.create(1200, 500, 'platform').setScale(3, 1).refreshBody();
        this.platforms.create(1800, 300, 'platform').setScale(3, 1).refreshBody();
        this.physics.add.collider(this.player, this.platforms);

        // 設定地圖大小
        this.cameras.main.setBounds(0, 0, 2000, 1500);
        this.physics.world.setBounds(0, 0, 2000, 1500);

        // 鏡頭跟隨主角
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setFollowOffset(-100, 0);

        // 調整全局重力
        this.physics.world.gravity.y = 1200;
        // 控制
        this.cursors = this.input.keyboard.createCursorKeys();
        // 玩家控制邏輯
        this.playerController = new PlayerController(this, this.player, this.cursors, this.enemyGroup);

        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();

        console.log('場景創建完成');
        this.isGameActive = true;
    }

    // 介面刷新相關(遊戲幀)
    update() {
        if (!this.isGameActive) return;
        this.playerController.update();
    }
}
