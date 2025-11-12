import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveMatch } from '../context/ActiveMatchContext.jsx';
import ActiveMatchShortcut from './ActiveMatchShortcut.jsx';
import apiClient from '../services/api';
import '../assets/styles/layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const { activeMatch, clearActiveMatch, clearViewingMatchId } = useActiveMatch();
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!location.pathname.startsWith('/game-board')) {
      clearViewingMatchId();
    }
  }, [location.pathname, clearViewingMatchId]);

  useEffect(() => {
    if (prevPathRef.current === '/game-board' && location.pathname !== '/game-board') {
      prevPathRef.current = location.pathname;
      window.location.reload();
      return;
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleLogout = async () => {
    if (user?.id && activeMatch?.matchId && activeMatch.status === 'ongoing') {
      try {
        await apiClient.post(`/matches/${activeMatch.matchId}/surrender`, { userId: user.id });
      } catch (error) {
        console.error('No se pudo rendir la partida antes de cerrar sesión', error);
      }
    }
    logout();
    clearActiveMatch();
    navigate('/');
  };

  const toggleNav = () => setNavOpen((prev) => !prev);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="layout-shell">
      <header className="app-header">
        <Link className="brand" to="/">
          <span>Xtreme</span> Damas
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Menú"
          onClick={toggleNav}
        >
          ☰
        </button>

        <nav className={`main-nav ${navOpen ? 'open' : ''}`}>
          <NavLink onClick={closeNav} to="/" end>
            Inicio
          </NavLink>
          <NavLink onClick={closeNav} to="/instructions">
            Instrucciones
          </NavLink>
          <NavLink onClick={closeNav} to="/lobby">
            Lobby
          </NavLink>
          {user ? (
            <>
              <NavLink onClick={closeNav} to="/dashboard">
                Panel
              </NavLink>
              {user.role === 'admin' && (
                <NavLink onClick={closeNav} to="/admin">
                  Admin
                </NavLink>
              )}
              <button type="button" className="logout-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="cta-link" to="/login" onClick={closeNav}>
                Iniciar sesión
              </Link>
              <Link className="cta-outline" to="/register" onClick={closeNav}>
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </header>

      <ActiveMatchShortcut />
      <main className="app-main">
        <Outlet key={location.pathname} />
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Scrum Masters – Damas Extremas.</p>
        <p className="footer-note">
          Tablero 10×10 · Poderes dinámicos · Comunidad competitiva.
        </p>
      </footer>
    </div>
  );
}

export default Layout;
