// Voxel world: build with plain code, mesh once with hidden-face culling, baked face shading (top 1.0 / N-S 0.8 /
// E-W 0.6 / bottom 0.5, applied in sRGB) and per-vertex ambient occlusion - the genre's signature look - in a single
// draw call (+1 for water/glass). Animated blocks (breaking, falling, popping) are separate <Block> meshes.
import React, { useMemo } from "react";
import * as THREE from "three";
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

function mesh(v: Voxels, wantTransparent: boolean) {
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
        col.push(m, m, m);
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

export const VoxelWorld: React.FC<{ build: (v: Voxels) => void; deps?: unknown[]; position?: Vec3 }> = ({ build, deps = [], position }) => {
  const { opaque, trans, mat, matT } = useMemo(() => {
    const v = new Voxels();
    build(v);
    const atlas = getAtlas();
    const mat = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, alphaTest: 0.5, toneMapped: true });
    const matT = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, transparent: true, depthWrite: false, toneMapped: true });
    return { opaque: mesh(v, false), trans: mesh(v, true), mat, matT };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <group position={position}>
      <mesh geometry={opaque} material={mat} />
      <mesh geometry={trans} material={matT} renderOrder={2} />
    </group>
  );
};

/** One animated block: pops in at `pop`, cracks and bursts into debris at `breakAt`, or falls from `fallFrom`. */
export const Block: React.FC<{ type: BlockType; at: Vec3; pop?: number; breakAt?: number; fallFrom?: number; size?: number }> = ({ type, at, pop, breakAt, fallFrom, size = 1 }) => {
  const f = useLocalFrame();
  const geo = useMemo(() => {
    const v = new Voxels();
    v.set(0, 0, 0, type);
    const g = mesh(v, TRANSPARENT.has(type) && type !== "leaves");
    g.translate(-0.5, -0.5, -0.5);
    return g;
  }, [type]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: getAtlas(), vertexColors: true, alphaTest: 0.5, transparent: TRANSPARENT.has(type) && type !== "leaves" }), [type]);
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
  const crack = breakAt !== undefined ? clamp(invLerp(breakAt - 18, breakAt, f)) : 0;
  return <mesh geometry={geo} material={mat} position={[at[0] + 0.5, y, at[2] + 0.5]} scale={size * s * (1 - crack * 0.06)} rotation={[0, 0, crack * 0.05 * Math.sin(f * 2)]} />;
};
