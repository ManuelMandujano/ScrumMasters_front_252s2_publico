import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

const STORAGE_KEY = 'xtreme_active_match';

const ActiveMatchContext = createContext(null);

const readStoredMatch = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse active match from storage', error);
    return null;
  }
};

export function ActiveMatchProvider({ children }) {
  const [activeMatch, setActiveMatchState] = useState(() => readStoredMatch());
  const [viewingMatchId, setViewingMatchIdState] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!activeMatch) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeMatch));
    }
  }, [activeMatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        if (!event.newValue) {
          setActiveMatchState(null);
        } else {
          try {
            setActiveMatchState(JSON.parse(event.newValue));
          } catch (error) {
            console.warn('Failed to parse active match from storage event', error);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setActiveMatch = useCallback((payload) => {
    if (!payload || !payload.matchId) {
      setActiveMatchState(null);
      return;
    }
    setActiveMatchState({
      matchId: Number(payload.matchId),
      seat: payload.seat || '',
      status: payload.status || 'waiting'
    });
  }, []);

  const updateActiveMatch = useCallback((partial) => {
    setActiveMatchState((prev) => {
      if (!prev) return prev;
      return { ...prev, ...partial };
    });
  }, []);

  const clearActiveMatch = useCallback(() => {
    setActiveMatchState(null);
  }, []);

  const setViewingMatchId = useCallback((matchId) => {
    if (matchId == null) {
      setViewingMatchIdState(null);
      return;
    }
    setViewingMatchIdState(Number(matchId));
  }, []);

  const clearViewingMatchId = useCallback(() => {
    setViewingMatchIdState(null);
  }, []);

  const value = useMemo(() => ({
    activeMatch,
    setActiveMatch,
    updateActiveMatch,
    clearActiveMatch,
    viewingMatchId,
    setViewingMatchId,
    clearViewingMatchId
  }), [activeMatch, setActiveMatch, updateActiveMatch, clearActiveMatch, viewingMatchId, setViewingMatchId, clearViewingMatchId]);

  return (
    <ActiveMatchContext.Provider value={value}>
      {children}
    </ActiveMatchContext.Provider>
  );
}

export function useActiveMatch() {
  const context = useContext(ActiveMatchContext);
  if (!context) {
    throw new Error('useActiveMatch debe usarse dentro de ActiveMatchProvider');
  }
  return context;
}
