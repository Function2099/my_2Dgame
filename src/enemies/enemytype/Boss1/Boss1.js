import EnemyBase from "../../EnemyBase.js";
import Boss1Behavior from "./Boss1Behavior.js";

export default class Boss1 extends EnemyBase {
    constructor(scene, x, y, playerRef, playerController) {
        super(scene, x, y, null); // 暫時不指定貼圖
        this.playerRef = playerRef;
        this.playerController = playerController;
        this.setDisplaySize(147, 201);
        // this.body.setSize(147, 201);   // 碰撞框大小

        this.setDepth(20);
        this.name = 'Boss1';

        this.state = 'idle';
        this.isHit = false;
        this.hitCount = 0;

        this.behavior = new Boss1Behavior(this, scene, playerRef, playerController);
        this.isActivated = false; // 登場前不執行行為

        // 讓攻擊模組能安全呼叫
        this.takeHit = (attackerX, direction) => {
            console.log('[Boss1] 被擊中！', attackerX, direction);
            this.hitCount++;

            if (this.hitCount >= 3) {
                this.die({
                    animation: 'boss_death', // 雖然沒動畫，但 die() 需要這個 key
                    disablePhysics: true
                });
            }
        };

    }

    update(playerStatus) {
        if (this.state === 'dead') return;
        if (!this.isActivated) return;

        this.behavior.update();

        const now = this.scene.time.now;
        this.lastContactTime = this.lastContactTime || 0;

        const touching = this.scene.physics.overlap(this, this.playerRef);

        if (touching && now - this.lastContactTime > 500) {
            console.log('[Boss1]成功碰撞玩家 → 造成傷害');
            playerStatus.takeHit(this.x);
            this.lastContactTime = now;
        }
    }

    die(config) {
        if (!config || !config.animation) {
            console.warn('[Boss1] die() 缺少 animation 屬性，跳過動畫播放');
        }

        if (this.state === 'dead') return;
        this.state = 'dead';
        this.isHit = true;

        console.log('[Boss1] 進入死亡狀態');

        // 封鎖玩家行動

        if (this.playerRef?.body) {
            this.playerRef.body.enable = false;
            this.playerRef.setVelocity(0);
            console.log('[Boss1] 玩家物理已封鎖');
        }

        if (this.playerController) {
            this.playerController.isLocked = true;
            console.log('[Boss1] 玩家控制器已封鎖');
        }

        if (config.disablePhysics) {
            this.body.enable = false;
        }

        // 延遲摧毀 Boss，並解除玩家封鎖
        this.scene.time.delayedCall(3000, () => {
            this.destroy();

            if (this.playerController) {
                this.playerController.isLocked = false;
                console.log('[Boss1] 玩家控制器已解除封鎖');
            }

            if (this.playerRef?.body) {
                this.playerRef.body.enable = true;
                console.log('[Boss1] 玩家物理已解除封鎖');
            }
        });
    }

    injectPlayerController(controller) {
        this.playerController = controller;
        this.behavior.playerController = controller;
        console.log('[Boss1] 已延遲注入 playerController');
    }
}