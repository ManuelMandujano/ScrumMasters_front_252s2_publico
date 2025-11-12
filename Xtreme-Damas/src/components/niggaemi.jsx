const lobbySteps = [
  {
    title: 'Lobby público',
    details: [
      'Listado de partidas waiting / ongoing.',
      'Filtro por visibilidad y códigos privados.',
      'Indicador de plazas libres y botón “Unirse”.'
    ]
  },
  {
    title: 'Sala previa',
    details: [
      'Dos paneles (Jugador A / Jugador B) con estado listo.',
      'Chat lateral con hotkey Enter.',
      'Aviso de “Esperando al oponente” automático.'
    ]
  },
  {
    title: 'Inicio automático',
    details: [
      'Sorteo de turno inicial.',
      'Setup de 15 fichas + 30 monedas.',
      'Notificación global de partida en curso.'
    ]
  }
];

function Niggaemi() {
  return (
    <section className="home-section alt">
      <header className="section-header">
        <p className="eyebrow">Lobby & Matchmaking</p>
        <h2>Conecta jugadores en segundos</h2>
        <p>
          Cubrimos todo el flujo: lobby público, sala previa con chat y confirmación de estado,
          además del inicio automático cuando ambos jugadores están listos.
        </p>
      </header>
      <div className="steps-grid">
        {lobbySteps.map((step) => (
          <article className="step-card" key={step.title}>
            <h3>{step.title}</h3>
            <ul>
              {step.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Niggaemi;
