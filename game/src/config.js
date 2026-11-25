// The Midnight Skillet: every fixed fact about the diner in one place.
// Canvas size, the counter layout the renderer and the input handler share, the
// ingredient bins, the four recipes on the menu, and the shift's timing rules.

export const VIEW = { width: 1280, height: 800 };

export const SHIFT_SECONDS = 150;
export const MAX_TICKETS = 3;
export const FIRST_TICKET_AT = 1.2;

// Prep kinds an ingredient can need before it goes on a plate.
export const PREP_FRESH = 'fresh'; // straight from the bin onto the plate
export const PREP_CHOP = 'chop'; // three clicks on the chopping board
export const PREP_FRY = 'fry'; // timed on a skillet, with a golden window
export const PREP_SIMMER = 'simmer'; // timed in the pot, forgiving but slow

// The bins along the counter, left to right. colour is the food's body colour,
// dark its outline or cooked shade, label what the player reads at a glance.
export const INGREDIENTS = [
  { id: 'rice', name: 'Rice', colour: '#f7f3e3', dark: '#d9d2b8' },
  { id: 'egg', name: 'Egg', colour: '#fff6d8', dark: '#f2a93b' },
  { id: 'scallion', name: 'Scallion', colour: '#7ec850', dark: '#3f7d2c' },
  { id: 'batter', name: 'Batter', colour: '#f3d9a4', dark: '#c98f3d' },
  { id: 'berry', name: 'Berries', colour: '#7a4fd0', dark: '#4b2a86' },
  { id: 'tomato', name: 'Tomato', colour: '#e8483f', dark: '#a3241c' },
  { id: 'potato', name: 'Potato', colour: '#d9a05b', dark: '#96682e' },
  { id: 'steak', name: 'Steak', colour: '#b04a3a', dark: '#6e271c' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

// One recipe step: an ingredient and the prep it must have had. A plate matches
// a recipe when its items are exactly the recipe's steps, in any order.
export const RECIPES = [
  {
    id: 'sunny-rice',
    name: 'Sunny Skillet Rice',
    short: 'Sunny Rice',
    price: 14,
    steps: [
      { ingredient: 'rice', prep: PREP_FRESH },
      { ingredient: 'egg', prep: PREP_FRY },
      { ingredient: 'scallion', prep: PREP_CHOP },
    ],
  },
  {
    id: 'tomato-soup',
    name: 'Midnight Tomato Soup',
    short: 'Tomato Soup',
    price: 15,
    steps: [
      { ingredient: 'tomato', prep: PREP_CHOP },
      { ingredient: 'potato', prep: PREP_SIMMER },
      { ingredient: 'scallion', prep: PREP_FRESH },
    ],
  },
  {
    id: 'berry-pancakes',
    name: 'Berry Cloud Pancakes',
    short: 'Berry Pancakes',
    price: 16,
    steps: [
      { ingredient: 'batter', prep: PREP_FRY },
      { ingredient: 'batter', prep: PREP_FRY },
      { ingredient: 'berry', prep: PREP_FRESH },
    ],
  },
  {
    id: 'steak-plate',
    name: 'Sizzling Steak Plate',
    short: 'Steak Plate',
    price: 22,
    steps: [
      { ingredient: 'steak', prep: PREP_FRY },
      { ingredient: 'potato', prep: PREP_FRY },
      { ingredient: 'scallion', prep: PREP_CHOP },
    ],
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));

// Cooking times in seconds. Fry and simmer share the shape: ready at `ready`,
// golden (a small bonus and the moment to take it) until `golden`, burnt after.
export const COOKING = {
  fry: { ready: 3.2, golden: 5.2, burnt: 7.2 },
  simmer: { ready: 5.0, golden: 8.0, burnt: 11.0 },
  chopClicks: 3,
};

// Layout: every rectangle the renderer draws and the input handler hit-tests.
// The top band is the order board and the shift HUD; the middle is the kitchen
// stations; the bottom counter holds the bins and the plates on the pass.
export const LAYOUT = {
  ticket: (index) => ({ x: 24 + index * 252, y: 64, w: 236, h: 118 }),
  hud: { x: 792, y: 56, w: 464, h: 126 },
  board: { x: 40, y: 300, w: 210, h: 150, label: 'CHOPPING BOARD' },
  skillet1: { x: 286, y: 300, w: 170, h: 150, label: 'SKILLET 1' },
  skillet2: { x: 472, y: 300, w: 170, h: 150, label: 'SKILLET 2' },
  pot: { x: 678, y: 300, w: 190, h: 150, label: 'SOUP POT' },
  trash: { x: 904, y: 300, w: 130, h: 150, label: 'BIN' },
  pass: { x: 1058, y: 284, w: 198, h: 182, label: 'THE PASS' },
  plate: (index) => ({ x: 96 + index * 300, y: 560, w: 240, h: 120 }),
  bin: (index) => ({ x: 24 + index * 104, y: 700, w: 92, h: 84 }),
  hand: { x: 920, y: 700, w: 336, h: 84 },
};

export const STATION_KIND = {
  board: PREP_CHOP,
  skillet1: PREP_FRY,
  skillet2: PREP_FRY,
  pot: PREP_SIMMER,
};

export const COLOURS = {
  wall: '#17384a',
  wallDark: '#0f2837',
  counter: '#8a5a33',
  counterDark: '#6f4525',
  counterTop: '#a9713f',
  paper: '#fdf6df',
  ink: '#2b2118',
  neon: '#ffb347',
  neonPink: '#ff7d9c',
  good: '#57c04a',
  warn: '#f2a93b',
  bad: '#e8483f',
  cream: '#fff8ea',
};
