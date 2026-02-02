import React from 'react';
import { useNavigate } from 'react-router-dom';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Unknown';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
        <h2 className="m-0 text-blue-400 text-2xl font-bold">Forge Tycoon</h2>
        <div className="flex items-center gap-4">
          <span>PLAYER: <strong>{nickname}</strong></span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border border-blue-400 bg-transparent text-blue-400 cursor-pointer hover:bg-blue-400/10 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center relative">
        <div className="text-center opacity-50">
          <h3 className="text-xl mb-2">Game Canvas Will Be Here</h3>
          <p>Phaser integration pending...</p>
        </div>
      </main>
    </div>
  );
};

export default Game;
