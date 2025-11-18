import niggaemi from '../assets/imgs/niggaemi.jpg';

function Niggaemi2() {
  return (
    <article className="team-member-card">
      <div className="member-avatar">
        <img src={niggaemi} alt="Niggaemi" className="avatar-img" />
      </div>
      <div className="member-info">
        <h3> Paulo Noemi Zuleta</h3>
        <p className="member-role"> Niño feuc </p>
        <p className="member-bio">
          Enfocado en la experiencia de usuario y componentes React. 
          Desarrolló el lobby, sala previa y sistema de matchmaking en tiempo real. 
          Mayor industrial, Minor TI.
          Le gusta el pollo frito y el anime, ademas estuvo en la feuc.
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
