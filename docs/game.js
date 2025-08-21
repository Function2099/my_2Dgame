// game.js - 
import { GameScene } from '../scenes/GameScene.js';

// 遊戲變數
let game = null;

// 遊戲配置
const gameConfig = {
    type: Phaser.AUTO,
    width: document.getElementById('game-frame').clientWidth,
    height: document.getElementById('game-frame').clientHeight,
    parent: 'game-frame',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: true // 設為 true 可調試碰撞框
        }
    },
    scene: [GameScene]
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