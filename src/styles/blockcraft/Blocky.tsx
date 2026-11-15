// <Blocky>: an ORIGINAL box-model voxel character (genre proportions: head 8x8x8, torso 8x12x4, limbs 4x12x4 texels,
// 1 texel = 5.6 cm -> 1.8 m tall). Pixel faces with expressions, keyed poses, planted walk / run / mining swings,
// hand items extruded from 16x16 pixel art. Baked face shading matches the voxel world.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { backOut, blink as blinkAt, invLerp, smootherstep } from "../../core/anim";
import type { Vec3 } from "../../core/types";

export type BlockySpec = {
  skin: string;
  hair: string;
  hairStyle?: "short" | "long" | "bald" | "spiky" | "bob" | "buzz";
  eyes?: string;
  shirt: string;
  shirtAccent?: string;
  shirtStyle?: "tee" | "hoodie" | "jacket" | "armor" | "robe" | "lab" | "suit";
  pants: string;
  shoes?: string;
  hat?: { kind: "cap" | "helmet" | "crown" | "hardhat" | "hood" | "band"; color: string };
  beard?: string;
  emblem?: string;
  seed?: number;
};
export type BlockyFace = "neutral" | "happy" | "shocked" | "angry" | "sad" | "smug" | "scared" | "wink" | "determined" | "sleep" | "talk";
export type BlockyPose = { head?: [number, number]; armL: [number, number]; armR: [number, number]; legL: number; legR: number; bob?: number; lean?: number; crouch?: number };

const P = (armL: [number, number], armR: [number, number], legL = 0, legR = 0, x: Partial<BlockyPose> = {}): BlockyPose => ({ armL, armR, legL, legR, ...x });
/** arm [pitch, roll] in degrees: pitch -90 = straight forward, -180 = up; roll + = outward. legs: pitch. */
export const BPOSES: Record<string, BlockyPose> = {
  idle: P([0, 3], [0, 3]),
  wave: P([0, 3], [-165, 18], 0, 0, { head: [0, -4] }),
  point: P([0, 3], [-88, 4], 0, 0, { head: [0, 0] }),
  pointUp: P([0, 3], [-170, 6], 0, 0, { head: [0, -18] }),
  armsUp: P([-165, 14], [-165, 14], 0, 0, { head: [0, -10], bob: 0.04 }),
  hold: P([-48, 6], [-48, 6]),
  holdOne: P([0, 3], [-45, 0]),
  think: P([-30, 18], [-128, -30], 0, 0, { head: [10, 10] }),
  shrug: P([-28, 38], [-28, 38], 0, 0, { head: [0, 6] }),
  sit: P([-40, 6], [-40, 6], -90, -90, { crouch: 0.37 }),
  scared: P([-120, 20], [-120, 20], 8, -8, { head: [0, 8] }),
  celebrate: P([-160, 30], [-140, 10], 10, -10, { bob: 0.08 }),
  facepalm: P([0, 3], [-140, -40], 0, 0, { head: [0, 18] }),
  crouch: P([-20, 6], [-20, 6], -30, -30, { crouch: 0.15, head: [0, 10] }),
  look: P([0, 3], [0, 3], 0, 0, { head: [35, -6] }),
  lookUp: P([0, 3], [0, 3], 0, 0, { head: [0, -35] }),
  lookDown: P([0, 3], [0, 3], 0, 0, { head: [0, 30] }),
};
/** cinematic walk: the game's legs swing ~69 deg; half reads better on camera */
export const walkB = (phase: number, k = 1): BlockyPose => {
  const a = Math.sin(phase * Math.PI * 2) * 34 * k;
  return P([a, 3], [-a, 3], -a, a, { bob: Math.abs(Math.cos(phase * Math.PI * 2)) * 0.03 * k });
};
export const runB = (phase: number): BlockyPose => {
  const a = Math.sin(phase * Math.PI * 2) * 62;
  return P([a * 0.9, 6], [-a * 0.9, 6], -a, a, { bob: Math.abs(Math.cos(phase * Math.PI * 2)) * 0.07, lean: 8 });
};
/** mining swing, 9-frame loop: raise then chop down */
export const mineB = (f: number): BlockyPose => {
  const u = (f % 9) / 9;
  const pitch = u < 0.45 ? -150 + u * 80 : -114 + (u - 0.45) * 160;
  return P([-10, 4], [-Math.max(20, Math.min(160, -pitch)), 6], 0, 0, { head: [0, 14] });
};

