// 攻擊敵人
function attack() {
    enemies.getChildren().forEach(enemy => {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
        if (distance < 100) {
            enemy.destroy();
            score += level * 10;
            scoreText.setText('分數: ' + score);

            // 檢查是否所有敵人都被消滅
            if (enemies.countActive() === 0) {
                portal.setPosition(player.x, player.y - 100);
                portal.visible = true;
            }
        }
    });
}

// 碰到敵人
function hitEnemy(player, enemy) {
    // 簡單的受傷邏輯
    player.setTint(0xff0000);
    player.setVelocityY(-200);

    setTimeout(() => {
        player.clearTint();
    }, 300);
}