import Dash from "./Dash.js";
import Jump from "./Jump.js";
import Move from "./Move.js";
import PlayerStatus from "./PlayerStatus.js";
import Attack from "./combat/attack.js";
import { updatePlayerAnimation } from "../animation/AnimationManager.js";
import PlayerDeathManager from "./PlayerDeathManager.js";
import PlayerAnimationHandler from "./PlayerAnimationHandler.js";

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
        // 移動
        this.move = new Move(this.player, this.cursors, this.status, this.dash, () => this.lockHorizontalUntil, () => this.wallJumpDirection);
        // 攻擊
        this.attack = new Attack(this.scene, this.player, this.cursors, this.enemyGroup, this.status, this.platformManager.getGroup());
        // 死亡
        this.deathManager = new PlayerDeathManager(this.scene, this.player, this.status, this.jump, this.dash);
        this.animHandler = new PlayerAnimationHandler( this.scene, this.player, this.cursors, this.status, this.dash, this.jump, this.attack, () => this.lockHorizontalUntil);

        this.player.on('animationcomplete-player_double_jump', this.animHandler.handleDoubleJumpEnd.bind(this.animHandler));
        this.player.on('animationcomplete-player_attack', this.animHandler.handleGroundAttackEnd.bind(this.animHandler));
        this.player.on('animationcomplete-player_wallSlide_attack', this.animHandler.handleWallAttackEnd.bind(this.animHandler));
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

        const jumpedFrameHandled = this.animHandler.updateJumpFrames();
        const landedRecently = this.scene.time.now - this.justLandedAt < 200;

        if (!jumpedFrameHandled && !landedRecently) {
            updatePlayerAnimation(this.player, this.cursors, this.status);
        }
        this.attack.updateAnimation();

        // 更新行為模組
        this.dash.update(now, isGrounded, isTouchingWall);
        this.jump.update(now, isGrounded, isTouchingWall, isFalling, onWallLeft);

        // 從 Jump 模組同步牆跳鎖定資訊
        this.lockHorizontalUntil = this.jump.lockHorizontalUntil;
        this.wallJumpDirection = this.jump.wallJumpDirection;

        // 左右移動邏輯
        this.move.update(now);

        const currentAnim = this.player.anims.currentAnim?.key;
        const isMoving = this.cursors.left.isDown || this.cursors.right.isDown;
        const targetAnim = isMoving ? 'player_walk' : 'player_idle';

        // 在地面時播放 idle / walk
        if (
            !this.attack.isGroundAttacking &&
            this.status.isGrounded &&
            currentAnim !== targetAnim &&
            currentAnim !== 'player_attack'
        ) {
            this.player.play(targetAnim, true);
        }

        // 顯示邏輯框
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
}