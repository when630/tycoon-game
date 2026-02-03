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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-4 border-yellow-600 rounded-lg p-6 w-[500px] text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">X</button>

        <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">Inventory (Bag)</h2>

        {/* Inventory Section */}
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-gray-400 text-center py-4">Loading...</p>
          ) : relics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <span className="text-4xl mb-2">🎒</span>
              <p>가방이 비어있습니다.</p>
            </div>
          ) : (
            relics.map((relic: Relic) => (
              <div key={relic.id} className="flex items-center bg-gray-800 p-2 rounded border border-gray-700">
                <div className="w-10 h-10 bg-gray-700 rounded mr-3 flex items-center justify-center">
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

export default InventoryModal;
