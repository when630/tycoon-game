import React, { useEffect, useState } from 'react';
import client from '../api/client';
import GameModal from './GameModal';

interface RelicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Relic {
  id: number;
  name: string;
  description: string;
  level: number;
  currentEffect: number;
  relicType: string;
}

const RelicModal: React.FC<RelicModalProps> = ({ isOpen, onClose }: RelicModalProps) => {
  const [loading, setLoading] = useState(false);
  const [chestState, setChestState] = useState<'CLOSED' | 'OPEN'>('CLOSED');
  const [obtainedRelic, setObtainedRelic] = useState<Relic | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChestState('CLOSED');
      setObtainedRelic(null);
    }
  }, [isOpen]);

  const handleGacha = async () => {
    if (loading) return;

    // Reset to initial state for re-roll animation
    setObtainedRelic(null);
    setChestState('CLOSED');
    setLoading(true);

    try {
      // Minimum delay to show shaking animation (optional, but feels better)
      await new Promise(resolve => setTimeout(resolve, 500));

      const res = await client.post('/api/v1/relic/gacha');
      const newRelic: Relic = res.data;

      // Open the chest
      setChestState('OPEN');

      // Delay to show open chest before showing result
      setTimeout(() => {
        setObtainedRelic(newRelic);
        setLoading(false);
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

  const resetGacha = () => {
    setObtainedRelic(null);
    setChestState('CLOSED');
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
      title="신비한 유물 상점"
      theme="PURPLE"
      className="max-w-md"
    >
      {/* Content Area */}
      <div className="flex flex-col items-center py-6 min-h-[350px] justify-center relative overflow-hidden">

        {!obtainedRelic ? (
          /* Gacha View */
          <>
            <div className="relative mb-8 group cursor-pointer" onClick={handleGacha}>
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full transition-opacity duration-500 ${loading ? 'opacity-40 scale-110' : ''}`}></div>

              <div className={`w-48 h-48 relative transition-transform duration-300 ${loading ? 'scale-110' : 'group-hover:scale-105'}`}>
                <img
                  src={chestState === 'CLOSED' ? '/assets/relic_chest_closed.png' : '/assets/relic_chest_open.png'}
                  alt="Chest"
                  className={`w-full h-full object-contain pixelated drop-shadow-2xl 
                        ${loading && chestState === 'CLOSED' ? 'animate-bounce' : ''}
                        ${chestState === 'CLOSED' ? 'scale-75' : 'scale-x-[-1]'}
                    `}
                />
              </div>
            </div>

            <button
              onClick={handleGacha}
              disabled={loading}
              className={`
                        px-8 py-3 rounded-full font-bold text-lg shadow-lg border-2 transition-all transform active:scale-95 z-10
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
          </>
        ) : (
          /* Result View */
          <div className="flex flex-col items-center animate-fade-in-up w-full">
            {/* Relic Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/30 blur-[60px] rounded-full animate-pulse pointer-events-none" />

            <div className="w-32 h-32 bg-gray-900 rounded-xl border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center mb-6 relative z-10 animate-bounce-custom">
              <img src="/assets/icon_hammer_relic.png" alt="Relic" className="w-20 h-20 pixelated drop-shadow-lg" />
            </div>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300 mb-2 drop-shadow-md">
              {obtainedRelic.name}
            </h3>

            <span className="px-3 py-1 bg-purple-900/50 border border-purple-500/50 rounded-full text-purple-200 text-sm font-bold mb-6 shadow-inner">
              Lv.{obtainedRelic.level}
            </span>

            <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-5 max-w-xs w-full mb-8 text-center backdrop-blur-sm">
              <p className="text-gray-300 text-sm mb-3 leading-relaxed word-keep">
                {obtainedRelic.description}
              </p>
              <div className="h-px w-full bg-gray-700 my-3" />
              <p className="text-green-400 font-bold font-mono text-lg">
                효과: {getEffectDescription(obtainedRelic)}
              </p>
            </div>

            <div className="flex gap-3 w-full px-6">
              <button
                onClick={resetGacha}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors border-b-4 border-gray-900 active:border-b-0 active:translate-y-1"
              >
                확인
              </button>
              <button
                onClick={handleGacha}
                className="flex-1 py-3 bg-gradient-to-b from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg font-bold transition-all border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 shadow-lg shadow-purple-900/50"
              >
                다시 뽑기
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes bounce-custom {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce-custom {
            animation: bounce-custom 3s ease-in-out infinite;
        }
      `}</style>
    </GameModal>
  );
};
export default RelicModal;

