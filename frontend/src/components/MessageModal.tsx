import React from 'react';

interface MessageModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  type?: 'NORMAL' | 'SUCCESS' | 'ERROR';
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, message, onClose, type = 'NORMAL' }) => {
  if (!isOpen) return null;

  const getBorderColor = () => {
    switch (type) {
      case 'SUCCESS': return 'border-green-600';
      case 'ERROR': return 'border-red-600';
      default: return 'border-gray-600';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'SUCCESS': return '성공';
      case 'ERROR': return '오류';
      default: return '알림';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className={`bg-[#1a1c23] border-4 ${getBorderColor()} rounded-lg p-6 w-80 shadow-2xl flex flex-col items-center font-mono`}>
        <h3 className={`text-xl font-bold mb-4 ${type === 'ERROR' ? 'text-red-500' : type === 'SUCCESS' ? 'text-green-500' : 'text-white'}`}>
          {getTitle()}
        </h3>

        <p className="text-gray-300 text-center mb-6 break-keep">
          {message}
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
