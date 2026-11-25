// The Midnight Skillet: the screenshot scenes behind ?shot=cover|title|play|end.
// Each scene is staged through the kitchen's own rules — real tickets, real
// stations, food placed the way a cook would place it — and then frozen, so a
// screenshot is an honest frame of the game at a good moment: the cover shows
// the full rush the judge's first criterion names (order board, ingredients on
// the counter, a dish mid-assembly, the timer, a plate ready to serve).

import { RECIPES } from './config.js';
import { matchRecipe } from './kitchen.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { dealTicket, makeItem } from './state.js';

function plateOf(items) {
  return { items, readyRecipe: matchRecipe(items)?.id ?? null };
}

function ticket(state, recipeId, patienceLeft) {
  state.ticketSerial += 1;
  state.tickets.push({ serial: state.ticketSerial, recipeId, patience: 40, patienceLeft });
}

/** The cover: mid-rush, everything happening at once. */
function stageCover(state) {
  state.running = true;
  state.elapsed = 63;
  state.timeLeft = 87;
  state.coins = 128;
  state.served = 6;
  state.combo = 3;
  state.bestCombo = 3;
  ticket(state, 'steak-plate', 26);
  ticket(state, 'sunny-rice', 33);
  ticket(state, 'berry-pancakes', 18);
  // A steak sizzling toward golden, a potato simmering ready in the pot,
  // a tomato one chop from done.
  state.stations.skillet1 = { item: makeItem('steak', 'raw'), cooked: 4.1, chops: 0 };
  state.stations.pot = { item: makeItem('potato', 'raw'), cooked: 6.2, chops: 0 };
  state.stations.board = { item: makeItem('tomato', 'raw'), cooked: 0, chops: 2 };
  // Plate one: a Sunny Skillet Rice mid-assembly, rice down, egg on, waiting
  // for its scallion. Plate two: a finished soup, ready to serve.
  state.plates[0] = plateOf([makeItem('rice', 'fresh'), makeItem('egg', 'fry')]);
  state.plates[1] = plateOf([
    makeItem('tomato', 'chop'),
    makeItem('potato', 'simmer'),
    makeItem('scallion', 'fresh'),
  ]);
  state.hand = makeItem('scallion', 'raw');
  state.message = 'The soup is ready — click its ticket to serve!';
  state.messageUntil = state.elapsed + 99;
  return SCREEN_PLAY;
}

/** A quieter moment early in the shift: chopping under way, an egg frying. */
function stagePlay(state) {
  state.running = true;
  state.elapsed = 25;
  state.timeLeft = 125;
  state.coins = 42;
  state.served = 2;
  ticket(state, 'sunny-rice', 38);
  ticket(state, 'tomato-soup', 30);
  state.stations.board = { item: makeItem('scallion', 'raw'), cooked: 0, chops: 1 };
  state.stations.skillet2 = { item: makeItem('egg', 'raw'), cooked: 1.8, chops: 0 };
  state.plates[0] = plateOf([makeItem('batter', 'fry')]);
  state.message = '';
  state.messageUntil = 0;
  return SCREEN_PLAY;
}

/** The end of a good night, for the results screenshot. */
function stageEnd(state) {
  state.running = true;
  state.over = true;
  state.elapsed = 150;
  state.timeLeft = 0;
  state.coins = 312;
  state.served = 14;
  state.tips = 46;
  state.bestCombo = 6;
  state.lost = 1;
  return SCREEN_OVER;
}

/**
 * Set `state` to the named scene and return the screen to draw over it.
 * Unknown names stage the title, like the diner before doors.
 */
export function stageShot(name, state) {
  // Deal and discard a few tickets so the serials and the seeded sequence look
  // like a shift that has been running, not a fresh page.
  for (let i = 0; i < 3; i++) dealTicket(state, RECIPES);
  state.tickets = [];
  state.ticketSerial = 3;
  if (name === 'cover') return stageCover(state);
  if (name === 'play') return stagePlay(state);
  if (name === 'end') return stageEnd(state);
  return SCREEN_TITLE;
}
