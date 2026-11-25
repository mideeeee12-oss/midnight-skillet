// The Midnight Skillet: the kitchen's rules. Every way the player can touch the
// shift lives here: take an ingredient, work it at a station, build a plate,
// serve a ticket, bin a mistake. The clock, the cooking windows and the
// customers' patience all advance in stepKitchen, one fixed step at a time.

import {
  COOKING,
  MAX_TICKETS,
  PREP_CHOP,
  PREP_FRY,
  PREP_SIMMER,
  RECIPES,
  RECIPE_BY_ID,
  STATION_KIND,
} from './config.js';
import { announce, dealTicket, makeItem, spawnGapFor } from './state.js';

export const STEP = 1 / 60;

const sfx = { play: () => {} };

/** Let main wire the real sound effects in without a circular import. */
export function setSound(player) {
  sfx.play = player;
}

/** Does this station's work match the prep this recipe step needs? */
function stationPrep(stationId) {
  return STATION_KIND[stationId] ?? null;
}

/** The recipe a plate's items make, or null while it is still a pile of food. */
export function matchRecipe(items) {
  for (const recipe of RECIPES) {
    if (items.length !== recipe.steps.length) continue;
    const needed = recipe.steps.map((step) => `${step.ingredient}:${step.prep}`);
    const have = items.map((item) => `${item.ingredient}:${item.prep}`);
    if (needed.every((key) => have.includes(key)) && !items.some((item) => item.burnt)) return recipe;
  }
  return null;
}

/** Take a raw ingredient from its bin into the hand. One thing at a time. */
export function takeIngredient(state, ingredientId) {
  if (state.hand) {
    announce(state, 'Your hand is full — put that down first.');
    sfx.play('buzz');
    return false;
  }
  state.hand = makeItem(ingredientId, 'raw');
  sfx.play('pop');
  return true;
}

/** Put down or throw away whatever the hand holds. */
export function clearHand(state) {
  if (!state.hand) return;
  state.hand = null;
  sfx.play('trash');
}

/**
 * Click a station. With food in hand it starts the station's work when the
 * station is free and the prep fits; with an empty hand it works the board
 * (one chop) or takes finished food off the heat.
 */
export function useStation(state, stationId) {
  const prep = stationPrep(stationId);
  const slot = state.stations[stationId];
  if (state.hand) {
    if (slot) {
      announce(state, 'That station is busy.');
      sfx.play('buzz');
      return;
    }
    const wanted = neededPrepFor(state, state.hand.ingredient);
    if (state.hand.prep !== 'raw') {
      announce(state, 'That is already prepped — it goes on a plate.');
      sfx.play('buzz');
      return;
    }
    if (!wanted.includes(prep)) {
      announce(state, `No ticket needs that ${prep === PREP_CHOP ? 'chopped' : prep === PREP_FRY ? 'fried' : 'simmered'} right now.`);
      sfx.play('buzz');
      return;
    }
    state.stations[stationId] = { item: state.hand, cooked: 0, chops: 0 };
    state.hand = null;
    sfx.play(prep === PREP_CHOP ? 'chop' : 'sizzle');
    return;
  }
  if (!slot) return;
  if (slot.item.burnt) {
    state.stations[stationId] = null;
    sfx.play('trash');
    announce(state, 'Burnt food binned.');
    return;
  }
  if (prep === PREP_CHOP) {
    slot.chops += 1;
    sfx.play('chop');
    if (slot.chops >= COOKING.chopClicks) {
      state.hand = makeItem(slot.item.ingredient, PREP_CHOP);
      state.stations[stationId] = null;
      announce(state, 'Chopped and ready.');
    }
    return;
  }
  const timing = COOKING[prep];
  if (slot.cooked < timing.ready) {
    announce(state, 'Not yet — give it a moment.');
    sfx.play('buzz');
    return;
  }
  const golden = slot.cooked <= timing.golden;
  state.hand = makeItem(slot.item.ingredient, prep);
  state.hand.golden = golden;
  state.stations[stationId] = null;
  sfx.play('ding');
}

/** Which preps of this ingredient any open ticket still needs. */
export function neededPrepFor(state, ingredientId) {
  const wanted = new Set();
  for (const ticket of state.tickets) {
    for (const step of RECIPE_BY_ID[ticket.recipeId].steps) {
      if (step.ingredient === ingredientId) wanted.add(step.prep);
    }
  }
  // Food for a plate already under way counts too, so a cook can work ahead.
  for (const plate of state.plates) {
    if (!plate) continue;
    for (const recipe of RECIPES) {
      const have = plate.items.map((item) => `${item.ingredient}:${item.prep}`);
      const fits = recipe.steps.every(
        (step) => have.includes(`${step.ingredient}:${step.prep}`) || step.ingredient === ingredientId,
      );
      if (fits) {
        for (const step of recipe.steps) {
          if (step.ingredient === ingredientId && !have.includes(`${step.ingredient}:${step.prep}`)) wanted.add(step.prep);
        }
      }
    }
  }
  return [...wanted];
}

