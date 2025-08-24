export default class Dash {
    constructor(scene, player, cursors) {
        this.scene = scene;
        this.player = player;
        this.cursors = cursors;

        // 衝刺功能
        this.isDashing = false;
        this.dashDuration = 250;
        this.dashSpeed = 600;
        this.dashCooldown = 500;
        this.lastDashTime = 0;

        // 空中衝刺限制：一次
        this.maxAirDashes = 1;
        this.airDashesRemaining = this.maxAirDashes;

        // 暫時設定衝刺鍵為K(之後可在Setting裡面改)
        this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    }

    update(now, isGrounded, isTouchingWall) {
        if (isGrounded || isTouchingWall) {
            this.airDashesRemaining = this.maxAirDashes;
        }

        const canDashNow =
            Phaser.Input.Keyboard.JustDown(this.dashKey) &&
            !this.isDashing &&
            now > this.lastDashTime + this.dashCooldown &&
            this.airDashesRemaining > 0;

        if (canDashNow) {
            this.airDashesRemaining--;
            this.startDash(now, isGrounded);
        }

    }

    // 衝刺功能
    startDash(now, isGrounded) {
        this.isDashing = true;
        this.lastDashTime = now;
        this.player.body.allowGravity = false;
        this.player.setMaxVelocity(600, 600);

        // 空中衝刺扣次
        if (!isGrounded) {
            this.airDashesRemaining--;
        }

        // 判斷衝刺方向（根據左右鍵）
        let dashDirection = 0;
        if (this.cursors.left.isDown) dashDirection = -1;
        else if (this.cursors.right.isDown) dashDirection = 1;
        if (dashDirection === 0) dashDirection = this.player.flipX ? -1 : 1; // 沒按方向鍵就用角色朝向

        this.player.setVelocityX(this.dashSpeed * dashDirection);
        this.player.setVelocityY(0); // 可選：空中衝刺時鎖定垂直速度

        // 衝刺期間鎖定輸入
        this.inputLockUntil = now + this.dashDuration;

        // 結束衝刺
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setMaxVelocity(300, 600);
        });

        console.log(`Dash triggered: ${dashDirection > 0 ? '→' : '←'}`);
    }

    isInputLocked(now) {
        return this.isDashing || now < this.inputLockUntil;
    }

}