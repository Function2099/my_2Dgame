export function updatePlayerAnimation(player, cursors, status) {

    // 移動還是待機
    const currentAnim = player.anims.currentAnim?.key;

    const isMoving = cursors.left.isDown || cursors.right.isDown;
    const targetAnim = isMoving ? 'player_walk' : 'player_idle';

    if (currentAnim !== targetAnim) {
        player.play(targetAnim, true);
    }

}
