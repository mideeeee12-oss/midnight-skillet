// The Midnight Skillet: mouse and keyboard. A click is translated through the
// shared layout into one kitchen action; the number keys reach the bins, Esc
// puts the hand's food back, Enter opens the diner or starts another shift,
// and a right-click on a plate scraps it.

import { INGREDIENTS, LAYOUT, VIEW } from './config.js';
import { clearHand, clearPlate, serveTicket, takeIngredient, usePlate, useStation } from './kitchen.js';

function inside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

const STATION_BOXES = [
  ['board', LAYOUT.board],
  ['skillet1', LAYOUT.skillet1],
  ['skillet2', LAYOUT.skillet2],
  ['pot', LAYOUT.pot],
];

/**
 * Wire the canvas. `getState` hands over the current shift (a restart swaps
 * the object), and `hooks` lets main react to the two screen buttons (open the
 * diner, another shift) without input knowing about screens.
 */
export function attachInput(canvas, getState, hooks) {
  function toGame(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const state = getState();
    const { x, y } = toGame(event);
    for (let i = 0; i < 3; i++) {
      if (inside(x, y, LAYOUT.plate(i))) clearPlate(state, i);
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    const state = getState();
    const { x, y } = toGame(event);
    if (hooks.screen() !== 'play') {
      if (y > 580 && y < 680 && x > 460 && x < 820) hooks.primary();
      return;
    }
    // Tickets first: serving is the click that matters most.
    for (let i = 0; i < state.tickets.length; i++) {
      if (inside(x, y, LAYOUT.ticket(i))) {
        serveTicket(state, i);
        return;
      }
    }
    for (const [stationId, box] of STATION_BOXES) {
      if (inside(x, y, box)) {
        useStation(state, stationId);
        return;
      }
    }
    if (inside(x, y, LAYOUT.trash)) {
      clearHand(state);
      return;
    }
    for (let i = 0; i < 3; i++) {
      if (inside(x, y, LAYOUT.plate(i))) {
        usePlate(state, i);
        return;
      }
    }
    for (let i = 0; i < INGREDIENTS.length; i++) {
      if (inside(x, y, LAYOUT.bin(i))) {
        takeIngredient(state, INGREDIENTS[i].id);
        return;
      }
    }
    if (inside(x, y, LAYOUT.hand)) clearHand(state);
  });

  window.addEventListener('keydown', (event) => {
    const state = getState();
    if (event.key === 'Enter') {
      if (hooks.screen() !== 'play') hooks.primary();
      return;
    }
    if (hooks.screen() !== 'play') return;
    if (event.key === 'Escape') {
      clearHand(state);
      return;
    }
    const binIndex = Number(event.key) - 1;
    if (binIndex >= 0 && binIndex < INGREDIENTS.length) {
      takeIngredient(state, INGREDIENTS[binIndex].id);
    }
  });
}
