import SaveManager from './SaveManager.js';

export default class PlayerDeathManager {
    constructor(scene, player, playerStatus, jump, dash) {
        this.scene = scene;
        this.player = player;
        this.playerStatus = playerStatus;
        this.jump = jump;
        this.dash = dash;

        this.deathZones = scene.deathZones || [];
    }

    checkDeathZone() {
        if (!this.deathZones || this.playerStatus?.isDead) return false;

        const px = this.player.x;
        const py = this.player.y;

        const inDeathZone = this.deathZones.some(zone =>
            Phaser.Geom.Rectangle.Contains(zone, px, py)
        );

        const worldBounds = this.scene.physics.world.bounds;
        const outOfWorld = (
            px < worldBounds.x ||
            px > worldBounds.x + worldBounds.width ||
            py < worldBounds.y ||
            py > worldBounds.y + worldBounds.height
        );

        return inDeathZone || outOfWorld;
    }

    triggerDeath() {
        this.playerStatus.isDead = true;
        this.scene.cameras.main.stopFollow();
        this.player.setVelocity(0, 0);
        this.player.setTint(0xff0000);
        this.player.setVisible(false);
        this.player.setActive(false);

        this.spawnDeathParticles(this.player.x, this.player.y);
        this.fadeInBlackout();

        // 延遲 3 秒後復活
        this.scene.time.delayedCall(1000, () => {
            this.respawn();
            this.fadeOutBlackout();
        });
    }

    respawn() {
        this.player.clearTint();

        const saved = SaveManager.load();
        if (saved?.position) {
            this.player.setPosition(saved.position.x, saved.position.y);
            console.log(`[PlayerDeathManager] 復活於儲存點 ${saved.savePointId}`);
        } else {
            this.player.setPosition(100, 1040); // 預設起始點
            console.warn('[PlayerDeathManager] 無儲存資料，使用預設復活點');
        }

        this.scene.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.player.setVelocity(0, 0);
        this.playerStatus.isDead = false;

        this.restoreFullState();
    }

    restoreFullState() {
        this.player.setActive(true);
        this.player.setVisible(true);
        this.player.clearTint();
        this.player.setVelocity(0, 0);

        this.playerStatus.hp = this.playerStatus.maxHp || 15;
        if (this.scene.playerHealthBar) {
            this.scene.playerHealthBar.setHP(this.playerStatus.hp);
        }

        this.jump.doubleJumpsRemaining = this.jump.maxDoubleJumps;
        this.jump.canJump = true;
        this.jump.isJumping = false;
        this.jump.isWallJumping = false;

        this.dash.canDash = true;
    }

    spawnDeathParticles(x, y) {
        if (!this.scene.particleSystem) return;

        this.scene.particleSystem.emitParticleAt(x, y);
    }

    fadeInBlackout() {
        this.blackout = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(999)
            .setAlpha(0);

        this.scene.tweens.add({
            targets: this.blackout,
            alpha: 1,
            duration: 500
        });
    }

    fadeOutBlackout() {
        if (!this.blackout) return;

        this.scene.tweens.add({
            targets: this.blackout,
            alpha: 0,
            duration: 500,
            onComplete: () => this.blackout.destroy()
        });
    }
}