export default class PlayerDeathManager {
    constructor(scene, player, playerStatus, jump, dash) {
        this.scene = scene;
        this.player = player;
        this.playerStatus = playerStatus;
        this.jump = jump;
        this.dash = dash;

        // 從 GameScene 或 PlatformManager 傳入死亡區域
        this.deathZones = scene.deathZones || [];
    }

    checkDeathZone() {
        if (!this.deathZones || this.playerStatus?.isDead) {
            console.log('跳過死亡判定：死亡區未定義或玩家已死亡');
            return false;
        }

        const px = this.player.x;
        const py = this.player.y;

        const inDeathZone = this.deathZones.some(zone =>
            Phaser.Geom.Rectangle.Contains(zone, px, py)
        );

        if (inDeathZone) {
            console.log(`進入死亡區域：(${px}, ${py})`);
        }

        const worldBounds = this.scene.physics.world.bounds;
        const outOfWorld = (
            px < worldBounds.x ||
            px > worldBounds.x + worldBounds.width ||
            py < worldBounds.y ||
            py > worldBounds.y + worldBounds.height
        );

        if (outOfWorld) {
            console.log(`超出世界邊界：(${px}, ${py})`);
            console.log('世界邊界：', worldBounds);
        }

        return inDeathZone || outOfWorld;
    }

    triggerDeath() {
        this.playerStatus.isDead = true;
        this.scene.cameras.main.stopFollow();
        this.player.setVelocity(0, 0);
        this.player.setTint(0xff0000);

        this.scene.time.delayedCall(1000, () => {
            this.respawn();
        });
    }

    respawn() {
        this.player.clearTint();
        this.player.setPosition(100, 1040); // 起始點或儲存點
        this.player.setVelocity(0, 0);
        this.scene.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.playerStatus.isDead = false;

        // 重置跳躍與衝刺資源
        this.jump.doubleJumpsRemaining = this.jump.maxDoubleJumps;
        this.jump.canJump = true;
        this.jump.isJumping = false;
        this.jump.isWallJumping = false;
        this.dash.canDash = true;
    }
}