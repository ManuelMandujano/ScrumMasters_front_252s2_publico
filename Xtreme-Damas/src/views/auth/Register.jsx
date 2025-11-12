import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../assets/styles/auth.css';

const DEFAULT_ROLE = 'player';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: DEFAULT_ROLE
  });
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setAuthError(null);
    setSuccessMessage('');
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(formData);
      setSuccessMessage('Cuenta creada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h1>Registra tu escuadrón</h1>
        <p>Define tu identidad y desbloquea los poderes especiales del juego.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">
            Nombre completo
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Manuel Mandujano"
              required
            />
          </label>
          <label htmlFor="username">
            Nombre de usuario
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="mandupro"
              required
            />
          </label>
          <label htmlFor="email">
            Correo electrónico
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="scrummaster@example.com"
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
              placeholder="Mínimo 8 caracteres"
              required
            />
          </label>
          <label htmlFor="role">
            Rol
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="player">Jugador</option>
              <option value="spectator">Espectador</option>
            </select>
          </label>
          {authError && <p className="auth-error">{authError}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-meta">
          ¿Ya tienes cuenta?
          {' '}
          <Link to="/login">Volver al ingreso</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
