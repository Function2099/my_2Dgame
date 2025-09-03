export default class PlatformManager {
  constructor(scene) {
    this.scene = scene;

    const map = this.scene.make.tilemap({ key: 'map_intro' });
    const tileset = map.addTilesetImage('platform_tiles');
    const platformLayer = map.createLayer('platforms', tileset);

    if (!platformLayer) {
      console.warn('⚠️ platformLayer 為 null，請確認 Tiled 圖層名稱是否為 "platforms"');
      return;
    }

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
      console.log(`✅ platformLayer tile 數量：${tileCount}`);
    });
  }

  getGroup() {
    return this.platformLayer;
  }

  getLayer() {
    return this.platformLayer;
  }
}