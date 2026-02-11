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
import WeaponSelectionModal from '../components/WeaponSelectionModal';
import { LogOut, Package, Trophy, Gem, ScrollText } from 'lucide-react';

import LoadingScreen from '../components/LoadingScreen';

const Game: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gold, setGold] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("제작 준비 완료");
  const [statusType, setStatusType] = useState<'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY'>('NORMAL');
  const [currentWeaponType, setCurrentWeaponType] = useState<string | null>(null);

  const [isWeaponSelectionOpen, setIsWeaponSelectionOpen] = useState(false);

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
      setReputation(res.data.reputation);
      if (res.data.currentItemLevel !== undefined) {
        setCurrentLevel(res.data.currentItemLevel);
      }
      if (res.data.currentWeaponType) {
        setCurrentWeaponType(res.data.currentWeaponType);
        setIsWeaponSelectionOpen(false);
      } else {
        // If null (reset), open selection
        setCurrentWeaponType(null); // Ensure it's null
        setIsWeaponSelectionOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    } finally {
      // Fake delay for smooth loading screen effect (optional)
      setTimeout(() => setIsLoading(false), 1000);
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

  const handleAddGold = async () => {
    try {
      await client.post('/api/v1/user/test/gold');
      await fetchUserData();
      setStatusMessage("테스트 자금 10,000G 지급 완료!");
      setStatusType("SUCCESS");
    } catch (e) {
      console.error("Failed to add test gold", e);
      setStatusMessage("자금 지급 실패");
      setStatusType("FAIL");
    }
  };

  const handleWeaponSelect = async (type: 'SWORD' | 'AXE' | 'DAGGER') => {
    try {
      await client.post('/api/v1/game/select-weapon', { weaponType: type });
      setCurrentWeaponType(type);
      setIsWeaponSelectionOpen(false);
      setStatusMessage(`${type === 'SWORD' ? '검' : type === 'AXE' ? '도끼' : '단검'} 제작 시작!`);
      setStatusType('NORMAL');

      // Update Phaser
      if (phaserRef.current) {
        // Force update weapon type in Phaser if needed, usually passed via prop
        // but prop update will trigger useEffect in PhaserGame
      }
    } catch (e) {
      console.error("Failed to select weapon", e);
    }
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
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        onAddGold={handleAddGold}
      />

      {/* Loading Screen Overlay */}
      <LoadingScreen isLoading={isLoading} />

      {/* Phaser Game Layer - Only render if not loading to ensure initialLevel is ready */}
      {!isLoading && (
        <PhaserGame
          ref={phaserRef}
          initialLevel={currentLevel}
          onLevelChange={handleLevelChange}
          // onSellRequest={handleSellRequest} // Removed
          onGoldChange={handleGoldChange}
          onReputationChange={setReputation}
          onStatusChange={handleStatusChange}
          weaponType={currentWeaponType || 'SWORD'} // Fallback to SWORD for render if null, but modal covers it
        />
      )}

      {/* UI Overlay Wrappers (Modals & Menus) */}

      {/* Dropdown Menu (Positioned relative to Top Right of HUD) */}
      <div className="absolute top-16 right-4 z-50">
        {isMenuOpen && (
          <div className="w-48 bg-gray-900 border-2 border-gray-600 rounded-lg shadow-xl overflow-hidden animate-fade-in-down flex flex-col z-50">
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

      <WeaponSelectionModal
        isOpen={isWeaponSelectionOpen}
        onSelect={handleWeaponSelect}
        onCancel={() => {
          // Prevent closing if we really need a weapon? 
          // If user cancels, they can't play. 
          // Maybe just don't allow cancel if weapon is null?
          if (currentWeaponType) setIsWeaponSelectionOpen(false);
        }}
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
          phaserRef.current?.onSellComplete();
          fetchUserData(); // Refresh gold
        }}
      />

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-gradient-to-t from-black via-black/80 to-transparent z-40 flex justify-center items-end pointer-events-none">
        <div className="pointer-events-auto flex items-end gap-4 max-w-lg w-full">

          {/* Sell Button (Secondary) */}
          <div className={`transition-all duration-300 ${currentLevel > 0 ? 'w-24 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <button
              onClick={handleSellRequest}
              className="w-full bg-green-800 hover:bg-green-700 text-green-100 border-2 border-green-600 rounded-lg py-3 font-bold shadow-lg shadow-green-900/50 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <span className="text-lg">💰</span>
              <span className="text-xs">판매</span>
            </button>
          </div>

          {/* Enhance Button (Primary) */}
          <button
            onClick={() => phaserRef.current?.enhance()}
            className="flex-1 bg-gradient-to-b from-blue-600 to-blue-800 border-b-8 border-blue-900 rounded-xl p-1 relative group active:border-b-0 active:translate-y-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            <div className="bg-blue-600 rounded-lg p-4 flex items-center justify-between border border-blue-400/30">
              <div className="flex flex-col items-start">
                <span className="text-blue-200 text-xs font-bold tracking-wider mb-0.5">COST</span>
                <span className="text-white font-mono font-bold text-lg drop-shadow-md">
                  {(100 * Math.pow(currentLevel + 1, 2)).toLocaleString()} G
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl font-black italic text-white drop-shadow-lg tracking-widest group-hover:scale-105 transition-transform">강화</span>
                <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-400/30">
                  <span className="text-2xl">🔨</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
