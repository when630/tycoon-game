import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame, { PhaserGameRef } from '../components/PhaserGame';

import ContractCard from '../components/ContractCard';
import RankingModal from '../components/RankingModal';
import RelicModal from '../components/RelicModal';
import InventoryModal from '../components/InventoryModal';
import SellModal from '../components/SellModal';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Unknown';

  const [currentLevel, setCurrentLevel] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-render of ContractCard
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const phaserRef = useRef<PhaserGameRef>(null);

  const [isRelicOpen, setIsRelicOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when navigating or opening modals
  const openModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    navigate('/');
  };

  const handleContractComplete = () => {
    setRefreshKey(prev => prev + 1);
    // Reset sword level in Phaser
    if (phaserRef.current) {
      phaserRef.current.resetLevel();
    }
  };

  const handleSellRequest = () => {
    setIsSellModalOpen(true);
  };

  const handleSellComplete = () => {
    // Reset sword level in Phaser
    if (phaserRef.current) {
      phaserRef.current.resetLevel();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-mono">
      <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md z-30 relative">
        <div className="flex flex-col">
          <h2 className="m-0 text-blue-400 text-2xl font-bold tracking-wider">Forge Tycoon</h2>
          <span className="text-xs text-gray-500">v1.1.2</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <span>플레이어: <strong>{nickname}</strong></span>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded hover:bg-gray-700 transition-colors focus:outline-none"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block w-full h-1 bg-white rounded transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-full h-1 bg-white rounded transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-1 bg-white rounded transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 w-48 bg-gray-800 border-l border-b border-gray-600 shadow-xl z-40 flex flex-col animation-slide-in">
            <div className="md:hidden p-3 border-b border-gray-700 text-center text-sm text-gray-400">
              플레이어: <strong className="text-white">{nickname}</strong>
            </div>

            <button
              onClick={() => openModal(setIsRankingOpen)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-left transition-colors border-b border-gray-700"
            >
              <img src="/assets/trophy_icon.png" alt="Rank" className="w-5 h-5 pixelated" />
              <span>랭킹</span>
            </button>

            <button
              onClick={() => openModal(setIsInventoryOpen)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-left transition-colors border-b border-gray-700"
            >
              <span className="text-xl">🎒</span>
              <span>가방</span>
            </button>

            <button
              onClick={() => openModal(setIsRelicOpen)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-left transition-colors border-b border-gray-700"
            >
              <span className="text-xl">💎</span>
              <span>유물</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 hover:bg-red-900/30 text-red-400 text-left transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </header>

      {/* Click outside overlay to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex items-center justify-center relative bg-gray-950 overflow-hidden">
        {/* Contract Overlay */}
        <ContractCard
          key={refreshKey}
          currentLevel={currentLevel}
          onComplete={handleContractComplete}
        />

        {/* Modal Components */}
        <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
        <RelicModal isOpen={isRelicOpen} onClose={() => setIsRelicOpen(false)} />
        <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />

        <SellModal
          isOpen={isSellModalOpen}
          onClose={() => setIsSellModalOpen(false)}
          currentLevel={currentLevel}
          itemBaseValue={100}
          onSellComplete={handleSellComplete}
        />

        <PhaserGame
          ref={phaserRef}
          onLevelChange={setCurrentLevel}
          onSellRequest={handleSellRequest}
        />
      </main>
    </div>
  );
};

export default Game;
