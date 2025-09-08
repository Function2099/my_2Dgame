import EnemyBase from "../../EnemyBase.js";
import Boss1Behavior from "./Boss1Behavior.js";
import { bindAnimationCorrection } from "../../../animation/AnimationManager.js";

export default class Boss1 extends EnemyBase {
    constructor(scene, x, y, playerRef, playerController) {
        super(scene, x, y, 'Boss'); // 暫時不指定貼圖
        this.playerRef = playerRef;
        this.sceneRef = scene
        this.playerController = playerController;
        this.setTexture('Boss');
        this.setSize(138, 197);
        this.setOrigin(0.5, 1);
        this.setOffset(88, 23);
        this.setTint(0x000000);
        // this.setOffset(0, 28)
        // this.body.setSize(147, 201);   // 碰撞框大小

        this.setDepth(8);
        this.name = 'Boss1';

        this.state = 'idle';
        this.isHit = false;
        this.hitCount = 0;

        this.behavior = new Boss1Behavior(this, scene, playerRef, playerController);
        this.isActivated = false; // 登場前不執行行為


        // bindAnimationCorrection(this, 'Boss_attack',
        //     { origin: { x: 0.5, y: 1 }, size: { width: 168, height: 197 }, offset: { x: 0, y: 23 } },
        //     { texture: 'Boss', origin: { x: 0.5, y: 1 }, size: { width: 138, height: 197 }, offset: { x: 0, y: 0 } }
        // );

    }

    update(playerStatus) {
        if (this.state === 'dead') return;
        if (!this.isActivated) return;

        this.behavior.update();

        const now = this.scene.gameTime.now();
        this.lastContactTime = this.lastContactTime || 0;

        const touching = this.scene.physics.overlap(this, this.playerRef);

        if (touching && now - this.lastContactTime > 500) {
            // console.log('[Boss1]成功碰撞玩家 → 造成傷害');
            playerStatus.takeHit(this.x);
            this.lastContactTime = now;
        }
    }

    takeHit() {
        this.hitCount++;
        this.takeHitEffect(this.x, this.y, undefined, 10);

        if (this.hitCount >= 10) {
            this.die({
                animation: 'Boss_death',
                disablePhysics: true
            });
        }
    }

    die(config) {
        if (!config || !config.animation) {
            console.warn('[Boss1] die() 缺少 animation 屬性，跳過動畫播放');
        }

        if (this.state === 'dead') return;
        this.state = 'dead';
        this.anims.stop();
        this.isHit = true;

        // console.log('[Boss1] 進入死亡狀態');

        if (this.playerRef?.body) {
            this.playerRef.body.enable = true;
            this.playerRef.body.setVelocityX(0);
            this.playerRef.setVelocity(0, 0);
            this.playerRef.body.setAllowGravity(true);
            this.playerRef.body.setImmovable(false);
            this.playerRef.body.setDragX(9999);
        }

        if (this.playerController) {
            this.playerController.isLocked = true;
        }

        if (config.disablePhysics) {
            this.body.enable = false;
        }

        //   讓 Boss 掉落
        this.body.setAllowGravity(true);
        this.body.setImmovable(false);
        this.body.enable = true;

        const waitForLanding = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (this.body.onFloor()) {
                    waitForLanding.remove(false);

                    this.body.setVelocity(0, 0);
                    this.body.setAllowGravity(false);
                    this.body.setImmovable(true);
                    this.body.enable = false;

                    this.setDepth(5);

                    //   播逐幀死亡動畫
                    const deathFrames = [0, 1, 2, 3];
                    const frameDelay = 750;

                    deathFrames.forEach((frameIndex, i) => {
                        this.scene.time.delayedCall(i * frameDelay, () => {
                            this.setTexture(config.animation, frameIndex);
                        });
                    });

                    //   播完後解除玩家封鎖
                    this.scene.time.delayedCall(deathFrames.length * frameDelay, () => {
                        if (this.playerController) {
                            this.playerController.isLocked = false;
                        }

                        if (this.playerRef?.body) {
                            this.playerRef.body.enable = true;
                        }

                        this.sceneRef.events.emit('bossDefeated');
                        // console.log('[Boss1] 死亡動畫完成 → 已落地並凍結');
                    });
                }
            }
        });
    }

    injectPlayerController(controller) {
        this.playerController = controller;
        this.behavior.playerController = controller;
        // console.log('[Boss1] 已延遲注入 playerController');
    }
}