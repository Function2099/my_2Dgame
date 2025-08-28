import EnemyBase from '../EnemyBase.js';

export default class EnemyFlying1 extends EnemyBase {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy'); // 可替換為飛行敵人貼圖
        this.setOrigin(0.5);
        this.setDisplaySize(40, 28);

        this.setVelocity(0, 0);
        this.originalY = y;

        this.detectionRange = 280;
        this.EscapeDistance = 100;
        this.escapeSpeed = 150;
        this.escapeDuration = 1000;
        this.escapeCooldown = 4500;
        this._forcedEscapeUntil = 0;
        this._forceRiseUntil = 0;
        this.body.allowGravity = false; // 關閉重力影響
        this.scene.physics.world.drawDebug = true;
        this.escapeDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

        this.lastShotTime = 0;
        this.shootCooldown = 2500; // 射擊冷卻

        this.lastContactTime = 0;
        this.contactDamageCooldown = 500;

        this._lostSightTime = 0;
        this.returnDelay = 5000;

        this._engageForceDir = 0;
        this._engageForceUntil = 0;

        // 將偵測範圍可視化
        this.debugCircle = this.scene.add.graphics();
        this.debugCircle.setDepth(1);
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

        // 行為邏輯
        this.behavioralLogic(playerStatus)

        // Y軸追蹤
        const targetY = player.y - 100;
        const verticalDistance = targetY - this.y;
        const trackY = Phaser.Math.Clamp(verticalDistance * 0.3, -120, 120);
        velocityY += trackY;

        // 平台避讓邏輯：避免貼住平台底部
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

        // 碰撞傷害
        const touching = this.scene.physics.overlap(this, player);
        if (touching && now - this.lastContactTime > this.contactDamageCooldown) {
            this.lastContactTime = now;
            if (playerStatus.takeHit) {
                playerStatus.takeHit(this.x);
            }
        }

        this.tryShoot(playerStatus);

