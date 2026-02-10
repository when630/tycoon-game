import React, { useEffect, useState } from 'react';
import { Coins, Sword, Trophy, HelpCircle } from 'lucide-react';

interface GameHUDProps {
  gold: number;
  currentLevel: number;
  reputation: number;
  statusMessage: string;
  statusType: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY';
  onOpenProbability: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ gold, currentLevel, reputation, statusMessage, statusType, onOpenProbability }) => {
  const [animateGold, setAnimateGold] = useState(false);

  useEffect(() => {
    setAnimateGold(true);
    const timer = setTimeout(() => setAnimateGold(false), 500);
    return () => clearTimeout(timer);
  }, [gold]);
  // ... (rest of the code similar to before but careful with matching)
  const getStatusColor = () => {
    switch (statusType) {
      case 'SUCCESS': return 'text-green-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      case 'FAIL': return 'text-orange-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      case 'DESTROY': return 'text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      default: return 'text-yellow-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between font-sans">

      {/* Top Bar - Single Continuous Bar */}
      <div className="w-full h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-8 pointer-events-auto shadow-md">

        {/* Left: Level & Probability */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500 flex items-center justify-center">
              <Sword size={20} className="text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold tracking-wider">LEVEL</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white leading-none">+{currentLevel}</span>
                <span className="text-xs text-blue-400 font-bold">강</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenProbability}
            className="flex items-center gap-1.5 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-gray-600 transition-all text-xs"
            title="강화 확률 보기"
          >
            <HelpCircle size={14} />
            <span>확률 정보</span>
          </button>
        </div>

        {/* Center: Status Message (Hidden on small mobile, visible on desktop) */}
        <div className="absolute left-1/2 top-20 transform -translate-x-1/2 text-center w-full px-4 pointer-events-none md:static md:w-auto md:transform-none md:p-0 md:mt-0">
          <h1 className={`text-2xl md:text-3xl font-black italic tracking-tighter transition-all duration-300 ${getStatusColor()}`}>
            {statusMessage}
          </h1>
        </div>

        {/* Right: Gold & Reputation */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider flex items-center gap-1">
              <Trophy size={10} className="text-purple-400" /> REPUTATION
            </span>
            <span className="text-sm font-bold text-purple-200">{reputation.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3 bg-gray-900/50 px-4 py-1.5 rounded-full border border-yellow-600/30">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Gold</span>
              <span className={`text-lg font-mono font-bold text-yellow-100 transition-all ${animateGold ? 'text-yellow-300 scale-105' : ''}`}>
                {gold.toLocaleString()} G
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg border border-yellow-300">
              <Coins size={16} className="text-yellow-900" />
            </div>
          </div>
        </div>

      </div>

      {/* Spacer or overlays can go here */}
      <span className="absolute bottom-20 right-4 text-[10px] text-gray-600 font-mono">v2.1</span>
    </div>
  );
};

export default GameHUD;
