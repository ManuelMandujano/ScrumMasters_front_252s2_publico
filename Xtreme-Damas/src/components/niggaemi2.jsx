import niggaemi from '../assets/imgs/niggaemi.jpg';

function Niggaemi2() {
  return (
    <article className="team-member-card">
      <div className="member-avatar">
        <img src={niggaemi} alt="Niggaemi" className="avatar-img" />
      </div>
      <div className="member-info">
        <h3>Niggaemi: Paulo Noemi Zuleta</h3>
        <p className="member-role">Esta en la feuc</p>
        <p className="member-bio">
          Enfocado en la experiencia de usuario y componentes React. 
          Desarrolló el (nada) lobby, sala previa y sistema de matchmaking en tiempo real?
          Le gusta el pollo frito y el anime. Ademas es negro. Lol.
        </p>
        <div className="member-tags">
          <span className="tag">React</span>
          <span className="tag">Vite</span>
          <span className="tag">CSS</span>
        </div>
      </div>
    </article>
  );
}

export default Niggaemi2;
