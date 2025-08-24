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

        // 控制
        this.cursors = this.input.keyboard.createCursorKeys();

        // 調整全局重力
        this.physics.world.gravity.y = 1200;

        // 跳躍狀態初始化
        this.isJumping = false;
        this.jumpStartTime = 0; //跳躍時間紀錄
        this.maxJumpDuration = 350; // 最長跳躍時間（毫秒）
        this.jumpVelocity = -350;   // 每幀施加的跳躍速度
        this.player.setMaxVelocity(300, 600); //最大Y速度
        this.canJump = true; // 是否允許跳躍（需釋放後才能再次跳
        this.canWallJump = false; //是否允許牆跳，先初始化

        // 牆跳的判斷式
        // 是否跳牆，初始化
        this.isWallJumping = false;
        // 紀錄跳牆時間
        this.wallJumpStartTime = 0;
        // 跳牆冷卻
        this.wallJumpDirection = 0;
        // 牆跳時鎖定方向鍵
        this.lockHorizontalUntil = 0;

        // 牆滑設置
        this.isWallSliding = false;
        this.wallSlideSpeed = 120; //下滑速度

        console.log('場景創建完成');
        this.isGameActive = true;
    }

    // 測試更新
    update() {
        if (!this.isGameActive) return;

        // 跳躍邏輯
        const now = this.time.now;
        // 貼牆跳狀態
        const onWallLeft = this.player.body.blocked.left || this.player.body.touching.left;
        const onWallRight = this.player.body.blocked.right || this.player.body.touching.right;
        const isTouchingWall = onWallLeft || onWallRight;
        const isGrounded = this.player.body.touching.down;

        // 是否處於牆滑狀態
        const isFalling = this.player.body.velocity.y > 0;

        this.isWallSliding = (
            isTouchingWall &&
            !isGrounded &&
            isFalling &&
            !this.isWallJumping
        );

        if (this.isWallSliding) {
            if (this.player.body.velocity.y > this.wallSlideSpeed) {
                this.player.setVelocityY(this.wallSlideSpeed); // 緩慢下墜
            }
        }


        // 允許牆跳
        if (isTouchingWall && !this.canWallJump) {
            this.canWallJump = true;
        }

        // 左右移動
        if (now < this.lockHorizontalUntil) {
            // 鎖定期間：維持跳開方向
            this.player.setVelocityX(300 * this.wallJumpDirection);
        } else {
            // 正常控制
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-200);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(200);
            } else {
                this.player.setVelocityX(0);
            }
        }

        // 跳躍相關的功能
        if (this.cursors.up.isDown &&
            this.player.body.touching.down &&
            !this.isJumping &&
            this.canJump
        ) {
            this.isJumping = true;
            this.jumpStartTime = now;
            const currentX = this.player.body.velocity.x;
            this.player.setVelocity(currentX, this.jumpVelocity);
            this.canJump = false;
        }

        // 使用 easeOutQuad 模擬跳躍曲線
        if (this.isJumping) {
            const jumpElapsed = now - this.jumpStartTime;
            const progress = Phaser.Math.Clamp(jumpElapsed / this.maxJumpDuration, 0, 1);

            const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
            const easedProgress = easeOutQuad(progress);

            const jumpForce = Phaser.Math.Linear(this.jumpVelocity * 0.5, this.jumpVelocity * 1.2, easedProgress);

            if (this.cursors.up.isDown && jumpElapsed < this.maxJumpDuration) {
                const currentX = this.player.body.velocity.x;
                this.player.setVelocity(currentX, jumpForce); // 保持水平速度
            } else {
                this.isJumping = false;
            }
        }

        // 牆跳狀態判斷
        if ( //條件
            this.cursors.up.isDown &&
            !this.wasJumpKeyDown &&
            !isGrounded &&
            isTouchingWall &&
            !this.isWallJumping
        ) { //執行
            this.isWallJumping = true;
            this.wallJumpStartTime = now;
            this.lockHorizontalUntil = now + 200;
            this.canWallJump = false;

            const jumpDirection = onWallLeft ? 1 : -1;
            this.wallJumpDirection = jumpDirection;

            this.player.setVelocityX(100 * jumpDirection); // 水平跳開
            this.player.setVelocityY(this.jumpVelocity);   // 垂直跳躍

            return; // 跳牆時不進入地面跳邏輯
        }
        // 牆跳邏輯
        if (this.isWallJumping) {
            const jumpElapsed = now - this.wallJumpStartTime;
            const progress = Phaser.Math.Clamp(jumpElapsed / this.maxJumpDuration, 0, 1);
            const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
            const easedProgress = easeOutQuad(progress);
            const jumpForce = Phaser.Math.Linear(this.jumpVelocity * 0.5, this.jumpVelocity * 1.2, easedProgress);

            if (this.cursors.up.isDown && jumpElapsed < this.maxJumpDuration) {
                const currentX = this.player.body.velocity.x;
                this.player.setVelocity(currentX, jumpForce);
            } else {
                this.isWallJumping = false;
            }
        }

        if (!isTouchingWall) {
            this.canWallJump = false;
        }

        if (!isTouchingWall || isGrounded) {
            this.isWallSliding = false;
        }

        this.wasJumpKeyDown = this.cursors.up.isDown;

        if (!this.cursors.up.isDown && this.player.body.touching.down && !this.isJumping) {
            this.canJump = true;
            this.isWallJumping = false;
        }

    }
}
