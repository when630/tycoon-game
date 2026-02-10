import React, { useEffect, useState } from 'react';
import client from '../api/client';
import GameModal from './GameModal';

interface Relic {
  id: number;
  name: string;
  description: string;
  level: number;
  currentEffect: number;
  relicType: string;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRelics();
    }
  }, [isOpen]);

  const fetchRelics = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/v1/relic/my');
      setRelics(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getEffectDescription = (relic: Relic) => {
    let multiplier = 1;
    if (relic.relicType.includes('RATE') || relic.relicType.includes('COST') || relic.relicType.includes('REWARD')) {
      multiplier = 100;
    }
    return `${(relic.currentEffect * multiplier).toFixed(1)}%`;
  }

  return (
    <GameModal
      isOpen={isOpen}
      onClose={onClose}
      title="인벤토리 (가방)"
      theme="GREEN"
      className="max-w-lg"
    >
      {/* Inventory Section */}
      <div className="grid grid-cols-1 gap-3 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
            로딩 중...
          </div>
        ) : relics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 opacity-70">
            <span className="text-6xl mb-4 grayscale">🎒</span>
            <p className="font-mono">가방이 비어있습니다.</p>
          </div>
        ) : (
          relics.map((relic: Relic) => (
            <div key={relic.id} className="flex items-center bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors shadow-sm">
              <div className="w-12 h-12 bg-gray-900 rounded-md mr-4 flex items-center justify-center border border-gray-700 shadow-inner group-hover:border-green-500/30">
                <img src="/assets/icon_hammer_relic.png" alt="Icon" className="w-8 h-8 pixelated opacity-80" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-200">{relic.name}</span>
                  <span className="text-xs font-bold bg-green-900/50 text-green-300 px-2 py-0.5 rounded border border-green-800">
                    Lv.{relic.level}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{relic.description}</p>
                <p className="text-xs text-green-400 font-mono">
                  현재 효과: {getEffectDescription(relic)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </GameModal>
  );
};

export default InventoryModal;
