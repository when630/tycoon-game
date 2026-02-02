import React, { useEffect, useState } from 'react';
import client from '../api/client';

interface Relic {
  id: number;
  name: string;
  description: string;
  level: number;
  currentEffect: number;
  relicType: string;
}

interface RelicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelicModal: React.FC<RelicModalProps> = ({ isOpen, onClose }: RelicModalProps) => {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(false);
  const [chestState, setChestState] = useState<'CLOSED' | 'OPEN'>('CLOSED');

  useEffect(() => {
    if (isOpen) {
      fetchRelics();
      setChestState('CLOSED');
    }
  }, [isOpen]);

  const fetchRelics = async () => {
    try {
      const res = await client.get('/api/v1/relic/my');
      setRelics(res.data);
    } catch (e) {
      console.error(e);
    }
  };

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
        fetchRelics();
        setLoading(false);
        setChestState('CLOSED');
      }, 500);

    } catch (e: any) {
      setLoading(false);
      setChestState('CLOSED');
      if (e.response && e.response.status === 500) {
        // Ideally backend should return 400 for logic error, but simple check
        alert("골드가 부족합니다! (비용: 5000 G)");
      } else {
        alert("뽑기 실패");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-4 border-purple-600 rounded-lg p-6 w-[500px] text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">X</button>

        <h2 className="text-2xl font-bold text-center text-purple-400 mb-4">Mystic Relic Shop</h2>

        {/* Gacha Section */}
        <div className="flex flex-col items-center mb-6 border-b border-gray-700 pb-6">
          <div className="w-32 h-32 mb-4 relative">
            <img
              src={chestState === 'CLOSED' ? '/assets/relic_chest_closed.png' : '/assets/relic_chest_open.png'}
              alt="Chest"
              className={`w-full h-full object-contain pixelated ${loading ? 'animate-bounce' : ''}`}
            />
          </div>
          <button
            onClick={handleGacha}
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded font-bold border-2 border-purple-400 shadow-lg transition-transform active:scale-95"
          >
            {loading ? 'Opening...' : 'Summon Relic (5,000 G)'}
          </button>
        </div>

        {/* Inventory Section */}
        <h3 className="text-lg font-bold mb-2">My Relics</h3>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {relics.length === 0 ? (
            <p className="text-gray-500 text-center py-4">보유한 유물이 없습니다.</p>
          ) : (
            relics.map((relic: Relic) => (
              <div key={relic.id} className="flex items-center bg-gray-800 p-2 rounded border border-gray-700">
                <div className="w-10 h-10 bg-gray-700 rounded mr-3 flex items-center justify-center">
                  {/* Generic icon for now, ideally mapped by type */}
                  <img src="/assets/icon_hammer_relic.png" alt="Icon" className="w-8 h-8 pixelated" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-500">{relic.name}</span>
                    <span className="text-xs bg-purple-900 px-1 rounded text-purple-200">Lv.{relic.level}</span>
                  </div>
                  <p className="text-xs text-gray-400">{relic.description}</p>
                  <p className="text-xs text-green-400">Current Effect: {(relic.currentEffect * (relic.relicType.includes('RATE') ? 100 : (relic.relicType.includes('COST') ? 100 : (relic.relicType.includes('REWARD') ? 100 : 1)))).toFixed(1)}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RelicModal;
