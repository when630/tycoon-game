import React, { useEffect, useState } from 'react';
import { Coins, Sword, Trophy, HelpCircle, Menu } from 'lucide-react';

interface GameHUDProps {
  gold: number;
  currentLevel: number;
  reputation: number;
  statusMessage: string;
  statusType: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY';
  onOpenProbability: () => void;
  onToggleMenu: () => void;
  onAddGold?: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({
  gold,
  currentLevel,
  reputation,
  statusMessage,
  statusType,
  onOpenProbability,
  onToggleMenu,
  onAddGold
}) => {
  const [animateGold, setAnimateGold] = useState(false);

  useEffect(() => {
    setAnimateGold(true);
    const timer = setTimeout(() => setAnimateGold(false), 500);
    return () => clearTimeout(timer);
  }, [gold]);

  const getStatusColor = () => {
    switch (statusType) {
      case 'SUCCESS': return 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]';
      case 'FAIL': return 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]';
      case 'DESTROY': return 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      default: return 'text-gray-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between font-sans">

      {/* Top Bar - Continuous Bar */}
      <div className="w-full h-14 md:h-16 bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-2 md:px-6 pointer-events-auto shadow-xl z-20 overflow-hidden">

        {/* Left: Level & Probability */}
        <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-900/50 border border-blue-500 flex items-center justify-center relative flex-shrink-0">
              <Sword size={16} className="text-blue-400 md:w-5 md:h-5" />
              <span className="absolute -bottom-1 -right-1 bg-black text-[9px] text-blue-300 border border-blue-700 px-1 rounded-full md:hidden">LV</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold tracking-wider hidden md:block">LEVEL</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-black text-white leading-none">+{currentLevel}</span>
                <span className="text-[10px] md:text-xs text-blue-400 font-bold">강</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenProbability}
            className="flex items-center gap-1.5 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-gray-600 transition-all text-[10px] md:text-xs flex-shrink-0"
            title="강화 확률 보기"
          >
            <HelpCircle size={14} className="md:w-4 md:h-4" />
            <span className="hidden md:inline">확률 정보</span>
          </button>
        </div>

        {/* Center: Status Message (Hidden on small mobile if needed, or absolute) */}
        <div className="absolute left-1/2 top-24 transform -translate-x-1/2 text-center w-full px-4 pointer-events-none md:static md:w-auto md:transform-none md:p-0 md:mt-0">
          <h1 className={`text-2xl md:text-3xl font-black italic tracking-tighter transition-all duration-300 ${getStatusColor()}`}>
            {statusMessage}
          </h1>
        </div>

        {/* Right: Gold, Reputation & Menu */}
        <div className="flex items-center gap-1.5 md:gap-6 flex-shrink min-w-0 justify-end">
          {/* Reputation */}
          <div className="flex items-center gap-1.5 md:gap-3 bg-gray-900/50 px-2 py-1 md:px-4 md:py-1.5 rounded-full border border-purple-600/30 flex-shrink min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-[9px] text-purple-400 font-bold tracking-wider hidden md:block">REPUTATION</span>
              <span className="text-xs md:text-lg font-mono font-bold text-purple-200 truncate max-w-[60px] md:max-w-none text-right">
                <span className="md:hidden">{formatNumber(reputation)}</span>
                <span className="hidden md:inline">{reputation.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-lg border border-purple-400 flex-shrink-0">
              <Trophy size={12} className="text-purple-100 md:w-4 md:h-4" />
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-1.5 md:gap-3 bg-gray-900/50 px-2 py-1 md:px-4 md:py-1.5 rounded-full border border-yellow-600/30 flex-shrink min-w-0">
            <div className="flex flex-col items-end min-w-0">
              <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider hidden md:block">Gold</span>
              <span className={`text-xs md:text-lg font-mono font-bold text-yellow-100 transition-all truncate max-w-[70px] md:max-w-none text-right ${animateGold ? 'text-yellow-300' : ''}`}>
                <span className="md:hidden">{formatNumber(gold)}G</span>
                <span className="hidden md:inline">{gold.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center shadow-lg border border-yellow-300 flex-shrink-0">
              <Coins size={14} className="text-yellow-900 md:w-4 md:h-4" />
            </div>
            {onAddGold && (
              <button
                onClick={onAddGold}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center border border-green-400 shadow-md active:scale-90 transition-transform flex-shrink-0"
                title="Add 10,000 Gold (Test)"
              >
                <span className="text-sm font-bold mb-0.5">+</span>
              </button>
            )}
          </div>

          {/* Menu Button */}
          <button
            onClick={onToggleMenu}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 flex items-center justify-center transition-transform active:scale-95 shadow-lg relative z-50 flex-shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

      </div>

      {/* Spacer or overlays can go here */}
      <span className="absolute bottom-20 right-4 text-[10px] text-gray-600 font-mono">v2.3</span>
    </div>
  );
};

export default GameHUD;
