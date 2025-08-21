let score = 0;
let scoreText = null;
let level = 1;
let portal = null;
let isGameActive = false;

// 創建關卡平台
function createLevel(scene) {
    platforms.create(400, 568, 'platform').setScale(10, 1).refreshBody();

    // 根據關卡創建不同平台佈局
    switch (level) {
        case 1:
            platforms.create(600, 400, 'platform').setScale(3, 1).refreshBody();
            platforms.create(200, 250, 'platform').setScale(3, 1).refreshBody();
            break;
        case 2:
            platforms.create(300, 450, 'platform').setScale(2, 1).refreshBody();
            platforms.create(500, 350, 'platform').setScale(2, 1).refreshBody();
            platforms.create(200, 250, 'platform').setScale(2, 1).refreshBody();
            break;
        case 3:
            // 更多平台...
            break;
        case 4:
            // 更多平台...
            break;
        case 5:
            // BOSS關卡平台
            platforms.create(400, 300, 'platform').setScale(8, 1).refreshBody();
            break;
    }
}



// 進入下一關
function goToNextLevel(player, portal) {
    level++;
    if (level > 5) {
        // 遊戲通關
        scoreText.setText('遊戲通關！最終分數: ' + score);
        isGameActive = false;
        return;
    }

    levelText.setText('關卡: ' + level);
    portal.visible = false;

    // 重新生成關卡
    platforms.clear(true, true);
    createLevel(this);
    spawnEnemies(this);

    // 重置玩家位置
    player.setPosition(100, 450);
}