export function registerAnimations(scene) {
    scene.anims.create({
        key: 'mummyAttackAnim',
        frames: scene.anims.generateFrameNumbers('mummyAttack', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    // 你可以繼續加其他角色、武器、特效動畫
}
