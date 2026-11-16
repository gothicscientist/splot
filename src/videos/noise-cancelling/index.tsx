// scenes: hand-written
// "How noise-cancelling headphones work" - Glowvector (glow-lit flat vector) x How it works.
// One colour per idea for the whole film: CORAL = outside noise, CYAN = the anti-noise the headphones make,
// GOLD = a sudden voice, WHITE = what you hear. Every event is keyed to its spoken word through useShot().
// Home base is the street (skyline, kerb, the listener in purple headphones): s01 hook, s04 relief, s05 catch, s06 voice
// and the s07 payoff return to it. s01 -> s02 -> s03 zoom through the ear cup and a microphone hole into the chip;
// s07 pulls back out of the cup's cross-section through a mask shaped like the cup itself.
import React, { useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Reel } from "../../core/Reel";
import { useLocalFrame, useShot, useTimeline } from "../../core/timeline";
import { backOut, clamp, easeOut, invLerp, kick, lerp, rand, smoothstep, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import { CAPTION_PRESETS } from "../../core/captions";
import { FlashFX } from "../../core/fx2d";
import { Callout, Field, GV, Glow, LitCircle, LitPath, LitRect, Motes, Person, RiseText, World, cam2d, capsWidth, lightOf, mixC, noise, rrectPath, shadowOf, usePop } from "../../styles/glowvector/kit";
import type { Cam2DKey, PersonFace } from "../../styles/glowvector/kit";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const TAU = Math.PI * 2;
const NOISE = GV.coral;
const ANTI = GV.cyan;
const VOICE = GV.gold;
const QUIET = GV.white;
const SHELL = "#6C55E0"; // the headphones
const BAND = "#EDEFF6";
const LISTENER = { skin: GV.skin[0], shirt: GV.tangerine, pants: GV.navy, hair: "#3A2A4A", hairStyle: "short" as const };
const FRIEND = { skin: GV.skin[2], shirt: GV.leaf, pants: "#24335E", hair: "#2A1C20", hairStyle: "bun" as const };

type Pt = [number, number];
type Cam = { f: number; x: number; y: number; z: number; rot: number };
type Fn = (x: number) => number;

// ------------------------------------------------------------------------------------------------ camera helpers
/** Camera that zooms about world point P: P's screen position slides s0 -> s1 while the zoom goes z0 -> z1 (log). */
const zoomAbout = (P: Pt, s0: Pt, s1: Pt, z0: number, z1: number, e: number, f: number): Cam => {
  const z = Math.exp(lerp(Math.log(z0), Math.log(z1), e));
  const sx = lerp(s0[0], s1[0], e);
  const sy = lerp(s0[1], s1[1], e);
  return { f, x: P[0] - (sx - 540) / z, y: P[1] - (sy - 960) / z, z, rot: 0 };
};
/** Screen position of world point P under camera c (no roll). */
const scr = (P: Pt, c: { x: number; y: number; z: number }): Pt => [540 + (P[0] - c.x) * c.z, 960 + (P[1] - c.y) * c.z];
/** After f0 the camera dives into P (zoom-through into the next shot): P slides to the frame centre as the zoom grows. */
const diveCam = (base: (t: number) => Cam, P: Pt, f: number, f0: number, f1: number, z1: number): Cam => {
  if (f <= f0) return base(f);
  const c0 = base(f0);
  return zoomAbout(P, scr(P, c0), [540, 960], c0.z, z1, Math.pow(clamp((f - f0) / (f1 - f0)), 1.4), f);
};
const withKick = (c: Cam, f: number, hits: number[], amp: number): Cam => {
  const k = kick(f, hits, amp, 8);
  return { ...c, x: c.x + k, y: c.y - k * 0.5 };
};

// ------------------------------------------------------------------------------------------------ curves
const bez2 = (a: Pt, b: Pt, c: Pt) => (t: number): Pt => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
};
const sampleP = (P: (t: number) => Pt, n = 48): Pt[] => Array.from({ length: n + 1 }, (_, i) => P(i / n));
const line2 = (a: Pt, b: Pt): Pt[] => sampleP((t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)], 8);

// ------------------------------------------------------------------------------------------------ waves
/** Steady hum: one slow sine. */
const humFn = (f: number, wl = 360, speed = 0.085): Fn => (x) => Math.sin((TAU * x) / wl - f * speed);
const edge = (x: number, x0: number, x1: number, w = 70) => smoothstep(clamp((x - x0) / w)) * smoothstep(clamp((x1 - x) / w));

/** A wave drawn as light: three screen-blended falloff strokes, the coloured stroke and a hot core line (no casing). */
const WaveStroke: React.FC<{ d: string; color: string; width: number; glow: number; opacity: number; core: boolean; dash?: string }> = ({ d, color, width, glow, opacity, core, dash }) => {
  const body = (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {glow > 0 ? (
        <g style={{ mixBlendMode: "screen" }}>
          <path d={d} stroke={color} strokeWidth={width * 5.4} opacity={0.055 * glow} />
          <path d={d} stroke={color} strokeWidth={width * 3.1} opacity={0.11 * glow} />
          <path d={d} stroke={color} strokeWidth={width * 1.85} opacity={0.24 * glow} />
        </g>
      ) : null}
      <path d={d} stroke={color} strokeWidth={width} strokeDasharray={dash} />
      {core && !dash ? <path d={d} stroke={lightOf(color, 0.6)} strokeWidth={width * 0.36} opacity={0.9} /> : null}
    </g>
  );
  return opacity < 1 ? <g opacity={opacity}>{body}</g> : body;
};

/** Horizontal wave: centre line y from x0 to x1, displacement fn(x) * amp (x is the world x, so mirrored copies line up). */
const WaveLine: React.FC<{ x0: number; x1: number; y: number; fn: Fn; amp: number; color: string; width?: number; glow?: number; opacity?: number; soft?: number; softR?: number; dash?: string; core?: boolean }> = ({
  x0,
  x1,
  y,
  fn,
  amp,
  color,
  width = 11,
  glow = 1,
  opacity = 1,
  soft = 70,
  softR,
  dash,
  core = true,
}) => {
  if (x1 - x0 < 4 || opacity <= 0.003) return null;
  const sR = softR ?? soft;
  const env = (x: number) => (soft > 0 ? smoothstep(clamp((x - x0) / soft)) : 1) * (sR > 0 ? smoothstep(clamp((x1 - x) / sR)) : 1);
  let d = "";
  for (let x = x0; ; x += 5) {
    const xx = Math.min(x, x1);
    d += `${xx === x0 ? "M" : "L"}${xx.toFixed(1)} ${(y + fn(xx) * amp * env(xx)).toFixed(1)}`;
    if (xx >= x1) break;
  }
  return <WaveStroke d={d} color={color} width={width} glow={glow} opacity={opacity} core={core} dash={dash} />;
};

type PathS = { pts: Pt[]; cum: number[]; L: number };
const pathOf = (pts: Pt[]): PathS => {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, L: cum[cum.length - 1] };
};
const posOn = (P: PathS, s: number): Pt => {
  const ss = clamp(s, 0, P.L);
  let lo = 0;
  let hi = P.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (P.cum[mid] <= ss) lo = mid;
    else hi = mid;
  }
  const seg = P.cum[hi] - P.cum[lo] || 1;
  const t = (ss - P.cum[lo]) / seg;
  return [P.pts[lo][0] + (P.pts[hi][0] - P.pts[lo][0]) * t, P.pts[lo][1] + (P.pts[hi][1] - P.pts[lo][1]) * t];
};
/** A wave along any path: fn(s) of the arc length s, displaced along the normal; `from`/`to` (0..1) limit the drawn
 *  part (a travelling front); `shift` offsets the whole wave sideways (a parallel lane). */
const PathWave: React.FC<{ pts: Pt[]; fn: (s: number) => number; amp: number; color: string; width?: number; glow?: number; opacity?: number; soft?: number; from?: number; to?: number; core?: boolean; shift?: number }> = ({
  pts,
  fn,
  amp,
  color,
  width = 11,
  glow = 1,
  opacity = 1,
  soft = 60,
  from = 0,
  to = 1,
  core = true,
  shift = 0,
}) => {
  if (opacity <= 0.003) return null;
  const P = pathOf(pts);
  const s0 = P.L * clamp(from);
  const s1 = P.L * clamp(to);
  if (s1 - s0 < 4) return null;
  let d = "";
  for (let s = s0; ; s += 5) {
    const ss = Math.min(s, s1);
    const p = posOn(P, ss);
    const a = posOn(P, ss - 5);
    const b = posOn(P, ss + 5);
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const off = shift + fn(ss) * amp * edge(ss, s0, s1, soft);
    d += `${ss === s0 ? "M" : "L"}${(p[0] - ty * off).toFixed(1)} ${(p[1] + tx * off).toFixed(1)}`;
    if (ss >= s1) break;
  }
  return <WaveStroke d={d} color={color} width={width} glow={glow} opacity={opacity} core={core} />;
};

// ------------------------------------------------------------------------------------------------ fronts, blasts, clashes
const arcD = (x: number, y: number, r: number, c: number, spread: number) => {
  const a0 = ((c - spread) * Math.PI) / 180;
  const a1 = ((c + spread) * Math.PI) / 180;
  return `M${(x + Math.cos(a0) * r).toFixed(1)} ${(y + Math.sin(a0) * r).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(x + Math.cos(a1) * r).toFixed(1)} ${(y + Math.sin(a1) * r).toFixed(1)}`;
};
const ArcSet: React.FC<{ arcs: { d: string; o: number; w: number }[]; color: string }> = ({ arcs, color }) => (
  <g fill="none" strokeLinecap="round">
    <g style={{ mixBlendMode: "screen" }}>
      {arcs.map((a, i) => (
        <path key={`g${i}`} d={a.d} stroke={color} strokeWidth={a.w * 3.4} opacity={0.12 * a.o} />
      ))}
      {arcs.map((a, i) => (
        <path key={`h${i}`} d={a.d} stroke={color} strokeWidth={a.w * 1.9} opacity={0.22 * a.o} />
      ))}
    </g>
    {arcs.map((a, i) => (
      <path key={`b${i}`} d={a.d} stroke={color} strokeWidth={a.w} opacity={a.o} />
    ))}
    {arcs.map((a, i) => (
      <path key={`c${i}`} d={a.d} stroke={lightOf(color, 0.6)} strokeWidth={a.w * 0.36} opacity={0.9 * a.o} />
    ))}
  </g>
);
/** Sound pumping out of a source: n wave fronts (arcs opening toward `dir`) that grow r0 -> r1 and fade, looping. */
const Fronts: React.FC<{ x: number; y: number; dir: number; r0: number; r1: number; n?: number; speed?: number; width: number; color?: string; k: number; spread?: number }> = ({
  x,
  y,
  dir,
  r0,
  r1,
  n = 3,
  speed = 0.05,
  width,
  color = ANTI,
  k,
  spread = 60,
}) => {
  const f = useLocalFrame();
  if (k <= 0.005) return null;
  const c = dir < 0 ? 180 : 0;
  const arcs = Array.from({ length: n }).map((_, i) => {
    const ph = (((f * speed + i / n) % 1) + 1) % 1;
    return { d: arcD(x, y, lerp(r0, r1, ph), c, spread), o: Math.min(1, k) * Math.pow(1 - ph, 0.75) * smoothstep(clamp(ph / 0.14)), w: width * (1 - ph * 0.4) };
  });
  return <ArcSet arcs={arcs} color={color} />;
};
/** One-shot blast: a couple of thick fronts launched at `at` that race out to r1 and fade (never a ring on a face). */
const Blast: React.FC<{ at: number; x: number; y: number; dir: number; r0: number; r1: number; width: number; color?: string; dur?: number; n?: number; gap?: number; spread?: number }> = ({
  at,
  x,
  y,
  dir,
  r0,
  r1,
  width,
  color = ANTI,
  dur = 16,
  n = 2,
  gap = 4,
  spread = 70,
}) => {
  const f = useLocalFrame();
  const c = dir < 0 ? 180 : 0;
  const arcs: { d: string; o: number; w: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = (f - at - i * gap) / dur;
    if (t <= 0 || t >= 1) continue;
    arcs.push({ d: arcD(x, y, lerp(r0, r1, 1 - Math.pow(1 - t, 2.2)), c, spread), o: Math.pow(1 - t, 1.1), w: width * (1 - 0.65 * t) });
  }
  return arcs.length ? <ArcSet arcs={arcs} color={color} /> : null;
};
const sparkD = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
/** Where coral noise meets the cyan anti-noise: a white-hot flickering spark, coral on the noise side, cyan on the cup
 *  side (`dir` = the side the cup is on). */
