export default class PlayerStatus {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;

        // 初始化屬性
        this.now = 0;
        this.onWallLeft = false;
        this.onWallRight = false;
        this.isTouchingWall = false;
        this.isGrounded = false;
        this.isFalling = false;
        this.isWallJumpLocking = false;
        this.wallJumpLockDirection = null;
        this.isKnockbacking = false;
    }
    update() {
        const body = this.player.body;
        // 時間邏輯
        this.now = this.scene.time.now;
        // 貼牆跳狀態
        this.onWallLeft = body.blocked.left || body.touching.left;
        this.onWallRight = body.blocked.right || body.touching.right;
        this.isTouchingWall = this.onWallLeft || this.onWallRight;
        this.isGrounded = body.blocked.down || body.touching.down;
        // 是否處於牆滑狀態
        this.isFalling = body.velocity.y > 0;
    }

    setJumpModule(jump) {
        this.jumpModule = jump;
    }

    setDashModule(dash) {
        this.dashModule = dash;
    }

    // 空中狀態
    resetAirAbilities() {
        if (this.jumpModule) {
            this.jumpModule.doubleJumpsRemaining = this.jumpModule.maxDoubleJumps;
            // console.log('強制重置跳:', this.jumpModule.doubleJumpsRemaining);
        }
        if (this.dashModule) {
            this.dashModule.airDashesRemaining = this.dashModule.maxAirDashes;
            // console.log('強制重置衝:', this.dashModule.airDashesRemaining);
        }
    }

    // 受攻擊狀態
    takeHit(fromX = null, direction = null, damage = 1, options = {}) {
        if (this.isInvincible || this.isKnockbacking) return; // 暫停玩家控制
        this.player.setMaxVelocity(9999, 9999);

        // this.hp -= 1;剩餘 HP：${this.hp}
        this.isInvincible = true;
        this.isKnockbacking = true;

        const knockbackX = fromX !== null ? (this.player.x < fromX ? -1 : 1) : 0;
        const forceX = options.knockbackX ?? 400;
        const forceY = options.knockbackY ?? -250;

        const duration = options.knockbackDuration ?? 300;


        this.player.setDragX(0);
        this.player.setVelocity(forceX * knockbackX, forceY);
        // console.log('knockback:', forceX, forceY);

        // 被擊退的時間
        this.scene.time.delayedCall(duration, () => {
            this.isKnockbacking = false;
            this.player.setMaxVelocity(300, 600);
        });

        // console.log('[PlayerStatus] 玩家受傷！來自位置:', fromX);

        // 無敵時間
        this.scene.time.delayedCall(1200, () => {
            this.isInvincible = false;
            this.player.clearTint();
        });

        // console.log(`玩家受擊！`);

        if (this.hp <= 0) {
            this.player.setVelocity(0, 0);
            this.player.setTint(0x000000);
            this.player.setActive(false);
            this.player.setVisible(false);
            console.log('玩家死亡');
        }
    }

}