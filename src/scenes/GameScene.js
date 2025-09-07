import PlayerController from "../controller/PlayerController.js"
import PauseMenu from "../ui/PauseMenu.js";
import EnemyManager from "../enemies/EnemyManager.js";
import PlatformManager from "../platforms/PlatformManager.js";
import { registerAnimations } from '../animation/AnimationRegistry.js';
import { loadAssets } from "../animation/AssetLoader.js";
import CameraManager from "../controller/CameraManager.js";
import ZoneTriggerManager from "../controller/ZoneTriggerManager.js";
import PlayerHealthBar from "../ui/PlayerHealthBar.js";
import GameTime from "../../utils/GameTime.js";
import EffectManager from "../controller/combat/EffectManager.js";

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.isGameActive = false;
    }

    // 資源加載
    preload() {
        // 美術資源
        loadAssets(this);

        // 子彈
        const bulletGfx = this.add.graphics();
        bulletGfx.fillStyle(0xffffff, 1);
        bulletGfx.fillCircle(16, 16, 12);
        bulletGfx.generateTexture('enemyBullet', 32, 32); // ✅ 貼圖大小 32x32
        bulletGfx.destroy();

    }

    // 測試
    create() {
        console.log('創建遊戲場景...');
        console.log('Phaser version =', Phaser.VERSION);
        this.physics.world.resume();
        this.anims.resumeAll();
        this.time.timeScale = 1;
        this.isGameActive = true;

        registerAnimations(this);

        // 特效
        const sparkGfx = this.add.graphics();
        sparkGfx.fillStyle(0xffffff, 1);
        sparkGfx.fillCircle(10, 10, 10); // 半徑 4px 的白色圓形
        sparkGfx.generateTexture('spark_white', 12, 12); // 產生 8x8 貼圖
        sparkGfx.destroy();
        if (!(this.effectManager instanceof EffectManager)) {
            this.effectManager = new EffectManager(this);
        }

        // 玩家生成位置
        // 區域一
        // this.player = this.physics.add.sprite(100, 1040, 'player_idle');
        // 區域二
        // this.player = this.physics.add.sprite(3486, 670, 'player_idle');
        // 區域三
        this.player = this.physics.add.sprite(5400, 1502, 'player_idle');
        this.player.play('player_idle');
        this.player.setCollideWorldBounds(true);

        // 玩家控制
        const keyMap = this.registry.get('keyBindings') || {
            moveLeft: 'LEFT',
            moveRight: 'RIGHT',
            Up: 'UP',
            Down: 'DOWN',
            jump: 'SPACE',
            dash: 'X',
            attack: 'Z'
        };

        this.inputs = {};
        for (const action in keyMap) {
            this.inputs[action] = this.input.keyboard.addKey(keyMap[action]);
        }
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

            this.enemyManager.spawn(centerX, centerY, type);
        });

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
        this.playerController = new PlayerController(this, this.player, this.inputs, this.enemyGroup, this.platformManager);

        // 攝影機
        this.cameraManager = new CameraManager(this, this.player);
        this.cameraManager.stopFollow();
        this.cameraManager.follow();

        // esc暫停和回到主選單功能
        this.pauseMenu = new PauseMenu(this);
        this.isGameActive = true;
        this.gameTime = new GameTime(this);

        // 血量條
        this.playerHealthBar = new PlayerHealthBar(this, 150, 16, 15);
        console.log('場景創建完成');
        console.log('動畫是否存在：', this.anims.exists('player_idle'));
        // this.time.addEvent({
        //     delay: 3000, // 三秒一次
        //     loop: true,
        //     callback: () => {
        //         const { x, y } = this.player;
        //         console.log(`玩家座標：(${x.toFixed(2)}, ${y.toFixed(2)})`);
        //     }
        // });
        this.events.once('bossDefeated', () => {
            console.log('[GameScene] 收到 bossDefeated 事件，2 秒後顯示結算畫面');
            this.time.delayedCall(2000, () => {
                this.showDemoEndScreen();
            });
        });

    }

    // 介面刷新相關(遊戲幀)
    update() {
        if (!this.isGameActive) return;
        this.playerController.update();
        this.enemyManager.update(this.playerController.status);
        this.zoneTriggerManager.update();
    }

    showDemoEndScreen() {
        this.scene.launch('DemoEndScene');
        this.isGameActive = false; 
    }
}
