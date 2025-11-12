import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../assets/styles/auth.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (event) => {
    setAuthError(null);
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h1>Bienvenido a Damas Extremas</h1>
        <p>Inicia sesión para organizar partidas, comprar poderes y coordinar tu estrategia.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Correo electrónico
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="playerA@example.com"
              required
            />
          </label>
          <label htmlFor="password">
            Contraseña
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </label>
          {authError && <p className="auth-error">{authError}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar al tablero'}
          </button>
        </form>
        <p className="auth-meta">
          ¿Nuevo en la arena?
          {' '}
          <Link to="/register">Crea tu cuenta</Link>
        </p>
        <p className="auth-meta">
          ¿Solo quieres expectar?
          {' '}
          <Link to="/lobby">Ir al lobby público</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
