import { createTitleText, createMainMenuButton } from '../../ui/UITextHelper.js';

export class SoundSettingsScene extends Phaser.Scene {
    constructor() {
        super('SoundSettingsScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const spacing = 80;

        // 初始化音量（預設全開）
        if (!this.registry.has('masterVolume')) this.registry.set('masterVolume', 1);
        if (!this.registry.has('musicVolume')) this.registry.set('musicVolume', 1);
        if (!this.registry.has('sfxVolume')) this.registry.set('sfxVolume', 1);

        this.sound.volume = this.registry.get('masterVolume');
        if (this.music) this.music.setVolume(this.registry.get('musicVolume'));
        // 如果有 sfxManager，也可以在這裡設定

        // 背景
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0b0c10).setAlpha(1);

        // 標題
        const title = createTitleText(this, centerX, centerY - 180, '聲音設定');

        // 整體音量
        const masterLabel = this.add.text(centerX, centerY - 80, '整體音量', this.getLabelStyle()).setOrigin(0.5).setDepth(2);
        const masterSlider = this.createVolumeSlider(centerX, centerY - 40, this.registry.get('masterVolume'), (value) => {
            this.registry.set('masterVolume', value);
            this.sound.volume = value;
        });

        // 音樂音量
        const musicLabel = this.add.text(centerX, centerY + 20, '音樂音量', this.getLabelStyle()).setOrigin(0.5).setDepth(2);
        const musicSlider = this.createVolumeSlider(centerX, centerY + 60, this.registry.get('musicVolume'), (value) => {
            this.registry.set('musicVolume', value);
            if (this.music) this.music.setVolume(value);
        });

        // 音效音量
        const sfxLabel = this.add.text(centerX, centerY + 100, '音效音量', this.getLabelStyle()).setOrigin(0.5).setDepth(2);
        const sfxSlider = this.createVolumeSlider(centerX, centerY + 140, this.registry.get('sfxVolume'), (value) => {
            this.registry.set('sfxVolume', value);
            // 如果有 sfxManager，可在這裡設定
        });

        // 返回按鈕（保存設定）
        const bottomY = centerY + spacing + 150;

        const backToSettingsBtn = createMainMenuButton(this, centerX, bottomY, '返回設定', () => {
            this.saveVolumeSettings();
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SettingsScene');
            });
        });
        backToSettingsBtn.setX(centerX - 180);

        const resetBtn = createMainMenuButton(this, centerX, bottomY, '重設音量', () => {
            this.registry.set('masterVolume', 1);
            this.registry.set('musicVolume', 1);
            this.registry.set('sfxVolume', 1);
            this.sound.volume = 1;
            if (this.music) this.music.setVolume(1);
            this.scene.restart(); // 重新載入場景以更新滑桿
        });
        resetBtn.setX(centerX);

        const backToMainBtn = createMainMenuButton(this, centerX, bottomY, '返回主選單', () => {
            this.saveVolumeSettings();
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
        backToMainBtn.setX(centerX + 180);

        // 淡入動畫
        this.tweens.add({
            targets: [
                title,
                masterLabel, masterSlider,
                musicLabel, musicSlider,
                sfxLabel, sfxSlider,
                backToSettingsBtn, resetBtn, backToMainBtn
            ],
            alpha: { from: 0, to: 1 },
            duration: 800,
            ease: 'Power2',
        });

        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    saveVolumeSettings() {
        const master = this.registry.get('masterVolume') || 1;
        const music = this.registry.get('musicVolume') || 1;
        const sfx = this.registry.get('sfxVolume') || 1;
        console.log('保存音量設定：', { master, music, sfx });
        // 可加 localStorage 或其他持久化邏輯
    }

    getLabelStyle() {
        return {
            fontFamily: 'Microsoft JhengHei',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#585858',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#042a2a',
                blur: 4,
                stroke: true,
                fill: true,
            },
        };
    }

    createVolumeSlider(x, y, initialValue = 1, onChange = () => { }) {
        const barWidth = 300;
        const barHeight = 12;
        const fillColor = 0x00ffff;
        const bgColor = 0x1a1a1a;

        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, barWidth, barHeight, bgColor).setOrigin(0.5);
        container.add(bg);

        const fill = this.add.rectangle(-barWidth / 2, 0, barWidth * initialValue, barHeight, fillColor)
            .setOrigin(0, 0.5);
        container.add(fill);

        const knob = this.add.circle(-barWidth / 2 + barWidth * initialValue, 0, 10, fillColor)
            .setInteractive({ useHandCursor: true });
        container.add(knob);

        knob.on('pointerdown', () => {
            this.input.on('pointermove', onDrag);
            this.input.once('pointerup', () => {
                this.input.off('pointermove', onDrag);
            });
        });

        const onDrag = (pointer) => {
            const localX = Phaser.Math.Clamp(pointer.x - container.x, -barWidth / 2, barWidth / 2);
            const percent = Phaser.Math.Clamp((localX + barWidth / 2) / barWidth, 0, 1);
            fill.width = barWidth * percent;
            knob.x = localX;
            onChange(percent);
        };

        return container;
    }
}