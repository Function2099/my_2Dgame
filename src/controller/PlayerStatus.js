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

}