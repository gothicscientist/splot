// Voxel world: build with plain code, mesh once with hidden-face culling, baked face shading (top 1.0 / N-S 0.8 /
// E-W 0.6 / bottom 0.5, applied in sRGB) and per-vertex ambient occlusion - the genre's signature look - in a single
// draw call (+1 for water/glass). Animated blocks (breaking, falling, popping) are separate <Block> meshes.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useLocalFrame } from "../../core/timeline";
import { backOut, clamp, invLerp, rand } from "../../core/anim";
import { BlockType, EMISSIVE, TRANSPARENT, faceUV, getAtlas } from "./blocks";
import type { Vec3 } from "../../core/types";

export class Voxels {
  m = new Map<string, BlockType>();
  key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  set(x: number, y: number, z: number, t: BlockType | null) {
    const k = this.key(x, y, z);
    if (t === null) this.m.delete(k);
    else this.m.set(k, t);
    return this;
  }
  get(x: number, y: number, z: number) {
    return this.m.get(this.key(x, y, z));
  }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, t: BlockType | null, hollow = false) {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) {
          const edge = x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1;
          if (!hollow || edge) this.set(x, y, z, t);
        }
    return this;
  }
  /** Rolling terrain from x0..x1, z0..z1: grass on top, dirt, then stone (ores sprinkled), bedrock at minY. */
  terrain(o: { x0: number; x1: number; z0: number; z1: number; base?: number; amp?: number; freq?: number; minY?: number; top?: BlockType; seed?: number; ores?: boolean; flat?: boolean }) {
    const { x0, x1, z0, z1, base = 0, amp = 2, freq = 0.12, minY = -8, top = "grass", seed = 1, ores = true, flat = false } = o;
    for (let x = x0; x <= x1; x++)
      for (let z = z0; z <= z1; z++) {
        const h = flat ? base : Math.round(base + amp * (Math.sin(x * freq + seed) * 0.6 + Math.cos(z * freq * 1.3 + seed * 2) * 0.4 + (rand(seed, x * 131 + z) - 0.5) * 0.25));
        for (let y = minY; y <= h; y++) {
          let t: BlockType = y === h ? top : y > h - 3 ? (top === "sand" ? "sand" : "dirt") : "stone";
          if (y === minY) t = "bedrock";
          else if (t === "stone" && ores) {
            const r = rand(seed + 7, x * 7919 + y * 104729 + z * 31);
            if (r < 0.035) t = "coalOre";
            else if (r < 0.05) t = "ironOre";
            else if (r < 0.056 && y < minY + 6) t = "goldOre";
            else if (r < 0.06 && y < minY + 4) t = "gemOre";
            else if (y < minY + 4) t = "deepstone";
          }
          this.set(x, y, z, t);
        }
      }
    return this;
  }
  tree(x: number, y: number, z: number, h = 5, log: BlockType = "log", leaves: BlockType = "leaves") {
    for (let k = 0; k < h; k++) this.set(x, y + k, z, log);
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = h - 2; dy <= h + 1; dy++) {
          const r = Math.abs(dx) + Math.abs(dz) + (dy > h - 1 ? 1 : 0);
          if (r <= 3 && !(dx === 0 && dz === 0 && dy < h)) if (!this.get(x + dx, y + dy, z + dz)) this.set(x + dx, y + dy, z + dz, leaves);
        }
    return this;
  }
  /** Small house: walls, a door gap, windows, a stepped roof. */
  house(x: number, y: number, z: number, w = 7, d = 6, h = 4, wall: BlockType = "planks", roof: BlockType = "darkPlanks") {
    this.box(x, y, z, x + w - 1, y + h - 1, z + d - 1, wall, true);
    this.box(x + 1, y, z + d - 1, x + 1, y + 1, z + d - 1, null); // door
    this.set(x + w - 3, y + 2, z + d - 1, "glass").set(x + 3, y + 2, z + d - 1, "glass");
    for (let k = 0; k <= Math.ceil(d / 2); k++) this.box(x - 1, y + h + k, z - 1 + k, x + w, y + h + k, z + d - k, roof);
    return this;
  }
  /** Carve a vertical shaft (a mine) of half-width r from y0 down to y1. */
  shaft(x: number, z: number, y0: number, y1: number, r = 0) {
    for (let y = y1; y <= y0; y++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) this.set(x + dx, y, z + dz, null);
    return this;
  }
  /** Height of the surface at (x, z): y of the top face of the highest solid block (characters stand here). */
  top(x: number, z: number, from = 64, to = -64) {
    for (let y = from; y >= to; y--) if (this.get(Math.floor(x), y, Math.floor(z)) !== undefined) return y + 1;
    return 0;
  }
  /** A layered planet of radius R centred on the origin. `layers` maps a radius fraction to a block (outermost
   *  first); `cut` removes the +x +y +z octant so the inside shows. `surface(x, y, z)` may override the crust. */
  planet(R: number, layers: [number, BlockType][], cut = true, surface?: (x: number, y: number, z: number) => BlockType | undefined) {
    for (let x = -R; x <= R; x++)
      for (let y = -R; y <= R; y++)
        for (let z = -R; z <= R; z++) {
          const r = Math.sqrt((x + 0.5) ** 2 + (y + 0.5) ** 2 + (z + 0.5) ** 2);
          if (r > R) continue;
          if (cut && x >= 0 && y >= 0 && z >= 0) continue;
          let t: BlockType = layers[layers.length - 1][1];
          for (const [frac, b] of layers)
            if (r > R * frac) {
              t = b;
              break;
            }
          if (r > R - 1 && surface) t = surface(x, y, z) ?? t;
          this.set(x, y, z, t);
        }
    return this;
  }
  sphere(cx: number, cy: number, cz: number, R: number, t: BlockType | null) {
    for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) for (let z = -R; z <= R; z++) if (x * x + y * y + z * z <= R * R + 0.5) this.set(cx + x, cy + y, cz + z, t);
    return this;
  }
}

