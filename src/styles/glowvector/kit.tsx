// Glowvector kit: glow-lit flat-vector explainer look (Kurzgesagt-LIKE, fully original). Pure SVG at 1080x1920.
// Rules (style bible): dark saturated field, no outlines (value contrast separates shapes), one key light from the
// top-left -> every shape gets a shadow crescent (bottom-right, hue-shifted to violet), a highlight crescent (top-left,
// warm) and a thin rim; emissives get radial halos; constant gentle motion; springs with ~20% overshoot; camera zooms
// in log space; 3 parallax star layers; 4-6% grain.
import React, { useId } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { backOut, blink, clamp, invLerp, noise1, rand } from "../../core/anim";
import { font } from "../../core/fonts";
import { getLength, getPointAtLength } from "@remotion/paths";

export const GV = {
  field: ["#081D2C", "#102348"],
  indigo: "#1B1446",
  plum: "#2B1B4F",
  cream: "#FFF7DC",
  gold: "#FFC857",
  tangerine: "#FF8F4A",
  coral: "#FF5E6C",
  teal: "#2EC4B6",
  cyan: "#8FD8E6",
  violet: "#7A5CFF",
  leaf: "#5FC47A",
  ocean: "#4DC7EB",
  deep: "#1A66B8",
  white: "#F3F7FB",
  navy: "#0A1C2C",
  skin: ["#F6C9A8", "#E0A17A", "#B97A55", "#8A5A3C", "#FFE0C7"],
};

// ------------------------------------------------------------------------------------------------ colour helpers
const toRGB = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
export const mixC = (a: string, b: string, t: number) => {
  const A = toRGB(a);
  const B = toRGB(b);
  return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
};
/** shadow: multiply toward blue-violet; highlight: screen toward warm cream (never toward black/white). */
export const shadowOf = (c: string, k = 0.3) => {
  const A = toRGB(c);
  const V = toRGB("#6B5FD6");
  return toHex(A[0] * (1 - k) * (V[0] / 255 * k + (1 - k)), A[1] * (1 - k) * (V[1] / 255 * k + (1 - k)), A[2] * (1 - k * 0.6) * (V[2] / 255 * k + (1 - k)));
};
export const lightOf = (c: string, k = 0.2) => {
  const A = toRGB(c);
  const W = toRGB("#FFE7B0");
  return toHex(255 - (255 - A[0]) * (1 - (W[0] / 255) * k), 255 - (255 - A[1]) * (1 - (W[1] / 255) * k), 255 - (255 - A[2]) * (1 - (W[2] / 255) * k));
};

// ------------------------------------------------------------------------------------------------ the field
export const Field: React.FC<{ top?: string; bottom?: string; stars?: boolean; haze?: string[]; grain?: number; cam?: { x: number; y: number; z: number } }> = ({
  top = GV.field[0],
  bottom = GV.field[1],
  stars = true,
  haze = [GV.teal, "#285FC3", GV.coral],
  grain = 0.05,
  cam = { x: 540, y: 960, z: 1 },
}) => {
  const f = useLocalFrame();
  const id = useId().replace(/:/g, "");
  const layers = [0.12, 0.35, 0.6];
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`fld${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
          {haze.map((c, i) => (
            <radialGradient key={i} id={`hz${id}${i}`}>
              <stop offset="0" stopColor={c} stopOpacity={0.22 - i * 0.04} />
              <stop offset="1" stopColor={c} stopOpacity={0} />
            </radialGradient>
          ))}
          <radialGradient id={`vig${id}`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#04041A" stopOpacity="0" />
            <stop offset="1" stopColor="#04041A" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill={`url(#fld${id})`} />
        {haze.map((_, i) => (
          <ellipse key={i} cx={[260, 860, 520][i % 3] + Math.sin(f * 0.006 + i) * 40} cy={[420, 1100, 1650][i % 3]} rx={720} ry={620} fill={`url(#hz${id}${i})`} />
        ))}
        {stars
          ? layers.map((d, li) =>
              Array.from({ length: 34 }).map((_, i) => {
                const k = li * 100 + i;
                const x = (((rand(9, k) * 1600 - (cam.x - 540) * d) % 1300) + 1300) % 1300 - 110;
                const y = (((rand(11, k) * 2400 - (cam.y - 960) * d) % 2100) + 2100) % 2100 - 90;
                const tw = 0.55 + 0.45 * Math.sin(f * (0.05 + rand(3, k) * 0.08) + k);
                const r = (0.8 + li * 0.9) * (0.7 + rand(5, k) * 0.6);
                const sparkle = li === 2 && rand(7, k) < 0.4;
                return sparkle ? (
                  <path key={k} d={`M${x} ${y - r * 4} Q${x} ${y} ${x + r * 4} ${y} Q${x} ${y} ${x} ${y + r * 4} Q${x} ${y} ${x - r * 4} ${y} Q${x} ${y} ${x} ${y - r * 4}Z`} fill={GV.cream} opacity={0.75 * tw} />
                ) : (
                  <circle key={k} cx={x} cy={y} r={r} fill={GV.cream} opacity={(0.35 + li * 0.2) * tw} />
                );
              }),
            )
          : null}
        <rect width="1080" height="1920" fill={`url(#vig${id})`} />
      </svg>
      {grain > 0 ? <Grain amount={grain} /> : null}
    </AbsoluteFill>
  );
};

