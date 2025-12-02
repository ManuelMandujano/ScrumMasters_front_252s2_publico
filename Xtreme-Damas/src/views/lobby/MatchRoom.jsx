import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/matchroom.css';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';
import { useActiveMatch } from '../../context/ActiveMatchContext.jsx';

const POLL_INTERVAL_MS = 6000;
const CHAT_CHANNEL_PREFIX = 'match-room-chat-';

const generateMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function MatchRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setActiveMatch, clearActiveMatch } = useActiveMatch();
  const initialMatchId = location.state?.matchId ? String(location.state.matchId) : '';
  const [matchId, setMatchId] = useState(initialMatchId);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readyLoading, setReadyLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'seed-message',
      author: 'Sistema',
      text: 'Comparte el código de la sala para invitar a otro jugador.',
      createdAt: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [shareFeedback, setShareFeedback] = useState(null);
  const channelRef = useRef(null);
  const tabIdRef = useRef(generateMessageId());
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (location.state?.matchId) {
      const nextId = String(location.state.matchId);
      setMatchId(nextId);
      navigatedRef.current = false;
    }
  }, [location.state]);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      return () => {};
    }
    let intervalId;

    const fetchMatch = async (withSpinner = false) => {
      if (!matchId) return;
      if (withSpinner) setLoading(true);
      try {
        const { data } = await apiClient.get(`/matches/${matchId}`);
        setMatch(data);
        setError(null);
      } catch (err) {
        const message = err.response?.data?.error || 'No se pudo cargar la sala previa.';
        setError(message);
      } finally {
        if (withSpinner) {
          setLoading(false);
        }
      }
    };

    fetchMatch(true);
    intervalId = setInterval(() => fetchMatch(false), POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [matchId]);

  useEffect(() => {
    navigatedRef.current = false;
  }, [matchId]);

  useEffect(() => {
    if (!match || match.status !== 'ongoing' || !matchId || navigatedRef.current) {
      return;
    }
    const playerSeat = match.players?.find((player) => player.userId === user?.id)?.seat || '';
    navigatedRef.current = true;
    navigate('/game-board', { state: { matchId, seat: playerSeat } });
  }, [match, matchId, navigate, user]);

  const playerSlots = useMemo(() => ['A', 'B'].map((seat) => {
    const player = match?.players?.find((p) => p.seat === seat);
    return {
      seat,
      player,
      ready: Boolean(player?.isReady),
      username: player?.user?.username || (player ? `Seat ${seat}` : 'Disponible'),
      coins: player?.coins ?? null
    };
  }), [match]);

  useEffect(() => {
    if (!match || !user?.id) {
      return;
    }
    const seat = match.players?.find((player) => player.userId === user.id)?.seat || '';
    if (match.status === 'finished' || !seat) {
      clearActiveMatch();
      return;
    }
    setActiveMatch({
      matchId: match.id,
      seat,
      status: match.status
    });
  }, [match, user, setActiveMatch, clearActiveMatch]);

  const pushMessage = useCallback((message) => {
    if (!message) return;
    setMessages((prev) => {
      if (message.id && prev.some((item) => item.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined' || !matchId) {
      return () => {};
    }
    const channel = new BroadcastChannel(`${CHAT_CHANNEL_PREFIX}${matchId}`);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const { type, message, senderId } = event.data || {};
      if (type !== 'chat-message' || !message || senderId === tabIdRef.current) return;
      pushMessage(message);
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [matchId, pushMessage]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const authorName = user?.username || user?.name || `Jugador ${user?.id || ''}`;
    const message = {
      id: generateMessageId(),
      author: authorName,
      text: trimmed,
      createdAt: Date.now()
    };
    pushMessage(message);
    setInput('');
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'chat-message',
        message,
        senderId: tabIdRef.current
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleReadyUp = async () => {
    if (!matchId) return;
    if (!user?.id) {
      setError('Debes iniciar sesión para marcarte listo.');
      return;
    }
    setReadyLoading(true);
    try {
      await apiClient.post(`/matches/${matchId}/ready`, { userId: user.id });
      await apiClient.get(`/matches/${matchId}`).then(({ data }) => setMatch(data));
      setError(null);
    } catch (err) {
      const message = err.response?.data?.error || 'No pudimos marcarte como listo.';
      setError(message);
    } finally {
      setReadyLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!matchId) return;
    try {
      await navigator.clipboard.writeText(matchId);
      setShareFeedback('Código copiado');
    } catch (err) {
      const message = err.message || 'No se pudo copiar, cópialo manualmente.';
      setShareFeedback(message);
    } finally {
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const occupiedSeats = match?.players?.length || 0;
  const waitingStatus = occupiedSeats < 2 ? 'Esperando a que otro jugador se una...' : 'Ambos asientos ocupados.';
  if (error) {
    return (
      <div className="matchroom-error">
        <p className="auth-error">{error}</p>
        <button className="secondary-btn" onClick={() => navigate("/lobby")}>
          Volver al lobby
        </button>
      </div>
    );
  }

  return (
    <div className="matchroom-shell">
      <header className="matchroom-header">
        <p className="eyebrow">Sala previa</p>
        <h1>Confirmación de jugadores</h1>
        <p>Comparte el código, ocupa un asiento y marca “Listo” para avanzar al tablero.</p>
      </header>

      <div className="matchroom-meta">
        <div>
          <p className="matchroom-code-label">Código de la partida</p>
          <h2 className="matchroom-code">{matchId || '—'}</h2>
          <p className="matchroom-status">{matchId ? waitingStatus : 'Crea una partida o ingresa desde el lobby.'}</p>
        </div>
        <div className="meta-actions">
          <button type="button" onClick={handleCopyCode} disabled={!matchId}>
            Copiar código
          </button>
          <button type="button" onClick={() => navigate('/lobby')}>
            Volver al lobby
          </button>
        </div>
      </div>
      {shareFeedback && <p className="matchroom-feedback">{shareFeedback}</p>}

      {error && <p className="auth-error">{error}</p>}
      {loading && <p className="matchroom-status">Actualizando sala...</p>}

      <div className="players-panel">
        {playerSlots.map((slot) => (
          <article key={slot.seat} className={`player-card ${slot.ready ? 'ready' : ''}`}>
            <div>
              <p className="player-seat">
                Jugador
                {' '}
                {slot.seat}
              </p>
              <h3>{slot.username}</h3>
              <p className="player-status">
                {slot.player ? (slot.ready ? 'Listo' : 'Esperando confirmación') : 'Asiento libre'}
              </p>
            </div>
            {slot.player && slot.player.userId === user?.id ? (
              slot.ready ? (
                <span className="ready-pill">Listo ✓</span>
              ) : (
                <button type="button" onClick={handleReadyUp} disabled={readyLoading}>
                  {readyLoading ? 'Confirmando...' : 'Marcar listo'}
                </button>
              )
            ) : (
              <p className="player-slot-hint">
                {slot.player ? 'Esperando al rival' : 'Comparte el código'}
              </p>
            )}
          </article>
        ))}
      </div>

      <section className="chat-section">
        <div className="chat-header">
          <h2>Chat de la sala</h2>
        </div>
        <div className="chat-body">
          {messages.map((message, index) => (
            <div key={`${message.author}-${index}`} className="chat-message">
              <strong>{message.author}</strong>
              <span>{message.text}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" onClick={sendMessage}>Enviar</button>
        </div>
      </section>
    </div>
  );
}

export default MatchRoom;