const Clash: React.FC<{ x: number; y: number; r: number; k: number; dir: number; seed?: number }> = ({ x, y, r, k, dir, seed = 1 }) => {
  const f = useLocalFrame();
  if (k <= 0.01) return null;
  const fl = 0.86 + 0.14 * Math.sin(f * 1.3 + seed * 2) + 0.12 * noise(f * 0.35, seed);
  const R = r * fl * (0.72 + 0.28 * Math.min(1.6, k));
  const step = Math.floor(f / 2);
  const o = Math.min(1, k);
  return (
    <g>
      <Glow cx={x - dir * R * 0.55} cy={y} r={R} color={NOISE} core={NOISE} intensity={0.6 * o} />
      <Glow cx={x + dir * R * 0.55} cy={y} r={R} color={ANTI} core={ANTI} intensity={0.6 * o} />
      <Glow cx={x} cy={y} r={R * 0.8} color={GV.cream} intensity={o} />
      <g stroke={GV.cream} strokeLinecap="round" opacity={o}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * TAU + rand(seed * 31 + i, step) * 0.8;
          const l0 = R * (0.45 + rand(seed * 37 + i, step) * 0.2);
          const l1 = R * (1.05 + rand(seed * 41 + i, step) * 0.85 * Math.min(1.6, k));
          return <line key={i} x1={x + Math.cos(a) * l0} y1={y + Math.sin(a) * l0} x2={x + Math.cos(a) * l1} y2={y + Math.sin(a) * l1} strokeWidth={R * 0.09} />;
        })}
      </g>
      <path d={sparkD(x, y, R * 1.15 * (0.92 + 0.08 * Math.sin(f * 0.8)))} fill="#FFFFFF" opacity={0.95 * o} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the listener
type Cups = { L: Pt; R: Pt; H: Pt };
const rotP = (p: Pt, c: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
const headY = (feet: number, k: number) => feet - 191.4 * k;
const bobAt = (f: number, seed = 2) => Math.sin(f * 0.07 + seed) * 3;
/** Cup centres and head centre of a Listener (after its lean about the feet and its bob). */
const cupsOf = (x: number, feet: number, k: number, lean: number, bob: number): Cups => {
  const hy = headY(feet, k) + bob;
  const c: Pt = [x, feet];
  return { L: rotP([x - 60 * k, hy + 4 * k], c, lean), R: rotP([x + 60 * k, hy + 4 * k], c, lean), H: rotP([x, hy], c, lean) };
};

/** Over-ear headphones, front view, centred on a head (x, y = head centre, k = scale; head radius 46 at k = 1). Each cup
 *  is a 34 x 68 rounded rect (r 15) at +-60, with a cushion strip against the head and, while `emit`, a glowing slot on
 *  its outer edge where the sound comes out. */
const HeadSet: React.FC<{ x: number; y: number; k: number; pulse?: number; emit?: number }> = ({ x, y, k, pulse = 0, emit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M-58 -2 A58 60 0 0 1 58 -2" fill="none" stroke={shadowOf(BAND, 0.3)} strokeWidth={15} strokeLinecap="round" />
    <path d="M-58 -5 A58 60 0 0 1 58 -5" fill="none" stroke={BAND} strokeWidth={10} strokeLinecap="round" />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 60} 4) scale(${1 + pulse * 0.12})`}>
        <rect x={sd < 0 ? 12 : -20} y={-27} width={8} height={54} rx={4} fill={shadowOf(SHELL, 0.45)} />
        <LitRect x={-17} y={-34} w={34} h={68} r={15} fill={SHELL} />
        <circle cx={sd * 8} cy={-14} r={3.4} fill={GV.gold} />
        {emit > 0.01 ? <rect x={sd < 0 ? -19 : 13} y={-15} width={6} height={30} rx={3} fill={lightOf(ANTI, 0.4)} opacity={Math.min(1, emit * 1.6)} /> : null}
      </g>
    ))}
    {emit > 0.01 ? [-1, 1].map((sd) => <Glow key={`g${sd}`} cx={sd * 77} cy={4} r={14} color={ANTI} intensity={emit} />) : null}
  </g>
);

/** The capsule listener + headphones; `hands` (or `handL` / `handR` per side) 0 -> 1 lifts a hand onto its cup. */
const Listener: React.FC<{ x: number; feet: number; k: number; face?: PersonFace; look?: [number, number]; lean?: number; hands?: number; handL?: number; handR?: number; arm?: number; pulse?: number; emit?: number }> = ({
  x,
  feet,
  k,
  face = "neutral",
  look,
  lean = 0,
  hands = 0,
  handL,
  handR,
  arm = 10,
  pulse = 0,
  emit = 0,
}) => {
  const f = useLocalFrame();
  const bob = bobAt(f);
  const a = (arm * Math.PI) / 180;
  const amt = (side: number) => (side < 0 ? handL ?? hands : handR ?? hands);
  const handAt = (side: number): Pt => {
    const rx = side * (46 + Math.sin(a) * 108);
    const ry = -120 + Math.cos(a) * 108;
    return [lerp(rx, side * 80, amt(side)), lerp(ry, -188, amt(side))];
  };
  return (
    <g transform={lean ? `rotate(${lean} ${x} ${feet})` : undefined}>
      <Person spec={{ ...LISTENER, scale: k }} x={x} y={feet} face={face} look={look} seed={2} armL={arm} armR={arm} handL={amt(-1) > 0.001 ? handAt(-1) : undefined} handR={amt(1) > 0.001 ? handAt(1) : undefined} />
      <HeadSet x={x} y={headY(feet, k) + bob} k={k} pulse={pulse} emit={emit} />
      {[-1, 1].map((sd) => {
        if (amt(sd) <= 0.55) return null;
        const [hx, hy] = handAt(sd);
        return <circle key={sd} cx={x + hx * k} cy={feet + bob + hy * k} r={17 * k} fill={LISTENER.skin} opacity={smoothstep((amt(sd) - 0.55) / 0.3)} />;
      })}
    </g>
  );
};

/** Exhaled breath: three soft puffs drifting away from the mouth. */
const Puffs: React.FC<{ at: number; x: number; y: number; k: number }> = ({ at, x, y, k }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = (f - at - i * 6) / 26;
        if (t <= 0 || t >= 1) return null;
        return <circle key={i} cx={x + (10 + t * 62) * (k / 4)} cy={y + (4 + t * 26) * (k / 4)} r={(7 + t * 15) * (k / 4)} fill={GV.cream} opacity={0.6 * (1 - t)} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the street
const Plane: React.FC<{ x: number; y: number; k?: number; engineGlow?: number; dim?: number }> = ({ x, y, k = 1, engineGlow = 0, dim = 0 }) => {
  const f = useLocalFrame();
  const body = mixC(GV.white, "#34467A", dim);
  const deep = mixC(GV.deep, "#1B2A52", dim);
  return (
    <g transform={`translate(${x} ${y + Math.sin(f * 0.06) * 6}) scale(${k}) rotate(-4)`}>
      <path d="M-150 -6 L-205 -70 L-170 -70 L-110 -20 Z" fill={shadowOf(body, 0.25)} />
      <LitPath d="M-190 0 Q-190 -30 -150 -32 L120 -32 Q200 -26 215 0 Q200 26 120 30 L-150 30 Q-190 28 -190 0Z" fill={body} off={12} />
      <path d="M-30 14 L-110 96 L-56 96 L50 18 Z" fill={shadowOf(body, 0.32)} />
      {[-90, -50, -10, 30, 70, 110].map((wx) => (
        <rect key={wx} x={wx} y={-18} width={22} height={16} rx={7} fill={deep} />
      ))}
      <path d="M150 -20 Q186 -16 196 -2 L156 -2 Z" fill={deep} />
      <LitRect x={-64} y={50} w={78} h={36} r={18} fill={mixC("#243357", "#1B2546", dim)} />
      {engineGlow > 0 ? <Glow cx={-64} cy={68} r={15} color={NOISE} intensity={engineGlow} pulse={0.12} /> : null}
    </g>
  );
};

const Megaphone: React.FC<{ x: number; y: number; k?: number; flip?: boolean; dim?: number }> = ({ x, y, k = 1, flip = false, dim = 0 }) => {
  const f = useLocalFrame();
  const horn = mixC(GV.tangerine, "#4A2E5E", dim);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) rotate(${16 + Math.sin(f * 0.09) * 3})`}>
      <rect x={-58} y={14} width={22} height={70} rx={11} fill={mixC("#1A2747", "#141C36", dim)} />
      <LitRect x={-96} y={-30} w={66} h={60} r={16} fill={mixC("#2B3F73", "#1F2A4E", dim)} />
      <LitPath d="M-34 -30 L78 -86 Q98 0 78 86 L-34 30 Z" fill={horn} off={14} />
      <ellipse cx={80} cy={0} rx={15} ry={84} fill={lightOf(horn, 0.45)} />
      <ellipse cx={80} cy={0} rx={8} ry={62} fill={shadowOf(horn, 0.45)} />
      {[0, 1, 2].map((i) => {
        const t = (((f * 0.05 + i / 3) % 1) + 1) % 1;
        return <path key={i} d={`M${112 + t * 70} ${-52 - t * 34} Q${140 + t * 84} 0 ${112 + t * 70} ${52 + t * 34}`} fill="none" stroke={NOISE} strokeWidth={10} strokeLinecap="round" opacity={0.85 * (1 - t)} />;
      })}
    </g>
  );
};

/** Far city skyline (a depth layer: lerped toward the field colour). `base` = where the buildings meet the road; `hs`
 *  stretches the towers (the window grid follows). */
