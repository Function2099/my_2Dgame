import EnemyBase from '../EnemyBase.js';

export default class EnemyFlying1 extends EnemyBase {
    constructor(scene, x, y) {
        super(scene, x, y, 'FlyBoneDragon'); // 可替換為飛行敵人貼圖

        // === 外觀與物理設定 ===
        this.setOrigin(0.5);
        this.setDisplaySize(135, 88);
        this.setOffset(0, 14);
        this.setVelocity(0, 0);
        this.body.allowGravity = false;
        this.originalY = y;
        this._origin = { x, y };
        this.setTexture('FlyBoneDragon');

        // === 偵測距離與速度參數 ===
        this.detectionRange = 400;
        this.escapeDistance = 200;
        this.escapeSpeed = 200;
        this.escapeDuration = 1500;
        this.escapeCooldown = 4500;

        // === 行為狀態 ===
        this._movementState = 'patrol';
        this._isShooting = false;
        this._returning = false;
        this.shootPauseDuration = 350; // 每段停頓時間（可調整）

        // === 巡邏行為 ===
        this.patrolSpeed = 40;              // 巡邏移動速度
        this.patrolRadius = 50;             // 巡邏圓半徑
        this._patrolAngle = 0;              // 初始角度
        this._patrolAngleSpeed = 0.02;      // 每幀遞增角度

        // === 時間戳管理 ===
        this._escapeCooldownUntil = 0;
        this._lockedDirUntil = 0;
        this._lockedDir = 0;
        this._forcedEscapeUntil = 0;
        this._forceRiseUntil = 0;
        this._lostSightTime = 0;
        this._engageForceUntil = 0;

        // === 行為方向 ===
        this._engageForceDir = 0;
        this.escapeDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

        // === 攻擊與碰撞 ===
        this.lastShotTime = 0;
        this.shootCooldown = 2500;
        this.lastContactTime = 0;
        this.contactDamageCooldown = 500;
        this.detectedTime = 0;               // 玩家進入範圍的時間
        this.attackDelayAfterDetect = 1000;  // 偵測後延遲攻擊（毫秒）
        this.hitCount = 0;

        // === 偵測範圍可視化 ===
        // this.debugCircle = this.scene.add.graphics();
        // this.debugCircle.setDepth(1);
    }

    update(playerStatus) {
        if (this.state === 'dead') {
            return;
        }

        if (!playerStatus || !playerStatus.player || this.isHit) return;

        const player = playerStatus.player;
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

        // 平台避讓邏輯：避免貼住平台底部
        const layer = this.scene.platformManager.getLayer();
        const tileAbove = layer.hasTileAtWorldXY(this.x, this.y - 40); // 偵測上方是否有平台

        if (tileAbove) {
            blockedAbove = true;
        }

        // 碰撞傷害
        const activeNow = this.scene.gameTime.now();
        const touching = this.scene.physics.overlap(this, player);
        if (touching && activeNow - this.lastContactTime > this.contactDamageCooldown) {
            this.lastContactTime = activeNow;
            if (playerStatus.takeHit) {
                playerStatus.takeHit(this.x);
            }
        }

        this.tryShoot(playerStatus);

        // 將範圍可視化
        // this.debugCircle.clear();
        // this.debugCircle.lineStyle(10, 0xff0000, 0.5); // 紅色半透明邊框
        // this.debugCircle.strokeCircle(this.x, this.y, this.detectionRange);
        // this.debugCircle.lineStyle(10, 0x00ff00, 0.3); // 綠色半透明
        // this.debugCircle.strokeCircle(this.x, this.y, this.escapeDistance);

    }