/** Put the hand's food onto a plate, or pick a plate's top item back up. */
export function usePlate(state, index) {
  const plate = state.plates[index];
  if (state.hand) {
    if (state.hand.prep === 'raw') {
      // Raw food may only land on a plate when a recipe wants it fresh.
      const wanted = neededPrepFor(state, state.hand.ingredient);
      if (!wanted.includes('fresh')) {
        announce(state, 'That needs prep before it can be plated.');
        sfx.play('buzz');
        return;
      }
      state.hand = makeItem(state.hand.ingredient, 'fresh');
    }
    const target = plate ?? { items: [], readyRecipe: null };
    if (target.items.length >= 3) {
      announce(state, 'That plate is full.');
      sfx.play('buzz');
      return;
    }
    target.items.push(state.hand);
    state.hand = null;
    target.readyRecipe = matchRecipe(target.items)?.id ?? null;
    state.plates[index] = target;
    sfx.play('pop');
    if (target.readyRecipe) announce(state, `${RECIPE_BY_ID[target.readyRecipe].name} — ready to serve!`);
    return;
  }
  if (plate && plate.items.length) {
    state.hand = plate.items.pop();
    plate.readyRecipe = null;
    if (!plate.items.length) state.plates[index] = null;
    sfx.play('pop');
  }
}

/** Scrap a whole plate that went wrong. */
export function clearPlate(state, index) {
  if (!state.plates[index]) return;
  state.plates[index] = null;
  sfx.play('trash');
  announce(state, 'Plate scrapped.');
}

/**
 * Serve: click a ticket while a plate on the pass matches it. Coins are the
 * dish's price, a tip for whatever patience is left, and a combo bonus that
 * grows while the kitchen keeps serving without a mistake.
 */
export function serveTicket(state, ticketIndex) {
  const ticket = state.tickets[ticketIndex];
  if (!ticket) return;
  const plateIndex = state.plates.findIndex((plate) => plate && plate.readyRecipe === ticket.recipeId);
  if (plateIndex === -1) {
    announce(state, 'No finished plate matches that ticket yet.');
    sfx.play('buzz');
    return;
  }
  const recipe = RECIPE_BY_ID[ticket.recipeId];
  const tip = Math.round((ticket.patienceLeft / ticket.patience) * 8);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const comboBonus = Math.min(10, (state.combo - 1) * 2);
  const earned = recipe.price + tip + comboBonus;
  state.coins += earned;
  state.tips += tip;
  state.served += 1;
  state.lastServeAt = state.elapsed;
  state.plates[plateIndex] = null;
  state.tickets.splice(ticketIndex, 1);
  announce(state, `Served! +${earned} coins${comboBonus ? ` (combo x${state.combo})` : ''}`);
  sfx.play('serve');
}

/** Advance the whole kitchen by one fixed step. */
export function stepKitchen(state, dt) {
  if (!state.running || state.over) return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.over = true;
    return;
  }
  // New customers.
  state.nextTicketIn -= dt;
  if (state.nextTicketIn <= 0) {
    if (state.tickets.length < MAX_TICKETS) dealTicket(state, RECIPES);
    state.nextTicketIn = spawnGapFor(state);
  }
  // Patience.
  for (let i = state.tickets.length - 1; i >= 0; i--) {
    const ticket = state.tickets[i];
    ticket.patienceLeft -= dt;
    if (ticket.patienceLeft <= 0) {
      state.tickets.splice(i, 1);
      state.lost += 1;
      state.combo = 0;
      state.coins = Math.max(0, state.coins - 5);
      state.shake = 0.35;
      announce(state, 'A customer left hungry… −5 coins', 2.2);
      sfx.play('leave');
    }
  }
  // Cooking.
  for (const stationId of Object.keys(state.stations)) {
    const slot = state.stations[stationId];
    if (!slot) continue;
    const prep = stationPrep(stationId);
    if (prep === PREP_FRY || prep === PREP_SIMMER) {
      slot.cooked += dt;
      const timing = COOKING[prep];
      if (slot.cooked > timing.burnt && !slot.item.burnt) {
        slot.item.burnt = true;
        state.shake = Math.max(state.shake, 0.2);
        announce(state, 'Something burnt! Click the station to bin it.', 2.2);
        sfx.play('burn');
      }
    }
  }
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
}

/** Stars for the results screen: 1 for finishing, up to 3 for a great night. */
export function starsFor(state) {
  if (state.coins >= 300) return 3;
  if (state.coins >= 200) return 2;
  return 1;
}
