// assets/AssetLoader.js
export function loadAssets(scene) {
    // 敵人素材
    scene.load.spritesheet('mummy_idle', '../assets/enemies/Mummy_idle.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_walk', '../assets/enemies/Mummy_walk.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_attack', '../assets/enemies/Mummy_attack.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_hurt', '../assets/enemies/Mummy_hurt.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_death', '../assets/enemies/Mummy_death.png', { frameWidth: 48, frameHeight: 48 });

    // 玩家待機動畫 spritesheet（如果你已經準備好了）
    scene.load.spritesheet('player_idle', '../assets/player/player_idle.png', {
        frameWidth: 84,
        frameHeight: 132
    });
}