const mixB = (a: BlockyPose, b: BlockyPose, t: number): BlockyPose => {
  const L = (x = 0, y = 0) => x + (y - x) * t;
  const L2 = (x: [number, number] = [0, 0], y: [number, number] = [0, 0]): [number, number] => [L(x[0], y[0]), L(x[1], y[1])];
  return { head: L2(a.head, b.head), armL: L2(a.armL, b.armL), armR: L2(a.armR, b.armR), legL: L(a.legL, b.legL), legR: L(a.legR, b.legR), bob: L(a.bob, b.bob), lean: L(a.lean, b.lean), crouch: L(a.crouch, b.crouch) };
};

// ------------------------------------------------------------------------------------------------ pixel textures
const tex = (w: number, h: number, draw: (px: (x: number, y: number, c: string) => void) => void) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw((x, y, col) => {
    g.fillStyle = col;
    g.fillRect(x, y, 1, 1);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
};
const shadeHex = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  return `#${c.multiplyScalar(k).getHexString()}`;
};
const jitter = (hex: string, seed: number, i: number) => shadeHex(hex, 0.94 + (((Math.sin(seed * 91 + i * 17) * 43758) % 1) + 1) % 1 * 0.12);

function faceTexture(s: BlockySpec, face: BlockyFace, blink: boolean) {
  const sd = s.seed ?? 1;
  return tex(8, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px(x, y, jitter(s.skin, sd, x + y * 8));
    const hairRows = s.hairStyle === "bald" ? 0 : s.hairStyle === "buzz" ? 1 : 2;
    for (let y = 0; y < hairRows; y++) for (let x = 0; x < 8; x++) px(x, y, jitter(s.hair, sd + 3, x + y * 8));
    if (s.hairStyle === "long" || s.hairStyle === "bob") for (let y = 2; y < 6; y++) [0, 7].forEach((x) => px(x, y, jitter(s.hair, sd + 3, x + y)));
    if (s.hairStyle === "spiky") [1, 3, 5].forEach((x) => px(x, 2, s.hair));
    const eye = s.eyes ?? "#3b2a1a";
    const dark = "#2b1d14";
    const white = "#f4f4f4";
    const mouth = "#7a3b2e";
    const eyesShut = blink || face === "sleep";
    // brows
    if (face === "angry" || face === "determined") {
      px(1, 2, dark), px(2, 3, dark), px(6, 2, dark), px(5, 3, dark);
    } else if (face === "sad" || face === "scared") {
      px(2, 2, dark), px(1, 3, dark), px(5, 2, dark), px(6, 3, dark);
    }
    // eyes (row 4): white + iris, looking slightly inward
    if (eyesShut) {
      [1, 2, 5, 6].forEach((x) => px(x, 4, dark));
    } else if (face === "happy" || face === "wink") {
      px(1, 4, dark), px(2, 3, dark), px(3, 4, dark);
      if (face === "wink") [5, 6].forEach((x) => px(x, 4, dark));
      else px(4, 4, dark), px(5, 3, dark), px(6, 4, dark);
    } else if (face === "shocked" || face === "scared") {
      px(1, 3, white), px(2, 3, white), px(1, 4, white), px(2, 4, eye), px(5, 3, white), px(6, 3, white), px(5, 4, eye), px(6, 4, white);
    } else {
      px(1, 4, white), px(2, 4, eye), px(5, 4, eye), px(6, 4, white);
    }
    // beard
    if (s.beard) for (let y = 6; y < 8; y++) for (let x = 1; x < 7; x++) px(x, y, jitter(s.beard, sd + 5, x + y));
    // mouth (row 6)
    if (face === "shocked" || face === "scared" || face === "talk") {
      px(3, 6, mouth), px(4, 6, mouth), px(3, 7, mouth), px(4, 7, mouth);
    } else if (face === "happy" || face === "wink" || face === "smug") {
      px(2, 6, mouth), px(5, 6, mouth), px(3, 7, mouth), px(4, 7, mouth);
      if (face === "smug") px(2, 6, s.skin);
    } else if (face === "sad") {
      px(3, 6, mouth), px(4, 6, mouth), px(2, 7, mouth), px(5, 7, mouth);
    } else if (face === "angry") {
      [2, 3, 4, 5].forEach((x) => px(x, 7, mouth));
    } else {
      [3, 4].forEach((x) => px(x, 6, mouth));
    }
  });
}
const solidTex = (w: number, h: number, base: string, seed: number, paint?: (px: (x: number, y: number, c: string) => void) => void) =>
  tex(w, h, (px) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(x, y, jitter(base, seed, x + y * w));
    paint?.(px);
  });

