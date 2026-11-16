// Closet kit: the clothes world of the Tiff x pileGo! series (and anyone else who sells clothes). Chunky toon garments
// that read as clothes at phone size, the famous "chair" (a chair buried under clothes: pileGo!'s own hero image),
// floor heaps, a clothing rail, a full-length mirror, a bed, shipping boxes and mailers, and a dark show venue.
// Units are metres, y = 0 floor. Piles shrink on cue: pass `sold` frames and the top pieces hop off one by one.
//
//   <ClothesChair position={[0.9, 0, -0.6]} sold={[s.hit("sold"), s.hit("again")]} />
//   <ClothesHeap position={[-1, 0, -1]} n={22} amount={0.6} />
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Ball, Board } from "./props";
import { LightPool } from "./props2";
import { toon, glow } from "../../core/three/mats";
import { canvasTex } from "../../core/three/tex";
import { NOINK } from "../../core/three/look/ink";
import { useLocalFrame } from "../../core/timeline";
import { clamp, invLerp, rand, backOut, easeIn } from "../../core/anim";
import type { Vec3 } from "../../core/types";

type T = { position?: Vec3; rotation?: Vec3; scale?: number | Vec3 };
const G: React.FC<T & { children: React.ReactNode }> = ({ position, rotation, scale, children }) => (
  <group position={position} rotation={rotation} scale={scale as any}>
    {children}
  </group>
);

/** Washed, archive-leaning wardrobe colours (no brand colourways). */
export const FABRIC = {
  black: "#1c1b20",
  charcoal: "#3a3940",
  denim: "#4a78b5",
  washed: "#7d9cc4",
  rawDenim: "#2c3c5e",
  cream: "#ece3cf",
  grey: "#9a989c",
  olive: "#6b7350",
  lilac: "#b9a7d9",
  burgundy: "#6e2a36",
  kraft: "#c9a878",
  brown: "#6a4a33",
  pink: "#e8a9bd",
  white: "#f3f1ec",
};
const PALETTE = [FABRIC.black, FABRIC.denim, FABRIC.cream, FABRIC.charcoal, FABRIC.washed, FABRIC.olive, FABRIC.lilac, FABRIC.burgundy, FABRIC.grey, FABRIC.rawDenim, FABRIC.brown, FABRIC.pink];
const shade = (c: string, k: number) => new THREE.Color(c).multiplyScalar(k).getStyle();

