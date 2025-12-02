
# 🧩 Xtreme Damas – Entrega Final  
## README del Proyecto

### 👥 Equipo  
ScrumMasters – Ingeniería UC  
Proyecto: **Xtreme Damas**

---

## 📌 Descripción General del Proyecto

Xtreme Damas es una versión extendida y competitiva del juego tradicional de damas, donde además de las mecánicas estándar se incorporan **poderes especiales**, economía de monedas, trampas, efectos de estado y lógica avanzada de turnos.

El proyecto cuenta con:

- Backend en **Node.js + Express + Sequelize**  
- Frontend en **React**  
- Comunicación en tiempo real mediante **polling actualizado**  
- Persistencia en base de datos  
- Visualización completa del tablero, movimientos, turnos y poderes

---

# ✔️ **Características Implementadas**

### 🎮 Lógica base del juego  
- Movimientos estándar y capturas en las damas.  
- Detección de coronación.  
- Muerte de pieza y recompensa de monedas (+10 por captura).  
- Manejo avanzado de turnos: cadenas de captura, turnos obligados, turnCount interno.

---

## 🔥 **Poderes Implementados (con funcionamiento confirmado)**

Estos poderes **sí funcionan en la entrega**:

### 🛡️ Escudo
- Se activa sobre una ficha propia.
- Bloquea una muerte (ya sea captura o trampa).
- Se elimina automáticamente al comienzo del siguiente turno del oponente.

### ⚡ Super salto
- Permite capturar hacia atrás aun sin ser dama durante un turno.
- Se consume después de la primera captura hacia atrás.
- Funciona según lo esperado.

### 👑 Coronación instantánea
- Convierte inmediatamente una ficha propia en dama.
- Funciona correctamente.

### 💣 Autodestrucción
- Una ficha propia se autodestruye.  
- Elimina todas las fichas a 1 casilla de distancia (8 direcciones).  
- Otorga monedas solo por piezas rivales destruidas.  
- Funciona correctamente.

---

## 🧪 Funcionalidades parcialmente implementadas

Estas características **fueron desarrolladas**, pero requieren ajustes para funcionar al 100%:

### 🔥 Doble movimiento (pendiente de afinar)
- El poder se activa correctamente.
- El backend habilita el doble movimiento.
- Falta corregir el flujo del frontend para evitar que el turno termine automáticamente tras el primer movimiento.

### 💉 Sanador (pendiente de completar interacción en el frontend)
- Backend revive correctamente una ficha muerta en una casilla válida.
- Falta en el frontend:  
  - Entrar en modo “elegir casilla”.  
  - Mostrar casillas disponibles.  
  - Cancelar acción.

### ☠️ Trampa (parcial)
- Backend crea la trampa correctamente.
- Dura 2 turnos.  
- Destruye pieza rival si cae sobre ella.  
- Falta completar en frontend:
  - Flujo de “seleccionar casilla y luego activar poder”.
  - Mostrar icono solo al dueño.

### 💫 Aturdir
- Backend marca correctamente “stunnedUntilTurn”.
- Falta ajustar frontend para enviar el ID de la pieza enemiga seleccionada.

---

## ❌ Funcionalidades No Implementadas

### 🔄 Intercambio de poderes entre jugadores
Aunque se intentó diseñar la lógica del intercambio (válida solo si ambas partes poseen el poder solicitado), **esta funcionalidad quedó fuera del alcance de la entrega**, tanto por complejidad de interfaz como por necesidad de nuevas migraciones y endpoints adicionales.


# 🧪 Cómo Probar los Poderes

1. Entrar a una partida desde el lobby.  
2. Jugar normalmente y obtener monedas.  
3. Desde el panel derecho:
   - Comprar poderes con monedas.
   - Activarlos (solo durante tu turno).  
4. Observar sus efectos en:
   - Tablero  
   - Triggers  
   - Logs de movimientos  
   - Estado general  

**ScrumMasters – Ingeniería UC ✨**  
Xtreme Damas – Entrega Fina