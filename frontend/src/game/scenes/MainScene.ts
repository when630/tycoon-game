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
  private successEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private failEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private destroyEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // UI Elements
  private levelText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private enhanceButton!: Phaser.GameObjects.Rectangle;
  // private shape!: Phaser.GameObjects.Rectangle; // Generic shape reference if needed -> Removed

  private onLevelChange?: (level: number) => void;

  constructor() {
    super({ key: 'MainScene' });
  }

  public setLevelChangeCallback(callback: (level: number) => void) {
    this.onLevelChange = callback;
  }

  preload() {
    this.load.image('background', '/assets/background.png');
    this.load.image('anvil', '/assets/anvil.png');
    this.load.image('hammer', '/assets/hammer.png');
    this.load.image('particle_success', '/assets/particle_success.png');
    this.load.image('particle_failure', '/assets/particle_failure.png');
    this.load.image('particle_destroyed', '/assets/particle_destroyed.png');

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

    // 2. Anvil (Center lower)
    this.anvil = this.add.image(width / 2, height / 2 + 100, 'anvil');
    this.anvil.setScale(0.5);

    // 3. Sword (On top of anvil)
    // Anvil y is at +100. Let's put the sword's bottom tip exactly hitting the anvil surface.
    this.sword = this.add.sprite(width / 2, height / 2 + 60, 'sword', 0);
    this.sword.setScale(0.35);
    this.sword.setOrigin(0.5, 1); // Pivot at bottom center

    // 4. Hammer (Ready to strike)
    this.hammer = this.add.image(width / 2 + 80, height / 2 - 20, 'hammer');
    this.hammer.setScale(0.25);
    this.hammer.setAngle(45);
    this.hammer.setVisible(false);

    // 5. Particles
    // 5. Particles
    this.successEmitter = this.add.particles(0, 0, 'particle_success', {
      speed: { min: 150, max: 250 },
      scale: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      emitting: false
    });

    this.failEmitter = this.add.particles(0, 0, 'particle_failure', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      gravityY: 150, // Falling debris
      emitting: false
    });

    this.destroyEmitter = this.add.particles(0, 0, 'particle_destroyed', {
      speed: { min: 200, max: 400 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
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

    this.levelText = this.add.text(width / 2, height / 2 - 150, `Level: +${this.currentLevel}`, {
      fontSize: '32px',
      color: '#00ff00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height / 2 - 100, 'Ready to Forge', {
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

    this.add.text(width / 2, height - 100, 'ENHANCE', {
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
    this.hammer.setPosition(this.width / 2 + 80, this.height / 2 - 20);
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

    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel);
    }

    this.updateSwordSprite();

    if (result === 'SUCCESS') {
      this.statusText.setColor('#00ff00');

      // Success Effect: Particles & Scale
      this.successEmitter.explode(50, this.sword.x, this.sword.y - 100);

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

      this.failEmitter.explode(30, this.sword.x, this.sword.y - 50);

    } else if (result === 'DESTROY') {
      this.statusText.setColor('#ff0000');
      this.cameras.main.shake(300, 0.05);

      this.sword.setVisible(false);
      this.destroyEmitter.explode(80, this.sword.x, this.sword.y - 50);

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