// ------------------------------------------------------------------------------------------------ garments
export type GarmentKind = "tee" | "hoodie" | "jeans" | "jacket" | "knit" | "skirt" | "boots" | "cap" | "bag";
/** One garment as a toy-like toon shape, lying flat (folded / tossed). ~0.4 m wide. */
export const Garment: React.FC<T & { kind?: GarmentKind; color?: string; accent?: string }> = ({ kind = "tee", color = FABRIC.black, accent, ...t }) => {
  const dk = shade(color, 0.82);
  const ac = accent ?? shade(color, 1.18);
  switch (kind) {
    case "tee":
    case "knit":
      return (
        <G {...t}>
          <Box size={[0.36, 0.05, 0.3]} color={color} r={0.022} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.13, 0.045, 0.12]} color={dk} r={0.02} position={[s * 0.22, 0, -0.08]} rotation={[0, s * 0.5, 0]} />
          ))}
          {kind === "knit" ? <Box size={[0.36, 0.052, 0.04]} color={ac} r={0.015} position={[0, 0.002, 0.14]} /> : null}
        </G>
      );
    case "hoodie":
      return (
        <G {...t}>
          <Box size={[0.42, 0.07, 0.34]} color={color} r={0.03} />
          <Box size={[0.2, 0.072, 0.12]} color={dk} r={0.03} position={[0, 0.004, -0.15]} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.12, 0.06, 0.3]} color={dk} r={0.026} position={[s * 0.25, 0, 0.02]} rotation={[0, s * 0.25, 0]} />
          ))}
          <Box size={[0.22, 0.074, 0.08]} color={ac} r={0.02} position={[0, 0.004, 0.08]} />
        </G>
      );
    case "jeans":
      return (
        <G {...t}>
          <Box size={[0.3, 0.06, 0.12]} color={color} r={0.025} position={[0, 0, -0.16]} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.13, 0.055, 0.44]} color={s < 0 ? color : dk} r={0.024} position={[s * 0.075, 0, 0.1]} rotation={[0, s * 0.06, 0]} />
          ))}
          <Box size={[0.31, 0.062, 0.025]} color={FABRIC.kraft} r={0.008} position={[0, 0.002, -0.215]} />
        </G>
      );
    case "jacket":
      return (
        <G {...t}>
          <Box size={[0.46, 0.08, 0.38]} color={color} r={0.03} />
          <Box size={[0.05, 0.082, 0.36]} color={ac} r={0.01} position={[0, 0.002, 0]} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.13, 0.07, 0.34]} color={dk} r={0.03} position={[s * 0.28, 0, 0.03]} rotation={[0, s * 0.18, 0]} />
          ))}
          <Box size={[0.3, 0.084, 0.07]} color={dk} r={0.02} position={[0, 0.003, -0.17]} />
        </G>
      );
    case "skirt":
      return (
        <G {...t}>
          <Cyl r={0.2} rTop={0.13} h={0.05} color={color} seg={18} />
          <Cyl r={0.135} h={0.055} color={ac} seg={18} />
        </G>
      );
    case "boots":
      return (
        <G {...t}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.09, 0, 0]}>
              <Box size={[0.09, 0.26, 0.1]} color={color} r={0.03} position={[0, 0.13, -0.03]} />
              <Box size={[0.1, 0.07, 0.24]} color={color} r={0.03} position={[0, 0.035, 0.03]} />
              <Box size={[0.105, 0.025, 0.25]} color={shade(color, 0.6)} r={0.01} position={[0, 0.012, 0.03]} />
            </group>
          ))}
        </G>
      );
    case "cap":
      return (
        <G {...t}>
          <mesh material={toon(color)} castShadow receiveShadow position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <Box size={[0.16, 0.015, 0.12]} color={dk} r={0.006} position={[0, 0.025, 0.12]} />
        </G>
      );
    case "bag":
      return (
        <G {...t}>
          <Box size={[0.26, 0.2, 0.09]} color={color} r={0.03} position={[0, 0.1, 0]} />
          <mesh material={toon(dk)} position={[0, 0.2, 0]}>
            <torusGeometry args={[0.08, 0.012, 6, 18, Math.PI]} />
          </mesh>
        </G>
      );
  }
};

const KINDS: GarmentKind[] = ["tee", "hoodie", "jeans", "knit", "jacket", "tee", "jeans", "hoodie", "skirt", "knit"];

/** Shared "sold" hop: a piece lifts, spins and shrinks away over 10 frames from its sold frame. */
function soldState(f: number, at: number | undefined) {
  if (at === undefined || f < at) return { gone: false, y: 0, s: 1, r: 0 };
  const t = invLerp(at, at + 10, f);
  if (t >= 1) return { gone: true, y: 0, s: 0, r: 0 };
  return { gone: false, y: Math.sin(t * Math.PI) * 0.35 + t * 0.2, s: 1 - easeIn(t), r: t * 2.4 };
}

type PileProps = T & {
  /** number of pieces */
  n?: number;
  /** 0..1 fraction still on the pile (top pieces leave first) */
  amount?: number;
  /** frames at which the top pieces hop off, one per piece (top first) */
  sold?: number[];
  /** footprint radius (m) */
  radius?: number;
  seed?: number;
  colors?: string[];
};

