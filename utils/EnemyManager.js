let enemies = null;
// 生成敵人
function spawnEnemies(scene) {
    enemies.clear(true, true);

    const enemyCount = level === 5 ? 1 : level * 2; // 第5關只有1隻BOSS

    for (let i = 0; i < enemyCount; i++) {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        const enemy = enemies.create(x, y, 'enemy');
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    }
}
