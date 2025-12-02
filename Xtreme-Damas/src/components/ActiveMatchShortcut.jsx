import { useLocation } from 'react-router-dom';
import { useActiveMatch } from '../context/ActiveMatchContext.jsx';
import '../assets/styles/active-match.css';

function ActiveMatchShortcut() {
  const { activeMatch } = useActiveMatch();
  const location = useLocation();

  // 1) Si no hay partida activa, no mostramos nada
  if (!activeMatch || !activeMatch.matchId) {
    return null;
  }

  // 2) Si ya estamos en el tablero, no tiene sentido mostrar el botón flotante
  if (location.pathname.startsWith('/game-board')) {
    return null;
  }

  // 3) Si la partida terminó, no mostramos el botón
  if (activeMatch.status === 'finished') {
    return null;
  }

  const handleClick = () => {
    // Navegación dura para evitar dramas con navigate()
    window.location.assign('/game-board');
  };

  return (
    <button
      type="button"
      className="active-match-button"
      onClick={handleClick}
    >
      ↩
      {' '}
      Volver a la partida #
      {activeMatch.matchId}
    </button>
  );
}

export default ActiveMatchShortcut;
