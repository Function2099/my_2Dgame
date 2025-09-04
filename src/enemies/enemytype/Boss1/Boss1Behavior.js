export default class Boss1Behavior {
    constructor(boss, scene, player) {
        this.boss = boss;
        this.scene = scene;
        this.player = player;
        this.playerController = null;

        this.attackState = 'idle';
        this.attackCooldown = 870;

        this.attackBox = this.scene.add.zone(this.boss.x, this.boss.y, 200, 120);
        this.scene.physics.add.existing(this.attackBox);
        this.attackBox.body.setAllowGravity(false);
        this.attackBox.body.setImmovable(true);
        this.attackBox.body.setEnable(false);
        this.attackBox.body.enable = false;

        this.defaultGravityY = this.scene.physics.world.gravity.y;

        this.debugGfx = this.scene.add.graphics();
        this.debugGfx.setDepth(999); // 保證在最上層
    }

    update() {
        this.boss.flipX = this.boss.x > this.player.x;
        if (this.attackState !== 'idle') return;
        if (this.attackBox.body.enable) {
            console.log('[Boss1] 攻擊箱啟用中');
        }

        const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        const rand = Phaser.Math.Between(1, 100); // 1~100 隨機值

        if (distance > 300) {
            // 遠距離 → 一律 jumpSmash
            this.jumpSmash();
        } else {
            // 近距離 → 60% jumpSmash，40% retreatWave
            if (rand <= 60) {
                // console.log(`[Boss1] 近距離 → 隨機值 ${rand} → 發動 jumpSmash`);
                this.jumpSmash();
            } else {
                // console.log(`[Boss1] 近距離 → 隨機值 ${rand} → 發動 retreatWave`);
                this.retreatWave();
            }
        }

        this.debugGfx.clear();

        if (this.attackBox.body.enable) {
            this.debugGfx.lineStyle(2, 0xff0000, 1);
            const bounds = this.attackBox.getBounds();
            this.debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
    }

    jumpSmash() {
        this.attackState = 'jumpSmash';
        this.boss.body.setGravityY(450);
        const targetX = this.player.x;
        const offset = this.boss.flipX ? -100 : 100;
        const destinationX = targetX + offset;

        const jumpSpeedX = Phaser.Math.Clamp((destinationX - this.boss.x) * 2, -200, 200);
        this.boss.setVelocity(jumpSpeedX, -1200);

        // 等待落地
        const checkLanding = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.boss.body.onFloor()) {
                    this.boss.setVelocity(0, 0);
                    checkLanding.remove(false);
                    this.activateHitbox(() => this.enterCooldown());
                    this.boss.body.setGravityY(this.defaultGravityY);
                }
            }
        });
    }

    activateHitbox(onComplete) {

        const offsetX = this.boss.flipX ? -90 : 90;
        const boxY = this.boss.body.bottom - this.attackBox.height / 2 + 10;

        this.attackBox.x = this.boss.x + offsetX;
        this.attackBox.y = boxY;
        this.attackBox.body.reset(this.attackBox.x, this.attackBox.y);
        this.attackBox.body.enable = true;

        // 即時更新 debug 框（紅色）
        this.debugGfx.clear();
        this.debugGfx.lineStyle(2, 0xff0000, 1);
        const bounds = this.attackBox.getBounds();
        this.debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        const hit = this.scene.physics.overlap(this.attackBox, this.player);
        if (hit) {
            console.log('[Boss1] 命中玩家！');
            this.playerController?.status?.takeHit(this.boss.x, null, 1, {
                knockbackX: 600, // 水平擊退力（預設是 400）
                knockbackY: -320, // 垂直擊退力（預設是 -250）
                knockbackDuration: 500 //預設0.3
            });
        }

        this.scene.time.delayedCall(300, () => {
            this.attackBox.body.enable = false;
            this.debugGfx.clear(); // 清除紅色框
            onComplete?.();
        });
    }

    retreatWave() {
        this.attackState = 'retreatWave';
        this.boss.body.setGravityY(450);

        const dir = this.boss.x < this.player.x ? -1 : 1;
        this.boss.setVelocityX(dir * 300); // ✅ 水平衝刺速度

        // ✅ 等待撞牆
        const checkWall = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (Math.abs(this.boss.body.velocity.x) < 1) {
                    this.boss.setVelocityX(0);
                    checkWall.remove(false);

                    // ✅ 跳起來
                    this.boss.setVelocityY(-800);

                    // ✅ 等待落地
                    const checkLanding = this.scene.time.addEvent({
                        delay: 100,
                        loop: true,
                        callback: () => {
                            if (this.boss.body.onFloor()) {
                                this.boss.setVelocity(0, 0);
                                checkLanding.remove(false);

                                this.activateHitbox(() => {
                                    this.spawnWave(); // ✅ 發射波動
                                    this.boss.body.setGravityY(this.defaultGravityY);
                                    this.enterCooldown();
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    spawnWave(dir) {
        const wave = this.scene.add.rectangle(this.boss.x, this.boss.y, 40, 20, 0xff0000);
        this.scene.physics.add.existing(wave);
        wave.body.setVelocityX(200 * dir);
        wave.body.allowGravity = false;
        wave.body.setImmovable(true);
        wave._speedBoost = 1;

        this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                wave._speedBoost += 0.2;
                wave.body.setVelocityX(100 * wave._speedBoost);
            }
        });
    }

    enterCooldown() {
        this.attackState = 'cooldown';
        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.attackState = 'idle';
        });
    }
}