import EnemyBase from "../EnemyBase.js";

export default class EnemyGround1 extends EnemyBase {
    constructor(scene, x, y) {
        super(scene, x, y, 'mummy_idle');

        this.setDisplaySize(36, 50);

        this.isHit = false;
        this.hitCount = 0;
        this.play('mummy_idle');

        this.detectionRange = 250;
        this.attackCooldown = 2000;
        this.lastAttackTime = 0;
        this.speed = 50;
        this.chaseSpeed = 80;
        this.direction = 1; // 1 = 右, -1 = 左

        this.attackBox = this.scene.add.zone(this.x, this.y, 28, 40);
        this.scene.physics.add.existing(this.attackBox);
        this.attackBox.body.setAllowGravity(false);
        this.attackBox.body.setImmovable(true);
        this.attackBox.body.setEnable(true);

        this.lastContactTime = 0;
        this.contactDamageCooldown = 500;

        this.lastTurnTime = 0;
        this.turnCooldown = 300; // 毫秒，可調整
    }

    update(playerStatus) {
        if (this.isHit || this.state === 'dead') return;

        const player = playerStatus.player;
        const activeNow = this.scene.gameTime.now();
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const offsetX = this.flipX ? -30 : 30;
        const touching = this.scene.physics.overlap(this, playerStatus.player);
        this.attackBox.x = this.x + offsetX;
        this.attackBox.y = this.y;

        if (this.state === 'attack') {
            return; // 攻擊期間不執行其他行為
        }
        if (distance < this.detectionRange) {
            this.state = 'chase';
            this.chasePlayer(player);
        } else {
            this.state = 'patrol';
            this.patrol();
        }

        // 世界邊界
        this.enforceWorldBounds();

        // 攻擊判定
        if (activeNow - this.lastAttackTime > this.attackCooldown) {
            const hit = this.scene.physics.overlap(this.attackBox, playerStatus.player);
            const isFacingPlayer = this.flipX ? player.x < this.x : player.x > this.x;

            if (hit && isFacingPlayer) {
                this.attack(playerStatus);
                this.lastAttackTime = activeNow;
            }
        }

        // 碰撞判定
        if (touching && activeNow - this.lastContactTime > this.contactDamageCooldown) {
            playerStatus.takeHit(this.x);
            this.lastContactTime = activeNow;
        }
    }

    chasePlayer(player) {
        const dir = player.x < this.x ? -1 : 1;
        const distance = Math.abs(player.x - this.x);
        const speedBoost = Phaser.Math.Clamp(distance * 0.1, 0, 40); // 最多加速 40px/s
        this.setVelocityX((this.chaseSpeed + speedBoost) * dir);
        this.flipX = dir < 0;
        if (this.anims.currentAnim?.key !== 'mummy_walk') {
            this.play('mummy_walk', true);
        }
    }

    patrol() {
        this.setVelocityX(this.speed * this.direction);
        this.flipX = this.direction < 0;

        if (this.anims.currentAnim?.key !== 'mummy_walk') {
            this.play('mummy_walk', true);
        }

        const now = this.scene.gameTime.now();
        const body = this.body;
        const isBlocked = body.blocked.left || body.blocked.right;

        if ((isBlocked || !this.hasGroundAhead()) && now - this.lastTurnTime > this.turnCooldown) {
            this.direction *= -1;
            this.flipX = this.direction < 0;
            this.lastTurnTime = now;
        }
    }

    hasGroundAhead() {
        const aheadX = this.x + this.direction * 20;
        const aheadY = this.y + this.height / 2 + 2; // 更準確地偵測腳下

        const layer = this.scene.platformManager.getLayer();
        return layer.hasTileAtWorldXY(aheadX, aheadY);
    }

    attack(playerStatus) {
        this.state = 'attack';
        this.setVelocityX(0);
        this.attackFrameTriggered = false;
        this.play('mummy_attack');

        const totalFrames = this.anims.currentAnim?.frames.length || 4; // 預設4幀
        const lastFrameIndex = totalFrames - 1;

        this.on('animationupdate', (anim, frame) => {
            if (anim.key === 'mummy_attack' && frame.index === lastFrameIndex && !this.attackFrameTriggered) {
                this.attackFrameTriggered = true;

                const player = playerStatus.player;
                const offsetX = this.flipX ? -30 : 30;
                this.attackBox.x = this.x + offsetX;
                this.attackBox.y = this.y;

                const hit = this.scene.physics.overlap(this.attackBox, player);
                const isFacingPlayer = this.flipX ? player.x < this.x : player.x > this.x;

                if (hit && isFacingPlayer) {
                    // console.log('玩家被敵人攻擊命中');
                    this.showAttackBox();
                    playerStatus.takeHit(this.x);
                } else {
                    // console.log('攻擊失敗：玩家已脫離範圍');
                }
            }
        });

        this.once('animationcomplete', () => {
            this.off('animationupdate');
            const player = playerStatus.player;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            this.state = distance < this.detectionRange ? 'chase' : 'patrol';
        });
    }

    showAttackBox() {
        const g = this.scene.add.graphics();
        g.lineStyle(2, 0xff0000, 1);
        g.strokeRect(
            this.attackBox.x - this.attackBox.width / 2,
            this.attackBox.y - this.attackBox.height / 2,
            this.attackBox.width,
            this.attackBox.height
        );
        this.scene.time.delayedCall(200, () => g.destroy());
    }

    takeHit(attackerX, direction) {
        this.hitCount++;
        this.isHit = true;
        this.play('mummy_hurt', true);
        this.takeHitEffect(this.x, this.y, undefined, 10);

        const dir = this.x < attackerX ? -1 : 1;
        const distance = Math.abs(this.x - attackerX);
        const knockback = Phaser.Math.Clamp(distance * 2, 300, 800);

        // 下批命中：不後退
        if (direction === 'down') {
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