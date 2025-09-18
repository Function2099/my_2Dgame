import SaveManager from './SaveManager.js';

export default class SavePointManager {
    constructor(scene, player, map) {
        this.scene = scene;
        this.player = player;
        this.map = map;
        this.currentSavePointId = null;
        this.hasSavedThisFrame = false;

        this.saveTriggers = this.scene.physics.add.staticGroup();
        this.initSavePoints();
    }

    initSavePoints() {
        const savePoints = this.map.getObjectLayer('savePoints')?.objects || [];
        // console.log(`[SavePointManager] 匯入復活點數量：${savePoints.length}`);

        savePoints.forEach(obj => {
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;

            // 可視化矩形（debug用）
            //   this.scene.add.rectangle(centerX, centerY, obj.width, obj.height, 0x00ff00, 0.3)
            //     .setDepth(998)
            //     .setScrollFactor(1);

            const trigger = this.saveTriggers.create(centerX, centerY, null)
                .setSize(obj.width, obj.height)
                .setOrigin(0.5)
                .setVisible(false)
                .setData('saveId', obj.name);

            trigger.body.setSize(obj.width, obj.height);
            trigger.body.setOffset(-obj.width / 2, -obj.height / 2);
        });

        this.scene.physics.add.overlap(this.player, this.saveTriggers, (player, trigger) => {
            if (this.hasSavedThisFrame) return;

            const saveId = trigger.getData('saveId');
            if (saveId !== this.currentSavePointId) {
                SaveManager.save(saveId, trigger.x, trigger.y);
                this.currentSavePointId = saveId;
                this.hasSavedThisFrame = true;
                console.log(`[SavePointManager] 已更新復活點：${saveId}`);
            }
        });
    }
}