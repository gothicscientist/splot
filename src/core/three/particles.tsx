// Deterministic 3D particles (instanced): money/coins/confetti/papers raining and piling up, radial bursts,
// dust puffs. Every particle's state is a closed-form function of the frame, so any frame renders on its own.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import { useLocalFrame } from "../timeline";
import { rand } from "../anim";
import { toon, glow } from "./mats";
import type { Vec3 } from "../types";

export type ParticleKind = "bills" | "coins" | "confetti" | "papers" | "leaves" | "snow" | "gems" | "sparks";

const GEO: Record<ParticleKind, () => THREE.BufferGeometry> = {
  bills: () => new THREE.BoxGeometry(0.32, 0.01, 0.15),
  coins: () => new THREE.CylinderGeometry(0.1, 0.1, 0.025, 16),
  confetti: () => new THREE.PlaneGeometry(0.07, 0.11),
  papers: () => new THREE.BoxGeometry(0.21, 0.004, 0.29),
  leaves: () => new THREE.PlaneGeometry(0.14, 0.09),
  snow: () => new THREE.SphereGeometry(0.03, 6, 4),
  gems: () => new THREE.OctahedronGeometry(0.08),
  sparks: () => new THREE.SphereGeometry(0.025, 6, 4),
};
const COLORS: Record<ParticleKind, string[]> = {
  bills: ["#6fbf5b", "#7ccf66", "#5fae4f"],
  coins: ["#ffbf2e", "#ffcc44", "#e9a91f"],
  confetti: ["#ff4d6d", "#ffd43b", "#4dabf7", "#69db7c", "#b197fc", "#ff922b"],
  papers: ["#f4efe2", "#ffffff", "#e9e2cf"],
  leaves: ["#e8590c", "#f08c00", "#c92a2a", "#f59f00"],
  snow: ["#ffffff"],
  gems: ["#4dabf7", "#e64980", "#40c057"],
  sparks: ["#fff3bf"],
};

export type RainProps = {
  kind: ParticleKind;
  count?: number;
  /** first frame (shot-local) particles start falling */
  at: number;
  /** frames over which new particles keep spawning */
  spread?: number;
  /** box they fall from: centre + half extents (x, z); spawn height */
  center?: Vec3;
  half?: [number, number];
  height?: number;
  /** floor height they pile up on */
  ground?: number;
  /** stop spawning / everything vanishes after */
  until?: number;
  seed?: number;
  scale?: number;
};

/** Things falling from the sky and piling up on the floor (the money-rain beat). */
export const Rain: React.FC<RainProps> = ({ kind, count = 160, at, spread = 45, center = [0, 0, 0], half = [3, 2], height = 6, ground = 0, until, seed = 1, scale = 1 }) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(GEO[kind], [kind]);
  const mats = useMemo(() => {
    const sparkly = kind === "sparks";
    return sparkly ? glow(COLORS[kind][0], 4) : toon("#ffffff", { side: THREE.DoubleSide });
  }, [kind]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(COLORS[kind][Math.floor(rand(seed, i) * COLORS[kind].length)]);
      arr.set([c.r, c.g, c.b], i * 3);
    }
    return arr;
  }, [count, kind, seed]);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const g = 9.8 * (kind === "coins" || kind === "gems" ? 1 : 0.22); // paper flutters down slowly
    for (let i = 0; i < count; i++) {
      const t0 = at + rand(seed, i * 3 + 1) * spread;
      const t = (f - t0) / fps;
      const x0 = center[0] + (rand(seed, i * 3 + 2) * 2 - 1) * half[0];
      const z0 = center[2] + (rand(seed, i * 3 + 3) * 2 - 1) * half[1];
      const y0 = center[1] + height * (0.8 + rand(seed, i + 77) * 0.4);
      if (t < 0 || (until !== undefined && f > until)) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0.0001);
      } else {
        const fallT = Math.sqrt((2 * (y0 - ground)) / g);
        const tt = Math.min(t, fallT);
        const y = Math.max(ground + 0.01 + (i % 5) * 0.006, y0 - 0.5 * g * tt * tt);
        const flutter = kind === "coins" || kind === "gems" ? 0 : 0.35;
        const x = x0 + Math.sin(tt * 3 + i) * flutter * Math.min(1, tt);
        const z = z0 + Math.cos(tt * 2.3 + i) * flutter * 0.6 * Math.min(1, tt);
        dummy.position.set(x, y, z);
        if (t < fallT) dummy.rotation.set(tt * (3 + (i % 4)), tt * 2 + i, tt * (2 + (i % 3)));
        else dummy.rotation.set(kind === "coins" ? 0 : 0.0, i * 1.7, 0);
        dummy.scale.setScalar(scale);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mats, count]} castShadow frustumCulled={false}>
      <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
    </instancedMesh>
  );
};

/** Radial burst (confetti / sparks / coins popping out of a point). */
export const Burst3D: React.FC<{ kind?: ParticleKind; at: number; origin: Vec3; count?: number; power?: number; seed?: number; life?: number }> = ({ kind = "confetti", at, origin, count = 90, power = 5, seed = 3, life = 45 }) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(GEO[kind], [kind]);
  const mat = useMemo(() => (kind === "sparks" ? glow(COLORS.sparks[0], 5) : toon("#ffffff", { side: THREE.DoubleSide })), [kind]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(COLORS[kind][Math.floor(rand(seed, i) * COLORS[kind].length)]);
      arr.set([c.r, c.g, c.b], i * 3);
    }
    return arr;
  }, [count, kind, seed]);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const t = (f - at) / fps;
    for (let i = 0; i < count; i++) {
      if (t < 0 || f - at > life) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0.0001);
      } else {
        const th = rand(seed, i * 2) * Math.PI * 2;
        const ph = rand(seed, i * 2 + 1) * Math.PI * 0.45;
        const sp = power * (0.55 + rand(seed, i + 9) * 0.6);
        const vx = Math.cos(th) * Math.cos(ph) * sp;
        const vz = Math.sin(th) * Math.cos(ph) * sp;
        const vy = Math.sin(ph) * sp + 2.5;
        const drag = Math.exp(-t * 1.6);
        dummy.position.set(origin[0] + (vx * (1 - drag)) / 1.6, origin[1] + (vy * (1 - drag)) / 1.6 - 2.2 * t * t, origin[2] + (vz * (1 - drag)) / 1.6);
        dummy.rotation.set(t * 8 + i, t * 5, t * 6 + i * 0.3);
        dummy.scale.setScalar(Math.max(0.0001, 1 - Math.max(0, f - at - life * 0.7) / (life * 0.3)));
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false}>
      <instancedBufferAttribute attach="instanceColor" args={[colors, 3]} />
    </instancedMesh>
  );
};
