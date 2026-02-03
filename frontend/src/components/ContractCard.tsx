import React, { useEffect, useState } from 'react';
import client from '../api/client';

interface Contract {
  id: number;
  targetLevel: number;
  rewardGold: number;
  penaltyGold: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface ContractCardProps {
  currentLevel: number; // Current level of the item being forged
  onComplete: () => void; // Callback when contract is completed
}

const ContractCard: React.FC<ContractCardProps> = ({ currentLevel, onComplete }: ContractCardProps) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [npcImage, setNpcImage] = useState('/assets/npc_knight.png');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchCurrentContract();
    // Randomize NPC
    setNpcImage(Math.random() > 0.5 ? '/assets/npc_knight.png' : '/assets/npc_merchant.png');
  }, []);

  const fetchCurrentContract = async () => {
    try {
      const res = await client.get('/api/v1/contract/current');
      if (res.data) {
        setContract(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptNew = async () => {
    setLoading(true);
    try {
      const res = await client.post('/api/v1/contract/new');
      setContract(res.data);
      // Change NPC on new contract
      setNpcImage(Math.random() > 0.5 ? '/assets/npc_knight.png' : '/assets/npc_merchant.png');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      await client.post('/api/v1/contract/complete', { itemLevel: currentLevel });
      setContract(null); // Clear contract (or show success state)
      alert("의뢰 완료! 보상을 받았습니다.");
      onComplete(); // Refresh user data
    } catch (e) {
      alert("조건을 만족하지 못했거나 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!contract) {
    return (
      <div className="absolute top-4 right-4 w-64 p-4 bg-gray-800 bg-opacity-90 border-4 border-yellow-600 rounded shadow-lg text-white font-mono z-10">
        <p className="mb-4 text-center">현재 의뢰가 없습니다.</p>
        <button
          onClick={handleAcceptNew}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          새 의뢰 받기
        </button>
      </div>
    );
  }

  const isAchieved = currentLevel >= contract.targetLevel;

  return (
    <div className={`absolute top-[80px] left-1/2 -translate-x-1/2 font-mono z-10 transition-all duration-300 ${isCollapsed ? 'w-auto' : 'w-[95%] md:w-80'} md:left-auto md:translate-x-0 md:top-20 md:right-4`}>
      {/* NPC Portrait (Click triggers collapse toggle) */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-16 top-0 w-20 h-20 bg-gray-900 border-2 border-white rounded-full overflow-hidden shadow-lg z-20 cursor-pointer hover:scale-105 transition-transform"
        title={isCollapsed ? "의뢰 펼치기" : "의뢰 접기"}
      >
        <img src={npcImage} alt="NPC" className="w-full h-full object-cover pixelated" />
        {/* Toggle Indicator */}
        <div className="absolute bottom-0 w-full bg-black bg-opacity-70 text-white text-[10px] text-center">
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>

      {/* Dialog Box - Hidden when collapsed, or simplified */}
      {!isCollapsed && (
        <div className="relative bg-[#e8d5b5] border-4 border-[#8b4513] p-4 text-gray-900 rounded shadow-xl ml-4 animation-fade-in">
          <h3 className="font-bold text-lg mb-1 border-b border-[#8b4513] pb-1 flex justify-between">
            <span>{npcImage.includes('knight') ? '왕실 기사' : '떠돌이 상인'}</span>
            <button onClick={() => setIsCollapsed(true)} className="text-gray-600 hover:text-black">_</button>
          </h3>
          <p className="text-sm mb-3 font-semibold">
            "자네, 이 검을 <span className="text-red-600 text-lg">+{contract.targetLevel}강</span>까지 만들어줄 수 있겠나?"
          </p>

          <div className="text-xs bg-[#d4c0a1] p-2 rounded mb-3">
            <div className="flex justify-between">
              <span>보상:</span> <span className="text-green-700 font-bold">{contract.rewardGold} G</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>배상금:</span> <span>{contract.penaltyGold} G</span>
            </div>
          </div>

          <div className="flex gap-2">
            {isAchieved ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded shadow animate-pulse"
              >
                납품하기
              </button>
            ) : (
              <button
                disabled
                className="flex-1 bg-gray-400 text-white font-bold py-2 rounded cursor-not-allowed"
              >
                강화 부족 ({currentLevel}/{contract.targetLevel})
              </button>
            )}
            <button
              onClick={handleAcceptNew}
              className="px-2 bg-red-800 hover:bg-red-700 text-white text-xs rounded"
              title="새 의뢰 받기 (위약금 발생)"
            >
              포기
            </button>
          </div>
        </div>
      )}

      {/* Minimized View (Optional: Just showing target level when collapsed) */}
      {isCollapsed && (
        <div className="absolute left-6 top-4 bg-gray-900 text-white px-2 py-1 rounded border border-yellow-500 text-xs shadow-md whitespace-nowrap ml-4">
          목표: +{contract.targetLevel}강
        </div>
      )}
    </div>
  );
};

export default ContractCard;
