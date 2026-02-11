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
    { type: 'SWORD', label: '검', image: '/assets/weapon/sword-sheet.png' }, // Using sheet as preview? Maybe just crop or scale
    { type: 'AXE', label: '도끼', image: '/assets/weapon/axe-sheet.png' },
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
              <div className="w-16 h-16 mb-2 bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                {/* Basic preview - we might want to show a specific frame, but object-cover is okay for now */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundImage: `url(${weapon.image})`,
                    backgroundPosition: '0 0', // Show first frame
                    backgroundSize: 'cover', // This might be wrong if it's a sheet. 
                    // If it's a sheet, we want to show a small part.
                    // Let's rely on CSS background-position if we know the frame size.
                    // For now, let's just use an icon or text if we are unsure.
                  }}
                />
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
