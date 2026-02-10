import React, { useEffect, useState } from 'react';
import { Hammer, Sword, Shield, Flame } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
  tips?: string[];
}

const DEFAULT_TIPS = [
  "망치를 두드려 장비를 강화하세요!",
  "높은 등급의 장비는 의뢰소에서 비싸게 팔립니다.",
  "명성이 오르면 더 좋은 의뢰를 받을 수 있습니다.",
  "유물을 모아 특별한 효과를 누리세요.",
  "강화에 실패하면 등급이 유지되거나 하락할 수 있습니다.",
  "운이 나쁘면 장비가 파괴될 수도 있으니 조심하세요!",
  "연속으로 성공하면 '손맛' 칭호를 얻을지도 모릅니다. (아직 구현 안됨)",
  "배경음악이 시끄럽다면 설정에서 조절하세요."
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, tips = DEFAULT_TIPS }) => {
  const [currentTip, setCurrentTip] = useState(tips[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // Random tip
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);

      // Fake progress for visual effect
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Stall at 90% until real load finishes
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isLoading, tips]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white font-sans">

      {/* Animated Icon */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative flex items-center justify-center animate-bounce-slow">
          <Hammer size={64} className="text-orange-500 absolute -left-8 -top-8 animate-hammer-swing" />
          <Sword size={64} className="text-gray-300 relative z-10" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black italic tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)]">
        TYCOON FORGE
      </h1>
      <p className="text-gray-500 text-sm tracking-[0.2em] mb-12 animate-pulse">
        SYSTEM LOADING...
      </p>


      {/* Progress Bar */}
      <div className="w-64 md:w-96 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-inner mb-4 relative">
        <div
          className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
        </div>
      </div>

      <div className="text-xs font-mono text-orange-500 mb-16">
        {Math.round(progress)}%
      </div>

      {/* Tip Section */}
      <div className="max-w-md px-8 py-6 bg-gray-900/50 border border-gray-800/50 rounded-xl backdrop-blur-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-gray-400">
          <Flame size={14} className="text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Game Tip</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed break-keep">
          {currentTip}
        </p>
      </div>

      <style>{`
        @keyframes hammer-swing {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-30deg); }
        }
        .animate-hammer-swing {
            animation: hammer-swing 2s ease-in-out infinite;
            transform-origin: bottom right;
        }
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
