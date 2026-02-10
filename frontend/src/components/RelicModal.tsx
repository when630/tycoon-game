import React, { useEffect, useState } from 'react';
import client from '../api/client';
import GameModal from './GameModal';

interface RelicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelicModal: React.FC<RelicModalProps> = ({ isOpen, onClose }: RelicModalProps) => {
  const [loading, setLoading] = useState(false);
  const [chestState, setChestState] = useState<'CLOSED' | 'OPEN'>('CLOSED');

  useEffect(() => {
    if (isOpen) {
      setChestState('CLOSED');
    }
  }, [isOpen]);

  const handleGacha = async () => {
    if (loading) return;
    setLoading(true);
    setChestState('OPEN'); // Animation trigger

    try {
      const res = await client.post('/api/v1/relic/gacha');
      const newRelic = res.data;

      // Delay for animation
      setTimeout(() => {
        alert(`유물 획득!\n${newRelic.name} (Lv.${newRelic.level})\n${newRelic.description}`);
        setLoading(false);
        setChestState('CLOSED');
      }, 800);

    } catch (e: any) {
      setTimeout(() => {
        setLoading(false);
        setChestState('CLOSED');

        if (e.response && e.response.data && e.response.data.error) {
          alert(e.response.data.error);
        } else {
          alert("뽑기 실패했습니다.");
        }
      }, 800);
    }
  };

  return (
    <GameModal
      isOpen={isOpen}
      onClose={onClose}
      title="신비한 유물 상점"
      theme="PURPLE"
      className="max-w-md"
    >
      {/* Gacha Section */}
      <div className="flex flex-col items-center py-6 min-h-[300px] justify-center">

        <div className="relative mb-8 group cursor-pointer" onClick={handleGacha}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full transition-opacity duration-500 ${loading ? 'opacity-40 scale-110' : ''}`}></div>

          <div className={`w-48 h-48 relative transition-transform duration-300 ${loading ? 'scale-110' : 'group-hover:scale-105'}`}>
            <img
              src={chestState === 'CLOSED' ? '/assets/relic_chest_closed.png' : '/assets/relic_chest_open.png'}
              alt="Chest"
              className={`w-full h-full object-contain pixelated drop-shadow-2xl ${loading ? 'animate-bounce' : ''}`}
            />
          </div>
        </div>

        <button
          onClick={handleGacha}
          disabled={loading}
          className={`
                px-8 py-3 rounded-full font-bold text-lg shadow-lg border-2 transition-all transform active:scale-95
                ${loading
              ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-b from-purple-600 to-purple-800 border-purple-400 text-purple-100 hover:from-purple-500 hover:to-purple-700 hover:shadow-purple-500/50 hover:-translate-y-1'
            }
            `}
        >
          {loading ? '소환 중...' : (
            <span className="flex items-center gap-2">
              <span>🔮</span> 유물 소환 <span className="text-sm opacity-80">(5,000 G)</span>
            </span>
          )}
        </button>

        <p className="mt-6 text-xs text-purple-300/60 text-center px-8">
          신비한 힘이 깃든 상자입니다. <br />
          강화에 도움이 되는 유물을 얻을 수 있습니다.
        </p>
      </div>
    </GameModal>
  );
};
export default RelicModal;