/** Moving film grain (re-randomised 24x a second), doubles as dither on the dark gradients. */
export const Grain: React.FC<{ amount?: number }> = ({ amount = 0.05 }) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const seed = Math.floor((f * 24) / fps);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: amount * 10 }}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed % 7}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed % 7})`} opacity="0.5" />
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ camera
export type Cam2DKey = { f: number; x: number; y: number; z: number; rot?: number };
/** Camera from keys: pan with easeInOutCubic, zoom interpolated in LOG space (constant-feeling speed). */
export function cam2d(keys: Cam2DKey[], f: number) {
  const ks = [...keys].sort((a, b) => a.f - b.f);
  if (f <= ks[0].f) return { ...ks[0], rot: ks[0].rot ?? 0 };
  for (let i = 0; i + 1 < ks.length; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (f <= b.f) {
      const t = Easing.inOut(Easing.cubic)(invLerp(a.f, b.f, f));
      return { f, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t), rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t };
    }
  }
  const l = ks[ks.length - 1];
  // hold: slow drift so the picture never freezes
  const d = f - l.f;
  return { f, x: l.x + Math.sin(d * 0.02) * 6, y: l.y + d * 0.05, z: l.z * (1 + d * 0.0012), rot: l.rot ?? 0 };
}

/** The world group: everything inside is in world units (1080x1920 at z=1, centred at x,y). */
export const World: React.FC<{ cam: { x: number; y: number; z: number; rot?: number }; children: React.ReactNode; depth?: number }> = ({ cam, children, depth = 1 }) => {
  const z = Math.pow(cam.z, depth);
  const x = 540 + (cam.x - 540) * depth;
  const y = 960 + (cam.y - 960) * depth;
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ overflow: "visible" }}>
        <g transform={`translate(540 960) rotate(${cam.rot ?? 0}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ lit shapes
type LitBase = { fill: string; light?: number; shade?: number; rim?: boolean; opacity?: number; transform?: string };
/** Any SVG path lit by the key light (top-left): base + shadow crescent + highlight crescent + rim. */
export const LitPath: React.FC<LitBase & { d: string; off?: number }> = ({ d, fill, light = 0.18, shade = 0.3, rim = true, opacity = 1, off = 14, transform }) => {
  const id = useId().replace(/:/g, "");
  return (
    <g opacity={opacity} transform={transform}>
      <defs>
        <clipPath id={`c${id}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#c${id})`}>
        {/* shadow: whatever the shape shifted up-left does NOT cover */}
        <path d={d} fill={shadowOf(fill, shade)} />
        <path d={d} fill={fill} transform={`translate(${-off} ${-off})`} />
        {/* highlight crescent on the key side */}
        <path d={d} fill="none" stroke={lightOf(fill, light * 2.2)} strokeWidth={rim ? 7 : 0} transform={`translate(${off * 0.35} ${off * 0.35})`} opacity={0.55} />
      </g>
    </g>
  );
};
export const circlePath = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
export const rrectPath = (x: number, y: number, w: number, h: number, r: number) => {
  const q = Math.min(r, w / 2, h / 2);
  return `M${x + q} ${y}H${x + w - q}Q${x + w} ${y} ${x + w} ${y + q}V${y + h - q}Q${x + w} ${y + h} ${x + w - q} ${y + h}H${x + q}Q${x} ${y + h} ${x} ${y + h - q}V${y + q}Q${x} ${y} ${x + q} ${y}Z`;
};
export const LitCircle: React.FC<LitBase & { cx: number; cy: number; r: number }> = ({ cx, cy, r, ...b }) => <LitPath d={circlePath(cx, cy, r)} off={Math.max(6, r * 0.16)} {...b} />;
export const LitRect: React.FC<LitBase & { x: number; y: number; w: number; h: number; r?: number }> = ({ x, y, w, h, r = 24, ...b }) => <LitPath d={rrectPath(x, y, w, h, r)} off={Math.max(6, Math.min(w, h) * 0.1)} {...b} />;

/** Emissive: radial core + additive halo rings at 1.23 / 1.48 / 1.76 / 2.1 x radius. */
export const Glow: React.FC<{ cx: number; cy: number; r: number; color: string; core?: string; intensity?: number; pulse?: number }> = ({ cx, cy, r, color, core = GV.cream, intensity = 1, pulse = 0 }) => {
  const f = useLocalFrame();
  const id = useId().replace(/:/g, "");
  const k = 1 + Math.sin(f * 0.12) * pulse;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id={`g${id}`}>
          <stop offset="0" stopColor={core} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {[2.1, 1.76, 1.48, 1.23].map((m, i) => (
        <circle key={m} cx={cx} cy={cy} r={r * m * k} fill={color} opacity={(0.06 + i * 0.035) * intensity} />
      ))}
      <circle cx={cx} cy={cy} r={r * k} fill={`url(#g${id})`} opacity={Math.min(1, intensity)} />
    </g>
  );
};

