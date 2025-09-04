export default class PlayerAnimationHandler {
    constructor(scene, player, cursors, status, dash, jump, attack, getLockUntil) {
        this.scene = scene;
        this.player = player;
        this.cursors = cursors;
        this.status = status;
        this.dash = dash;
        this.jump = jump;
        this.attack = attack;
        this.getLockUntil = getLockUntil;

        this.justLandedAt = 0;
        this.wasGrounded = false;
    }

    updateJumpFrames() {
        const justLanded = !this.wasGrounded && this.status.isGrounded;
        this.wasGrounded = this.status.isGrounded;
        const landedTooLong = this.scene.time.now - this.justLandedAt > 200;
        const isStillOnLandingFrame = this.player.texture.key === 'player_jump' && this.player.frame.name === 0;
        if (this.attack.isAirAttacking) return true;

        if (this.jump.isDoubleJumping) {
            if (this.player.anims.currentAnim?.key !== 'player_double_jump') {
                this.player.play('player_double_jump', true);
            }
            return true;
        }

        if (justLanded) {
            this.player.anims.stop();
            this.player.setTexture('player_jump');
            this.player.setFrame(0);
            this.justLandedAt = this.scene.time.now;
            return true;
        }

        if (!this.status.isGrounded) {
            this.player.anims.stop();
            this.player.setTexture('player_jump');

            const vy = this.player.body.velocity.y;

            if (vy < -200) {
                this.player.setFrame(1);
            } else if (vy > 200) {
                this.player.setFrame(3);
            } else {
                if (
                    this.status.isTouchingWall &&
                    this.status.isFalling &&
                    !this.dash.isDashing &&
                    this.scene.time.now >= this.getLockUntil()
                ) {
                    this.player.setTexture('player_wallSlide');
                    this.player.setFrame(0);
                } else {
                    this.player.setFrame(2);
                }
            }

            return true;
        }

        if (landedTooLong && isStillOnLandingFrame && this.status.isGrounded) {
            const isMoving = this.cursors.left.isDown || this.cursors.right.isDown;
            const targetAnim = isMoving ? 'player_walk' : 'player_idle';
            this.player.play(targetAnim, true);
            return true;
        }

        return false;
    }

    handleDoubleJumpEnd() {
        if (!this.status.isGrounded) {
            this.player.setTexture('player_jump');
            this.player.setFrame(2);
            this.jump.isDoubleJumping = false;
        }
    }

    handleGroundAttackEnd() {
        if (this.status.isGrounded) {
            const isMoving = this.cursors.left.isDown || this.cursors.right.isDown;
            const targetAnim = isMoving ? 'player_walk' : 'player_idle';
            this.player.play(targetAnim, true);
            // console.log('[動畫完成] 地面攻擊結束，切回', targetAnim);
        }
    }

    handleWallAttackEnd() {
        if (!this.status.isGrounded && this.status.isTouchingWall) {
            this.player.setTexture('player_wallSlide');
            this.player.setFrame(0);
            // console.log('[動畫完成] 牆滑攻擊結束，切回 wallSlide');
        }
    }
}