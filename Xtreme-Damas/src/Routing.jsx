import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './views/App.jsx';
import Instructions from './views/instructions.jsx';
import Users from './views/users.jsx';
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx';
import PlayerDashboard from './views/dashboard/PlayerDashboard.jsx';
import AdminDashboard from './views/dashboard/AdminDashboard.jsx';
import Lobby from './views/lobby/Lobby.jsx';
import MatchRoom from './views/lobby/MatchRoom.jsx';
import GameBoard from './views/match/GameBoard.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/match-room" element={<MatchRoom />} />
          <Route path="/game-board" element={<GameBoard />} />
          <Route
            path="/users"
            element={(
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <PlayerDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
