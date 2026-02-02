import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame from '../components/PhaserGame';

import ContractCard from '../components/ContractCard';
import RankingModal from '../components/RankingModal';
import RelicModal from '../components/RelicModal';
import { useState } from 'react';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Unknown';
  const [currentLevel, setCurrentLevel] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-render of ContractCard
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRelicOpen, setIsRelicOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    navigate('/');
  };

  const handleContractComplete = () => {
    // Contract completed, maybe play a sound or show a toast
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md z-20">
        <div className="flex flex-col">
          <h2 className="m-0 text-blue-400 text-2xl font-bold">Forge Tycoon</h2>
          <span className="text-xs text-gray-500">v1.1.0 (Auto-Logout Fix)</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRankingOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition-colors"
          >
            <img src="/assets/trophy_icon.png" alt="Rank" className="w-5 h-5 pixelated" />
            RANKING
          </button>

          <button
            onClick={() => setIsRelicOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors ml-2"
          >
            <span className="text-xl">💎</span>
            RELICS
          </button>

          <div className="h-6 w-px bg-gray-600 mx-2"></div>

          <span>PLAYER: <strong>{nickname}</strong></span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-400 cursor-pointer hover:bg-blue-400/10 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center relative bg-gray-950 overflow-hidden">
        {/* Contract Overlay */}
        <ContractCard
          key={refreshKey}
          currentLevel={currentLevel}
          onComplete={handleContractComplete}
        />

        {/* Ranking Modal */}
        <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />

        {/* Relic Modal */}
        <RelicModal isOpen={isRelicOpen} onClose={() => setIsRelicOpen(false)} />

        <PhaserGame onLevelChange={setCurrentLevel} />
      </main>
    </div>
  );
};

export default Game;
