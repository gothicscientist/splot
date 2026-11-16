// scenes: hand-written
// "What if you kept digging straight down?" - Blockcraft (original voxel) x What if.
// The Kola Superdeep Borehole told with blocks. Every event is keyed to its spoken word through useShot().
// Block worlds are schematic (1 block is not 1 metre underground); every number on screen is the sourced one.
// 2D labels that point at 3D things are placed with screen(): the exact pose the Stage draws that frame.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Rain } from "../../core/three/particles";
import { applyPose, orbit, poseAt } from "../../core/three/camera";
import type { CamKey } from "../../core/three/camera";
import { untone } from "../../core/three/look/shade";
import { backOut, clamp, easeOut, invLerp, keys as kf, lerp, rand, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import { VoxelWorld, Block, Voxels, PixelBurst } from "../../styles/blockcraft/VoxelWorld";
import { Blocky, BCAST, BPOSES, PixelItem } from "../../styles/blockcraft/Blocky";
import type { BlockySpec, BlockyPose } from "../../styles/blockcraft/Blocky";
import { SquareSun, CloudLayer, PixelTag, PixelGauge, PixelThermo, PixelTitle, PixelStamp } from "../../styles/blockcraft/Sky";
import { EMISSIVE, faceUV, getAtlas } from "../../styles/blockcraft/blocks";
import type { BlockType } from "../../styles/blockcraft/blocks";
import type { Timeline, Vec3 } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const PIP: BlockySpec = BCAST.hero;
const SCI_A: BlockySpec = { skin: "#f0c9a6", hair: "#5a4632", hairStyle: "short", shirt: "#f4f6fb", shirtStyle: "lab", shirtAccent: "#c0392b", pants: "#3a3a46", hat: { kind: "hardhat", color: "#f2c230" }, seed: 12 };
const SCI_B: BlockySpec = { skin: "#d9a07a", hair: "#2a2420", hairStyle: "bob", shirt: "#f4f6fb", shirtStyle: "lab", shirtAccent: "#2f6fb3", pants: "#4a4a52", hat: { kind: "hardhat", color: "#e8762c" }, beard: "#2a2420", seed: 14 };

const basic = (c: string, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) });

// ------------------------------------------------------------------------------------------------ screen helpers
const PROJ = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 900);
const PV = new THREE.Vector3();
/** Screen px (1080 x 1920) of world points under the pose the Stage draws at frame f (same keys, kicks, creep). */
function screen(cam: CamKey[], f: number, kicks: number[] = []) {
  const pose = poseAt(cam, f, kicks);
  PROJ.fov = pose.fov;
  PROJ.updateProjectionMatrix();
  applyPose(PROJ, pose);
  return (p: Vec3): [number, number] => {
    PV.set(p[0], p[1], p[2]).project(PROJ);
    return [((PV.x + 1) / 2) * 1080, ((1 - PV.y) / 2) * 1920];
  };
}
const ring = (c: string, w: number) =>
  [[w, 0], [-w, 0], [0, w], [0, -w], [w, w], [-w, w], [w, -w], [-w, -w]].map(([a, b]) => `${a}px ${b}px 0 ${c}`).join(", ");

/** A pixel label at a screen point: outlined Silkscreen (or a panel), pops in over 6 f. */
const Label: React.FC<{ f: number; at: number; x: number; y: number; text: string; size?: number; color?: string; anchor?: "left" | "center" | "right"; panel?: boolean; opacity?: number }> = ({
  f,
  at,
  x,
  y,
  text,
  size = 44,
  color = "#ffffff",
  anchor = "center",
  panel = false,
  opacity = 1,
}) => {
  if (f < at) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0);
  const tx = anchor === "left" ? "0%" : anchor === "right" ? "-100%" : "-50%";
  const o = anchor === "left" ? "0% 50%" : anchor === "right" ? "100% 50%" : "50% 50%";
  const w = Math.max(3, Math.round(size * 0.09));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${s})`,
        transformOrigin: o,
        opacity,
        fontFamily: font("Silkscreen"),
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        textShadow: panel ? `${Math.round(size * 0.08)}px ${Math.round(size * 0.08)}px 0 #2a2a2a` : `${ring("#141018", w)}, ${w * 1.5}px ${w * 1.7}px 0 #141018`,
        ...(panel ? { background: "rgba(20,18,26,0.86)", border: "6px solid #f2f2f2", padding: "10px 20px 8px" } : {}),
      }}
    >
      {text}
    </div>
  );
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {children}
  </svg>
);
/** an outlined line (optionally dashed) */
const Line: React.FC<{ a: [number, number]; b: [number, number]; color?: string; width?: number; dash?: string; opacity?: number }> = ({ a, b, color = "#ffffff", width = 6, dash, opacity = 1 }) => (
  <g opacity={opacity}>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#141018" strokeWidth={width + 7} strokeDasharray={dash} strokeLinecap="butt" />
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="butt" />
  </g>
);

const CONFETTI = ["#ff4d5e", "#ffe14d", "#4dabf7", "#69db7c", "#ff922b", "#f4f4f4"];
/** Square paper confetti in screen space, burst from `o` (px): it fans out sideways and down (never up into the
 *  caption band), flutters (the square turns edge-on and back) and falls out of the frame. Closed form in the frame. */
const Confetti: React.FC<{ f: number; at: number; o: [number, number]; n?: number; seed?: number; life?: number }> = ({ f, at, o, n = 34, seed = 1, life = 44 }) => {
  if (f < at || f > at + life) return null;
  const t = (f - at) / 30;
  const k = 3.4; // air drag
  const e = (1 - Math.exp(-k * t)) / k;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        // -18 deg (a little up, to the right) round through down to 198 deg (a little up, to the left)
        const a = ((-18 + rand(seed, i) * 216) * Math.PI) / 180;
        const sp = 700 + rand(seed + 1, i) * 1250;
        const x = o[0] + Math.cos(a) * sp * e + Math.sin(t * 6 + i) * 16 * Math.min(1, t * 4);
        const y = o[1] + Math.sin(a) * sp * e + 620 * t * t;
        const size = 22 + rand(seed + 2, i) * 16;
        const w = size * Math.max(0.15, Math.abs(Math.cos(t * (5 + (i % 4)) + i)));
        const fade = 1 - clamp((f - at - (life - 10)) / 10);
        const rot = (rand(seed + 3, i) - 0.5) * 50 + t * 40 * (i % 2 ? 1 : -1);
        return (
          <rect
            key={i}
            x={-w / 2}
            y={-size / 2}
            width={w}
            height={size}
            fill={CONFETTI[i % CONFETTI.length]}
            stroke="#141018"
            strokeWidth={3}
            opacity={fade}
            transform={`translate(${x} ${y}) rotate(${rot})`}
          />
        );
      })}
    </g>
  );
};
/** One square shock ring (the drill stops): grows and fades over 16 f. */
const StopRing: React.FC<{ f: number; at: number; at2: [number, number] }> = ({ f, at, at2 }) => {
  const u = clamp((f - at) / 16);
  const r = 16 + 120 * easeOut(u);
  return <rect x={at2[0] - r} y={at2[1] - r} width={2 * r} height={2 * r} fill="none" stroke="#ffffff" strokeWidth={8 * (1 - u) + 2} opacity={1 - u} />;
};

/** The drill string: a thin square pipe from `top` down to `y`, with a spinning bit at the tip (tip bottom = y - 0.5). */
const Drill: React.FC<{ x: number; z: number; top: number; y: number; spin?: number; bit?: number; pipe?: number }> = ({ x, z, top, y, spin = 0, bit = 0.56, pipe = 0.22 }) => {
  const m = useMemo(() => ({ pipe: basic("#b9c2cc"), dark: basic("#6d7783"), gold: basic("#f2c230"), tip: basic("#8e99a6") }), []);
  const len = Math.max(0.01, top - y);
  return (
    <group position={[x, 0, z]}>
      <mesh material={m.pipe} position={[0, y + len / 2, 0]}>
        <boxGeometry args={[pipe, len, pipe]} />
      </mesh>
      <group position={[0, y, 0]} rotation={[0, spin, 0]}>
        <mesh material={m.dark} position={[0, 0.34, 0]}>
          <boxGeometry args={[bit * 0.7, 0.3, bit * 0.7]} />
        </mesh>
        <mesh material={m.gold} position={[0, 0.06, 0]}>
          <boxGeometry args={[bit, 0.3, bit]} />
        </mesh>
        <mesh material={m.tip} position={[0, -0.2, 0]}>
          <boxGeometry args={[bit * 0.62, 0.26, bit * 0.62]} />
        </mesh>
        <mesh material={m.dark} position={[0, -0.4, 0]}>
          <boxGeometry args={[bit * 0.3, 0.2, bit * 0.3]} />
        </mesh>
      </group>
    </group>
  );
};

