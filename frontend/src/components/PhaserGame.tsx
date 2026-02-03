import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

interface PhaserGameProps {
  onLevelChange: (level: number) => void;
  onSellRequest: () => void;
  onGoldChange: (gold: number) => void;
  onReputationChange: (reputation: number) => void;
  onStatusChange: (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => void;
}

export interface PhaserGameRef {
  resetLevel: () => void;
}

const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(({ onLevelChange, onSellRequest, onGoldChange, onReputationChange, onStatusChange }, ref) => {
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

      game.events.on('ready', () => {
        const scene = game.scene.getScene('MainScene') as any;
        if (scene && scene.setCallbacks) {
          scene.setCallbacks(onLevelChange, onSellRequest, onGoldChange, onReputationChange, onStatusChange);
        }
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Sync callbacks when they change
  useEffect(() => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MainScene') as any;
      if (scene && scene.setCallbacks) {
        scene.setCallbacks(onLevelChange, onSellRequest, onGoldChange, onReputationChange, onStatusChange);
      }
    }
  }, [onLevelChange, onSellRequest, onGoldChange, onReputationChange, onStatusChange]);

  return <div id="game-container" />;
});

export default PhaserGame;
