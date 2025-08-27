import Dash from "./Dash.js";
import Jump from "./Jump.js";
import PlayerStatus from "./PlayerStatus.js";
import Attack from "./combat/attack.js";

export default class PlayerController {
    constructor(scene, player, cursors, enemyGroup, platformManager) {
        this.scene = scene;
        this.player = player;
        this.cursors = cursors;
        this.enemyGroup = enemyGroup;
        this.platformManager = platformManager;

        // 玩家狀態
        this.status = new PlayerStatus(player, scene);
        // 衝刺
        this.dash = new Dash(this.scene, this.player, this.cursors);
        this.status.setDashModule(this.dash);

        // 跳躍
        this.jump = new Jump(this.scene, this.player, this.cursors, this.status);
        this.status.setJumpModule(this.jump);

        // 攻擊
        this.attack = new Attack(this.scene, this.player, this.cursors, this.enemyGroup, this.status, this.platformManager.getGroup());

        // 牆跳鎖定控制（由 Jump 模組更新後同步）
        this.lockHorizontalUntil = 0;
        this.wallJumpDirection = 1;
    }

    update() {
        if (!this.scene.isGameActive) return;
        // 更新玩家狀態
        this.status.update();
        // 玩家攻擊狀態
        this.attack.update();

        // 左右移動邏輯
        const now = this.status.now;
        const { isGrounded, isTouchingWall, isFalling, onWallLeft } = this.status;

        // 更新行為模組
        this.dash.update(now, isGrounded, isTouchingWall);
        this.jump.update(now, isGrounded, isTouchingWall, isFalling, onWallLeft);

        // 從 Jump 模組同步牆跳鎖定資訊
        this.lockHorizontalUntil = this.jump.lockHorizontalUntil;
        this.wallJumpDirection = this.jump.wallJumpDirection;

        // 左右移動邏輯
        if (this.dash.isDashing || now < this.lockHorizontalUntil) {
            if (!this.dash.isDashing) {
                this.player.setVelocityX(300 * this.wallJumpDirection);
            }
        } else {
            if (this.status.isKnockbacking) return;
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