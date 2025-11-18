import mandupro from '../assets/imgs/mandupro.jpg';

function Mandupro2() {
  return (
    <article className="team-member-card">
      <div className="member-avatar">
        <img src={mandupro} alt="Mandupro" className="avatar-img" />
      </div>
      <div className="member-info">
        <h3>Manuel Mandujano Asta-Buruaga</h3>
        <p className="member-role"> Mandupro </p>
        <p className="member-bio">
          Especializado en backend y arquitectura de base de datos. 
          Implementó el sistema de migración, seeders, la API REST con Koa el inicio de 
          sesion con jwt y el bycript. 
          Mayor industrial, Minor TI. Likes cheese.
        </p>
        <div className="member-tags">
          <span className="tag">Node.js</span>
          <span className="tag">Sequelize</span>
          <span className="tag">PostgreSQL</span>
        </div>
      </div>
    </article>
  );
}

export default Mandupro2;
