// The Midnight Skillet: everything the player sees. All drawing is plain
// canvas shapes — no image files — so the food, the kitchen and the paper
// tickets are drawn by these functions from the state alone. The same renderer
// paints the live game and the screenshot scenes, which is why the scenes are
// honest frames of the game itself.

import {
  COOKING,
  COLOURS,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  LAYOUT,
  PREP_CHOP,
  PREP_FRY,
  PREP_SIMMER,
  RECIPES,
  RECIPE_BY_ID,
  STATION_KIND,
  VIEW,
} from './config.js';
import { starsFor } from './kitchen.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, colour, align = 'left', weight = 'bold') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px 'Trebuchet MS', 'Segoe UI', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One ingredient, drawn at (x, y) inside a box of half-size r, by its prep. */
export function drawFood(ctx, item, x, y, r) {
  const def = INGREDIENT_BY_ID[item.ingredient];
  ctx.save();
  ctx.translate(x, y);
  if (item.burnt) {
    ctx.fillStyle = '#26211d';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a423a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.15, r * 0.3, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  switch (item.ingredient) {
    case 'rice': {
      ctx.fillStyle = def.colour;
      ctx.beginPath();
      ctx.ellipse(0, r * 0.15, r, r * 0.62, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = def.dark;
      ctx.lineWidth = 2;
      for (const [gx, gy] of [[-0.4, -0.25], [0.1, -0.45], [0.45, -0.2], [-0.05, -0.1]]) {
        ctx.beginPath();
        ctx.ellipse(gx * r, gy * r, r * 0.13, r * 0.06, 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case 'egg': {
      if (item.prep === PREP_FRY || item.prep === 'fresh') {
        ctx.fillStyle = '#fffdf4';
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.78, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = def.dark;
        ctx.beginPath();
        ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffc95e';
        ctx.beginPath();
        ctx.arc(r * 0.02, -r * 0.13, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fdf3dd';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.62, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e3cf9f';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    case 'scallion': {
      if (item.prep === PREP_CHOP) {
        ctx.fillStyle = def.colour;
        for (const [gx, gy] of [[-0.45, 0.1], [-0.1, -0.25], [0.3, 0.15], [0.05, 0.35], [-0.3, -0.35]]) {
          ctx.beginPath();
          ctx.arc(gx * r, gy * r, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = def.dark;
          ctx.beginPath();
          ctx.arc(gx * r, gy * r, r * 0.09, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = def.colour;
        }
      } else {
        ctx.strokeStyle = def.dark;
        ctx.lineWidth = r * 0.22;
        ctx.lineCap = 'round';
        for (const lean of [-0.4, 0, 0.4]) {
          ctx.beginPath();
          ctx.moveTo(lean * r * 0.5, r * 0.7);
          ctx.quadraticCurveTo(lean * r, 0, lean * r * 1.4, -r * 0.75);
          ctx.stroke();
        }
      }
      break;
    }
    case 'batter': {
      if (item.prep === PREP_FRY || item.prep === 'fresh') {
        ctx.fillStyle = def.colour;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.18, r * 0.98, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eec27f';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.12, r * 0.9, r * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f7e3b2';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.16, r * 0.55, r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#cfe3ee';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.95, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = def.colour;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.08, r * 0.78, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'berry': {
      for (const [gx, gy, gr] of [[-0.4, 0.15, 0.42], [0.05, -0.25, 0.48], [0.45, 0.2, 0.4], [-0.05, 0.35, 0.44]]) {
        ctx.fillStyle = def.colour;
        ctx.beginPath();
        ctx.arc(gx * r, gy * r, gr * r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a678e8';
        ctx.beginPath();
        ctx.arc(gx * r - gr * r * 0.3, gy * r - gr * r * 0.3, gr * r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#3f7d2c';
      ctx.beginPath();
      ctx.ellipse(r * 0.15, -r * 0.62, r * 0.34, r * 0.16, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'tomato': {
      if (item.prep === PREP_CHOP) {
        ctx.fillStyle = def.colour;
        for (const [gx, gy] of [[-0.4, 0.15], [0.05, -0.25], [0.42, 0.2], [-0.05, 0.38]]) {
          roundRect(ctx, gx * r - r * 0.3, gy * r - r * 0.24, r * 0.6, r * 0.48, r * 0.12);
          ctx.fill();
        }
        ctx.fillStyle = '#ff8a7a';
        roundRect(ctx, -r * 0.18, -r * 0.1, r * 0.36, r * 0.26, r * 0.08);
        ctx.fill();
      } else {
        ctx.fillStyle = def.colour;
        ctx.beginPath();
        ctx.arc(0, r * 0.08, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7a6a';
        ctx.beginPath();
        ctx.arc(-r * 0.3, -r * 0.2, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3f7d2c';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.68, r * 0.36, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'potato': {
      if (item.prep === PREP_FRY) {
        ctx.fillStyle = '#f2b04a';
        for (const lean of [-0.5, -0.15, 0.2, 0.55]) {
          roundRect(ctx, lean * r - r * 0.13, -r * 0.55, r * 0.26, r * 1.1, r * 0.1);
          ctx.fill();
        }
      } else if (item.prep === PREP_CHOP || item.prep === PREP_SIMMER) {
        ctx.fillStyle = item.prep === PREP_SIMMER ? '#f0dcae' : '#eecfa0';
        for (const [gx, gy] of [[-0.35, 0], [0.2, -0.3], [0.3, 0.3], [-0.15, 0.35]]) {
          roundRect(ctx, gx * r - r * 0.26, gy * r - r * 0.2, r * 0.52, r * 0.4, r * 0.1);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = def.colour;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.95, r * 0.68, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = def.dark;
        for (const [gx, gy] of [[-0.35, -0.15], [0.25, 0.1], [0.05, -0.35]]) {
          ctx.beginPath();
          ctx.arc(gx * r, gy * r, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'steak': {
      const cooked = item.prep === PREP_FRY || item.prep === 'fresh';
      ctx.fillStyle = cooked ? '#8a4a2c' : def.colour;
      roundRect(ctx, -r * 0.95, -r * 0.62, r * 1.9, r * 1.24, r * 0.5);
      ctx.fill();
      ctx.strokeStyle = cooked ? '#5e2f1a' : '#d98a7a';
      ctx.lineWidth = r * 0.14;
      for (const off of [-0.45, 0, 0.45]) {
        ctx.beginPath();
        ctx.moveTo(off * r - r * 0.3, -r * 0.5);
        ctx.lineTo(off * r + r * 0.3, r * 0.5);
        ctx.stroke();
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

/** A ring around cooking food: fills toward ready, gold in the window, red late. */
function drawCookRing(ctx, x, y, r, cooked, prep) {
  const timing = COOKING[prep];
  const frac = Math.min(1, cooked / timing.burnt);
  const colour = cooked < timing.ready ? '#e8e2d2' : cooked <= timing.golden ? COLOURS.good : COLOURS.bad;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
  if (cooked >= timing.ready && cooked <= timing.golden) {
    text(ctx, 'READY!', x, y - r - 14, 17, COLOURS.good, 'center');
  } else if (cooked > timing.golden) {
    text(ctx, 'TAKE IT!', x, y - r - 14, 17, COLOURS.bad, 'center');
  }
}

/** The room itself: night wall, neon sign, lamps, shelves and the long counter. */
function drawRoom(ctx, state) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  grad.addColorStop(0, COLOURS.wall);
  grad.addColorStop(0.55, COLOURS.wallDark);
  grad.addColorStop(0.551, COLOURS.counterDark);
  grad.addColorStop(1, COLOURS.counter);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Window with the night street, behind the order board.
  ctx.fillStyle = '#0b1c28';
  roundRect(ctx, 16, 52, 772, 140, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  for (const [sx, sy] of [[90, 84], [210, 70], [420, 92], [610, 74], [700, 110], [320, 120]]) {
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#cfe3ee';
  ctx.beginPath();
  ctx.arc(716, 84, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b1c28';
  ctx.beginPath();
  ctx.arc(708, 79, 13, 0, Math.PI * 2);
  ctx.fill();
  // The neon sign.
  ctx.save();
  ctx.shadowColor = COLOURS.neonPink;
  ctx.shadowBlur = 22;
  text(ctx, '★ THE MIDNIGHT SKILLET ★', 24, 28, 27, COLOURS.neonPink, 'left');
  ctx.restore();
  text(ctx, 'a tiny late-night diner', 1052, 28, 16, '#9fc6d8', 'right', 'normal');
  // Hanging lamps over the stations.
  for (const lx of [145, 371, 557, 773, 969, 1157]) {
    ctx.strokeStyle = '#0a1a24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 208);
    ctx.lineTo(lx, 238);
    ctx.stroke();
    ctx.fillStyle = '#2c4a5c';
    ctx.beginPath();
    ctx.moveTo(lx - 26, 262);
    ctx.lineTo(lx + 26, 262);
    ctx.lineTo(lx + 10, 238);
    ctx.lineTo(lx - 10, 238);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.shadowColor = '#ffca7a';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.arc(lx, 268, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Counter surfaces.
  ctx.fillStyle = COLOURS.counterTop;
  ctx.fillRect(0, 276, VIEW.width, 10);
  ctx.fillRect(0, 540, VIEW.width, 10);
  ctx.fillRect(0, 692, VIEW.width, 8);
  text(ctx, '— THE KITCHEN —', 640, 232, 19, '#9fc6d8', 'center');
  if (state.message && state.elapsed < state.messageUntil) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = COLOURS.paper;
    const w = Math.max(280, state.message.length * 11.5);
    roundRect(ctx, 640 - w / 2, 486, w, 40, 20);
    ctx.fill();
    ctx.restore();
    text(ctx, state.message, 640, 507, 19, COLOURS.ink, 'center');
  }
}

/** One order ticket: the dish, its steps as food icons, price and patience. */
function drawTicket(ctx, state, ticket, index) {
  const box = LAYOUT.ticket(index);
  const recipe = RECIPE_BY_ID[ticket.recipeId];
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = COLOURS.paper;
  roundRect(ctx, box.x, box.y, box.w, box.h, 8);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = COLOURS.bad;
  ctx.beginPath();
  ctx.arc(box.x + box.w / 2, box.y + 9, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, `#${ticket.serial}  ${recipe.short}`, box.x + 12, box.y + 30, 19, COLOURS.ink, 'left');
  text(ctx, `${recipe.price}c`, box.x + box.w - 12, box.y + 30, 19, '#8a6d1f', 'right');
  recipe.steps.forEach((step, i) => {
    const cx = box.x + 42 + i * 62;
    const cy = box.y + 66;
    ctx.fillStyle = '#f3e9c8';
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    drawFood(ctx, { ingredient: step.ingredient, prep: step.prep, burnt: false }, cx, cy, 17);
    const tag = step.prep === PREP_FRY ? 'FRY' : step.prep === PREP_CHOP ? 'CHOP' : step.prep === PREP_SIMMER ? 'SIMMER' : 'FRESH';
    const tagColour = step.prep === PREP_FRY ? '#c96a1e' : step.prep === PREP_CHOP ? '#3f7d2c' : step.prep === PREP_SIMMER ? '#33658a' : '#77705f';
    text(ctx, tag, cx, box.y + 100, 12, tagColour, 'center');
  });
  // Patience bar.
  const frac = Math.max(0, ticket.patienceLeft / ticket.patience);
  ctx.fillStyle = '#e5dcc2';
  roundRect(ctx, box.x + 10, box.y + box.h - 12, box.w - 20, 7, 3);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? COLOURS.good : frac > 0.25 ? COLOURS.warn : COLOURS.bad;
  roundRect(ctx, box.x + 10, box.y + box.h - 12, (box.w - 20) * frac, 7, 3);
  ctx.fill();
}

/** The HUD panel: shift clock, coins, dishes served and the combo flame. */
function drawHud(ctx, state) {
  const box = LAYOUT.hud;
  ctx.fillStyle = 'rgba(8, 24, 34, 0.72)';
  roundRect(ctx, box.x, box.y, box.w, box.h, 12);
  ctx.fill();
  const mm = Math.floor(state.timeLeft / 60);
  const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
  text(ctx, `⏱ ${mm}:${ss}`, box.x + 22, box.y + 34, 34, state.timeLeft < 30 ? COLOURS.bad : COLOURS.cream, 'left');
  text(ctx, 'left in the shift', box.x + 24, box.y + 66, 14, '#9fc6d8', 'left', 'normal');
  text(ctx, `🪙 ${state.coins}`, box.x + 218, box.y + 34, 32, COLOURS.neon, 'left');
  text(ctx, `served ${state.served} · lost ${state.lost}`, box.x + 220, box.y + 66, 15, '#9fc6d8', 'left', 'normal');
  const frac = Math.max(0, state.timeLeft / 150);
  ctx.fillStyle = '#274b5e';
  roundRect(ctx, box.x + 22, box.y + 88, box.w - 44, 12, 6);
  ctx.fill();
  ctx.fillStyle = state.timeLeft < 30 ? COLOURS.bad : COLOURS.neon;
  roundRect(ctx, box.x + 22, box.y + 88, (box.w - 44) * frac, 12, 6);
  ctx.fill();
  if (state.combo >= 2) {
    text(ctx, `🔥 COMBO x${state.combo}`, box.x + box.w - 22, box.y + 112, 19, COLOURS.neonPink, 'right');
  }
}

/** One station: board, skillet, pot, bin or the pass, with whatever it holds. */
function drawStation(ctx, state, stationId, box) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  roundRect(ctx, box.x, box.y, box.w, box.h, 12);
  ctx.fill();
  const cx = box.x + box.w / 2;
  const cy = box.y + 66;
  const slot = state.stations[stationId];
  if (stationId === 'board') {
    ctx.fillStyle = '#d9b380';
    roundRect(ctx, box.x + 18, box.y + 22, box.w - 36, box.h - 56, 10);
    ctx.fill();
    ctx.strokeStyle = '#b28c58';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (slot) {
      drawFood(ctx, slot.item, cx, cy, 34);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < slot.chops ? COLOURS.good : '#efe6cd';
        ctx.beginPath();
        ctx.arc(box.x + 62 + i * 44, box.y + box.h - 22, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      text(ctx, 'CLICK TO CHOP!', cx, box.y + 16, 15, COLOURS.cream, 'center');
    }
  } else if (stationId === 'skillet1' || stationId === 'skillet2') {
    ctx.fillStyle = '#1d1d22';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 62, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33333c';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#101014';
    roundRect(ctx, cx + 48, cy - 8, 34, 13, 6);
    ctx.fill();
    if (slot) {
      drawFood(ctx, slot.item, cx, cy, 32);
      drawCookRing(ctx, cx, cy, 47, slot.cooked, PREP_FRY);
      if (!slot.item.burnt && slot.cooked < COOKING.fry.burnt) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (const off of [-18, 4, 22]) {
          ctx.beginPath();
          ctx.arc(cx + off, cy - 34 - ((state.elapsed * 30 + off * 7) % 14), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (slot.item.burnt) text(ctx, 'BURNT!', cx, box.y + 16, 16, COLOURS.bad, 'center');
    }
  } else if (stationId === 'pot') {
    ctx.fillStyle = '#9fb4c0';
    roundRect(ctx, box.x + 26, box.y + 30, box.w - 52, box.h - 64, 14);
    ctx.fill();
    ctx.fillStyle = '#c3d5de';
    ctx.beginPath();
    ctx.ellipse(cx, box.y + 34, (box.w - 52) / 2, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2703a';
    ctx.beginPath();
    ctx.ellipse(cx, box.y + 34, (box.w - 78) / 2, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    if (slot) {
      drawFood(ctx, { ingredient: slot.item.ingredient, prep: 'simmer', burnt: slot.item.burnt }, cx, cy + 16, 26);
      drawCookRing(ctx, cx, cy + 16, 42, slot.cooked, PREP_SIMMER);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (const off of [-24, 0, 24]) {
        ctx.beginPath();
        ctx.arc(cx + off, box.y + 16 - ((state.elapsed * 22 + off * 5) % 12), 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (slot.item.burnt) text(ctx, 'BURNT!', cx, box.y + 16, 16, COLOURS.bad, 'center');
    }
  } else if (stationId === 'trash') {
    ctx.fillStyle = '#5b6a72';
    roundRect(ctx, box.x + 26, box.y + 26, box.w - 52, box.h - 58, 8);
    ctx.fill();
    ctx.fillStyle = '#43525a';
    roundRect(ctx, box.x + 18, box.y + 16, box.w - 36, 16, 8);
    ctx.fill();
    text(ctx, '🗑', cx, cy, 40, '#ffffff', 'center', 'normal');
  }
  text(ctx, box.label, cx, box.y + box.h - 8, 14, '#e8dcc0', 'center');
}

/** The pass: where finished plates wait, glowing when one is ready to serve. */
function drawPass(ctx, state) {
  const box = LAYOUT.pass;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  roundRect(ctx, box.x, box.y, box.w, box.h, 12);
  ctx.fill();
  for (const lx of [box.x + 30, box.x + box.w - 30]) {
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.arc(lx, box.y + 22, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  const ready = state.plates.filter((plate) => plate && plate.readyRecipe).length;
  if (ready) {
    ctx.save();
    ctx.shadowColor = COLOURS.good;
    ctx.shadowBlur = 18;
    text(ctx, `${ready} READY!`, box.x + box.w / 2, box.y + 58, 24, COLOURS.good, 'center');
    ctx.restore();
    text(ctx, 'click its ticket', box.x + box.w / 2, box.y + 88, 15, COLOURS.cream, 'center', 'normal');
    text(ctx, 'to serve →', box.x + box.w / 2, box.y + 110, 15, COLOURS.cream, 'center', 'normal');
  } else {
    text(ctx, 'finished plates', box.x + box.w / 2, box.y + 62, 17, '#cfe3ee', 'center', 'normal');
    text(ctx, 'wait here', box.x + box.w / 2, box.y + 86, 17, '#cfe3ee', 'center', 'normal');
  }
  text(ctx, box.label, box.x + box.w / 2, box.y + box.h - 10, 14, '#e8dcc0', 'center');
}

/** One plate on the counter, its items stacked, glowing when it is a dish. */
function drawPlate(ctx, state, index) {
  const box = LAYOUT.plate(index);
  const plate = state.plates[index];
  const cx = box.x + box.w / 2;
  const cy = box.y + 52;
  if (plate && plate.readyRecipe) {
    ctx.save();
    ctx.shadowColor = COLOURS.good;
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 86, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle = '#f4efe2';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 86, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ddd5bf';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 62, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  if (plate) {
    plate.items.forEach((item, i) => {
      const off = (i - (plate.items.length - 1) / 2) * 52;
      drawFood(ctx, item, cx + off, cy - 6 - (i % 2) * 8, 25);
    });
    if (plate.readyRecipe) {
      text(ctx, `✔ ${RECIPE_BY_ID[plate.readyRecipe].name}`, cx, box.y + box.h - 12, 16, COLOURS.good, 'center');
    } else {
      text(ctx, `plate ${index + 1} · right-click scraps it`, cx, box.y + box.h - 12, 13, '#cbbd97', 'center', 'normal');
    }
  } else {
    text(ctx, `PLATE ${index + 1}`, cx, box.y + box.h - 12, 14, '#cbbd97', 'center');
  }
}

/** The ingredient bins and the hand, along the bottom counter. */
function drawBinsAndHand(ctx, state) {
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const box = LAYOUT.bin(i);
    ctx.fillStyle = '#274b5e';
    roundRect(ctx, box.x, box.y, box.w, box.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#3d6a84';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawFood(ctx, { ingredient: INGREDIENTS[i].id, prep: 'raw', burnt: false }, box.x + box.w / 2, box.y + 30, 19);
    text(ctx, INGREDIENTS[i].name.toUpperCase(), box.x + box.w / 2, box.y + 62, 13, COLOURS.cream, 'center');
    text(ctx, `${i + 1}`, box.x + 11, box.y + 13, 12, '#9fc6d8', 'center');
  }
  const hand = LAYOUT.hand;
  ctx.fillStyle = 'rgba(8, 24, 34, 0.72)';
  roundRect(ctx, hand.x, hand.y, hand.w, hand.h, 10);
  ctx.fill();
  if (state.hand) {
    drawFood(ctx, state.hand, hand.x + 44, hand.y + 40, 24);
    const def = INGREDIENT_BY_ID[state.hand.ingredient];
    const prepName = state.hand.prep === 'raw' ? 'raw' : state.hand.prep;
    text(ctx, `IN HAND: ${def.name} (${prepName})`, hand.x + 78, hand.y + 30, 18, COLOURS.cream, 'left');
    text(ctx, 'click a station or a plate · Esc puts it back', hand.x + 78, hand.y + 58, 13, '#9fc6d8', 'left', 'normal');
  } else {
    text(ctx, 'HAND EMPTY', hand.x + 20, hand.y + 30, 18, '#9fc6d8', 'left');
    text(ctx, 'click a bin (or press 1–8) to pick up food', hand.x + 20, hand.y + 58, 13, '#9fc6d8', 'left', 'normal');
  }
}

/** The whole kitchen in play: room, tickets, HUD, stations, plates, bins. */
export function drawScene(ctx, state) {
  ctx.save();
  if (state.shake > 0) {
    const dx = (state.random() - 0.5) * state.shake * 14;
    ctx.translate(dx, 0);
  }
  drawRoom(ctx, state);
  state.tickets.forEach((ticket, i) => drawTicket(ctx, state, ticket, i));
  if (!state.tickets.length) {
    text(ctx, 'the order board is quiet… the next customer is on their way', 36, 122, 18, '#9fc6d8', 'left', 'normal');
  }
  drawHud(ctx, state);
  drawStation(ctx, state, 'board', LAYOUT.board);
  drawStation(ctx, state, 'skillet1', LAYOUT.skillet1);
  drawStation(ctx, state, 'skillet2', LAYOUT.skillet2);
  drawStation(ctx, state, 'pot', LAYOUT.pot);
  drawStation(ctx, state, 'trash', LAYOUT.trash);
  drawPass(ctx, state);
  for (let i = 0; i < 3; i++) drawPlate(ctx, state, i);
  drawBinsAndHand(ctx, state);
  ctx.restore();
}

/** The title screen: the diner at rest, the menu, and how to play. */
export function drawTitleScreen(ctx, state) {
  drawScene(ctx, { ...state, tickets: [], hand: null, message: '' });
  ctx.fillStyle = 'rgba(6, 16, 24, 0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.save();
  ctx.shadowColor = COLOURS.neonPink;
  ctx.shadowBlur = 30;
  text(ctx, 'THE MIDNIGHT SKILLET', 640, 218, 64, COLOURS.neonPink, 'center');
  ctx.restore();
  text(ctx, 'a tiny late-night diner', 640, 268, 24, COLOURS.neon, 'center', 'normal');
  ctx.fillStyle = COLOURS.paper;
  roundRect(ctx, 330, 310, 620, 218, 14);
  ctx.fill();
  text(ctx, "TONIGHT'S MENU", 640, 342, 22, COLOURS.ink, 'center');
  RECIPES.forEach((recipe, i) => {
    const y = 380 + i * 38;
    text(ctx, recipe.name, 366, y, 19, COLOURS.ink, 'left');
    text(ctx, `${recipe.price} coins`, 914, y, 19, '#8a6d1f', 'right');
  });
  text(ctx, 'Click a ticket to serve its finished plate. 150 seconds. Don’t burn anything.', 640, 566, 19, COLOURS.cream, 'center', 'normal');
  ctx.fillStyle = COLOURS.good;
  roundRect(ctx, 490, 596, 300, 62, 31);
  ctx.fill();
  text(ctx, '▶  OPEN THE DINER', 640, 628, 24, '#ffffff', 'center');
  text(ctx, 'or press Enter', 640, 690, 15, '#9fc6d8', 'center', 'normal');
}

/** The results screen at the end of the shift. */
export function drawResultsScreen(ctx, state) {
  drawScene(ctx, { ...state, tickets: [], message: '' });
  ctx.fillStyle = 'rgba(6, 16, 24, 0.66)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'END OF THE SHIFT', 640, 190, 46, COLOURS.cream, 'center');
  const stars = starsFor(state);
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 252, 54, COLOURS.neon, 'center');
  ctx.fillStyle = COLOURS.paper;
  roundRect(ctx, 390, 300, 500, 190, 14);
  ctx.fill();
  const rows = [
    ['Coins earned', `${state.coins}`],
    ['Dishes served', `${state.served}`],
    ['Tips', `${state.tips}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Customers lost', `${state.lost}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 336 + i * 32;
    text(ctx, label, 426, y, 20, COLOURS.ink, 'left', 'normal');
    text(ctx, value, 854, y, 20, COLOURS.ink, 'right');
  });
  ctx.fillStyle = COLOURS.good;
  roundRect(ctx, 490, 530, 300, 62, 31);
  ctx.fill();
  text(ctx, '↻  ANOTHER SHIFT', 640, 562, 24, '#ffffff', 'center');
  text(ctx, 'or press Enter', 640, 624, 15, '#9fc6d8', 'center', 'normal');
}
