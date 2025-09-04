import AttackConfig from "./AttackConfig.js";
import EffectManager from "./EffectManager.js";

export default class Attack {
    constructor(scene, player, input, enemyGroup, playerStatus, platformGroup) {
        this.scene = scene
        this.player = player
        this.input = input
        this.enemyGroup = enemyGroup; //攻擊敵人用的
        this.playerStatus = playerStatus;
        this.platformGroup = platformGroup;

        // 攻擊冷卻
        this.attackCooldown = AttackConfig.cooldown;

        this.attackDuration = AttackConfig.duration;
        // 攻擊時間紀錄
        this.lastAttackTime = 0;
        this.isAirAttacking = false;
        this.isGroundAttacking = false;
        this.isWallSlideAttacking = false;

        this.createHitboxes();
        this.bindInput();

        // 特效
        this.effect = new EffectManager(scene);
    }

    createHitboxes() {
        this.hitboxes = {};

        Object.entries(AttackConfig.hitboxes).forEach(([dir, cfg]) => {
            const hitbox = this.scene.add.rectangle(0, 0, cfg.width, cfg.height, 0xffffff, 0).setOrigin(0.5);
            this.scene.physics.add.existing(hitbox);

            hitbox.body.setSize(cfg.width, cfg.height);
            hitbox.body.setOffset(
                hitbox.width / 2 - cfg.width / 2,
                hitbox.height / 2 - cfg.height / 2
            );
            hitbox.body.allowGravity = false;
            hitbox.body.immovable = true;
            hitbox.body.enable = false;

            hitbox.setVisible(false);
            hitbox.setPosition(-9999, -9999);

            this.hitboxes[dir] = hitbox;
        });
    }

    bindInput() {
        this.attackKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    update() {

        Object.entries(this.hitboxes).forEach(([dir, hitbox]) => {
            if (dir !== this.activeHitboxDirection) {
                hitbox.body.enable = false;
                hitbox.body.checkCollision.none = true;
                hitbox.setVisible(false);
                hitbox.setFillStyle(0xffffff, 0);
                hitbox.setPosition(-9999, -9999);
            }
        });

        // 如果正在攻擊，更新 hitbox 位置並判斷是否結束
        if (this.activeHitboxDirection) {
            const now = this.scene.time.now;
            const hitbox = this.hitboxes[this.activeHitboxDirection];

            // 攻擊時間結束 → 移除 hitbox
            if (now - this.attackStartTime > this.attackDuration) {
                Object.values(this.hitboxes).forEach(hitbox => {
                    hitbox.body.enable = false;
                    hitbox.body.checkCollision.none = true;
                    hitbox.setVisible(false);
                });
                this.activeHitboxDirection = null;
                return;
            }

            // 攻擊期間 → 持續更新 hitbox 位置
            const offset = this.getOffset(this.activeHitboxDirection);
            hitbox.setPosition(this.player.x + offset.x, this.player.y + offset.y);
        }

        // 攻擊鍵按下 → 執行攻擊
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            const now = this.scene.time.now;
            if (now - this.lastAttackTime < this.attackCooldown) return;
            this.lastAttackTime = now;
            this.performAttack();
        }

    }

