import React, { useEffect, useState } from 'react';
import client from '../api/client';
import GameModal from './GameModal';
import { Trophy, Coins } from 'lucide-react';

interface UserRank {
  id: string;
  nickname: string;
  highestLevel: number;
  gold: number;
}

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose }: RankingModalProps) => {
  const [activeTab, setActiveTab] = useState<'LEVEL' | 'RICH'>('LEVEL');
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
  }, [isOpen, activeTab]);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'LEVEL' ? '/api/v1/rank/level' : '/api/v1/rank/rich';
      const res = await client.get(endpoint);
      setRankings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GameModal
      isOpen={isOpen}
      onClose={onClose}
      title="명예의 전당"
      theme="GOLD"
      className="max-w-md"
    >
      {/* Tabs */}
      <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('LEVEL')}
          className={`flex-1 py-2 text-center rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'LEVEL'
            ? 'bg-yellow-600 text-white font-bold shadow-md'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
        >
          <Trophy size={16} />
          <span className="text-sm">최고의 대장장이</span>
        </button>
        <button
          onClick={() => setActiveTab('RICH')}
          className={`flex-1 py-2 text-center rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'RICH'
            ? 'bg-yellow-600 text-white font-bold shadow-md'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
        >
          <Coins size={16} />
          <span className="text-sm">최고의 부자</span>
        </button>
      </div>

      {/* Ranking List */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-2"></div>
            로딩 중...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700/50">
              <tr>
                <th className="py-2 text-left w-12 pl-2">#</th>
                <th className="py-2 text-left">닉네임</th>
                <th className="py-2 text-right pr-2">
                  {activeTab === 'LEVEL' ? '레벨' : '골드'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {rankings.map((user: UserRank, index: number) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pl-2 font-mono text-gray-500">
                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                  </td>
                  <td className="py-3 font-semibold text-gray-200">
                    {user.nickname}
                    {/* You could add a 'You' badge here if it matches current user */}
                  </td>
                  <td className={`py-3 pr-2 text-right font-bold font-mono ${activeTab === 'LEVEL' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {activeTab === 'LEVEL' ? `+${user.highestLevel}` : `${user.gold.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && rankings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            랭킹 정보가 없습니다.
          </div>
        )}
      </div>
    </GameModal>
  );
};

export default RankingModal;
