import React, { useEffect, useState } from 'react';
import client from '../api/client';

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

const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-4 border-yellow-600 rounded-lg p-6 w-96 relative font-mono text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          X
        </button>

        <h2 className="text-2xl font-bold text-center text-yellow-500 mb-6">HALL OF FAME</h2>

        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-600">
          <button
            onClick={() => setActiveTab('LEVEL')}
            className={`flex-1 py-2 text-center ${activeTab === 'LEVEL'
                ? 'text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Top Smith
          </button>
          <button
            onClick={() => setActiveTab('RICH')}
            className={`flex-1 py-2 text-center ${activeTab === 'RICH'
                ? 'text-yellow-400 border-b-2 border-yellow-400 font-bold'
                : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Rich Smith
          </button>
        </div>

        {/* Ranking List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2 text-left w-12">#</th>
                  <th className="py-2 text-left">Nickname</th>
                  <th className="py-2 text-right">
                    {activeTab === 'LEVEL' ? 'Level' : 'Gold'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((user, index) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3">
                      {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                    </td>
                    <td className="py-3 font-semibold text-gray-200">{user.nickname}</td>
                    <td className={`py-3 text-right font-bold ${activeTab === 'LEVEL' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {activeTab === 'LEVEL' ? `+${user.highestLevel}` : `${user.gold.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && rankings.length === 0 && (
            <div className="text-center py-8 text-gray-500">No records found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingModal;
