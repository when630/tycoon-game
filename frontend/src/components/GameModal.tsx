import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme?: 'DEFAULT' | 'GOLD' | 'RED' | 'BLUE' | 'PURPLE' | 'GREEN';
  className?: string; // For custom width/height if needed
}

const GameModal: React.FC<GameModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  theme = 'DEFAULT',
  className = ''
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300); // Wait for exit animation
    }
  }, [isOpen]);

  if (!show) return null;

  // Theme Colors
  const getThemeStyles = () => {
    switch (theme) {
      case 'GOLD': return 'border-yellow-600 text-yellow-100 shadow-yellow-900/50';
      case 'RED': return 'border-red-600 text-red-100 shadow-red-900/50';
      case 'BLUE': return 'border-blue-500 text-blue-100 shadow-blue-900/50';
      case 'PURPLE': return 'border-purple-600 text-purple-100 shadow-purple-900/50';
      case 'GREEN': return 'border-green-600 text-green-100 shadow-green-900/50';
      default: return 'border-gray-600 text-gray-200 shadow-gray-900/50';
    }
  };

  const getTitleColor = () => {
    switch (theme) {
      case 'GOLD': return 'text-yellow-400';
      case 'RED': return 'text-red-400';
      case 'BLUE': return 'text-blue-400';
      case 'PURPLE': return 'text-purple-400';
      case 'GREEN': return 'text-green-400';
      default: return 'text-gray-300';
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`
          relative bg-gray-900/95 border-4 rounded-lg p-6 w-full max-w-lg shadow-2xl 
          transform transition-all duration-300 
          ${animate ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
          ${getThemeStyles()}
          ${className}
        `}
        role="dialog"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
          <h2 className={`text-2xl font-bold font-mono tracking-tight ${getTitleColor()}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GameModal;
