import React, { useState, useEffect } from 'react';
import client from '../api/client';
import MessageModal from './MessageModal';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  itemBaseValue: number;
  onSellComplete: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, currentLevel, itemBaseValue, onSellComplete }) => {
  const [loading, setLoading] = useState(false);
  const [estimatedReward, setEstimatedReward] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Message Modal
  const [messageModal, setMessageModal] = useState<{ isOpen: boolean; message: string; type: 'NORMAL' | 'SUCCESS' | 'ERROR' }>({
    isOpen: false,
    message: '',
    type: 'NORMAL'
  });

  useEffect(() => {
    if (isOpen) {
      // Calculate estimated reward: Cost * 1.2
      let totalCost = 0;
      for (let i = 0; i < currentLevel; i++) {
        totalCost += itemBaseValue * Math.pow(i + 1, 2);
      }
      setEstimatedReward(Math.floor(totalCost * 1.2));
      setError(null);
    }
  }, [isOpen, currentLevel, itemBaseValue]);

  const handleSell = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.post('/api/v1/game/sell', {
        currentLevel: currentLevel,
        itemBaseValue: itemBaseValue
      });

      // Success
      onSellComplete();

      // Instead of Alert, we might just close or show success modal.
      // User says "Replace system alert to game modal".
      // But here, if we close immediately, the modal might disappear too fast.
      // Let's show the modal first, then close on modal close?
      // Or just standard "close this modal, show message modal".

      // Since MessageModal needs to be rendered, we can keep SellModal open? No, SellModal usually closes.
      // If we render MessageModal INSIDE SellModal, and SellModal closes, MessageModal also closes.
      // So MessageModal should be handled by parent? OR, we keep SellModal open but show MessageModal on top?
      // Actually, standard behavior: Show Success, then on Close of Success, Close SellModal.
      setMessageModal({
        isOpen: true,
        message: res.data.message,
        type: 'SUCCESS'
      });

    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.error) {
        setError(e.response.data.error);
      } else {
        setError("판매 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClose = () => {
    setMessageModal(prev => ({ ...prev, isOpen: false }));
    if (messageModal.type === 'SUCCESS') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in p-4">
      <div className="bg-gray-800 border-4 border-green-700 p-6 rounded-lg shadow-2xl w-full max-w-sm relative">
        <h2 className="text-2xl font-bold text-green-500 mb-4 text-center">장비 판매</h2>

        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">현재 장비를 판매하시겠습니까?</p>
          <div className="text-4xl font-mono text-yellow-400 font-bold my-4">
            +{currentLevel} 강
          </div>
          <p className="text-sm text-gray-400">판매 시 장비는 초기화됩니다.</p>
        </div>

        <div className="bg-gray-900 p-4 rounded mb-6 border border-gray-700">
          <div className="flex justify-between text-lg">
            <span className="text-gray-400">판매 금액:</span>
            <span className="text-green-400 font-bold">{estimatedReward.toLocaleString()} G</span>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center mb-4 font-bold animate-pulse">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleSell}
            className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded font-bold transition-colors flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="mr-2">💰</span> 판매하기
              </>
            )}
          </button>
        </div>
      </div>

      <MessageModal
        isOpen={messageModal.isOpen}
        message={messageModal.message}
        type={messageModal.type}
        onClose={handleMessageClose}
      />

    </div>
  );
};

export default SellModal;

