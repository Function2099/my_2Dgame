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

export function bindAnimationCorrection(sprite, animationKey, onStartConfig, onCompleteConfig) {
    sprite.on(`animationstart-${animationKey}`, () => {
        if (onStartConfig.origin) sprite.setOrigin(onStartConfig.origin.x, onStartConfig.origin.y);
        if (onStartConfig.size) sprite.setSize(onStartConfig.size.width, onStartConfig.size.height);
        if (onStartConfig.offset) sprite.setOffset(onStartConfig.offset.x, onStartConfig.offset.y);
    });

    sprite.on(`animationcomplete-${animationKey}`, () => {
        if (onCompleteConfig.texture) sprite.setTexture(onCompleteConfig.texture);
        if (onCompleteConfig.origin) sprite.setOrigin(onCompleteConfig.origin.x, onCompleteConfig.origin.y);
        if (onCompleteConfig.size) sprite.setSize(onCompleteConfig.size.width, onCompleteConfig.size.height);
        if (onCompleteConfig.offset) sprite.setOffset(onCompleteConfig.offset.x, onCompleteConfig.offset.y);
    });
}