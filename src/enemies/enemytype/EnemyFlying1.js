import EnemyBase from '../EnemyBase.js';

export default class EnemyFlying1 extends EnemyBase {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy'); // 可替換為飛行敵人貼圖
        this.setOrigin(0.5);
        this.setDisplaySize(40, 28);

        this.speed = 100;
        this.setVelocity(0, 0);
        this.originalY = y;

        this.detectionRange = 400;
        this.safeDistance = 300;
        this.maxEscapeSpeed = 200;
        this.minEscapeSpeed = 100;
        this.body.allowGravity = false; // 關閉重力影響
        this.scene.physics.world.drawDebug = true;
        this.escapeDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // ✅ -1 = 左逃, 1 = 右逃

        this.lastShotTime = 0;
        this.shootCooldown = 2500; // 毫秒

        this.lastContactTime = 0;
        this.contactDamageCooldown = 500; // 毫秒
    }

    update(playerStatus) {
        if (!playerStatus || !playerStatus.player) return;

        const player = playerStatus.player;
        const now = this.scene.time.now;
        let blockedAbove = false;
        let velocityX = 0;
        let velocityY = 0;

        if (!this.isHit) {
            this.setVelocityX(velocityX);
            this.setVelocityY(velocityY);
            if (blockedAbove) {
                this.setVelocityY(50); 
            } else {
                this.setVelocityY(velocityY); 
            }
        } else {
            this.flipX = this.body.velocity.x < 0;
        }
        this.enforceWorldBounds();

        // Y軸追蹤
        const targetY = player.y - 100;
        const verticalDistance = targetY - this.y;
        const trackY = Phaser.Math.Clamp(verticalDistance * 0.3, -120, 120);
        velocityY += trackY;

        // ✅ 平台避讓邏輯：避免貼住平台底部
        const platforms = this.scene.platformManager.getGroup().getChildren();

        for (const platform of platforms) {
            const bounds = platform.getBounds();
            const isAbove = bounds.y + bounds.height < this.y;
            const isHorizontallyAligned = Math.abs(platform.x - this.x) < bounds.width / 2;

            if (isAbove && isHorizontallyAligned && this.y - bounds.y < 40) {
                blockedAbove = true;
                break;
            }
        }

        const touching = this.scene.physics.overlap(this, player);
        if (touching && now - this.lastContactTime > this.contactDamageCooldown) {
            this.lastContactTime = now;
            if (playerStatus.takeHit) {
                playerStatus.takeHit(this.x);
            }
        }


        this.tryShoot(playerStatus);
    }

    tryShoot(playerStatus) {
        if (!playerStatus || !playerStatus.player) return;

        const player = playerStatus.player;
        const now = this.scene.time.now;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (distance < this.detectionRange && now - this.lastShotTime > this.shootCooldown) {
            this.lastShotTime = now;

            const dirX = player.x > this.x ? 1 : -1;
            const bullet = this.scene.physics.add.sprite(this.x, this.y, 'enemyBullet');
            bullet.setVelocityX(dirX * 300);
            bullet.setVelocityY(0);
            bullet.setDepth(99);
            bullet.setData('fromEnemy', true);

            this.scene.time.delayedCall(6000, () => bullet.destroy());

        }
    }

    enforceWorldBounds() {
        const bounds = this.scene.physics.world.bounds;
        const margin = 20;

        if (this.x < bounds.x + margin) {
            this.setX(bounds.x + margin);
            this.escapeDirection = 1;
        }
        if (this.x > bounds.width - margin) {
            this.setX(bounds.width - margin);
            this.escapeDirection = -1;
        }

        if (this.y < bounds.y + margin) {
            this.setY(bounds.y + margin);
        }
        if (this.y > bounds.height - margin) {
            this.setY(bounds.height - margin);
        }
    }

    takeHit(attackerX, direction) {
        this.hitCount++;
        this.isHit = true;

        const dir = this.x < attackerX ? -1 : 1;
        const distance = Math.abs(this.x - attackerX);
        const knockback = Phaser.Math.Clamp(distance * 2, 300, 800);
        // 下批命中：不後退
        if (direction === 'down') {
            this.setVelocity(0, 300);
            this.scene.time.delayedCall(200, () => {
                this.isHit = false;
            });

            if (this.hitCount >= 3) {
                this.die({
                    animation: 'mummy_death',
                    delay: 0,
                    disablePhysics: true
                });
            }
            return;
        }

        // 一般命中：擊退
        this.setVelocityX(knockback * dir);
        this.setVelocity(knockback * dir, -200);

        this.scene.time.delayedCall(200, () => {
            this.isHit = false;
        });

        if (this.hitCount >= 3) {
            this.die({
                animation: 'mummy_death',
                knockback: knockback * dir * 0.6,
                disablePhysics: true
            });
        }
    }
}