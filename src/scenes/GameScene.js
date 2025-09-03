import PlayerController from "../controller/PlayerController.js"
import PauseMenu from "../ui/PauseMenu.js";
import EnemyManager from "../enemies/EnemyManager.js";
import PlatformManager from "../platforms/PlatformManager.js";
import { registerAnimations } from '../animation/AnimationRegistry.js';
import { loadAssets } from "../animation/AssetLoader.js";
import CameraManager from "../controller/CameraManager.js";
import ZoneTriggerManager from "../controller/ZoneTriggerManager.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isGameActive = false;
    }

    // 資源加載
    preload() {
        // 美術資源
        loadAssets(this);

        // 平台
        this.load.tilemapTiledJSON('map_intro', '../assets/platform/map.tmj');
        this.load.image('bg_intro', '../assets/platform/bg_intro.png');
        this.load.image('platform_tiles', '../assets/platform/tileset.png');

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
        console.log('Phaser version =', Phaser.VERSION);

        registerAnimations(this);

        // 特效
        const sparkGfx = this.add.graphics();
        sparkGfx.fillStyle(0xffffff, 1);
        sparkGfx.fillCircle(10, 10, 10); // 半徑 4px 的白色圓形
        sparkGfx.generateTexture('spark_white', 12, 12); // 產生 8x8 貼圖
        sparkGfx.destroy();

        // 玩家生成位置
        // 區域一
        // this.player = this.physics.add.sprite(100, 1040, 'player_idle');
        // 區域二
        this.player = this.physics.add.sprite(3486, 670, 'player_idle');
        // 區域三
        // this.player = this.physics.add.sprite(5400, 1502, 'player_idle');
        this.player.play('player_idle');
        this.player.setCollideWorldBounds(true);

        // 平台管理

        this.platformManager = new PlatformManager(this);
        const map = this.make.tilemap({ key: 'map_intro' });
        const deathZones = map.getObjectLayer('deathZones')?.objects;
        console.log('讀取到死亡區域：', deathZones);
        this.deathZones = deathZones || [];

        // 背景圖片
        const bgImageLayer = map.images.find(img => img.name === 'bg_intro');
        if (bgImageLayer) {
            this.add.image(bgImageLayer.x, bgImageLayer.y, 'bg_intro')
                .setOrigin(0)
                .setScrollFactor(0)
                .setDepth(-10);     // 放在最底層
        } else {
            console.warn('找不到圖片"');
        }

        // 生成敵人（使用 sprite）
        this.enemyManager = new EnemyManager(this);
        // 從 Tiled 的 enemy_spawns 物件層匯入敵人
        const enemyObjects = map.getObjectLayer('enemies')?.objects || [];

        enemyObjects.forEach(obj => {
            const typeProp = obj.properties?.find(p => p.name === 'type');
            const type = typeProp ? typeProp.value : 'ground';

            // Tiled 是左上角 → Phaser 是中心點
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;

            const enemy = this.enemyManager.spawn(centerX, centerY, type);
            // enemy.setDepth(10); // 可選：讓敵人在平台之上
        });
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

        // boss房事件觸發
        const bossZones = map.getObjectLayer('bossTriggers')?.objects || [];
        this.zoneTriggerManager = new ZoneTriggerManager(this, this.player);
        this.zoneTriggerManager.registerBossTriggers(bossZones);

        // 設定地圖大小
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // 調整全局重力
        this.physics.world.gravity.y = 1200;

        // 玩家控制
        this.cursors = this.input.keyboard.createCursorKeys();

        // 玩家控制邏輯
        this.playerController = new PlayerController(this, this.player, this.cursors, this.enemyGroup, this.platformManager);

        // 攝影機
        this.cameraManager = new CameraManager(this, this.player);
        this.cameraManager.stopFollow();
        this.cameraManager.follow();

        // esc暫停和回到主選單功能
        this.pauseMenu = new PauseMenu(this);
        this.isGameActive = true;

        console.log('場景創建完成');
        console.log('動畫是否存在：', this.anims.exists('player_idle'));
        this.time.addEvent({
            delay: 1000, // 每秒
            loop: true,
            callback: () => {
                const { x, y } = this.player;
                console.log(`玩家座標：(${x.toFixed(2)}, ${y.toFixed(2)})`);
            }
        });

    }

    // 介面刷新相關(遊戲幀)
    update() {
        if (!this.isGameActive) return;
        this.playerController.update();
        this.enemyManager.update(this.playerController.status);
        this.zoneTriggerManager.update();
    }
}
