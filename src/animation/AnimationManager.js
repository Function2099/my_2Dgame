export function updatePlayerAnimation(player, inputs, status) {
    // 如果玩家在空中，就不要覆蓋動畫
    if (!status.isGrounded) return;

    const currentAnim = player.anims.currentAnim?.key;
    const isMoving = inputs.moveLeft.isDown || inputs.moveRight.isDown;
    const targetAnim = isMoving ? 'player_walk' : 'player_idle';

    if (currentAnim !== targetAnim) {
        player.play(targetAnim, true);
    }
}

