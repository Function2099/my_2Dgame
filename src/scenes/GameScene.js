import PlayerController from "../controller/PlayerController.js"

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
    }

    // 測試
    create() {
        console.log('創建遊戲場景...');

        // 測試玩家
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setTint(0xff0000); // 紅色標記
        this.player.setCollideWorldBounds(true);

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

        // // 主角面相
        // this.player.flipX = true;  // 面向左
        // this.player.flipX = false; // 面向右
        
        // // 衝刺
        // this.dash = new Dash(this, this.player, this.cursors);
        // // 跳躍
        // this.jump = new Jump(this, this.player, this.cursors);

        // 調整全局重力
        this.physics.world.gravity.y = 1200;
        // 控制
        this.cursors = this.input.keyboard.createCursorKeys();
        // 玩家控制邏輯
        this.playerController = new PlayerController(this, this.player, this.cursors);

        console.log('場景創建完成');
        this.isGameActive = true;
    }

    // 測試更新
    update() {
        if (!this.isGameActive) return;
        this.playerController.update();
        // // 時間邏輯
        // const now = this.time.now;
        // // 貼牆跳狀態
        // const onWallLeft = this.player.body.blocked.left || this.player.body.touching.left;
        // const onWallRight = this.player.body.blocked.right || this.player.body.touching.right;
        // const isTouchingWall = onWallLeft || onWallRight;
        // const isGrounded = this.player.body.touching.down;

        // // 是否處於牆滑狀態
        // const isFalling = this.player.body.velocity.y > 0;

        // // 衝刺
        // this.dash.update(now, isGrounded, isTouchingWall);
        // // 跳躍
        // this.jump.update(now, isGrounded, isTouchingWall, isFalling, onWallLeft);

        // // 左右移動
        // if (this.dash.isDashing || now < this.lockHorizontalUntil) {
        //     if (this.dash.isDashing) {
        //     } else {
        //         // 鎖定期間：維持跳開方向
        //         this.player.setVelocityX(300 * this.wallJumpDirection);
        //     }
        // } else {
        //     // 正常控制
        //     if (this.cursors.left.isDown) {
        //         this.player.setVelocityX(-225);
        //         this.player.flipX = true;
        //     } else if (this.cursors.right.isDown) {
        //         this.player.setVelocityX(225);
        //         this.player.flipX = false;
        //     } else {
        //         this.player.setVelocityX(0);
        //     }
        // }


    }
    
}
