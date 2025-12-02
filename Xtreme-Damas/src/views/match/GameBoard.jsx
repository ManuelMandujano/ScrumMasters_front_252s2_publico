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

const POLL_INTERVAL_MS = 1000;

const AVAILABLE_POWERS = [
  {
    slug: 'escudo',
    icon: '🛡️',
    shortName: 'Escudo',
    description: 'Bloquea una eliminación durante el turno rival.',
    price: 20
  },
  {
    slug: 'sanador',
    icon: '💉',
    shortName: 'Sanador',
    description: 'Revive una ficha aliada.',
    price: 35
  },
  {
    slug: 'super_salto',
    icon: '⚡',
    shortName: 'Super salto',
    description: 'Permite una captura especial (salto avanzado).',
    price: 25
  },
  {
    slug: 'doble_mov',
    icon: '🔥',
    shortName: 'Doble mov.',
    description: 'Te permite mover dos veces en tu turno.',
    price: 30
  },
  {
    slug: 'coronacion',
    icon: '👑',
    shortName: 'Coronación',
    description: 'Convierte una ficha en dama al instante.',
    price: 40
  },
  {
    slug: 'autodestruccion',
    icon: '💣',
    shortName: 'Autodestr.',
    description: 'Elimina una ficha enemiga cercana.',
    price: 35
  },
  {
    slug: 'trampa',
    icon: '☠️',
    shortName: 'Trampa',
    description: 'Coloca una casilla trampa oculta.',
    price: 25
  },
  {
    slug: 'aturdimiento',
    icon: '💫',
    shortName: 'Aturdir',
    description: 'Deja una ficha rival sin jugar por 2 turnos.',
    price: 30
  }
];

