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


    // 地面敵人動畫
    defineAnim('mummy_idle', 'mummy_idle', 0, 3, 6, -1);
    defineAnim('mummy_walk', 'mummy_walk', 0, 5, 10, -1);
    defineAnim('mummy_attack', 'mummy_attack', 0, 5, 10, 0);
    defineAnim('mummy_hurt', 'mummy_hurt', 0, 1, 10, 0);
    defineAnim('mummy_death', 'mummy_death', 0, 5, 10, 0);
}