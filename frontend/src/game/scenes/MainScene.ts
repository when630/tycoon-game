import Phaser from 'phaser';
import client from '../../api/client';

export class MainScene extends Phaser.Scene {
  private currentLevel: number = 0;
  private itemBaseValue: number = 100; // Mock base value

  // UI Elements
  private levelText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private enhanceButton!: Phaser.GameObjects.Rectangle;
  private buttonText!: Phaser.GameObjects.Text;
  private sword!: Phaser.GameObjects.Rectangle; // Placeholder for sword image

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets here if needed
  }

  create() {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, 50, 'Forge Tycoon', {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5);

    // Sword (Visual Representation)
    this.sword = this.add.rectangle(width / 2, height / 2 - 50, 50, 200, 0xcccccc);

    // Level Text
    this.levelText = this.add.text(width / 2, height / 2 + 80, `Level: +${this.currentLevel}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Status Message
    this.statusText = this.add.text(width / 2, height / 2 + 120, 'Ready to Forge', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Enhance Button
    this.enhanceButton = this.add.rectangle(width / 2, height - 100, 200, 60, 0x3366ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleEnhance())
      .on('pointerover', () => this.enhanceButton.setFillStyle(0x5588ff))
      .on('pointerout', () => this.enhanceButton.setFillStyle(0x3366ff));

    this.buttonText = this.add.text(width / 2, height - 100, 'ENHANCE', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private async handleEnhance() {
    // Disable button to prevent spam
    this.input.enabled = false;
    this.statusText.setText('Forging...');
    this.statusText.setColor('#ffff00');

    try {
      const response = await client.post('/api/v1/game/enhance', {
        itemBaseValue: this.itemBaseValue,
        currentLevel: this.currentLevel
      });

      const { result, newLevel, message } = response.data;

      // Artificial delay for tension
      this.time.delayedCall(500, () => {
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

  private handleResult(result: string, newLevel: number, message: string) {
    this.currentLevel = newLevel;
    this.levelText.setText(`Level: +${this.currentLevel}`);
    this.statusText.setText(message);

    if (result === 'SUCCESS') {
      this.statusText.setColor('#00ff00');
      // Particle effect or scale tween
      this.tweens.add({
        targets: this.sword,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Color change based on level (Visual feedback)
          const color = Phaser.Display.Color.GetColor(
            200,
            200 - Math.min(200, this.currentLevel * 10),
            200 - Math.min(200, this.currentLevel * 10)
          );
          this.sword.setFillStyle(color);
        }
      });
    } else if (result === 'FAIL') {
      this.statusText.setColor('#ffaa00');
      this.cameras.main.shake(100, 0.01);
    } else if (result === 'DESTROY') {
      this.statusText.setColor('#ff0000');
      this.cameras.main.shake(300, 0.05);
      this.sword.setVisible(false);

      // Reset visual after delay
      this.time.delayedCall(1000, () => {
        this.sword.setVisible(true);
        this.sword.setFillStyle(0xcccccc);
      });
    }
  }
}
