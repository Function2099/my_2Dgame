import PlayerController from "../controller/PlayerController.js"
import PauseMenu from "../ui/PauseMenu.js";
import EnemyManager from "../enemies/EnemyManager.js";
import PlatformManager from "../platforms/PlatformManager.js";
import { registerAnimations } from '../animation/AnimationRegistry.js';
import { loadAssets } from "../animation/AssetLoader.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isGameActive = false;
    }

    // 資源加載
    preload() {
        loadAssets(this);

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

        // 子彈
        const bulletGfx = this.add.graphics();
        bulletGfx.fillStyle(0xffcc00, 1);
        bulletGfx.fillRect(0, 0, 12, 6);
        bulletGfx.generateTexture('enemyBullet', 12, 6);
        bulletGfx.destroy();
    }

    // 測試
    create() {
        console.log('創建遊戲場景...');

        registerAnimations(this);

        // 玩家生成位置
        this.player = this.physics.add.sprite(400, 300, 'player_idle');
        this.player.play('player_idle');
        this.player.setCollideWorldBounds(true);

        // 平台管理
        this.platformManager = new PlatformManager(this);
        this.platformManager.createPlatforms();

        // 生成敵人（使用 sprite）
        this.enemyManager = new EnemyManager(this);
        // this.enemyManager.spawn(800, 300, 'ground');
        // this.enemyManager.spawn(1200, 400, 'ground');
        // this.enemyManager.spawn(600, 200, 'flying');

        this.enemyGroup = this.enemyManager.getGroup();

        this.physics.world.on('worldbounds', (body) => {
            const enemy = body.gameObject;
            if (enemy && enemy instanceof EnemyBase) {
                if (enemy.escapeDirection !== undefined) {
                    enemy.escapeDirection *= -1;
                }
            }
        });

        // 敵人與平台碰撞關係
        this.physics.add.collider(this.enemyGroup, this.platformManager.getGroup());
        // 敵人之間的碰撞關係
        this.physics.add.collider(this.enemyGroup, this.enemyGroup);

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
        this.playerController = new PlayerController(this, this.player, this.cursors, this.enemyGroup, this.platformManager);

        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();

        // esc暫停和回到主選單功能
        this.pauseMenu = new PauseMenu(this);
        this.isGameActive = true;

        console.log('場景創建完成');
        console.log('動畫是否存在：', this.anims.exists('mummy_walk'));

    }

    // 介面刷新相關(遊戲幀)
    update() {
        if (!this.isGameActive) return;
        this.playerController.update();
        this.enemyManager.update(this.playerController.status);
    }
}
