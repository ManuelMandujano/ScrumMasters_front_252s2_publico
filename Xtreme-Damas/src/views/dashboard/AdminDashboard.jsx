import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../assets/styles/dashboard.css';

const adminWidgets = [
  { title: 'Usuarios activos', value: '134', detail: 'Jugadores registrados en la última semana.' },
  { title: 'Partidas en curso', value: '12', detail: 'Matches ongoing públicos y privados.' },
  { title: 'Alertas pendientes', value: '4', detail: 'Reportes por lenguaje ofensivo o abandono.' }
];

const adminActions = [
  { title: 'Ver usuarios', description: 'Accede al CRUD completo con acciones de ban y suspensión.', link: '/users' },
  { title: 'Revisar partidas', description: 'Monitorea matches ongoing y fuerza finalización si es necesario.', link: '/lobby' },
  { title: 'Pruebas de seguridad', description: 'Valida scopes desde el endpoint /scopes.', link: '/instructions' }
];

function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <p className="eyebrow">Panel administrativo</p>
        <h1>
          Control central –
          {' '}
          {user?.name || user?.username}
        </h1>
        <p>Gestiona reputaciones, revisa partidas conflictivas y habilita nuevas salas.</p>
      </header>

      <section className="stats-grid">
        {adminWidgets.map((widget) => (
          <article key={widget.title} className="stat-card">
            <h3>{widget.value}</h3>
            <p>{widget.title}</p>
            <small>{widget.detail}</small>
          </article>
        ))}
      </section>

      <section className="actions-grid">
        {adminActions.map((action) => (
          <Link to={action.link} key={action.title} className="action-link-card">
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <span className="action-link">Administrar →</span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <h2>Checklist de moderación</h2>
        <ul className="checklist">
          <li>Revisar historial de cada jugador antes de banear.</li>
          <li>Marcar cuentas sospechosas como “en revisión”.</li>
          <li>Confirmar que los reportes estén documentados.</li>
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