/** Underground rock by depth: dirt, stone with ores, then deep stone (and bedrock at the very bottom). */
const rockAt = (x: number, y: number, z: number, top: BlockType, stoneTo = -24, deepTo = -1e9): BlockType => {
  if (y === 0) return top;
  if (y >= -3) return "dirt";
  if (y < deepTo) return "bedrock";
  const r = rand(11, x * 7919 + y * 104729 + z * 31);
  if (y >= stoneTo) return r < 0.05 ? "coalOre" : r < 0.08 ? "ironOre" : r < 0.1 ? "gravel" : "stone";
  return r < 0.03 ? "goldOre" : r < 0.05 ? "gemOre" : r < 0.075 ? "redOre" : "deepstone";
};

/** Cutaway light: the rock darkens and warms with depth (d = 0 at the surface .. 1 at the bottom) and the open half of
 *  the shaft at x 0..1 (front half carved, back wall kept) sits in shadow so it reads as a hole, not a window. */
const cutLight =
  (depth: number, d0 = 0) =>
  (x: number, y: number, z: number): [number, number, number] => {
    const d = clamp(d0 + -y / depth);
    let k = 1 - 0.3 * d;
    if (z < 0.5 && x > -0.01 && x < 1.01 && y < 0.99) k *= 0.38;
    return [k * (1 + 0.36 * d), k * (1 + 0.06 * d), k * (1 - 0.18 * d)];
  };
/** The same warmth as a flat tint, for the separate animated blocks that sit in the deep rock. */
const DEEP_TINT: [number, number, number] = [0.7 * 1.36, 0.7 * 1.06, 0.7 * 0.82];

/** Small voxel flowers (a full wool block read as a random red box next to the hero in the low-angle variant).
 *  None may project near Pip's hands in an opening (a yellow head at -2,-2 sat right at his fist in the main one). */
const FLOWERS: [number, number, BlockType][] = [
  [-3, 1, "wool_red"], [4, 3, "wool_yellow"], [-6, 5, "wool_red"], [7, 6, "wool_yellow"], [3, -3, "wool_red"], [-5, -2, "wool_yellow"], [5, -1, "wool_red"],
];
const Flower: React.FC<{ x: number; z: number; head: BlockType }> = ({ x, z, head }) => {
  const stem = useMemo(() => basic("#3f8f2f"), []);
  return (
    <group>
      <mesh material={stem} position={[x + 0.5, 0.14, z + 0.5]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
      </mesh>
      <Block type={head} at={[x, -0.2, z]} size={0.2} />
    </group>
  );
};

/** The hook's shaft fades into the dark the deeper it goes (nothing glows at the bottom). The floor keeps the walls
 *  next to the falling camera visible at the end of the shot: a near-black frame is a QA fail (mean luma < 0.04). */
const shaftLight = (_x: number, y: number) => (y > -0.01 ? 1 : Math.max(0.2, Math.exp(y / 9)));

// ------------------------------------------------------------------------------------------------ s01 hook
// "What if you dug straight down and never stopped?"
const meadow = (v: Voxels) => {
  // low hills far back (31-65 m from the main camera, below Pip's chin there) and a wide flat meadow, so the main
  // opening has plain sky behind Pip's head and the title; the terrain runs past every opening's view edges
  v.terrain({ x0: -60, x1: 40, z0: -60, z1: -24, base: 0, amp: 2.0, seed: 5, minY: -3, ores: false });
  v.terrain({ x0: -45, x1: 30, z0: -23, z1: 14, base: -1, flat: true, minY: -3, ores: false });
  // trees only outside the main frame (one stands behind Pip in the low -v1 opening); no house: its walls, trunk and
  // canopy sat behind Pip and the title in the main opening
  v.tree(-9, 0, -2, 5).tree(6, 0, -7, 6).tree(10, 0, -2, 4).tree(-13, 0, 4, 5);
  // the deep column under the dig site and the 2x2 shaft
  for (let x = -2; x <= 3; x++) for (let z = -1; z <= 4; z++) for (let y = -46; y <= -1; y++) v.set(x, y, z, rockAt(x, y === -1 ? 0 : y, z, "grass"));
  for (let y = -45; y <= -1; y++) for (const x of [0, 1]) for (const z of [1, 2]) v.set(x, y, z, null);
};
/** -v2 only: the sky seen up the shaft. A flat HDR panel above the hole (y = 24, over the 2x2 opening): an almost
 *  white glow round the top of the hole that fades to sky blue, with the stepped edge of one blocky cloud on the
 *  left of the square. It blooms, so the dark figure leaning over the edge gets a thin rim of light. */
const SKY_C: [number, number] = [-0.3, -1.2]; // glow centre (x, z): behind Pip's head and the top half of the square
const SkyGlow: React.FC = () => {
  const mat = useMemo(() => {
    const N = 512;
    const c = document.createElement("canvas");
    c.width = c.height = N;
    const g = c.getContext("2d")!;
    const M = 24; // metres across the panel
    const px = (m: number) => ((m / M) + 0.5) * N; // panel metres (relative to the centre) -> canvas px
    const grad = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(2.6 / 12, "#fbfdff");
    grad.addColorStop(4.6 / 12, "#d2e6fb");
    grad.addColorStop(7 / 12, "#a5c9f2");
    grad.addColorStop(1, "#7fb1ea");
    g.fillStyle = grad;
    g.fillRect(0, 0, N, N);
    // one blocky cloud on the screen-left of the square (panel +x), its stepped edge on the bluer part of the glow
    // (canvas x = panel x, canvas y = -panel z: the panel is turned to face down)
    const cells: [number, number, number, number][] = [
      [5.0, 13, -13, 0.4],
      [4.2, 5.0, -13, -2.6],
      [6.0, 13, 0.4, 2.2],
    ];
    const rect = ([x0, x1, z0, z1]: [number, number, number, number], d = 0) => g.fillRect(px(x0) - d, N - px(z1) + d, px(x1) - px(x0), px(z1) - px(z0));
    // a cool shaded underside offset toward the glow, then the white body: a crisp two-tone edge
    g.fillStyle = "#b9cde6";
    for (const c of cells) rect(c, 8);
    g.fillStyle = "#ffffff";
    for (const c of cells) rect(c);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    // HDR: the white core blooms (Stage bloom threshold 1.0); the blue edge stays under it
    return new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.6, 1.6, 1.6), fog: false, side: THREE.DoubleSide });
  }, []);
  return (
    <mesh material={mat} position={[SKY_C[0], 24, SKY_C[1]]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
    </mesh>
  );
};
/** -v2: Pip and his pickaxe against the bright sky (a dark silhouette); the lid blocks are lit from above */
const SILHOUETTE: [number, number, number] = [0.05, 0.045, 0.065];
const LID_BACKLIT: [number, number, number] = [0.55, 0.52, 0.5];

