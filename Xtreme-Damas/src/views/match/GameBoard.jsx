import {
  useCallback,
  useEffect,
  useState
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/gameboard.css';
import apiClient from '../../services/api';
import Board from '../../components/Board.jsx';
import { useActiveMatch } from '../../context/ActiveMatchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function GameBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeMatch,
    updateActiveMatch,
    clearActiveMatch,
    setViewingMatchId,
    clearViewingMatchId
  } = useActiveMatch();
  const [matchId, setMatchId] = useState('');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surrendering, setSurrendering] = useState(false);

  const fetchState = useCallback(async (targetMatchId, targetSeat) => {
    if (!targetMatchId) return;
    setLoading(true);
    setError(null);
    try {
      const seatParam = targetSeat ? `?seat=${targetSeat}` : '';
      const { data } = await apiClient.get(`/matches/${targetMatchId}/state${seatParam}`);
      setState(data);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos obtener el estado');
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const incomingId = location.state?.matchId ? String(location.state.matchId) : '';
    const incomingSeat = location.state?.seat ?? '';
    if (incomingId) {
      setMatchId(incomingId);
      fetchState(incomingId, incomingSeat);
    }
  }, [location.state, fetchState]);

  useEffect(() => {
    if (matchId || !activeMatch?.matchId) return;
    setMatchId(String(activeMatch.matchId));
    fetchState(activeMatch.matchId, activeMatch.seat || '');
  }, [activeMatch, matchId, fetchState]);

  useEffect(() => {
    const reloadIfLeaving = () => {
      if (window.location.pathname !== '/game-board') {
        window.location.reload();
      }
    };
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    window.history.pushState = function pushStatePatched(...args) {
      originalPushState.apply(this, args);
      setTimeout(reloadIfLeaving, 0);
    };
    window.history.replaceState = function replaceStatePatched(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(reloadIfLeaving, 0);
    };
    window.addEventListener('popstate', reloadIfLeaving);
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', reloadIfLeaving);
    };
  }, []);

  useEffect(() => {
    if (!state?.match?.status || !matchId) return;
    if (state.match.status === 'finished') {
      clearActiveMatch();
      return;
    }
    if (activeMatch?.matchId === Number(matchId)) {
      updateActiveMatch({ status: state.match.status });
    }
  }, [state?.match?.status, matchId, activeMatch, updateActiveMatch, clearActiveMatch]);

  useEffect(() => {
    if (!matchId) return undefined;
    setViewingMatchId(matchId);
    return () => {
      clearViewingMatchId();
    };
  }, [matchId, setViewingMatchId, clearViewingMatchId]);

  const handleSurrender = async () => {
    if (!matchId || !user?.id) {
      navigate('/lobby');
      return;
    }
    setSurrendering(true);
    try {
      await apiClient.post(`/matches/${matchId}/surrender`, { userId: user.id });
      clearActiveMatch();
      navigate('/lobby');
    } catch (err) {
      const message = err.response?.data?.error || 'No se pudo rendir la partida.';
      setError(message);
    } finally {
      setSurrendering(false);
    }
  };

  const handleReturnToLobby = () => {
    clearViewingMatchId();
    window.location.assign('/lobby');
  };

  return (
    <div className="gameboard-shell">
      <header className="matchroom-header">
        <p className="eyebrow">Visualizador de partida</p>
        <div className="matchroom-header-actions">
          <h1>
            Partida #
            {matchId || '—'}
          </h1>
          <div className="matchroom-actions">
            <button type="button" className="secondary-btn" onClick={handleReturnToLobby}>
              Volver al lobby
            </button>
            {activeMatch?.matchId === Number(matchId) && activeMatch.seat && (
              <button
                type="button"
                className="danger-btn"
                onClick={handleSurrender}
                disabled={surrendering}
              >
                {surrendering ? 'Rindiéndose...' : 'Rendirse'}
              </button>
            )}
          </div>
        </div>
      </header>
      {error && <p className="auth-error">{error}</p>}

      {state && (
        <div className="board-layout">
          <Board pieces={state.pieces || []} traps={state.traps || []} />
          <aside className="control-panel">
            <div className="panel-block">
              <h3>Match</h3>
              <p>
                Estado:
                {' '}
                <strong>{state.match?.status}</strong>
              </p>
              <p>
                Turno actual:
                {' '}
                {state.match?.currentTurn || '—'}
              </p>
              <p>
                Turno #
                {state.match?.turnCounter}
              </p>
            </div>
            <div className="panel-block">
              <h3>Jugadores</h3>
              {(state.players || []).map((player) => (
                <div key={player.id} className="player-info">
                  <strong>
                    {player.username || `Seat ${player.seat}`}
                    {' '}
                    (
                    {player.seat}
                    )
                  </strong>
                  <span>
                    {player.coins}
                    {' '}
                    monedas
                  </span>
                </div>
              ))}
            </div>
            <div className="panel-block">
              <h3>Inventario</h3>
              <ul>
                {(state.inventory || []).map((item) => (
                  <li key={item.id}>
                    {item.powerSlug}
                    :
                    {' '}
                    {item.qty}
                  </li>
                ))}
                {(!state.inventory || state.inventory.length === 0) && <li>No hay poderes comprados</li>}
              </ul>
            </div>
            <div className="panel-block">
              <h3>Últimos movimientos</h3>
              <ul>
                {(state.moves || []).slice(-5).map((move) => (
                  <li key={move.id}>
                    Turno
                    {' '}
                    {move.turnIndex}
                    :
                    {' '}
                    {move.bySeat}
                    {' '}
                    movió la ficha
                    {' '}
                    {move.pieceId}
                    {' '}
                    de
                    {' '}
                    (
                    {move.from?.r}
                    ,
                    {move.from?.c}
                    )
                    {' '}
                    a
                    {' '}
                    (
                    {move.to?.r}
                    ,
                    {move.to?.c}
                    )
                  </li>
                ))}
                {(!state.moves || state.moves.length === 0) && <li>Aún no hay movimientos</li>}
              </ul>
            </div>
          </aside>
        </div>
      )}
      {!state && !loading && (
        <p className="matchroom-status">Selecciona una partida desde el lobby para ver su tablero.</p>
      )}
      {loading && <p className="matchroom-status">Cargando estado de la partida...</p>}
    </div>
  );
}

export default GameBoard;
