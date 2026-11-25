// The Midnight Skillet: tiny kitchen sounds from one oscillator and a noise
// buffer — no audio files. Sounds start on the first click, because browsers
// keep audio locked until the player touches the page.

let context = null;
let noiseBuffer = null;

function ensureContext() {
  if (context) {
    if (context.state === 'suspended') context.resume();
    return context;
  }
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  context = new AudioCtor();
  noiseBuffer = context.createBuffer(1, context.sampleRate * 0.3, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return context;
}

function tone(freqFrom, freqTo, seconds, type = 'sine', gain = 0.12) {
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), ctx.currentTime + seconds);
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
  osc.connect(amp).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + seconds);
}

function noise(seconds, filterFreq, gain = 0.1) {
  const ctx = ensureContext();
  if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(gain, ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
  src.connect(filter).connect(amp).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + seconds);
}

const SOUNDS = {
  pop: () => tone(420, 660, 0.08, 'triangle', 0.1),
  chop: () => noise(0.07, 900, 0.16),
  sizzle: () => noise(0.28, 3200, 0.05),
  ding: () => tone(880, 880, 0.16, 'sine', 0.1),
  serve: () => {
    tone(660, 660, 0.1, 'triangle', 0.1);
    setTimeout(() => tone(990, 990, 0.16, 'triangle', 0.1), 70);
  },
  buzz: () => tone(160, 110, 0.16, 'square', 0.06),
  trash: () => noise(0.14, 400, 0.12),
  burn: () => tone(300, 70, 0.4, 'sawtooth', 0.08),
  leave: () => tone(500, 240, 0.3, 'sine', 0.09),
  start: () => {
    tone(523, 523, 0.1, 'triangle', 0.1);
    setTimeout(() => tone(784, 784, 0.14, 'triangle', 0.1), 90);
  },
};

/** Play one named kitchen sound; unknown names stay silent. */
export function playSound(name) {
  const fn = SOUNDS[name];
  if (fn) fn();
}