/** A floor heap of tossed clothes: a mound, widest at the bottom. */
export const ClothesHeap: React.FC<PileProps> = ({ n = 18, amount = 1, sold = [], radius = 0.55, seed = 7, colors = PALETTE, ...t }) => {
  const f = useLocalFrame();
  const keep = Math.round(n * clamp(amount));
  const layers = Math.max(3, Math.round(Math.sqrt(n) * 1.1));
  const per = Math.ceil(n / layers);
  const pieces = Array.from({ length: n }).map((_, i) => {
    const layer = Math.floor(i / per);
    const lt = layer / layers;
    const a = rand(seed, i * 3) * Math.PI * 2;
    const rr = radius * (1 - lt * 0.75) * Math.sqrt(0.15 + 0.85 * rand(seed, i * 3 + 1));
    return {
      kind: KINDS[Math.floor(rand(seed, i * 7 + 2) * KINDS.length)],
      color: colors[Math.floor(rand(seed, i * 5 + 3) * colors.length)],
      pos: [Math.cos(a) * rr, 0.03 + layer * 0.062, Math.sin(a) * rr * 0.8] as Vec3,
      rot: [(rand(seed, i * 11) - 0.5) * 0.3, rand(seed, i * 13) * Math.PI * 2, (rand(seed, i * 17) - 0.5) * 0.3] as Vec3,
    };
  });
  return (
    <G {...t}>
      {pieces.map((p, i) => {
        if (i >= keep) return null;
        const top = keep - 1 - i; // 0 = top piece
        const st = soldState(f, sold[top]);
        if (st.gone) return null;
        return <Garment key={i} kind={p.kind} color={p.color} position={[p.pos[0], p.pos[1] + st.y, p.pos[2]]} rotation={[p.rot[0], p.rot[1] + st.r, p.rot[2]]} scale={st.s} />;
      })}
    </G>
  );
};

/** THE chair: a desk chair buried under clothes (a hoodie over the back, jeans hanging off the seat, a heap on top). */
export const ClothesChair: React.FC<PileProps & { chair?: string }> = ({ n = 12, amount = 1, sold = [], seed = 3, chair = "#2a2a31", colors = PALETTE, ...t }) => {
  const f = useLocalFrame();
  const keep = Math.round(n * clamp(amount));
  const pieces = Array.from({ length: n }).map((_, i) => {
    const layer = Math.floor(i / 3);
    return {
      kind: KINDS[Math.floor(rand(seed, i * 7 + 2) * KINDS.length)],
      color: colors[Math.floor(rand(seed, i * 5 + 3) * colors.length)],
      pos: [(rand(seed, i * 3) - 0.5) * 0.24, 0.56 + layer * 0.06, (rand(seed, i * 3 + 1) - 0.5) * 0.2] as Vec3,
      rot: [(rand(seed, i * 11) - 0.5) * 0.35, rand(seed, i * 13) * Math.PI * 2, (rand(seed, i * 17) - 0.5) * 0.35] as Vec3,
    };
  });
  // the drapes stay until the very last pieces go (they are the chair's silhouette)
  const drapeHoodie = soldState(f, sold[keep]);
  const drapeJeans = soldState(f, sold[keep + 1]);
  const hoodieC = colors[Math.floor(rand(seed, 91) * colors.length)];
  const jeansC = FABRIC.denim;
  return (
    <G {...t}>
      {/* chair: seat, back, post, star base */}
      <Box size={[0.52, 0.08, 0.5]} color={chair} position={[0, 0.48, 0]} r={0.03} />
      <Box size={[0.5, 0.58, 0.07]} color={chair} position={[0, 0.86, -0.23]} r={0.03} />
      <Cyl r={0.035} h={0.42} color={shade(chair, 0.7)} position={[0, 0.03, 0]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} size={[0.3, 0.04, 0.05]} color={shade(chair, 0.7)} position={[Math.cos((i * 2 * Math.PI) / 5) * 0.15, 0.04, Math.sin((i * 2 * Math.PI) / 5) * 0.15]} rotation={[0, (-i * 2 * Math.PI) / 5, 0]} r={0.015} />
      ))}
      {/* hoodie draped over the back: body down the back, sleeve hanging at the side */}
      {!drapeHoodie.gone && keep < n + 1 ? (
        <group position={[0, drapeHoodie.y, 0]} scale={drapeHoodie.s}>
          <Box size={[0.54, 0.34, 0.11]} color={hoodieC} position={[0, 1.0, -0.2]} rotation={[-0.12, 0, 0.04]} r={0.04} />
          <Box size={[0.44, 0.1, 0.2]} color={shade(hoodieC, 0.85)} position={[0, 1.17, -0.17]} r={0.04} />
          <Box size={[0.1, 0.42, 0.1]} color={shade(hoodieC, 0.82)} position={[0.27, 0.86, -0.12]} rotation={[0.1, 0, -0.18]} r={0.04} />
        </group>
      ) : null}
      {/* jeans folded over the seat edge, legs hanging */}
      {!drapeJeans.gone ? (
        <group position={[0, drapeJeans.y, 0]} scale={drapeJeans.s}>
          <Box size={[0.36, 0.06, 0.2]} color={jeansC} position={[-0.04, 0.54, 0.08]} r={0.025} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.13, 0.4, 0.06]} color={s < 0 ? jeansC : shade(jeansC, 0.85)} position={[-0.04 + s * 0.08, 0.34, 0.25]} rotation={[0.08, 0, s * 0.05]} r={0.025} />
          ))}
        </group>
      ) : null}
      {pieces.map((p, i) => {
        if (i >= keep) return null;
        const top = keep - 1 - i;
        const st = soldState(f, sold[top]);
        if (st.gone) return null;
        return <Garment key={i} kind={p.kind} color={p.color} position={[p.pos[0], p.pos[1] + st.y, p.pos[2]]} rotation={[p.rot[0], p.rot[1] + st.r, p.rot[2]]} scale={st.s} />;
      })}
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ furniture
/** Clothing rail with hanging pieces (thrift store, her room, a pop-up). */
export const Rack: React.FC<T & { w?: number; n?: number; seed?: number; colors?: string[]; metal?: string }> = ({ w = 1.6, n = 8, seed = 5, colors = PALETTE, metal = "#2d2d33", ...t }) => (
  <G {...t}>
    {[-1, 1].map((s) => (
      <group key={s}>
        <Cyl r={0.022} h={1.62} color={metal} position={[(s * w) / 2, 0, 0]} />
        <Box size={[0.06, 0.04, 0.5]} color={metal} position={[(s * w) / 2, 0.02, 0]} r={0.01} />
      </group>
    ))}
    <mesh material={toon(metal)} rotation={[0, 0, Math.PI / 2]} position={[0, 1.62, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, w + 0.06, 10]} />
    </mesh>
    {Array.from({ length: n }).map((_, i) => {
      const x = -w / 2 + 0.16 + (i * (w - 0.32)) / Math.max(1, n - 1);
      const c = colors[Math.floor(rand(seed, i * 3) * colors.length)];
      const long = rand(seed, i * 7) > 0.55;
      const h = long ? 0.95 : 0.62;
      return (
        <group key={i} position={[x, 1.6, 0]} rotation={[0, (rand(seed, i * 9) - 0.5) * 0.5, 0]}>
          <Box size={[0.04, 0.1, 0.015]} color="#c8c3b8" position={[0, -0.04, 0]} r={0.005} />
          <Box size={[0.07, h, 0.42]} color={c} position={[0, -0.1 - h / 2, 0]} r={0.03} />
          <Box size={[0.075, 0.12, 0.3]} color={shade(c, 0.85)} position={[0, -0.14, 0]} r={0.03} />
        </group>
      );
    })}
  </G>
);

