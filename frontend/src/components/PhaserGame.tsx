import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

interface PhaserGameProps {
  onLevelChange: (level: number) => void;
}

export interface PhaserGameRef {
  resetLevel: () => void;
}

const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(({ onLevelChange }, ref) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useImperativeHandle(ref, () => ({
    resetLevel: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as any;
        if (scene && scene.resetLevel) {
          scene.resetLevel();
        }
      }
    }
  }));

  useEffect(() => {
    if (!gameRef.current) {
      const game = new Phaser.Game(config);
      gameRef.current = game;

      // Wait for scene to be ready (simplified approach)
      game.events.on('ready', () => {
        const scene = game.scene.getScene('MainScene') as any; // Cast to access custom method
        if (scene && scene.setLevelChangeCallback) {
          scene.setLevelChangeCallback(onLevelChange);
        }
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onLevelChange]);

  return <div id="game-container" />;
});

export default PhaserGame;
