// game.js - 
import { SettingsScene } from '../src/scenes/SettingScene.js';
import { MainMenuScene } from '../src/scenes/MainMenuScene.js';
import { GameScene } from '../src/scenes/GameScene.js';
import { KeyConfigScene } from '../src/scenes/SettingScene/KeyConfigScene.js';
import DemoEndScene from '../src/scenes/DemoEndScreen.js';
import { LoadingScene } from '../src/scenes/LoadingScene.js';
import { SoundSettingsScene } from '../src/scenes/SettingScene/SoundSettingScene.js';
// 遊戲變數
let game = null;

// 遊戲配置
const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-frame',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            // debug: true
        }
    },
    dom: {
        createContainer: true
    },
    scene: [
        MainMenuScene,
        LoadingScene,
        SettingsScene,
        GameScene,
        KeyConfigScene,
        SoundSettingsScene,
        DemoEndScene
    ]
};

// 啟動遊戲函數（從 control.js 調用）
function startGame() {
    console.log('嘗試啟動遊戲...');

    const placeholder = document.querySelector('#game-frame .placeholder');
    if (placeholder) {
        placeholder.remove(); // 清掉嵌入提示
    }

    if (!game) {
        try {
            destroyGame();
            game = new Phaser.Game(gameConfig);
            console.log('遊戲啟動成功');
        } catch (error) {
            console.error('遊戲啟動失敗:', error);
        }
    } else {
        console.log('遊戲已經啟動');
    }
}


// 清除遊戲啟動檔案
function destroyGame() {
    if (game) {
        try {
            game.destroy(true); // 銷毀並清除 canvas
            console.log('遊戲已銷毀');
        } catch (error) {
            console.warn('銷毀遊戲時發生錯誤:', error);
        }
        game = null;
    }
}

window.startGame = startGame;
window.destroyGame = destroyGame;

// 用在test_game.html用的，使用正式的網站(index.html)時記得註解掉這段
window.addEventListener('DOMContentLoaded', () => {
    startGame();
});