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

const POLL_INTERVAL_MS = 100;

const AVAILABLE_POWERS = [
  {
    slug: 'extra-move',
    name: 'Movimiento extra',
    description: 'Te permite hacer un segundo movimiento en tu turno.',
    price: 10
  },
  {
    slug: 'shield',
    name: 'Escudo',
    description: 'Protege una de tus fichas de ser capturada durante un turno.',
    price: 12
  },
  {
    slug: 'double-capture',
    name: 'Doble captura',
    description: 'Ganas monedas extra al capturar una ficha.',
    price: 15
  }
  // Agrega aquí más poderes con los slugs reales de tu backend
];


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
  const [selectedCell, setSelectedCell] = useState(null);
  const [submittingMove, setSubmittingMove] = useState(false);
  const [purchasingPower, setPurchasingPower] = useState(null);
  const [activatingPower, setActivatingPower] = useState(null);

  const effectiveSeat = (activeMatch && activeMatch.seat) || location.state?.seat || '';


  const fetchState = useCallback(
    async (targetMatchId, targetSeat, { withSpinner = false } = {}) => {
      if (!targetMatchId) return;
      if (withSpinner) {
        setLoading(true);
      }
      setError(null);
      try {
        const seatParam = targetSeat ? `?seat=${targetSeat}` : '';
        const { data } = await apiClient.get(`/matches/${targetMatchId}/state${seatParam}`);
        setState(data);
      } catch (err) {
        setError(err.response?.data?.error || 'No pudimos obtener el estado');
      } finally {
        if (withSpinner) {
          setLoading(false);
        }
      }
    },
    []
  );


  useEffect(() => {
    const incomingId = location.state?.matchId ? String(location.state.matchId) : '';
    const incomingSeat = location.state?.seat ?? '';
    if (incomingId) {
      setMatchId(incomingId);
      fetchState(incomingId, incomingSeat, { withSpinner: true });
    }
  }, [location.state, fetchState]);

  useEffect(() => {
    if (matchId || !activeMatch?.matchId) return;
    setMatchId(String(activeMatch.matchId));
    fetchState(activeMatch.matchId, activeMatch.seat || '', { withSpinner: true });
  }, [activeMatch, matchId, fetchState]);

  // Polling para tener el tablero actualizado en "tiempo real"
  useEffect(() => {
    if (!matchId || !effectiveSeat) return undefined;

    const tick = () => {
      // errores ya se manejan dentro de fetchState
      fetchState(matchId, effectiveSeat).catch(() => {});
    };

    // Opcional: primer fetch silencioso
    tick();

    const intervalId = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [matchId, effectiveSeat, fetchState]);




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

  useEffect(() => {
    if (!selectedCell || !state || !Array.isArray(state.pieces)) return;

    const stillHasPiece = state.pieces.some(
      (piece) =>
        piece.alive
        && piece.row === selectedCell.r
        && piece.col === selectedCell.c
    );

    // Si en la celda seleccionada ya no hay ficha viva, limpiamos la selección
    if (!stillHasPiece) {
      setSelectedCell(null);
    }
  }, [state, selectedCell]);

  const handleCellClick = useCallback(
    async ({ r, c, piece }) => {
      if (!matchId || !state) return;
      if (!effectiveSeat) return;

      // Solo dejo mover si es mi turno
      if (state.match?.currentTurn && state.match.currentTurn !== effectiveSeat) {
        setError('No es tu turno.');
        return;
      }

      // Primer clic: seleccionar pieza propia
      if (!selectedCell) {
        if (!piece) return;
        if (piece.seat !== effectiveSeat) return;

        setSelectedCell({ r, c, pieceId: piece.id });
        setError(null);
        return;
      }

      // Si hago clic de nuevo en la misma celda, deselecciono
      if (selectedCell.r === r && selectedCell.c === c) {
        setSelectedCell(null);
        setError(null);
        return;
      }

      // Segundo clic: intento mover
      setSubmittingMove(true);
      try {
        // 1) Mover la pieza
        await apiClient.post(`/matches/${matchId}/move`, {
          seat: effectiveSeat,
          pieceId: selectedCell.pieceId,
          from: { r: selectedCell.r, c: selectedCell.c },
          to: { r, c }
        });

        // 2) Intentar terminar el turno inmediatamente después del movimiento
        try {
          await apiClient.post(`/matches/${matchId}/end-turn`, {
            seat: effectiveSeat
          });
        } catch (endErr) {
          const msg = endErr.response?.data?.error;

          // Si el backend obliga a seguir capturando, NO lo mostramos como error grave
          // (mensaje: "Must resolve capture chain")
          if (msg && msg !== 'Must resolve capture chain') {
            setError(msg);
          }
        }

        // 3) Refrescar estado completo desde el backend
        await fetchState(matchId, effectiveSeat);
        setSelectedCell(null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Movimiento inválido.');
      } finally {
        setSubmittingMove(false);
      }
    },
    [matchId, state, effectiveSeat, selectedCell, fetchState]
  );

  const handlePurchasePower = async (powerSlug) => {
    if (!matchId || !effectiveSeat) return;

    setError(null);
    setPurchasingPower(powerSlug);

    try {
      await apiClient.post(`/matches/${matchId}/purchase`, {
        seat: effectiveSeat,
        powerSlug,
        qty: 1
      });

      // Actualizar monedas + inventario
      await fetchState(matchId, effectiveSeat);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo comprar el poder.');
    } finally {
      setPurchasingPower(null);
    }
  };

  const handleActivatePower = async (powerSlug) => {
    if (!matchId || !effectiveSeat || !state) return;

    // Opcional: solo permitir activar en tu turno
    if (state.match?.currentTurn && state.match.currentTurn !== effectiveSeat) {
      setError('Solo puedes activar poderes en tu turno.');
      return;
    }

    setError(null);
    setActivatingPower(powerSlug);

    try {
      await apiClient.post(`/matches/${matchId}/activate-power`, {
        seat: effectiveSeat,
        powerSlug
        // Si tu backend necesita objetivos (ficha, casilla, etc.), aquí se agregan
      });

      // Refrescar estado (pueden cambiar monedas, inventario, efectos)
      await fetchState(matchId, effectiveSeat);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo activar el poder.');
    } finally {
      setActivatingPower(null);
    }
  };


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
    // Navegación dura, pero segura
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
          <Board
            pieces={state.pieces || []}
            traps={state.traps || []}
            onCellClick={handleCellClick}
            selectedCell={selectedCell}
          />

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
                {(state.inventory || []).length === 0 && (
                  <li>No hay poderes comprados</li>
                )}

                {(state.inventory || []).map((item) => {
                  const powerDef = AVAILABLE_POWERS.find(
                    (p) => p.slug === item.powerSlug
                  );

                  const label = powerDef?.name || item.powerSlug;
                  const isMyTurn =
                    state.match?.currentTurn && state.match.currentTurn === effectiveSeat;

                  return (
                    <li key={item.id} className="inventory-item">
                      <div className="inventory-main">
                        <strong>{label}</strong>
                        {' '}
                        <span>
                          x
                          {item.qty}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleActivatePower(item.powerSlug)}
                        disabled={
                          item.qty <= 0
                          || !effectiveSeat
                          || !isMyTurn
                          || activatingPower === item.powerSlug
                        }
                      >
                        {activatingPower === item.powerSlug
                          ? 'Activando...'
                          : 'Activar'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

              <div className="panel-block">
                <h3>Tienda de poderes</h3>
                <ul className="powers-list">
                  {AVAILABLE_POWERS.map((power) => {
                    const myPlayer = (state.players || []).find(
                      (p) => p.userId === user?.id
                    );
                    const myCoins = myPlayer?.coins ?? 0;

                    const canAfford = myCoins >= power.price;
                    const isMyTurn =
                      state.match?.currentTurn && state.match.currentTurn === effectiveSeat;

                    return (
                      <li key={power.slug} className="power-item">
                        <div className="power-main">
                          <strong>{power.name}</strong>
                          {' '}
                          <span className="power-price">
                            (
                            {power.price}
                            {' '}
                            monedas)
                          </span>
                        </div>
                        <div className="power-description">
                          {power.description}
                        </div>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handlePurchasePower(power.slug)}
                          disabled={
                            purchasingPower === power.slug
                            || !effectiveSeat
                            || !isMyTurn
                            || !canAfford
                          }
                        >
                          {purchasingPower === power.slug
                            ? 'Comprando...'
                            : canAfford
                              ? 'Comprar'
                              : 'Monedas insuficientes'}
                        </button>
                      </li>
                    );
                  })}
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
