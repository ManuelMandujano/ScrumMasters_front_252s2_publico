import { Link } from 'react-router-dom';

const actions = [
  {
    title: 'Expectar partidas',
    description: 'Ingresa al lobby público y mira enfrentamientos en tiempo real con chat lateral.',
    link: '/lobby',
    badge: 'Spect Mode'
  },
  {
    title: 'Iniciar sesión',
    description: 'Accede a tu tablero personal, monedas, historial y crea partidas privadas.',
    link: '/login',
    badge: 'Jugadores'
  },
  {
    title: 'Registrarse',
    description: 'Crea tu identidad, define avatar y prepárate para recibir poderes especiales.',
    link: '/register',
    badge: 'Nuevo escuadrón'
  }
];

function Mandupro() {
  return (
    <section className="home-section">
      <header className="section-header">
        <p className="eyebrow">Registro y navegación</p>
        <h2>Todo inicia en el portal principal</h2>
        <p>
          Tal como detalla el enunciado, la experiencia se divide en tres caminos: expectar,
          iniciar sesión o crear una cuenta. Cada ruta desbloquea interfaces distintas
          sin perder consistencia estética.
        </p>
      </header>
      <div className="action-grid">
        {actions.map((action) => (
          <Link to={action.link} key={action.title} className="action-card">
            <span className="badge">{action.badge}</span>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <span className="action-link">Entrar →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Mandupro;
