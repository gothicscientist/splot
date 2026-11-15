// Motion helpers. Everything is a pure function of the frame: no state, no randomness without a seed.
import { Easing, spring, SpringConfig } from "remotion";

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, x: number) => (b === a ? (x >= b ? 1 : 0) : clamp((x - a) / (b - a)));
export const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const smootherstep = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
/** Entrances: fast start, soft landing (the measured "ease-out burst"). */
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 4);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
};
export const entrance = Easing.bezier(0.16, 1, 0.3, 1);
/** Overshoot then settle (k ~1.7 subtle, 2.2 Finn's "pop", 3 cartoon). */
export const backOut = (t: number, k = 1.7) => {
  const x = clamp(t) - 1;
  return 1 + (k + 1) * x * x * x + k * x * x;
};
/** Elastic-ish settle for cartoon impacts. */
export const elasticOut = (t: number) => {
  const x = clamp(t);
  if (x === 0 || x === 1) return x;
  return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};

/** 0..1 between frames a and b with an easing. */
export const prog = (f: number, a: number, b: number, ease: (t: number) => number = smootherstep) => ease(invLerp(a, b, f));

/** Deterministic hash random in [0,1). */
export const rand = (seed: number, k = 0) => {
  const x = Math.sin(seed * 127.1 + k * 311.7 + 74.7) * 43758.5453123;
  return x - Math.floor(x);
};
export const randRange = (seed: number, k: number, a: number, b: number) => a + (b - a) * rand(seed, k);

/** Smooth 1D value noise in [-1,1] (for idle sway, flicker); seeded. */
export const noise1 = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const a = rand(seed, i) * 2 - 1;
  const b = rand(seed, i + 1) * 2 - 1;
  return lerp(a, b, smoothstep(f));
};

/** Remotion spring from frame `at` (0 before). Damping ratio ~0.7-0.85 = premium, 0.4-0.6 playful. */
export const springAt = (f: number, at: number, fps: number, config: Partial<SpringConfig> = {}, durationInFrames?: number) =>
  f < at ? 0 : spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170, mass: 0.9, ...config }, durationInFrames });

/** Scale for a pop-in: 0 before `at`, overshoots to ~1.08 and settles to 1 within `dur` frames. */
export const popScale = (f: number, at: number, dur = 9, from = 0.55, k = 2.2) =>
  f < at ? 0 : lerp(from, 1, backOut(invLerp(at, at + dur, f), k));

/** Impact shake: flips sign every frame, decays over `decay` frames (measured reference behaviour). */
export const kick = (f: number, hits: number[], amp = 1, decay = 7) => {
  let v = 0;
  for (const h of hits) {
    const d = f - h;
    if (d < 0 || d > decay) continue;
    v += amp * (1 - d / decay) * (d % 2 === 0 ? 1 : -1);
  }
  return v;
};

/** Slow push-in that every hold gets so nothing ever freezes (0.15-0.35 %/frame; 0.6 on punch words). */
export const creep = (f: number, ratePerFrame = 0.0025) => 1 + f * ratePerFrame;

/** Mouth openness 0..1 from word timings (cheap lip-flap that matches syllable rhythm). */
export const talk = (f: number, words: { s: number; e: number }[], fps: number) => {
  for (const w of words) {
    if (f >= w.s && f < w.e) {
      const local = (f - w.s) / fps;
      const syl = Math.max(1, Math.round((w.e - w.s) / (fps * 0.16)));
      const ph = (local / ((w.e - w.s) / fps)) * syl * Math.PI;
      return 0.35 + 0.65 * Math.abs(Math.sin(ph));
    }
  }
  return 0;
};

/** Blink 0..1 (1 = closed) on a seeded irregular schedule (every 0.5-2.3 s, 4 frames). */
export const blink = (f: number, seed: number, fps = 30) => {
  let t = Math.round(rand(seed, 0) * fps);
  let k = 1;
  while (t < f + 8) {
    const d = f - t;
    if (d >= 0 && d < 4) return [0.6, 1, 1, 0.5][d];
    t += Math.round((0.5 + rand(seed, k++) * 1.8) * fps);
  }
  return 0;
};

/** Piecewise keyframes: [[frame, value], ...] with an easing per segment. */
export const keys = (f: number, ks: [number, number][], ease: (t: number) => number = smootherstep) => {
  if (!ks.length) return 0;
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [a, va] = ks[i];
    const [b, vb] = ks[i + 1];
    if (f <= b) return lerp(va, vb, ease(invLerp(a, b, f)));
  }
  return ks[ks.length - 1][1];
};

/** Animated number: counts from a to b between frames f0..f1 with an ease-out (a counter that "spins up"). */
export const countUp = (f: number, f0: number, f1: number, a: number, b: number) => lerp(a, b, easeOut(invLerp(f0, f1, f)));

export const fmtNum = (n: number, opts: { prefix?: string; suffix?: string; decimals?: number; compact?: boolean } = {}) => {
  const { prefix = "", suffix = "", decimals = 0, compact = false } = opts;
  if (compact) {
    const abs = Math.abs(n);
    const [div, s] = abs >= 1e12 ? [1e12, "T"] : abs >= 1e9 ? [1e9, "B"] : abs >= 1e6 ? [1e6, "M"] : abs >= 1e3 ? [1e3, "K"] : [1, ""];
    return `${prefix}${(n / div).toFixed(div === 1 ? 0 : decimals || 1)}${s}${suffix}`;
  }
  return `${prefix}${n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;
};
