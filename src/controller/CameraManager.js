export default class CameraManager {
    constructor(scene, target) {
        this.scene = scene;
        this.camera = scene.cameras.main;
        this.target = target;
    }

    follow(offsetX = -100, offsetY = 0, lerpX = 0.1, lerpY = 0.1) {
        this.camera.startFollow(this.target, true, lerpX, lerpY);
        this.camera.setFollowOffset(offsetX, offsetY);
    }

    stopFollow() {
        this.camera.stopFollow();
    }

    panTo(x, y, duration = 500, ease = 'Sine.easeInOut') {
        this.camera.pan(x, y, duration, ease);
    }

    shake(duration = 300, intensity = 0.01) {
        this.camera.shake(duration, intensity);
    }

    zoomTo(scale = 1.5, duration = 500) {
        this.camera.zoomTo(scale, duration);
    }

    resetZoom() {
        this.camera.setZoom(1);
    }

    lockToBossRoom(centerX, centerY) {
        this.stopFollow();
        this.panTo(centerX, centerY, 600);
        // this.zoomTo(1.2, 600);
    }
}