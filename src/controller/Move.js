export default class Move {
    constructor(player, cursors, status, dash, lockHorizontalUntilRef, wallJumpDirectionRef) {
        this.player = player;
        this.cursors = cursors;
        this.status = status;
        this.dash = dash;
        this.lockHorizontalUntilRef = lockHorizontalUntilRef;
        this.wallJumpDirectionRef = wallJumpDirectionRef;
    }

    update(now) {
        const lockUntil = this.lockHorizontalUntilRef();
        const wallDir = this.wallJumpDirectionRef();

        if (this.dash?.isDashing || now < lockUntil) {
            if (!this.dash?.isDashing) {
                this.player.setVelocityX(300 * wallDir);
            }
        } else {
            if (this.status?.isKnockbacking) return;
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-225);
                this.player.flipX = true;
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(225);
                this.player.flipX = false;
            } else {
                this.player.setVelocityX(0);
            }
        }
    }
}