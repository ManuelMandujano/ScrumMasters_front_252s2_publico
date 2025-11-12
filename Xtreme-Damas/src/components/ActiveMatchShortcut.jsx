import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveMatch } from '../context/ActiveMatchContext.jsx';
import '../assets/styles/active-match.css';

function ActiveMatchShortcut() {
  const { activeMatch, viewingMatchId } = useActiveMatch();
  const location = useLocation();
  const navigate = useNavigate();

  if (!activeMatch || !activeMatch.matchId) {
    return null;
  }

  const isOwnMatchView = location.pathname.startsWith('/game-board')
    && viewingMatchId != null
    && activeMatch.matchId === viewingMatchId
    && Boolean(activeMatch.seat);

  if (isOwnMatchView) return null;

  if (activeMatch.status !== 'ongoing') {
    return null;
  }

  const handleClick = () => {
    navigate('/game-board', {
      state: {
        matchId: activeMatch.matchId,
        seat: activeMatch.seat || ''
      }
    });
  };

  return (
    <button type="button" className="active-match-button" onClick={handleClick}>
      ↩
      {' '}
      Volver a la partida #
      {activeMatch.matchId}
    </button>
  );
}

export default ActiveMatchShortcut;
