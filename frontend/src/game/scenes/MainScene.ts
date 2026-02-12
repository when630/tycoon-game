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

    // Event listener for lazy loaded assets
    this.load.on('filecomplete', (key: string) => {
      // Check if the loaded file is relevant to the current weapon display
      const currentKey = `${this.currentWeaponType.toLowerCase()}_${Math.min(this.currentLevel, 20)}`;
      if (key === currentKey) {
        // console.log(`Asset loaded: ${key}, updating sprite`);
        this.updateSwordSprite();
      }
    });

    // Load base weapons only (Lazy load the rest)
    this.load.image('sword_0', '/assets/weapon/sword/sword_00.png');
    this.load.image('axe_0', '/assets/weapon/axe/axe_00.png');
    this.load.image('dagger_0', '/assets/weapon/dagger/dagger_00.png');
  }

  create() {
    // Resize Handler
    this.scale.on('resize', this.handleResize, this);
  }

  /* ... */

  private lazyLoadAssets() {
    // Load remaining sword images
    const totalWeapons = 20;

    // Sword
    for (let i = 1; i <= totalWeapons; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      const key = `sword_${i}`;
      if (!this.textures.exists(key)) {
        this.load.image(key, `/assets/weapon/sword/sword_${paddedIndex}.png`);
      }
    }

    // Axe
    for (let i = 1; i <= totalWeapons; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      const key = `axe_${i}`;
      if (!this.textures.exists(key)) {
        this.load.image(key, `/assets/weapon/axe/axe_${paddedIndex}.png`);
      }
    }

    // Dagger
    for (let i = 1; i <= totalWeapons; i++) {
      const paddedIndex = i.toString().padStart(2, '0');
      const key = `dagger_${i}`;
      if (!this.textures.exists(key)) {
        this.load.image(key, `/assets/weapon/dagger/dagger_${paddedIndex}.png`);
      }
    }

    this.load.start();
  }

  /* ... */

  private updateSwordSprite() {
    if (!this.sword) return; // Safety check
    const safeLevel = Math.min(this.currentLevel, 20); // Changed to 20 to be safe with max index
    const type = this.currentWeaponType; // SWORD, AXE, DAGGER

    // Key format: sword_0, axe_0, dagger_0
    const textureKey = `${type.toLowerCase()}_${safeLevel}`;

    // Fallback if texture missing
    if (!this.textures.exists(textureKey)) {
      // console.warn(`Texture ${textureKey} missing, falling back to level 0`);
      this.sword.setTexture(`${type.toLowerCase()}_0`);
      this.sword.setScale(0.75);
      return;
    }

    // console.log('UpdateSword:', textureKey, this.textures.exists(textureKey));

    this.sword.setTexture(textureKey);

    // Scale logic
    const isMobile = this.scale.width < 768;
    this.sword.setScale(isMobile ? 0.5 : 0.75); // Restored to 0.75
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