/** Soft contact shadow under grounded things. */
export const Contact: React.FC<{ cx: number; cy: number; rx: number }> = ({ cx, cy, rx }) => <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.22} fill="#02060F" opacity={0.28} />;

// ------------------------------------------------------------------------------------------------ pops + text
/** Damped spring (zeta ~0.45, ~20% overshoot) from frame `at`. */
export const usePop = (at: number) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  return f < at ? 0 : spring({ frame: f - at, fps, config: { mass: 1, stiffness: 196, damping: 12.6 } });
};
export const Pop: React.FC<{ at: number; x: number; y: number; children: React.ReactNode; out?: number }> = ({ at, x, y, children, out }) => {
  const f = useLocalFrame();
  const s = usePop(at);
  const o = out !== undefined && f >= out ? 1 - clamp((f - out) / 6) : 1;
  if (s <= 0 || o <= 0) return null;
  const sy = s < 1 ? s : 1 + (s - 1) * 1.4;
  return <g transform={`translate(${x} ${y}) scale(${s * o} ${sy * o}) translate(${-x} ${-y})`}>{children}</g>;
};

/** Text that rises 1.3x its own height through a clip (ease-out quint). No full stops. */
export const RiseText: React.FC<{ at: number; x: number; y: number; text: string; size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end"; out?: number; fontName?: string; spacing?: number }> = ({
  at,
  x,
  y,
  text,
  size = 72,
  color = GV.white,
  weight = 700,
  anchor = "middle",
  out,
  fontName = "Fredoka",
  spacing = 4,
}) => {
  const f = useLocalFrame();
  const id = useId().replace(/:/g, "");
  if (f < at) return null;
  const t = Easing.out(Easing.poly(5))(clamp((f - at) / 14));
  const o = out !== undefined && f >= out ? 1 - clamp((f - out) / 7) : 1;
  const dy = (1 - t) * size * 1.3;
  const w = text.length * size * 0.7 + 80;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id={`rt${id}`}>
          <rect x={x0} y={y - size * 1.05} width={w} height={size * 1.4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#rt${id})`}>
        <text x={x} y={y + dy} textAnchor={anchor} fontFamily={font(fontName)} fontWeight={weight} fontSize={size} letterSpacing={spacing} fill={color}>
          {text.replace(/\.$/, "")}
        </text>
      </g>
    </g>
  );
};

