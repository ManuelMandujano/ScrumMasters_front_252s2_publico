import React from 'react';
import '../assets/styles/nosotros.css';
import Mandupro2 from '../components/mandupro2.jsx';
import Niggaemi2 from '../components/niggaemi2.jsx';
import Villano2 from '../components/villano2.jsx';

function Nosotros() {
  return (
    <div className="nosotros-page">
      <section className="nosotros-section">
        <header className="section-header">
          <p className="eyebrow">Equipo</p>
          <h2>Nosotros</h2>
          <p>Conoce a los desarrolladores que hicieron posible Damas Extremas.</p>
        </header>

        <div className="team-grid">
          <Mandupro2 />
          <Niggaemi2 />
          <Villano2 />
        </div>
      </section>
    </div>
  );
}

export default Nosotros;
