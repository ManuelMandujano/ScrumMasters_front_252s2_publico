import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/lobby.css';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useActiveMatch } from '../../context/ActiveMatchContext.jsx';

const POLLING_INTERVAL_MS = 8000;

const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Públicas', value: 'public' },
  { label: 'Privadas', value: 'private' }
];

const visibilityOptions = [
  { label: 'Partida pública', value: 'public' },
  { label: 'Partida privada', value: 'private' }
];

function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeMatch, setActiveMatch, clearActiveMatch } = useActiveMatch();
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [createVisibility, setCreateVisibility] = useState('public');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [joiningMatchId, setJoiningMatchId] = useState(null);
  const [joiningByCode, setJoiningByCode] = useState(false);
  const visibilityRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMatches = async (withSpinner = false) => {
      if (withSpinner) setLoading(true);
      try {
        const { data } = await apiClient.get('/matches');
        if (!cancelled) {
          setMatches(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'No se pudo cargar el lobby');
        }
      } finally {
        if (!cancelled && withSpinner) {
          setLoading(false);
        }
      }
    };

    fetchMatches(true);
    const intervalId = setInterval(() => fetchMatches(false), POLLING_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const filteredMatches = useMemo(() => {
    const nonEmptyMatches = matches.filter(
      (match) => Array.isArray(match.players) && match.players.length > 0
    );
    if (filter === 'all') return nonEmptyMatches;
    return nonEmptyMatches.filter((match) => match.visibility === filter);
  }, [matches, filter]);

  useEffect(() => {
    if (!user?.id) {
      clearActiveMatch();
      return;
    }
    const currentMatch = matches.find(
      (match) => Array.isArray(match.players)
        && match.players.some((player) => player.userId === user.id)
    );
    if (!currentMatch || currentMatch.status === 'finished') {
      clearActiveMatch();
      return;
    }
    const seat = currentMatch.players.find((player) => player.userId === user.id)?.seat || '';
    setActiveMatch({
      matchId: currentMatch.id,
      seat,
      status: currentMatch.status
    });
  }, [matches, user, setActiveMatch, clearActiveMatch]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (visibilityRef.current && !visibilityRef.current.contains(event.target)) {
        setVisibilityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCreateMatch = async () => {
    if (!requireAuth()) return;
    if (hasBlockingActiveMatch) {
      setActionError(`Ya participas en la partida #${activeMatch.matchId}.`);
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    setCreatingMatch(true);
    try {
      const { data } = await apiClient.post('/matches', { visibility: createVisibility });
      setMatches((prev) => [data, ...prev]);
      await joinMatchOnServer(data.id);
      navigate('/match-room', { state: { matchId: data.id } });
    } catch (err) {
      setActionError(err.response?.data?.error || 'No se pudo crear la partida.');
    } finally {
      setCreatingMatch(false);
    }
  };

  const requireAuth = () => {
    if (user?.id) return true;
    setActionError('Debes iniciar sesión para unirte a una partida.');
    return false;
  };

  const matchInProgress = (entry) => entry && ['waiting', 'ongoing'].includes(entry.status);
  const hasBlockingActiveMatch = matchInProgress(activeMatch);

  const upsertPlayerInMatch = (matchList, matchId, playerPayload) => {
    const seatOrder = { A: 0, B: 1 };
    return matchList.map((match) => {
      if (match.id !== matchId) return match;
      const originalPlayers = Array.isArray(match.players) ? match.players : [];
      const fallbackProfile = originalPlayers.find((p) => p.userId === playerPayload.userId)?.user;
      const remainingPlayers = originalPlayers.filter((p) => p.userId !== playerPayload.userId);
      const profile = fallbackProfile
        || (playerPayload.user
          || (user && user.id === playerPayload.userId
            ? { ...user }
            : null));
      const enrichedPlayer = {
        ...playerPayload,
        user: profile
      };
      const updatedPlayers = [...remainingPlayers, enrichedPlayer].sort(
        (a, b) => (seatOrder[a.seat] ?? 0) - (seatOrder[b.seat] ?? 0)
      );
      return { ...match, players: updatedPlayers };
    });
  };

  const joinMatchOnServer = async (matchId) => {
    const { data } = await apiClient.post(`/matches/${matchId}/join`, { userId: user.id });
    let computedStatus = 'waiting';
    setMatches((prev) => {
      const matchExists = prev.some((match) => match.id === matchId);
      if (!matchExists) return prev;
      const updated = upsertPlayerInMatch(prev, matchId, data);
      const found = updated.find((match) => match.id === matchId);
      if (found?.status) {
        computedStatus = found.status;
      }
      return updated;
    });
    setActiveMatch({ matchId, seat: data.seat, status: computedStatus });
    return data;
  };

  const handleJoinMatch = async (matchId, { fromCode = false } = {}) => {
    if (!requireAuth()) return;

    setActionError(null);
    setActionSuccess(null);

    if (fromCode) setJoiningByCode(true);
    else setJoiningMatchId(matchId);

    try {
      const data = await joinMatchOnServer(matchId);

      setActiveMatch({
        matchId,
        seat: data.seat,
      });

      if (fromCode) setCode("");

      navigate("/match-room", { state: { matchId } });
    } catch (err) {
      const status = err.response?.status;

      if (status === 404) {
        setActionError(`No existe ninguna partida con el código ${matchId}.`);
      } else if (status === 400) {
        setActionError(err.response?.data?.error || "No se pudo unir a la partida.");
      } else {
        setActionError("Error al conectarse al servidor.");
      }
    } finally {
      if (fromCode) setJoiningByCode(false);
      else setJoiningMatchId(null);
    }
  };


  const handleJoinByCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setActionError('Ingresa un código antes de unirte.');
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setActionError('El código debe ser un número entero positivo.');
      return;
    }
    await handleJoinMatch(parsed, { fromCode: true });
  };

  const handleSpectate = async (matchId) => {
    setActionError(null);
    setActionSuccess(null);
    navigate('/game-board', { state: { matchId, seat: '' } });
  };

  const visibilityLabel = (value) => (value === 'public' ? 'Pública' : 'Privada');

  const playerDisplayName = (player) => {
    const candidates = [
      player.user?.username,
      player.username,
      player.user?.name,
      player.name,
      player.user?.fullName,
      player.user?.displayName
    ];
    const cleanName = candidates.find((value) => typeof value === 'string' && !value.includes('@') && value.trim().length > 0);
    return cleanName || `Jugador ${player.seat}`;
  };

  return (
    <div className="lobby-shell">
      <header className="lobby-header">
        <p className="eyebrow">Lobby global</p>
        <h1>Partidas</h1>
        <div className="code-join-card">
          <div>
            <p className="code-join-tag">¿Tienes código?</p>
            <h3>Únete a una privada</h3>
            <p>Ingresa el código compartido para ocupar un asiento disponible.</p>
          </div>
          <div className="code-join-card-fields">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej: 12"
              value={code}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/[^0-9]/g, '');
                setCode(nextValue);
                if (actionError) setActionError(null);
              }}
            />
            <button type="button" onClick={handleJoinByCode} disabled={joiningByCode || !code.trim()}>
              {joiningByCode ? 'Uniendo...' : 'Unirse'}
            </button>
          </div>
        </div>
      </header>

      <div className="lobby-toolbar">
        <div className="filter-group">
          {filters.map((option) => (
            <button
              type="button"
              key={option.value}
              className={filter === option.value ? 'active' : ''}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="create-match selector-partida" ref={visibilityRef}>
          <div className={`visibility-dropdown ${visibilityOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="visibility-trigger"
              onClick={() => setVisibilityOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={visibilityOpen}
            >
              {visibilityOptions.find((option) => option.value === createVisibility)?.label}
              <span className="chevron" aria-hidden="true">
                {/* inline SVG caret for precise centering and crisp rendering */}
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {visibilityOpen && (
              <div className="visibility-menu" role="listbox">
                {visibilityOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={createVisibility === option.value ? 'active' : ''}
                    onClick={() => {
                      setCreateVisibility(option.value);
                      setVisibilityOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={handleCreateMatch} disabled={creatingMatch}>
            {creatingMatch ? 'Creando...' : 'Crear partida'}
          </button>
        </div>
      </div>

      {loading && <div className="lobby-status">Cargando partidas...</div>}
      {error && <div className="lobby-status error">{error}</div>}
      {actionError && <div className="lobby-status error">{actionError}</div>}
      {actionSuccess && <div className="lobby-status success">{actionSuccess}</div>}

      {!loading && !error && (
        <div className="matches-grid">
          {filteredMatches.map((match) => (
            <article className="match-card" key={match.id}>
              <header>
                <p className="match-id">
                  Match #
                  {match.id}
                </p>
                <span className={`status-pill status-${match.status}`}>{match.status}</span>
              </header>
              <p className="match-visibility">
                {visibilityLabel(match.visibility)}
              </p>
              <div className="match-players">
                {(match.players || []).map((player) => (
                  <div key={player.id ?? player.seat} className="player-slot">
                    <p>{playerDisplayName(player)}</p>
                  </div>
                ))}
              </div>
              <div className="match-actions">
                {(() => {
                  const isPlayer = user
                    && Array.isArray(match.players)
                    && match.players.some((p) => p.userId === user.id);

                  const isJoinable = match.status === 'waiting' && !isPlayer;
                  const canResume = isPlayer && match.status !== 'finished';

                  // 1) Caso: puedo unirme (partida en waiting y no soy jugador)
                  if (isJoinable) {
                    return (
                      <>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleJoinMatch(match.id)}
                          disabled={joiningMatchId === match.id}
                        >
                          {joiningMatchId === match.id ? 'Uniendo...' : 'Unirse'}
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleSpectate(match.id)}
                        >
                          👁 Expectar
                        </button>
                      </>
                    );
                  }

                  // 2) Caso: ya soy jugador y la partida sigue viva → "Volver a la partida"
                  if (canResume) {
                    const seat = (match.players || []).find(
                      (p) => p.userId === user.id
                    )?.seat || '';

                    return (
                      <>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => {
                            // Actualizar el activeMatch y mandar al tablero
                            setActiveMatch({
                              matchId: match.id,
                              seat,
                              status: match.status
                            });
                            window.location.assign('/game-board');
                          }}
                        >
                          Volver a la partida
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => handleSpectate(match.id)}
                        >
                          👁 Expectar
                        </button>
                      </>
                    );
                  }

                  // 3) Caso: no me puedo unir (por ejemplo ongoing y no soy jugador) → solo expectar
                  return (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleSpectate(match.id)}
                    >
                      👁 Expectar
                    </button>
                  );
                })()}
              </div>

            </article>
          ))}
          {filteredMatches.length === 0 && (
            <article className="match-card empty-state">
              <h3>No hay partidas en este momento</h3>
              <p>Actualizaremos la lista automáticamente cuando aparezca alguna.</p>
            </article>
          )}
        </div>
      )}
    </div>
  );
}

export default Lobby;