// baked face shading like the voxel world (sRGB multipliers -> linear)
const SH = [0.6, 0.6, 1.0, 0.5, 0.8, 0.8].map((m) => Math.pow(m, 2.2));
const mats = (faces: THREE.Texture[]) => faces.map((map, i) => new THREE.MeshBasicMaterial({ map, color: new THREE.Color(SH[i], SH[i], SH[i]), transparent: false, alphaTest: 0.5 }));

function buildParts(s: BlockySpec) {
  const sd = s.seed ?? 1;
  const T = 1 / 16;
  const hairSide = (w: number) => solidTex(w, 8, s.hairStyle === "bald" ? s.skin : s.skin, sd, (px) => {
    if (s.hairStyle !== "bald") for (let y = 0; y < (s.hairStyle === "long" ? 7 : 3); y++) for (let x = 0; x < w; x++) px(x, y, jitter(s.hair, sd + 3, x + y * w));
  });
  const headTop = solidTex(8, 8, s.hairStyle === "bald" ? s.skin : s.hair, sd + 3);
  const headBack = solidTex(8, 8, s.hairStyle === "bald" ? s.skin : s.hair, sd + 3, (px) => {
    if (s.hairStyle === "short" || s.hairStyle === "buzz" || s.hairStyle === "spiky") for (let y = 6; y < 8; y++) for (let x = 0; x < 8; x++) px(x, y, jitter(s.skin, sd, x + y));
  });
  const shirtStyle = s.shirtStyle ?? "tee";
  const front = solidTex(8, 12, s.shirt, sd + 7, (px) => {
    if (shirtStyle === "jacket" || shirtStyle === "suit" || shirtStyle === "lab") {
      for (let y = 0; y < 12; y++) [3, 4].forEach((x) => px(x, y, shirtStyle === "suit" ? "#f2f2f2" : jitter(s.shirtAccent ?? "#ffffff", sd, x + y)));
      if (shirtStyle === "suit") for (let y = 1; y < 8; y++) px(y < 7 ? 3 : 4, y, s.shirtAccent ?? "#b3262a");
    }
    if (shirtStyle === "hoodie") [2, 5].forEach((x) => [1, 2, 3].forEach((y) => px(x, y, "#e8e8e8")));
    if (shirtStyle === "armor") for (let y = 0; y < 12; y += 3) for (let x = 0; x < 8; x++) px(x, y, shadeHex(s.shirt, 0.7));
    if (s.emblem) for (let y = 3; y < 6; y++) for (let x = 2; x < 6; x++) px(x, y, s.emblem);
    for (let x = 0; x < 8; x++) px(x, 11, shadeHex(s.pants, 0.85)); // belt line
  });
  const back = solidTex(8, 12, s.shirt, sd + 8);
  const side = solidTex(4, 12, s.shirt, sd + 9);
  const sleeve = (len: number) =>
    solidTex(4, 12, s.shirt, sd + 11, (px) => {
      for (let y = len; y < 12; y++) for (let x = 0; x < 4; x++) px(x, y, jitter(s.skin, sd, x + y * 4));
    });
  const arm = sleeve(shirtStyle === "tee" ? 4 : shirtStyle === "robe" ? 9 : 10);
  const handTop = solidTex(4, 4, s.shirt, sd + 12);
  const handBottom = solidTex(4, 4, s.skin, sd + 13);
  const leg = solidTex(4, 12, s.pants, sd + 14, (px) => {
    for (let y = 9; y < 12; y++) for (let x = 0; x < 4; x++) px(x, y, jitter(s.shoes ?? "#3b3b3b", sd + 15, x + y));
  });
  const legTop = solidTex(4, 4, s.pants, sd + 16);
  const legBottom = solidTex(4, 4, s.shoes ?? "#3b3b3b", sd + 17);
  return {
    T,
    head: (face: THREE.Texture) => mats([hairSide(8), hairSide(8), headTop, solidTex(8, 8, s.skin, sd), face, headBack]),
    body: mats([side, side, solidTex(8, 4, s.shirt, sd + 18), solidTex(8, 4, s.pants, sd + 19), front, back]),
    arm: mats([arm, arm, handTop, handBottom, arm, arm]),
    leg: mats([leg, leg, legTop, legBottom, leg, leg]),
  };
}

