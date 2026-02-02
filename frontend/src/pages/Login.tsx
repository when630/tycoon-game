import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import client from '../api/client';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #282c34;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #61dafb;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #61dafb;
  color: #282c34;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #21a1f1;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
`;

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
    <Container>
      <Title>Forge Tycoon</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="닉네임 입력"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">게임 시작</Button>
      </Form>
    </Container>
  );
};

export default Login;
