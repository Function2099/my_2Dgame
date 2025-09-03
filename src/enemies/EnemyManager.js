import EnemyBase from "./EnemyBase.js";
import EnemyGround1 from "./enemytype/EnemyGround1.js";
import EnemyFlying1 from "./enemytype/EnemyFlying1.js";

const enemyTypes = {
    ground: EnemyGround1,
    flying: EnemyFlying1,
    // 之後可以加更多：
    // flying: EnemyFlying1,
    // boss: EnemyBoss1,
};

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
    }

    spawn(x, y, type = 'ground') {
        const EnemyClass = enemyTypes[type] || EnemyBase;
        const enemy = new EnemyClass(this.scene, x, y);
        this.enemies.add(enemy);
        console.log(`生成敵人類型：${type}`, EnemyClass.name);
        console.log('建立敵人:', enemy.x, enemy.y, enemy.active, enemy.visible);
        return enemy;
    }

    update(playerStatus) {
        if (!this.scene.isGameActive) return;
        this.enemies.getChildren().forEach(enemy => enemy.update(playerStatus));
    }

    getGroup() {
        return this.enemies;
    }
}