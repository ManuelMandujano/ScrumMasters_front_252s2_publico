import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../assets/styles/dashboard.css';

const statsConfig = [
  { key: 'matchesPlayed', label: 'Partidas jugadas', fallback: 0 },
  { key: 'wins', label: 'Victorias', fallback: 0 },
  { key: 'coins', label: 'Monedas actuales', fallback: 0 },
  { key: 'favoritePower', label: 'Poder favorito', fallback: 'Sin definir' }
];

const actions = [
  { title: 'Unirse a partida', description: 'Explora el lobby público y ocupa tu asiento.', link: '/lobby' },
  { title: 'Crear partida', description: 'Define visibilidad pública o privada y comparte el código.', link: '/match-room' },
  { title: 'Ver tablero', description: 'Consulta el estado de un match y sus paneles de control.', link: '/game-board' },
  { title: 'Reglas y poderes', description: 'Repasa las mecánicas especiales antes de tu turno.', link: '/instructions' }
];

const powers = [
  { slug: 'escudo', desc: 'Bloquea una captura.' },
  { slug: 'sanador', desc: 'Revive una ficha aliada.' },
  { slug: 'super salto', desc: 'Salta dos casillas durante el turno.' },
  { slug: 'doble movimiento', desc: 'Mueve la misma ficha dos veces.' }
];

function PlayerDashboard() {
  const { user } = useAuth();
  const stats = statsConfig.map(({ key, label, fallback }) => {
    const rawValue = (user?.stats && user.stats[key]) ?? user?.[key];
    return {
      label,
      value: rawValue ?? fallback
    };
  });

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <p className="eyebrow">Panel de jugador</p>
        <h1>
          Hola
          {' '}
          {user?.name || user?.username}
        </h1>
        <p>Desde aquí puedes saltar a cualquiera de los pasos descritos en el flujo oficial.</p>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="actions-grid">
        {actions.map((action) => (
          <Link to={action.link} key={action.title} className="action-link-card">
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <span className="action-link">Ir →</span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <h2>Inventario rápido</h2>
        <ul className="powers-list">
          {powers.map((power) => (
            <li key={power.slug}>
              <strong>{power.slug}</strong>
              <span>{power.desc}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PlayerDashboard;
