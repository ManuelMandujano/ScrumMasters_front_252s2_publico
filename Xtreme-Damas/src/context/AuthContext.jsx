import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import apiClient, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

const persistUser = (user) => {
  if (user) {
    localStorage.setItem('xtreme_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('xtreme_user');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('xtreme_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('xtreme_token'));
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const handleAuthSuccess = useCallback((payload) => {
    const { user: profile, access_token: accessToken } = payload;
    setToken(accessToken);
    setAuthToken(accessToken);
    setUser(profile);
    persistUser(profile);
    setAuthError(null);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      handleAuthSuccess(data);
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data || 'No se pudo iniciar sesión';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setAuthError(null);
    try {
      await apiClient.post('/auth/signup', payload);
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data || 'No se pudo registrar';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    persistUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    authError,
    login,
    register,
    logout,
    setAuthError
  }), [user, token, loading, authError, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