    // 射擊邏輯
    tryShoot(playerStatus) {
        if (!playerStatus || !playerStatus.player) return;

        const player = playerStatus.player;
        const activeNow = this.scene.gameTime.now();

        if (this.canSeePlayer(player)) {
            // 第一次進入範圍 → 記錄時間
            if (this.detectedTime === 0) {
                this.detectedTime = activeNow;
            }

            // 尚未達到攻擊延遲 → 不攻擊
            if (activeNow - this.detectedTime < this.attackDelayAfterDetect) return;

            // 攻擊冷卻判斷
            if (activeNow - this.lastShotTime > this.shootCooldown) {
                this.lastShotTime = activeNow;

                if (!this.anims.currentAnim || this.anims.currentAnim.key !== 'FlyBoneDragon_attack') {
                    this.play('FlyBoneDragon_attack');
                    // console.log('[FlyBoneDragon] 播放攻擊動畫');
                }

                this.scene.time.delayedCall(300, () => {
                    this.Bullet(playerStatus);
                });

                this.scene.time.delayedCall(this.shootPauseDuration, () => {
                    this._isShooting = false;
                });
            }
        } else {
            // 玩家離開範圍 → 重設偵測時間
            this.detectedTime = 0;
        }
    }

    Bullet(playerStatus) {
        const player = playerStatus.player;
        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'enemyBullet');
        bullet.body.allowGravity = false;
        bullet.setDepth(99);
        bullet.setData('fromEnemy', true);

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);

        const speed = 300;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        bullet.setVelocity(vx, vy);

        this.scene.physics.add.collider(bullet, this.scene.platformManager.getGroup(), () => {
            bullet.destroy();
        });

        this.scene.physics.add.overlap(bullet, player, () => {
            if (!bullet.active || !player.active) return;

            bullet.destroy();

            const direction = vx > 0 ? 'right' : 'left';
            playerStatus.takeHit(bullet.x, direction, 1);
        });

        this.scene.time.delayedCall(6000, () => bullet.destroy());
    }

    // 受擊邏輯
    takeHit(attackerX, direction) {
        if (this.state === 'dead') {
            return;
        }

        this.hitCount++;
        this.isHit = true;
        // console.log('[takeHit] hitCount:', this.hitCount);
        this.takeHitEffect(this.x, this.y, undefined, 10);
        this.play('FlyBoneDragon_hurt');

        const dir = this.x < attackerX ? -1 : 1;
        const distance = Math.abs(this.x - attackerX);
        const knockback = Phaser.Math.Clamp(distance * 2, 400, 1000);
        // 下批命中：向-Y軸移動
        if (direction === 'down') {
            this.setVelocity(0, 400);
            this.scene.time.delayedCall(200, () => {
                this.isHit = false;
            });
        }

        if (direction === 'up') {
            this.setVelocity(0, -350);
            this.setVelocityX(100 * dir);
            this.scene.time.delayedCall(200, () => {
                this.isHit = false;
            });
        }

        // 一般命中：擊退
        this.setVelocityX(knockback * dir);
        this.setVelocity(knockback * dir, -300);

        this.scene.time.delayedCall(200, () => {
            this.isHit = false;
        });

        if (this.hitCount === 3) {
            this.die({
                animation: 'FlyBoneDragon_death',
                knockback: direction === 'down' || direction === 'up' ? undefined : knockback * dir * 0.6,
                disablePhysics: true
            });
            return;
        }

    }

    // 行為邏輯
    behavioralLogic(playerStatus) {
        const player = playerStatus.player;
        const now = this.scene.gameTime.now();
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (this._movementState === 'patrol') {
            this._patrolAngle += this._patrolAngleSpeed;

            const targetX = this._origin.x + Math.cos(this._patrolAngle) * this.patrolRadius;
            const targetY = this._origin.y + Math.sin(this._patrolAngle) * this.patrolRadius;
            this.x = this._origin.x + Math.cos(this._patrolAngle) * this.patrolRadius;
            this.y = this._origin.y + Math.sin(this._patrolAngle) * this.patrolRadius;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            this.flipX = Math.cos(this._patrolAngle) < 0;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                const vx = Phaser.Math.Clamp((dx / dist) * this.patrolSpeed, -this.patrolSpeed, this.patrolSpeed);
                const vy = Phaser.Math.Clamp((dy / dist) * this.patrolSpeed, -this.patrolSpeed, this.patrolSpeed);
                this.setVelocity(vx, vy);
                this.fly();
            } else {
                this.setVelocity(0, 0);
            }


            if (this.canSeePlayer(player)) {
                this._movementState = 'engage';
                this._lostSightTime = now;
            }
            return;
        }

        if (this._movementState === 'engage') {
            const deltaX = player.x - this.x;
            const dirX = deltaX > 0 ? 1 : -1;
            this.updateFacingDirection(player.x);
            const deltaY = player.y - this.y;
            let vy = null;

            if (!this.canSeePlayer(player)) {
                if (now - this._lostSightTime > 5000) {
                    this._movementState = 'return';
                    this._returning = true;
                    return;
                }
            }

            // 玩家高度接近時強制上升
            if (Math.abs(deltaY) < 70 && now > this._forceRiseUntil) {
                this._forceRiseUntil = now + 2000;
                vy = -60;
            }

            // 碰到平台底部時強制上升
            const layer = this.scene.platformManager.getLayer(); // 拿到 TilemapLayer
            const checkX = this.x;
            const checkY = this.y + this.displayHeight / 2 + 2; // 偵測底部稍微偏下

            const isTouchingBottom = layer.hasTileAtWorldXY(checkX, checkY);

            if (isTouchingBottom && now > this._forceRiseUntil) {
                this._forceRiseUntil = now + 2000;
                vy = -60;
            }

            // 如果正在強制上升期間，維持上升速度
            if (now < this._forceRiseUntil && vy === null) {
                vy = -60;
            }

            // 否則使用追蹤邏輯
            if (vy === null) {
                vy = Phaser.Math.Clamp(deltaY * 0.3, -60, 60);
            }

            this.setVelocityY(vy);
            this.fly();

            if (Math.abs(deltaX) < 30 && now > this._engageForceUntil) {
                this._engageForceDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._engageForceUntil = now + 1600; // 鎖定方向 1.5 秒
            }

            if (now < this._engageForceUntil) {
                this.setVelocityX(this._engageForceDir * 60);
            } else if (distance > 100) {
                this.setVelocityX(dirX * 60);
            }

            if (distance < this.escapeDistance && now > this._escapeCooldownUntil) {
                this._movementState = 'escape';
                this._escapeCooldownUntil = now + this.escapeCooldown;
                this._lockedDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._lockedDirUntil = now + this.escapeDuration;
                return;
            }

            if (this.canSeePlayer(player)) {
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
            this.updateFacingDirection(player.x);

            // 若 X 軸距離太小，觸發強制逃離方向鎖定
            if (absDeltaX < 30 && now > this._forcedEscapeUntil) {
                this._lockedDir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
                this._forcedEscapeUntil = now + 1000;
                vx = this._lockedDir * this.escapeSpeed;
            }

            // 延伸逃離期：冷卻結束但玩家仍在範圍內
            if (now <= this._lockedDirUntil && absDeltaX < this.escapeDistance) {
                vx = this._lockedDir * 100; //持續遠離
            }

            this.setVelocity(vx, vy);
            this.fly();

            // 結束逃離狀態（玩家已脫離範圍）
            if (now > this._lockedDirUntil && absDeltaX >= this.escapeDistance) {
                this._movementState = 'engage';
            }

            return;
        }

        if (this._movementState === 'return') {
            const dx = this._origin.x - this.x;
            const dy = this._origin.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.flipX = dx < 0;

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

    canSeePlayer(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > this.detectionRange) return false;

        const layer = this.scene.platformManager.getLayer();
        const steps = 4;
        // const rayMidX = player.x;

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = Phaser.Math.Interpolation.Linear([this.x, player.x], t);
            const checkY = Phaser.Math.Interpolation.Linear([this.y, player.y], t);
            const tile = layer.getTileAtWorldXY(checkX, checkY);
            const isBlocked = tile && !tile.properties?.thin;
            if (isBlocked) return false;
        }

        return true;
    }

    updateFacingDirection(targetX) {
        this.flipX = targetX < this.x;
    }

    fly() {
        const current = this.anims.currentAnim?.key;
        const isAttack = current === 'FlyBoneDragon_attack';
        const isFinished = this.anims.isPlaying === false;

        if (isAttack && isFinished) {
            // console.log('[fly] 攻擊動畫已結束，切回移動動畫');
            this.play('FlyBoneDragon_move', true);
            return;
        }

        if (!isAttack) {
            this.play('FlyBoneDragon_move', true);
        }
    }

}