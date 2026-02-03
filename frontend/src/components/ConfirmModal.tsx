import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className="bg-[#1a1c23] border-4 border-yellow-700 rounded-lg p-6 w-96 shadow-2xl flex flex-col items-center font-mono">
        <h3 className="text-xl font-bold mb-4 text-yellow-500">
          확인
        </h3>

        <p className="text-gray-300 text-center mb-6 break-keep">
          {message}
        </p>

        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded font-bold transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
