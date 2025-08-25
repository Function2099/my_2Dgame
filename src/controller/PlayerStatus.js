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

}