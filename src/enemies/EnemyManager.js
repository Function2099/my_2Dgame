import Enemy from "./Enemy.js";

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
    }

    spawn(x, y) {
        const enemy = new Enemy(this.scene, x, y);
        this.enemies.add(enemy);
        return enemy;
    }

    update() {
        this.enemies.getChildren().forEach(enemy => {
            enemy.update();
        });
    }

    getGroup() {
        return this.enemies;
    }
}