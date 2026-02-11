import React from 'react';

type WeaponType = 'SWORD' | 'AXE' | 'DAGGER';

interface WeaponSelectionModalProps {
  isOpen: boolean;
  onSelect: (type: WeaponType) => void;
  onCancel: () => void;
}

const WeaponSelectionModal: React.FC<WeaponSelectionModalProps> = ({ isOpen, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const weapons: { type: WeaponType; label: string; image?: string }[] = [
    { type: 'SWORD', label: '검', image: '/assets/weapon/sword/sword_00.png' },
    { type: 'AXE', label: '도끼', image: '/assets/weapon/axe/axe_00.png' },
    { type: 'DAGGER', label: '단검', image: '/assets/weapon/dagger-sheet.png' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-lg w-full text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">무기 선택</h2>
        <p className="mb-6 text-center text-gray-300">강화할 무기 종류를 선택하세요.</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {weapons.map((weapon) => (
            <button
              key={weapon.type}
              onClick={() => onSelect(weapon.type)}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-transparent hover:border-yellow-500 transition-all"
            >
              <div className="w-16 h-16 mb-2 bg-gray-900 rounded flex items-center justify-center overflow-hidden relative">
                {weapon.type === 'DAGGER' ? (
                  // Dagger is a sheet, so we use object-fit/position to show the first frame
                  <img
                    src={weapon.image}
                    alt={weapon.label}
                    className="w-full h-full object-cover object-left-top"
                  />
                ) : (
                  // Sword and Axe are individual large images, scale them down nicely
                  <img
                    src={weapon.image}
                    alt={weapon.label}
                    className="w-full h-full object-contain p-1"
                  />
                )}
              </div>
              <span className="font-bold">{weapon.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeaponSelectionModal;