// ------------------------------------------------------------------------------------------------ items (pixel art)
const ITEMS: Record<string, { rows: string[]; pal: Record<string, string> }> = {
  pickaxe: {
    rows: ["................", ".....GGGGGG.....", "...GGHHHHHHGG...", "..GHH..BB..HHG..", "..G....BB....G..", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", "................", "................", "................"],
    pal: { G: "#6fd3e0", H: "#b8f3f9", B: "#7a5230" },
  },
  sword: {
    rows: ["..............SS", ".............SHS", "............SHS.", "...........SHS..", "..........SHS...", ".........SHS....", "........SHS.....", "...G...SHS......", "....G.SHS.......", ".....GHS........", "......GG........", ".....BBGG.......", "....BB...G......", "...BB...........", "..BB............", "................"],
    pal: { S: "#9fb2c0", H: "#e8f1f6", G: "#8a6a2a", B: "#5a3a1e" },
  },
  torch: {
    rows: ["................", ".......YY.......", "......YOOY......", "......YOOY......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", ".......BB.......", "................", "................", "................", "................", "................"],
    pal: { Y: "#ffe36b", O: "#ff9b2e", B: "#7a5230" },
  },
  gem: {
    rows: ["................", "................", ".....CCCCCC.....", "....CHHHHHCC....", "...CHHCCCCCCC...", "...CCCCCCCCCC...", "....CCCCCCCC....", ".....CCCCCC.....", "......CCCC......", ".......CC.......", "................", "................", "................", "................", "................", "................"],
    pal: { C: "#3fd1c8", H: "#c9fffb" },
  },
  apple: {
    rows: ["................", ".......B........", "......BL........", "....RRRRRRR.....", "...RHRRRRRRR....", "...RHRRRRRRR....", "...RRRRRRRRR....", "...RRRRRRRRR....", "....RRRRRRR.....", ".....RRRRR......", "................", "................", "................", "................", "................", "................"],
    pal: { R: "#d8332b", H: "#ff8a7a", B: "#5a3a1e", L: "#4fa83a" },
  },
  ingot: {
    rows: ["................", "................", "................", "....GGGGGGG.....", "...GHHHHHHHG....", "..GGGGGGGGGGG...", "..GGGGGGGGGGG...", "................", "................", "................", "................", "................", "................", "................", "................", "................"],
    pal: { G: "#e9b423", H: "#fff2a8" },
  },
  book: {
    rows: ["................", "...BBBBBBBBB....", "...BWWWWWWWB....", "...BBBBBBBBB....", "...BBBBBBBBB....", "...BB.GG..BB....", "...BBBBBBBBB....", "...BBBBBBBBB....", "...BBBBBBBBB....", "................", "................", "................", "................", "................", "................", "................"],
    pal: { B: "#7a2f2f", W: "#f4ecd8", G: "#e9b423" },
  },
  map: {
    rows: ["................", "..PPPPPPPPPPP...", "..PGGPPPBBPPP...", "..PGGGPPBBBPP...", "..PPGPPPPBBPP...", "..PPPPRPPPPPP...", "..PPPPPRPPGGP...", "..PPPPPPPPGGP...", "..PPPPPPPPPPP...", "................", "................", "................", "................", "................", "................", "................"],
    pal: { P: "#e8d9a8", G: "#6fbf5b", B: "#4a7bd6", R: "#d8332b" },
  },
};

const itemGeo = new Map<string, THREE.BufferGeometry>();
function getItemGeo(kind: string) {
  if (itemGeo.has(kind)) return itemGeo.get(kind)!;
  const it = ITEMS[kind] ?? ITEMS.pickaxe;
  const geos: THREE.BufferGeometry[] = [];
  it.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const b = new THREE.BoxGeometry(1, 1, 1);
      b.translate(x - 7.5, 15 - y - 7.5, 0);
      const col = new THREE.Color(it.pal[ch]);
      const n = b.attributes.position.count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) col.toArray(arr, i * 3);
      b.setAttribute("color", new THREE.BufferAttribute(arr, 3));
      geos.push(b);
    }),
  );
  const merged = mergeGeos(geos);
  merged.scale(1 / 16, 1 / 16, 1 / 16);
  itemGeo.set(kind, merged);
  return merged;
}
function mergeGeos(gs: THREE.BufferGeometry[]) {
  const pos: number[] = [];
  const col: number[] = [];
  const nor: number[] = [];
  for (const g of gs) {
    const ng = g.toNonIndexed();
    pos.push(...(ng.attributes.position.array as Float32Array));
    nor.push(...(ng.attributes.normal.array as Float32Array));
    col.push(...((ng.attributes.color?.array as Float32Array) ?? []));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return out;
}
export const ITEM_KINDS = Object.keys(ITEMS);

/** A held/standing pixel item (extruded 16x16 art), `size` in metres. */
export const PixelItem: React.FC<{ kind: string; position?: Vec3; rotation?: Vec3; size?: number; spin?: number }> = ({ kind, position, rotation, size = 0.5, spin = 0 }) => {
  const f = useLocalFrame();
  const geo = getItemGeo(kind);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true }), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mat} scale={size} rotation={[0, spin * f * 0.05, 0]} />
    </group>
  );
};

