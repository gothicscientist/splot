// scenes: hand-written
// "What if you kept digging straight down?" - Blockcraft (original voxel) x What if.
// The Kola Superdeep Borehole told with blocks. Every event is keyed to its spoken word through useShot().
// Block worlds are schematic (1 block is not 1 metre underground); every number on screen is the sourced one.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Rain, Burst3D } from "../../core/three/particles";
import { orbit } from "../../core/three/camera";
import type { CamKey } from "../../core/three/camera";
import { clamp, invLerp, keys as kf, lerp, rand, smootherstep } from "../../core/anim";
import { VoxelWorld, Block, Voxels } from "../../styles/blockcraft/VoxelWorld";
import { Blocky, BCAST, PixelItem } from "../../styles/blockcraft/Blocky";
import type { BlockySpec } from "../../styles/blockcraft/Blocky";
import { SquareSun, CloudLayer, PixelToast, PixelTag, PixelGauge, PixelThermo } from "../../styles/blockcraft/Sky";
import type { BlockType } from "../../styles/blockcraft/blocks";
import type { Timeline, Vec3 } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const PIP: BlockySpec = BCAST.hero;
const SCI_A: BlockySpec = { skin: "#f0c9a6", hair: "#5a4632", hairStyle: "short", shirt: "#f4f6fb", shirtStyle: "lab", shirtAccent: "#c0392b", pants: "#3a3a46", hat: { kind: "hardhat", color: "#f2c230" }, seed: 12 };
const SCI_B: BlockySpec = { skin: "#d9a07a", hair: "#2a2420", hairStyle: "bob", shirt: "#f4f6fb", shirtStyle: "lab", shirtAccent: "#2f6fb3", pants: "#4a4a52", hat: { kind: "hardhat", color: "#e8762c" }, beard: "#2a2420", seed: 14 };

const basic = (c: string, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) });

