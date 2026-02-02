import Phaser from 'phaser';
import client from '../../api/client';

export class MainScene extends Phaser.Scene {
  private currentLevel: number = 0;
  private itemBaseValue: number = 100;

  // Visual Elements
  private background!: Phaser.GameObjects.Image;
  private anvil!: Phaser.GameObjects.Image;
  private sword!: Phaser.GameObjects.Sprite;
  private hammer!: Phaser.GameObjects.Image;
  private particleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // UI Elements
  private levelText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private enhanceButton!: Phaser.GameObjects.Rectangle;
  private buttonText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('background', '/assets/background.png');
    this.load.image('anvil', '/assets/anvil.png');
    this.load.image('hammer', '/assets/hammer.png');
    this.load.image('particle', '/assets/particle.png');

    // Assuming 1024 width for 4 frames = 256px frame width
    this.load.spritesheet('sword', '/assets/sword_sheet.png', {
      frameWidth: 256,
      frameHeight: 1024
    });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background
    this.background = this.add.image(width / 2, height / 2, 'background');
    this.background.setDisplaySize(width, height);
    this.background.setAlpha(0.6); // Darken slightly

    // 2. Anvil
    this.anvil = this.add.image(width / 2, height / 2 + 150, 'anvil');
    this.anvil.setScale(0.5); // Adjust scale

    // 3. Sword (On top of anvil)
    this.sword = this.add.sprite(width / 2, height / 2 - 50, 'sword', 0);
    this.sword.setScale(0.3);
    this.sword.setOrigin(0.5, 1); // Bottom center pivot for shake effects

    // 4. Hammer (Hidden initially or resting)
    this.hammer = this.add.image(width / 2 + 100, height / 2, 'hammer');
    this.hammer.setScale(0.4);
    this.hammer.setAngle(45);
    this.hammer.setVisible(false);

    // 5. Particles
    this.particleEmitter = this.add.particles(0, 0, 'particle', {
      speed: 100,
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      emitting: false
    });

    // 6. UI Text
    this.add.text(width / 2, 50, 'Forge Tycoon', {
      fontSize: '48px',
      color: '#ffaa00',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.levelText = this.add.text(width / 2, height / 2 + 200, `Level: +${this.currentLevel}`, {
      fontSize: '32px',
      color: '#00ff00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height / 2 + 250, 'Ready to Forge', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 7. Enhance Button
    this.enhanceButton = this.add.rectangle(width / 2, height - 100, 200, 60, 0x3366ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleEnhance())
      .on('pointerover', () => this.enhanceButton.setFillStyle(0x5588ff))
      .on('pointerout', () => this.enhanceButton.setFillStyle(0x3366ff));

    this.buttonText = this.add.text(width / 2, height - 100, 'ENHANCE', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private async handleEnhance() {
    if (!this.input.enabled) return;

    // Visual Feedback: Hammer Animation
    this.playHammerAnimation();

    this.input.enabled = false;
    this.statusText.setText('Forging...');
    this.statusText.setColor('#ffff00');

    try {
      const response = await client.post('/api/v1/game/enhance', {
        itemBaseValue: this.itemBaseValue,
        currentLevel: this.currentLevel
      });

      const { result, newLevel, message } = response.data;

      // Delayed result to match animation
      this.time.delayedCall(800, () => {
        this.handleResult(result, newLevel, message);
        this.input.enabled = true;
      });

    } catch (error) {
      console.error(error);
      this.statusText.setText('Network Error');
      this.statusText.setColor('#ff0000');
      this.input.enabled = true;
    }
  }

  private playHammerAnimation() {
    this.hammer.setVisible(true);
    this.hammer.setPosition(this.width / 2 + 100, this.height / 2 - 50);
    this.hammer.setAngle(45);

    this.tweens.add({
      targets: this.hammer,
      angle: -45, // Strike
      duration: 150,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.hammer.setVisible(false);
      }
    });

    // Camera shake on impact (simulated)
    this.time.addEvent({
      delay: 150,
      repeat: 2,
      callback: () => {
        this.cameras.main.shake(50, 0.005);
      }
    });
  }

  private handleResult(result: string, newLevel: number, message: string) {
    this.currentLevel = newLevel;
    this.levelText.setText(`Level: +${this.currentLevel}`);
    this.statusText.setText(message);

    this.updateSwordSprite();

    if (result === 'SUCCESS') {
      this.statusText.setColor('#00ff00');

      // Success Effect: Particles & Scale
      this.particleEmitter.explode(50, this.sword.x, this.sword.y - 50);

      this.tweens.add({
        targets: this.sword,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 200,
        yoyo: true,
      });

    } else if (result === 'FAIL') {
      this.statusText.setColor('#ffaa00');
      this.cameras.main.shake(100, 0.01);

    } else if (result === 'DESTROY') {
      this.statusText.setColor('#ff0000');
      this.cameras.main.shake(300, 0.05);

      this.sword.setVisible(false);
      this.particleEmitter.explode(20, this.sword.x, this.sword.y); // Shatter effect substitute

      this.time.delayedCall(1500, () => {
        this.sword.setVisible(true);
        this.updateSwordSprite();
      });
    }
  }

  private updateSwordSprite() {
    // Change frame based on level
    if (this.currentLevel === 0) {
      this.sword.setFrame(0); // Rusty/Basic
    } else if (this.currentLevel <= 5) {
      this.sword.setFrame(1); // Clean
    } else if (this.currentLevel <= 10) {
      this.sword.setFrame(2); // Magic
    } else {
      this.sword.setFrame(3); // Legendary
    }
  }

  // Getter helper properties due to scope issues in callbacks
  get width() { return this.scale.width; }
  get height() { return this.scale.height; }
}