/** Rounded pill label with an optional leader line to a point (callout). */
export const Callout: React.FC<{ at: number; x: number; y: number; text: string; to?: [number, number]; color?: string; size?: number; out?: number }> = ({ at, x, y, text, to, color = GV.cyan, size = 46, out }) => {
  const f = useLocalFrame();
  const s = usePop(at);
  if (s <= 0) return null;
  const o = out !== undefined && f >= out ? 1 - clamp((f - out) / 6) : 1;
  const w = text.length * size * 0.62 + 60;
  const h = size * 1.55;
  const draw = clamp((f - at) / 10);
  return (
    <g opacity={o}>
      {to ? (
        <>
          <line x1={x} y1={y} x2={x + (to[0] - x) * draw} y2={y + (to[1] - y) * draw} stroke={color} strokeWidth={5} strokeLinecap="round" />
          {draw >= 1 ? <circle cx={to[0]} cy={to[1]} r={10} fill={color} /> : null}
        </>
      ) : null}
      <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="rgba(6,20,40,0.78)" stroke={color} strokeWidth={4} />
        <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={font("Fredoka")} fontWeight={700} fontSize={size} letterSpacing={3} fill={color}>
          {text.toUpperCase()}
        </text>
      </g>
    </g>
  );
};

/** Big number in Space Grotesk tabular figures that counts up. */
export const BigNumber: React.FC<{ at: number; x: number; y: number; to: number; from?: number; dur?: number; prefix?: string; suffix?: string; size?: number; color?: string; decimals?: number }> = ({ at, x, y, to, from = 0, dur = 24, prefix = "", suffix = "", size = 150, color = GV.gold, decimals = 0 }) => {
  const f = useLocalFrame();
  const s = usePop(at);
  if (s <= 0) return null;
  const v = interpolate(f, [at, at + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <text x={x} y={y} textAnchor="middle" fontFamily={font("Space Grotesk")} fontWeight={700} fontSize={size} fill={color} style={{ fontVariantNumeric: "tabular-nums" }}>
        {prefix}
        {v.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
        {suffix}
      </text>
    </g>
  );
};

/** Animated wave (sound / water / signal): amplitude, wavelength, phase speed, optional inverted copy. */
export const Wave: React.FC<{ x: number; y: number; w: number; amp: number; wl?: number; speed?: number; color?: string; width?: number; phase?: number; draw?: number; glow?: boolean }> = ({
  x,
  y,
  w,
  amp,
  wl = 160,
  speed = 0.12,
  color = GV.cyan,
  width = 10,
  phase = 0,
  draw = 1,
  glow = true,
}) => {
  const f = useLocalFrame();
  const pts: string[] = [];
  const n = 120;
  for (let i = 0; i <= n * clamp(draw); i++) {
    const px = x + (i / n) * w;
    const py = y + Math.sin((px / wl) * Math.PI * 2 - f * speed + phase) * amp;
    pts.push(`${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  const d = pts.join("");
  return (
    <g>
      {glow ? <path d={d} fill="none" stroke={color} strokeWidth={width * 3.2} strokeLinecap="round" opacity={0.18} /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
    </g>
  );
};

/** Glowing packets flowing along a path (signals, data, blood cells). Deterministic (path math, no SMIL). */
export const Flow: React.FC<{ d: string; n?: number; color?: string; speed?: number; r?: number; draw?: number }> = ({ d, n = 8, color = GV.gold, speed = 6, r = 9, draw = 1 }) => {
  const f = useLocalFrame();
  const len = getLength(d);
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={6} strokeDasharray="4 14" strokeDashoffset={-f * speed * 0.5} />
      {Array.from({ length: n }).map((_, i) => {
        const at = ((f * speed + (i * len) / n) % len);
        if (at > len * clamp(draw)) return null;
        const p = getPointAtLength(d, at);
        if (!p) return null;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={r * 2.4} fill={color} opacity={0.18} />
            <circle cx={p.x} cy={p.y} r={r} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

/** Shockwave ring + white flash for big events. */
export const Shockwave: React.FC<{ at: number; x: number; y: number; r?: number; color?: string }> = ({ at, x, y, r = 300, color = GV.cream }) => {
  const f = useLocalFrame();
  const t = (f - at) / 30;
  if (t < 0 || t > 1) return null;
  return <circle cx={x} cy={y} r={r * 3 * Easing.out(Easing.cubic)(t)} fill="none" stroke={color} strokeWidth={24 * (1 - t)} opacity={1 - t} />;
};

// ------------------------------------------------------------------------------------------------ capsule people
export type PersonSpec = { skin?: string; shirt: string; pants?: string; hair?: string; hairStyle?: "none" | "short" | "bun" | "long" | "curly"; scale?: number };
export type PersonFace = "neutral" | "happy" | "shock" | "bored" | "sad" | "talk" | "wince";
/** Original "capsule person": circle head, rounded body, tapered limbs with mitten hands. Arms in deg (0 down, 90 out). */
export const Person: React.FC<{ spec: PersonSpec; x: number; y: number; face?: PersonFace; armL?: number; armR?: number; lean?: number; pop?: number; seed?: number; talk?: boolean; flip?: boolean }> = ({
  spec,
  x,
  y,
  face = "neutral",
  armL = 12,
  armR = 12,
  lean = 0,
  pop,
  seed = 1,
  talk = false,
  flip = false,
}) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const sp = usePop(pop ?? -99999);
  const s = pop !== undefined ? sp : 1;
  if (s <= 0) return null;
  const k = spec.scale ?? 1;
  const bob = Math.sin(f * 0.07 + seed) * 3;
  const skin = spec.skin ?? GV.skin[seed % GV.skin.length];
  const hr = 46;
  const bw = 112;
  const bh = 150;
  const hx = 0;
  const hy = -bh - hr * 0.9;
  const bl = blink(f, seed, fps) > 0.5;
  const mouthOpen = talk && Math.floor(f / 4) % 2 === 0;
  const limb = (side: number, ang: number) => {
    const a = (ang * Math.PI) / 180;
    const sx = side * (bw / 2 - 10);
    const sy = -bh + 30;
    const L = 108;
    const ex = sx + side * Math.sin(a) * L;
    const ey = sy + Math.cos(a) * L;
    return (
      <g key={side}>
        <path d={`M${sx} ${sy} Q${(sx + ex) / 2 + side * 6} ${(sy + ey) / 2} ${ex} ${ey}`} stroke={shadowOf(spec.shirt, 0.15)} strokeWidth={26} strokeLinecap="round" fill="none" />
        <circle cx={ex} cy={ey} r={17} fill={skin} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${k * s * (flip ? -1 : 1)} ${k * (s < 1 ? s : 1 + (s - 1) * 1.3)}) rotate(${lean})`}>
      <Contact cx={0} cy={4} rx={86} />
      {/* legs */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M${sd * 24} -20 L${sd * 26} 0`} stroke={spec.pants ?? GV.navy} strokeWidth={30} strokeLinecap="round" />
      ))}
      {limb(-1, armL)}
      <LitPath d={rrectPath(-bw / 2, -bh, bw, bh - 4, 46)} fill={spec.shirt} off={16} />
      {limb(1, armR)}
      {/* head */}
      <LitCircle cx={hx} cy={hy} r={hr} fill={skin} />
      {spec.hairStyle && spec.hairStyle !== "none" ? (
        <path
          d={
            spec.hairStyle === "bun"
              ? `M${-hr} ${hy - 6} Q${-hr} ${hy - hr * 1.15} 0 ${hy - hr * 1.1} Q${hr} ${hy - hr * 1.15} ${hr} ${hy - 6} Q0 ${hy - hr * 0.55} ${-hr} ${hy - 6}Z M${-18} ${hy - hr * 1.05} a20 20 0 1 0 36 0a20 20 0 1 0 -36 0`
              : spec.hairStyle === "long"
                ? `M${-hr - 4} ${hy + hr * 0.9} L${-hr - 4} ${hy} Q${-hr} ${hy - hr * 1.2} 0 ${hy - hr * 1.12} Q${hr} ${hy - hr * 1.2} ${hr + 4} ${hy} L${hr + 4} ${hy + hr * 0.9} L${hr - 12} ${hy + hr * 0.9} L${hr - 12} ${hy - hr * 0.3} Q0 ${hy - hr * 0.6} ${-hr + 12} ${hy - hr * 0.3} L${-hr + 12} ${hy + hr * 0.9}Z`
                : `M${-hr} ${hy - 4} Q${-hr} ${hy - hr * 1.18} 0 ${hy - hr * 1.12} Q${hr} ${hy - hr * 1.18} ${hr} ${hy - 4} Q${hr * 0.4} ${hy - hr * 0.62} ${-hr} ${hy - 4}Z`
          }
          fill={spec.hair ?? "#3a2a2a"}
        />
      ) : null}
      {/* face: vertical oval dot eyes */}
      {face === "shock" ? (
        <>
          <ellipse cx={-16} cy={hy - 2} rx={11} ry={13} fill={GV.white} />
          <ellipse cx={16} cy={hy - 2} rx={11} ry={13} fill={GV.white} />
          <circle cx={-16} cy={hy - 2} r={4.5} fill={GV.navy} />
          <circle cx={16} cy={hy - 2} r={4.5} fill={GV.navy} />
          <ellipse cx={0} cy={hy + 24} rx={8} ry={10} fill={GV.navy} />
        </>
      ) : face === "happy" ? (
        <>
          <path d={`M-24 ${hy} Q-16 ${hy - 10} -8 ${hy}`} stroke={GV.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M8 ${hy} Q16 ${hy - 10} 24 ${hy}`} stroke={GV.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M-12 ${hy + 18} Q0 ${hy + 30} 12 ${hy + 18}`} stroke={GV.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {bl || face === "bored" ? (
            <>
              <path d={`M-22 ${hy} H-10`} stroke={GV.navy} strokeWidth={5} strokeLinecap="round" />
              <path d={`M10 ${hy} H22`} stroke={GV.navy} strokeWidth={5} strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={-16} cy={hy} rx={4.2} ry={6.5} fill={GV.navy} />
              <ellipse cx={16} cy={hy} rx={4.2} ry={6.5} fill={GV.navy} />
            </>
          )}
          {face === "sad" || face === "wince" ? (
            <path d={`M-10 ${hy + 24} Q0 ${hy + 16} 10 ${hy + 24}`} stroke={GV.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
          ) : mouthOpen || face === "talk" ? (
            <ellipse cx={0} cy={hy + 22} rx={7} ry={6} fill={GV.navy} />
          ) : (
            <path d={`M-8 ${hy + 21} Q0 ${hy + 25} 8 ${hy + 21}`} stroke={GV.navy} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          )}
        </>
      )}
    </g>
  );
};

/** The series mascot: an original round robot with a visor and glowing eyes that look at what matters. */
export const Mascot: React.FC<{ x: number; y: number; look?: [number, number]; pop?: number; scale?: number; color?: string; mood?: "calm" | "alarm" | "happy" }> = ({ x, y, look = [0, 0], pop, scale = 1, color = GV.white, mood = "calm" }) => {
  const f = useLocalFrame();
  const sp = usePop(pop ?? -99999);
  const s = pop !== undefined ? sp : 1;
  if (s <= 0) return null;
  const hover = Math.sin(f * 0.08) * 10;
  const eyeC = mood === "alarm" ? GV.coral : mood === "happy" ? GV.gold : GV.cyan;
  const ex = look[0] * 10;
  const ey = look[1] * 8;
  return (
    <g transform={`translate(${x} ${y + hover}) scale(${scale * s})`}>
      <Contact cx={0} cy={150 - hover} rx={70 * (1 - hover / 60)} />
      <LitRect x={-80} y={-60} w={160} h={150} r={60} fill={color} />
      <LitRect x={-62} y={-36} w={124} h={64} r={30} fill="#16233F" light={0.3} rim={false} />
      <Glow cx={-26 + ex} cy={-4 + ey} r={12} color={eyeC} intensity={0.9} />
      <Glow cx={26 + ex} cy={-4 + ey} r={12} color={eyeC} intensity={0.9} />
      <path d="M0 -60 L0 -92" stroke={GV.cream} strokeWidth={8} strokeLinecap="round" />
      <Glow cx={0} cy={-98} r={12} color={GV.coral} intensity={0.6 + 0.4 * Math.sin(f * 0.2)} />
      <ellipse cx={-92} cy={30} rx={18} ry={34} fill={shadowOf(color, 0.12)} transform={`rotate(${-10 + Math.sin(f * 0.1) * 6} -92 30)`} />
      <ellipse cx={92} cy={30} rx={18} ry={34} fill={shadowOf(color, 0.12)} transform={`rotate(${10 - Math.sin(f * 0.1) * 6} 92 30)`} />
    </g>
  );
};

export const noise = noise1;
