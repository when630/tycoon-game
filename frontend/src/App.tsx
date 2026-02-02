import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Game from './pages/Game';

function App() {
  // Simple auth check wrapper
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