// face definitions: normal, 4 corners (CCW from outside), shade, which atlas face (0 top, 1 side, 2 bottom)
const FACES = [
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], shade: 1.0, f: 0 },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], shade: 0.5, f: 2 },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], shade: 0.8, f: 1 },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], shade: 0.8, f: 1 },
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], shade: 0.6, f: 1 },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], shade: 0.6, f: 1 },
] as const;
const AO = [0.52, 0.68, 0.84, 1.0];
const toLin = (m: number) => Math.pow(m, 2.2);

/** Per-vertex light multiplier (linear), e.g. darker and warmer with depth, or a shaded shaft. Emissive blocks skip it. */
export type VoxelLight = (x: number, y: number, z: number) => number | [number, number, number];

function mesh(v: Voxels, wantTransparent: boolean, light?: VoxelLight) {
  const pos: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const solidAt = (x: number, y: number, z: number) => {
    const t = v.get(x, y, z);
    return t !== undefined && !TRANSPARENT.has(t);
  };
  for (const [k, t] of v.m) {
    const isT = TRANSPARENT.has(t) && t !== "leaves";
    if (isT !== wantTransparent) continue;
    const [x, y, z] = k.split(",").map(Number);
    for (const F of FACES) {
      const nx = x + F.n[0];
      const ny = y + F.n[1];
      const nz = z + F.n[2];
      const nb = v.get(nx, ny, nz);
      if (nb !== undefined && (!TRANSPARENT.has(nb) || nb === t)) continue; // hidden face
      const [u0, v0, u1, v1] = faceUV(t, F.f as 0 | 1 | 2);
      const base = pos.length / 3;
      const glowK = EMISSIVE.has(t) ? 2.6 : 1;
      F.c.forEach((c, i) => {
        pos.push(x + c[0], y + c[1], z + c[2]);
        const uvs = [
          [u0, v0],
          [u1, v0],
          [u1, v1],
          [u0, v1],
        ][i];
        uv.push(uvs[0], uvs[1]);
        // vertex AO (classic voxel): in the layer the face looks into, the two edge cells and the corner cell
        // that touch this vertex; both edges solid = darkest.
        let ao = 3;
        if (!EMISSIVE.has(t)) {
          const ax = F.n[0] !== 0 ? 0 : F.n[1] !== 0 ? 1 : 2;
          const [o1, o2] = [0, 1, 2].filter((q) => q !== ax);
          const cell = [x, y, z];
          const front = [...cell];
          front[ax] += F.n[ax];
          const d1 = c[o1] ? 1 : -1;
          const d2 = c[o2] ? 1 : -1;
          const at = (a: number, b: number) => {
            const q = [...front];
            q[o1] += a;
            q[o2] += b;
            return solidAt(q[0], q[1], q[2]) ? 1 : 0;
          };
          const s1 = at(d1, 0);
          const s2 = at(0, d2);
          const co = at(d1, d2);
          ao = s1 && s2 ? 0 : 3 - (s1 + s2 + co);
        }
        const m = toLin(F.shade * AO[ao]) * glowK;
        const L = light && !EMISSIVE.has(t) ? light(x + c[0], y + c[1], z + c[2]) : 1;
        if (typeof L === "number") col.push(m * L, m * L, m * L);
        else col.push(m * L[0], m * L[1], m * L[2]);
      });
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/** A static voxel world. `light` (optional) shades every vertex; like `build`, it is read once per `deps` change.
 *  `tint` (optional, linear RGB) multiplies the whole world's colour and may change every frame without a re-mesh
 *  (e.g. rock that heats up red); emissive blocks are tinted too. */
export const VoxelWorld: React.FC<{ build: (v: Voxels) => void; deps?: unknown[]; position?: Vec3; light?: VoxelLight; tint?: [number, number, number] }> = ({ build, deps = [], position, light, tint }) => {
  const { opaque, trans, mat, matT } = useMemo(() => {
    const v = new Voxels();
    build(v);
    const atlas = getAtlas();
    const mat = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, alphaTest: 0.5, toneMapped: true });
    const matT = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, transparent: true, depthWrite: false, toneMapped: true });
    return { opaque: mesh(v, false, light), trans: mesh(v, true, light), mat, matT };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  // a deps change re-meshes the world: free the old GPU buffers (the shared atlas texture stays)
  useEffect(
    () => () => {
      opaque.dispose();
      trans.dispose();
      mat.dispose();
      matT.dispose();
    },
    [opaque, trans, mat, matT],
  );
  // set synchronously in render (the first frame must already have it)
  for (const m of [mat, matT]) {
    if (tint) m.color.setRGB(tint[0], tint[1], tint[2], THREE.LinearSRGBColorSpace);
    else m.color.setRGB(1, 1, 1);
  }
  return (
    <group position={position}>
      <mesh geometry={opaque} material={mat} />
      <mesh geometry={trans} material={matT} renderOrder={2} />
    </group>
  );
};

// ------------------------------------------------------------------------------------------------ crack overlay
// Ten stages of an original pixel crack (six arms that grow out from the centre of the face), drawn by us.
let CRACK_MATS: THREE.MeshBasicMaterial[] | null = null;
const CRACK_GEO = new THREE.BoxGeometry(1.006, 1.006, 1.006);
function crackMats() {
  if (CRACK_MATS) return CRACK_MATS;
  const px: [number, number, number][] = [];
  const arm = (dx: number, dy: number, len: number, seed: number) => {
    let x = 7.5;
    let y = 7.5;
    for (let i = 0; i < len; i++) {
      const r = rand(seed, i);
      x += dx * (r < 0.55 ? 1 : 0.55);
      y += dy * (r > 0.45 ? 1 : 0.55);
      if (r > 0.82) x += dy * 0.8;
      else if (r < 0.18) y -= dx * 0.8;
      px.push([Math.floor(x), Math.floor(y), i]);
    }
  };
  arm(1, -1, 9, 11);
  arm(-1, 1, 9, 12);
  arm(-1, -0.6, 8, 13);
  arm(1, 0.7, 8, 14);
  arm(0.3, 1, 6, 15);
  arm(-0.25, -1, 6, 16);
  CRACK_MATS = Array.from({ length: 10 }, (_, s) => {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 16, 16);
    g.fillStyle = "rgba(26,18,12,1)";
    for (const [x, y, st] of px) if (x >= 0 && y >= 0 && x < 16 && y < 16 && st < ((s + 1) / 10) * 9) g.fillRect(x, y, 1, 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    return new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5 });
  });
  return CRACK_MATS;
}

