// animation/AnimationRegistry.js
export function registerAnimations(scene) {
    const defineAnim = (key, texture, start, end, frameRate = 10, repeat = 0) => {
        if (!scene.anims.exists(key)) {
            scene.anims.create({
                key,
                frames: scene.anims.generateFrameNumbers(texture, { start, end }),
                frameRate,
                repeat
            });
        }
    };

    // 玩家動畫
    defineAnim('player_idle', 'player_idle', 0, 4, 6, -1);
    defineAnim('player_walk', 'player_walk', 0, 3, 6, -1);
    defineAnim('player_double_jump', 'player_double_jump', 0, 3, 12, 0);
    defineAnim('player_attack', 'player_attack', 0, 0, 10, 0);
    defineAnim('player_wallSlide_attack', 'player_wallSlide_attack', 0, 0, 10, 0);
    defineAnim('player_dash', 'player_dash', 0, 0, 10, 0);

    // 地面敵人動畫
    // defineAnim('BoneDragon', 'BoneDragon', 0, 0, 1, 0);
    defineAnim('BoneDragon_walk', 'BoneDragon_walk', 0, 3, 4, -1);
    defineAnim('BoneDragon_attack', 'BoneDragon_attack', 0, 4, 8, 0);
    defineAnim('BoneDragon_hurt', 'BoneDragon_hurt', 0, 1, 10, 0);
    defineAnim('BoneDragon_death', 'BoneDragon_death', 0, 5, 10, 0);
    defineAnim('FlyBoneDragon_move','FlyBoneDragon_move', 0, 2, 5, -1)
    defineAnim('FlyBoneDragon_hurt','FlyBoneDragon_hurt', 0, 1, 10, 0)
    defineAnim('FlyBoneDragon_attack','FlyBoneDragon_attack', 0, 3, 10, 0)
    defineAnim('FlyBoneDragon_death','FlyBoneDragon_death', 0, 4, 10, 0)
}