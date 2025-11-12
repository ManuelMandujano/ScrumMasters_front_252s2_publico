import '../assets/styles/board.css';

function Board({ pieces = [], traps = [], size = 10 }) {
  const pieceMap = new Map();
  pieces
    .filter((piece) => piece.alive)
    .forEach((piece) => {
      pieceMap.set(`${piece.row}-${piece.col}`, piece);
    });

  const trapMap = new Map();
  traps.forEach((trap) => {
    trapMap.set(`${trap.row}-${trap.col}`, trap);
  });

  const rows = Array.from({ length: size }, (_, row) => {
    const cells = Array.from({ length: size }, (_, col) => {
      const key = `${row}-${col}`;
      const piece = pieceMap.get(key);
      const trap = trapMap.get(key);
      const cellClass = ['board-cell', (row + col) % 2 === 0 ? 'light' : 'dark'];
      if (trap?.revealed) {
        cellClass.push('trap');
      }
      return (
        <div key={key} className={cellClass.join(' ')}>
          <span className="cell-coord">
            {row + 1}
            ,
            {col + 1}
          </span>
          {piece && (
            <div className={`piece piece-${piece.seat.toLowerCase()}`}>
              <span>{piece.crowned ? '♕' : '●'}</span>
            </div>
          )}
          {trap && !trap.revealed && <span className="trap-indicator">?</span>}
        </div>
      );
    });
    return (
      <div key={row} className="board-row">
        {cells}
      </div>
    );
  });

  return (
    <div className="board-wrapper">
      <div className="board-grid">
        {rows}
      </div>
    </div>
  );
}

export default Board;
