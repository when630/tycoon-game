import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const Login: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    try {
      const response = await client.post('/api/v1/auth/login', { nickname });
      const { token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('nickname', nickname); // Convenience

      navigate('/game');
    } catch (err) {
      console.error(err);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h1 className="text-5xl mb-8 text-blue-400 font-bold">Forge Tycoon</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
        <input
          type="text"
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="p-3 rounded border-none text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="p-3 rounded border-none bg-blue-400 text-gray-900 text-lg font-bold cursor-pointer hover:bg-blue-500 transition-colors"
        >
          게임 시작
        </button>
      </form>
    </div>
  );
};

export default Login;
