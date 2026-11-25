// The Midnight Skillet: the shift's state and the small deterministic random
// source behind it. One state object holds everything a frame needs: the clock,
// the tickets on the board, what the stations and plates hold, the hand, the
// score. The seeded generator lets the screenshot scenes rebuild the same
// kitchen every time, and lets a real shift feel different each night.

/** mulberry32: a tiny seeded generator, the same seed always deals the same shift. */
export function makeRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextItemId = 1;

/** A piece of food as it travels: raw from a bin, prepped by a station, plated. */
export function makeItem(ingredient, prep) {
  return { id: nextItemId++, ingredient, prep, burnt: false };
}

/** A fresh, empty shift. `seed` deals the order sequence. */
export function createState(seed) {
  nextItemId = 1;
  return {
    random: makeRandom(seed),
    timeLeft: 150,
    elapsed: 0,
    running: false,
    over: false,
    coins: 0,
    served: 0,
    lost: 0,
    combo: 0,
    bestCombo: 0,
    tips: 0,
    tickets: [],
    nextTicketIn: 1.2,
    ticketSerial: 0,
    hand: null, // an item the player is carrying, or null
    stations: {
      board: null, // { item, chops } while chopping
      skillet1: null, // { item, cooked } while cooking
      skillet2: null,
      pot: null,
    },
    plates: [null, null, null], // each null or { items: [...], readyRecipe: id|null }
    message: '',
    messageUntil: 0,
    shake: 0,
    lastServeAt: -10,
  };
}

/** How long a fresh ticket's customer will wait, shrinking as the shift heats up. */
export function patienceFor(state) {
  const heat = Math.min(1, state.elapsed / 150);
  return 46 - heat * 12 + state.random() * 6;
}

/** How long until the next ticket, shrinking as the shift heats up. */
export function spawnGapFor(state) {
  const heat = Math.min(1, state.elapsed / 150);
  return 9.5 - heat * 3.5 + state.random() * 2.5;
}

/** Deal one new ticket onto the board: a recipe the kitchen can actually make. */
export function dealTicket(state, recipes) {
  const recipe = recipes[Math.floor(state.random() * recipes.length)];
  state.ticketSerial += 1;
  const patience = patienceFor(state);
  state.tickets.push({
    serial: state.ticketSerial,
    recipeId: recipe.id,
    patience,
    patienceLeft: patience,
  });
}

/** Say something on the kitchen's notice line for a moment. */
export function announce(state, text, seconds = 1.6) {
  state.message = text;
  state.messageUntil = state.elapsed + seconds;
}
