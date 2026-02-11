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

  private currentWeaponType: string = 'SWORD';

  constructor() {
    super({ key: 'MainScene' });
  }

  public setCallbacks(
    onLevelChange: (level: number) => void,
    onGoldChange: (gold: number) => void,
    onReputationChange: (reputation: number) => void,
    onStatusChange: (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => void
  ) {
    this.onLevelChange = onLevelChange;
    this.onGoldChange = onGoldChange;
    this.onReputationChange = onReputationChange;
    this.onStatusChange = onStatusChange;
  }

  public setWeaponType(type: string) {
    if (this.currentWeaponType !== type) {
      this.currentWeaponType = type;
      this.updateSwordSprite();
    }
  }

  preload() {
    this.load.image('background', '/assets/background.png');
    this.load.image('anvil', '/assets/anvil.png');
    this.load.image('hammer', '/assets/hammer.png');
    this.load.image('particle_success', '/assets/particle_success.png');
    this.load.image('particle_failure', '/assets/particle_failure.png');
    this.load.image('particle_destroyed', '/assets/particle_destroyed.png');

    // Load individual sword images (New location)
    for (let i = 0; i <= 21; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      this.load.image(`sword_${i}`, `/assets/weapon/sword/sword_${paddedIndex}.png`);
    }

    // Load individual axe images
    for (let i = 0; i <= 21; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      this.load.image(`axe_${i}`, `/assets/weapon/axe/axe_${paddedIndex}.png`);
    }

    // Load Spritesheets (Dagger only for now, or fallback)
    const frameConfig = { frameWidth: 160, frameHeight: 170 };
    this.load.spritesheet('sheet_DAGGER', '/assets/weapon/dagger-sheet.png', frameConfig);
  }

  init(data: { currentLevel: number }) {
    this.currentLevel = data.currentLevel || 0;
  }

  create() {
    const { width, height } = this.scale;

    const registryLevel = this.registry.get('initialLevel');
    if (registryLevel !== undefined) {
      this.currentLevel = registryLevel;
    }

    // 1. Background
    this.background = this.add.image(width / 2, height / 2, 'background');
    this.background.setDisplaySize(width, height);
    this.background.setAlpha(0.6);

    // 2. Anvil 
    this.anvil = this.add.image(width / 2, height / 2 + 100, 'anvil');
    this.anvil.setScale(0.5);

    // 3. Weapon Sprite
    this.sword = this.add.sprite(width / 2, height / 2 + 60, `sword_0`); // Default
    this.sword.setScale(0.75);
    this.sword.setOrigin(0.5, 1);

    // Initialize correct texture
    this.updateSwordSprite();

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
    const swordY = anvilY - (isMobile ? 20 : 40);
    this.sword.setPosition(centerX, swordY);
    // Adjustment for spritesheets which might be smaller/larger
    // If using individual swords, 0.75 was fine.
    // If using spritesheets (160x170), they are likely smaller than the high-res swords?
    // High res swords (370KB) might be 500px?
    // If we switch to sheet, we might need to SCAL UP.
    // Let's keep 0.75/0.5 for now and adjust via feedback or 'scale' tween.
    this.sword.setScale(isMobile ? 0.5 : 0.75);

    // 4. Hammer
    const hammerX = centerX + (isMobile ? 50 : 80);
    const hammerY = anvilY - (isMobile ? 60 : 120);
    this.hammer.setPosition(hammerX, hammerY);
    this.hammer.setScale(isMobile ? 0.15 : 0.25);
  }

  // Public methods triggered by React
  public async enhance() {
    if (!this.input.enabled) return;

    this.playHammerAnimation();
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
    // Placeholder
  }

  public onSellComplete() {
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
      this.successEmitter.explode(50, this.sword.x, this.sword.y - 100);
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
    const safeLevel = Math.min(this.currentLevel, 21);
    const type = this.currentWeaponType; // SWORD, AXE, DAGGER

    if (type === 'DAGGER') {
      // Dagger still uses sheets for now (as user said "start with sword and axe")
      const textureKey = `sheet_DAGGER`;
      if (this.textures.exists(textureKey)) {
        this.sword.setTexture(textureKey);
        this.sword.setFrame(safeLevel);
        const isMobile = this.scale.width < 768;
        this.sword.setScale(isMobile ? 1.5 : 2.5);
        return;
      }
    }

    // For Sword and Axe (Individual Images)
    // Key format: sword_0, axe_0
    const textureKey = `${type.toLowerCase()}_${safeLevel}`;

    // Fallback if texture missing
    if (!this.textures.exists(textureKey)) {
      console.warn(`Texture ${textureKey} missing, falling back to sword_0`);
      this.sword.setTexture('sword_0');
      this.sword.setScale(0.75);
      return;
    }

    this.sword.setTexture(textureKey);

    // Scale logic
    const isMobile = this.scale.width < 768;
    this.sword.setScale(isMobile ? 0.4 : 0.6); // Slightly smaller if they are large images (500x500)
  }

  public resetLevel() {
    this.currentLevel = 0;
    this.updateSwordSprite();
    if (this.onLevelChange) {
      this.onLevelChange(this.currentLevel);
    }
    this.cameras.main.flash(500, 255, 255, 255);
    if (this.onStatusChange) this.onStatusChange('새로운 의뢰를 위해 초기화', 'NORMAL');
  }

  get width() { return this.scale.width; }
  get height() { return this.scale.height; }
}
