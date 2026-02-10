import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import config from '../game/config';

interface PhaserGameProps {
  onLevelChange: (level: number) => void;
  // onSellRequest: () => void; // Removed
  onGoldChange: (gold: number) => void;
  onReputationChange: (reputation: number) => void;
  onStatusChange: (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => void;
}

export interface PhaserGameRef {
  resetLevel: () => void;
  enhance: () => void;
  onSellComplete: () => void;
}

const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(({ onLevelChange, onGoldChange, onReputationChange, onStatusChange }, ref) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useImperativeHandle(ref, () => ({
    resetLevel: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as any;
        if (scene && scene.resetLevel) {
          scene.resetLevel();
        }
      }
    },
    enhance: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as any;
        if (scene && scene.enhance) {
          scene.enhance();
        }
      }
    },
    onSellComplete: () => {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('MainScene') as any;
        if (scene && scene.onSellComplete) {
          scene.onSellComplete();
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
          scene.setCallbacks(onLevelChange, onGoldChange, onReputationChange, onStatusChange);
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
        scene.setCallbacks(onLevelChange, onGoldChange, onReputationChange, onStatusChange);
      }
    }
  }, [onLevelChange, onGoldChange, onReputationChange, onStatusChange]);

  return <div id="game-container" className="absolute inset-0 w-full h-full z-0" />;
});

export default PhaserGame;