/** Full-length standing mirror (fit checks: the camera is the mirror). */
export const Mirror: React.FC<T & { frame?: string; w?: number; h?: number }> = ({ frame = "#e8e2d4", w = 0.62, h = 1.7, ...t }) => (
  <G {...t}>
    <Box size={[w + 0.1, h + 0.1, 0.05]} color={frame} position={[0, h / 2 + 0.1, 0]} r={0.04} />
    <Board w={w} h={h} text=" " bg="#b9cde0" fg="#b9cde0" border={null} position={[0, h / 2 + 0.1, 0.03]} glowK={0.92} />
    <Board w={w * 0.12} h={h * 0.8} text=" " bg="#e6f0f8" fg="#e6f0f8" border={null} position={[-w * 0.22, h / 2 + 0.18, 0.032]} rotation={[0, 0, -0.08]} glowK={0.95} />
    {[-1, 1].map((s) => (
      <Box key={s} size={[0.05, 0.05, 0.4]} color={shade(frame, 0.8)} position={[s * (w / 2 - 0.05), 0.03, -0.12]} r={0.015} />
    ))}
  </G>
);

/** Bed with duvet and pillow (head end toward -z). */
export const Bed: React.FC<T & { duvet?: string; frame?: string; w?: number; l?: number }> = ({ duvet = "#c9c2dc", frame = "#3a3036", w = 1.5, l = 2.0, ...t }) => (
  <G {...t}>
    <Box size={[w + 0.08, 0.3, l + 0.08]} color={frame} position={[0, 0.15, 0]} r={0.04} />
    <Box size={[w + 0.08, 0.9, 0.08]} color={frame} position={[0, 0.45, -l / 2]} r={0.04} />
    <Box size={[w, 0.18, l]} color="#f1eee8" position={[0, 0.38, 0]} r={0.06} />
    <Box size={[w + 0.04, 0.12, l * 0.7]} color={duvet} position={[0, 0.5, l * 0.14]} r={0.06} />
    <Box size={[w * 0.6, 0.12, 0.34]} color="#ffffff" position={[0, 0.54, -l / 2 + 0.28]} r={0.06} />
  </G>
);

