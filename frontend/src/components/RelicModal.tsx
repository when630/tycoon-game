import React, { useEffect, useState } from 'react';
import client from '../api/client';


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
      }, 500);

    } catch (e: any) {
      setLoading(false);
      setChestState('CLOSED');

      if (e.response && e.response.data && e.response.data.error) {
        alert(e.response.data.error);
      } else {
        alert("뽑기 실패했습니다.");
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

        {/* Inventory Section Removed */}
      </div>
    </div>
  );
};

export default RelicModal;
