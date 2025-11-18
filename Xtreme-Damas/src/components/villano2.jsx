import villano from '../assets/imgs/villano.jpg';

function Villano2() {
  return (
    <article className="team-member-card">
      <div className="member-avatar">
        <img src={villano} alt="Villano" className="avatar-img" />
      </div>
      <div className="member-info">
        <h3>Rodrigo Sebastian Villena Manzano</h3>
        <p className="member-role">Lil Computin</p>
        <p className="member-bio">
          Responsable de la lógica del juego y mecánicas especiales. 
          Implementó el tablero, sistema de turnos, poderes y trampas dinámicas.
          Mayor industrial y Minor computación. Dato freak: no sabe dividir por 3.
        </p>
        <div className="member-tags">
          <span className="tag">JavaScript</span>
          <span className="tag">Game Logic</span>
          <span className="tag">WebSockets</span>
        </div>
      </div>
    </article>
  );
}

export default Villano2;