/** One animated block: pops in at `pop`, cracks and bursts into debris at `breakAt`, or falls from `fallFrom`.
 *  `tint` (linear RGB multiplier) matches it to a world shaded with `light`. `cracks` draws the 10-stage pixel crack
 *  overlay while it cracks (from `crackFrom`, default 18 f before `breakAt`). */
export const Block: React.FC<{ type: BlockType; at: Vec3; pop?: number; breakAt?: number; fallFrom?: number; size?: number; wobble?: number; tint?: [number, number, number]; cracks?: boolean; crackFrom?: number }> = ({ type, at, pop, breakAt, fallFrom, size = 1, wobble = 0, tint, cracks = false, crackFrom }) => {
  const f = useLocalFrame();
  const geo = useMemo(() => {
    const v = new Voxels();
    v.set(0, 0, 0, type);
    const g = mesh(v, TRANSPARENT.has(type) && type !== "leaves");
    g.translate(-0.5, -0.5, -0.5);
    return g;
  }, [type]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: getAtlas(), vertexColors: true, alphaTest: 0.5, transparent: TRANSPARENT.has(type) && type !== "leaves" }), [type]);
  if (tint && !EMISSIVE.has(type)) mat.color.setRGB(tint[0], tint[1], tint[2], THREE.LinearSRGBColorSpace);
  else mat.color.setRGB(1, 1, 1);
  if (pop !== undefined && f < pop) return null;
  const s = pop !== undefined ? backOut(invLerp(pop, pop + 6, f), 2.4) : 1;
  let y = at[1] + 0.5;
  if (fallFrom !== undefined) y = Math.max(at[1] + 0.5, at[1] + 0.5 + 6 - 0.5 * 9.8 * Math.max(0, (f - fallFrom) / 30) ** 2 * 1.0);
  if (breakAt !== undefined && f >= breakAt) {
    const t = (f - breakAt) / 30;
    if (t > 0.8) return null;
    return (
      <group position={[at[0] + 0.5, at[1] + 0.5, at[2] + 0.5]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = rand(i, 1) * Math.PI * 2;
          const sp = 1.2 + rand(i, 2) * 1.6;
          return (
            <mesh key={i} geometry={geo} material={mat} position={[Math.cos(a) * sp * t, 1.8 * t - 4.9 * t * t + rand(i, 3) * 0.4, Math.sin(a) * sp * t]} scale={0.16 * (1 - t)} rotation={[t * 6 + i, t * 4, i]} />
          );
        })}
      </group>
    );
  }
  const crack = breakAt !== undefined ? clamp(invLerp(crackFrom ?? breakAt - 18, breakAt, f)) : 0;
  const stage = cracks && crack > 0 ? Math.min(9, Math.floor(crack * 10)) : -1;
  // wobble: the block sags and bulges like soft plastic (volume-preserving squash, bottom stays put)
  const w = wobble * Math.sin(f * 0.33 + at[0] * 1.9 + at[1] * 1.3);
  const k = size * s * (1 - crack * 0.06);
  const sy = 1 - Math.abs(wobble) * 0.35 - w * 0.5;
  const sx = 1 + Math.abs(wobble) * 0.18 + w * 0.5;
  return (
    <group position={[at[0] + 0.5 + w * 0.12, y - (1 - sy) * 0.5 * size, at[2] + 0.5]} scale={[k * sx, k * sy, k]} rotation={[0, 0, crack * 0.05 * Math.sin(f * 2) + w * 0.12]}>
      <mesh geometry={geo} material={mat} />
      {stage >= 0 ? <mesh geometry={CRACK_GEO} material={crackMats()[stage]} /> : null}
    </group>
  );
};