/** The drill string: a thin square pipe from `top` down to `y`, with a spinning bit at the tip. */
const Drill: React.FC<{ x: number; z: number; top: number; y: number; spin?: number; bit?: number }> = ({ x, z, top, y, spin = 0, bit = 0.56 }) => {
  const m = useMemo(() => ({ pipe: basic("#b9c2cc"), dark: basic("#6d7783"), gold: basic("#f2c230"), tip: basic("#8e99a6") }), []);
  const len = Math.max(0.01, top - y);
  return (
    <group position={[x, 0, z]}>
      <mesh material={m.pipe} position={[0, y + len / 2, 0]}>
        <boxGeometry args={[0.22, len, 0.22]} />
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

/** Underground rock by depth: dirt, stone with ores, then deep stone. */
const rockAt = (x: number, y: number, z: number, top: BlockType): BlockType => {
  if (y === 0) return top;
  if (y >= -3) return "dirt";
  const r = rand(11, x * 7919 + y * 104729 + z * 31);
  if (y >= -24) return r < 0.05 ? "coalOre" : r < 0.08 ? "ironOre" : r < 0.1 ? "gravel" : "stone";
  return r < 0.03 ? "goldOre" : r < 0.05 ? "gemOre" : r < 0.075 ? "redOre" : "deepstone";
};

// ------------------------------------------------------------------------------------------------ s01 hook
// "What if you dug straight down and never stopped?"
const meadow = (v: Voxels) => {
  v.terrain({ x0: -26, x1: 26, z0: -40, z1: -13, base: 0, amp: 2.4, seed: 5, minY: -4, ores: false });
  v.terrain({ x0: -26, x1: 26, z0: -12, z1: 12, base: -1, flat: true, minY: -4, ores: false });
  v.tree(-5, 0, -4, 5).tree(6, 0, -7, 6).tree(-9, 0, -10, 5).tree(10, 0, -2, 4).tree(-13, 0, 2, 5);
  v.house(-11, 0, -9, 6, 5, 4);
  [[-3, 1], [4, 3], [-6, 5], [7, 6], [3, -3]].forEach(([x, z], i) => v.set(x, 0, z, i % 2 ? "wool_yellow" : "wool_red")); // flowers
  // the deep column under the dig site and the 2x2 shaft
  for (let x = -2; x <= 3; x++) for (let z = -1; z <= 4; z++) for (let y = -46; y <= -1; y++) v.set(x, y, z, rockAt(x, y === -1 ? 0 : y, z, "grass"));
  for (let y = -46; y <= -1; y++) for (const x of [0, 1]) for (const z of [1, 2]) v.set(x, y, z, null);
};
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const dug = s.hit("dug");
  const down = s.hit("down");
  const never = s.at("never");
  const v = variant % 3;
  const start: CamKey =
    v === 0
      ? { f: 0, pos: [3.1, 1.75, 6.4], look: [1, 0.75, 1.2], fov: 40, creep: 0.004 }
      : v === 1
        ? { f: 0, pos: [-0.9, 0.45, 4.3], look: [1, 1.15, 0.7], fov: 40, creep: 0.004 }
        : { f: 0, pos: [1.4, 12, 4.4], look: [1, 0, 1.4], fov: 40, creep: 0.004 };
  const cam: CamKey[] = [
    start,
    { f: down + 12, pos: [1, 5.2, 2.6], look: [1, -20, 1.95], fov: 52, ease: "glide", dur: 14, creep: 0.002 },
    { f: never + 8, pos: [1, 1.2, 2.1], look: [1, -30, 2.0], fov: 62, ease: "glide", dur: Math.max(8, never - down - 6) },
    { f: s.dur + 8, pos: [1, -24, 2.02], look: [1, -60, 2.0], fov: 70, ease: "linear" },
  ];
  const cover: [number, number, number][] = [
    [0, 1, 0],
    [1, 1, 4],
    [0, 2, 8],
    [1, 2, 12],
  ];
  return (
    <AbsoluteFill>
      <Stage look="day" ink={false} cam={cam} kicks={[dug + 1, dug + 13]} dof={(f) => (f < down ? 5 : 0)} focus={[1, 1, 0.4]}>
        <VoxelWorld build={meadow} />
        <SquareSun position={[40, 70, -110]} size={16} />
        <CloudLayer y={36} />
        {cover.map(([x, z, d]) => (
          <Block key={`${x}${z}`} type="grass" at={[x, -1, z]} breakAt={dug + d} />
        ))}
        <Blocky
          spec={PIP}
          at={[1, 0, 0.3]}
          poses={[
            [0, "lookDown"],
            [down, "lookDown"],
          ]}
          faces={[
            [0, "determined"],
            [dug + 13, "shocked"],
          ]}
          item={[[0, "pickaxe"]]}
          mining={[-20, dug + 14]}
        />
      </Stage>
      <PixelTag at={3} out={down + 4} text="DIG STRAIGHT DOWN?" x={540} y={300} size={62} color="#ffe14d" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the real attempt
// "In 1970, Soviet scientists tried it for real." / "Their hole was just 23 centimeters wide, about the size of a dinner plate."
const HOLE: Vec3 = [0.74, 0, -3.5];
const tundra = (v: Voxels) => {
  v.terrain({ x0: -28, x1: 28, z0: -44, z1: -17, base: 0, amp: 2.2, seed: 9, minY: -3, top: "snow", ores: false });
  v.terrain({ x0: -28, x1: 28, z0: -16, z1: 14, base: -1, flat: true, minY: -3, top: "snow", ores: false });
  v.tree(-9, 0, -9, 6, "log", "leaves").tree(11, 0, -12, 7).tree(-14, 0, -3, 5).tree(15, 0, -5, 6).tree(-18, 0, -13, 7);
  v.house(6, 0, -9, 6, 5, 3, "planks", "wool_red");
  // drilling platform with a 1-block recess where the hole is
  v.box(-3, 0, -7, 3, 0, -1, "darkPlanks");
  v.set(0, 0, -4, null);
  // the derrick: four legs that step inward, red bands, a cap
  for (let y = 1; y <= 17; y++) {
    const h = y <= 6 ? 3 : y <= 12 ? 2 : 1;
    for (const sx of [-h, h]) for (const sz of [-h, h]) v.set(sx, y, -4 + sz, "ironBlock");
    if (y % 6 === 0) {
      for (let k = -h; k <= h; k++) {
        v.set(k, y, -4 - h, "wool_red").set(k, y, -4 + h, "wool_red").set(-h, y, -4 + k, "wool_red").set(h, y, -4 + k, "wool_red");
      }
    }
  }
  v.box(-1, 18, -5, 1, 18, -3, "ironBlock").set(0, 19, -4, "wool_red").set(0, 20, -4, "glow");
};
const S02: React.FC = () => {
  const s = useShot();
  const y1970 = s.hit("1970");
  const real = s.hit("real");
  const hole = s.at("hole");
  const n23 = s.hit("23");
  const plate = s.hit("plate");
  const cam: CamKey[] = [
    { f: -8, pos: [8.5, 3.2, 13], look: [0, 7.5, -4], fov: 50, creep: 0.003 },
    { f: real + 6, pos: [6.5, 2.6, 9.5], look: [0, 6.5, -4], fov: 46, ease: "glide", dur: 30, creep: 0.003 },
    { f: n23 - 2, pos: [2.3, 1.75, -1.2], look: [0.5, 0.25, -3.5], fov: 34, ease: "glide", dur: Math.max(16, n23 - hole), creep: 0.004 },
    { f: plate + 10, pos: [1.9, 1.35, -1.75], look: [0.5, 0.1, -3.5], fov: 32, ease: "glide", dur: 20, creep: 0.003 },
  ];
  const dark = useMemo(() => basic("#07080c"), []);
  const drop = clamp((s.f - plate) / 7);
  const plateY = 0.03 + (1 - drop) * (1 - drop) * 1.3;
  return (
    <AbsoluteFill>
      <Stage look="overcast" ink={false} cam={cam} dof={(f) => (f > n23 - 4 ? 9 : 0)} focus={[0.5, 0.1, -3.5]}>
        <VoxelWorld build={tundra} />
        <CloudLayer y={40} seed={5} />
        <Rain kind="snow" count={260} at={-150} spread={420} center={[0, 0, -2]} half={[14, 12]} height={16} ground={-2} seed={4} scale={1.6} />
        {/* the hole (23 cm) at the bottom of the recess, and the pipe that goes into it */}
        <mesh material={dark} position={[HOLE[0], 0.012, HOLE[2]]}>
          <boxGeometry args={[0.23, 0.02, 0.23]} />
        </mesh>
        <Drill x={HOLE[0]} z={HOLE[2]} top={18} y={lerp(0.9, 2.6, smootherstep(invLerp(hole, n23, s.f)))} spin={s.f * 0.5} bit={0.2} />
        {s.f >= plate ? <PixelItem kind="plate" position={[0.3, plateY, -3.5]} rotation={[-Math.PI / 2, 0, 0]} size={0.265} /> : null}
        <Blocky spec={SCI_A} at={[-2.4, 0, 1.6]} yaw={160} poses={[[0, "pointUp"], [real + 10, "idle"]]} faces={[[0, "happy"]]} talking={s.speaking(["b02"])} />
        <Blocky spec={SCI_B} at={[2.6, 0, 2.2]} yaw={205} poses={[[0, "lookUp"], [real, "celebrate"]]} faces={[[0, "neutral"], [real, "happy"]]} />
        <Blocky spec={SCI_A} at={[-0.9, 1, -3.3]} yaw={90} pop={hole - 30} poses={[[0, "crouch"]]} faces={[[0, "neutral"], [plate, "shocked"]]} />
      </Stage>
      <PixelTag at={y1970} out={hole - 4} text="1970" x={540} y={310} size={120} color="#ffe14d" />
      <PixelTag at={n23} text="23 cm" x={540} y={310} size={110} color="#ffffff" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 going down
// "For nineteen years, the drill went down. One kilometer. Five. Ten." / "At 12,262 meters, it became the deepest hole humans have ever made."
const S03: React.FC = () => {
  const s = useShot();
  const went = s.at("went");
  const one = s.hit("One");
  const five = s.hit("Five");
  const ten = s.hit("Ten");
  const n12 = s.hit("12,262");
  const deepest = s.hit("deepest");
  const bitY = kf(s.f, [[-10, 2.4], [went, 0.6], [one, -9], [five, -22], [ten, -36], [n12, -39], [n12 + 14, -46], [s.dur + 10, -46.6]]);
  const depth = kf(s.f, [[went, 0], [one + 4, 1000], [five - 4, 1400], [five + 4, 5000], [ten - 4, 5600], [ten + 4, 10000], [n12, 10400], [n12 + 14, 12262]]);
  const cut = Math.floor(bitY - 0.6);
  const cy = bitY + 0.8;
  const stopped = s.f >= n12 + 14;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        ink={false}
        cam={(f) => ({ pos: [0.5 + Math.sin(f * 0.02) * 0.25, cy + 0.6, 15.5], look: [0.5, cy - 0.4, 0], fov: 34, roll: 0 })}
        creep={0.0006}
        kicks={[]}
      >
        <VoxelWorld
          deps={[cut]}
          build={(v) => {
            for (let x = -9; x <= 9; x++) for (let y = -62; y <= 0; y++) for (const z of [-1, 0]) v.set(x, y, z, rockAt(x, y, z, "snow"));
            for (let y = Math.max(-62, cut); y <= 0; y++) v.set(0, y, 0, null).set(0, y, -1, null);
            // the foot of the derrick on the surface
            for (let y = 1; y <= 7; y++) for (const x of [-3, 3]) v.set(x, y, -1, "ironBlock");
            v.box(-3, 6, -1, 3, 6, -1, "wool_red");
          }}
        />
        <CloudLayer y={44} seed={5} />
        <Drill x={0.5} z={0.5} top={9} y={bitY} spin={stopped ? 0 : s.f * 0.9} />
        {!stopped && s.f >= went ? <Burst3D kind="sparks" at={Math.floor(s.f / 6) * 6} origin={[0.5, bitY - 0.3, 0.9]} count={14} power={1.6} life={10} seed={Math.floor(s.f / 6)} /> : null}
        {stopped ? <Burst3D kind="confetti" at={deepest} origin={[0.5, bitY + 2.2, 1.4]} count={70} power={4} life={40} /> : null}
      </Stage>
      <PixelGauge at={went} label="DEPTH" value={Math.round(depth)} unit=" m" y={320} size={70} />
      <PixelToast at={deepest} title="New record!" sub="Deepest hole ever dug" icon="#1" y={520} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the deep (s04 + s05)
const SOFT: [number, number][] = [
  [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [0, -1], [1, -1], [-2, 0], [2, 0], [0, -2],
];
const MAGMA: [number, number, number][] = [
  [-3, -2, 0], [2, -3, 4], [-2, 2, 8], [3, 1, 12], [-4, 0, 16], [1, -4, 20], [4, -2, 24], [-3, 3, 28], [3, 4, 32], [-1, -4, 36], [-5, -3, 40], [5, 3, 44], [-4, 5, 48], [2, 6, 52],
];
const Deep: React.FC<{ soft?: boolean }> = ({ soft = false }) => (
  <VoxelWorld
    deps={[soft]}
    build={(v) => {
      for (let x = -9; x <= 9; x++)
        for (let y = -10; y <= 14; y++)
          for (const z of [-1, 0]) {
            const r = rand(23, x * 7919 + y * 104729 + z * 31);
            v.set(x, y, z, r < 0.04 ? "redOre" : r < 0.07 ? "goldOre" : r < 0.1 ? "obsidian" : "deepstone");
          }
      for (let y = 0; y <= 14; y++) v.set(0, y, 0, null).set(0, y, -1, null);
      if (soft) for (const [x, y] of SOFT) v.set(x, y, 0, null);
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
  const n180 = s.hit("180");
  const celsius = s.end("Celsius");
  const expected = s.hit("expected");
  const heat = smootherstep(invLerp(wrong, n180 + 20, s.f));
  const shake = s.f >= wrong ? Math.sin(s.f * 1.9) * 0.03 * heat : 0;
  const cam: CamKey[] = [
    { f: -8, pos: [0.5, 5.5, 13], look: [0.5, 3.5, 0], fov: 38, creep: 0.002 },
    { f: wrong, pos: [0.5, 2.6, 10.5], look: [0.5, 0.9, 0], fov: 38, ease: "glide", dur: Math.max(12, wrong), creep: 0.003 },
    { f: n180 + 8, pos: [-0.6, 1.9, 8.4], look: [0.3, 0.6, 0], fov: 38, ease: "glide", dur: 30, creep: 0.003 },
  ];
  const temp = kf(s.f, [[rock, 20], [n180, 60], [celsius, 180]]);
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      <Stage look="night" ink={false} sky={false} fog={null} cam={cam} kicks={[wrong + 1, expected + 1]}>
        <Deep />
        {MAGMA.map(([x, y, d]) => (
          <Block key={`${x},${y}`} type={d % 8 === 0 ? "lava" : "magma"} at={[x, y, 0.02]} pop={wrong + d} size={1.03} />
        ))}
        <Drill x={0.5 + shake} z={0.5} top={16} y={0.62 + Math.abs(shake) * 2} spin={s.f * (0.9 - 0.6 * heat)} />
      </Stage>
      <Heat k={heat * 0.9} />
      <PixelThermo at={rock - 2} x={770} y={520} fill={invLerp(20, 180, temp)} value={temp} />
    </AbsoluteFill>
  );
};

// "You see, at that heat, rock stops acting like rock. It starts to behave like plastic." / "The drill simply could not go any deeper."
const S05: React.FC = () => {
  const s = useShot();
  const stops = s.hit("stops");
  const plastic = s.hit("plastic");
  const drill = s.hit("drill");
  const deeper = s.hit("deeper");
  const soft = smootherstep(invLerp(stops, plastic + 6, s.f));
  const push = s.f >= drill ? Math.abs(Math.sin((s.f - drill) * 0.42)) * Math.exp(-(s.f - drill) / 26) : 0;
  const bitY = 0.62 + push * 0.5 - (s.f >= drill ? 0.14 * (1 - Math.exp(-(s.f - drill) / 8)) : 0);
  const cam: CamKey[] = [
    { f: -8, pos: [-0.6, 1.9, 8.4], look: [0.3, 0.6, 0], fov: 38, creep: 0.002 },
    { f: stops + 10, pos: [0.5, 1.1, 6.2], look: [0.5, 0.4, 0], fov: 36, ease: "glide", dur: 26, creep: 0.004 },
    { f: drill + 8, pos: [1.4, 0.9, 5.4], look: [0.5, 0.35, 0], fov: 36, ease: "glide", dur: 20, creep: 0.004 },
  ];
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      <Stage look="night" ink={false} sky={false} fog={null} cam={cam} kicks={[deeper + 1]}>
        <Deep soft />
        {MAGMA.map(([x, y]) => (
          <Block key={`${x},${y}`} type={(x + y) % 4 === 0 ? "lava" : "magma"} at={[x, y, 0.02]} size={1.03} />
        ))}
        {SOFT.map(([x, y], i) => (
          <Block key={`${x},${y}`} type={i % 3 === 2 ? "magma" : "deepstone"} at={[x, y, 0]} wobble={0.2 * soft * (0.7 + (i % 3) * 0.2)} />
        ))}
        <Drill x={0.5} z={0.5} top={16} y={bitY} spin={s.f >= deeper ? 0 : s.f * 0.5} />
        {s.f >= drill ? <Burst3D kind="sparks" at={drill + Math.floor((s.f - drill) / 7) * 7} origin={[0.5, 0.2, 0.9]} count={18} power={2.2} life={11} seed={Math.floor(s.f / 7)} /> : null}
      </Stage>
      <Heat k={0.8} />
      <PixelTag at={plastic} out={drill - 4} text="LIKE PLASTIC" x={540} y={320} size={84} color="#ffb04a" />
      <PixelTag at={deeper} text="STUCK" x={540} y={320} size={120} color="#ff5a4a" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 the scale
// "So how far did they get? The center of the Earth is 6,371 kilometers down." / "After nineteen years of digging, they made it 0.2 percent of the way."
const R = 15;
const planet = (v: Voxels) => {
  v.planet(
    R,
    [
      [0.93, "stone"],
      [0.56, "magma"],
      [0.27, "lava"],
      [0, "glow"],
    ],
    true,
    (x, y, z) => {
      const n = Math.sin(x * 0.45 + 1) + Math.cos(z * 0.5 + y * 0.35) + Math.sin(y * 0.6 + x * 0.2);
      if (Math.abs(y) > R - 3) return "snow";
      return n > 0.35 ? "grass" : n > 0.1 ? "sand" : "water";
    },
  );
};
const S06: React.FC = () => {
  const s = useShot();
  const center = s.hit("center");
  const n6371 = s.hit("6,371");
  const down = s.end("down");
  const after = s.at("After");
  const n02 = s.hit("0.2");
  const mat = useMemo(() => ({ gold: basic("#ffd94a", 2.2), red: basic("#ff3b30", 2.6) }), []);
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
  const lineT = smootherstep(invLerp(center, down, s.f));
  const len = R * lineT;
  const km = Math.round(kf(s.f, [[n6371 - 2, 0], [down, 6371]]));
  const pct = kf(s.f, [[n02, 0], [n02 + 12, 0.2]]);
  const blink = s.f >= after ? 0.6 + 0.4 * Math.sin((s.f - after) * 0.5) : 0;
  const yaw = lerp(38, 52, s.f / Math.max(1, s.dur));
  const far = orbit([0, 3, 0], yaw, 20, 62);
  const near = orbit([0.6, R - 1.5, 0.6], yaw + 4, 16, 22);
  const cam: CamKey[] = [
    { f: -10, pos: orbit([0, 8, 0], 38, 24, 34), look: [0, 9, 0], fov: 40, creep: 0.001 },
    { f: center + 6, pos: far, look: [0, 2, 0], fov: 40, ease: "glide", dur: Math.max(18, center + 10), creep: 0.0012 },
    { f: after + 4, pos: far, look: [0, 2.4, 0], fov: 39, ease: "linear", creep: 0.0012 },
    { f: n02, pos: near, look: [0.3, R - 0.6, 0.3], fov: 36, ease: "glide", dur: Math.max(16, n02 - after - 2), creep: 0.003 },
  ];
  return (
    <AbsoluteFill style={{ background: "#05060c" }}>
      <Stage look="night" ink={false} fog={null} cam={cam} kicks={[n02 + 1]}>
        <mesh geometry={stars} material={starMat} layers={3} />
        <VoxelWorld build={planet} />
        {/* the measuring line: surface to centre, along the corner of the cut */}
        {lineT > 0 ? (
          <mesh material={mat.gold} position={[0.12, R - len / 2, 0.12]}>
            <boxGeometry args={[0.22, len, 0.22]} />
          </mesh>
        ) : null}
        {/* the borehole: 0.2 % of that line, drawn at its true proportion would be invisible, so it is a marker */}
        {s.f >= after ? (
          <mesh material={mat.red} position={[0.12, R + 0.02, 0.12]} scale={1 + blink * 0.5}>
            <boxGeometry args={[0.34, 0.16, 0.34]} />
          </mesh>
        ) : null}
        <Blocky
          spec={PIP}
          at={[-1.4, R, -1.2]}
          yaw={50}
          scale={1.25}
          poses={[
            [0, "lookDown"],
            [n02 + 14, "shrug"],
          ]}
          faces={[
            [0, "neutral"],
            [n02 + 14, "sad"],
          ]}
          item={[[0, "pickaxe"]]}
        />
      </Stage>
      <PixelGauge at={n6371 - 2} out={after} label="TO THE CENTER" value={km} unit=" km" y={300} size={62} color="#ffd94a" />
      <PixelGauge at={n02} label="THEY DUG" value={Math.round(pct * 10) / 10} decimals={1} unit=" %" y={300} size={96} color="#ff6b5a" />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#0a0b10" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06 }} />
);