/** Kraft shipping box (taped) or a poly mailer bag. */
export const ShipBox: React.FC<T & { kind?: "box" | "mailer"; color?: string; size?: Vec3; label?: boolean }> = ({ kind = "box", color, size, label = true, ...t }) => {
  if (kind === "mailer") {
    const c = color ?? "#cfc8d6";
    const s: Vec3 = size ?? [0.34, 0.06, 0.44];
    return (
      <G {...t}>
        <Box size={s} color={c} position={[0, s[1] / 2, 0]} r={0.025} />
        {label ? <Box size={[s[0] * 0.5, 0.004, s[2] * 0.32]} color="#f6f4ef" position={[0, s[1] + 0.002, -s[2] * 0.12]} r={0.002} /> : null}
      </G>
    );
  }
  const c = color ?? FABRIC.kraft;
  const s: Vec3 = size ?? [0.4, 0.28, 0.32];
  return (
    <G {...t}>
      <Box size={s} color={c} position={[0, s[1] / 2, 0]} r={0.012} />
      <Box size={[0.07, 0.006, s[2] + 0.004]} color="#d8c9a6" position={[0, s[1] + 0.002, 0]} r={0.002} />
      {label ? <Box size={[s[0] * 0.4, 0.006, s[2] * 0.3]} color="#f6f4ef" position={[-s[0] * 0.18, s[1] + 0.003, s[2] * 0.18]} r={0.002} /> : null}
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ cutout outline
const cutoutTex = (color: string) =>
  canvasTex(`cutout-${color}`, 512, 512, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = color;
    g.lineWidth = 22;
    g.setLineDash([54, 34]);
    g.lineCap = "round";
    const r = 70;
    const m = 20;
    g.beginPath();
    g.moveTo(m + r, m);
    g.arcTo(W - m, m, W - m, H - m, r);
    g.arcTo(W - m, H - m, m, H - m, r);
    g.arcTo(m, H - m, m, m, r);
    g.arcTo(m, m, W - m, m, r);
    g.closePath();
    g.stroke();
  });

/** The pileGo! "real cutout" motif in 3D: a dashed rounded outline around a garment (on a character or a pile).
 *  Unlit, always readable; pulses in from `at`, holds, and `lock` (a frame) snaps it tight and solid. */
export const Cutout: React.FC<T & { w: number; h: number; at?: number; lock?: number; gone?: number; color?: string }> = ({ w, h, at = 0, lock, gone, color = "#ff7b5e", ...t }) => {
  const f = useLocalFrame();
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: cutoutTex(color), transparent: true, depthWrite: false, depthTest: false, toneMapped: false }), [color]);
  if (f < at || (gone !== undefined && f >= gone)) return null;
  const inT = backOut(invLerp(at, at + 8, f), 1.8);
  const locked = lock !== undefined && f >= lock;
  const pulse = locked ? 1 : 1 + 0.035 * Math.sin((f - at) * 0.35);
  const lk = locked ? 1 - 0.08 * backOut(invLerp(lock!, lock! + 6, f), 2) : 1;
  const s = (0.7 + 0.3 * inT) * pulse * lk;
  mat.opacity = clamp(inT);
  return (
    <G {...t}>
      <mesh material={mat} scale={[w * s, h * s, 1]} renderOrder={20} layers={NOINK}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ show venue
/** A dark underground show: low stage, truss with coloured cans, a haze of light, a crowd of silhouettes that bounces
 *  to the beat (`bpm`), strobes on `strobe` frames. The performer stands at [0, stageH, -d/2 + 1.2]. */
export const Venue: React.FC<T & { w?: number; d?: number; stageH?: number; colors?: string[]; crowd?: number; bpm?: number; strobe?: number[]; seed?: number; jump?: number }> = ({
  w = 10,
  d = 9,
  stageH = 0.6,
  colors = ["#ff3b6b", "#7b5cff", "#38d6ff"],
  crowd = 46,
  bpm = 150,
  strobe = [],
  seed = 9,
  jump = 1,
  ...t
}) => {
  const f = useLocalFrame();
  const beat = (f / 30) * (bpm / 60);
  const flash = strobe.some((s) => f >= s && f < s + 3) ? 1 : 0;
  return (
    <G {...t}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={toon("#16151b")}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh position={[0, 2.4, -d / 2]} material={toon("#1a1224")}>
        <planeGeometry args={[w, 4.8]} />
      </mesh>
      {/* stage wash and haze: what makes a dark room read as a show */}
      <LightPool w={w * 0.9} h={4.6} color={colors[1]} opacity={0.55 + flash * 0.3} position={[0, 2.2, -d / 2 + 0.05]} />
      <LightPool w={w * 0.5} h={3.2} color={colors[0]} opacity={0.42} position={[0, 1.9, -d / 2 + 0.1]} />
      <LightPool w={4.2} h={2.6} color="#ffd6f2" opacity={0.28 + flash * 0.4} position={[0, stageH + 1.3, -d / 2 + 2.0]} />
      {/* stage + monitors */}
      <Box size={[w * 0.62, stageH, 2.6]} color="#24222b" position={[0, stageH / 2, -d / 2 + 1.3]} r={0.03} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[0.9, 1.6, 0.7]} color="#1b1a20" position={[s * (w * 0.31 + 0.6), 0.8, -d / 2 + 1.4]} r={0.04} />
          <Cyl r={0.22} h={0.05} color="#0b0b0e" position={[s * (w * 0.31 + 0.6), 1.2, -d / 2 + 1.76]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      {/* truss with lights */}
      <mesh material={toon("#2d2c33")} rotation={[0, 0, Math.PI / 2]} position={[0, 3.6, -d / 2 + 1.4]}>
        <cylinderGeometry args={[0.06, 0.06, w * 0.7, 8]} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const x = -w * 0.3 + (i * w * 0.6) / 6;
        const c = colors[i % colors.length];
        const pulse = 2.2 + 1.6 * Math.max(0, Math.sin((beat + i * 0.25) * Math.PI));
        return (
          <group key={i} position={[x, 3.45, -d / 2 + 1.4]}>
            <Cyl r={0.11} h={0.22} color="#18171c" />
            <mesh position={[0, -0.01, 0]} material={glow(c, pulse + flash * 4)}>
              <sphereGeometry args={[0.085, 12, 8]} />
            </mesh>
          </group>
        );
      })}
      {/* crowd silhouettes in rows (front rows nearest the stage) */}
      {Array.from({ length: crowd }).map((_, i) => {
        const row = Math.floor(i / 9);
        const x = (rand(seed, i) - 0.5) * (w * 0.75);
        const z = -d / 2 + 3.2 + row * 0.85 + (rand(seed, i + 50) - 0.5) * 0.35;
        const ph = rand(seed, i + 99);
        const hop = jump * Math.max(0, Math.sin((beat + ph) * Math.PI)) * 0.12;
        const h = 1.45 + rand(seed, i + 7) * 0.3;
        const c = rand(seed, i + 3) > 0.5 ? "#2a1f38" : "#342644";
        const armUp = rand(seed, i + 13) > 0.7;
        return (
          <group key={i} position={[x, hop, z]}>
            <mesh material={toon(c)} position={[0, h * 0.42, 0]}>
              <capsuleGeometry args={[0.17, h * 0.5, 4, 10]} />
            </mesh>
            <Ball r={0.13} color={c} position={[0, h * 0.86, 0]} />
            {armUp ? (
              <mesh material={toon(c)} position={[0.16, h * 0.98, 0]} rotation={[0, 0, -0.25]}>
                <capsuleGeometry args={[0.04, 0.42, 4, 8]} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </G>
  );
};
