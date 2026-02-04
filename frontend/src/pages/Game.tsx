import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhaserGame, { PhaserGameRef } from '../components/PhaserGame';
import ContractOfficeModal from '../components/ContractOfficeModal';
import ContractCard from '../components/ContractCard';
import GameHUD from '../components/GameHUD';
import SellModal from '../components/SellModal';
import RankingModal from '../components/RankingModal';
import RelicModal from '../components/RelicModal';
import InventoryModal from '../components/InventoryModal';
import ProbabilityModal from '../components/ProbabilityModal';
import client from '../api/client';
import { Menu, LogOut, Package, Trophy, Gem, ScrollText } from 'lucide-react';

const Game: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gold, setGold] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [statusMessage, setStatusMessage] = useState("제작 준비 완료");
  const [statusType, setStatusType] = useState<'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY'>('NORMAL');

  const [isContractOfficeOpen, setIsContractOfficeOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [isRelicOpen, setIsRelicOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isProbabilityOpen, setIsProbabilityOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshContractsTrigger, setRefreshContractsTrigger] = useState(0);

  const phaserRef = useRef<PhaserGameRef>(null);
  const navigate = useNavigate();

  // Initial fetch
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await client.get('/api/v1/user/me');
      setGold(res.data.gold);
      setReputation(res.data.reputation);
    } catch (e) {
      console.error("Failed to fetch user data", e);
    }
  };

  const handleContractComplete = () => {
    phaserRef.current?.resetLevel();
    setCurrentLevel(0);
    setStatusMessage("의뢰 완료! 보상 획득");
    setStatusType("SUCCESS");

    // Refresh gold after reward
    fetchUserData();
  };

  const handleSellRequest = () => {
    setIsSellModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Sync handlers
  const handleLevelChange = (newLevel: number) => {
    setCurrentLevel(newLevel);
  };

  const handleGoldChange = (newGold: number) => {
    setGold(newGold);
  };

  const handleStatusChange = (message: string, type: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY') => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const openModal = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans select-none">

      {/* HUD Layer */}
      <GameHUD
        gold={gold}
        currentLevel={currentLevel}
        reputation={reputation}
        statusMessage={statusMessage}
        statusType={statusType}
        onOpenProbability={() => openModal(setIsProbabilityOpen)}
      />

      {/* Phaser Game Layer */}
      <PhaserGame
        ref={phaserRef}
        onLevelChange={handleLevelChange}
        onSellRequest={handleSellRequest}
        onGoldChange={handleGoldChange}
        onReputationChange={setReputation}
        onStatusChange={handleStatusChange}
      />

      {/* UI Overlay Wrappers (Modals & Menus) */}

      {/* Top Menu Button & Dropdown */}
      <div className="absolute top-4 right-4 z-50">
        {/* Contracts are also on the right, but lower. Menu is top-right corner. */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 border-2 border-gray-600 shadow-lg transition-transform active:scale-95"
          >
            <Menu size={24} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-gray-900 border-2 border-gray-600 rounded-lg shadow-xl overflow-hidden animate-fade-in-down flex flex-col z-50">
              <button onClick={() => openModal(setIsContractOfficeOpen)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 border-b border-gray-700 transition-colors text-left">
                <ScrollText size={20} className="text-orange-400" />
                <span className="font-bold text-sm">의뢰소</span>
              </button>
              <button onClick={() => openModal(setIsRankingOpen)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 border-b border-gray-700 transition-colors text-left">
                <Trophy size={20} className="text-yellow-400" />
                <span className="font-bold text-sm">랭킹</span>
              </button>
              <button onClick={() => openModal(setIsInventoryOpen)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 border-b border-gray-700 transition-colors text-left">
                <Package size={20} />
                <span className="font-bold text-sm">가방</span>
              </button>
              <button onClick={() => openModal(setIsRelicOpen)} className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 border-b border-gray-700 transition-colors text-left">
                <Gem size={20} className="text-cyan-400" />
                <span className="font-bold text-sm">유물</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/30 transition-colors text-left">
                <LogOut size={20} />
                <span className="font-bold text-sm">로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Contracts Widget (Right Side) */}
      <ContractCard
        currentLevel={currentLevel}
        onComplete={handleContractComplete}
        onRefresh={fetchUserData}
        refreshTrigger={refreshContractsTrigger}
      />

      {/* Modals */}
      <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
      <RelicModal isOpen={isRelicOpen} onClose={() => setIsRelicOpen(false)} />
      <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      <ProbabilityModal
        isOpen={isProbabilityOpen}
        onClose={() => setIsProbabilityOpen(false)}
        currentLevel={currentLevel}
      />

      <ContractOfficeModal
        isOpen={isContractOfficeOpen}
        onClose={() => setIsContractOfficeOpen(false)}
        onAccept={() => setRefreshContractsTrigger(prev => prev + 1)}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        currentLevel={currentLevel}
        itemBaseValue={100}
        onSellComplete={() => {
          phaserRef.current?.resetLevel();
          fetchUserData(); // Refresh gold
        }}
      />
    </div>
  );
};

export default Game;
