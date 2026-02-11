import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import client from '../api/client';

interface ProbabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
}

interface ProbabilityData {
  successRate: number;
  baseSuccessRate: number;
  relicSuccessBonus: number;

  failRate: number;

  destroyRate: number;
  baseDestroyRate: number;
  relicDestroyReduction: number;
}

const ProbabilityModal: React.FC<ProbabilityModalProps> = ({ isOpen, onClose, currentLevel }) => {
  const [data, setData] = useState<ProbabilityData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProbability();
    }
  }, [isOpen, currentLevel]);

  const fetchProbability = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/api/v1/game/probabilities?currentLevel=${currentLevel}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg shadow-2xl max-w-sm w-full relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-400" />
            <span className="text-sm md:text-base">강화 확률 정보 (Lv.{currentLevel} → Lv.{currentLevel + 1})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {loading ? (
            <p className="text-gray-400 animate-pulse text-center">데이터 불러오는 중...</p>
          ) : data ? (
            <div className="space-y-4">
              {/* Success Rate */}
              <div className="bg-gray-800/50 p-3 rounded border border-green-900/50">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-green-400 font-bold">성공 확률</span>
                  <span className="text-2xl font-black text-green-400">{Math.min(data.successRate * 100, 100).toFixed(1)}%</span>
                </div>
                {data.relicSuccessBonus > 0 && (
                  <div className="text-xs text-right text-green-600/70 border-t border-green-900/30 pt-1">
                    기본 {(data.baseSuccessRate * 100).toFixed(1)}% + 유물 <span className="font-bold">{(data.relicSuccessBonus * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {/* Fail Rate */}
              <div className="bg-gray-800/50 p-3 rounded border border-orange-900/50">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-orange-400 font-bold">실패 확률</span>
                  <span className="text-xl font-bold text-orange-400">{(data.failRate * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Destroy Rate */}
              <div className="bg-gray-800/50 p-3 rounded border border-red-900/50">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-red-500 font-bold">파괴 확률</span>
                  <span className="text-xl font-bold text-red-500">{(data.destroyRate * 100).toFixed(1)}%</span>
                </div>
                {data.relicDestroyReduction > 0 && (
                  <div className="text-xs text-right text-red-600/70 border-t border-red-900/30 pt-1">
                    기본 {(data.baseDestroyRate * 100).toFixed(1)}% - 유물 <span className="font-bold">{(data.relicDestroyReduction * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-red-400 text-center">정보를 불러올 수 없습니다.</p>
          )}

          <div className="text-xs text-gray-500 mt-4 text-center">
            <p>* 현재 보유 중인 유물 효과가 반영된 확률입니다.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600 text-gray-200 rounded transition-colors text-sm font-bold"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProbabilityModal;
