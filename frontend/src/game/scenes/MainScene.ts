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

  // UI Elements - visual feedback only
  // Removed buttons as they are now in React

  // Callbacks for React HUD
  private onLevelChange?: (level: number) => void;
  // private onSellRequest?: () => void; // Removed
  private onGoldChange?: (gold: number) => void;
  private onReputationChange?: (reputation: number) => void;
  private onStatusChange?: (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => void;

  constructor() {
    super({ key: 'MainScene' });
  }

  public setCallbacks(
    onLevelChange: (level: number) => void,
    // onSellRequest: () => void, // Removed
    onGoldChange: (gold: number) => void,
    onReputationChange: (reputation: number) => void,
    onStatusChange: (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => void
  ) {
    this.onLevelChange = onLevelChange;
    // this.onSellRequest = onSellRequest; // Removed
    this.onGoldChange = onGoldChange;
    this.onReputationChange = onReputationChange;
    this.onStatusChange = onStatusChange;
  }

  preload() {
    this.load.image('background', '/assets/background.png');
    this.load.image('anvil', '/assets/anvil.png');
    this.load.image('hammer', '/assets/hammer.png');
    this.load.image('particle_success', '/assets/particle_success.png');
    this.load.image('particle_failure', '/assets/particle_failure.png');
    this.load.image('particle_destroyed', '/assets/particle_destroyed.png');

    // Load individual sword images (0 to 21)
    for (let i = 0; i <= 21; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      this.load.image(`sword_${i}`, `/assets/sword/sword_${paddedIndex}.png`);
    }
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background
    this.background = this.add.image(width / 2, height / 2, 'background');
    this.background.setDisplaySize(width, height);
    this.background.setAlpha(0.6);

    // 2. Anvil 
    this.anvil = this.add.image(width / 2, height / 2 + 100, 'anvil');
    this.anvil.setScale(0.5);

    // 3. Sword 
    this.sword = this.add.sprite(width / 2, height / 2 + 60, 'sword_0');
    this.sword.setScale(0.75); // Increased from 0.5
    this.sword.setOrigin(0.5, 1);

    // 4. Hammer
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
      gravityY: 150,
      emitting: false
    });

    this.destroyEmitter = this.add.particles(0, 0, 'particle_destroyed', {
      speed: { min: 200, max: 400 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 1000,
      emitting: false
    });

    // Initial Fetch
    this.updateUserInfo();

    // Initial Position Setup
    this.handleResize({ width, height } as Phaser.Structs.Size);

    // Resize Handler
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    const centerX = width / 2;
    const centerY = height / 2;
    const isMobile = width < 768;

    // 1. Background
    this.background.setPosition(centerX, centerY);
    this.background.setDisplaySize(width, height);

    // 2. Anvil
    const anvilY = centerY + (isMobile ? 50 : 100);
    this.anvil.setPosition(centerX, anvilY);
    this.anvil.setScale(isMobile ? 0.25 : 0.5);

    // 3. Sword
    const swordY = anvilY - (isMobile ? 20 : 40); // Slightly above anvil center
    this.sword.setPosition(centerX, swordY);
    this.sword.setScale(isMobile ? 0.5 : 0.75); // Increased from 0.35/0.5

    // 4. Hammer
    const hammerX = centerX + (isMobile ? 50 : 80);
    const hammerY = anvilY - (isMobile ? 60 : 120);
    this.hammer.setPosition(hammerX, hammerY);
    this.hammer.setScale(isMobile ? 0.15 : 0.25);
  }

  // Public methods triggered by React
  public async enhance() {
    // Prevent double clicking or action when input disabled
    if (!this.input.enabled) return;

    // Visual Feedback: Hammer Animation
    this.playHammerAnimation();

    // Temporarily disable further input logic if needed, 
    // though React side should likely handle disable state too.
    this.input.enabled = false;

    if (this.onStatusChange) this.onStatusChange('제작 중...', 'NORMAL');

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
      const errorMessage = error.response?.data?.error || '네트워크 오류';

      if (this.onStatusChange) this.onStatusChange(errorMessage, 'FAIL');
      this.input.enabled = true;
    }
  }

  public async sell() {
    // This might not be needed if React handles the UI directly, 
    // but we might want to keep some Phaser state logic here.
    // Actually, standardizing: React calls this to trigger any visual effect if needed?
    // Or just use React to call API and update Phaser via callback?
    // Let's keep the actual API call in React for Sell since it involves a Modal.
    // But if we want to trigger sword disappearing animation, we need a method.

    // For now, let's just use this method to trigger an effect if we sold it.
    // React -> Sell Modal -> API Success -> Phaser.onSellComplete()
  }

  // Called when sell is confirmed in React
  public onSellComplete() {
    // Play sell sound or effect?
    this.successEmitter.explode(50, this.sword.x, this.sword.y);
    this.resetLevel();
  }

  private async updateUserInfo() {
    try {
      const response = await client.get('/api/v1/user/me');
      const { gold, reputation } = response.data;
      if (this.onGoldChange) this.onGoldChange(gold);
      if (this.onReputationChange) this.onReputationChange(reputation);
    } catch (e) {
      console.error(e);
    }
  }

  private playHammerAnimation() {
    this.hammer.setVisible(true);
    // Position is set in resize, but good to ensure
    const width = this.scale.width;
    const height = this.scale.height;
    const isMobile = width < 768;
    const centerY = height / 2;
    const anvilY = centerY + (isMobile ? 50 : 100);
    const hammerX = (width / 2) + (isMobile ? 50 : 80);
    const hammerY = anvilY - (isMobile ? 60 : 120);

    this.hammer.setPosition(hammerX, hammerY);
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

    // Notify Status
    let type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY' = 'NORMAL';
    if (result === 'SUCCESS') type = 'SUCCESS';
    else if (result === 'FAIL') type = 'FAIL';
    else if (result === 'DESTROY') type = 'DESTROY';

    if (this.onStatusChange) this.onStatusChange(message, type);
    if (this.onLevelChange) this.onLevelChange(this.currentLevel);

    this.updateSwordSprite();

    if (result === 'SUCCESS') {
      // Success Effect: Particles & Scale
      this.successEmitter.explode(50, this.sword.x, this.sword.y - 100);

      this.tweens.add({
        targets: this.sword,
        scaleX: 0.85, // Increased from 0.6
        scaleY: 0.85, // Increased from 0.6
        duration: 200,
        yoyo: true,
      });

    } else if (result === 'FAIL') {
      this.cameras.main.shake(100, 0.01);

      this.failEmitter.explode(30, this.sword.x, this.sword.y - 50);

    } else if (result === 'DESTROY') {
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
    // Change texture based on level
    // Cap at level 21 because we only have images up to sword_21
    const safeLevel = Math.min(this.currentLevel, 21);
    this.sword.setTexture(`sword_${safeLevel}`);
  }

  // Getter helper properties due to scope issues in callbacks
  get width() { return this.scale.width; }
  get height() { return this.scale.height; }

  public resetLevel() {
    this.currentLevel = 0;

    // Reset visual
    this.updateSwordSprite();

    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel);
    }

    // Optional: Reset effect
    this.cameras.main.flash(500, 255, 255, 255);

    if (this.onStatusChange) this.onStatusChange('새로운 의뢰를 위해 초기화', 'NORMAL');
  }
}
