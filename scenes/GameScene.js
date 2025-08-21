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
        playerGfx.fillRect(0, 0, 40, 40);
        playerGfx.generateTexture('player', 40, 40);
        playerGfx.destroy();

        // 敵人：黑色圓形
        const enemyGfx = this.add.graphics();
        enemyGfx.fillStyle(0x000000, 1);
        enemyGfx.fillCircle(20, 20, 20);
        enemyGfx.generateTexture('enemy', 40, 40);
        enemyGfx.destroy();

        // 平台：棕色長條
        const platformGfx = this.add.graphics();
        platformGfx.fillStyle(0x8B4513, 1);
        platformGfx.fillRect(0, 0, 100, 20);
        platformGfx.generateTexture('platform', 100, 20);
        platformGfx.destroy();

        // 傳送門：紫色圓環
        const portalGfx = this.add.graphics();
        portalGfx.lineStyle(4, 0x800080, 1);
        portalGfx.strokeCircle(20, 20, 18);
        portalGfx.generateTexture('portal', 40, 40);
        portalGfx.destroy();

    }

    // 測試
    create() {
        console.log('創建遊戲場景...');

        // 先創建一個簡單的測試場景
        // this.add.text(400, 100, '遊戲啟動成功!', {
        //     fontSize: '32px',
        //     fill: '#fff'
        // }).setOrigin(0.5);

        // 測試玩家
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setTint(0xff0000); // 紅色標記
        this.player.setCollideWorldBounds(true);

        // 測試平台
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'platform').setScale(10, 1).refreshBody();
        this.platforms.create(600, 400, 'platform').setScale(3, 1).refreshBody();
        this.platforms.create(200, 250, 'platform').setScale(3, 1).refreshBody();

        this.physics.add.collider(this.player, this.platforms);

        // 控制
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log('場景創建完成');
        this.isGameActive = true;
    }

    // // 遊戲創建
    // class create {
    //     constructor() {

    //         // 創建平台
    //         platforms = this.physics.add.staticGroup();
    //         createLevel(this);

    //         // 創建玩家
    //         player = this.physics.add.sprite(100, 450, 'player');
    //         player.setBounce(0.2);
    //         player.setCollideWorldBounds(true);
    //         player.body.setGravityY(300);

    //         // 創建敵人群組
    //         enemies = this.physics.add.group();
    //         spawnEnemies(this);

    //         // 創建傳送門（初始隱藏）
    //         portal = this.physics.add.sprite(400, 300, 'portal').setScale(2);
    //         portal.body.allowGravity = false;
    //         portal.visible = false;

    //         // 碰撞檢測
    //         this.physics.add.collider(player, platforms);
    //         this.physics.add.collider(enemies, platforms);
    //         this.physics.add.collider(player, enemies, hitEnemy, null, this);
    //         this.physics.add.overlap(player, portal, goToNextLevel, null, this);

    //         // 控制設定
    //         cursors = this.input.keyboard.createCursorKeys();

    //         // UI元素
    //         scoreText = this.add.text(16, 16, '分數: 0', { fontSize: '32px', fill: '#fff' });
    //         levelText = this.add.text(600, 16, '關卡: 1', { fontSize: '32px', fill: '#fff' });

    //         // 攻擊按鍵
    //         this.input.keyboard.on('keydown_SPACE', attack, this);
    //     }
    // }

    // 測試更新
    update() {
        if (!this.isGameActive) return;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    // // 遊戲更新
    // function update() {
    //     if (!isGameActive) return;

    //     // 玩家移動
    //     if (cursors.left.isDown) {
    //         player.setVelocityX(-200);
    //     } else if (cursors.right.isDown) {
    //         player.setVelocityX(200);
    //     } else {
    //         player.setVelocityX(0);
    //     }

    //     if (cursors.up.isDown && player.body.touching.down) {
    //         player.setVelocityY(-400);
    //     }
    // }
}