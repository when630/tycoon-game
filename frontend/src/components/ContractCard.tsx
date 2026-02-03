import React, { useEffect, useState } from 'react';
import client from '../api/client';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

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
  onRefresh: () => void; // Callback to refresh user data without success feedback
  refreshTrigger: number; // Signal to refresh list
}

const ContractCard: React.FC<ContractCardProps> = ({ currentLevel, onComplete, onRefresh, refreshTrigger }: ContractCardProps) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Global collapse (icon only)
  const [isExpanded, setIsExpanded] = useState(false); // Show all items vs limited

  // Visual helper
  const [npcImages, setNpcImages] = useState<Record<number, string>>({});

  // Message Modal
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; message: string; type: 'NORMAL' | 'SUCCESS' | 'ERROR' }>({
    isOpen: false,
    message: '',
    type: 'NORMAL'
  });

  // Confirm Modal (for Give Up)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; contractId: number | null }>({
    isOpen: false,
    message: '',
    contractId: null
  });

  const requestGiveUp = (contractId: number) => {
    setConfirmModal({
      isOpen: true,
      message: "정말 의뢰를 포기하시겠습니까?\n포기 시 명성이 100 삭감됩니다.",
      contractId
    });
  };

  const handleGiveUp = async () => {
    if (confirmModal.contractId === null || loading) return;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setLoading(true);

    try {
      await client.post(`/api/v1/contract/cancel/${confirmModal.contractId}`);
      fetchActiveContracts();
      // Since reputation drops, we should notify the parent to refresh user info. 
      // Use onRefresh to silently update HUD without completion effects
      onRefresh();

      setMessageModal({
        isOpen: true,
        message: "의뢰를 포기했습니다. 명성이 하락했습니다.",
        type: 'ERROR'
      });

    } catch (e: any) {
      console.error(e);
      setMessageModal({
        isOpen: true,
        message: "의뢰 포기 중 오류가 발생했습니다.",
        type: 'ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveContracts();
  }, [refreshTrigger]);

  const fetchActiveContracts = async () => {
    try {
      const res = await client.get('/api/v1/contract/my');
      setContracts(res.data);

      // Assign random NPCs
      setNpcImages(prev => {
        const newMap = { ...prev };
        res.data.forEach((c: Contract) => {
          if (!newMap[c.id]) {
            newMap[c.id] = Math.random() > 0.5 ? '/assets/npc_knight.png' : '/assets/npc_merchant.png';
          }
        });
        return newMap;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (contractId: number) => {
    if (loading) return;
    setLoading(true);
    try {
      await client.post(`/api/v1/contract/complete/${contractId}`, { itemLevel: currentLevel });

      setMessageModal({
        isOpen: true,
        message: "의뢰 완료! 보상을 받았습니다.",
        type: 'SUCCESS'
      });

      fetchActiveContracts();
      onComplete();
    } catch (e: any) {
      setMessageModal({
        isOpen: true,
        message: e.response?.data?.error || "조건을 만족하지 못했거나 오류가 발생했습니다.",
        type: 'ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  if (contracts.length === 0) {
    return (
      <div className="absolute top-24 right-4 w-64 p-4 bg-gray-800 bg-opacity-90 border-4 border-gray-600 rounded shadow-lg text-white font-mono z-10 animate-pulse text-center">
        <p className="mb-2">진행 중인 의뢰가 없습니다.</p>
        <p className="text-xs text-yellow-500">"의뢰소"에서 새 의뢰를 받아보세요!</p>
      </div>
    );
  }

  // Contract List Logic
  const MAX_VISIBLE = 3;
  const visibleContracts = isExpanded ? contracts : contracts.slice(0, MAX_VISIBLE);
  const hiddenCount = contracts.length - visibleContracts.length;

  // Global collapsed state (Icon only)
  if (isCollapsed) {
    return (
      <div
        className="absolute top-24 right-4 z-10 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setIsCollapsed(false)}
        title="의뢰 목록 펼치기"
      >
        <div className="w-16 h-16 rounded-full border-4 border-[#8b4513] overflow-visible bg-gray-900 shadow-lg relative flex items-center justify-center">
          <img src={npcImages[contracts[0]?.id] || '/assets/npc_knight.png'} alt="NPC" className="w-full h-full object-cover rounded-full pixelated opacity-50" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl z-10 drop-shadow-md">📜</span>

          {/* Badge Number */}
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#1a1c23] z-20 shadow-md">
            {contracts.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-24 right-4 z-10 flex flex-col items-end gap-2 w-64 md:w-[300px] transition-all duration-300">

      {/* Header / Collapse Button */}
      <div className="flex justify-between items-center w-full bg-gray-900/90 p-2 rounded border border-gray-600 mb-1">
        <span className="text-sm font-bold text-gray-300">진행 중 의뢰 ({contracts.length})</span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-white"
        >
          ✕ 접기
        </button>
      </div>

      {/* Contract Items Stack */}
      {visibleContracts.map((contract) => {
        const isAchieved = currentLevel >= contract.targetLevel;
        const npcImg = npcImages[contract.id] || '/assets/npc_knight.png';

        return (
          <div key={contract.id} className="relative w-full bg-[#e8d5b5] border-4 border-[#8b4513] rounded-lg p-3 shadow-lg flex gap-3 items-center animate-slide-in-right">

            {/* Portrait */}
            <div className="w-12 h-12 flex-shrink-0 rounded-full border-2 border-[#5c3a21] overflow-hidden bg-gray-800">
              <img src={npcImg} alt="NPC" className="w-full h-full object-cover pixelated" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[#5c3a21] text-sm">+{contract.targetLevel}강 납품</span>
                <span className="text-green-700 font-bold text-xs">{contract.rewardGold.toLocaleString()} G</span>
              </div>
              <div className="text-xs text-gray-600 truncate">
                진행: <span className={isAchieved ? "text-green-600 font-bold" : "text-gray-500"}>{currentLevel}</span> / {contract.targetLevel}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1 items-end">
              {/* Complete Button (Small) */}
              <button
                onClick={() => handleComplete(contract.id)}
                disabled={!isAchieved || loading}
                className={`px-3 py-1 rounded text-xs font-bold border-b-2 active:border-b-0 active:translate-y-0.5 transition-all w-16 mb-1 ${isAchieved
                  ? 'bg-green-700 text-yellow-100 border-green-900 hover:bg-green-600 animate-pulse'
                  : 'bg-gray-400 text-gray-200 border-gray-600 cursor-not-allowed'
                  }`}
              >
                {isAchieved ? "완료" : "진행"}
              </button>

              {/* Give Up Button */}
              <button
                onClick={() => requestGiveUp(contract.id)}
                disabled={loading}
                className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold"
              >
                포기
              </button>
            </div>
          </div>
        );
      })}

      {/* Show More / Show Less Button */}
      {contracts.length > MAX_VISIBLE && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs py-1 px-4 rounded-full border border-gray-600 backdrop-blur-sm transition-colors"
        >
          {isExpanded ? "▲ 접기" : `▼ 외 ${hiddenCount}건 더 보기`}
        </button>
      )}

      <MessageModal
        isOpen={messageModal.isOpen}
        message={messageModal.message}
        type={messageModal.type}
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={handleGiveUp}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};

export default ContractCard;

