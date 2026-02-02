import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #20232a;
  color: white;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #282c34;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

const Title = styled.h2`
  margin: 0;
  color: #61dafb;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #61dafb;
  background: transparent;
  color: #61dafb;
  cursor: pointer;

  &:hover {
    background: rgba(97, 218, 251, 0.1);
  }
`;

const GameArea = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PlaceholderText = styled.div`
  text-align: center;
  opacity: 0.5;
`;

const Game: React.FC = () => {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Unknown';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <Title>Forge Tycoon</Title>
        <UserInfo>
          <span>PLAYER: <strong>{nickname}</strong></span>
          <Button onClick={handleLogout}>LOGOUT</Button>
        </UserInfo>
      </Header>
      <GameArea>
        <PlaceholderText>
          <h3>Game Canvas Will Be Here</h3>
          <p>Phaser integration pending...</p>
        </PlaceholderText>
      </GameArea>
    </Container>
  );
};

export default Game;
