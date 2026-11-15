/** Synthesises the original sound effects and the background music loop into public/audio as WAV files. */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 22050;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
mkdirSync(out, { recursive: true });

function wav(samples, rate = RATE) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32000), 44 + i * 2));
  return buf;
}

const track = (seconds, rate = RATE) => new Float32Array(Math.ceil(seconds * rate));
let noiseSeed = 7;
const noise = () => ((noiseSeed = (noiseSeed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

/** Marimba-like tone: fundamental plus a fast-decaying fourth harmonic. */
function marimba(t, start, freq, len, gain, rate = RATE) {
  const s0 = Math.floor(start * rate);
  for (let i = 0; i < len * rate && s0 + i < t.length; i++) {
    const x = i / rate;
    const env = Math.exp(-x * 7) * Math.min(1, x * 400);
    t[s0 + i] += gain * env * (Math.sin(2 * Math.PI * freq * x) + 0.35 * Math.exp(-x * 30) * Math.sin(2 * Math.PI * freq * 4 * x));
  }
}

function bell(t, start, freq, len, gain) {
  const s0 = Math.floor(start * RATE);
  for (let i = 0; i < len * RATE && s0 + i < t.length; i++) {
    const x = i / RATE;
    const env = Math.exp(-x * 5) * Math.min(1, x * 600);
    t[s0 + i] += gain * env * (Math.sin(2 * Math.PI * freq * x) + 0.5 * Math.sin(2 * Math.PI * freq * 2.76 * x) * Math.exp(-x * 9));
  }
}

const sounds = {
  drop() {
    const t = track(0.22);
    for (let i = 0; i < t.length; i++) {
      const x = i / RATE;
      const f = 210 * Math.exp(-x * 9) + 90;
      t[i] = 0.7 * Math.exp(-x * 22) * Math.sin(2 * Math.PI * f * x) + 0.18 * Math.exp(-x * 120) * noise();
    }
    return t;
  },
  match() {
    const t = track(0.7);
    bell(t, 0, 880, 0.7, 0.35);
    bell(t, 0.06, 1318.5, 0.6, 0.25);
    return t;
  },
  combo() {
    const t = track(0.8);
    [659.3, 880, 1108.7, 1318.5].forEach((f, i) => bell(t, i * 0.075, f, 0.5, 0.26));
    return t;
  },
  booster() {
    const t = track(0.5);
    let lp = 0;
    for (let i = 0; i < t.length; i++) {
      const x = i / RATE;
      const k = 0.02 + 0.25 * Math.min(1, x / 0.3);
      lp += k * (noise() - lp);
      t[i] = 0.5 * lp * Math.sin(Math.PI * Math.min(1, x / 0.5)) + 0.6 * Math.exp(-Math.max(0, x - 0.28) * 25) * (x > 0.28 ? Math.sin(2 * Math.PI * 70 * x) : 0);
    }
    return t;
  },
  button() {
    const t = track(0.08);
    for (let i = 0; i < t.length; i++) {
      const x = i / RATE;
      t[i] = 0.35 * Math.exp(-x * 70) * Math.sin(2 * Math.PI * 1150 * x);
    }
    return t;
  },
  thaw() {
    const t = track(0.4);
    for (let i = 0; i < t.length; i++) t[i] = 0.25 * Math.exp((-i / RATE) * 14) * noise();
    bell(t, 0.02, 1760, 0.35, 0.18);
    return t;
  },
  complete() {
    const t = track(1.6);
    [523.3, 659.3, 784, 1046.5].forEach((f, i) => marimba(t, i * 0.14, f, 1.2, 0.35));
    [523.3, 659.3, 784].forEach((f) => marimba(t, 0.7, f, 0.9, 0.2));
    return t;
  },
  fail() {
    const t = track(1.2);
    [392, 329.6, 261.6].forEach((f, i) => marimba(t, i * 0.22, f, 0.8, 0.35));
    return t;
  },
};

for (const [name, make] of Object.entries(sounds)) {
  writeFileSync(join(out, `${name}.wav`), wav(make()));
  console.log(`${name}.wav`);
}

// A gentle 32-bar pentatonic loop: marimba melody over soft sustained chords.
const MR = 16000;
const bpm = 84, beat = 60 / bpm, bars = 16;
const music = track(bars * 4 * beat, MR);
const scale = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
const chords = [[130.8, 196, 329.6], [110, 164.8, 261.6], [146.8, 220, 349.2], [98, 146.8, 246.9]];
let seed = 3;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let bar = 0; bar < bars; bar++) {
  const chord = chords[bar % 4];
  const s0 = Math.floor(bar * 4 * beat * MR), len = Math.floor(4 * beat * MR);
  for (let i = 0; i < len && s0 + i < music.length; i++) {
    const x = i / MR;
    const env = Math.min(1, x * 2) * Math.min(1, (4 * beat - x) * 2);
    music[s0 + i] += 0.05 * env * chord.reduce((s, f) => s + Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(2 * Math.PI * f * 2 * x), 0);
  }
  let idx = 3;
  for (let n = 0; n < 8; n++) {
    if (rnd() < 0.25) continue;
    idx = Math.max(0, Math.min(scale.length - 1, idx + Math.floor(rnd() * 5) - 2));
    marimba(music, bar * 4 * beat + n * beat * 0.5, scale[idx], 1.2, 0.16, MR);
  }
}
writeFileSync(join(out, "music-woodland.wav"), wav(music, MR));
console.log("music-woodland.wav");
