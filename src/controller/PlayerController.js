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

        // 玩家大小
        this.player.setSize(38, 132);
        this.player.setDepth(10);
        // this.player.setOrigin((0.714), 1);

        // this.physics.world.drawDebug = true;
        // this.physics.world.debugGraphic.clear();

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
                if (this.player.flipX) {
            this.player.setOffset(4, 0); // 翻轉時往左偏移
        } else {
            this.player.setOffset(40, 0); // 正常時往右偏移
        }

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

        const currentAnim = this.player.anims.currentAnim?.key;
        if (currentAnim !== 'player_idle') {
            this.player.play('player_idle', true);
        }

        if (!this.debugGfx) {
            this.debugGfx = this.scene.add.graphics();
        }
        this.debugGfx.clear();

        this.debugGfx.lineStyle(2, 0xff00ff, 1); // 紫色框框
        const bounds = this.player.getBounds();
        this.debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        const body = this.player.body;

        this.debugGfx.lineStyle(2, 0x00ffff, 1); // 藍色框框
        this.debugGfx.strokeRect(body.x, body.y, body.width, body.height);


    }

    updateHitboxOffset() {
    const offsetX = this.player.flipX ? 4 : 40;
    this.player.setOffset(offsetX, 0);
}

}