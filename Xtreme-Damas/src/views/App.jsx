import { Link } from 'react-router-dom';
import '../assets/styles/App.css';
import Mandupro from '../components/mandupro.jsx';
import Niggaemi from '../components/niggaemi.jsx';
import Villano from '../components/villano.jsx';

const heroStats = [
  { label: 'Tablero', value: '10×10' },
  { label: 'Poderes', value: '8 activos' }
];

const featureHighlights = [
  {
    title: 'Economía dinámica',
    detail: '30 monedas iniciales + premios por captura para comprar poderes y trampas.'
  },
  {
    title: 'Poderes limitados',
    detail: 'Escudo, sanador, super salto, doble movimiento, coronación, autodestrucción, trampas y aturdimiento.'
  },
  {
    title: 'Eventos aleatorios',
    detail: 'Hoyo Negro tras dos turnos, notificaciones globales y tablero reducido al 3×3 en finales.'
  }
];

function App() {
  return (
    <div className="home-shell">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Experiencia completa</p>
          <h1>Damas Extremas: de la sala previa al tablero</h1>
          <p>
            Juega, administra y especta partidas extremo desde una misma interfaz: lobby, sala previa,
            tablero y paneles están listos para usar.
          </p>
          <div className="hero-actions">
            <Link to="/lobby" className="primary-btn">Ver Lobby</Link>
            <Link to="/instructions" className="secondary-btn">Leer reglas</Link>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-panel hero-panel__preview">
          <p className="panel-title">Vista del tablero</p>
          <div className="hero-panel__placeholder">
            imagen del tablero
          </div>
        </div>
      </section>

      <Mandupro />

      <section className="home-section alt">
        <header className="section-header">
          <p className="eyebrow">Reglas especiales</p>
          <h2>Lo que hace extremo al modo</h2>
        </header>
        <div className="insight-grid">
          {featureHighlights.map((feature) => (
            <article key={feature.title} className="insight-card">
              <h3>{feature.title}</h3>
              <p>{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <Niggaemi />
      <Villano />

      <section className="home-section cta">
        <header className="section-header">
          <p className="eyebrow">¿Y ahora?</p>
          <h2>Escoge tu ruta</h2>
          <p>Accede al dashboard según tu rol o practica el flujo de partida completo.</p>
        </header>
        <div className="cta-grid">
          <Link to="/login" className="cta-card">
            <h3>Jugador</h3>
            <p>Ver perfil, crear/unirse a partidas y administrar poderes.</p>
            <span>Entrar</span>
          </Link>
          <Link to="/admin" className="cta-card">
            <h3>Administrador</h3>
            <p>Gestionar reputaciones y sanciones desde el panel central.</p>
            <span>Gestionar</span>
          </Link>
          <Link to="/match-room" className="cta-card">
            <h3>Sala previa</h3>
            <p>Simula el chat, confirmación de “Listo” y timers del lobby.</p>
            <span>Simular</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default App;
