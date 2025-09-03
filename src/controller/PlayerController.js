import Dash from "./Dash.js";
import Jump from "./Jump.js";
import PlayerStatus from "./PlayerStatus.js";
import Attack from "./combat/attack.js";
import { updatePlayerAnimation } from "../animation/AnimationManager.js";
import PlayerDeathManager from "./PlayerDeathManager.js";

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
        // 玩家狀態
        this.status = new PlayerStatus(player, scene);
        // 衝刺
        this.dash = new Dash(this.scene, this.player, this.cursors, this.status);
        this.status.setDashModule(this.dash);
        // 跳躍
        this.jump = new Jump(this.scene, this.player, this.cursors, this.status);
        this.status.setJumpModule(this.jump);
        this.justLandedAt = 0;
        // 攻擊
        this.attack = new Attack(this.scene, this.player, this.cursors, this.enemyGroup, this.status, this.platformManager.getGroup());
        // 牆跳鎖定控制（由 Jump 模組更新後同步）
        this.lockHorizontalUntil = 0;
        this.wallJumpDirection = 1;
        // 死亡
        this.deathManager = new PlayerDeathManager(this.scene, this.player, this.status, this.jump, this.dash);
    }

    update() {
        if (!this.scene.isGameActive) return;

        // 死亡判定
        if (this.deathManager.checkDeathZone()) {
            this.deathManager.triggerDeath();
            return;
        }

        // 更新玩家狀態
        this.status.update();
        // 玩家攻擊狀態
        this.attack.update();

        // 玩家面相
        const now = this.status.now;
        const { isGrounded, isTouchingWall, isFalling, onWallLeft } = this.status;

        const jumpedFrameHandled = this.updateJumpFrames();
        const landedRecently = this.scene.time.now - this.justLandedAt < 200;

        if (!jumpedFrameHandled && !landedRecently) {
            updatePlayerAnimation(this.player, this.cursors, this.status);
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
        const isMoving = this.cursors.left.isDown || this.cursors.right.isDown;
        const targetAnim = isMoving ? 'player_walk' : 'player_idle';

        if (currentAnim !== targetAnim) {
            this.player.play(targetAnim, true);
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

    updateJumpFrames() {
        const justLanded = !this.wasGrounded && this.status.isGrounded;
        this.wasGrounded = this.status.isGrounded;
        const landedTooLong = this.scene.time.now - this.justLandedAt > 200;
        const isStillOnLandingFrame = this.player.texture.key === 'player_jump' && this.player.frame.name === 0;
        if (this.attack.isAirAttacking) return true;

        if (justLanded) {
            this.player.anims.stop();
            this.player.setTexture('player_jump');
            this.player.setFrame(0); // 落地幀
            this.justLandedAt = this.scene.time.now; // 記錄落地時間
            return true;
        }

        if (!this.status.isGrounded) {
            this.player.anims.stop();
            this.player.setTexture('player_jump');

            const vy = this.player.body.velocity.y;

            if (vy < -200) {
                this.player.setFrame(1); // 上升中（frame 2）
            } else if (vy > 200) {
                this.player.setFrame(3); // 下落（frame 3）
            } else {
                this.player.setFrame(2); // 到頂也用 frame 2（或你可以設 frame 5）
            }

            return true;
        }

        if (landedTooLong && isStillOnLandingFrame && this.status.isGrounded) {
            const isMoving = this.cursors.left.isDown || this.cursors.right.isDown;
            const targetAnim = isMoving ? 'player_walk' : 'player_idle';

            this.player.setTexture(targetAnim); // 切換貼圖
            this.player.play(targetAnim, true); // 播放動畫
            // console.log('落地自動結束');
            return true;
        }

        return false;
    }

}