const Skyline: React.FC<{ base: number; dim?: number; hs?: number }> = ({ base, dim = 0.35, hs = 1 }) => {
  const B: [number, number, number][] = [
    [-240, 170, 300], [-70, 140, 380], [70, 180, 260], [250, 120, 350], [370, 210, 240], [580, 130, 400], [710, 170, 290], [880, 140, 360], [1020, 190, 280], [1210, 150, 340], [1360, 170, 300],
  ];
  const cA = mixC("#15294F", GV.field[0], dim);
  const cB = mixC("#102347", GV.field[0], dim);
  const win = mixC(GV.cream, GV.field[0], 0.2 + dim * 0.4);
  return (
    <g>
      {B.map(([x, w, h0], i) => {
        const h = h0 * hs;
        const rows = Math.max(1, Math.floor((h - 70) / 58));
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={w} height={h + 90} rx={10} fill={i % 2 ? cA : cB} />
            {Array.from({ length: rows * 3 }).map((_, j) => {
              const wx = x + 20 + (j % 3) * ((w - 40) / 2.6);
              const wy = base - h + 30 + Math.floor(j / 3) * 58;
              return (i * 7 + j * 5) % 4 === 0 && wy < base - 40 ? <rect key={j} x={wx} y={wy} width={18} height={24} rx={5} fill={win} opacity={0.3} /> : null;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Road, kerb and pavement; `y` = the pavement line the listener stands on. */
const Ground: React.FC<{ y: number }> = ({ y }) => {
  const road = y - 220;
  const kerb = y - 42;
  const X0 = -900;
  const W = 3000;
  return (
    <g>
      <rect x={X0} y={road} width={W} height={kerb - road + 2} fill="#0B172D" />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={X0 + 40 + i * 230} y={road + (kerb - road) * 0.47} width={120} height={10} rx={5} fill={GV.cream} opacity={0.15} />
      ))}
      <rect x={X0} y={kerb} width={W} height={28} fill="#2A436E" />
      <rect x={X0} y={kerb} width={W} height={6} fill="#5672A6" opacity={0.75} />
      <rect x={X0} y={kerb + 28} width={W} height={1500} fill="#14274A" />
      <rect x={X0} y={kerb + 28} width={W} height={10} fill="#0D1B37" opacity={0.85} />
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x={X0 + 130 + i * 240} y={kerb + 28} width={5} height={1500} fill="#0F1F3E" />
      ))}
      <rect x={X0} y={y + 190} width={W} height={5} fill="#0F1F3E" />
    </g>
  );
};

/** The street's sound fight beside the head. Per side: two coral noise strands crash in from beyond the frame edge (from
 *  the plane's / megaphone's side) at head height; the cup pumps cyan fronts; where they meet, D_CLASH out from the
 *  cup, a white-hot clash. `reach` 1 = no anti-noise yet, the coral runs all the way to the cup and splats; `calm` turns
 *  everything into one flat white line that runs into both cups. */
const D_CLASH = 90;
const StreetNoise: React.FC<{ f: number; cups: Cups; k: number; coralIn: number; reach?: number; cyan: number; clash: number; calm?: number; burstAt?: number }> = ({
  f,
  cups,
  k,
  coralIn,
  reach = 0,
  cyan,
  clash,
  calm = 0,
  burstAt,
}) => {
  const col = (c: string) => (calm > 0 ? mixC(c, QUIET, calm) : c);
  const live = 1 - calm;
  return (
    <g>
      {[-1, 1].map((sd) => {
        const c = sd < 0 ? cups.L : cups.R;
        const E: Pt = [c[0] + sd * 17 * k, c[1]];
        const C: Pt = [E[0] + sd * D_CLASH, c[1] - 4];
        const end: Pt = [lerp(C[0], E[0] + sd * 6, reach), lerp(C[1], E[1], reach)];
        const F: Pt = [sd < 0 ? -150 : 1230, c[1] - 125];
        const pA = sampleP(bez2(F, [lerp(F[0], end[0], 0.55), c[1] + 4], end), 40);
        const F2: Pt = [F[0], F[1] + 150];
        const pB = sampleP(bez2(F2, [lerp(F2[0], end[0], 0.5), c[1] + 50], end), 40);
        const sp = sd < 0 ? 0 : 1.7;
        const nA = (s: number) => Math.sin((TAU * s) / 190 - f * 0.26 + sp);
        const nB = (s: number) => Math.sin((TAU * s) / 140 - f * 0.31 + 2 + sp);
        const cyanStrand = Math.min(cyan, clash * 1.6) * live;
        const flat = (x: number) => Math.sin(x * 0.04 + f * 0.2) * 0.5;
        return (
          <g key={sd}>
            {coralIn > 0.01 && live > 0.01 ? (
              <>
                <PathWave pts={pB} fn={nB} amp={30 * live} color={col(NOISE)} width={11} opacity={0.8 * live} to={coralIn} soft={46} />
                <PathWave pts={pA} fn={nA} amp={52 * live} color={col(NOISE)} width={18} opacity={live} to={coralIn} soft={50} />
              </>
            ) : null}
            {cyanStrand > 0.01 ? <PathWave pts={line2(E, C)} fn={(s) => Math.sin((TAU * s) / 112 - f * 0.34)} amp={40 * cyanStrand} color={ANTI} width={15} opacity={cyanStrand} soft={30} /> : null}
            <Fronts x={E[0]} y={E[1]} dir={sd} r0={10} r1={lerp(178, D_CLASH + 8, clamp(clash * 1.3))} width={15} k={cyan * live} spread={62} />
            {reach > 0.02 && coralIn > 0.9 ? <Glow cx={E[0] + sd * 10} cy={E[1]} r={40} color={NOISE} intensity={reach * (0.5 + 0.35 * Math.sin(f * 0.9 + sd))} /> : null}
            <Clash x={C[0]} y={C[1]} r={46} k={clash * live} dir={-sd} seed={sd < 0 ? 3 : 7} />
            {calm > 0.01 ? (
              sd < 0 ? (
                <WaveLine x0={-60} x1={E[0] - 2} y={E[1]} fn={flat} amp={4} color={QUIET} width={14} glow={2.2} opacity={calm} soft={30} />
              ) : (
                <WaveLine x0={E[0] + 2} x1={1140} y={E[1]} fn={flat} amp={4} color={QUIET} width={14} glow={2.2} opacity={calm} soft={30} />
              )
            ) : null}
            {burstAt !== undefined ? <Blast at={burstAt} x={E[0]} y={E[1]} dir={sd} r0={24} r1={600} width={26} spread={72} /> : null}
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ inside the headphones
const MicGrille: React.FC<{ x: number; y: number; r: number; lit: number }> = ({ x, y, r, lit }) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.22} fill={shadowOf(SHELL, 0.42)} />
    <circle cx={x} cy={y} r={r} fill="#15103A" />
    {[-1, 0, 1].map((a) => [-1, 0, 1].map((b) => <circle key={`${a}${b}`} cx={x + a * r * 0.36} cy={y + b * r * 0.36} r={r * 0.1} fill={mixC("#4B3FA0", GV.gold, lit)} />))}
    {lit > 0.01 ? <Glow cx={x} cy={y} r={r * 0.95} color={GV.gold} intensity={0.55 * lit} pulse={0.08} /> : null}
  </g>
);

const Chip: React.FC<{ x: number; y: number; k?: number; busy?: number; inGlow?: number; outGlow?: number }> = ({ x, y, k = 1, busy = 0.6, inGlow = 0, outGlow = 0 }) => {
  const f = useLocalFrame();
  const top = mixC(GV.gold, NOISE, inGlow);
  const bot = mixC(GV.gold, ANTI, outGlow);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {[-78, -39, 0, 39, 78].map((o) => (
        <g key={o}>
          <rect x={o - 9} y={-150} width={18} height={36} rx={6} fill={top} />
          <rect x={o - 9} y={114} width={18} height={36} rx={6} fill={bot} />
          <rect x={-150} y={o - 9} width={36} height={18} rx={6} fill={GV.gold} />
          <rect x={114} y={o - 9} width={36} height={18} rx={6} fill={GV.gold} />
        </g>
      ))}
      <LitRect x={-122} y={-122} w={244} h={244} r={34} fill="#2A4377" />
      <LitRect x={-70} y={-70} w={140} h={140} r={22} fill="#152447" rim={false} />
      <path d="M-100 -96 H-70 M-100 96 H-70 M70 -96 H100 M70 96 H100" stroke={lightOf("#2A4377", 0.25)} strokeWidth={5} strokeLinecap="round" />
      <Glow cx={0} cy={0} r={38} color={ANTI} intensity={0.55 + busy * 0.45 * (0.6 + 0.4 * Math.sin(f * 0.3))} />
    </g>
  );
};

const Speaker: React.FC<{ x: number; y: number; k?: number; push?: number }> = ({ x, y, k = 1, push = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <LitRect x={-96} y={-52} w={64} h={104} r={16} fill="#243357" />
    <g transform={`translate(${push * 10} 0)`}>
      <LitPath d="M-36 -44 L58 -112 Q84 0 58 112 L-36 44 Q-46 0 -36 -44Z" fill={GV.cream} off={14} />
      <ellipse cx={-6} cy={0} rx={20} ry={34} fill={shadowOf(GV.cream, 0.4)} />
    </g>
  </g>
);

const Ear: React.FC<{ x: number; y: number; k?: number; flip?: boolean }> = ({ x, y, k = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
    <LitPath d="M-10 -120 Q70 -128 76 -40 Q80 10 44 44 Q22 66 26 100 Q26 128 -4 126 Q-34 122 -36 84 Q-70 40 -62 -34 Q-56 -112 -10 -120Z" fill={GV.skin[0]} off={14} />
    <path d="M-6 -84 Q40 -86 44 -34 Q44 0 16 22 Q2 36 4 62" fill="none" stroke={shadowOf(GV.skin[0], 0.34)} strokeWidth={12} strokeLinecap="round" />
    <path d="M-22 -40 Q-2 -52 4 -28 Q4 -10 -12 -4" fill="none" stroke={shadowOf(GV.skin[0], 0.34)} strokeWidth={10} strokeLinecap="round" />
  </g>
);

/** Hair cap on a round head: an arc just outside the head from angle a0 to a1 (deg, 0 = +x, 90 = down), back along a soft hairline. */
const hairCap = (cx: number, cy: number, r: number, a0: number, a1: number, drop: number) => {
  const p = (a: number, rr: number): Pt => [cx + Math.cos((a * Math.PI) / 180) * rr, cy + Math.sin((a * Math.PI) / 180) * rr];
  const [x0, y0] = p(a0, r + 8);
  const [x1, y1] = p(a1, r + 8);
  const [mx, my] = p((a0 + a1) / 2, r - drop);
  return `M${x0} ${y0} A${r + 8} ${r + 8} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1} ${y1} Q${mx} ${my} ${x0} ${y0} Z`;
};

/** Speech bubble as ONE contour (body + tail), so the lighting has no seam where the tail meets the body. */
const bubblePath = (w: number, h: number, r: number, tx: number, tw: number, tl: number, tdx: number) => {
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;
  const a = tx + tw / 2;
  const b = tx - tw / 2;
  const tipX = tx + tdx;
  const tipY = y1 + tl;
  return `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${a}Q${a - tw * 0.2} ${y1 + tl * 0.45} ${tipX} ${tipY}Q${b + tw * 0.15} ${y1 + tl * 0.4} ${b} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
};
const SpeechBubble: React.FC<{ at: number; x: number; y: number; text: string; w?: number; h?: number; out?: number; tail?: [number, number, number] }> = ({ at, x, y, text, w = 400, h = 220, out, tail = [-60, 86, -40] }) => {
  const f = useLocalFrame();
  const s0 = usePop(at);
  const o = out !== undefined && f >= out ? 1 - clamp((f - out) / 6) : 1;
  const s = s0 * o;
  if (s <= 0) return null;
  const sy = s0 < 1 ? s : (1 + (s0 - 1) * 1.3) * o;
  return (
    <g transform={`translate(${x} ${y}) scale(${s} ${sy})`}>
      <LitPath d={bubblePath(w, h, Math.min(86, h * 0.42), tail[0], 72 * (h / 220), tail[1], tail[2])} fill={GV.cream} off={16} />
      <text x={0} y={h * 0.19} textAnchor="middle" fontFamily={font("Fredoka")} fontWeight={700} fontSize={h * 0.54} letterSpacing={4} fill={GV.navy}>
        {text}
      </text>
    </g>
  );
};

/** Green check (or coral cross) disc; the mark is fully drawn 5 frames after the pop starts; `out` shrinks it away. */
const Tick: React.FC<{ at: number; x: number; y: number; r?: number; ok?: boolean; out?: number }> = ({ at, x, y, r = 70, ok = true, out }) => {
  const s0 = usePop(at);
  const f = useLocalFrame();
  const o = out !== undefined && f >= out ? 1 - clamp((f - out) / 6) : 1;
  const s = s0 * o;
  if (s <= 0) return null;
  const c = ok ? GV.leaf : GV.coral;
  const d = clamp((f - at) / 5);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r * 1.3} fill={c} opacity={0.2} />
      <LitCircle cx={0} cy={0} r={r} fill={c} />
      {ok ? (
        <path d={`M${-r * 0.42} ${r * 0.03} L${-r * 0.1} ${r * 0.35} L${r * 0.46} ${-r * 0.3}`} fill="none" stroke={GV.white} strokeWidth={r * 0.22} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      ) : (
        <path d={`M${-r * 0.34} ${-r * 0.34} L${r * 0.34} ${r * 0.34} M${r * 0.34} ${-r * 0.34} L${-r * 0.34} ${r * 0.34}`} fill="none" stroke={GV.white} strokeWidth={r * 0.22} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      )}
    </g>
  );
};

/** Soft round lights for far layers (out-of-focus city / sky). */
const Bokeh: React.FC<{ seed?: number; n?: number; y0?: number; y1?: number; colors?: string[] }> = ({ seed = 5, n = 9, y0 = 150, y1 = 1650, colors = [GV.teal, GV.cream, GV.coral, GV.violet] }) => {
  const f = useLocalFrame();
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        {colors.map((c, i) => (
          <radialGradient key={i} id={`bk${id}${i}`}>
            <stop offset="0" stopColor={c} stopOpacity={0.9} />
            <stop offset="0.6" stopColor={c} stopOpacity={0.45} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const k = seed * 50 + i;
        return <circle key={i} cx={rand(31, k) * 1400 - 160 + Math.sin(f * 0.01 + i) * 10} cy={y0 + rand(37, k) * (y1 - y0)} r={34 + rand(41, k) * 70} fill={`url(#bk${id}${i % colors.length})`} opacity={0.12 + rand(43, k) * 0.1} />;
      })}
    </g>
  );
};

/** Faint circuit-board traces (the far layer inside the headphones). */
const Circuit: React.FC = () => {
  const lines: string[] = [];
  const nodes: Pt[] = [];
  for (let i = 0; i < 16; i++) {
    const x = -260 + i * 170 + rand(51, i) * 60;
    const y0 = -100 + rand(53, i) * 400;
    const y1 = y0 + 380 + rand(57, i) * 500;
    const dx = (rand(59, i) > 0.5 ? 1 : -1) * 120;
    lines.push(`M${x} ${y0} V${y1} L${x + dx} ${y1 + 120} V${y1 + 620}`);
    nodes.push([x, y0], [x + dx, y1 + 620]);
  }
  return (
    <g opacity={0.13} fill="none" stroke={GV.teal} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
      {lines.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={13} fill={GV.teal} stroke="none" />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the cup, cut open
// The LEFT ear cup cut open, front view, drawn in a 1080 x 2160 design frame whose outline is the cup's own rounded
// rect (the cup is 34 x 68 with r 15 at k = 1), so it can be masked by the cup's exact shape and shrunk into the real cup
// on the listener's head. Outer side (shell, chip, speaker) on the left, the side of the head with the ear on the right.
const SEC_W = 1080;
const SEC_H = 2160;
const SEC_R = (15 / 17) * 540;
const secScale = (k: number) => (34 * k) / SEC_W;
/** Camera looking at design-frame point (dx, dy) of the cup at centre c (scale k) with on-screen magnification M. */
const xrayCam = (c: Pt, k: number, dx: number, dy: number, M: number, f: number): Cam => {
  const S = secScale(k);
  return { f, x: c[0] + (dx - SEC_W / 2) * S, y: c[1] + (dy - SEC_H / 2) * S, z: M / S, rot: 0 };
};
const CupXray: React.FC<{ c: Pt; k: number; opacity: number; children: React.ReactNode }> = ({ c, k, opacity, children }) => {
  const id = useId().replace(/:/g, "");
  if (opacity <= 0.003) return null;
  return (
    <g transform={`translate(${c[0] - 17 * k} ${c[1] - 34 * k}) scale(${secScale(k)})`} opacity={opacity}>
      <defs>
        <clipPath id={`cx${id}`}>
          <path d={rrectPath(0, 0, SEC_W, SEC_H, SEC_R)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#cx${id})`}>{children}</g>
    </g>
  );
};
const PADS: [number, number, number, number][] = [
  [250, 400, 440, 300],
  [250, 1460, 440, 300],
];
const CupSection: React.FC<{ f: number; emit?: number; padAt?: number; blockAt?: number; xAt?: number; out?: number; chip?: boolean }> = ({ f, emit = 0, padAt, blockAt, xAt, out, chip = true }) => {
  const id = useId().replace(/:/g, "");
  const glow = padAt === undefined ? 0 : clamp((f - padAt) / 8);
  const hit = blockAt === undefined ? 0 : clamp((f - blockAt) / 6);
  const padC = mixC("#3B2E6E", GV.cream, 0.5 + 0.38 * glow);
  const skin = GV.skin[0];
  return (
    <>
      <defs>
        <linearGradient id={`sb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C1830" />
          <stop offset="1" stopColor="#171F48" />
        </linearGradient>
      </defs>
      <rect x={-20} y={-20} width={SEC_W + 40} height={SEC_H + 40} fill={`url(#sb${id})`} />
      <ellipse cx={600} cy={1080} rx={430} ry={640} fill={ANTI} opacity={0.05} />
      {/* the side of the head under the cup, with the ear */}
      <rect x={780} y={-20} width={360} height={SEC_H + 40} fill={skin} />
      <rect x={780} y={-20} width={22} height={SEC_H + 40} fill={shadowOf(skin, 0.2)} />
      <Ear x={700} y={1080} k={1.6} flip />
      {/* the shell wall with its chip, the speaker on the inside */}
      <LitPath d={rrectPath(-60, -60, 310, SEC_H + 120, 40)} fill={SHELL} off={26} />
      <rect x={234} y={-20} width={16} height={SEC_H + 40} fill={shadowOf(SHELL, 0.35)} />
      {chip ? <Chip x={150} y={1080} k={0.42} busy={1} /> : null}
      <Speaker x={340} y={1080} k={1.2} push={Math.max(0, Math.sin(f * 0.4)) * (0.5 + emit * 0.6)} />
      {emit > 0 ? <Fronts x={430} y={1080} dir={1} r0={30} r1={330} n={3} speed={0.07} width={30} k={emit} spread={50} /> : null}
      {/* the cushions */}
      {PADS.map(([x, y, w, h], i) => (
        <g key={i}>
          <LitPath d={rrectPath(x, y, w, h, 130)} fill={padC} off={20} />
          {[0.25, 0.5, 0.75].map((t) => (
            <path key={t} d={`M${x + w * t} ${y + 30} q16 ${h / 2 - 30} 0 ${h - 60}`} fill="none" stroke={shadowOf(padC, 0.3)} strokeWidth={7} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* small fast gold waves leak in at the cushions and bounce off the padding */}
      {padAt !== undefined
        ? PADS.map(([x, y, , h], i) => {
            const yy = y + h / 2;
            const vf = (s: number) => 0.6 * Math.sin((TAU * s) / 52 - f * 0.6 + i * 2) + 0.4 * Math.sin((TAU * s) / 31 - f * 0.9 + i);
            return (
              <g key={`w${i}`}>
                <WaveLine x0={-60} x1={x - 6} y={yy} fn={vf} amp={30} color={VOICE} width={10} soft={40} />
                {hit > 0
                  ? [0, 1, 2].map((r) => {
                      const t = ((((f - (blockAt ?? 0)) * 0.045 + r / 3) % 1) + 1) % 1;
                      return <path key={r} d={`M${x - 6 - t * 120} ${yy - 64 - t * 44} Q${x - 40 - t * 140} ${yy} ${x - 6 - t * 120} ${yy + 64 + t * 44}`} fill="none" stroke={VOICE} strokeWidth={9} strokeLinecap="round" opacity={0.8 * (1 - t) * hit} />;
                    })
                  : null}
              </g>
            );
          })
        : null}
      {padAt !== undefined ? <Callout at={padAt} out={out} x={600} y={822} text="Padding" to={[470, 702]} color={GV.cream} size={56} /> : null}
      {xAt !== undefined ? <Tick at={xAt} out={out} x={150} y={880} r={66} ok={false} /> : null}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ captions in a pill
// The bible's caption pill (rgba(6,20,40,.62)) behind core captions: the same browser layout as core/captions.tsx
// (preset, size fit, line box, pop) with transparent text, so the pill hugs the real words wherever they sit.
const CaptionPill: React.FC = () => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cap = tl.captions.find((c) => f >= c.s && f < c.e);
  if (!cap || tl.captionStyle.hidden) return null;
  const p = CAPTION_PRESETS[tl.captionStyle.preset ?? "clean"] ?? CAPTION_PRESETS.clean;
  const k = W / 1080;
  const texts = cap.words
    .map((i) => tl.words[i])
    .filter(Boolean)
    .map((w) => {
      const t = w.text.replace(/[.,;:]+$/g, "").replace(/^["“(]+|["”)]+$/g, "");
      return p.uppercase ? t.toUpperCase() : t;
    });
  const avg = 0.6; // Inter, as in captions.tsx
  const est = (sz: number) => texts.reduce((a, t) => a + t.length * avg * sz, 0) + Math.max(0, texts.length - 1) * 0.3 * sz;
  let size = p.size * k;
  const maxW = p.maxWidth * k;
  if (p.mode === "single") while (est(size) * 1.06 > maxW && size > p.minSize * k) size *= 0.95;
  else while (est(size) * 1.06 > maxW * 1.9 && size > p.minSize * k) size *= 0.95;
  const sc = 0.84 + 0.16 * backOut(invLerp(0, 4, f - cap.s), 2.0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: (W - maxW) / 2, width: maxW, top: p.y * H, transform: `translateY(-50%) scale(${sc})`, transformOrigin: "50% 50%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            columnGap: `${size * 0.26}px`,
            rowGap: `${size * 0.04}px`,
            fontFamily: font(p.font),
            fontWeight: p.weight,
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: p.letterSpacing,
            color: "transparent",
            background: "rgba(6,20,40,0.66)",
            borderRadius: size,
            padding: `${size * 0.14}px ${size * 0.42}px`,
          }}
        >
          {texts.map((t, i) => (
            <span key={i} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s01 hook
// "Your headphones don't block noise. They make more of it."
// v0 (main): tight on one cup pumping out thick cyan fronts while a NOISE meter climbs, then a pull-back to the street
// as coral noise from the plane and the megaphone crashes in and clashes with the cyan beside the head.
// v1: wide street, the noise crashes in from both sides and stops dead at the cups, then the cups start firing.
// v2: macro inside the cup (cut open): its speaker pumps out a wave of its own, the meter climbs; pull back through
// the cup's outline to the street.
const FEET: Pt = [540, 1465];
const PK = 3.5;
const PLANE_AT: Pt = [110, 610];
const MEGA_AT: Pt = [990, 642];

/** The hook text on its own dark ground (two stacked pills, TikTok text style), so nothing behind it can eat the
 *  contrast; "MORE NOISE" punches on "more". */
const HookTitle: React.FC<{ f: number; more: number; out: number }> = ({ f, more, out }) => {
  const t = smootherstep(invLerp(out, out + 7, f));
  if (t >= 1) return null;
  const punch = f >= more + 1 ? Math.exp(-(f - more - 1) / 5) : 0;
  const k2 = 1 + 0.16 * punch;
  const w1 = capsWidth("THEY MAKE", 92, 4) + 92;
  const w2 = capsWidth("MORE NOISE", 128, 4) + 104;
  const big = `translate(540 474) scale(${k2}) translate(-540 -474)`;
  return (
    <AbsoluteFill style={{ opacity: 1 - t, transform: `scale(${1 + 0.4 * t})`, transformOrigin: "50% 22%" }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <g opacity={0.82}>
          <rect x={540 - w1 / 2} y={302} width={w1} height={116} rx={58} fill="#061428" />
          <g transform={big}>
            <rect x={540 - w2 / 2} y={404} width={w2} height={148} rx={74} fill="#061428" />
          </g>
        </g>
        <RiseText at={-16} x={540} y={392} text="THEY MAKE" size={92} color={GV.white} />
        <g transform={big}>
          <RiseText at={-14} x={540} y={522} text="MORE NOISE" size={128} color={GV.gold} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const METER_COLS = [GV.leaf, GV.leaf, GV.gold, GV.gold, GV.tangerine, GV.tangerine, GV.coral, GV.coral];
/** Screen-space NOISE level meter (8 segments, green to coral) for the hook's first second. */
const NoiseMeter: React.FC<{ level: number; opacity: number; x?: number; y?: number; h?: number }> = ({ level, opacity, x = 96, y = 1018, h = 430 }) => {
  const f = useLocalFrame();
  if (opacity <= 0.01) return null;
  const n = 8;
  const pad = 14;
  const gap = 9;
  const segH = (h - pad * 2 - gap * (n - 1)) / n;
  const lit = clamp(level) * n;
  const topI = Math.max(0, Math.ceil(lit) - 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, transform: `translateX(${-(1 - opacity) * 60}px)` }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        <LitRect x={x - 48} y={y - h} w={96} h={h} r={34} fill="#13264A" />
        {Array.from({ length: n }).map((_, i) => {
          const on = lit - i > 0.5;
          const yy = y - pad - (i + 1) * segH - i * gap;
          return <rect key={i} x={x - 32} y={yy} width={64} height={segH} rx={11} fill={on ? METER_COLS[i] : "#1F3460"} opacity={on && i === topI ? 0.72 + 0.28 * Math.sin(f * 0.9) : 1} />;
        })}
        {lit > 0.5 ? <Glow cx={x} cy={y - pad - (topI + 0.5) * (segH + gap)} r={44} color={METER_COLS[topI]} intensity={0.55} /> : null}
        <text x={x} y={y + 52} textAnchor="middle" fontFamily={font("Fredoka")} fontWeight={700} fontSize={40} letterSpacing={3} fill={GV.coral}>
          NOISE
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const f = s.f;
  const block = s.hit("block");
  const noiseW = s.hit("noise");
  const more = s.hit("more");
  const ofIt = s.at("of");
  const v = variant % 3;
  const lean = -10 * smootherstep(invLerp(more + 1, more + 10, f));
  const hands = clamp(backOut(invLerp(more + 1, more + 8, f), 1.6), 0, 1.06);
  const shocked = f >= more + 1;
  const cups = cupsOf(FEET[0], FEET[1], PK, lean, bobAt(f));
  const C0 = cupsOf(FEET[0], FEET[1], PK, 0, 0).L;
  const wideAt = block + 13;
  const WIDE_K: Cam2DKey[] = [
    { f: wideAt, x: 540, y: 905, z: 0.93 },
    { f: more, x: 540, y: 898, z: 1.0 },
    { f: ofIt, x: 534, y: 892, z: 1.04 },
  ];
  const XR0 = 12;
  const XR1 = 40;
  const WIDE_X: Cam2DKey[] = [{ ...WIDE_K[0], f: XR1 }, ...WIDE_K.slice(1)];
  const xr = (t: number) => xrayCam(C0, PK, 560, 1080, 1.26 * (1 + 0.004 * (t + 6)), t);
  const base = (t: number): Cam => {
    if (v === 1)
      return cam2d(
        [
          { f: -6, x: 540, y: 906, z: 0.95 },
          { f: noiseW, x: 540, y: 902, z: 0.985 },
          { f: more, x: 540, y: 898, z: 1.02 },
          { f: ofIt, x: 534, y: 892, z: 1.05 },
        ],
        t,
      );
    if (v === 2) {
      if (t <= XR0) return xr(t);
      if (t >= XR1) return cam2d(WIDE_X, t);
      const a = xr(XR0);
      const b = cam2d(WIDE_X, XR1);
      return zoomAbout(C0, scr(C0, a), scr(C0, b), a.z, b.z, smootherstep(invLerp(XR0, XR1, t)), t);
    }
    return cam2d([{ f: -6, x: 229, y: 867, z: 2.25 }, { f: 12, x: 237, y: 866, z: 2.36 }, ...WIDE_K], t);
  };
  const cam = withKick(diveCam(base, cups.L, f, ofIt, s.dur + 4, 4.8), f, [more + 1], 8);
  // the fight: coral noise crashes in, the cups fire cyan, a clash beside the head; "more" flares it all
  const coralIn = v === 1 ? easeOut(invLerp(-10, 14, f)) : easeOut(invLerp(v === 2 ? 24 : 20, v === 2 ? 44 : 42, f));
  const reach = v === 1 ? 1 - smoothstep(invLerp(noiseW, noiseW + 10, f)) : 0;
  const cyan = v === 1 ? smoothstep(invLerp(noiseW - 2, noiseW + 6, f)) : 1;
  const clash0 = v === 1 ? smoothstep(invLerp(noiseW + 4, noiseW + 14, f)) : smoothstep(invLerp(v === 2 ? 38 : 34, v === 2 ? 48 : 46, f));
  const flare = f > more ? Math.exp(-(f - more - 1) / 9) : 0;
  const clash = clash0 * (1 + 0.9 * flare);
  const planeX = v === 1 ? PLANE_AT[0] : lerp(-380, PLANE_AT[0], easeOut(invLerp(28, 52, f)));
  const lookT = smoothstep(invLerp(wideAt + 2, wideAt + 10, f)) * (1 - 2 * smoothstep(invLerp(58, 66, f)));
  const face: PersonFace = shocked ? "shock" : v === 1 && f < noiseW + 6 ? "happy" : "neutral";
  const look: [number, number] = shocked ? [0, -0.5] : [-0.85 * lookT, 0.15];
  const xray = v === 2 ? smoothstep(invLerp(1.15, 2.2, cam.z)) : 0;
  const meterLevel = 0.3 + 0.62 * easeOut(invLerp(-4, 24, f)) + 0.05 * Math.sin(f * 0.7);
  const meterOp = v === 1 ? 0 : 1 - smoothstep(invLerp(v === 2 ? 26 : 22, v === 2 ? 36 : 32, f));
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom="#132A52" haze={[GV.teal, "#285FC3", GV.coral]} />
      <World cam={cam} depth={0.6}>
        <Skyline base={1262} />
      </World>
      <Motes cam={cam} depth={0.35} n={16} size={2.4} opacity={0.22} seed={1} />
      <World cam={cam}>
        <Ground y={FEET[1]} />
        <Plane x={planeX} y={PLANE_AT[1]} k={0.95} engineGlow={0.7} dim={0.32} />
        <Megaphone x={MEGA_AT[0]} y={MEGA_AT[1]} k={1.05} flip dim={0.3} />
        <Listener
          x={FEET[0]}
          feet={FEET[1]}
          k={PK}
          face={face}
          look={look}
          lean={lean}
          hands={hands}
          emit={cyan * (0.3 + 0.12 * Math.sin(f * 0.45)) + flare * 0.5}
          pulse={xray > 0 ? 0 : cyan * Math.max(0, Math.sin(f * 0.45)) * 0.22 + flare * 0.6}
        />
        <StreetNoise f={f} cups={cups} k={PK} coralIn={coralIn} reach={reach} cyan={cyan} clash={clash} burstAt={more + 1} />
        <CupXray c={C0} k={PK} opacity={xray}>
          <CupSection f={f} emit={1} chip={false} />
        </CupXray>
      </World>
      <Motes cam={cam} depth={1.35} n={6} size={5.5} opacity={0.15} seed={7} />
      <FlashFX at={more + 1} dur={5} max={0.22} />
      <NoiseMeter level={meterLevel} opacity={meterOp} />
      <HookTitle f={f} more={more} out={ofIt} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 microphones
// "Tiny microphones on the outside listen to every sound around you."
const MIC1: Pt = [430, 640];
const MIC2: Pt = [430, 940];
const S02: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const mics = s.hit("microphones");
  const listen = s.hit("listen");
  const around = s.hit("around");
  const you = s.at("you");
  const keys: Cam2DKey[] = [
    { f: -6, x: 540, y: 968, z: 0.97 },
    { f: mics, x: 540, y: 960, z: 1.02 },
    { f: around, x: 530, y: 950, z: 1.08 },
    { f: you, x: 518, y: 920, z: 1.13 },
  ];
  const cam = diveCam((t) => cam2d(keys, t), MIC1, f, you, s.dur + 4, 5.6);
  const lit = clamp((f - mics) / 6);
  const aroundIn = easeOut(invLerp(around - 8, around + 10, f));
  const skin = GV.skin[0];
  const HC: Pt = [690, 790];
  const HR = 430;
  // smooth sound lines of different wavelengths, arriving from behind (left), from above and from below
  const behind1: Fn = (x) => Math.sin((TAU * x) / 210 - f * 0.22) * (0.85 + 0.15 * Math.sin((TAU * x) / 560 - f * 0.05));
  const behind2: Fn = (x) => Math.sin((TAU * x) / 150 - f * 0.27 + 1.1);
  const above = sampleP(bez2([530, -80], [478, 420], [MIC1[0] + 8, MIC1[1] - 46]), 30);
  const below = sampleP(bez2([-40, 1480], [260, 1180], [MIC2[0] - 8, MIC2[1] + 46]), 30);
  // short wave trains (packets) that fly in and sink into the microphones, so they read as sound arriving, not wires
  const packets = (t0: number, per: number) =>
    [0, 0.5].map((o) => {
      const t = ((((f - t0) / per + o) % 1) + 1) % 1;
      return { from: lerp(-0.45, 1, t), to: lerp(0, 1.45, t) };
    });
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom={GV.indigo} haze={[GV.teal, "#285FC3", GV.violet]} />
      <World cam={cam} depth={0.35}>
        <Bokeh seed={5} />
      </World>
      <Motes cam={cam} depth={0.3} n={14} size={2.4} opacity={0.2} seed={3} />
      <World cam={cam}>
        {/* the listener in profile (facing right): shoulder, neck, head, hair, eye */}
        <LitPath d={rrectPath(110, 1310, 1100, 900, 330)} fill={GV.tangerine} off={26} />
        <LitPath d={rrectPath(545, 1060, 270, 360, 70)} fill={shadowOf(skin, 0.16)} off={18} rim={false} />
        <LitCircle cx={HC[0]} cy={HC[1]} r={HR} fill={skin} />
        <path d={hairCap(HC[0], HC[1], HR, 140, 322, 280)} fill={LISTENER.hair} />
        <circle cx={942} cy={884} r={40} fill={GV.coral} opacity={0.16} />
        <ellipse cx={952} cy={742} rx={13} ry={21} fill={GV.navy} />
        <path d="M924 690 L982 682" stroke={GV.navy} strokeWidth={9} strokeLinecap="round" />
        {/* the band over the head */}
        <path d="M572 486 Q612 246 892 66" fill="none" stroke={shadowOf(BAND, 0.3)} strokeWidth={30} strokeLinecap="round" transform="translate(14 12)" />
        <path d="M560 480 Q600 240 880 60" fill="none" stroke={BAND} strokeWidth={66} strokeLinecap="round" />
        {/* the ear cup's outer face */}
        <LitPath d={rrectPath(345, 490, 430, 600, 200)} fill={SHELL} off={26} />
        <LitPath d={rrectPath(410, 570, 300, 440, 140)} fill={lightOf(SHELL, 0.2)} off={16} rim={false} />
        <circle cx={570} cy={790} r={64} fill={shadowOf(SHELL, 0.12)} />
        {/* every sound around: from behind, then from above and below too */}
        <WaveLine x0={-60} x1={MIC1[0] - 50} y={MIC1[1]} fn={behind1} amp={40} color={NOISE} width={12} />
        <WaveLine x0={-60} x1={MIC2[0] - 50} y={MIC2[1]} fn={behind2} amp={32} color={NOISE} width={11} />
        {aroundIn > 0.01 ? (
          <>
            {packets(around - 8, 34).map((p, i) => (
              <PathWave key={`a${i}`} pts={above} fn={(q) => Math.sin((TAU * q) / 122 - f * 0.36)} amp={28} color={NOISE} width={12} from={Math.max(0, p.from)} to={Math.min(1, p.to)} soft={60} opacity={aroundIn} />
            ))}
            {packets(around - 4, 40).map((p, i) => (
              <PathWave key={`b${i}`} pts={below} fn={(q) => Math.sin((TAU * q) / 172 - f * 0.28 + 0.7)} amp={30} color={NOISE} width={12} from={Math.max(0, p.from)} to={Math.min(1, p.to)} soft={70} opacity={aroundIn} />
            ))}
          </>
        ) : null}
        {[MIC1, MIC2].map(([mx, my], i) => (
          <g key={i}>
            <MicGrille x={mx} y={my} r={40} lit={lit} />
            {f >= listen
              ? [0, 1, 2].map((r) => {
                  const t = ((((f - listen) * 0.035 + r / 3) % 1) + 1) % 1;
                  return <circle key={r} cx={mx} cy={my} r={50 + t * 90} fill="none" stroke={GV.gold} strokeWidth={7} opacity={0.75 * (1 - t)} />;
                })
              : null}
          </g>
        ))}
        <Callout at={mics} x={205} y={382} text="Microphone" to={[MIC1[0] - 30, MIC1[1] - 30]} color={GV.gold} size={44} />
      </World>
      <Motes cam={cam} depth={1.4} n={5} size={6} opacity={0.14} seed={9} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 chip + speaker
// "A chip takes that sound wave and flips it upside down." / "Then the speaker plays the flipped wave straight into your ear."
// The microphone's coral signal runs along the top; the chip takes a copy of it down onto its red top pins, turns it
// over (a half-turn: peaks become valleys) and it leaves the cyan bottom pins as the exact mirror (every coral peak sits
// over a cyan valley at the same x); then it runs on to the speaker, which plays it into the ear.
const MIC_IN: Pt = [150, 330];
const CHIP_C: Pt = [540, 725];
const CHIP_K = 1.2;
const TOP = 330;
const FLIP_Y = 452;
const BOT = 965;
const SEG: [number, number] = [330, 750];
const A3 = 60;
const sig3 = (f: number): Fn => (x) => {
  const u = (TAU * x) / 300 - f * 0.09;
  return 0.72 * Math.sin(u) + 0.34 * Math.sin(2 * u + 1.1);
};

const S03: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const chip = s.hit("chip");
  const takes = s.hit("takes");
  const flips = s.hit("flips");
  const upside = s.hit("upside");
  const down = s.hit("down");
  const then = s.hit("Then");
  const speaker = s.hit("speaker");
  const plays = s.hit("plays");
  const ear = s.hit("ear");
  const cam = cam2d(
    [
      { f: -6, x: 540, y: 930, z: 0.93 },
      { f: chip, x: 540, y: 925, z: 0.97 },
      { f: takes + 6, x: 540, y: 918, z: 1.0 },
      { f: flips, x: 540, y: 905, z: 1.04 },
      { f: down, x: 540, y: 900, z: 1.07 },
      { f: then, x: 540, y: 800, z: 1.42 },
      { f: speaker + 2, x: 1240, y: 1120, z: 1.12 },
      { f: plays + 6, x: 1420, y: 1130, z: 1.1 },
      { f: ear, x: 1570, y: 1140, z: 1.12 },
      { f: s.dur + 10, x: 1650, y: 1120, z: 1.38 },
    ],
    f,
  );
  const n = sig3(f);
  const drop = easeOut(invLerp(takes, takes + 10, f));
  const theta = Math.PI * smootherstep(invLerp(flips, flips + 15, f));
  const turning = theta > 0.02 && theta < Math.PI - 0.02 ? Math.sin(theta) : 0;
  const ct = Math.cos(theta);
  const sink = smoothstep(invLerp(upside, upside + 9, f));
  const out = easeOut(invLerp(upside + 3, down + 6, f));
  const segY = lerp(TOP, FLIP_Y, drop) + sink * 150;
  const segCol = mixC(NOISE, ANTI, smoothstep(clamp((1 - ct) / 2)));
  const edgeOn = theta > 0 && theta < Math.PI ? clamp(1 - Math.abs(ct) / 0.3) : 0;
  // the coral peaks (screen-up = most negative signal) for the alignment guides
  const peaks: number[] = [];
  for (let x = 236; x < 950; x += 3) {
    const a = n(x - 3);
    const b = n(x);
    const c = n(x + 3);
    if (b < a && b <= c && b < -0.55) peaks.push(x);
  }
  const guide = smoothstep(invLerp(down - 4, down + 4, f)) * (1 - smoothstep(invLerp(speaker - 6, speaker + 2, f)));
  const pinX = [-78, -39, 0, 39, 78].map((o) => CHIP_C[0] + o * CHIP_K);
  const pinTop = CHIP_C[1] - 150 * CHIP_K;
  const pinBot = CHIP_C[1] + 150 * CHIP_K;
  const feedIn = drop >= 1 && theta < 0.2 ? 1 : 0;
  const spk = f >= speaker - 4 ? Math.max(0, n(1240)) : 0;
  const toEar = easeOut(invLerp(speaker - 2, plays + 8, f));
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.indigo} bottom={GV.plum} haze={[GV.violet, "#285FC3", GV.teal]} />
      <World cam={cam} depth={0.45}>
        <Circuit />
      </World>
      <Motes cam={cam} depth={0.3} n={14} size={2.2} opacity={0.2} seed={4} color={GV.cyan} />
      <World cam={cam}>
        {/* alignment guides: every coral peak above sits over a cyan valley below, at the same x (behind the chip) */}
        {guide > 0.01
          ? peaks.map((x) => (
              <g key={Math.round(x / 30)} opacity={guide}>
                <line x1={x} y1={TOP + n(x) * A3 - 14} x2={x} y2={BOT - n(x) * A3 + 14} stroke={GV.cream} strokeWidth={5} strokeDasharray="6 16" strokeLinecap="round" />
                <circle cx={x} cy={TOP + n(x) * A3} r={14} fill={NOISE} />
                <circle cx={x} cy={BOT - n(x) * A3} r={14} fill={ANTI} />
              </g>
            ))
          : null}
        {/* in: the microphone's signal (coral) across the top */}
        <MicGrille x={MIC_IN[0]} y={MIC_IN[1]} r={58} lit={1} />
        <WaveLine x0={212} x1={960} y={TOP} fn={n} amp={A3} color={NOISE} width={13} soft={60} />
        {/* the chip reads it through its top pins */}
        {feedIn
          ? pinX.map((px, i) => {
              const t = ((f * 0.06 + i * 0.2) % 1 + 1) % 1;
              return <circle key={i} cx={px} cy={lerp(FLIP_Y + 40, pinTop + 8, t)} r={8} fill={NOISE} opacity={0.9 * (1 - t * 0.6)} />;
            })
          : null}
        <Chip x={CHIP_C[0]} y={CHIP_C[1]} k={CHIP_K} busy={f >= chip ? 1 : 0.3} inGlow={drop} outGlow={out} />
        {/* the copy turns over above the chip (a card flip about its centre line), then sinks into it */}
        {drop > 0 && sink < 1 ? <WaveLine x0={SEG[0]} x1={SEG[1]} y={segY} fn={(x) => ct * n(x)} amp={A3} color={segCol} width={13} soft={50} opacity={1 - sink} /> : null}
        {edgeOn > 0.01 ? <line x1={SEG[0] + 30} y1={segY} x2={SEG[1] - 30} y2={segY} stroke={GV.white} strokeWidth={8} strokeLinecap="round" opacity={edgeOn} /> : null}
        {edgeOn > 0.01 ? <Glow cx={CHIP_C[0]} cy={segY} r={70} color={ANTI} intensity={edgeOn * 0.7} /> : null}
        {turning > 0.02
          ? [-1, 1].map((sd) => {
              const ax = sd < 0 ? SEG[0] - 40 : SEG[1] + 40;
              return (
                <g key={sd} opacity={Math.min(1, turning * 1.6)} fill="none" stroke={GV.cream} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
                  <path d={`M${ax} ${segY - 66} A20 66 0 1 ${sd < 0 ? 0 : 1} ${ax} ${segY + 66}`} />
                  <path d={`M${ax - 18} ${segY + 52} L${ax} ${segY + 66} L${ax + 12} ${segY + 46}`} />
                </g>
              );
            })
          : null}
        {/* out: the exact mirror leaves the bottom pins and runs on to the speaker */}
        {out > 0
          ? pinX.map((px, i) => {
              const t = ((f * 0.07 + i * 0.2) % 1 + 1) % 1;
              return <circle key={i} cx={px} cy={lerp(pinBot - 8, BOT - 30, t)} r={7} fill={ANTI} opacity={0.85 * (1 - t) * (1 - guide * 0.5)} />;
            })
          : null}
        {out > 0 ? <WaveLine x0={lerp(SEG[0], 212, out)} x1={lerp(SEG[1], 1150, out)} y={BOT} fn={(x) => -n(x)} amp={A3} color={ANTI} width={13} soft={60} /> : null}
        <Speaker x={1240} y={BOT} k={1.25} push={spk} />
        {toEar > 0 ? <WaveLine x0={1345} x1={lerp(1350, 1612, toEar)} y={BOT} fn={(x) => -n(x)} amp={56} color={ANTI} width={13} soft={40} /> : null}
        <LitCircle cx={1960} cy={935} r={440} fill={GV.skin[0]} />
        <path d={hairCap(1960, 935, 440, 196, 330, 250)} fill={LISTENER.hair} />
        <Ear x={1720} y={BOT} k={1.9} />
        <Callout at={chip} out={flips + 14} x={190} y={CHIP_C[1]} text="Chip" color={ANTI} size={52} />
        <Callout at={speaker} out={ear - 6} x={1240} y={770} text="Speaker" to={[1240, 850]} color={GV.cream} size={50} />
      </World>
      <Motes cam={cam} depth={1.3} n={6} size={5.5} opacity={0.14} seed={5} color={GV.cyan} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 cancel
// "Peak meets valley, the two waves cancel, and you hear almost nothing."
// Coral over cyan in opposite phase; they slide together while the listener rises into place, so the sum (a flat white
// line, the brightest thing on screen) runs into his cups; he exhales with closed eyes.
const S04: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const peak = s.hit("Peak");
  const two = s.hit("two");
  const cancel = s.hit("cancel");
  const hear = s.hit("hear");
  const almost = s.hit("almost");
  const K = 3.6;
  const LINE = 690;
  const feet = LINE - 4 * K + 191.4 * K;
  const m = smootherstep(invLerp(two - 2, cancel - 1, f));
  const fade = smootherstep(invLerp(cancel - 3, cancel + 3, f));
  const yT = lerp(LINE - 250, LINE, m);
  const yB = lerp(LINE + 250, LINE, m);
  const amp = 105 * (1 - fade);
  const WL = 330;
  const ph = f * 0.07;
  const w: Fn = (x) => Math.sin((TAU * x) / WL - ph);
  const rise = smootherstep(invLerp(two - 4, cancel, f));
  const lift = (1 - rise) * 1150;
  const exhale = smoothstep(invLerp(almost, almost + 10, f));
  const street = smoothstep(invLerp(two, cancel + 6, f));
  const cam = withKick(
    cam2d(
      [
        { f: -6, x: 540, y: 960, z: 0.98 },
        { f: cancel, x: 540, y: 950, z: 1.03 },
        { f: almost, x: 540, y: 885, z: 1.12 },
        { f: s.dur + 10, x: 540, y: 868, z: 1.18 },
      ],
      f,
    ),
    f,
    [cancel + 1],
    7,
  );
  const cups = cupsOf(540, feet, K, 0, bobAt(f));
  const peaks: number[] = [];
  for (let k = -1; k < 6; k++) {
    const x = ((Math.PI / 2 + ph + TAU * k) * WL) / TAU;
    if (x > 70 && x < 1010) peaks.push(x);
  }
  const g = clamp((f - peak) / 8) * (1 - smoothstep(invLerp(two - 4, two + 8, f)));
  const face: PersonFace = f < cancel + 1 ? "wince" : "relief";
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom="#132A52" haze={[GV.teal, "#285FC3", GV.violet]} />
      {street > 0 ? (
        <AbsoluteFill style={{ opacity: street }}>
          <World cam={cam} depth={0.6}>
            <Skyline base={feet - 200} />
          </World>
        </AbsoluteFill>
      ) : null}
      <Motes cam={cam} depth={0.35} n={16} size={2.4} opacity={0.2} seed={11} />
      <World cam={cam}>
        {street > 0 ? (
          <g opacity={street}>
            <Ground y={feet} />
          </g>
        ) : null}
        {/* peak meets valley: every coral peak sits over a cyan valley */}
        {g > 0
          ? peaks.map((x) => (
              <g key={Math.round(x / 40)} opacity={g}>
                <line x1={x} y1={yT - amp + 20} x2={x} y2={yB + amp - 20} stroke={GV.cream} strokeWidth={5} strokeDasharray="6 16" strokeLinecap="round" />
                <circle cx={x} cy={yT - amp} r={15} fill={NOISE} />
                <circle cx={x} cy={yB + amp} r={15} fill={ANTI} />
              </g>
            ))
          : null}
        {fade < 1 ? (
          <>
            <WaveLine x0={-60} x1={1140} y={yT} fn={(x) => -w(x)} amp={amp} color={NOISE} width={14} opacity={1 - fade} />
            <WaveLine x0={-60} x1={1140} y={yB} fn={w} amp={amp} color={ANTI} width={14} opacity={1 - fade} />
          </>
        ) : null}
        {/* the sum: one bright, flat line that runs into both cups (the head and cups are in front of it) */}
        {fade > 0 ? <WaveLine x0={-60} x1={1140} y={LINE} fn={(x) => Math.sin(x * 0.045 + f * 0.25) * 0.5} amp={5} color={QUIET} width={16} glow={2.4} opacity={fade} /> : null}
        {rise > 0 ? (
          <g transform={`translate(0 ${lift})`}>
            <Listener x={540} feet={feet + exhale * 6} k={K} face={face} arm={lerp(14, 21, exhale)} />
            <Puffs at={almost} x={566} y={headY(feet, K) + 26 * K} k={K} />
          </g>
        ) : null}
        {[-1, 1].map((sd) => (
          <Blast key={sd} at={cancel + 1} x={(sd < 0 ? cups.L : cups.R)[0] + sd * 17 * K} y={LINE} dir={sd} r0={20} r1={560} width={20} color={QUIET} />
        ))}
      </World>
      <Motes cam={cam} depth={1.35} n={6} size={5.5} opacity={0.14} seed={13} />
      <FlashFX at={cancel - 1} dur={4} max={0.3} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 the catch
// "But there's a catch." / "It works best on steady, low sounds, like the hum of a plane engine."
const Engine: React.FC<{ f: number }> = ({ f }) => {
  const nac = "#BAC5DC";
  return (
    <g>
      {/* fuselage along the top edge (foreground framing) */}
      <path d="M-1150 -760 L1150 -820 L1150 -560 L-1150 -500 Z" fill="#7F8DAE" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={-900 + i * 220} y={-700 - i * 5.4} width={74} height={56} rx={22} fill="#1C2A52" />
      ))}
      {/* wing */}
      <LitPath d="M-1100 -300 L1100 -410 L1100 -282 L-1100 -168 Z" fill="#33467A" off={14} />
      {/* pylon */}
      <LitPath d="M-150 -246 L70 -268 L130 -150 L-130 -150 Z" fill="#7C89A8" off={10} />
      {/* nacelle */}
      <LitPath d={rrectPath(-420, -165, 840, 330, 165)} fill={nac} off={26} />
      <path d="M-196 -158 Q-212 0 -196 158" stroke={shadowOf(nac, 0.25)} strokeWidth={7} fill="none" />
      <path d="M150 -163 Q138 0 150 163" stroke={shadowOf(nac, 0.25)} strokeWidth={7} fill="none" />
      {/* exhaust */}
      <path d="M396 -112 L540 -44 Q556 0 540 44 L396 112 Z" fill="#5A6684" />
      <Glow cx={552} cy={0} r={42} color={NOISE} intensity={0.85} pulse={0.1} />
      {/* intake with the spinning fan */}
      <ellipse cx={-394} cy={0} rx={88} ry={168} fill={lightOf(nac, 0.3)} />
      <ellipse cx={-388} cy={0} rx={74} ry={150} fill="#0E1A33" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * TAU + f * 0.32;
        return <path key={i} d={`M-386 0 L${-386 + Math.cos(a) * 60} ${Math.sin(a) * 130}`} stroke="#34507F" strokeWidth={16} strokeLinecap="round" />;
      })}
      <ellipse cx={-384} cy={0} rx={18} ry={34} fill={GV.cream} />
    </g>
  );
};

const S05: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const catchAt = s.hit("catch");
  const works = s.hit("works");
  const steady = s.hit("steady");
  const low = s.hit("low");
  const hum = s.hit("hum");
  const K = 4.6;
  const HC: Pt = [540, 2050];
  const feet = HC[1] + 191.4 * K;
  const cam = withKick(
    cam2d(
      [
        { f: -6, x: 540, y: 2182, z: 1.0 },
        { f: works - 4, x: 540, y: 2165, z: 1.05 },
        { f: steady + 2, x: 548, y: 770, z: 1.02 },
        { f: hum, x: 540, y: 762, z: 1.06 },
        { f: s.dur + 10, x: 536, y: 758, z: 1.1 },
      ],
      f,
    ),
    f,
    [catchAt + 1],
    7,
  );
  const cups = cupsOf(HC[0], feet, K, 0, bobAt(f));
  const lE = cups.L[0] - 17 * K;
  const rE = cups.R[0] + 17 * K;
  const twFront = lerp(-60, lE, smootherstep(invLerp(catchAt - 2, catchAt + 9, f)));
  const twAmp = f >= catchAt - 2 ? Math.exp(-Math.max(0, f - catchAt - 9) / 6) : 0;
  const spike: Fn = (x) => Math.exp(-Math.pow((x - twFront) / 34, 2)) * Math.sin((x - twFront) * 0.22) * 1.6;
  const face: PersonFace = f < catchAt + 1 ? "relief" : "alert";
  const hn = humFn(f, 400, 0.06);
  const HUM_Y = 790;
  const draw = easeOut(invLerp(steady - 4, steady + 14, f));
  const front = lerp(-60, 1140, smootherstep(invLerp(low, hum - 2, f)));
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.indigo} bottom={GV.field[1]} haze={[GV.violet, "#285FC3", GV.teal]} />
      <World cam={cam} depth={0.5}>
        <Bokeh seed={8} n={8} y0={-200} y1={1500} colors={["#2C4A8A", GV.violet, GV.teal]} />
      </World>
      <World cam={cam} depth={0.6}>
        <Skyline base={2221} hs={2} />
      </World>
      <Motes cam={cam} depth={0.35} n={16} size={2.4} opacity={0.2} seed={13} />
      <World cam={cam}>
        <Ground y={feet} />
        {/* up in the sky: the engine and its steady, low hum */}
        <g transform={`translate(540 436) scale(${1 / 1.45})`}>
          <Engine f={f} />
        </g>
        {[0, 1, 2].map((r) => {
          const t = ((f * 0.02 + r / 3) % 1 + 1) % 1;
          return <path key={r} d={arcD(540, 400, 170 + t * 170, 90, 52)} fill="none" stroke={NOISE} strokeWidth={9} strokeLinecap="round" opacity={0.5 * (1 - t) * draw} />;
        })}
        {draw > 0.01 ? <WaveLine x0={Math.max(-60, front)} x1={lerp(-60, 1140, draw)} y={HUM_Y} fn={hn} amp={64} color={NOISE} width={14} /> : null}
        {front > -55 ? <WaveLine x0={-60} x1={Math.min(1140, front)} y={HUM_Y} fn={(x) => hn(x) * 0.03} amp={64} color={QUIET} width={13} soft={30} glow={1.8} /> : null}
        {front > -40 && front < 1120 ? (
          <>
            <WaveLine x0={Math.max(-60, front - 240)} x1={Math.min(1140, front + 50)} y={HUM_Y} fn={(x) => -hn(x)} amp={64} color={ANTI} width={11} soft={60} />
            <Glow cx={front} cy={HUM_Y} r={26} color={ANTI} intensity={0.9} />
          </>
        ) : null}
        <Tick at={hum} x={170} y={662} r={54} />
        {/* down on the street: the listener close up, the silent line running into his cups */}
        <WaveLine x0={-60} x1={lE - 2} y={cups.L[1]} fn={spike} amp={60 * twAmp} color={QUIET} width={12} glow={1.6} soft={20} />
        <WaveLine x0={rE + 2} x1={1140} y={cups.R[1]} fn={() => 0} amp={0} color={QUIET} width={12} glow={1.6} soft={20} />
        <Listener x={HC[0]} feet={feet} k={K} face={face} look={[-0.9, 0.25]} arm={12} />
        <RiseText at={catchAt + 1} x={300} y={HC[1] - 330} text="!" size={190} color={GV.coral} out={works + 4} />
      </World>
      <Motes cam={cam} depth={1.35} n={6} size={5.5} opacity={0.14} seed={17} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 why
// "You see, a steady hum repeats, so the chip can keep matching it." / "A sudden voice changes too fast, and slips right through."
// Up in the sky, the hero diagram: the plane's slow coral hum on top, the chip's cyan copy below snapping into lockstep
// one cycle at a time, and between them the white sum (what you hear) going flat. Then a tilt down to the street: a
// friend shouts HEY!, a jagged gold wave races into the listener's cup, the cups' slow cyan can't follow, and he winces.
const SKY = { coral: 520, sum: 745, cyan: 970 };
const HUM_WL = 260;
const LOCK_X0 = 190;
const S06: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const repeats = s.hit("repeats");
  const so = s.hit("so");
  const can = s.hit("can");
  const matching = s.hit("matching");
  const itW = s.hit("it");
  const sudden = s.hit("sudden");
  const voice = s.hit("voice");
  const fast = s.hit("fast");
  const slips = s.hit("slips");
  const through = s.at("through");
  const LX = 640;
  const LK = 2.8;
  const LH = 2300;
  const lfeet = LH + 191.4 * LK;
  const leanAt = (t: number) => 5 * smoothstep(invLerp(slips + 1, slips + 8, t));
  const lean = leanAt(f);
  const keys: Cam2DKey[] = [
    { f: -6, x: 540, y: 975, z: 0.97 },
    { f: repeats, x: 540, y: 975, z: 1.02 },
    { f: matching, x: 525, y: 980, z: 1.08 },
    { f: itW + 4, x: 470, y: 965, z: 1.2 },
    { f: sudden + 6, x: 620, y: 2400, z: 1.4 },
    { f: fast, x: 628, y: 2396, z: 1.5 },
    { f: slips + 4, x: 663, y: 2391, z: 1.75 },
    { f: through, x: 672, y: 2390, z: 1.82 },
  ];
  const base = (t: number): Cam => {
    const c = cam2d(keys, t);
    return { ...c, x: c.x + Math.sin((leanAt(t) * Math.PI) / 180) * 191.4 * LK };
  };
  const cups = cupsOf(LX, lfeet, LK, lean, bobAt(f));
  const cam = withKick(diveCam(base, cups.L, f, through, s.dur + 4, 5.2), f, [slips + 2], 8);
  // --- the diagram: hum, the chip's copy locking on cycle by cycle, the sum going flat
  const hum: Fn = (x) => Math.sin((TAU * x) / HUM_WL - f * 0.06);
  const steps = [repeats, so, can, matching];
  const lockK = steps.map((a) => clamp(backOut(invLerp(a, a + 8, f), 1.5), 0, 1.1));
  const X = (k: number) => LOCK_X0 + k * HUM_WL;
  const lockAt = (x: number) => {
    let v = 0;
    for (let k = 0; k < 4; k++) v += clamp(lockK[k]) * (k === 0 ? 1 : smoothstep(clamp((x - X(k) + 18) / 36))) * smoothstep(clamp((X(k + 1) + 18 - x) / 36));
    return clamp(v);
  };
  const sumPulse = smoothstep(invLerp(itW, itW + 6, f)) * (1 - smoothstep(invLerp(itW + 10, itW + 22, f)));
  // --- the street: the friend, the HEY!, the gold voice and the cups' too-slow cyan
  const friendIn = easeOut(invLerp(sudden - 6, sudden + 8, f));
  const fx = 263 - (1 - friendIn) * 240;
  const E: Pt = [cups.L[0] - 17 * LK - 2, cups.L[1]];
  const gold = sampleP(bez2([520, 2030], [432, 2118], [E[0] + 6, cups.L[1] - 50]), 40);
  const gIn = easeOut(invLerp(voice, voice + 20, f));
  const gfn = (q: number) => 0.6 * Math.sin((TAU * q) / 52 - f * 0.6) * (0.6 + 0.4 * Math.sin((TAU * q) / 170 - f * 0.15)) + 0.34 * Math.sin((TAU * q) / 31 - f * 0.9 + 2);
  const goldOut = 1 - smoothstep(invLerp(through - 2, through + 8, f));
  const cyanTry = smoothstep(invLerp(sudden, sudden + 10, f)) * (1 - smoothstep(invLerp(slips + 6, slips + 16, f)));
  const slipped = f >= slips + 1 ? Math.max(0, 1 - (f - slips - 1) / 18) : 0;
  const face: PersonFace = f >= slips + 1 ? "wince" : f >= voice + 2 ? "alert" : "happy";
  const handL = clamp(backOut(invLerp(slips + 2, slips + 9, f), 1.5), 0, 1.06);
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom="#132A52" haze={[GV.teal, "#285FC3", GV.coral]} />
      <World cam={cam} depth={0.6}>
        <Skyline base={2071} />
      </World>
      <Motes cam={cam} depth={0.35} n={16} size={2.4} opacity={0.2} seed={21} />
      <World cam={cam}>
        {/* the sky diagram */}
        <Plane x={150} y={300} k={0.62} engineGlow={0.9} dim={0.3} />
        {[0, 1, 2].map((r) => {
          const t = ((f * 0.03 + r / 3) % 1 + 1) % 1;
          return <path key={r} d={arcD(115, 330, 40 + t * 110, 90, 48)} fill="none" stroke={NOISE} strokeWidth={7} strokeLinecap="round" opacity={0.55 * (1 - t)} />;
        })}
        <WaveLine x0={-60} x1={1140} y={SKY.coral} fn={hum} amp={80} color={NOISE} width={14} />
        <WaveLine x0={-60} x1={1140} y={SKY.sum} fn={(x) => hum(x) * (1 - lockAt(x))} amp={80} color={QUIET} width={13} glow={1.2 + 1.2 * clamp(lockK[3]) + sumPulse * 1.4} soft={20} />
        <Chip x={105} y={SKY.cyan} k={0.42} busy={1} outGlow={clamp(lockK[0] * 2)} />
        {lockK.map((lk, k) =>
          lk > 0.01 ? (
            <WaveLine key={k} x0={X(k)} x1={X(k + 1)} y={SKY.cyan + (1 - lk) * 80} fn={(x) => -hum(x)} amp={80} color={ANTI} width={13} soft={k === 0 ? 30 : 0} softR={0} opacity={clamp(lk * 3)} />
          ) : null,
        )}
        {lockK.map((lk, k) =>
          lk > 0.9 ? (
            <g key={`c${k}`} transform={`translate(${X(k) + HUM_WL / 2} ${SKY.sum + 56}) scale(${clamp(lk)})`}>
              <path d="M-17 1 L-5 13 L19 -13" fill="none" stroke={ANTI} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : null,
        )}
        <Callout at={matching} x={270} y={638} text="Locked on" color={ANTI} size={46} out={sudden} />
        {/* down on the street */}
        <Ground y={lfeet} />
        <Person spec={{ ...FRIEND, scale: 2.3 }} x={fx} y={2600} face="shout" look={[0.9, -0.2]} seed={4} armL={160 + 10 * Math.sin(f * 0.55)} armR={-18} />
        <Listener x={LX} feet={lfeet} k={LK} face={face} look={[-0.9, -0.45]} lean={lean} handL={handL} arm={12} emit={cyanTry * 0.3} />
        {cyanTry > 0.01 ? (
          <>
            <Fronts x={E[0]} y={E[1]} dir={-1} r0={8} r1={70} n={2} speed={0.035} width={9} k={cyanTry * 0.8} spread={55} />
            <PathWave pts={gold} fn={(q) => Math.sin((TAU * q) / 120 - f * 0.12)} amp={20} color={ANTI} width={10} from={0.74 - 0.08 * cyanTry} to={1} soft={30} opacity={0.9 * cyanTry} shift={34} />
          </>
        ) : null}
        {gIn > 0.01 && goldOut > 0.01 ? <PathWave pts={gold} fn={gfn} amp={34} color={VOICE} width={15} to={gIn} soft={34} opacity={goldOut} /> : null}
        <SpeechBubble at={sudden + 2} x={449} y={1950} text="HEY!" w={300} h={168} out={slips + 4} tail={[-70, 62, -46]} />
        {slipped > 0 ? (
          <>
            <Glow cx={cups.L[0]} cy={cups.L[1]} r={58} color={VOICE} intensity={slipped} />
            <path d={sparkD(cups.L[0] - 40, cups.L[1] - 70, 26 * slipped)} fill={GV.cream} opacity={slipped} />
            <path d={sparkD(cups.L[0] - 60, cups.L[1] + 50, 18 * slipped)} fill={GV.cream} opacity={slipped} />
          </>
        ) : null}
      </World>
      <Motes cam={cam} depth={1.35} n={6} size={5.5} opacity={0.14} seed={23} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 padding + payoff
// "That's why the padding matters. It blocks the high sounds the chip can't." / "So the silence you paid for is really two noises fighting."
const S07: React.FC = () => {
  const s = useShot();
  const f = s.f;
  const padding = s.hit("padding");
  const blocks = s.hit("blocks");
  const chipW = s.hit("chip");
  const cant = s.end("can't");
  const so = s.hit("So");
  const silence = s.hit("silence");
  const two = s.hit("two");
  const fighting = s.hit("fighting");
  const C0 = cupsOf(FEET[0], FEET[1], PK, 0, 0).L;
  const pull0 = cant - 2;
  const pull1 = so + 2;
  const secKeys: Cam2DKey[] = [
    { f: -6, x: 540, y: 1080, z: 1.18 },
    { f: padding, x: 560, y: 760, z: 1.26 },
    { f: blocks + 6, x: 520, y: 1000, z: 1.24 },
    { f: chipW - 4, x: 430, y: 1040, z: 1.3 },
    { f: pull0, x: 420, y: 1045, z: 1.33 },
  ];
  const secCam = (t: number): Cam => {
    const k = cam2d(secKeys, t);
    return xrayCam(C0, PK, k.x, k.y, k.z, t);
  };
  const WIDE7: Cam2DKey[] = [
    { f: pull1, x: 540, y: 905, z: 0.93 },
    { f: fighting, x: 540, y: 896, z: 1.0 },
    { f: s.dur + 10, x: 540, y: 890, z: 1.05 },
  ];
  let camRaw: Cam;
  if (f <= pull0) camRaw = secCam(f);
  else if (f >= pull1) camRaw = cam2d(WIDE7, f);
  else {
    const a = secCam(pull0);
    const b = cam2d(WIDE7, pull1);
    camRaw = zoomAbout(C0, scr(C0, a), scr(C0, b), a.z, b.z, smootherstep(invLerp(pull0, pull1, f)), f);
  }
  const cam = withKick(camRaw, f, [fighting + 1], 8);
  const secOp = smoothstep(invLerp(1.15, 2.2, cam.z));
  const showStreet = cam.z < 10.4;
  const cups = cupsOf(FEET[0], FEET[1], PK, 0, bobAt(f));
  const coralIn = easeOut(invLerp(pull1 - 16, pull1 + 6, f));
  const flare = f > fighting ? Math.exp(-(f - fighting - 1) / 9) : 0;
  const clash = smoothstep(invLerp(pull1 - 6, silence + 6, f)) * (0.85 + 0.3 * smoothstep(invLerp(two - 2, two + 8, f)) + 0.9 * flare);
  const calm = smootherstep(invLerp(fighting + 4, fighting + 20, f));
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom="#132A52" haze={[GV.teal, "#285FC3", GV.coral]} />
      {showStreet ? (
        <World cam={cam} depth={0.6}>
          <Skyline base={1262} />
        </World>
      ) : null}
      <Motes cam={cam} depth={0.35} n={16} size={2.4} opacity={0.2} seed={31} />
      <World cam={cam}>
        {showStreet ? (
          <>
            <Ground y={FEET[1]} />
            <Plane x={PLANE_AT[0]} y={PLANE_AT[1]} k={0.95} engineGlow={0.7} dim={0.32} />
            <Megaphone x={MEGA_AT[0]} y={MEGA_AT[1]} k={1.05} flip dim={0.3} />
            <Listener x={FEET[0]} feet={FEET[1]} k={PK} face={f >= silence ? "happy" : "relief"} arm={18} emit={0.3 * (1 - calm)} />
            {f > pull0 ? <StreetNoise f={f} cups={cups} k={PK} coralIn={coralIn} cyan={smoothstep(invLerp(pull1 - 6, pull1 + 4, f))} clash={clash} calm={calm} burstAt={fighting + 1} /> : null}
          </>
        ) : null}
        {/* the cross-section lives inside the left cup, masked by the cup's own outline: the pull-back shrinks it into the cup */}
        <CupXray c={C0} k={PK} opacity={secOp}>
          <CupSection f={f} padAt={padding} blockAt={blocks} xAt={chipW + 6} out={pull0} />
        </CupXray>
      </World>
      <Motes cam={cam} depth={1.35} n={6} size={5.5} opacity={0.14} seed={37} />
      <FlashFX at={fighting + 1} dur={5} max={0.22} />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background={GV.field[0]} overlay={<CaptionPill />} scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
