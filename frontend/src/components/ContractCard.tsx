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
    <div className={`absolute top-24 md:top-24 right-4 z-10 flex items-start flex-row-reverse transition-all duration-300 ${isCollapsed ? 'w-auto' : 'w-[90%] md:w-[500px]'}`}>

      {/* NPC Portrait (Right Side) */}
      <div
        className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform z-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "의뢰 펼치기" : "의뢰 접기"}
      >
        <div className="w-full h-full rounded-full border-4 border-[#8b4513] overflow-hidden bg-gray-900 shadow-lg">
          <img src={npcImage} alt="NPC" className="w-full h-full object-cover pixelated" />
        </div>

        {/* Level Indicator Badge on Portrait */}
        <div className="absolute -bottom-2 -left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full border border-white shadow">
          Lv.{contract.targetLevel}
        </div>
      </div>

      {/* Speech Bubble (Left Side) */}
      {!isCollapsed && (
        <div className="relative mr-4 flex-1">
          {/* Bubble Tail */}
          <div className="absolute top-8 -right-3 w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-[#e8d5b5] border-b-[10px] border-b-transparent drop-shadow-sm filter z-10"></div>

          <div className="bg-[#e8d5b5] border-4 border-[#8b4513] rounded-lg p-4 shadow-xl text-gray-900 animate-fade-in relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#c2a67e] pb-2 mb-2">
              <span className="font-bold text-[#5c3a21]">
                {npcImage.includes('knight') ? '왕실 기사' : '떠돌이 상인'}
              </span>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-[#8b4513] hover:text-red-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Dialogue */}
            <p className="text-sm mb-4 leading-relaxed font-serif">
              "이봐, 자네 실력을 좀 보여주게. <br />
              <span className="text-red-700 font-bold bg-yellow-200/50 px-1 rounded">+{contract.targetLevel}강 검</span>이 급히 필요하다네!"
            </p>

            {/* Rewards */}
            <div className="bg-[#d4c0a1]/50 p-2 rounded border border-[#c2a67e] mb-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-[#5c3a21]">성공 보수:</span>
                <span className="text-green-700 font-bold">{contract.rewardGold.toLocaleString()} G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">위약금:</span>
                <span className="text-gray-600">-{contract.penaltyGold.toLocaleString()} G</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isAchieved ? (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-green-700 hover:bg-green-600 text-yellow-100 font-bold py-2 rounded shadow-md border-b-4 border-green-900 active:border-b-0 active:translate-y-1 transition-all animate-pulse"
                >
                  납품하기
                </button>
              ) : (
                <div className="flex-1 bg-gray-500 text-white font-bold py-2 rounded text-center text-xs flex items-center justify-center cursor-not-allowed opacity-70">
                  진행 중 ({currentLevel}/{contract.targetLevel})
                </div>
              )}

              <button
                onClick={handleAcceptNew}
                disabled={loading}
                className="px-3 bg-red-800 hover:bg-red-700 text-white text-xs rounded shadow border-b-2 border-red-950 active:border-b-0 active:translate-y-px transition-all"
                title="새 의뢰 받기"
              >
                포기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Bubble (Tooltip style when collapsed) */}
      {isCollapsed && (
        <div className="mr-3 mt-4 bg-gray-900/80 text-white text-xs px-3 py-1 rounded-full border border-yellow-500 backdrop-blur-sm animate-bounce-slow">
          목표: +{contract.targetLevel}강
        </div>
      )}

    </div>
  );
};

export default ContractCard;
