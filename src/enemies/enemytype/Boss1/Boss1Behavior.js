export default class Boss1Behavior {
    constructor(boss, scene, player) {
        this.boss = boss;
        this.scene = scene;
        this.player = player;
        this.boss.flipX = true;
        this.playerController = null;

        this.attackState = 'idle';
        this.attackCooldown = 870;

        this.attackBox = this.scene.add.zone(this.boss.x, this.boss.y, 160, 120);
        this.scene.physics.add.existing(this.attackBox);
        this.attackBox.body.setAllowGravity(false);
        this.attackBox.body.setImmovable(true);
        this.attackBox.body.setEnable(false);
        this.attackBox.body.enable = false;
        this._lockFacing = false;

        this.defaultGravityY = this.scene.physics.world.gravity.y;

        // this.debugGfx = this.scene.add.graphics();
        // this.debugGfx.setDepth(999); // 保證在最上層
        // this.lastFacingLogTime = 0; // debug用的，之後可註解
    }

    update() {
        if (!this._lockFacing) {
            this.boss.flipX = this.boss.x > this.player.x;
        }
        const now = this.scene.gameTime.now();
        if (now - this.lastFacingLogTime > 500) {
            // const facing = this.boss.flipX ? '← 左' : '→ 右';
            // console.log(`[Boss1] 面向方向：${facing}`);
            this.lastFacingLogTime = now;
        }

        if (this.attackState !== 'idle') return;
        // if (this.attackBox.body.enable) {
        // console.log('[Boss1] 攻擊箱啟用中');
        // }

        const rand = Phaser.Math.Between(0, 1); // 0 或 1

        if (rand === 0) {
            this.jumpSmash();
        } else {
            this.retreatWave();
        }

        this.scene.children.list.forEach(obj => {
            if (obj.name === 'bossWave' && obj.active) {
                const elapsed = this.scene.gameTime.now() - obj.spawnTime;
                if (elapsed > 2000) {
                    obj.destroy();
                }
            }
        });

        // this.debugGfx.clear();
        // if (this.attackBox.body.enable) {
        //     this.debugGfx.lineStyle(2, 0xff0000, 1);
        //     const bounds = this.attackBox.getBounds();
        //     this.debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        // }
    }

    jumpSmash() {
        this.attackState = 'jumpSmash';
        this.boss.body.setGravityY(450);
        const targetX = this.player.x;
        const offset = this.boss.flipX ? -100 : 100;
        const destinationX = targetX + offset;

        const jumpSpeedX = Phaser.Math.Clamp((destinationX - this.boss.x) * 2, -200, 200);
        this.boss.setVelocity(jumpSpeedX, -1200);
        this.boss.play('Boss_attack_jump');

        // 等待落地
        const checkLanding = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.isBossAlive()) {
                    checkLanding.remove(false);
                    return;
                }

                if (this.boss.body.onFloor()) {
                    checkLanding.remove(false);
                    this.boss.setVelocity(0, 0);

                    this.boss.setTexture('Boss_attack', 5);

                    this.activateHitbox(() => {
                        this.boss.setTexture('Boss');
                        this.boss.setOrigin(0.5, 1);
                        this.boss.setSize(138, 197);
                        this.boss.setOffset(88, 23);
                        this.enterCooldown();
                    });

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
        // this.debugGfx.clear();
        // this.debugGfx.lineStyle(2, 0xff0000, 1);
        // const bounds = this.attackBox.getBounds();
        // this.debugGfx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

        const hit = this.scene.physics.overlap(this.attackBox, this.player);
        if (hit) {
            // console.log('[Boss1] 命中玩家！');
            this.playerController?.status?.takeHit(this.boss.x, null, 1, {
                knockbackX: 600, // 水平擊退力（預設是 400）
                knockbackY: -320, // 垂直擊退力（預設是 -250）
                knockbackDuration: 500 //預設0.3
            });
        }

        this.scene.time.delayedCall(300, () => {
            this.attackBox.body.enable = false;
            // this.debugGfx.clear(); // 清除紅色框
            onComplete?.();
        });


    }

    retreatWave() {
        this._lockFacing = true;
        this.attackState = 'retreatWave';
        this.boss.body.setGravityY(450);

        const dir = this.boss.flipX ? -1 : 1;
        this.boss.setVelocityX(dir * 350); // 水平衝刺速度
        this.boss.flipX = dir < 0;
        this.boss.play('Boss_dash');

        // 等待撞牆
        const checkWall = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.isBossAlive()) {
                    checkWall.remove(false);
                    return;
                }

                if (Math.abs(this.boss.body.velocity.x) < 1) {
                    this.boss.setVelocityX(0);
                    checkWall.remove(false);

                    // 跳起來
                    this.boss.setVelocityY(-800);
                    this.boss.play('Boss_attack_jump');

                    const playerX = this.player?.x ?? this.boss.x;
                    this.boss.flipX = playerX < this.boss.x;

                    // 等待落地
                    const checkLanding = this.scene.time.addEvent({
                        delay: 100,
                        loop: true,
                        callback: () => {
                            if (!this.isBossAlive()) {
                                checkLanding.remove(false);
                                return;
                            }

                            if (this.boss.body.onFloor()) {
                                this.boss.setVelocity(0, 0);
                                checkLanding.remove(false);
                                this.boss.setTexture('Boss_attack', 5);
                                this.spawnWave();

                                this.activateHitbox(() => {
                                    this.boss.setTexture('Boss');
                                    this.boss.setOrigin(0.5, 1);
                                    this.boss.setSize(138, 197);
                                    this.boss.setOffset(88, 23);
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

    spawnWave() {
        const dir = this.boss.flipX ? -1 : 1;

        // 改成從 attackBox 的中心生成
        // const bounds = this.attackBox.getBounds();
        const startX = this.boss.x + (this.boss.flipX ? -140 : 140);
        const startY = this.boss.body.bottom - 20;

        const waveCount = 3;     // 發射幾個波動
        const interval = 200;    // 每個波動間隔
        const initialSpeed = 100; // 初速
        const accel = 600;       // 加速度（數字越大加速越快）

        for (let i = 0; i < waveCount; i++) {
            this.scene.time.delayedCall(i * interval, () => {
                const wave = this.scene.add.image(startX, startY, 'wava');
                this.scene.physics.add.existing(wave);
                wave.name = 'bossWave';
                wave.flipX = dir < 0;
                wave.spawnTime = this.scene.gameTime.now();

                // 設定初速 & 加速度
                wave.body.setVelocityX(initialSpeed * dir);
                wave.body.setAccelerationX(accel * dir);
                wave.body.allowGravity = false;
                wave.body.setImmovable(true);

                // 碰撞檢測
                this.scene.physics.add.overlap(wave, this.player, () => {
                    // console.log('[Boss1] 波動命中玩家！');
                    this.playerController?.status?.takeHit(this.boss.x, null, 1, {
                        knockbackX: 500,
                        knockbackY: -250,
                        knockbackDuration: 400
                    });
                    wave.destroy();
                });

                for (let j = 0; j < 4; j++) {
                    const tail = this.scene.add.sprite(startX - dir * j * 20, startY + 15, 'small_wava');
                    this.scene.physics.add.existing(tail);
                    tail.body.setVelocityX(initialSpeed * dir);
                    tail.body.setAccelerationX(accel * dir);
                    tail.body.allowGravity = false;
                    tail.body.setImmovable(true);
                    tail.alpha = 0.6 - j * 0.1;
                    tail.flipX = dir < 0;

                    this.scene.time.delayedCall(400 + j * 100, () => {
                        if (tail.active) tail.destroy();
                    });
                }

            });
        }


    }

    getWaveSpawnX(dir) {
        return this.boss.x + dir * 40;
    }

    enterCooldown() {
        this._lockFacing = false;
        this.attackState = 'cooldown';
        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.attackState = 'idle';
        });
    }

    isBossAlive() {
        return this.boss?.active && this.boss?.body && this.boss?.state !== 'dead';
    }
}