// ------------------------------------------------------------------------------------------------ square particles
const PB_PLANE = new THREE.PlaneGeometry(1, 1);
const PB_CUBE = new THREE.BoxGeometry(1, 1, 1);
const PB_SPARK = ["#fff1a8", "#ffd24a", "#ff9a2e", "#ffe680"];
const PB_CONFETTI = ["#ff4d5e", "#ffe14d", "#4dabf7", "#69db7c", "#ff922b", "#f4f4f4"];

/** Square particles only (the style's rule): `chips` = mini blocks of `type` (atlas-textured), `sparks` = glowing
 *  squares that bloom, `confetti` = flat coloured squares that flutter down. Every particle is a closed-form function
 *  of the shot-local frame: p = p0 + v t + g t^2 / 2 (confetti: drag + a slow terminal fall). `dir` biases the spray
 *  (unit-ish vector, `cone` = spread around it); `spread` jitters the start box (half extents, m). `face` (sparks and
 *  confetti) draws flat squares turned to the camera instead of tumbling cubes, so they read as square chips in a
 *  still (a tumbling glowing cube blooms into a round blob). */
export const PixelBurst: React.FC<{
  at: number;
  origin: Vec3;
  kind?: "chips" | "sparks" | "confetti";
  type?: BlockType;
  count?: number;
  size?: number;
  power?: number;
  up?: number;
  gravity?: number;
  life?: number;
  seed?: number;
  dir?: Vec3;
  cone?: number;
  spread?: Vec3;
  colors?: string[];
  glow?: number;
  face?: boolean;
}> = ({ at, origin, kind = "chips", type = "stone", count = 24, size, power = 3, up = 1.5, gravity, life = 24, seed = 1, dir, cone = 0.6, spread = [0, 0, 0], colors, glow = 4, face = false }) => {
  const f = useLocalFrame();
  const ref = React.useRef<THREE.InstancedMesh>(null);
  const flat = face && kind !== "chips";
  const geo = useMemo(() => {
    if (kind === "confetti" || flat) return PB_PLANE;
    if (kind === "sparks") return PB_CUBE;
    const v = new Voxels();
    v.set(0, 0, 0, type);
    const g = mesh(v, false);
    g.translate(-0.5, -0.5, -0.5);
    return g;
  }, [kind, type, flat]);
  const mat = useMemo(() => {
    if (kind === "chips") return new THREE.MeshBasicMaterial({ map: getAtlas(), vertexColors: true, alphaTest: 0.5 });
    if (kind === "sparks") return new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(glow), toneMapped: true });
    return new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide });
  }, [kind, glow]);
  const cols = useMemo(() => {
    if (kind === "chips") return null;
    const pal = colors ?? (kind === "sparks" ? PB_SPARK : PB_CONFETTI);
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(pal[Math.floor(rand(seed + 3, i) * pal.length)]);
      arr.set([c.r, c.g, c.b], i * 3);
    }
    return arr;
  }, [kind, colors, count, seed]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const sz = size ?? (kind === "confetti" ? 0.3 : kind === "sparks" ? 0.07 : 0.14);
  const g = gravity ?? (kind === "confetti" ? 1.2 : kind === "sparks" ? 9.8 : 9.8);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = (f - at) / 30;
    for (let i = 0; i < count; i++) {
      const lifeI = life * (0.7 + 0.3 * rand(seed + 9, i));
      if (t < 0 || f - at > lifeI) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0.0001);
      } else {
        const th = rand(seed, i * 2) * Math.PI * 2;
        const ph = (rand(seed, i * 2 + 1) - 0.25) * Math.PI * 0.75;
        let vx = Math.cos(th) * Math.cos(ph);
        let vy = Math.sin(ph);
        let vz = Math.sin(th) * Math.cos(ph);
        if (dir) {
          vx = dir[0] + vx * cone;
          vy = dir[1] + vy * cone;
          vz = dir[2] + vz * cone;
          const n = Math.hypot(vx, vy, vz) || 1;
          vx /= n;
          vy /= n;
          vz /= n;
        }
        const sp = power * (0.45 + 0.75 * rand(seed + 5, i));
        const x0 = origin[0] + (rand(seed + 11, i) * 2 - 1) * spread[0];
        const y0 = origin[1] + (rand(seed + 12, i) * 2 - 1) * spread[1];
        const z0 = origin[2] + (rand(seed + 13, i) * 2 - 1) * spread[2];
        let x: number;
        let y: number;
        let z: number;
        if (kind === "confetti") {
          const k = 2.2;
          const e = (1 - Math.exp(-k * t)) / k;
          x = x0 + vx * sp * e + Math.sin(t * 3.1 + i) * 0.35 * Math.min(1, t * 2);
          y = y0 + (vy * sp + up) * e - g * t;
          z = z0 + vz * sp * e + Math.cos(t * 2.3 + i) * 0.2 * Math.min(1, t * 2);
        } else {
          x = x0 + vx * sp * t;
          y = y0 + (vy * sp + up) * t - 0.5 * g * t * t;
          z = z0 + vz * sp * t;
        }
        dummy.position.set(x, y, z);
        const spin = kind === "confetti" ? 3 + (i % 4) : 6 + (i % 5);
        if (flat) dummy.quaternion.copy(state.camera.quaternion);
        else dummy.rotation.set(t * spin + i, t * spin * 0.7 + i * 0.5, t * spin * 0.4);
        const fade = 1 - Math.max(0, (f - at) / lifeI - 0.7) / 0.3;
        const shrink = kind === "sparks" ? 1 - 0.6 * ((f - at) / lifeI) : 1;
        dummy.scale.setScalar(Math.max(0.0001, sz * (0.6 + 0.8 * rand(seed + 7, i)) * fade * shrink));
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false}>
      {cols ? <instancedBufferAttribute attach="instanceColor" args={[cols, 3]} /> : null}
    </instancedMesh>
  );
};