// ------------------------------------------------------------------------------------------------ component
export type BlockyProps = {
  spec: BlockySpec;
  at?: Vec3;
  path?: [number, Vec3][];
  yaw?: number; // facing (deg), 0 = toward +z (camera)
  poses?: [number, string | BlockyPose][];
  faces?: [number, BlockyFace][];
  item?: [number, string | null][];
  mining?: [number, number]; // frames [from, to] the right arm swings
  talking?: { s: number; e: number }[];
  run?: boolean;
  scale?: number;
  pop?: number;
  shadow?: boolean;
};

function keyed<T>(keys: [number, T][], f: number, dflt: T) {
  let v = dflt;
  let since = 9999;
  let prev = dflt;
  for (const [k, x] of [...keys].sort((a, b) => a[0] - b[0]))
    if (f >= k) {
      prev = v;
      v = x;
      since = f - k;
    }
  return { v, since, prev };
}

export const Blocky: React.FC<BlockyProps> = ({ spec, at = [0, 0, 0], path, yaw = 0, poses = [[0, "idle"]], faces = [[0, "neutral"]], item = [], mining, talking = [], run = false, scale = 1, pop, shadow = true }) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const parts = useMemo(() => buildParts(spec), [spec]);
  const fk = keyed(faces, f, "neutral" as BlockyFace);
  const speaking = talking.some((w) => f >= w.s && f < w.e && Math.floor((f - w.s) / 3) % 2 === 0);
  const blink = blinkAt(f, spec.seed ?? 3, fps) > 0.5;
  const faceKey = `${speaking && fk.v !== "shocked" ? "talk" : fk.v}|${blink}`;
  const headMats = useMemo(() => parts.head(faceTexture(spec, faceKey.split("|")[0] as BlockyFace, blink)), [parts, faceKey]);
  // position + walk
  let pos: Vec3 = at;
  let moving = false;
  let dist = 0;
  let heading = yaw;
  if (path && path.length) {
    const ks = [...path].sort((a, b) => a[0] - b[0]);
    pos = ks[0][1];
    for (let i = 0; i + 1 < ks.length; i++) {
      const [fa, pa] = ks[i];
      const [fb, pb] = ks[i + 1];
      const seg = Math.hypot(pb[0] - pa[0], pb[2] - pa[2]);
      if (f >= fb) {
        dist += seg;
        pos = pb;
        continue;
      }
      if (f >= fa) {
        const u = smootherstep(invLerp(fa, fb, f));
        pos = [pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u, pa[2] + (pb[2] - pa[2]) * u];
        dist += seg * u;
        moving = u > 0 && u < 1;
        heading = (Math.atan2(pb[0] - pa[0], pb[2] - pa[2]) * 180) / Math.PI;
      }
      break;
    }
  }
  const pk = keyed(poses, f, "idle" as string | BlockyPose);
  const res = (p: string | BlockyPose) => (typeof p === "string" ? BPOSES[p] ?? BPOSES.idle : p);
  let pose = mixB(res(pk.prev), res(pk.v), backOut(invLerp(0, 6, pk.since), 1.3));
  if (moving) pose = run ? runB(dist / 1.6) : walkB(dist / 1.1);
  if (mining && f >= mining[0] && f < mining[1]) pose = { ...pose, ...mineB(f - mining[0]), legL: pose.legL, legR: pose.legR };
  const it = keyed(item, f, null as string | null).v;
  const T = parts.T * 0.9;
  const legH = 12 * T;
  const crouch = (pose.crouch ?? 0) * legH;
  const bob = (pose.bob ?? 0) + Math.sin(f * 0.15 + (spec.seed ?? 1)) * 0.004;
  const R = Math.PI / 180;
  const s = pop !== undefined ? (f < pop ? 0 : backOut(invLerp(pop, pop + 7, f), 2.2)) : 1;
  if (s <= 0) return null;
  return (
    <group position={[pos[0], pos[1] + bob - crouch, pos[2]]} rotation={[0, heading * R, 0]} scale={scale * s}>
      <group rotation={[(pose.lean ?? 0) * R, 0, 0]}>
        {/* legs (pivot at hips) */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 2 * T, legH, 0]} rotation={[(sd < 0 ? pose.legL : pose.legR) * R, 0, 0]}>
            <mesh position={[0, -6 * T, 0]} material={parts.leg}>
              <boxGeometry args={[4 * T, 12 * T, 4 * T]} />
            </mesh>
          </group>
        ))}
        {/* torso */}
        <mesh position={[0, legH + 6 * T, 0]} material={parts.body}>
          <boxGeometry args={[8 * T, 12 * T, 4 * T]} />
        </mesh>
        {/* arms (pivot at shoulders) */}
        {[-1, 1].map((sd) => {
          const a = sd < 0 ? pose.armL : pose.armR;
          return (
            <group key={sd} position={[sd * 6 * T, legH + 12 * T - 2 * T, 0]} rotation={[a[0] * R, 0, sd * a[1] * R]}>
              <mesh position={[0, -4 * T, 0]} material={parts.arm}>
                <boxGeometry args={[4 * T, 12 * T, 4 * T]} />
              </mesh>
              {sd > 0 && it ? (
                <group position={[0, -9.5 * T, 2.2 * T]} rotation={[-Math.PI / 2 + 0.5, Math.PI / 2, 0]}>
                  <PixelItem kind={it} size={0.62} position={[0.16, 0.16, 0]} />
                </group>
              ) : null}
            </group>
          );
        })}
        {/* head (pivot at the neck) */}
        <group position={[0, legH + 12 * T, 0]} rotation={[(pose.head?.[1] ?? 0) * R, (pose.head?.[0] ?? 0) * R, 0]}>
          <mesh position={[0, 4 * T, 0]} material={headMats}>
            <boxGeometry args={[8 * T, 8 * T, 8 * T]} />
          </mesh>
          {spec.hat ? <Hat kind={spec.hat.kind} color={spec.hat.color} T={T} /> : null}
        </group>
      </group>
      {shadow ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01 + crouch, 0]}>
          <circleGeometry args={[0.34, 20]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

const Hat: React.FC<{ kind: string; color: string; T: number }> = ({ kind, color, T }) => {
  const m = new THREE.MeshBasicMaterial({ color });
  const dark = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.7) });
  if (kind === "cap")
    return (
      <group position={[0, 8 * T, 0]}>
        <mesh material={m} position={[0, 0.5 * T, 0]}>
          <boxGeometry args={[8.6 * T, 2 * T, 8.6 * T]} />
        </mesh>
        <mesh material={dark} position={[0, -0.2 * T, 5.5 * T]}>
          <boxGeometry args={[8.6 * T, 0.8 * T, 3 * T]} />
        </mesh>
      </group>
    );
  if (kind === "crown")
    return (
      <group position={[0, 8.6 * T, 0]}>
        {[-3, -1, 1, 3].map((x) => (
          <mesh key={x} material={m} position={[x * T, 1 * T, 3.9 * T]}>
            <boxGeometry args={[1.6 * T, 3 * T, 0.6 * T]} />
          </mesh>
        ))}
        <mesh material={m}>
          <boxGeometry args={[8.4 * T, 1.4 * T, 8.4 * T]} />
        </mesh>
      </group>
    );
  if (kind === "band")
    return (
      <mesh material={m} position={[0, 6 * T, 0]}>
        <boxGeometry args={[8.5 * T, 1.2 * T, 8.5 * T]} />
      </mesh>
    );
  // helmet / hardhat / hood: an inflated shell over the top half
  return (
    <mesh material={m} position={[0, 6.4 * T, -0.2 * T]}>
      <boxGeometry args={[9 * T, kind === "hood" ? 6 * T : 3.6 * T, 9 * T]} />
    </mesh>
  );
};

