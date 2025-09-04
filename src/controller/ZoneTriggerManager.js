export default class ZoneTriggerManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.triggers = []; // 每個 trigger: { zone, triggered, onEnter }
    }

    addTrigger(zoneData, onEnter, options = {}) {
        const zone = new Phaser.Geom.Rectangle(zoneData.x, zoneData.y, zoneData.width, zoneData.height);
        this.triggers.push({
            zone,
            triggered: false,
            onEnter,
            once: options.once ?? true
        });
    }

    update() {
        const px = this.player.x;
        const py = this.player.y;

        for (const trigger of this.triggers) {
            if (trigger.once && trigger.triggered) continue;

            const zone = trigger.zone;
            const result = Phaser.Geom.Rectangle.Contains(zone, px, py);

            // console.log(`判定結果：${result} → 玩家(${px}, ${py}) vs 區域(${zone.x}, ${zone.y}, ${zone.width}, ${zone.height})`);

            if (result) {
                console.log('進入觸發區域，執行事件');
                trigger.triggered = true;
                trigger.onEnter();
            }
        }
    }

    registerBossTriggers(zoneList) {
        zoneList.forEach(zoneData => {
            this.addTrigger(zoneData, () => {
                console.log('🧨 BOSS房觸發！');

                // 鎖定鏡頭
                this.scene.cameraManager.lockToBossRoom(5950, 1510);

                // 停止玩家行動
                this.scene.player.body.enable = false;
                this.scene.player.setVelocity(0);

                // 延遲 1 秒後升起門板
                this.scene.time.delayedCall(1000, () => {
                    this.scene.platformManager.closeBossGate(5408, 1510, 64, 204, () => {
                        // 門升起完成 → BOSS吼叫
                        this.scene.time.delayedCall(500, () => {
                            console.log('🗣 BOSS 吼叫！');

                            // 顯示 BOSS 登場文字
                            // this.scene.add.text(5900, 1502, '⚔ BOSS 登場 ⚔', {
                            //     fontSize: '32px',
                            //     color: '#ff0000'
                            // }).setScrollFactor(1).setDepth(100);

                            // 播放音效（目前用 log）
                            console.log('🔊 播放 BOSS 登場音效（boss_intro）');

                            // 再延遲 500ms → 玩家恢復控制
                            this.scene.time.delayedCall(500, () => {
                                this.scene.player.body.enable = true;
                                console.log('🎮 玩家恢復控制');
                            });
                        });
                    });
                });
            });
        });
    }
}