        // 將範圍可視化
        this.debugCircle.clear();
        this.debugCircle.lineStyle(10, 0xff0000, 0.5); // 紅色半透明邊框
        this.debugCircle.strokeCircle(this.x, this.y, this.detectionRange);
        this.debugCircle.lineStyle(10, 0x00ff00, 0.3); // 綠色半透明
        this.debugCircle.strokeCircle(this.x, this.y, this.EscapeDistance);

    }

    // 射擊邏輯
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

    // 受擊邏輯
    takeHit(attackerX, direction) {
        this.hitCount++;
        this.isHit = true;

        const dir = this.x < attackerX ? -1 : 1;
        const distance = Math.abs(this.x - attackerX);
        const knockback = Phaser.Math.Clamp(distance * 2, 300, 800);
        // 下批命中：向-Y軸移動
        if (direction === 'down') {
            this.setVelocity(0, 250);
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

        if (direction === 'up') {
            this.setVelocity(0, -300);
            this.setVelocityX(100 * dir);
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

    // 行為邏輯
    behavioralLogic(playerStatus) {
        const player = playerStatus.player;
        const now = this.scene.time.now;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // 初始化狀態
        if (!this._movementState) {
            this._movementState = 'patrol';
            this._patrolAngle = 0;
            this._escapeCooldownUntil = 0;
            this._lockedDirUntil = 0;
            this._lockedDir = 0;
            this._returning = false;
            this._origin = { x: this.x, y: this.y };
        }

        if (this._movementState === 'patrol') {
            this._patrolAngle += 0.02; //
            const radius = 50;
            const targetX = this._origin.x + Math.cos(this._patrolAngle) * radius;
            const targetY = this._origin.y + Math.sin(this._patrolAngle) * radius;

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const angle = Math.atan2(dy, dx);

            const patrolSpeed = 40; // 巡邏速度
            this.setVelocity(Math.cos(angle) * patrolSpeed, Math.sin(angle) * patrolSpeed);

            if (distance < this.detectionRange) {
                this._movementState = 'engage';
                this._lostSightTime = now;
            }
            return;
        }

        if (this._movementState === 'engage') {
            const deltaX = player.x - this.x;
            const dirX = deltaX > 0 ? 1 : -1;

            const deltaY = player.y - this.y;
            let vy = null;

            // 玩家高度接近時強制上升
            if (Math.abs(deltaY) < 70 && now > this._forceRiseUntil) {
                this._forceRiseUntil = now + 1000;
                vy = -50;
            }

            // 碰到平台底部時強制上升
            const platforms = this.scene.platformManager.getGroup().getChildren();
            for (const platform of platforms) {
                const bounds = platform.getBounds();
                const isHorizontallyAligned = Math.abs(platform.x - this.x) < bounds.width / 2;

                const verticalGap = bounds.y - (this.y + this.displayHeight / 2);
                const isTouchingBottom = verticalGap < 20;

                if (isHorizontallyAligned && isTouchingBottom && now > this._forceRiseUntil) {
                    this._forceRiseUntil = now + 1000;
                    vy = -150; // 更強的抬升力
                    break;
                }
            }

            // 如果正在強制上升期間，維持上升速度
            if (now < this._forceRiseUntil && vy === null) {
                vy = -50;
            }

            // 否則使用追蹤邏輯
            if (vy === null) {
                vy = Phaser.Math.Clamp(deltaY * 0.3, -100, 100);
            }

            this.setVelocityY(vy);


            if (Math.abs(deltaX) < 30 && now > this._engageForceUntil) {
                this._engageForceDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._engageForceUntil = now + 1500; // 鎖定方向 1.5 秒
            }

            if (now < this._engageForceUntil) {
                this.setVelocityX(this._engageForceDir * 100);
            } else if (distance > 100) {
                this.setVelocityX(dirX * 60);
            }

            if (distance < this.EscapeDistance && now > this._escapeCooldownUntil) {
                this._movementState = 'escape';
                this._escapeCooldownUntil = now + this.escapeCooldown;
                this._lockedDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._lockedDirUntil = now + this.escapeDuration;
                return;
            }

            if (distance < this.detectionRange) {
                this._lostSightTime = now; // 玩家仍在偵測範圍
            }

            if (now - this._lostSightTime > 5000) {
                this._movementState = 'return';
                this._returning = true;
            }

            return;
        }

        if (this._movementState === 'escape') {
            const deltaY = player.y - this.y;
            const dirY = deltaY > 0 ? -1 : 1;
            const vy = dirY * 80;

            const deltaX = player.x - this.x;
            const absDeltaX = Math.abs(deltaX);

            let vx = this._lockedDir * this.escapeSpeed;

            // 若 X 軸距離太小，觸發強制逃離方向鎖定
            if (absDeltaX < 30 && now > this._forcedEscapeUntil) {
                this._lockedDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._forcedEscapeUntil = now + 1000;
                vx = this._lockedDir * this.escapeSpeed;
            }

            // 延伸逃離期：冷卻結束但玩家仍在範圍內
            if (now > this._lockedDirUntil && absDeltaX < this.EscapeDistance) {
                vx = this._lockedDir * 100; // 遠離
            }

            this.setVelocity(vx, vy);

            // 結束逃離狀態（玩家已脫離範圍）
            if (now > this._lockedDirUntil && absDeltaX >= this.EscapeDistance) {
                this._movementState = 'engage';
            }

            return;
        }


        if (this._movementState === 'return') {
            const dx = this._origin.x - this.x;
            const dy = this._origin.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10) {
                this._movementState = 'patrol';
                this._returning = false;
                this.setVelocity(0, 0);
                return;
            }

            const angle = Math.atan2(dy, dx);
            this.setVelocity(Math.cos(angle) * 60, Math.sin(angle) * 60);
        }
    }

}