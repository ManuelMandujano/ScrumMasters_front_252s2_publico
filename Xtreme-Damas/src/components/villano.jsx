const boardInsights = [
  {
    title: 'Tablero 10×10 reactivo',
    description: 'Render dinámico con fichas, damas y casillas trampa ocultas/visibles según el asiento.'
  },
  {
    title: 'Control board lateral',
    description: 'Marcador de fichas, turno actual, historial de movimientos y eventos especiales.'
  },
  {
    title: 'Inventario y monedas',
    description: 'Compra/activación de poderes, trampas privadas y registro de intercambios.'
  }
];

function Villano() {
  return (
    <section className="home-section alt">
      <header className="section-header">
        <p className="eyebrow">Tableros de control</p>
        <h2>Información pública y privada en simultáneo</h2>
        <p>
          La interfaz de partida integra marcador, historial, poderes activos y trampas a la vista
          solo del jugador correspondiente, cumpliendo con las reglas descritas.
        </p>
      </header>
      <div className="insight-grid">
        {boardInsights.map((insight) => (
          <article key={insight.title} className="insight-card">
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Villano;
