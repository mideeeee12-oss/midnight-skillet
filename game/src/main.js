// The Midnight Skillet: boot and the frame loop. One canvas, three screens
// (title, the shift, the results), a fixed-step kitchen so the cooking never
// depends on the display's frame rate, and the ?shot= scenes for screenshots,
// which freeze one staged frame of the real game.

import { VIEW } from './config.js';
import { playSound } from './audio.js';
import { attachInput } from './input.js';
import { setSound, STEP, stepKitchen } from './kitchen.js';
import { drawResultsScreen, drawScene, drawTitleScreen, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { createState } from './state.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') ?? '1') || 1;

let state = createState(seed);
let screen = SCREEN_TITLE;

setSound(playSound);

function startShift() {
  state = createState((Math.random() * 1e9) | 0);
  state.running = true;
  screen = SCREEN_PLAY;
  playSound('start');
}

attachInput(canvas, () => state, {
  screen: () => screen,
  primary: () => {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startShift();
  },
});

function draw() {
  if (screen === SCREEN_TITLE) drawTitleScreen(ctx, state);
  else if (screen === SCREEN_OVER) drawResultsScreen(ctx, state);
  else drawScene(ctx, state);
}

if (shotName !== null) {
  screen = stageShot(shotName, state);
  draw();
  // Keep redrawing the same frozen frame so a screenshot taken at any moment
  // after load catches the finished picture, fonts and all.
  setInterval(draw, 250);
} else {
  let last = performance.now();
  let accumulator = 0;
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP) {
        stepKitchen(state, STEP);
        accumulator -= STEP;
      }
      if (state.over) screen = SCREEN_OVER;
    }
    draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
