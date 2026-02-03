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
  failRate: number;
  destroyRate: number;
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
      const res = await client.get(`/api/v1/game/probability?level=${currentLevel}`);
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
            강화 확률 정보 (Lv.{currentLevel} → Lv.{currentLevel + 1})
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          {loading ? (
            <p className="text-gray-400 animate-pulse">데이터 불러오는 중...</p>
          ) : data ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="text-green-400 font-bold text-lg">{(data.successRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">성공</div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="text-orange-400 font-bold text-lg">{(data.failRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">실패</div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="text-red-500 font-bold text-lg">{(data.destroyRate * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">파괴</div>
              </div>
            </div>
          ) : (
            <p className="text-red-400">정보를 불러올 수 없습니다.</p>
          )}

          <div className="text-xs text-gray-500 mt-4 text-left bg-black/20 p-2 rounded">
            <p>* 유물 효과 미적용 기본 확률입니다.</p>
            <p>* 실제 확률은 보유 유물에 따라 달라질 수 있습니다.</p>
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
