import React, { useEffect, useState } from 'react';
import client from '../api/client';
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

  const handleAccept = async (id: number) => {
    if (loading) return;
    setLoading(true);
    try {
      await client.post(`/api/v1/contract/accept/${id}`);

      setMessageModal({
        isOpen: true,
        message: "의뢰를 수주했습니다!",
        type: 'SUCCESS'
      });

      onAccept(); // Refresh parent state

      // Remove accepted from local list locally to reflect immediately
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1c23] border-4 border-[#8b4513] rounded-lg p-4 md:p-6 w-full max-w-[700px] h-[80vh] md:h-[500px] text-white shadow-2xl relative flex flex-col font-mono">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">X</button>

        <h2 className="text-3xl font-bold text-center text-[#ffaa00] mb-2 border-b border-gray-700 pb-2">
          📜 의뢰소 (Contract Office)
        </h2>

        <div className="flex justify-end mb-2">
          <button
            onClick={handleRefreshClick}
            disabled={loading}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-gray-300"
          >
            🔄 목록 갱신
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-2 custom-scrollbar">
          {loading && contracts.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-gray-500">
              의뢰 목록을 불러오는 중...
            </div>
          ) : contracts.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-gray-500">
              수주 가능한 의뢰가 없습니다.
            </div>
          ) : (
            contracts.map(contract => (
              <div key={contract.id} className="bg-[#2d2f36] p-4 rounded border border-gray-600 hover:border-[#ffaa00] transition-colors relative flex flex-col justify-between h-[230px]">
                {/* Badge */}
                <span className="absolute -top-2 -left-2 bg-red-800 text-white text-xs px-2 py-1 rounded shadow z-10">
                  목표: +{contract.targetLevel}강
                </span>

                <div className="flex gap-3">
                  {/* Portrait */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-full border-2 border-[#5c3a21] overflow-hidden bg-gray-800 mt-2">
                    <img src={npcImages[contract.id] || '/assets/npc_knight.png'} alt="NPC" className="w-full h-full object-cover pixelated" />
                  </div>

                  <div className="flex-1 mt-2 text-gray-300 text-sm">
                    <p className="mb-2">"이봐, <strong>+{contract.targetLevel}강 검</strong>이 필요하네."</p>

                    <div className="bg-black/30 p-2 rounded text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">보상</span>
                        <span className="text-[#ffd700] font-bold">{contract.rewardGold.toLocaleString()} G</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">위약금</span>
                        <span className="text-gray-500">-{contract.penaltyGold.toLocaleString()} G</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(contract.id)}
                  className="w-full mt-3 bg-[#8b4513] hover:bg-[#a05a2c] text-white py-2 rounded font-bold border-b-4 border-[#5a2d0c] active:border-b-0 active:translate-y-1 transition-all"
                >
                  수주하기
                </button>
              </div>
            ))
          )}
        </div>
      </div>

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
    </div>
  );
};

export default ContractOfficeModal;
