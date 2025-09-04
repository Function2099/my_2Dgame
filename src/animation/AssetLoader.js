// assets/AssetLoader.js
export function loadAssets(scene) {
    // 敵人素材
    scene.load.spritesheet('mummy_idle', '../assets/enemies/Mummy_idle.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_walk', '../assets/enemies/Mummy_walk.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_attack', '../assets/enemies/Mummy_attack.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_hurt', '../assets/enemies/Mummy_hurt.png', { frameWidth: 48, frameHeight: 48 });
    scene.load.spritesheet('mummy_death', '../assets/enemies/Mummy_death.png', { frameWidth: 48, frameHeight: 48 });

    // 玩家
    scene.load.spritesheet('player_idle', '../assets/player/player_idle.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_walk', '../assets/player/player_walk.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_jump', '../assets/player/player_jump.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_wallSlide', '../assets/player/player_wallSlide.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_double_jump', '../assets/player/player_double_jump.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_attack', '../assets/player/player_attack.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_wallSlide_attack', '../assets/player/player_wallSlide_attack.png', {
        frameWidth: 128,
        frameHeight: 134
    });

    scene.load.spritesheet('player_air_attack', '../assets/player/player_air_attack.png', {
        frameWidth: 128,
        frameHeight: 134
    });
}