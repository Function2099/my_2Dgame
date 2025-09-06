export default class Dash {
    constructor(scene, player, inputs, playerStatus) {
        this.scene = scene;
        this.player = player;
        this.inputs = inputs;
        this.playerStatus = playerStatus;

        // 衝刺功能
        this.isDashing = false;
        this.dashDuration = 250;
        this.dashSpeed = 600;
        this.dashCooldown = 500;
        this.lastDashTime = 0;
        this.inputLockUntil = 0;

        // 空中衝刺限制：一次
        this.maxAirDashes = 1;
        this.airDashesRemaining = this.maxAirDashes;

    }

    update(now, isGrounded, isTouchingWall) {
        const dashKey = this.inputs.dash;
        if (isGrounded || isTouchingWall) {
            this.airDashesRemaining = this.maxAirDashes;
        }

        const canDashNow =
            Phaser.Input.Keyboard.JustDown(dashKey) &&
            !this.isDashing &&
            now > this.lastDashTime + this.dashCooldown &&
            this.airDashesRemaining > 0;

        if (canDashNow) {
            this.startDash(now, isGrounded);
        }

    }

    // 衝刺功能
    startDash(now, isGrounded) {
        this.playerStatus.isDashing = true;
        this.lastDashTime = now;
        this.player.body.allowGravity = false;
        this.player.setMaxVelocity(600, 600);
        this.isDashing = true;

        // 空中衝刺扣次
        if (!isGrounded) {
            this.airDashesRemaining--;
        }

        // 判斷衝刺方向（根據左右鍵）
        let dashDirection = 0;
        if (this.inputs.moveLeft.isDown) dashDirection = -1;
        else if (this.inputs.moveRight.isDown) dashDirection = 1;
        if (dashDirection === 0) dashDirection = this.player.flipX ? -1 : 1; // 沒按方向鍵就用角色朝向

        this.player.play('player_dash', true);

        // 強制鎖定垂直速度
        this.player.setAccelerationY(0);
        this.player.setVelocityY(0);

        // 
        this.player.setVelocityX(this.dashSpeed * dashDirection);

        this.scene.effectManager.spawnDashTrail(this.player.x, this.player.y, dashDirection);

        // 衝刺期間鎖定輸入
        this.inputLockUntil = now + this.dashDuration;

        // 結束衝刺
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.playerStatus.isDashing = false;
            this.isDashing = false;
            this.player.body.allowGravity = true;
            this.player.setMaxVelocity(300, 600);
        });

        // 在網頁端的開發者模式中(F12)查看是否觸發
        // console.log(`Dash triggered: ${dashDirection > 0 ? '→' : '←'}`);
    }

    isInputLocked(now) {
        return this.isDashing || now < this.inputLockUntil;
    }

}