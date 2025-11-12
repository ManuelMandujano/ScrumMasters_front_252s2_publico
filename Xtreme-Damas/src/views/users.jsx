import { useEffect, useState } from 'react';
import '../assets/styles/users.css';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    apiClient.get('/users')
      .then((response) => {
        if (!cancelled) {
          setUsers(response.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || 'No se pudieron obtener los usuarios');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="users-container">
        <h1 className="users-title">👥 Usuarios</h1>
        <div className="no-users">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <h1 className="users-title">👥 Usuarios</h1>
        <div className="no-users">
          Error:
          {' '}
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <h1 className="users-title">👥 Listado oficial de usuarios</h1>
      <p className="users-subtitle">
        Administra reputaciones, suspende cuentas conflictivas y mantén el ecosistema saludable.
      </p>
      {users.length > 0 ? (
        <div className="users-row">
          {users.map((player) => (
            <div className="user-card" key={player.id}>
              <div className="user-info">
                <span className="user-label">ID:</span>
                <span>{player.id}</span>
              </div>
              <div className="user-info">
                <span className="user-label">Nombre:</span>
                <span>{player.name || 'Sin nombre'}</span>
              </div>
              <div className="user-info">
                <span className="user-label">Username:</span>
                <span>{player.username}</span>
              </div>
              <div className="user-info">
                <span className="user-label">Email:</span>
                <span>{player.email || 'Sin email'}</span>
              </div>
              <div className="user-info">
                <span className="user-label">Rol:</span>
                <span className={`role-badge role-${player.role}`}>{player.role}</span>
              </div>
              <div className="user-actions">
                <button type="button" className="ghost-btn">Bloquear</button>
                <button type="button" className="ghost-btn ghost-outline">Suspender</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-users">No hay usuarios registrados.</div>
      )}
    </div>
  );
}

export default Users;
