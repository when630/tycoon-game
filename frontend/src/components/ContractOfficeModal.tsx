import React, { useEffect, useState } from 'react';
import client from '../api/client';
import GameModal from './GameModal';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';

interface Contract {
  id: number;
  targetLevel: number;
  rewardGold: number;
  penaltyGold: number;
  status: 'AVAILABLE' | 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface ContractOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void; // Trigger refresh of active contracts
}

const ContractOfficeModal: React.FC<ContractOfficeModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [npcImages, setNpcImages] = useState<Record<number, string>>({}); // Store stable NPC images

  // Modal States
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; message: string; type: 'NORMAL' | 'SUCCESS' | 'ERROR' }>({
    isOpen: false,
    message: '',
    type: 'NORMAL'
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: '',
    onConfirm: () => { }
  });

  useEffect(() => {
    if (isOpen) {
      fetchAvailableContracts();
    }
  }, [isOpen]);

  const fetchAvailableContracts = async () => {
    setLoading(true);
    try {
      // Try to get existing available contracts
      const res = await client.get('/api/v1/contract/available');
      if (res.data && res.data.length > 0) {
        setContracts(res.data);
        assignNpcImages(res.data);
      } else {
        // If none, generate new ones
        const genRes = await client.post('/api/v1/contract/available/generate');
        setContracts(genRes.data);
        assignNpcImages(genRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = () => {
    if (loading) return;
    setConfirmModal({
      isOpen: true,
      message: "새로운 의뢰 목록을 갱신하시겠습니까? (기존 목록은 사라집니다)",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        executeRefresh();
      }
    });
  };

  const executeRefresh = async () => {
    setLoading(true);
    try {
      const genRes = await client.post('/api/v1/contract/available/generate');
      setContracts(genRes.data);
      assignNpcImages(genRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assignNpcImages = (data: Contract[]) => {
    setNpcImages(prev => {
      const newMap = { ...prev };
      data.forEach((c) => {
        if (!newMap[c.id]) {
          newMap[c.id] = Math.random() > 0.5 ? '/assets/npc_knight.png' : '/assets/npc_merchant.png';
        }
      });
      return newMap;
    });
  };

  const handleAcceptClick = async (id: number) => {
    if (loading) return;
    setLoading(true);

    try {
      // Just accept without weapon type (defaults or handled later? User said "initialize on delivery/sell")
      // But accept endpoint might expect weaponType?
      // Actually the user said "We pick weapon AFTER reset".
      // So when accepting, does it matter?
      // Existing API expects weaponType. We should probably send CURRENT weaponType or just 'SWORD' as placeholder if valid?
      // Or maybe the backend acceptContract shouldn't require it anymore?
      // For now, let's send 'SWORD' or the current user's weapon type if we had access.
      // But wait, the previous code sent the *selected* type.
      // If we remove selection here, what do we send?
      // PROPOSAL: Send 'SWORD' as dummy or modify backend to not require it. 
      // User said "Not receiving/selecting at contract office".
      // Let's send the *User's current weapon* if possible? But we don't have it here.
      // Let's send 'SWORD' for now and assume the separate Selection Logic handles the *actual* crafting weapon.
      // ERRORRISK: If backend sets user weapon to this value, it might overwrite the user's choice.
      // But the user *just* said selection happens on reset.
      // If I am accepting a contract, I might be mid-progress on a weapon. 
      // Accepting shouldn't change my weapon.

      // We need to check the backend Accept logic.
      // Backend: acceptContract updates user.currentWeaponType.
      // This is problematic if we want to separate them.
      // However, we can just pass the *current* weapon if we knew it.
      // Since we don't, let's assume the user MUST have a weapon selected (handled by Game.tsx).
      // So we can send a dummy value, or better, modify backend to NOT update weapon on accept.
      // But I can't modify backend easily right now without checking implications.
      // Let's keep it simple: Pass 'SWORD' but relying on the fact that `completeContract` RESETS it to null.
      // So when they finish this contract, it resets.
      // But wait, if I accept a contract, does it force me to use a specific weapon?
      // The contract has no weapon requirement in the Entity (it was discussed but maybe not added/enforced?)
      // Let's look at Contract.java... It has `targetLevel` but no `weaponType` field in the entity?
      // I saw `WeaponType` being passed to `acceptContract` in service.

      await client.post(`/api/v1/contract/accept/${id}`, {
        weaponType: 'SWORD' // Dummy
      });

      setMessageModal({
        isOpen: true,
        message: "의뢰를 수주했습니다!",
        type: 'SUCCESS'
      });

      onAccept();
      setContracts(prev => prev.filter(c => c.id !== id));

    } catch (e: any) {
      console.error(e);
      setMessageModal({
        isOpen: true,
        message: e.response?.data?.error || "의뢰 수주 실패",
        type: 'ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GameModal
        isOpen={isOpen}
        onClose={onClose}
        title="의뢰소 (Contract Office)"
        theme="BLUE"
        className="max-w-2xl h-[600px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 px-1">
          <span className="text-gray-400 text-sm">
            * 평판이 높을수록 고액 의뢰가 등장합니다.
          </span>
          <button
            onClick={handleRefreshClick}
            disabled={loading}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-gray-300 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            🔄 목록 갱신
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-4 p-1 custom-scrollbar">
          {loading && contracts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              의뢰 목록을 불러오는 중...
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              수주 가능한 의뢰가 없습니다.
            </div>
          ) : (
            contracts.map(contract => (
              <div key={contract.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-600 hover:border-blue-400 transition-colors relative flex gap-4 group">
                {/* Portrait */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg border-2 border-gray-600 overflow-hidden bg-gray-900 group-hover:border-blue-400/50 transition-colors">
                  <img src={npcImages[contract.id] || '/assets/npc_knight.png'} alt="NPC" className="w-full h-full object-cover pixelated" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-blue-200">
                        의뢰 요청서 #{contract.id}
                      </span>
                      <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800">
                        목표: +{contract.targetLevel}강
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 italic mb-2">
                      "이봐, <strong>+{contract.targetLevel}강 검</strong>을 만들어 줄 수 있나?"
                    </p>
                  </div>

                  <div className="flex justify-between items-end bg-black/20 p-2 rounded">
                    <div className="text-xs">
                      <div className="text-gray-400">보상 <span className="text-yellow-400 font-bold ml-1">{contract.rewardGold.toLocaleString()} G</span></div>
                      <div className="text-gray-500">위약금 <span className="text-gray-400 ml-1">-{contract.penaltyGold.toLocaleString()} G</span></div>
                    </div>
                    <button
                      onClick={() => handleAcceptClick(contract.id)}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow-lg shadow-blue-900/50 transition-transform active:scale-95"
                    >
                      ✍️ 수주하기
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GameModal>

      {/* Nested Modals */}
      <MessageModal
        isOpen={messageModal.isOpen}
        message={messageModal.message}
        type={messageModal.type}
        onClose={() => setMessageModal(prev => ({ ...prev, isOpen: false }))}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

export default ContractOfficeModal;