const POWER_BEHAVIOR = {
  escudo: {
    requiresPiece: true,
    owner: 'self',      // solo funciona sobre pieza tuya
    label: 'Escudo'
  },
  sanador: {
    // asumiremos que sanador revive una ficha en una casilla vacía elegida
    requiresCell: true,
    mustBeEmpty: true,  // casilla sin pieza ni trampa
    label: 'Sanador'
  },
  super_salto: {
    requiresPiece: false,
    label: 'Super salto'
  },
  doble_mov: {
    requiresPiece: false,
    label: 'Doble movimiento'
  },
  coronacion: {
    requiresPiece: true,
    owner: 'self',
    label: 'Coronación'
  },
  autodestruccion: {
    requiresPiece: true,
    owner: 'self',  // seleccionas tu propia ficha que explota
    label: 'Autodestrucción'
  },
  trampa: {
    requiresCell: true,
    mustBeEmpty: true,
    label: 'Casilla trampa'
  },
  aturdimiento: {
    requiresPiece: true,
    owner: 'opponent',
    label: 'Aturdimiento'
  }
};



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
        return data; // 👈 IMPORTANTE: ahora devolvemos el estado

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
    async ({ r, c, piece, trap }) => {
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

        setSelectedCell({
          r,
          c,
          pieceId: piece.id,
          piece,
          trap: trap || null
        });
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
        // 1) Mover la ficha
        await apiClient.post(`/matches/${matchId}/move`, {
          seat: effectiveSeat,
          pieceId: selectedCell.pieceId,
          from: { r: selectedCell.r, c: selectedCell.c },
          to: { r, c }
        });

        // 2) Traigo el estado actualizado DESDE el backend
        const newState = await fetchState(matchId, effectiveSeat);

        // 3) Decido si el turno debe terminarse ahora o no
        const me = (newState?.players || []).find(
          (p) => p.seat === effectiveSeat
        );
        const ts = me?.turnState || {};

        const mustContinueCapture = ts.mustContinueCapture;
        const hasDoubleMove =
          ts.doubleMove?.active && ts.doubleMove.remaining > 0;

        // 👉 Si NO hay cadena de captura y NO quedan movimientos de doble_mov,
        //    terminamos el turno automáticamente como antes.
        if (!mustContinueCapture && !hasDoubleMove) {
          try {
            await apiClient.post(`/matches/${matchId}/end-turn`, {
              seat: effectiveSeat
            });
            await fetchState(matchId, effectiveSeat);
          } catch (endErr) {
            const msg = endErr.response?.data?.error;
            if (msg && msg !== 'Must resolve capture chain') {
              setError(msg);
            }
          }
        }

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
      // Llamada al backend
      await apiClient.post(`/matches/${matchId}/purchase`, {
        seat: effectiveSeat,
        powerSlug,
        qty: 1
      });

      // Refrescar monedas + inventario
      await fetchState(matchId, effectiveSeat);
    } catch (err) {
      console.error('Error al comprar poder:', err.response?.data || err.message);
      setError(
        err.response?.data?.error
          || err.response?.data?.message
          || 'No se pudo comprar el poder.'
      );
    }

    // Forzar limpieza aunque haya error o éxito
    setPurchasingPower(null);
  };



  const handleActivatePower = async (powerSlug) => {
    if (!matchId || !effectiveSeat || !state) return;

    const config = POWER_BEHAVIOR[powerSlug] || {};

    // Debe ser tu turno
    if (state.match?.currentTurn && state.match.currentTurn !== effectiveSeat) {
      setError('Solo puedes activar poderes en tu turno.');
      return;
    }

    // Datos de la celda seleccionada
    const cell = selectedCell;
    const selectedPiece = cell?.piece || null;
    const selectedTrap = cell?.trap || null;

    // Validaciones según el tipo de poder
    if (config.requiresPiece) {
      if (!cell || !selectedPiece) {
        setError(`Selecciona primero una ficha para usar ${config.label || 'este poder'}.`);
        return;
      }

      const isMine = selectedPiece.seat === effectiveSeat;
      const isOpponent = !isMine;

      if (config.owner === 'self' && !isMine) {
        setError('Debes seleccionar una de tus propias fichas.');
        return;
      }
      if (config.owner === 'opponent' && !isOpponent) {
        setError('Debes seleccionar una ficha del oponente.');
        return;
      }
    }

    if (config.requiresCell) {
      if (!cell) {
        setError(`Selecciona una casilla del tablero para usar ${config.label || 'este poder'}.`);
        return;
      }

      if (config.mustBeEmpty && (selectedPiece || selectedTrap)) {
        setError('Debes elegir una casilla vacía (sin ficha ni trampa).');
        return;
      }
    }

    setError(null);
    setActivatingPower(powerSlug);

    try {
      const payload = {
        seat: effectiveSeat,
        powerSlug
      };

      // Poderes que actúan sobre una pieza
      if (config.requiresPiece && selectedPiece) {
        payload.pieceId = selectedPiece.id;
      }

      // Poderes que actúan sobre una casilla (trampa, sanador, etc.)
      if (config.requiresCell && cell) {
        payload.target = { r: cell.r, c: cell.c };
      }

      const { data } = await apiClient.post(
        `/matches/${matchId}/activate-power`,
        payload
      );

      console.log('Respuesta activando poder:', data);

      // Refrescar monedas, inventario y estado del tablero
      await fetchState(matchId, effectiveSeat);
    } catch (err) {
      console.error('Error al activar poder:', err.response?.data || err.message);
      setError(
        err.response?.data?.error
          || err.response?.data?.message
          || 'No se pudo activar el poder.'
      );
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

  const myInventory = (state?.inventory || [])
  .filter((item) => item.seat === effectiveSeat && item.qty > 0);


  const opponentInventory = (state?.inventory || []).filter(
    (item) => item.seat && item.seat !== effectiveSeat
  );

  



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
              <h3>Mis poderes</h3>
              <ul className="powers-list">
                {myInventory.length === 0 && (
                  <li className="power-item">
                    <span className="power-empty">No tienes poderes</span>
                  </li>
                )}

                {myInventory.map((item) => {
                  const powerDef = AVAILABLE_POWERS.find(
                    (p) => p.slug === item.powerSlug
                  );

                  const label = powerDef?.shortName || item.powerSlug;
                  const icon = powerDef?.icon || '✨';
                  const isMyTurn =
                    state.match?.currentTurn && state.match.currentTurn === effectiveSeat;

                  return (
                    <li
                      key={item.id}
                      className="power-item"
                      title={powerDef?.description}
                    >
                      <div className="power-main">
                        <span className="power-icon">{icon}</span>
                        <span className="power-name">
                          {label}
                          {' '}
                          <span className="power-qty">
                            x
                            {item.qty}
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="tiny-btn secondary"
                        onClick={() => handleActivatePower(item.powerSlug)}
                        disabled={
                          !effectiveSeat
                          || !isMyTurn
                          || activatingPower === item.powerSlug
                        }
                      >
                        {activatingPower === item.powerSlug ? '...' : 'Usar'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>




              <div className="panel-block">
                <h3>Tienda</h3>
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
                      <li
                        key={power.slug}
                        className="power-item"
                        title={power.description}
                      >
                        <div className="power-main">
                          <span className="power-icon">{power.icon}</span>
                          <span className="power-name">{power.shortName}</span>
                          <span className="power-price">
                            {power.price}
                            {' '}
                            💰
                          </span>
                        </div>
                        <button
                          type="button"
                          className="tiny-btn"
                          onClick={() => handlePurchasePower(power.slug)}
                          disabled={
                            purchasingPower === power.slug
                            || !effectiveSeat
                            || !isMyTurn
                            || !canAfford
                          }
                        >
                          {purchasingPower === power.slug ? '...' : 'Comprar'}
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
