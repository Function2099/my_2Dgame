// assets/AssetLoader.js
export function loadAssets(scene) {

    // 平台
    scene.load.tilemapTiledJSON('map_intro', '../assets/platform/map.tmj');
    scene.load.image('bg_intro', '../assets/platform/bg_intro.png');
    scene.load.image('bg_combat', '../assets/platform/bg_combat.png');
    scene.load.image('bg_bossroom', '../assets/platform/bg_bossroom.png');
    scene.load.image('platform_tiles', '../assets/platform/tileset.png');

    // 特效
    scene.load.image('wava', '../assets/fx_explosion/wava.png')
    scene.load.image('small_wava', '../assets/fx_explosion/small_wava.png')
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

    scene.load.spritesheet('player_dash', '../assets/player/player_dash.png', {
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

    // 敵人素材
    // 地面敵人
    scene.load.image('BoneDragon', '../assets/enemies/BoneDragon.png');

    scene.load.spritesheet('BoneDragon_walk', '../assets/enemies/BoneDragon_walk.png', {
        frameWidth: 104,
        frameHeight: 131
    });

    scene.load.spritesheet('BoneDragon_attack', '../assets/enemies/BoneDragon_attack.png', {
        frameWidth: 104,
        frameHeight: 131
    });

    scene.load.spritesheet('BoneDragon_hurt', '../assets/enemies/BoneDragon_hurt.png', {
        frameWidth: 104,
        frameHeight: 131
    });

    scene.load.spritesheet('BoneDragon_death', '../assets/enemies/BoneDragon_death.png', {
        frameWidth: 104,
        frameHeight: 131
    });

    // 飛行敵人
    scene.load.image('FlyBoneDragon', '../assets/enemies/FlyBoneDragon.png');

    scene.load.spritesheet('FlyBoneDragon_move', '../assets/enemies/FlyBoneDragon_move.png', {
        frameWidth: 135,
        frameHeight: 102
    });

    scene.load.spritesheet('FlyBoneDragon_hurt', '../assets/enemies/FlyBoneDragon_hurt.png', {
        frameWidth: 135,
        frameHeight: 102
    });

    scene.load.spritesheet('FlyBoneDragon_attack', '../assets/enemies/FlyBoneDragon_attack.png', {
        frameWidth: 135,
        frameHeight: 102
    });

    scene.load.spritesheet('FlyBoneDragon_death', '../assets/enemies/FlyBoneDragon_death.png', {
        frameWidth: 135,
        frameHeight: 102
    });

    // Boss1
    scene.load.spritesheet('Boss', '../assets/enemies/Boss.png', {
        frameWidth: 336,
        frameHeight: 220
    });

    scene.load.spritesheet('Boss_attack', '../assets/enemies/Boss_attack.png', {
        frameWidth: 336,
        frameHeight: 220
    });

    scene.load.spritesheet('Boss_op', '../assets/enemies/Boss_op.png', {
        frameWidth: 336,
        frameHeight: 220
    });

    scene.load.spritesheet('Boss_dash', '../assets/enemies/Boss_dash.png', {
        frameWidth: 336,
        frameHeight: 220
    });

    scene.load.spritesheet('Boss_death', '../assets/enemies/Boss_death.png', {
        frameWidth: 336,
        frameHeight: 220
    });
}