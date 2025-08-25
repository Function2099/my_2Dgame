export default class PlatformManager {
  constructor(scene) {
    this.scene = scene;
    this.platforms = this.scene.physics.add.staticGroup();
  }

  createPlatforms() {
    const layout = [
      { x: 400, y: 568, scaleX: 10 },
      { x: 600, y: 400, scaleX: 3 },
      { x: 200, y: 250, scaleX: 3 },
      { x: 1200, y: 500, scaleX: 3 },
      { x: 1800, y: 300, scaleX: 3 },
    ];

    layout.forEach(({ x, y, scaleX }) => {
      this.platforms.create(x, y, 'platform').setScale(scaleX, 1).refreshBody();
    });

    // 玩家碰撞平台
    this.scene.physics.add.collider(this.scene.player, this.platforms);
  }

  getGroup() {
    return this.platforms;
  }
}