/** pick raised overhead (anticipation: it keeps rising until the first chop) */
const windup = (f: number, lean = 0): BlockyPose => ({ armL: [-10, 4], armR: [lerp(-152, -166, smootherstep(invLerp(-12, 5, f))), 6], legL: 0, legR: 0, head: [0, 14], lean });
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const dug = s.hit("dug");
  const down = s.hit("down");
  const never = s.at("never");
  const v = variant % 3;
  const inside = v === 2; // v2: from inside the shaft, looking up at the hero against the sky
  // lid cells [x, z, breakAt, crackFrom]: the cell in the lower middle of the main frame goes first, already cracked
  const lid: [number, number, number, number][] = inside
    ? [
        [0, 1, -12, -40],
        [1, 1, -6, -36],
        [1, 2, dug, -24],
        [0, 2, dug + 6, -18],
      ]
    : [
        [1, 1, dug, -30],
        [0, 1, dug + 4, dug - 20],
        [1, 2, dug + 8, dug - 16],
        [0, 2, dug + 12, dug - 12],
      ];
  const start: CamKey =
    v === 0
      ? // chest-high 3/4 from the right: Pip ~47 % of the frame height with his head and the raised pick on plain sky
        // (the pick head stays right of "DOWN?"), the two cracking lid cells and the chips across the bottom
        { f: 0, pos: [3.45, 1.22, 5.15], look: [1.05, 1.1, 0.9], fov: 39, creep: 0.004 }
      : v === 1
        ? { f: 0, pos: [-0.9, 0.45, 4.3], look: [1, 1.3, 0.7], fov: 40, creep: 0.004 } // raised pick head clears the title
        : { f: 0, pos: [1.0, -5.5, 2.45], look: [1.0, 3.0, 1.25], fov: 50, roll: 180, creep: 0.003 };
  const cam: CamKey[] = inside
    ? [
        start,
        // falls away down the shaft, still looking up: the square of sky shrinks to a small bright square (the fall
        // stays in the upper half of the shaft, where the walls round the lens still read)
        { f: never + 8, pos: [1, -14, 2.3], look: [1, 2, 1.7], fov: 54, roll: 180, ease: "glide", dur: Math.max(10, never + 8 - down), creep: 0 },
        { f: s.dur + 8, pos: [1, -25, 2.2], look: [1, -5, 1.9], fov: 58, roll: 180, ease: "linear" },
      ]
    : [
        start,
        { f: down + 12, pos: [1, 5.2, 2.6], look: [1, -20, 1.95], fov: 52, ease: "glide", dur: 14, creep: 0.002 },
        { f: never + 8, pos: [1, 1.2, 2.1], look: [1, -30, 2.0], fov: 62, ease: "glide", dur: Math.max(8, never - down - 6) },
        // the dive keeps going into the dark (the bottom stays out of sight 30+ m below the lens)
        { f: s.dur + 8, pos: [1, -15, 2.02], look: [1, -60, 2.0], fov: 70, ease: "linear" },
      ];
  const pipAt: Vec3 = inside ? [1, 0, 0.62] : [1, 0, 0.3];
  const lean = inside ? 18 : 0;
  return (
    <AbsoluteFill>
      <Stage look="day" ink={false} fog={[45, 300]} cam={cam} kicks={[dug + 1, dug + 13]} dof={(f) => (inside || f >= down ? 0 : 4)} focus={[1, 0.8, 1.0]}>
        <VoxelWorld build={meadow} light={shaftLight} />
        <SquareSun position={[40, 70, -110]} size={16} />
        {FLOWERS.map(([x, z, head]) => (
          <Flower key={`${x},${z}`} x={x} z={z} head={head} />
        ))}
        <CloudLayer y={36} />
        {inside ? <SkyGlow /> : null}
        {lid.map(([x, z, b, c]) => (
          <Block key={`${x}${z}`} type="grass" at={[x, -1, z]} breakAt={b} crackFrom={c} cracks tint={inside ? LID_BACKLIT : undefined} />
        ))}
        {/* chips of grass and dirt: a strike just before frame 0, then the chops */}
        {inside ? (
          <>
            <PixelBurst kind="chips" type="grass" at={-16} origin={[1.0, -0.25, 1.5]} spread={[0.7, 0.1, 0.4]} count={22} power={0.9} up={-1.2} life={44} size={0.17} seed={3} />
            <PixelBurst kind="chips" type="dirt" at={dug} origin={[1.0, -0.4, 2.4]} spread={[0.7, 0.1, 0.4]} count={18} power={1.0} up={-0.8} life={40} size={0.18} seed={5} />
          </>
        ) : (
          <>
            <PixelBurst kind="chips" type="grass" at={-7} origin={[1.5, 0.08, 1.45]} spread={[0.3, 0, 0.3]} count={12} power={1.6} up={2.6} life={24} size={0.11} seed={2} />
            <PixelBurst kind="chips" type="grass" at={dug - 1} origin={[1.5, 0.08, 1.45]} spread={[0.3, 0, 0.3]} count={16} power={2.0} up={2.8} life={24} size={0.12} seed={4} />
          </>
        )}
        <Blocky
          spec={PIP}
          at={pipAt}
          poses={[
            [-20, windup(s.f, lean)],
            [dug + 14, inside ? { ...BPOSES.lookDown, lean } : "lookDown"],
          ]}
          faces={[
            [0, "determined"],
            [dug + 13, "shocked"],
          ]}
          item={[[-20, "pickaxe"]]}
          grip="tool"
          itemSize={0.8}
          mining={[5, dug + 14]}
          tint={inside ? SILHOUETTE : undefined}
        />
      </Stage>
      <PixelTitle at={-8} out={down + 10} lines={["DIG STRAIGHT", "DOWN?"]} y={300} size={132} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the real attempt
// "In 1970, Soviet scientists tried it for real." / "Their hole was just 23 centimeters wide, about the size of a dinner plate."
// The platform top is y = 1; the hole is a true-scale 23 cm opening in a steel casing, flush with the deck, in the
// middle of the derrick. Its deck cell is a custom plank slab with a hole; below it a tube falls away to black.
const HOLE: Vec3 = [0.5, 1, -3.5];
const HW = 0.23; // hole width
const RING = 0.07; // casing ring width
const PLATE_X = HOLE[0] + 0.45; // the dinner plate lies just right of the hole, same scale
const tundra = (v: Voxels) => {
  v.terrain({ x0: -30, x1: 30, z0: -46, z1: -17, base: 0, amp: 2.2, seed: 9, minY: -3, top: "snow", ores: false });
  v.terrain({ x0: -30, x1: 30, z0: -16, z1: 16, base: -1, flat: true, minY: -3, top: "snow", ores: false });
  v.tree(-9, 0, -9, 6).tree(11, 0, -14, 7).tree(-14, 0, -3, 5).tree(15, 0, -5, 6).tree(-18, 0, -13, 7).tree(-7, 0, -19, 6);
  v.house(7, 0, -11, 6, 5, 3, "planks", "wool_red");
  // drilling platform, one block high (blocks z -7..-1 -> front face at z = 0)
  v.box(-3, 0, -7, 3, 0, -1, "darkPlanks");
  // the derrick: four iron legs that step inward, two red bands, a crown block and a beacon
  for (let y = 1; y <= 10; y++) {
    const h = y <= 5 ? 2 : 1;
    for (const sx of [-h, h]) for (const sz of [-h, h]) v.set(sx, y, -4 + sz, "ironBlock");
    if (y === 5 || y === 10)
      for (let k = -h; k <= h; k++) v.set(k, y, -4 - h, "wool_red").set(k, y, -4 + h, "wool_red").set(-h, y, -4 + k, "wool_red").set(h, y, -4 + k, "wool_red");
  }
  v.box(-1, 11, -5, 1, 11, -3, "ironBlock").set(0, 12, -4, "wool_red").set(0, 13, -4, "glow");
  // the hole's cell (and the ground under it) is built by <DeckHole>
  for (let y = -3; y <= 0; y++) v.set(0, y, -4, null);
};
/** vertex-coloured box: `top` colour at its top face fading to black `fade` m below it */
function gradientBox(w: number, h: number, d: number, top: THREE.Color, fade: number, segs = 10) {
  const g = new THREE.BoxGeometry(w, h, d, 1, segs, 1);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = clamp(1 - (h / 2 - pos.getY(i)) / fade);
    const kk = k * k;
    col.set([top.r * kk, top.g * kk, top.b * kk], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
}
const PIPE_W = 0.11; // drill pipe: thin enough that a black ring of hole shows all round it
const DeckHole: React.FC<{ spin: number }> = ({ spin }) => {
  const parts = useMemo(() => {
    // plank slab: the top face of cell (0, 0, -4) minus the casing square, UVs from the darkPlanks tile (top face)
    const [u0, v0, u1, v1] = faceUV("darkPlanks", 0);
    const o = HW / 2 + RING; // casing half width
    const cx = HOLE[0];
    const cz = HOLE[2];
    const rects: [number, number, number, number][] = [
      [0, cx - o, -4, -3],
      [cx + o, 1, -4, -3],
      [cx - o, cx + o, cz + o, -3],
      [cx - o, cx + o, -4, cz - o],
    ];
    const P: number[] = [];
    const U: number[] = [];
    const I: number[] = [];
    for (const [xa, xb, za, zb] of rects) {
      const b = P.length / 3;
      for (const [x, z] of [[xa, zb], [xb, zb], [xb, za], [xa, za]] as [number, number][]) {
        P.push(x, 1, z);
        U.push(u0 + (u1 - u0) * x, v0 + (v1 - v0) * (1 - (z + 4)));
      }
      I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const slab = new THREE.BufferGeometry();
    slab.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    slab.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    slab.setIndex(I);
    // the inside falls away to black within ~20 cm, so from the 3/4 high angle the opening reads as a deep hole
    const steel = new THREE.Color("#9aa6b2");
    const tube = gradientBox(HW, 2.4, HW, steel, 0.2);
    const sleeve = gradientBox(PIPE_W + 0.004, 2.4, PIPE_W + 0.004, new THREE.Color("#8e99a6"), 0.32);
    return {
      slab,
      slabMat: new THREE.MeshBasicMaterial({ map: getAtlas(), alphaTest: 0.5 }),
      tube,
      tubeMat: new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }),
      sleeve,
      sleeveMat: new THREE.MeshBasicMaterial({ vertexColors: true }),
      ring: basic("#b4bec8"),
      ringDark: basic("#6b7682"),
      pipe: basic("#8e99a6"), // mid steel: the pipe leads the eye into the hole without outshining it
    };
  }, []);
  const [x, y, z] = HOLE;
  const o = HW / 2 + RING / 2;
  return (
    <group>
      <mesh geometry={parts.slab} material={parts.slabMat} />
      {/* steel casing ring, flush with the deck, with a dark inner lip */}
      {[
        [0, o, HW + 2 * RING, RING],
        [0, -o, HW + 2 * RING, RING],
        [o, 0, RING, HW],
        [-o, 0, RING, HW],
      ].map(([dx, dz, sx, sz], i) => (
        <mesh key={i} material={parts.ring} position={[x + dx, y + 0.002, z + dz]}>
          <boxGeometry args={[sx, 0.004, sz]} />
        </mesh>
      ))}
      {[
        [0, HW / 2 + 0.008, HW + 0.032, 0.016],
        [0, -HW / 2 - 0.008, HW + 0.032, 0.016],
        [HW / 2 + 0.008, 0, 0.016, HW],
        [-HW / 2 - 0.008, 0, 0.016, HW],
      ].map(([dx, dz, sx, sz], i) => (
        <mesh key={`d${i}`} material={parts.ringDark} position={[x + dx, y + 0.0045, z + dz]}>
          <boxGeometry args={[sx, 0.003, sz]} />
        </mesh>
      ))}
      {/* the inside of the hole: steel at the lip, black 0.7 m down */}
      <mesh geometry={parts.tube} material={parts.tubeMat} position={[x, y - 1.2, z]} />
      {/* the drill pipe goes down into it (and into the dark) */}
      <group position={[x, 0, z]} rotation={[0, spin, 0]}>
        <mesh material={parts.pipe} position={[0, y + 5, 0]}>
          <boxGeometry args={[PIPE_W, 10, PIPE_W]} />
        </mesh>
        <mesh geometry={parts.sleeve} material={parts.sleeveMat} position={[0, y - 1.2, 0]} />
      </group>
    </group>
  );
};
const S02: React.FC = () => {
  const s = useShot();
  const y1970 = s.hit("1970");
  const soviet = s.hit("Soviet");
  const real = s.hit("real");
  const hole = s.at("hole");
  const n23 = s.hit("23");
  const plate = s.hit("plate");
  const look: Vec3 = [0.72, 0.95, -3.4];
  const cam: CamKey[] = [
    { f: -8, pos: [7.6, 1.5, 12.8], look: [0.5, 7.4, -3.5], fov: 62, creep: 0.003 },
    { f: real + 6, pos: [6.6, 1.3, 11.2], look: [0.5, 7.8, -3.5], fov: 60, ease: "glide", dur: 30, creep: 0.003 },
    // crane up and over the scientists' hard hats (they drop out under the frame) and tilt down to the foot of the
    // tower: by "hole" the pipe goes into the small steel-ringed hole in the middle of the deck
    { f: hole, pos: [0.85, 5.6, 2.2], look: [0.55, 1.0, -3.4], fov: 32, ease: "glide", dur: Math.max(14, hole - real - 6), creep: 0.002 },
    // burst in to a steep 3/4 high angle: the opening falls away to black around the pipe, the plate lands beside it
    { f: n23 + 3, pos: [0.9, 3.5, -1.62], look, fov: 35, ease: "burst", dur: 13, creep: 0.0015 },
  ];
  const kicks = [plate + 6];
  const drop = clamp((s.f - (plate - 1)) / 6);
  const plateY = HOLE[1] + 0.012 + (1 - drop) * (1 - drop) * 1.2;
  const dim = s.f < n23 ? 0 : backOut(clamp((s.f - n23) / 8), 2.2);
  const P = screen(cam, s.f, kicks);
  // the dimension line runs along the hole's near lip, edge to edge (23 cm); its ticks point up across the opening
  const lipL = P([HOLE[0] - HW / 2, HOLE[1], HOLE[2] + HW / 2]);
  const lipR = P([HOLE[0] + HW / 2, HOLE[1], HOLE[2] + HW / 2]);
  const tipL = P([HOLE[0] - HW / 2, HOLE[1], HOLE[2] + HW / 2 - 0.075]);
  const tipR = P([HOLE[0] + HW / 2, HOLE[1], HOLE[2] + HW / 2 - 0.075]);
  const mid: [number, number] = [(lipL[0] + lipR[0]) / 2, (lipL[1] + lipR[1]) / 2];
  const half = (k: [number, number]): [number, number] => [mid[0] + (k[0] - mid[0]) * dim, mid[1] + (k[1] - mid[1]) * dim];
  const turn = smootherstep(invLerp(real + 14, hole - 2, s.f));
  return (
    <AbsoluteFill>
      <Stage look="overcast" ink={false} cam={cam} kicks={kicks} dof={(f) => (f > n23 - 4 ? 6 : 0)} focus={look}>
        <VoxelWorld build={tundra} />
        <CloudLayer y={40} seed={5} />
        <Rain kind="snow" count={260} at={-150} spread={420} center={[0, 0, -2]} half={[14, 12]} height={16} ground={-2} seed={4} scale={1.6} />
        <DeckHole spin={s.f * 0.5} />
        {s.f >= plate - 1 ? <PixelItem kind="plate" position={[PLATE_X, plateY, HOLE[2]]} rotation={[-Math.PI / 2, 0, 0]} size={0.29} /> : null}
        <Blocky spec={SCI_A} at={[1.1, 0, 1.3]} yaw={lerp(34, 187, turn)} poses={[[0, "pointUp"], [real + 12, "idle"]]} faces={[[0, "happy"]]} />
        <Blocky spec={SCI_B} at={[3.5, 0, 0.7]} yaw={lerp(-14, -144, turn)} poses={[[0, "lookUp"], [real, "celebrate"], [real + 30, "idle"]]} faces={[[0, "neutral"], [real, "happy"]]} />
      </Stage>
      <PixelTag at={y1970} out={hole - 4} text="1970" x={540} y={222} size={106} color="#ffe14d" />
      {/* where and who, with the sound off (research.md row 1: the Kola Superdeep Borehole, USSR): a smaller line
          (~37 px caps) stacked under the year, popping as "Soviet" is said; its box ends above the tower's beacon */}
      <PixelTag at={soviet} out={hole - 4} text="KOLA, USSR" x={540} y={359} size={60} />
      {dim > 0 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <Svg>
            <Line a={half(lipL)} b={half(lipR)} width={7} />
            {dim > 0.6 ? (
              <>
                <Line a={lipL} b={tipL} width={7} />
                <Line a={lipR} b={tipR} width={7} />
              </>
            ) : null}
          </Svg>
          {/* the label hangs from the middle of the line (its top edge touches it) */}
          <Label f={s.f} at={n23 + 2} x={mid[0]} y={mid[1] + 54} text="23 cm" size={64} panel />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 going down
// "For nineteen years, the drill went down. One kilometer. Five. Ten." / "At 12,262 meters, it became the deepest hole humans have ever made."
// A wide, deep cross-section: the camera pulls back as the hole grows, until it is a hairline from a tiny tower down
// to the bit, with 1, 5 and 10 km marks beside it. Depth on screen = the gauge value (12,262 m = 72 blocks).
const BOTTOM = 72; // blocks for 12,262 m
const KMB = BOTTOM / 12.262; // blocks per km
const tipAt = (depthM: number) => 1 - (depthM / 1000) * KMB; // the bit's tip y for a depth in metres
/** caption band test for screen labels: 1 well clear of the caption line (centre y ~1219), 0 on it */
const offCaptions = (y: number) => clamp((Math.abs(y - 1219) - 92) / 40);
const crossSection = (v: Voxels) => {
  // the rock under the surface (the y = 0 snow strip is its own world, see snowStrip)
  for (let x = -28; x <= 60; x++) for (let y = -100; y <= -1; y++) for (const z of [-1, 0]) v.set(x, y, z, rockAt(x, y, z, "snowBlock", -30, -96));
  for (let y = -(BOTTOM + 2); y <= -1; y++) v.set(0, y, 0, null); // the shaft, front half only (the plug fills it)
  // a small derrick over the hole (tiny in the wide shot); the pipe runs down the open middle at z = 0.5
  for (let y = 1; y <= 4; y++) for (const x of [-2, 3]) for (const z of [-1, 0]) v.set(x, y, z, "ironBlock");
  for (let x = -2; x <= 3; x++) v.set(x, 4, -1, "wool_red");
  for (let y = 5; y <= 7; y++) for (const x of [-1, 2]) for (const z of [-1, 0]) v.set(x, y, z, "ironBlock");
  for (let x = -1; x <= 2; x++) v.set(x, 7, -1, "wool_red");
  v.box(-1, 8, -1, 2, 8, -1, "ironBlock").set(-1, 8, 0, "ironBlock").set(2, 8, 0, "ironBlock").set(0, 9, -1, "glow");
};
/** One block of packed snow on top, the same snowy site as s02. Its face is lit 1.5x so it reads as white snow against
 *  the pale overcast sky even in the widest frame (at 1x it had the sky's own grey and vanished into it). `lid` keeps
 *  the shaft's front cell until the bit has drilled through it. The camera never sees its (brighter) top face. */
const SNOW_K = 1.5;
const snowLight = (x: number, y: number, z: number): [number, number, number] => {
  const [r, g, b] = cutLight(BOTTOM)(x, y, z);
  return [r * SNOW_K, g * SNOW_K, b * SNOW_K * 1.03];
};
const snowStrip = (v: Voxels, lid: boolean) => {
  for (let x = -28; x <= 60; x++) for (const z of [-1, 0]) if (lid || x !== 0 || z !== 0) v.set(x, 0, z, "snowBlock");
};
const S03: React.FC = () => {
  const s = useShot();
  const nineteen = s.hit("nineteen");
  const went = s.at("went");
  const one = s.hit("One");
  const five = s.hit("Five");
  const ten = s.hit("Ten");
  const n12 = s.hit("12,262");
  const deepest = s.hit("deepest");
  const humans = s.at("humans");
  // the depth lands exactly on each spoken number, then holds
  const depth = kf(s.f, [[went, 0], [one, 1000], [five - 14, 1000], [five, 5000], [ten - 12, 5000], [ten, 10000], [n12, 10000], [n12 + 14, 12262]]);
  const tip = tipAt(depth);
  const bitY = tip + 0.5;
  const cut = Math.floor(tip + 0.5);
  const stopped = s.f >= n12 + 14;
  // only sourced years (research.md rows 1 and 3): 1970 while the drill runs, 1989 the moment 12,262 m lands
  const landed = n12 + 14;
  const metres = s.f >= n12;
  // frame = vertical span (m) + centre y + the shaft's screen x
  const T = Math.tan((38 / 2) * (Math.PI / 180));
  const K = (f: number, span: number, cy: number, sx: number, extra: Partial<CamKey> = {}): CamKey => {
    const cx = 0.5 + ((540 - sx) * span) / 1920;
    return { f, pos: [cx, cy, 0.5 + span / 2 / T], look: [cx, cy, 0.5], fov: 38, ...extra };
  };
  const cam: CamKey[] = [
    K(-8, 12.5, 0.2, 470, { creep: 0.002 }),
    K(went, 13, -0.3, 470, { creep: 0.002, dur: 24 }),
    // (the 1 km mark pops at y ~1030, above the caption band)
    K(one + 6, 22, -4.3, 440, { dur: 24 }),
    // (centre a little higher than the bit would ask: the tower top stays under the gauge row)
    K(five + 6, 60, -11, 380, { dur: 26 }),
    K(ten + 6, 116, -28.8, 320, { dur: 26 }),
    // the whole hole: the 10 km label below the caption band, the 1 km label under the badge, the bit above the
    // bottom UI
    K(n12 + 16, 140, -26.7, 300, { dur: 30, creep: 0.0008 }),
    // after the record: dive toward the bit ("down there"), the bit above the caption band
    K(s.dur + 8, 26, tipAt(12262) + 0.5 - 0.8, 470, { dur: Math.max(20, s.dur + 8 - humans), creep: 0 }),
  ];
  const kicks = [deepest + 5];
  // (screen() re-poses one shared camera: take the burst-frame point first, then the live projector)
  const confettiO = screen(cam, deepest - 3, kicks)([0.5, tipAt(12262), 0.6]);
  const P = screen(cam, s.f, kicks);
  const marks: [number, number, string][] = [
    [1, one, "1 KM"],
    [5, five, "5 KM"],
    [10, ten, "10 KM"],
  ];
  return (
    <AbsoluteFill>
      {/* the same pale overcast sky as the tundra in s02 */}
      <Stage look="overcast" ink={false} fog={null} cam={cam} kicks={kicks}>
        <VoxelWorld build={crossSection} light={cutLight(BOTTOM)} />
        {/* the rock still in the shaft below the bit: one small re-mesh per drilled block */}
        <VoxelWorld
          deps={[cut]}
          light={cutLight(BOTTOM)}
          build={(v) => {
            for (let y = -(BOTTOM + 2); y < cut; y++) v.set(0, y, 0, rockAt(0, y, 0, "snowBlock", -30, -96));
          }}
        />
        <CloudLayer y={44} seed={5} />
        <Drill x={0.5} z={0.5} top={8.5} y={bitY} spin={stopped ? 0 : s.f * 0.9} />
        {!stopped && s.f >= went ? <PixelBurst kind="sparks" face at={Math.floor(s.f / 6) * 6} origin={[0.5, tip + 0.08, 0.95]} count={10} power={1.6} up={1.2} life={10} size={0.07} glow={2.2} seed={Math.floor(s.f / 6)} /> : null}
      </Stage>
      {/* depth marks beside the hole */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <Svg>
          {/* thick ticks (and labels) step aside while a camera move carries them across the caption line */}
          {marks.map(([km, at]) => {
            if (s.f < at) return null;
            const [x, y] = P([1.05, 1 - km * KMB, 1.0]);
            const g = smootherstep(invLerp(at, at + 6, s.f));
            return <Line key={km} a={[x + 8, y]} b={[x + 8 + 46 * g, y]} width={15} opacity={offCaptions(y)} />;
          })}
          {/* the drill stops: one square shock ring at the bottom of the hole */}
          {s.f >= n12 + 14 && s.f < n12 + 30 ? <StopRing f={s.f} at={n12 + 14} at2={P([0.5, tip, 0.6])} /> : null}
          {/* the record: big square paper confetti bursts out of the stopped bit, below the caption band */}
          <Confetti f={s.f} at={deepest - 3} o={confettiO} seed={8} />
        </Svg>
        {/* each depth label in a small dark box with the gauge's white border, Silkscreen 58 (~36 px caps) */}
        {marks.map(([km, at, text]) => {
          const [x, y] = P([1.05, 1 - km * KMB, 1.0]);
          return <Label key={km} f={s.f} at={at + 2} x={x + 66} y={y} text={text} size={58} anchor="left" panel opacity={offCaptions(y)} />;
        })}
      </AbsoluteFill>
      <PixelGauge at={went - 2} label="DEPTH" value={metres ? Math.round(depth) : Math.round(depth / 1000)} unit={metres ? " m" : " km"} x={395} y={200} size={58} />
      <PixelTag at={nineteen} out={landed - 5} text="1970" x={868} y={200} size={56} color="#9ed8ff" />
      <PixelTag at={landed} text="1989" x={868} y={200} size={56} color="#9ed8ff" />
      {/* right of the depth labels: the "1 KM" mark must stay readable under it */}
      <PixelStamp at={deepest - 3} top="#1" bottom="DEEPEST HOLE" x={772} y={452} rot={-6} size={56} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the deep (s04 + s05)
const SOFT: [number, number][] = [
  [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1], [-2, 0], [2, 0], [0, -2],
];
// s04: magma veins inside the 3/4 frame (checked by projection: right of the bit, the slot's back wall above it, below
// and at the edges; none behind the thermometer), popping in one by one after "wrong": [x, y, z, delay, type]
const MAGMA4: [number, number, number, number, BlockType][] = [
  [1, 0, 0.02, 0, "magma"], [0, 1, -0.98, 8, "magma"], [1, -2, 0.02, 16, "magma"],
  [2, -1, 0.02, 24, "lava"], [-1, -1, 0.02, 32, "magma"], [-1, 1, 0.02, 40, "magma"],
];
// s04 "hotter": a second wave in the close frame after the push-in (checked by projection: the rock under the bit,
// the back wall behind it, the cells right of it above and below); magma, as the soft block under the bit in s05
const MAGMA4B: [number, number, number, number][] = [
  [0, -1, 0.02, 0], [1, 1, 0.02, 4], [0, 0, -0.98, 8], [1, -1, 0.02, 12],
];
const MAGMA5: [number, number][] = [
  [-3, -2], [2, -3], [-2, 2], [3, 1], [-4, 0], [1, -4], [4, -2], [-3, 3], [3, 4], [-1, -4], [-5, -3], [5, 3], [-4, 5], [2, 6],
];
const deepRock = (x: number, y: number, z: number): BlockType => {
  const r = rand(23, x * 7919 + y * 104729 + z * 31);
  return r < 0.04 ? "redOre" : r < 0.07 ? "goldOre" : r < 0.1 ? "obsidian" : "deepstone";
};
const Deep: React.FC<{ soft?: boolean; up?: number; tint?: [number, number, number] }> = ({ soft = false, up = 14, tint }) => (
  <VoxelWorld
    deps={[soft, up]}
    tint={tint}
    light={cutLight(1e9, 1)}
    build={(v) => {
      for (let x = -20; x <= 20; x++) for (let y = -10; y <= up; y++) for (const z of [-1, 0]) v.set(x, y, z, deepRock(x, y, z));
      for (let y = 0; y <= up; y++) v.set(0, y, 0, null); // front half only: the back wall stays
      if (soft) {
        for (const [x, y] of SOFT) v.set(x, y, 0, null);
        v.set(0, -1, 0, null); // the toffee block under the bit is <SoftRock>
      }
    }}
  />
);
const Heat: React.FC<{ k: number }> = ({ k }) =>
  k > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(255,90,20,0.0) 20%, rgba(255,60,10,0.55) 100%)", opacity: k, mixBlendMode: "screen", pointerEvents: "none" }} /> : null;

// "But down there, something was wrong." / "The rock was 180 degrees Celsius, far hotter than anyone expected."
const S04: React.FC = () => {
  const s = useShot();
  const wrong = s.hit("wrong");
  const rock = s.at("rock");
  const at180 = s.at("180");
  const hotter = s.hit("hotter");
  const expected = s.hit("expected");
  // dark, then one beat of trouble on "wrong", then the slow turn to red-hot, and one more step on "hotter"
  const heat = smootherstep(invLerp(wrong + 8, at180 + 24, s.f));
  const heat2 = smootherstep(invLerp(hotter, expected, s.f));
  const jolt = s.f >= wrong && s.f < wrong + 14 ? Math.sin((s.f - wrong) * 2.7) * 0.075 * (1 - (s.f - wrong) / 14) : 0;
  const shake = jolt + (s.f >= wrong ? Math.sin(s.f * 1.9) * 0.025 * heat : 0);
  const flash = s.f >= wrong ? Math.max(0, 1 - (s.f - wrong) / 12) : 0;
  const flashHot = s.f >= hotter ? Math.max(0, 1 - (s.f - hotter) / 10) : 0;
  const cam: CamKey[] = [
    // a side 3/4 from the right, a little above the bit: the bit stands whole at the bottom of its slot, off-centre
    // (left third, tip above the caption band), the rock face that will turn red-hot on the right
    { f: -8, pos: [3.5, 1.35, 6.9], look: [0.95, 0.2, 0.45], fov: 44, creep: 0.002 },
    // "wrong": a jolt, the frame tips to a Dutch angle and steps closer
    { f: wrong + 7, pos: [3.3, 1.3, 6.5], look: [0.92, 0.18, 0.45], fov: 44, roll: 6, ease: "burst", dur: 9, creep: 0.002 },
    // the heat rises: a slow push in
    { f: at180 + 4, pos: [3.1, 1.25, 6.1], look: [0.9, 0.2, 0.45], fov: 43, roll: 6, ease: "glide", dur: 34, creep: 0.003 },
    // "hotter": a heat flash, a kick and a burst in to the bit (35 % bigger) while the rock round it lights up; the
    // tip stays above the caption band
    { f: hotter + 9, pos: [2.5, 1.05, 4.9], look: [0.82, 0.08, 0.45], fov: 40, roll: 3, ease: "burst", dur: 10, creep: 0.004 },
  ];
  // the rock itself turns from cold dark stone to dull red-hot as the reading climbs, a notch hotter on "hotter"
  const rockTint: [number, number, number] = [1 + 0.75 * heat + 0.3 * heat2, 1 - 0.12 * heat + 0.04 * heat2, 1 - 0.3 * heat - 0.06 * heat2];
  // the thermometer's 100 deg level (half way up its 20-180 tube, the expected reading in research.md row 4)
  const thermoShake = Math.sin(s.f * 2.4) * 4;
  const expK = s.f >= expected ? smootherstep(invLerp(expected, expected + 6, s.f)) : 0;
  // the reading counts in half a second and lands as "180" is said, then holds
  const temp = s.f < at180 - 15 ? 20 : lerp(20, 180, easeOut(invLerp(at180 - 15, at180, s.f)));
  const drilling = s.f < wrong + 2;
  const sparkAt = Math.floor(s.f / 6) * 6;
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      <Stage look="night" ink={false} sky={false} fog={null} cam={cam} kicks={[wrong + 1, hotter + 1, expected + 1]} kickAmp={0.05}>
        <Deep up={30} tint={rockTint} />
        {MAGMA4.map(([x, y, z, d, type]) => (
          <Block key={`${x},${y},${z}`} type={type} at={[x, y, z]} pop={wrong + 4 + d} size={1.03} />
        ))}
        {MAGMA4B.map(([x, y, z, d]) => (
          <Block key={`h${x},${y},${z}`} type="magma" at={[x, y, z]} pop={hotter + 2 + d} size={1.03} />
        ))}
        {/* the tip rests on the rock (tip bottom = y - 0.5); it jumps on the jolt */}
        <Drill x={0.5 + shake} z={0.5} top={32} y={0.5 + Math.abs(shake) * 1.2} spin={s.f * (0.9 - 0.6 * heat)} />
        {drilling ? <PixelBurst kind="sparks" face at={sparkAt} origin={[0.5, 0.03, 0.82]} dir={[0.5, 0.6, 1]} cone={0.9} count={10} power={1.5} up={1.0} life={10} size={0.05} glow={2.2} seed={sparkAt} /> : null}
        <PixelBurst kind="chips" type="deepstone" at={wrong} origin={[0.5, 0.08, 0.85]} spread={[0.2, 0, 0.1]} count={14} power={2.2} up={1.6} life={22} size={0.1} seed={6} />
      </Stage>
      <Heat k={heat * 0.9 + heat2 * 0.1} />
      {flash > 0 ? <AbsoluteFill style={{ background: "rgb(190,36,18)", opacity: 0.5 * flash, mixBlendMode: "screen", pointerEvents: "none" }} /> : null}
      {/* "hotter": one hot white-orange flash */}
      {flashHot > 0 ? <AbsoluteFill style={{ background: "rgb(255,150,60)", opacity: 0.42 * flashHot, mixBlendMode: "screen", pointerEvents: "none" }} /> : null}
      {/* the reading sits beside the tube's hot top end, so the "expected" tag lower down can never be read with it */}
      <PixelThermo at={rock - 2} x={800} y={390} fill={invLerp(20, 180, temp)} value={temp} unitSize={84} readout="top" />
      {/* "expected": a line across the tube at its 100 deg level (half way up), far below the full reading, with the
          tag hanging under it (it shakes with the tube) */}
      {expK > 0 ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <Svg>
            <Line a={[532 + thermoShake, 390]} b={[532 + thermoShake + 196 * expK, 390]} width={8} />
          </Svg>
          <Label f={s.f} at={expected + 2} x={656 + thermoShake} y={440} text="EXPECTED" size={52} color="#ffe14d" anchor="left" panel />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** The block under the bit, gone soft: a subdivided magma block whose top sags into a dent around the bit while its
 *  sides bulge and droop like warm toffee. Shading follows the deformed normals (the world's top 1.0 / front 0.8 /
 *  side 0.6 / bottom 0.5 rule), so the sag reads in a still. */
const SAG = 0.15; // top sag (m) when fully soft; the bit rests in the dent below it
const SoftRock: React.FC<{ at: Vec3; type: BlockType; soft: number; dent: number; f: number }> = ({ at, type, soft, dent, f }) => {
  const { geo, base, mat, tile } = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const uv = g.attributes.uv;
    const per = uv.count / 6; // vertices per face: +x, -x, +y, -y, +z, -z
    for (let i = 0; i < uv.count; i++) {
      const face = Math.floor(i / per);
      const [u0, v0, u1, v1] = faceUV(type, face === 2 ? 0 : face === 3 ? 2 : 1);
      uv.setXY(i, u0 + (u1 - u0) * uv.getX(i), v0 + (v1 - v0) * uv.getY(i));
    }
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(uv.count * 3), 3));
    return {
      geo: g,
      base: Float32Array.from(g.attributes.position.array as Float32Array),
      mat: new THREE.MeshBasicMaterial({ map: getAtlas(), vertexColors: true }),
      tile: EMISSIVE.has(type) ? 2.6 : 1,
    };
  }, [type]);
  const pos = geo.attributes.position;
  const sag = SAG * soft;
  const bulge = 0.15 * soft;
  const droop = 0.07 * soft;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const y = base[i * 3 + 1];
    const z = base[i * 3 + 2];
    const h = y + 0.5; // 0 bottom .. 1 top
    const r2 = x * x + z * z;
    const r = Math.sqrt(r2);
    // horizontal bulge, peaking below the middle (it droops), with a slow living wave
    const b = bulge * Math.exp(-(((h - 0.36) / 0.32) ** 2)) * (1 + 0.12 * Math.sin(f * 0.22 + h * 5));
    let dy = -sag * h * h;
    dy -= dent * Math.exp(-r2 / 0.03) * h ** 3; // the dent under the bit
    dy += dent * 0.3 * Math.exp(-((r - 0.24) ** 2) / 0.005) * h ** 4; // the pushed-up lip around it
    // the front top slumps forward and down over the face, like warm toffee (the centre and back stay put)
    const front = clamp((z - 0.05) / 0.45);
    const dz = droop * h * h * front * (1 + 0.1 * Math.sin(f * 0.17 + x * 4));
    dy -= droop * 0.6 * h ** 3 * front;
    pos.setXYZ(i, x * (1 + 2 * b), y + dy, z * (1 + 2 * b) + dz);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal;
  const col = geo.attributes.color;
  for (let i = 0; i < col.count; i++) {
    const nx = nrm.getX(i);
    const ny = nrm.getY(i);
    const nz = nrm.getZ(i);
    const sh = clamp(0.75 + 0.25 * ny + 0.05 * Math.abs(nz) - 0.15 * Math.abs(nx), 0.42, 1);
    const k = Math.pow(sh, 2.2) * tile;
    col.setXYZ(i, k, k, k);
  }
  col.needsUpdate = true;
  geo.computeBoundingSphere();
  return <mesh geometry={geo} material={mat} position={[at[0] + 0.5, at[1] + 0.5, at[2] + 0.5]} />;
};

// "You see, at that heat, rock stops acting like rock. It starts to behave like plastic." / "The drill simply could not go any deeper."
const S05: React.FC = () => {
  const s = useShot();
  const stops = s.hit("stops");
  const plastic = s.hit("plastic");
  const drill = s.hit("drill");
  const deeper = s.hit("deeper");
  const soft = smootherstep(invLerp(stops, plastic + 6, s.f));
  const press = smootherstep(invLerp(drill, deeper, s.f));
  const dent = 0.05 + 0.1 * soft + 0.16 * press;
  const stuck = s.f >= deeper;
  const grind = s.f >= drill && !stuck ? 1 : 0;
  // the bit rests in the dent (the top sags by SAG * soft as well); it grinds, then is pressed in and stops
  const jx = grind * Math.sin(s.f * 3.1) * 0.012;
  const tip = -SAG * soft - dent + 0.006;
  const bitY = tip + 0.5 + grind * Math.abs(Math.sin(s.f * 0.9)) * 0.015;
  // close on the yellow-banded bit, but wide enough that the soft block's sagging top and bulging sides are in frame;
  // the contact point sits at y ~990 px, above the caption band, so the caption lies on rock
  const cam: CamKey[] = [
    { f: -8, pos: [1.55, 1.12, 5.1], look: [0.55, -0.2, 0.5], fov: 38, creep: 0.0018 },
    { f: drill + 8, pos: [1.35, 0.95, 4.6], look: [0.55, -0.22, 0.5], fov: 37, ease: "glide", dur: 24, creep: 0.0025 },
  ];
  const sparkAt = Math.floor(s.f / 7) * 7;
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      <Stage look="night" ink={false} sky={false} fog={null} cam={cam} kicks={[deeper + 1]}>
        <Deep soft />
        {MAGMA5.map(([x, y]) => (
          <Block key={`${x},${y}`} type={(x + y) % 4 === 0 ? "lava" : "magma"} at={[x, y, 0.02]} size={1.03} />
        ))}
        {SOFT.map(([x, y], i) => (
          <Block key={`${x},${y}`} type={i % 3 === 2 ? "magma" : "deepstone"} at={[x, y, 0]} wobble={0.24 * soft * (0.7 + (i % 3) * 0.2)} tint={DEEP_TINT} />
        ))}
        <SoftRock at={[0, -1, 0]} type="magma" soft={soft} dent={dent} f={s.f} />
        <Drill x={0.5 + jx} z={0.5} top={16} y={bitY} spin={stuck ? 0.4 : s.f * (s.f < stops ? 0.6 : 0.35)} />
        {/* grinding: small square sparks from the contact point */}
        {s.f < stops || grind ? <PixelBurst kind="sparks" face at={sparkAt} origin={[0.5, tip + 0.04, 0.8]} dir={[0, 0.55, 1]} cone={0.9} count={grind ? 18 : 8} power={grind ? 2.6 : 1.4} up={0.8} life={11} size={0.04} glow={2} seed={sparkAt} /> : null}
        {/* "deeper": the bit is pressed in and stops; a spray of square sparks out of the contact point */}
        <PixelBurst kind="sparks" face at={deeper} origin={[0.5, tip + 0.04, 0.82]} dir={[0, 0.75, 1]} cone={1.0} count={40} power={3.2} up={1.4} life={18} size={0.05} glow={2.2} seed={91} />
      </Stage>
      <Heat k={0.8} />
      <PixelTag at={plastic} out={drill - 4} text="LIKE PLASTIC" x={540} y={215} size={76} color="#ffb04a" />
      <PixelTag at={deeper} text="STUCK" x={540} y={215} size={112} color="#ff5a4a" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 the scale
// "So how far did they get? The center of the Earth is 6,371 kilometers down." / "After nineteen years of digging, they made it 0.2 percent of the way."
const R = 15;
const PIP_AT: Vec3 = [1.3, R, -0.8];
/** peering down at the hole at his feet: head well down, a slight forward lean */
const PEER: BlockyPose = { armL: [-6, 4], armR: [-22, 4], legL: 0, legR: 0, head: [0, 38], lean: 6 };
/** "oh well": both open hands out to the sides, head tipped, shoulders up */
const SHRUG: BlockyPose = { armL: [-34, 62], armR: [-34, 62], legL: 0, legR: 0, head: [8, -4], bob: 0.03 };
const planet = (v: Voxels) => {
  v.planet(
    R,
    [
      // the crust: one continuous grey band (1-2 blocks) under the surface on both cut faces, the layer the hole is in
      [0.85, "stone"],
      [0.56, "magma"],
      [0.27, "lava"],
      [0, "glow"],
    ],
    true,
    (x, y, z) => {
      const n = Math.sin(x * 0.45 + 1) + Math.cos(z * 0.5 + y * 0.35) + Math.sin(y * 0.6 + x * 0.2);
      if (Math.abs(y) > R - 3) return "snow";
      return n > 0.35 ? "grass" : n > 0.1 ? "sand" : "sea"; // opaque sea: a crisp outline against space
    },
  );
};
const S06: React.FC = () => {
  const s = useShot();
  const center = s.hit("center");
  const n6371 = s.hit("6,371");
  const after = s.at("After");
  const digging = s.at("digging");
  const it02 = s.at("it 0.2"); // the caption chunk "it 0.2 percent" appears here
  const n02 = s.hit("0.2");
  const mat = useMemo(() => ({ red: basic("#ff3b30", 2.4) }), []);
  const stars = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 260; i++) {
      const a = rand(3, i) * Math.PI * 2;
      const b = (rand(5, i) - 0.5) * Math.PI;
      const d = 180 + rand(7, i) * 60;
      const b0 = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      b0.translate(Math.cos(a) * Math.cos(b) * d, Math.sin(b) * d, Math.sin(a) * Math.cos(b) * d);
      pos.push(...(b0.toNonIndexed().attributes.position.array as Float32Array));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);
  const starMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#dfe8ff", fog: false }), []);
  // space: the bible's darkest night, near black (an own backdrop; the night dome reads royal blue)
  const spaceMat = useMemo(() => new THREE.MeshBasicMaterial({ color: untone("#0a0f26"), side: THREE.BackSide, fog: false, depthWrite: false }), []);
  const lineT = easeOut(invLerp(n6371 - 2, n6371 + 14, s.f)); // lands while "6,371" is still being said
  const km = Math.round(6371 * lineT);
  const yaw = lerp(38, 47, s.f / Math.max(1, s.dur));
  const far = orbit([0, 3, 0], yaw, 20, 62);
  const pay = orbit([0, 10.5, 0], lerp(45.4, 46.6, invLerp(it02 - 4, s.dur, s.f)), 10, 40);
  // the shrug: Pip ~24 % of the frame height under the number, the red tick by his feet and the cap's curve below
  const shrugAt: Vec3 = [0.75, 15.0, -0.35];
  const close = orbit(shrugAt, lerp(44, 46.5, invLerp(n02, s.dur, s.f)), 16, 13);
  const cam: CamKey[] = [
    { f: -10, pos: orbit([0, 8, 0], 38, 24, 34), look: [0, 9, 0], fov: 40, creep: 0.001 },
    { f: center + 6, pos: far, look: [0, 2, 0], fov: 40, ease: "glide", dur: Math.max(18, center + 10), creep: 0.0012 },
    { f: after + 10, pos: far, look: [0, 2.4, 0], fov: 39, ease: "linear", creep: 0.0012 },
    // the payoff: the whole line from the pole to the centre, the hero on top, room for the number above
    { f: it02 - 4, pos: pay, look: [0, 10.5, 0], fov: 40, ease: "glide", dur: Math.max(20, it02 - 14 - after), creep: 0.0012 },
    // once 0.2 % has landed: ease in toward the pole for the shrug
    { f: n02 + 30, pos: close, look: shrugAt, fov: 40, ease: "glide", dur: 24, creep: 0.001 },
  ];
  const kicks = [n02 + 1];
  const P = screen(cam, s.f, kicks);
  const top = P([0.12, R, 0.12]);
  const mid = P([0.12, 0, 0.12]);
  const end: [number, number] = [lerp(top[0], mid[0], lineT), lerp(top[1], mid[1], lineT)];
  const dimK = smootherstep(invLerp(after, after + 10, s.f));
  const tick = P([0.12, R - 0.22, 0.12]);
  const lab = P([0.12, R * 0.68, 0.12]);
  const ringK = s.f >= after + 2 ? 1 + 1.2 * (1 - easeOut(invLerp(after + 2, after + 12, s.f))) : 0;
  // the "THE HOLE" tag up and left of the tick (kept 40 px inside the frame's left edge)
  const callout: [number, number] = [Math.max(tick[0] - 210, 205), tick[1] - 92];
  const heroT = invLerp(it02 - 4, it02, s.f);
  const heroS = s.f < it02 - 4 ? 0 : s.f < it02 ? 1.7 - 0.7 * heroT * heroT : 1;
  // Pip peers down at the tick (it is at yaw -52 from where he stands), then turns to camera, drops the pick, shrugs
  const shrugF = n02 + 14;
  const dropF = shrugF - 2;
  const dropK = clamp((s.f - dropF) / 6) ** 2;
  const pipYaw = lerp(-56, 24, smootherstep(invLerp(shrugF - 6, shrugF + 4, s.f)));
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <Stage look="night" ink={false} sky={false} fog={null} cam={cam} kicks={kicks}>
        <mesh material={spaceMat} scale={420} renderOrder={-9} frustumCulled={false}>
          <sphereGeometry args={[1, 24, 12]} />
        </mesh>
        <mesh geometry={stars} material={starMat} layers={3} />
        <VoxelWorld build={planet} />
        {/* the borehole: 0.2 % of the line would be invisible at true scale, so it is a small bright tick */}
        {s.f >= after + 2 ? (
          <mesh material={mat.red} position={[0.12, R - 0.24, 0.12]} scale={backOut(invLerp(after + 2, after + 8, s.f), 2.4)}>
            <boxGeometry args={[0.36, 0.48, 0.36]} />
          </mesh>
        ) : null}
        <Blocky
          spec={PIP}
          at={PIP_AT}
          yaw={pipYaw}
          scale={1.25}
          shadow={0.7}
          poses={[
            [0, PEER],
            [shrugF, SHRUG],
          ]}
          faces={[
            [0, "neutral"],
            [shrugF, "sad"],
          ]}
          item={[
            [0, "pickaxe"],
            [dropF, null],
          ]}
          grip="tool"
          itemSize={0.8}
        />
        {/* he lets the pickaxe drop: it falls from his hand and lands flat on the snow beside him */}
        {s.f >= dropF ? (
          <PixelItem kind="pickaxe" size={1.0} position={[PIP_AT[0] + 0.95, R + 0.035 + 1.05 * (1 - dropK), PIP_AT[2] + 0.3]} rotation={[-Math.PI / 2 + 1.1 * (1 - dropK), 0, 0.6]} />
        ) : null}
      </Stage>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <Svg>
          {/* surface to centre: draws with the count, then dims to a dashed guide */}
          {lineT > 0 ? <Line a={top} b={end} color={dimK > 0 ? "#efe6c4" : "#ffe14d"} width={lerp(8, 6, dimK)} dash="26 16" opacity={lerp(1, 0.62, dimK)} /> : null}
          {lineT >= 1 ? <rect x={mid[0] - 9} y={mid[1] - 9} width={18} height={18} fill="#ffffff" stroke="#141018" strokeWidth={5} opacity={lerp(1, 0.7, dimK)} /> : null}
          {ringK > 0 ? <rect x={tick[0] - 30 * ringK} y={tick[1] - 30 * ringK} width={60 * ringK} height={60 * ringK} fill="none" stroke="#ff5a4a" strokeWidth={6} /> : null}
          {s.f >= digging ? <Line a={[callout[0] + 92, callout[1] + 20]} b={[tick[0] - 32, tick[1] - 18]} color="#ff5a4a" width={5} opacity={smootherstep(invLerp(digging, digging + 5, s.f))} /> : null}
        </Svg>
        {/* the "huge" half of the comparison: white in the gauge's dark box beside the line (above the caption band);
            it steps out as the camera eases in for the shrug */}
        <Label f={s.f} at={after + 4} x={lab[0] - 26} y={lab[1]} text="6,371 KM" size={76} anchor="right" panel opacity={1 - smootherstep(invLerp(n02 + 4, n02 + 10, s.f))} />
        <Label f={s.f} at={digging} x={callout[0]} y={callout[1]} text="THE HOLE" size={56} color="#ff6b5a" />
        {heroS > 0 ? (
          <div style={{ position: "absolute", left: 540, top: 300, transform: `translate(-50%, -50%) scale(${heroS})`, opacity: Math.min(1, 0.5 + heroT), textAlign: "center", fontFamily: font("Silkscreen"), fontWeight: 400, lineHeight: 1, whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 56, color: "#ffffff", textShadow: `${ring("#141018", 5)}, 7px 8px 0 #141018` }}>THEY DUG</div>
            <div style={{ fontSize: 236, color: "#ff5a4a", marginTop: 8, textShadow: `${ring("#141018", 14)}, 20px 22px 0 #141018` }}>0.2%</div>
          </div>
        ) : null}
      </AbsoluteFill>
      <PixelGauge at={n6371 - 2} out={after} label="TO THE CENTER" value={km} unit=" km" y={220} size={50} color="#ffd94a" />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#0a0b10" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06 }} />
);
