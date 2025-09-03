export default class Jump {
    constructor(scene, player, cursors, playerStatus) {
        this.scene = scene;
        this.player = player;
        this.cursors = cursors;
        this.playerStatus = playerStatus;

        // 普通跳
        this.isJumping = false; // 跳躍狀態初始化
        this.jumpStartTime = 0; // 跳躍時間紀錄
        this.maxJumpDuration = 350; // 最長跳躍時間（毫秒）
        this.jumpVelocity = -350;   // 每幀施加的跳躍速度
        this.canJump = true; // 是否允許跳躍（需釋放後才能再次跳

        // 牆跳
        this.isWallJumping = false; // 跳牆狀態初始化
        this.wallJumpStartTime = 0; // 紀錄跳牆時間
        this.wallJumpDirection = 0; // 跳牆方向
        this.lockHorizontalUntil = 0; // 牆跳時鎖定方向鍵
        this.canWallJump = false; //是否允許牆跳，先初始化

        // 牆滑
        this.isWallSliding = false;
        this.wallSlideSpeed = 120; //下滑速度

        // 只能跳躍一次
        this.wasJumpKeyDown = false;

        this.player.setMaxVelocity(300, 600); //最大Y速度

        // 二段跳
        this.maxDoubleJumps = 1;
        this.doubleJumpsRemaining = this.maxDoubleJumps;
        this.doubleJumpVelocity = this.jumpVelocity * 1.5; // 高度是大跳的一半

    }

    update(now, isGrounded, isTouchingWall, isFalling, onWallLeft) {
        // 牆滑邏輯
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

        // 跳躍相關的功能
        if (this.cursors.up.isDown &&
            this.player.body.blocked.down &&
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
            // console.log('Jump.js 設定前 playerStatus:', this.playerStatus);

            if (this.playerStatus) {
                this.playerStatus.isWallJumpLocking = true;
                this.playerStatus.wallJumpLockDirection = onWallLeft ? 'right' : 'left';
                this.playerStatus.wallJumpDirection = onWallLeft ? 1 : -1;
                this.playerStatus.justWallJumped = true;

                this.scene.time.delayedCall(450, () => {
                    this.playerStatus.isWallJumpLocking = false;
                    this.playerStatus.wallJumpLockDirection = null;
                    this.playerStatus.justWallJumped = false;
                });
            }

            this.isWallJumping = true;
            this.wallJumpStartTime = now;
            this.lockHorizontalUntil = now + 200;
            this.canWallJump = false;

            const jumpDirection = onWallLeft ? 1 : -1;
            this.wallJumpDirection = jumpDirection;

            this.player.setVelocityX(100 * jumpDirection); // 水平跳開
            this.player.setVelocityY(this.jumpVelocity);   // 垂直跳躍

            this.scene.lockHorizontalUntil = this.lockHorizontalUntil;
            this.scene.wallJumpDirection = this.wallJumpDirection;

            return;
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

        // 二段跳邏輯
        if (
            this.cursors.up.isDown &&
            !this.wasJumpKeyDown &&
            !isGrounded &&
            !this.isWallJumping &&
            !this.isJumping &&
            this.doubleJumpsRemaining > 0
        ) {
            this.doubleJumpsRemaining--;
            this.player.setVelocityY(this.doubleJumpVelocity);
            this.isJumping = false;
            // console.log('Double Jump!');
        }


        if (!isTouchingWall) {
            this.canWallJump = false;
        }

        if (!isTouchingWall || isGrounded) {
            this.isWallSliding = false;
        }

        this.wasJumpKeyDown = this.cursors.up.isDown;

        // 落地判斷
        if (!this.wasJumpKeyDown &&
            this.player.body.blocked.down
        ) {
            this.canJump = true;
            this.isWallJumping = false;
            this.doubleJumpsRemaining = this.maxDoubleJumps;
        }

        // console.log('🟢 落地判斷：', {
        //     upReleased: !this.cursors.up.isDown,
        //     blockedDown: this.player.body.blocked.down,
        //     isJumping: this.isJumping
        // });

    }
}