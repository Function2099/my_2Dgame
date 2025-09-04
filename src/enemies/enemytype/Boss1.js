import EnemyBase from "../EnemyBase.js";

export default class Boss1 extends EnemyBase {
    constructor(scene, x, y, playerRef) {
        super(scene, x, y, null); // 暫時不指定貼圖
        this.playerRef = playerRef;

        this.setDisplaySize(196, 268); // 主角兩倍大小
        this.setOrigin(0.5);
        this.setDepth(20);
        this.name = 'Boss1';

        this.state = 'idle';
        this.isHit = false;
        this.hitCount = 0;

        // ✅ 讓攻擊模組能安全呼叫
        this.takeHit = (attackerX, direction) => {
            console.log('[Boss1] 被擊中！', attackerX, direction);
            this.hitCount++;

            if (this.hitCount >= 3) {
                this.die({
                    animation: 'boss_death', // ✅ 雖然沒動畫，但 die() 需要這個 key
                    disablePhysics: true
                });
            }
        };
    }

    update(playerStatus) {
        // ✅ 暫時不寫行為邏輯，之後可加 intro / attack / wave 等狀態
    }

    die(config) {
        if (!config || !config.animation) {
            console.warn('[Boss1] die() 缺少 animation 屬性，跳過動畫播放');
        }

        if (this.state === 'dead') return;
        this.state = 'dead';
        this.isHit = true;

        console.log('[Boss1] 進入死亡狀態');

        // ✅ 封鎖玩家行動
        if (this.playerRef?.body) {
            this.playerRef.body.enable = false;
            this.playerRef.setVelocity(0);

            console.log('[Boss1] 玩家已被封鎖');
        }

        if (config.disablePhysics) {
            this.body.enable = false;
        }

        // ✅ 延遲摧毀 Boss，並解除玩家封鎖
        this.scene.time.delayedCall(3000, () => {
            console.log('[Boss1] 死亡摧毀完成');
            this.destroy();

            if (this.playerRef?.body) {
                this.playerRef.body.enable = true;
                console.log('[Boss1] 玩家已解除封鎖');
            }
        });
    }
}