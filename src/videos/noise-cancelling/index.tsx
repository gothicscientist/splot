// scenes: hand-written
// "How noise-cancelling headphones work" - Glowvector (glow-lit flat vector) x How it works.
// One colour per idea for the whole film: CORAL = outside noise, CYAN = the anti-noise the headphones make,
// GOLD = a sudden voice, WHITE = what you hear. Every event is keyed to its spoken word through useShot().
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { backOut, clamp, invLerp, lerp, smoothstep, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import { Callout, Field, GV, Glow, LitCircle, LitPath, LitRect, Mascot, Person, RiseText, Shockwave, World, cam2d, circlePath, lightOf, mixC, rrectPath, shadowOf, usePop } from "../../styles/glowvector/kit";
import type { Cam2DKey } from "../../styles/glowvector/kit";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const TAU = Math.PI * 2;
const NOISE = GV.coral;
const ANTI = GV.cyan;
const VOICE = GV.gold;
const QUIET = GV.white;
const SHELL = "#6C55E0"; // the headphones
const LISTENER = { skin: GV.skin[0], shirt: GV.tangerine, pants: GV.navy, hair: "#3A2A4A", hairStyle: "short" as const };

// ------------------------------------------------------------------------------------------------ waves
type Fn = (x: number) => number;
/** Street noise: three sines, travelling (dir +1 = to the right). Returns -1..1. */
const noiseFn = (f: number, dir = 1): Fn => (x) =>
  0.58 * Math.sin((TAU * x) / 190 - dir * f * 0.2) + 0.28 * Math.sin((TAU * x) / 113 - dir * f * 0.31 + 1.3) + 0.16 * Math.sin((TAU * x) / 67 - dir * f * 0.47 + 0.4);
/** Steady engine hum: one slow sine. */
const humFn = (f: number): Fn => (x) => Math.sin((TAU * x) / 360 - f * 0.085);
/** A sudden voice: fast, irregular. */
const voiceFn = (f: number): Fn => (x) =>
  (0.55 + 0.45 * Math.sin((TAU * x) / 250 - f * 0.13)) * Math.sin((TAU * x) / 62 - f * 0.55) * 0.75 + 0.3 * Math.sin((TAU * x) / 37 - f * 0.85 + 2);
const edge = (x: number, x0: number, x1: number, w = 70) => smoothstep(clamp((x - x0) / w)) * smoothstep(clamp((x1 - x) / w));

const WaveLine: React.FC<{ x0: number; x1: number; y: number; fn: Fn; amp: number; color: string; width?: number; glow?: boolean; opacity?: number; soft?: number; dash?: string }> = ({ x0, x1, y, fn, amp, color, width = 11, glow = true, opacity = 1, soft = 70, dash }) => {
  if (x1 - x0 < 4 || opacity <= 0) return null;
  let d = "";
  for (let x = x0; x <= x1; x += 6) d += `${x === x0 ? "M" : "L"}${x.toFixed(1)} ${(y + fn(x) * amp * edge(x, x0, x1, soft)).toFixed(1)}`;
  return (
    <g opacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {glow ? <path d={d} stroke={color} strokeWidth={width * 3.4} opacity={0.16} /> : null}
      <path d={d} stroke={color} strokeWidth={width} strokeDasharray={dash} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ props
/** Over-ear headphones centred on a head (x, y = head centre, k = scale; the head radius is 46 at k = 1). */
const HeadSet: React.FC<{ x: number; y: number; k: number; pulse?: number }> = ({ x, y, k, pulse = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M-58 -2 A58 60 0 0 1 58 -2" fill="none" stroke={shadowOf("#EDEFF6", 0.3)} strokeWidth={15} strokeLinecap="round" />
    <path d="M-58 -5 A58 60 0 0 1 58 -5" fill="none" stroke="#EDEFF6" strokeWidth={10} strokeLinecap="round" />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 60} 4) scale(${1 + pulse * 0.14})`}>
        <LitRect x={-17} y={-34} w={34} h={68} r={15} fill={SHELL} />
        <circle cx={sd * 8} cy={-14} r={3.4} fill={GV.gold} />
      </g>
    ))}
  </g>
);

const Plane: React.FC<{ x: number; y: number; k?: number; engineGlow?: number }> = ({ x, y, k = 1, engineGlow = 0 }) => {
  const f = useLocalFrame();
  return (
    <g transform={`translate(${x} ${y + Math.sin(f * 0.06) * 6}) scale(${k}) rotate(-4)`}>
      <path d="M-150 -6 L-205 -70 L-170 -70 L-110 -20 Z" fill={shadowOf(GV.white, 0.25)} />
      <LitPath d="M-190 0 Q-190 -30 -150 -32 L120 -32 Q200 -26 215 0 Q200 26 120 30 L-150 30 Q-190 28 -190 0Z" fill={GV.white} off={12} />
      <path d="M-30 14 L-110 96 L-56 96 L50 18 Z" fill={shadowOf(GV.white, 0.32)} />
      {[-90, -50, -10, 30, 70, 110].map((wx) => (
        <rect key={wx} x={wx} y={-18} width={22} height={16} rx={7} fill={GV.deep} />
      ))}
      <path d="M150 -20 Q186 -16 196 -2 L156 -2 Z" fill={GV.deep} />
      <LitRect x={-64} y={50} w={78} h={36} r={18} fill="#243357" />
      {engineGlow > 0 ? <Glow cx={-64} cy={68} r={15} color={NOISE} intensity={engineGlow} pulse={0.12} /> : null}
    </g>
  );
};

const Megaphone: React.FC<{ x: number; y: number; k?: number; flip?: boolean }> = ({ x, y, k = 1, flip = false }) => {
  const f = useLocalFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) rotate(${16 + Math.sin(f * 0.09) * 3})`}>
      <rect x={-58} y={14} width={22} height={70} rx={11} fill="#1A2747" />
      <LitRect x={-96} y={-30} w={66} h={60} r={16} fill="#2B3F73" />
      <LitPath d="M-34 -30 L78 -86 Q98 0 78 86 L-34 30 Z" fill={GV.tangerine} off={14} />
      <ellipse cx={80} cy={0} rx={15} ry={84} fill={lightOf(GV.tangerine, 0.5)} />
      <ellipse cx={80} cy={0} rx={8} ry={62} fill={shadowOf(GV.tangerine, 0.45)} />
      {[0, 1, 2].map((i) => {
        const t = (((f * 0.05 + i / 3) % 1) + 1) % 1;
        return <path key={i} d={`M${112 + t * 70} ${-52 - t * 34} Q${140 + t * 84} 0 ${112 + t * 70} ${52 + t * 34}`} fill="none" stroke={NOISE} strokeWidth={10} strokeLinecap="round" opacity={0.9 * (1 - t)} />;
      })}
    </g>
  );
};

