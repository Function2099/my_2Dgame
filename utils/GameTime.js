export default class GameTime {
    constructor(scene) {
        this.scene = scene;
        this.activeTime = 0;

        // 每 50ms（或你想要的頻率）更新一次
        scene.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                if (scene.isGameActive) {
                    this.activeTime += 50;
                }
            }
        });
    }

    now() {
        return this.activeTime;
    }

    reset() {
        this.activeTime = 0;
    }
}
