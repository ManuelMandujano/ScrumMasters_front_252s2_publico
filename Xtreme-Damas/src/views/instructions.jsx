import '../assets/styles/instructions.css';

function Instructions() {
  return (
    <div className="instructions">
      <h1 className="instructions-title">🔥 Instrucciones - Damas Extremas 🔥</h1>

      <section className="instructions-section">
        <h2>🎯 Objetivo</h2>
        <p>
          En <strong>Damas Extremas</strong>, dos jugadores se enfrentan en un tablero de <strong>10x10</strong> con <strong>15 fichas</strong> cada uno.
          Gana quien elimine todas las fichas del oponente usando estrategia, poderes especiales y trampas ocultas.
        </p>
      </section>

      <section className="instructions-section">
        <h2>💰 Monedas y poderes</h2>
        <p>
          Cada jugador comienza con <strong>30 monedas</strong> y gana <strong>10 monedas</strong> por cada ficha eliminada.
          Con ese saldo compra <strong>poderes</strong> o <strong>trampas</strong> antes de mover.
          También es posible intercambiar poderes o venderlos al rival según el enunciado.
        </p>
        <ul className="powers-list">
          <li>🛡️ <b>Escudo:</b> bloquea una eliminación.</li>
          <li>💉 <b>Sanador:</b> revive una ficha aliada.</li>
          <li>⚡ <b>Super Salto:</b> salta 2 casillas.</li>
          <li>🔥 <b>Doble Movimiento:</b> mueve dos veces en un turno.</li>
          <li>👑 <b>Coronación instantánea:</b> convierte en dama.</li>
          <li>💣 <b>Autodestrucción:</b> elimina una ficha enemiga cercana.</li>
          <li>☠️ <b>Casilla trampa:</b> oculta y elimina al oponente que caiga.</li>
          <li>💫 <b>Aturdimiento:</b> deja una ficha rival sin jugar por 2 turnos.</li>
        </ul>
      </section>

      <section className="instructions-section">
        <h2>♟️ Reglas básicas</h2>
        <ul className="rules-list">
          <li>El juego es por turnos, cada turno permite mover <strong>una ficha</strong>.</li>
          <li>Las fichas normales avanzan en diagonal hacia adelante.</li>
          <li>Las <strong>damas</strong> se mueven en diagonal en cualquier dirección.</li>
          <li>Una ficha se corona al llegar a la última fila del rival.</li>
          <li>Cada ficha puede tener solo <strong>un poder activo</strong> a la vez.</li>
          <li>Si queda una ficha por jugador, el tablero se reduce a <strong>3x3</strong>.</li>
          <li>Tras dos turnos por jugador puede aparecer un <strong>Hoyo Negro</strong> que destruye la casilla ocupada.</li>
        </ul>
      </section>

      <section className="instructions-section">
        <h2>🕹️ Flujo completo</h2>
        <ul className="rules-list">
          <li><strong>Lobby:</strong> lista partidas públicas en estado waiting y permite ingresar códigos privados.</li>
          <li><strong>Sala previa:</strong> jugadores A/B marcan “Listo”, chatean (Enter para mandar) y ven el estado del rival.</li>
          <li><strong>Inicio automático:</strong> cuando ambos están listos se sortean turnos, se posicionan fichas y se asignan monedas.</li>
          <li><strong>Timeouts:</strong> partidas abandonadas se cancelan y si un jugador no responde, el turno pasa automático.</li>
        </ul>
      </section>

      <section className="instructions-section">
        <h2>🖥️ Tableros y paneles</h2>
        <ul className="rules-list">
          <li><strong>Información pública:</strong> marcador de fichas, turno actual, historial de movimientos y eventos globales.</li>
          <li><strong>Panel privado:</strong> monedas disponibles, poderes en inventario y trampas secretas del jugador activo.</li>
          <li><strong>Eventos del servidor:</strong> turnos iniciados, movimientos resueltos, trampas reveladas, chat, timeout y match ended.</li>
        </ul>
      </section>

      <section className="instructions-section">
        <h2>👥 Roles de usuario</h2>
        <ul className="roles-list">
          <li><b>Jugador:</b> participa en partidas, compra poderes y gestiona su perfil.</li>
          <li><b>Espectador:</b> observa partidas en vivo y comenta en el chat.</li>
          <li><b>Administrador:</b> supervisa jugadores, estadísticas y sanciones.</li>
        </ul>
      </section>

      <section className="instructions-section">
        <h2>🏁 Fin de la partida</h2>
        <p>
          La partida termina cuando un jugador pierde todas sus fichas. El sistema anuncia al ganador,
          registra las estadísticas y ambos vuelven al menú principal para iniciar una nueva batalla 🔥.
        </p>
      </section>
    </div>
  );
}

export default Instructions;