/** A dark city skyline behind the listener (texture only: it sits in and under the caption band). */
const Skyline: React.FC = () => {
  const B: [number, number, number][] = [
    [-140, 150, 430], [20, 120, 540], [150, 170, 400], [330, 110, 500], [450, 200, 380], [660, 120, 560], [790, 160, 420], [960, 130, 520], [1100, 170, 440],
  ];
  return (
    <g>
      {B.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={1420 - h} width={w} height={h + 400} rx={10} fill={i % 2 ? "#102A52" : "#0C2142"} />
          {Array.from({ length: 10 }).map((_, j) => {
            const wx = x + 22 + (j % 3) * ((w - 44) / 2.4);
            const wy = 1420 - h + 34 + Math.floor(j / 3) * 62;
            return (i * 7 + j * 5) % 4 === 0 ? <rect key={j} x={wx} y={wy} width={20} height={26} rx={5} fill={GV.cream} opacity={0.3} /> : null;
          })}
        </g>
      ))}
    </g>
  );
};

const Ear: React.FC<{ x: number; y: number; k?: number; flip?: boolean }> = ({ x, y, k = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
    <LitPath d="M-10 -120 Q70 -128 76 -40 Q80 10 44 44 Q22 66 26 100 Q26 128 -4 126 Q-34 122 -36 84 Q-70 40 -62 -34 Q-56 -112 -10 -120Z" fill={GV.skin[0]} off={14} />
    <path d="M-6 -84 Q40 -86 44 -34 Q44 0 16 22 Q2 36 4 62" fill="none" stroke={shadowOf(GV.skin[0], 0.34)} strokeWidth={12} strokeLinecap="round" />
    <path d="M-22 -40 Q-2 -52 4 -28 Q4 -10 -12 -4" fill="none" stroke={shadowOf(GV.skin[0], 0.34)} strokeWidth={10} strokeLinecap="round" />
  </g>
);

const Chip: React.FC<{ x: number; y: number; k?: number; busy?: number }> = ({ x, y, k = 1, busy = 0.6 }) => {
  const f = useLocalFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      {[-78, -39, 0, 39, 78].map((o) => (
        <g key={o} fill={GV.gold}>
          <rect x={o - 9} y={-150} width={18} height={36} rx={6} />
          <rect x={o - 9} y={114} width={18} height={36} rx={6} />
          <rect x={-150} y={o - 9} width={36} height={18} rx={6} />
          <rect x={114} y={o - 9} width={36} height={18} rx={6} />
        </g>
      ))}
      <LitRect x={-122} y={-122} w={244} h={244} r={34} fill="#243A6B" />
      <LitRect x={-70} y={-70} w={140} h={140} r={22} fill="#152447" rim={false} />
      <Glow cx={0} cy={0} r={34} color={ANTI} intensity={0.55 + busy * 0.45 * (0.6 + 0.4 * Math.sin(f * 0.3))} />
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

/** Teal check / coral cross disc (no outlines; glow rim). */
const Badge: React.FC<{ at: number; x: number; y: number; ok?: boolean; size?: number }> = ({ at, x, y, ok = true, size = 84 }) => {
  const s = usePop(at);
  const f = useLocalFrame();
  if (s <= 0) return null;
  const c = ok ? GV.teal : GV.coral;
  const d = clamp((f - at - 2) / 7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={size * 1.35} fill={c} opacity={0.18} />
      <LitCircle cx={0} cy={0} r={size} fill={c} />
      {ok ? (
        <path d={`M${-size * 0.42} ${size * 0.04} L${-size * 0.1} ${size * 0.36} L${size * 0.46} ${-size * 0.3}`} fill="none" stroke={GV.white} strokeWidth={size * 0.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      ) : (
        <path d={`M${-size * 0.34} ${-size * 0.34} L${size * 0.34} ${size * 0.34} M${size * 0.34} ${-size * 0.34} L${-size * 0.34} ${size * 0.34}`} fill="none" stroke={GV.white} strokeWidth={size * 0.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
      )}
    </g>
  );
};

/** "NOISE" level meter: 9 bars, `level` 0..1 lit. No numbers on purpose (nothing here is a measured figure). */
const Meter: React.FC<{ at: number; x: number; y: number; level: number; label?: string }> = ({ at, x, y, level, label = "NOISE" }) => {
  const s = usePop(at);
  if (s <= 0) return null;
  const n = 9;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-260} y={-92} width={520} height={184} rx={40} fill="rgba(6,20,40,0.72)" />
      <text x={-218} y={18} fontFamily={font("Fredoka")} fontWeight={700} fontSize={50} letterSpacing={4} fill={GV.white}>
        {label}
      </text>
      {Array.from({ length: n }).map((_, i) => {
        const on = i < Math.max(1, Math.round(level * n));
        const h = 34 + i * 11;
        return <rect key={i} x={-10 + i * 28} y={58 - h} width={19} height={h} rx={8} fill={on ? mixC(GV.teal, GV.coral, i / (n - 1)) : "#22345C"} />;
      })}
    </g>
  );
};

const Bubble: React.FC<{ at: number; x: number; y: number; text: string }> = ({ at, x, y, text }) => {
  const s = usePop(at);
  if (s <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <LitPath d={`${rrectPath(-150, -84, 300, 168, 60)} M40 76 L96 150 L104 70 Z`} fill={GV.cream} off={14} />
      <text x={0} y={30} textAnchor="middle" fontFamily={font("Fredoka")} fontWeight={700} fontSize={92} fill={GV.navy}>
        {text}
      </text>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the street (s01 + payoff)
const HEAD: [number, number] = [540, 660];
const PK = 2.2;
const Street: React.FC<{ f: number; antiAt: number; calmAt?: number; face?: "neutral" | "happy" | "wince" }> = ({ f, antiAt, calmAt, face = "neutral" }) => {
  const bob = Math.sin(f * 0.07 + 2) * 3;
  const grow = clamp((f - antiAt) / 14);
  const calm = calmAt === undefined ? 0 : smootherstep(invLerp(calmAt, calmAt + 16, f));
  const ampN = 46 * (1 - calm);
  const lx = 372;
  const rx = 708;
  const rows = [-52, 0, 52];
  return (
    <>
      <Skyline />
      <Plane x={270} y={350} k={0.84} engineGlow={0.9} />
      <Megaphone x={880} y={370} k={0.9} flip />
      {rows.map((dy, i) => (
        <React.Fragment key={dy}>
          <WaveLine x0={-40} x1={lx} y={HEAD[1] + dy} fn={noiseFn(f + i * 31, 1)} amp={ampN} color={NOISE} width={10} />
          <WaveLine x0={rx} x1={1120} y={HEAD[1] + dy} fn={noiseFn(f + i * 47, -1)} amp={ampN} color={NOISE} width={10} />
          {grow > 0 ? (
            <>
              <WaveLine x0={lx - (lx + 40) * grow} x1={lx} y={HEAD[1] + dy} fn={(x) => -noiseFn(f + i * 31, 1)(x)} amp={ampN} color={ANTI} width={10} soft={40} />
              <WaveLine x0={rx} x1={rx + (1120 - rx) * grow} y={HEAD[1] + dy} fn={(x) => -noiseFn(f + i * 47, -1)(x)} amp={ampN} color={ANTI} width={10} soft={40} />
            </>
          ) : null}
          {calm > 0 ? (
            <>
              <WaveLine x0={-40} x1={lx} y={HEAD[1] + dy} fn={() => 0} amp={0} color={QUIET} width={8} opacity={calm} />
              <WaveLine x0={rx} x1={1120} y={HEAD[1] + dy} fn={() => 0} amp={0} color={QUIET} width={8} opacity={calm} />
            </>
          ) : null}
        </React.Fragment>
      ))}
      <Person spec={{ ...LISTENER, scale: PK }} x={HEAD[0]} y={1080} face={face} seed={2} armL={10} armR={10} />
      <HeadSet x={HEAD[0]} y={HEAD[1] + bob} k={PK} pulse={grow > 0 ? Math.max(0, Math.sin((f - antiAt) * 0.5)) * (1 - calm) : 0} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ s01 hook
// "Your headphones don't block noise. They make more of it."
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const more = s.hit("more");
  const noise = s.at("noise");
  const v = variant % 3;
  const k0: Cam2DKey = v === 0 ? { f: 0, x: 540, y: 800, z: 1.36 } : v === 1 ? { f: 0, x: 420, y: 700, z: 2.6 } : { f: 0, x: 200, y: 700, z: 2.3 };
  const cam = cam2d([k0, { f: v === 0 ? more : noise, x: 540, y: 820, z: 1.2 }, { f: more + 12, x: 540, y: 815, z: 1.26 }], s.f);
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} />
      <World cam={cam}>
        <Street f={s.f} antiAt={more} face={s.f >= more + 4 ? "happy" : "neutral"} />
        <Shockwave at={more} x={HEAD[0]} y={HEAD[1]} r={170} color={ANTI} />
        <RiseText at={more + 1} x={540} y={520} text="MORE NOISE?!" size={92} color={GV.gold} />
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 microphones
// "Tiny microphones on the outside listen to every sound around you."
const S02: React.FC = () => {
  const s = useShot();
  const mics = s.hit("microphones");
  const listen = s.hit("listen");
  const around = s.hit("around");
  const cam = cam2d(
    [
      { f: -6, x: 560, y: 830, z: 0.9 },
      { f: mics + 8, x: 500, y: 810, z: 1.02 },
      { f: around, x: 480, y: 800, z: 1.08 },
      { f: s.dur + 10, x: 470, y: 800, z: 1.16 },
    ],
    s.f,
  );
  const MIC: [number, number][] = [
    [392, 500],
    [392, 800],
  ];
  const lit = clamp((s.f - mics) / 6);
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom={GV.indigo} />
      <World cam={cam}>
        {/* the band and the ear cup, seen from outside */}
        <path d="M640 330 Q640 120 900 60" fill="none" stroke="#EDEFF6" strokeWidth={54} strokeLinecap="round" />
        <path d="M640 334 Q640 132 900 74" fill="none" stroke={shadowOf("#EDEFF6", 0.3)} strokeWidth={18} strokeLinecap="round" transform="translate(16 14)" />
        <LitPath d={rrectPath(330, 300, 520, 700, 190)} fill={SHELL} off={30} />
        <LitPath d={rrectPath(440, 410, 300, 480, 130)} fill={lightOf(SHELL, 0.22)} off={18} rim={false} />
        <circle cx={590} cy={650} r={62} fill={shadowOf(SHELL, 0.2)} />
        {/* incoming noise from every side */}
        <WaveLine x0={-80} x1={MIC[0][0] - 30} y={MIC[0][1]} fn={noiseFn(s.f, 1)} amp={44} color={NOISE} />
        <WaveLine x0={-80} x1={MIC[1][0] - 30} y={MIC[1][1]} fn={noiseFn(s.f + 40, 1)} amp={44} color={NOISE} />
        {s.f >= around ? (
          <>
            <g transform="rotate(34 392 500)">
              <WaveLine x0={-60 - 0} x1={MIC[0][0] - 34} y={MIC[0][1]} fn={noiseFn(s.f + 80, 1)} amp={36} color={NOISE} opacity={clamp((s.f - around) / 8)} />
            </g>
            <g transform="rotate(-34 392 800)">
              <WaveLine x0={-60} x1={MIC[1][0] - 34} y={MIC[1][1]} fn={noiseFn(s.f + 120, 1)} amp={36} color={NOISE} opacity={clamp((s.f - around) / 8)} />
            </g>
          </>
        ) : null}
        {/* the microphone holes */}
        {MIC.map(([mx, my], i) => (
          <g key={i}>
            <circle cx={mx} cy={my} r={34} fill="#1A1440" />
            {[-12, 0, 12].map((o) => [-12, 0, 12].map((p) => <circle key={`${o}${p}`} cx={mx + o} cy={my + p} r={3.4} fill={mixC("#4B3FA0", GV.gold, lit)} />))}
            {lit > 0 ? <Glow cx={mx} cy={my} r={30} color={GV.gold} intensity={0.55 * lit} pulse={0.1} /> : null}
            {s.f >= listen
              ? [0, 1, 2].map((r) => {
                  const t = (((s.f - listen) * 0.035 + r / 3) % 1 + 1) % 1;
                  return <circle key={r} cx={mx} cy={my} r={40 + t * 90} fill="none" stroke={GV.gold} strokeWidth={7} opacity={0.75 * (1 - t)} />;
                })
              : null}
          </g>
        ))}
        <Callout at={mics} x={640} y={196} text="Microphone" to={[MIC[0][0] + 22, MIC[0][1] - 26]} color={GV.gold} size={50} />
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 chip + speaker
// "A chip takes that sound wave and flips it upside down." / "Then the speaker plays the flipped wave straight into your ear."
const S03: React.FC = () => {
  const s = useShot();
  const chip = s.hit("chip");
  const flips = s.hit("flips");
  const upside = s.hit("upside");
  const speaker = s.hit("speaker");
  const ear = s.hit("ear");
  const Y = 640;
  const cam = cam2d(
    [
      { f: -6, x: 430, y: 870, z: 1.34 },
      { f: flips, x: 600, y: 870, z: 1.4 },
      { f: flips + 26, x: 800, y: 870, z: 1.4 },
      { f: speaker + 6, x: 1230, y: 870, z: 1.36 },
      { f: ear, x: 1570, y: 870, z: 1.38 },
      { f: s.dur + 10, x: 1610, y: 865, z: 1.46 },
    ],
    s.f,
  );
  const flipP = smootherstep(invLerp(flips, flips + 10, s.f));
  const outK = Math.cos(Math.PI * flipP); // +1 -> -1: the wave turns upside down
  const outC = mixC(NOISE, ANTI, flipP);
  const n = noiseFn(s.f, 1);
  const spk = Math.max(0, n(1290)) * (s.f >= speaker - 6 ? 1 : 0.3);
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.indigo} bottom={GV.plum} haze={[GV.violet, "#285FC3", GV.teal]} />
      <World cam={cam}>
        {/* in: the sound the microphone heard */}
        <circle cx={96} cy={Y} r={44} fill="#1A1440" />
        <Glow cx={96} cy={Y} r={30} color={GV.gold} intensity={0.5} pulse={0.1} />
        <WaveLine x0={140} x1={420} y={Y} fn={n} amp={78} color={NOISE} width={13} soft={50} />
        <Chip x={540} y={Y} busy={s.f >= chip ? 1 : 0.3} />
        {/* out: the same wave, turned upside down */}
        {flipP > 0.98 ? <WaveLine x0={660} x1={1180} y={Y} fn={n} amp={78} color={NOISE} width={6} glow={false} opacity={0.3} dash="4 16" soft={50} /> : null}
        <WaveLine x0={660} x1={1180} y={Y} fn={(x) => outK * n(x)} amp={78} color={outC} width={13} soft={50} />
        <Speaker x={1290} y={Y} push={spk} />
        <WaveLine x0={1380} x1={1740} y={Y} fn={(x) => -n(x)} amp={70 * clamp((s.f - speaker) / 8)} color={ANTI} width={13} soft={50} />
        <Ear x={1830} y={Y} k={1.5} />
        <Callout at={chip} x={540} y={380} text="Chip" to={[540, 500]} color={ANTI} size={56} />
        <RiseText at={upside} x={920} y={850} text="UPSIDE DOWN" size={70} color={ANTI} out={speaker + 10} />
        <Callout at={speaker} x={1290} y={400} text="Speaker" to={[1290, 520]} color={GV.cream} size={52} />
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 cancel
// "Peak meets valley, the two waves cancel, and you hear almost nothing."
const S04: React.FC = () => {
  const s = useShot();
  const peak = s.hit("Peak");
  const cancel = s.hit("cancel");
  const hear = s.hit("hear");
  const m = smootherstep(invLerp(cancel - 8, cancel + 6, s.f));
  const fade = smootherstep(invLerp(cancel + 2, cancel + 14, s.f));
  const y1 = lerp(400, 600, m);
  const y2 = lerp(800, 600, m);
  const WL = 300;
  const ph = s.f * 0.06;
  const wave: Fn = (x) => Math.sin((TAU * x) / WL - ph);
  const amp = 112 * (1 - fade);
  const cam = cam2d(
    [
      { f: -6, x: 540, y: 930, z: 0.96 },
      { f: cancel, x: 540, y: 930, z: 1.02 },
      { f: s.dur + 10, x: 540, y: 920, z: 1.1 },
    ],
    s.f,
  );
  // x of the wave's peaks (they travel with it): sin = 1 where 2*pi*x/WL - ph = pi/2 + 2*pi*n
  const peaks: number[] = [];
  for (let k = -1; k < 6; k++) {
    const x = ((Math.PI / 2 + ph + TAU * k) * WL) / TAU;
    if (x > 110 && x < 970) peaks.push(x);
  }
  const g = clamp((s.f - peak) / 8) * (1 - m);
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} />
      <World cam={cam}>
        {g > 0
          ? peaks.map((x) => (
              <g key={Math.round(x / 40)} opacity={g}>
                <line x1={x} y1={y1 - amp - 4} x2={x} y2={y2 + amp + 4} stroke={GV.cream} strokeWidth={5} strokeDasharray="6 16" strokeLinecap="round" />
                <circle cx={x} cy={y1 - amp} r={15} fill={NOISE} />
                <circle cx={x} cy={y2 + amp} r={15} fill={ANTI} />
              </g>
            ))
          : null}
        <WaveLine x0={40} x1={1040} y={y1} fn={wave} amp={amp} color={NOISE} width={14} opacity={1 - fade * 0.9} />
        <WaveLine x0={40} x1={1040} y={y2} fn={(x) => -wave(x)} amp={amp} color={ANTI} width={14} opacity={1 - fade * 0.9} />
        {fade > 0 ? <WaveLine x0={40} x1={1040} y={600} fn={(x) => Math.sin(x * 0.05 + s.f * 0.3) * 0.5} amp={5} color={QUIET} width={12} opacity={fade} /> : null}
        <Shockwave at={cancel + 4} x={540} y={600} r={220} color={QUIET} />
        {s.f < cancel - 8 ? (
          <>
            <RiseText at={0} x={130} y={250} text="NOISE" size={64} color={NOISE} anchor="start" out={cancel - 16} />
            <RiseText at={4} x={130} y={1010} text="FLIPPED COPY" size={64} color={ANTI} anchor="start" out={cancel - 16} />
          </>
        ) : null}
        <Meter at={hear} x={540} y={860} level={lerp(1, 0.08, smootherstep(invLerp(hear + 2, hear + 22, s.f)))} />
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 the catch
// "But there's a catch." / "It works best on steady, low sounds, like the hum of a plane engine."
const S05: React.FC = () => {
  const s = useShot();
  const catchAt = s.hit("catch");
  const works = s.at("works");
  const steady = s.hit("steady");
  const engine = s.hit("engine");
  const Y = 760;
  const cam = cam2d(
    [
      { f: -6, x: 540, y: 900, z: 1.1 },
      { f: works, x: 540, y: 905, z: 1.04 },
      { f: steady + 10, x: 540, y: 915, z: 1.0 },
      { f: s.dur + 10, x: 555, y: 910, z: 1.08 },
    ],
    s.f,
  );
  const twitch = Math.exp(-Math.max(0, s.f - catchAt) / 9) * (s.f >= catchAt ? 1 : 0);
  const planeIn = smootherstep(invLerp(works - 4, works + 14, s.f));
  const hum = humFn(s.f);
  const front = lerp(60, 1100, smootherstep(invLerp(steady + 4, engine, s.f))); // the anti-wave cancels left to right
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.indigo} bottom={GV.field[1]} />
      <World cam={cam}>
        <Mascot x={lerp(540, 150, planeIn)} y={lerp(480, 250, planeIn)} scale={lerp(1.9, 0.8, planeIn)} mood={s.f >= catchAt && s.f < works ? "alarm" : s.f >= engine ? "happy" : "calm"} look={planeIn > 0.5 ? [0.9, 0.6] : [0, 1]} />
        {planeIn < 1 ? (
          <g opacity={1 - planeIn}>
            <WaveLine x0={40} x1={1040} y={Y} fn={(x) => Math.sin(x * 0.11 + s.f * 1.7) * Math.exp(-Math.abs(x - 540) / 170)} amp={110 * twitch} color={QUIET} width={12} />
            {s.f >= catchAt ? <RiseText at={catchAt} x={800} y={420} text="!" size={230} color={GV.coral} /> : null}
          </g>
        ) : null}
        {planeIn > 0 ? (
          <g opacity={planeIn}>
            <g transform={`translate(${(1 - planeIn) * 520} 0)`}>
              <Plane x={610} y={420} k={1.45} engineGlow={s.f >= steady ? 1 : 0.4} />
            </g>
            <WaveLine x0={Math.max(40, front)} x1={1040} y={Y} fn={hum} amp={86} color={NOISE} width={14} />
            <WaveLine x0={40} x1={Math.min(1040, front)} y={Y} fn={(x) => hum(x) * 0.04} amp={86} color={QUIET} width={12} soft={30} />
            {front > 80 && front < 1040 ? (
              <>
                <WaveLine x0={Math.max(40, front - 190)} x1={Math.min(1040, front + 60)} y={Y} fn={(x) => -hum(x)} amp={86} color={ANTI} width={12} soft={60} />
                <Glow cx={front} cy={Y} r={26} color={ANTI} intensity={0.8} />
              </>
            ) : null}
            <Callout at={steady} x={600} y={615} text="Steady, low hum" color={NOISE} size={48} />
          </g>
        ) : null}
        <Badge at={engine} x={540} y={950} ok />
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 why
// "You see, a steady hum repeats, so the chip can keep matching it." / "A sudden voice changes too fast, and slips right through."
const S06: React.FC = () => {
  const s = useShot();
  const repeats = s.hit("repeats");
  const matching = s.hit("matching");
  const voice = s.hit("voice");
  const fast = s.hit("fast");
  const slips = s.hit("slips");
  const Y = 560;
  const cam = cam2d(
    [
      { f: -6, x: 520, y: 870, z: 1.0 },
      { f: matching, x: 540, y: 875, z: 1.05 },
      { f: voice + 10, x: 560, y: 870, z: 1.0 },
      { f: slips + 8, x: 780, y: 870, z: 1.0 },
      { f: s.dur + 10, x: 820, y: 865, z: 1.07 },
    ],
    s.f,
  );
  const hum = humFn(s.f);
  const vz = voiceFn(s.f);
  const vFront = lerp(-40, 1180, smootherstep(invLerp(voice, voice + 22, s.f))); // the voice sweeps in from the left
  const lock = smootherstep(invLerp(repeats + 6, matching, s.f));
  // period marks travel with the hum: sin crosses zero upward where 2*pi*x/360 - f*0.085 = 2*pi*n
  const marks: number[] = [];
  for (let k = -1; k < 5; k++) {
    const x = ((s.f * 0.085 + TAU * k) * 360) / TAU;
    if (x > 70 && x < 1010) marks.push(x);
  }
  const wince = s.f >= slips;
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.field[0]} bottom={GV.indigo} />
      <World cam={cam}>
        {/* the steady hum and its repeat marks */}
        {s.f < voice + 22
          ? marks.map((x) =>
              x > vFront + 20 ? (
                <g key={Math.round(x / 60)} opacity={clamp((s.f - repeats) / 6)}>
                  <line x1={x} y1={Y - 150} x2={x} y2={Y + 150} stroke={GV.cream} strokeWidth={5} strokeDasharray="6 14" strokeLinecap="round" opacity={0.7} />
                </g>
              ) : null,
            )
          : null}
        <WaveLine x0={Math.max(40, vFront)} x1={1040} y={Y} fn={hum} amp={92} color={NOISE} width={14} />
        <WaveLine x0={Math.max(40, vFront)} x1={1040} y={Y} fn={(x) => -hum(x)} amp={92 * lock} color={ANTI} width={12} opacity={lock} />
        {s.f < voice ? <RiseText at={repeats} x={540} y={330} text="SAME SHAPE, AGAIN AND AGAIN" size={56} color={GV.cream} out={voice - 10} /> : null}
        {/* the sudden voice */}
        {s.f >= voice ? (
          <>
            <WaveLine x0={40} x1={Math.min(1700, vFront)} y={Y} fn={vz} amp={104} color={VOICE} width={13} soft={40} />
            {/* the chip's late, wrong copy */}
            <WaveLine x0={40} x1={Math.min(1040, vFront - 150)} y={Y} fn={(x) => -voiceFn(s.f - 9)(x - 60) * 0.55} amp={104} color={ANTI} width={9} opacity={0.75} soft={40} />
          </>
        ) : null}
        <Bubble at={voice} x={210} y={280} text="HEY!" />
        <Chip x={540} y={870} k={0.6} busy={1} />
        <Callout at={matching} x={810} y={870} text="Locked on" color={ANTI} size={46} out={voice - 4} />
        <RiseText at={fast} x={830} y={890} text="TOO FAST" size={72} color={GV.coral} />
        {/* the ear it reaches */}
        <Ear x={1230} y={Y} k={1.35} />
        {wince ? (
          <>
            <Shockwave at={slips + 4} x={1150} y={Y} r={90} color={VOICE} />
            <RiseText at={slips + 2} x={1230} y={330} text="!" size={170} color={VOICE} />
          </>
        ) : null}
      </World>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 padding + payoff
// "That's why the padding matters. It blocks the high sounds the chip can't." / "So the silence you paid for is really two noises fighting."
const CupSection: React.FC<{ f: number; padAt: number; blockAt: number }> = ({ f, padAt, blockAt }) => {
  const glow = clamp((f - padAt) / 8);
  const hit = clamp((f - blockAt) / 6);
  return (
    <>
      {/* side of the head + ear */}
      <LitPath d="M700 250 Q1150 250 1150 660 Q1150 1060 700 1060 Z" fill={GV.skin[0]} off={30} />
      <Ear x={640} y={650} k={1.15} flip />
      {/* shell */}
      <LitPath d="M250 330 Q250 250 330 250 L420 250 L420 1050 L330 1050 Q250 1050 250 970 Z" fill={SHELL} off={22} />
      {/* speaker inside the cup */}
      <Speaker x={500} y={650} k={0.7} push={Math.max(0, Math.sin(f * 0.4)) * 0.5} />
      {/* the cushion: two fat pads, top and bottom */}
      {[
        [420, 250, 290, 170],
        [420, 880, 290, 170],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <LitPath d={rrectPath(x, y, w, h, 80)} fill={mixC("#3B2E6E", GV.cream, 0.4 + 0.45 * glow)} off={20} />
          {[0.25, 0.5, 0.75].map((t) => (
            <path key={t} d={`M${x + w * t} ${y + 26} q14 ${h / 2 - 26} 0 ${h - 52}`} fill="none" stroke={shadowOf(mixC("#3B2E6E", GV.cream, 0.4 + 0.45 * glow), 0.3)} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      ))}
      {/* small fast waves arrive and bounce off the padding */}
      {[335, 965].map((y, i) => (
        <g key={y}>
          <WaveLine x0={-60} x1={410} y={y} fn={voiceFn(f + i * 30)} amp={34} color={VOICE} width={9} soft={40} />
          {hit > 0
            ? [0, 1, 2].map((r) => {
                const t = (((f - blockAt) * 0.045 + r / 3) % 1 + 1) % 1;
                return <path key={r} d={`M${404 - t * 110} ${y - 60 - t * 40} Q${372 - t * 130} ${y} ${404 - t * 110} ${y + 60 + t * 40}`} fill="none" stroke={VOICE} strokeWidth={8} strokeLinecap="round" opacity={0.8 * (1 - t) * hit} />;
              })
            : null}
        </g>
      ))}
      <Callout at={padAt} x={760} y={150} text="Padding" to={[590, 300]} color={GV.cream} size={54} />
      <Badge at={blockAt + 4} x={130} y={650} ok={false} size={70} />
    </>
  );
};

const S07: React.FC = () => {
  const s = useShot();
  const padding = s.hit("padding");
  const blocks = s.hit("blocks");
  const b11 = s.beat("b11").s;
  const silence = s.hit("silence");
  const fighting = s.hit("fighting");
  const x = smootherstep(invLerp(b11 - 6, b11 + 6, s.f)); // cross-fade to the street
  const cam = cam2d(
    [
      { f: -6, x: 560, y: 890, z: 0.92 },
      { f: blocks, x: 540, y: 885, z: 1.0 },
      { f: b11 - 6, x: 520, y: 880, z: 1.04 },
      { f: b11 + 6, x: 540, y: 815, z: 1.3 },
      { f: fighting, x: 540, y: 820, z: 1.2 },
      { f: s.dur + 10, x: 540, y: 815, z: 1.28 },
    ],
    s.f,
  );
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} />
      <World cam={cam}>
        {x < 1 ? (
          <g opacity={1 - x}>
            <CupSection f={s.f} padAt={padding} blockAt={blocks} />
          </g>
        ) : null}
        {x > 0 ? (
          <g opacity={x}>
            <Street f={s.f} antiAt={b11 - 40} calmAt={fighting + 6} face={s.f >= silence ? "happy" : "neutral"} />
            <Shockwave at={fighting} x={HEAD[0]} y={HEAD[1]} r={200} color={QUIET} />
          </g>
        ) : null}
      </World>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background={GV.field[0]} scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
