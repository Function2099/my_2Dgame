// game.js - 
import { SettingsScene } from '../scenes/SettingScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { GameScene } from '../scenes/GameScene.js';

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
            debug: true
        }
    },
    scene: [
        MainMenuScene,
        SettingsScene,
        GameScene
    ]
};

// 啟動遊戲函數（從 control.js 調用）
function startGame() {
    console.log('嘗試啟動遊戲...');
    if (!game) {
        try {
            game = new Phaser.Game(gameConfig);
            console.log('遊戲啟動成功');
        } catch (error) {
            console.error('遊戲啟動失敗:', error);
        }
    } else {
        console.log('遊戲已經啟動');
    }
}
window.startGame = startGame;