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
  private goldText!: Phaser.GameObjects.Text;
  private costText!: Phaser.GameObjects.Text;
  private enhanceButton!: Phaser.GameObjects.Rectangle;
  private sellButton!: Phaser.GameObjects.Rectangle; // New Sell Button
  private sellText!: Phaser.GameObjects.Text;

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

    this.goldText = this.add.text(width / 2, height / 2 - 200, 'Gold: Loading...', {
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Initial Fetch
    this.updateUserInfo();

    // 7. Enhance Button (Moved up slightly to make room)
    const buttonY = height - 120;

    this.enhanceButton = this.add.rectangle(width / 2, buttonY, 200, 60, 0x3366ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleEnhance())
      .on('pointerover', () => this.enhanceButton.setFillStyle(0x5588ff))
      .on('pointerout', () => this.enhanceButton.setFillStyle(0x3366ff));

    this.add.text(width / 2, buttonY, 'ENHANCE', {
      fontSize: '28px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Cost Text (Above Enhance Button)
    this.costText = this.add.text(width / 2, buttonY - 50, '', {
      fontSize: '20px',
      color: '#ffcccc',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 8. Sell Button (Below Enhance Button)
    const sellButtonY = height - 50;

    this.sellButton = this.add.rectangle(width / 2, sellButtonY, 150, 40, 0x228b22)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleSell())
      .on('pointerover', () => this.sellButton.setFillStyle(0x32cd32)) // Lime green hover
      .on('pointerout', () => this.sellButton.setFillStyle(0x228b22)); // Forest green default

    this.sellText = this.add.text(width / 2, sellButtonY, 'SELL', {
      fontSize: '20px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateCostText();
    this.updateSellButtonVisibility();
  }

  private async handleEnhance() {
    if (!this.input.enabled) return;

    // Check if user has enough gold (Frontend pre-check optional, backend handles it)
    // But let's let backend handle it via error message we implemented.

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
        this.updateUserInfo(); // Refresh gold
      });

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Network Error';
      this.statusText.setText(errorMessage);
      this.statusText.setColor('#ff0000'); // Red for error
      this.input.enabled = true;
    }
  }

  private async handleSell() {
    if (this.currentLevel <= 0) return;
    if (!this.input.enabled) return;

    if (!confirm(`현재 레벨(Lv.${this.currentLevel})의 아이템을 판매하시겠습니까?`)) return;

    this.input.enabled = false;
    this.statusText.setText('Selling...');

    try {
      const res = await client.post('/api/v1/game/sell', {
        currentLevel: this.currentLevel,
        itemBaseValue: this.itemBaseValue
      });

      const message = res.data.message;
      alert(message); // Simple feedback for now

      this.resetLevel();
      this.updateUserInfo();
      this.input.enabled = true;

    } catch (e: any) {
      console.error(e);
      const errorMessage = e.response?.data?.error || 'Sales Failed';
      this.statusText.setText(errorMessage);
      this.statusText.setColor('#ff0000');
      this.input.enabled = true;
    }
  }

  private async updateUserInfo() {
    try {
      const response = await client.get('/api/v1/user/me');
      const { gold } = response.data;
      this.goldText.setText(`Gold: ${gold.toLocaleString()}`);
    } catch (e) {
      console.error(e);
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
    this.updateCostText(); // Update cost after level change
    this.updateSellButtonVisibility(); // Check visibility

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

  // Helper/Visual Logic
  private updateCostText() {
    // Cost = Base(100) * (Level + 1)^2
    const cost = this.itemBaseValue * Math.pow(this.currentLevel + 1, 2);
    this.costText.setText(`Cost: ${cost.toLocaleString()} G`);
  }

  private updateSellButtonVisibility() {
    const canSell = this.currentLevel > 0;
    this.sellButton.setVisible(canSell);
    this.sellText.setVisible(canSell);
    // Disable interaction when hidden? SetVisible usually handles input too in newer Phaser 3? 
    // Better to explicit.
    if (canSell) {
      this.sellButton.setInteractive();
    } else {
      this.sellButton.disableInteractive();
    }
  }

  // Getter helper properties due to scope issues in callbacks
  get width() { return this.scale.width; }
  get height() { return this.scale.height; }

  public resetLevel() {
    this.currentLevel = 0;
    this.levelText.setText(`Level: +${this.currentLevel}`);

    // Reset visual
    this.updateSwordSprite();
    this.updateCostText(); // Reset cost display
    this.updateSellButtonVisibility(); // Hide button

    // Notify React (although React likely already knows via onComplete, keeping sync is good)
    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel);
    }

    // Optional: Reset effect
    this.cameras.main.flash(500, 255, 255, 255);
    this.statusText.setText('Reset for new contract');
    this.statusText.setColor('#ffff00');
  }
}
