export default class Attack {
    constructor(scene, player, input, enemyGroup, playerStatus) {
        this.scene = scene
        this.player = player
        this.input = input
        this.enemyGroup = enemyGroup; //攻擊敵人用的
        this.playerStatus = playerStatus;

        // 攻擊冷卻
        this.attackCooldown = 300;
        // 攻擊時間紀錄
        this.lastAttackTime = 0;

        this.createHitboxes();
        this.bindInput();
    }

    createHitboxes() {
        this.hitboxes = {
            forward: this.scene.add.rectangle(0, 0, 60, 60, 0xff0000, 0).setOrigin(0.5),
            up: this.scene.add.rectangle(0, 0, 60, 60, 0x00ff00, 0).setOrigin(0.5),
            down: this.scene.add.rectangle(0, 0, 60, 50, 0x0000ff, 0).setOrigin(0.5),
            forwardLeft: this.scene.add.rectangle(0, 0, 60, 60, 0xffaaaa, 0).setOrigin(0.5),
            forwardRight: this.scene.add.rectangle(0, 0, 60, 60, 0xaaffaa, 0).setOrigin(0.5),
        };

        Object.entries(this.hitboxes).forEach(([dir, hitbox]) => {
            this.scene.physics.add.existing(hitbox);
            hitbox.setVisible(false);
            hitbox.body.enable = false; //初始禁用
            hitbox.body.allowGravity = false; // 不受重力影響
            hitbox.body.immovable = true; //不被推動

            // 根據方向設定不同碰撞範圍
            switch (dir) {
                case 'forward': hitbox.body.setSize(60, 60); break;
                case 'up': hitbox.body.setSize(60, 60); break;
                case 'down': hitbox.body.setSize(60, 50); break;
            }

            hitbox.body.setOffset(
                hitbox.width / 2 - hitbox.body.width / 2,
                hitbox.height / 2 - hitbox.body.height / 2
            );

            hitbox.setPosition(-9999, -9999);
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

        if (!hitbox) return;

        // 設定hitbox位置
        const offset = this.getOffset(direction);
        hitbox.setPosition(this.player.x + offset.x, this.player.y + offset.y);

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
        this.attackDuration = 150;

        this.scene.physics.overlap(
            hitbox,
            this.enemyGroup,
            (hb, enemy) => {
                if (!hb._hitThisAttack) {
                    enemy.takeHit();
                    hb._hitThisAttack = true;

                    if (
                        this.activeHitboxDirection === 'down' &&
                        !this.player.body.onFloor() // 角色不在地面
                    ) {
                        this.player.setVelocityY(-400); // 彈起速度，可微調
                        this.playerStatus.resetAirAbilities();
                    }
                }
            }
        );

        console.log('攻擊方向:', this.getAttackDirection());
        console.log('鎖定中:', this.playerStatus.isWallJumpLocking, '方向:', this.playerStatus.wallJumpLockDirection);
        console.log('牆跳方向:', this.playerStatus.wallJumpDirection);
        console.log('justWallJumped:', this.playerStatus.justWallJumped);
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

        switch (direction) {
            case 'up':
                return { x: velocityX * 0.05, y: -30 - speedCompY };
            case 'down':
                return { x: velocityX * 0.05, y: 30 + speedCompY };
            case 'forward':
                return { x: facing * (30 + speedComp), y: 0 };
            case 'forwardLeft':
                return { x: -30, y: 0 };
            case 'forwardRight':
                return { x: 30, y: 0 };
        }
    }

}