    performAttack() {

        Object.values(this.hitboxes).forEach(hitbox => {
            hitbox._hitThisAttack = false;
            hitbox.body.enable = false;
            hitbox.setFillStyle(0xffffff, 0);
            hitbox.setPosition(-9999, -9999);
        });

        const direction = this.getAttackDirection();
        const hitbox = this.hitboxes[direction];

        if (this.player.body.onFloor()) {
            this.player.anims.stop();
            this.player.play('player_attack', true);
            this.isGroundAttacking = true;

            this.scene.time.delayedCall(300, () => {
                this.isGroundAttacking = false;
            });
        } else {
            this.player.anims.stop();
            this.player.setTexture('player_air_attack');
            this.player.setFrame(0);
            this.isAirAttacking = true;

            this.scene.time.delayedCall(300, () => {
                this.isAirAttacking = false;
            });
        }
        if (
            this.playerStatus.isTouchingWall &&
            !this.player.body.onFloor()
        ) {
            this.player.play('player_wallSlide_attack', true);
            this.isWallSlideAttacking = true;

            this.scene.time.delayedCall(300, () => {
                this.isWallSlideAttacking = false;
            });
        }

        // 每次攻擊前清除所有敵人的命中標記
        this.enemyGroup.getChildren().forEach(enemy => {
            enemy._hitThisAttack = false;
        });

        if (!hitbox) return;

        // 設定hitbox位置
        const offset = this.getOffset(direction);
        hitbox.setPosition(this.player.x + offset.x, this.player.y + offset.y);
        this.effect.spawnParticles(hitbox.x, hitbox.y)

        // 啟用hitbox確保不受重力影響
        hitbox.body.enable = true;
        hitbox.body.reset(hitbox.x, hitbox.y);
        hitbox.body.checkCollision.none = false;
        hitbox.body.allowGravity = false; // 防止掉落
        hitbox.body.setVelocity(0, 0);     // 清除任何殘留速度
        hitbox.body.setImmovable(true);    // 不被其他物件推動

        // 顯示hitbox
        hitbox.setVisible(true);
        hitbox.setFillStyle(0xffffff, 0.3);

        this.activeHitboxDirection = direction;
        this.attackStartTime = this.scene.time.now;
        this.effect.spawnParticles(hitbox.x, hitbox.y);
        this.effect.spawnExplosionCircle(hitbox.x, hitbox.y, 60);

        this.scene.physics.overlap(
            hitbox,
            this.enemyGroup,
            (hb, enemy) => {
                console.log('⚔ 嘗試攻擊敵人：', enemy.constructor.name, enemy.x, enemy.y);

                const line = new Phaser.Geom.Line(hb.x, hb.y, enemy.x, enemy.y);

                // 判斷是否被平台遮擋
                const layer = this.scene.platformManager.getLayer();
                const tileBlocked = layer.getTilesWithinWorldXY(
                    Math.min(hb.x, enemy.x),
                    Math.min(hb.y, enemy.y),
                    Math.abs(hb.x - enemy.x),
                    Math.abs(hb.y - enemy.y)
                ).some(tile => tile.index !== -1);

                console.log('遮擋判斷結果：', tileBlocked);
                if (tileBlocked) return;

                // ✅ 檢查是否已命中過
                if (enemy._hitThisAttack) {
                    console.log('已命中過此敵人，跳過');
                    return;
                }

                // ✅ 標記為已命中
                enemy._hitThisAttack = true;
                console.log('💥 敵人受擊！執行 takeHit()');

                enemy.takeHit(this.player.x, this.activeHitboxDirection);

                if (
                    this.activeHitboxDirection === 'down' &&
                    !this.player.body.onFloor()
                ) {
                    this.player.setVelocityY(-400);
                    this.playerStatus.resetAirAbilities();
                }
            }
        );
    }

    getAttackDirection() {
        const status = this.playerStatus;

        // 牆跳鎖定期間 → 強制使用鎖定方向
        if (status.isWallJumpLocking && status.wallJumpLockDirection) {
            return status.wallJumpLockDirection === 'left' ? 'forwardLeft' : 'forwardRight';
        }

        if ((status.onWallLeft || status.onWallRight) && !this.player.body.onFloor()) {
            return status.onWallLeft ? 'forwardRight' : 'forwardLeft';
        }

        if (this.input.up.isDown) return 'up';
        if (this.input.down.isDown) return 'down';

        return 'forward';
    }

    getOffset(direction) {
        const velocityX = this.player.body?.velocity?.x || 0;
        const velocityY = this.player.body?.velocity?.y || 0;
        const facing = this.player.flipX ? -1 : 1;
        const speedComp = Math.min(Math.abs(velocityX) * 0.1, 20); // 最多補 20px
        const speedCompY = Math.min(Math.abs(velocityY) * 0.1, 20);

        const cfg = AttackConfig.hitboxes[direction];
        if (!cfg) return { x: 0, y: 0 };

        let x = cfg.offsetX;
        let y = cfg.offsetY;
        x *= facing;

        // 根據方向加速度補償
        if (direction === 'forward') {
            x += facing * speedComp;
        } else if (direction === 'up') {
            x += velocityX * 0.05;
            y -= speedCompY;
        } else if (direction === 'down') {
            x += velocityX * 0.05;
            y += speedCompY;
        } else if (direction === 'forwardLeft') {
            x = -Math.abs(cfg.offsetX);
        } else if (direction === 'forwardRight') {
            x = Math.abs(cfg.offsetX);
        }
        return { x, y };
    }

    updateAnimation() {
        if (this.isWallSlideAttacking) {
            const currentAnim = this.player.anims.currentAnim?.key;
            if (currentAnim !== 'player_wallSlide_attack') {
                this.player.play('player_wallSlide_attack', true);
                // console.log('[攻擊] 播放牆滑攻擊動畫');
            }
        }
        if (this.isGroundAttacking) {
            const currentAnim = this.player.anims.currentAnim?.key;
            if (currentAnim !== 'player_attack') {
                this.player.play('player_attack', true);
                // console.log('[攻擊] 播放地面攻擊動畫');
            }
        }
    }

}