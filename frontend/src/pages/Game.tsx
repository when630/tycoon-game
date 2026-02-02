import React from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame from '../components/PhaserGame';

import ContractCard from '../components/ContractCard';
import { useState } from 'react';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Unknown';
  const [currentLevel, setCurrentLevel] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-render of ContractCard

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
        <h2 className="m-0 text-blue-400 text-2xl font-bold">Forge Tycoon</h2>
        <div className="flex items-center gap-4">
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

        <PhaserGame onLevelChange={setCurrentLevel} />
      </main>
    </div>
  );
};

export default Game;
