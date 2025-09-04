export default class PlatformManager {
  constructor(scene) {
    this.scene = scene;

    const map = this.scene.make.tilemap({ key: 'map_intro' });
    const tileset = map.addTilesetImage('platform_tiles');
    const platformLayer = map.createLayer('platforms', tileset);


    platformLayer.setCollisionByExclusion([-1]);
    this.scene.physics.add.collider(this.scene.player, platformLayer);
    this.platformLayer = platformLayer;
    this.platformLayer.setCollisionBetween(1, 9999);

    // ✅ 延遲執行 tile 檢查，確保資料已準備好
    this.scene.time.delayedCall(100, () => {
      let tileCount = 0;
      platformLayer.forEachTile(tile => {
        if (tile.index !== -1) {
          tileCount++;
          if (!tile.collides) {
            console.warn(`⚠️ Tile index ${tile.index} 沒有碰撞框`);
          }
        }
      });
      // console.log(`platformLayer tile 數量：${tileCount}`);
    });
  }

  getGroup() {
    return this.platformLayer;
  }

  getLayer() {
    return this.platformLayer;
  }

  closeBossGate(x = 5800, y = 1510, width = 64, height = 204, onComplete) {
    // 初始位置：門板在地底下
    const gate = this.scene.add.rectangle(x, y + height, width, height, 0x000000)
      .setOrigin(0.5, -0.5)
    // .setDepth(100);

    // 加入物理碰撞
    this.scene.physics.add.existing(gate);
    gate.body.setImmovable(true);
    gate.body.allowGravity = false;
    this.scene.physics.add.collider(this.scene.player, gate);

    // 門板升起動畫
    this.scene.tweens.add({
      targets: gate,
      y: y - height,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }

}