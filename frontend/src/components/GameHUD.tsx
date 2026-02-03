import React, { useEffect, useState } from 'react';
import { Coins, Sword, Trophy } from 'lucide-react';

interface GameHUDProps {
  gold: number;
  currentLevel: number;
  reputation: number;
  statusMessage: string;
  statusType: 'NORMAL' | 'SUCCESS' | 'FAIL' | 'DESTROY';
}

const GameHUD: React.FC<GameHUDProps> = ({ gold, currentLevel, reputation, statusMessage, statusType }) => {
  const [animateGold, setAnimateGold] = useState(false);

  useEffect(() => {
    setAnimateGold(true);
    const timer = setTimeout(() => setAnimateGold(false), 500);
    return () => clearTimeout(timer);
  }, [gold]);

  const getStatusColor = () => {
    switch (statusType) {
      case 'SUCCESS': return 'text-green-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      case 'FAIL': return 'text-orange-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      case 'DESTROY': return 'text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
      default: return 'text-yellow-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-4 flex flex-col justify-between">

      {/* Top Bar: Left Aligned Stack */}
      <div className="flex flex-col items-start gap-4 mt-6">

        {/* Gold Display (Top) */}
        <div className="bg-gray-900/80 border-2 border-yellow-600 rounded-lg px-6 py-2 shadow-lg backdrop-blur-sm flex items-center gap-3 animate-fade-in-down">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border border-yellow-300 shadow-inner text-yellow-900">
            <Coins size={20} />
          </div>
          <span className={`text-3xl font-bold text-yellow-100 font-mono transition-transform duration-300 ${animateGold ? 'scale-110 text-yellow-300' : ''}`}>
            {gold.toLocaleString()}
          </span>
        </div>

        {/* Level & Reputation Stack */}
        <div className="flex items-start gap-4 ml-1">
          {/* Level Badge */}
          <div className="bg-gray-900/80 border-2 border-blue-500 rounded-lg p-3 shadow-lg backdrop-blur-sm animate-fade-in-down min-w-[120px]">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1 text-center">Level</span>
            <div className="flex items-center justify-center gap-2">
              <Sword size={32} className="text-blue-400" />
              <span className="text-5xl font-black text-white drop-shadow-md">
                +{currentLevel}
              </span>
            </div>
          </div>

          {/* Reputation Badge */}
          <div className="bg-gray-900/80 border-2 border-purple-500 rounded-lg p-3 shadow-lg backdrop-blur-sm animate-fade-in-down min-w-[120px]">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1 text-center">Reputation</span>
            <div className="flex items-center justify-center gap-2">
              <Trophy size={28} className="text-purple-400" />
              <span className="text-4xl font-black text-white drop-shadow-md">
                {reputation}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Center Status Message (Adjusted position) */}
      <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full px-4">
        <h1 className={`text-4xl md:text-6xl font-black italic tracking-tighter transition-all duration-300 break-keep drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${getStatusColor()} ${statusType !== 'NORMAL' ? 'scale-110' : 'scale-100'}`}>
          {statusMessage}
        </h1>
      </div>

    </div>
  );
};

export default GameHUD;