export const BCAST: Record<string, BlockySpec> = {
  hero: { skin: "#e0a77f", hair: "#4a2f1d", hairStyle: "short", eyes: "#3d6bd6", shirt: "#2fa6a0", pants: "#3a3f8f", shoes: "#4a4a4a", seed: 3 },
  heroine: { skin: "#f0c09a", hair: "#c2552a", hairStyle: "long", eyes: "#3a8a3a", shirt: "#d94f7a", pants: "#2e3a5a", shoes: "#5a3a2a", seed: 4 },
  miner: { skin: "#d49a72", hair: "#2a1c12", hairStyle: "buzz", shirt: "#8a6a3a", shirtStyle: "jacket", shirtAccent: "#c9a26a", pants: "#4a4a52", hat: { kind: "hardhat", color: "#f2c230" }, beard: "#2a1c12", seed: 5 },
  scientist: { skin: "#f2d2b6", hair: "#d8d8d8", hairStyle: "bob", shirt: "#f4f6fb", shirtStyle: "lab", shirtAccent: "#4a7bd6", pants: "#3a3a46", seed: 6 },
  king: { skin: "#e8b48c", hair: "#7a4a22", hairStyle: "short", shirt: "#7a2fb3", shirtStyle: "robe", pants: "#5a1f8a", hat: { kind: "crown", color: "#f2c230" }, beard: "#7a4a22", seed: 7 },
  knight: { skin: "#d9a07a", hair: "#3a2a1a", hairStyle: "short", shirt: "#9aa4b0", shirtStyle: "armor", pants: "#6b7480", hat: { kind: "helmet", color: "#9aa4b0" }, seed: 8 },
  villager: { skin: "#c88a62", hair: "#3a2416", hairStyle: "bald", shirt: "#7a5a3a", shirtStyle: "robe", pants: "#5a3a22", beard: "#3a2416", seed: 9 },
  kid: { skin: "#f0b98e", hair: "#e0b040", hairStyle: "spiky", shirt: "#e84f3a", pants: "#3a6ab8", seed: 10 },
  suit: { skin: "#e2aa82", hair: "#1e1e22", hairStyle: "short", shirt: "#262a36", shirtStyle: "suit", shirtAccent: "#c0392b", pants: "#1e212b", seed: 11 },
};
