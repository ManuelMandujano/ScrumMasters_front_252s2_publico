import mandupro from '../assets/imgs/mandupro.jpg';

function Mandupro2() {
  return (
    <article className="team-member-card">
      <div className="member-avatar">
        <img src={mandupro} alt="Mandupro" className="avatar-img" />
      </div>
      <div className="member-info">
        <h3>Mandupro: Manuel Mandujano Asta-Buruaga</h3>
        <p className="member-role">Full Stack Gooner</p>
        <p className="member-bio">
          Especializado en backend y arquitectura de base de datos. 
          Implementó el sistema de migración, seeders y la API REST con Koa. Piensa que 
          este ramo es una verga, pero en verdad no es asi, aguante. Likes cheese
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
