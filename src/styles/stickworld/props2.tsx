// StickWorld prop kit, part 2: landmarks, paper, travel, police, office extras.
import React, { useMemo } from "react";
import * as THREE from "three";
import { toon, unlit, glow } from "../../core/three/mats";
import { canvasTex, paint, textBoard } from "../../core/three/tex";
import { font } from "../../core/fonts";
import { Box, Board, Cyl, Ball } from "./props";
import type { Vec3 } from "../../core/types";

type T = { position?: Vec3; rotation?: Vec3; scale?: number | Vec3 };
const G: React.FC<T & { children: React.ReactNode }> = ({ position, rotation, scale, children }) => (
  <group position={position} rotation={rotation} scale={scale as any}>
    {children}
  </group>
);

/** See-through lattice texture (riveted X-bracing) for iron structures: opaque bars, transparent holes. */
const latticeTex = (bar: string, rows = 6) =>
  canvasTex(`lattice2${bar}${rows}`, 256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = bar;
    g.lineCap = "square";
    g.lineWidth = 22;
    g.strokeRect(11, 0, w - 22, h); // the two flanges
    g.lineWidth = 14;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(w, h);
    g.moveTo(w, 0);
    g.lineTo(0, h);
    g.moveTo(0, h / 2);
    g.lineTo(w, h / 2);
    g.stroke();
  }, [1, rows]);

const segMesh = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, mat: THREE.Material, key: string) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const dir = b.clone().sub(a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const e = new THREE.Euler().setFromQuaternion(q);
  return (
    <mesh key={key} position={mid.toArray()} rotation={[e.x, e.y, e.z]} material={mat} castShadow layers={3}>
      <cylinderGeometry args={[r1, r0, len, 4, 1, true]} />
    </mesh>
  );
};

/** Stylised Eiffel Tower (~H metres tall): four curved see-through lattice legs, the big arches, two platforms,
 *  a tapering lattice spire and the top lantern. Bronze two-tone with ink outlines. */
export const EiffelTower: React.FC<T & { H?: number; color?: string }> = ({ H = 30, color = "#8f6646", ...t }) => {
  const latt = useMemo(() => {
    const m = toon("#ffffff", { map: latticeTex(color, 3), side: THREE.DoubleSide });
    m.alphaTest = 0.5;
    m.transparent = false;
    return m;
  }, [color]);
  const latt2 = useMemo(() => {
    const m = toon("#ffffff", { map: latticeTex(color, 5), side: THREE.DoubleSide });
    m.alphaTest = 0.5;
    return m;
  }, [color]);
  const solid = toon(color);
  const deck = toon(new THREE.Color(color).multiplyScalar(0.88).getStyle());
  const base = H * 0.2;
  const h1 = H * 0.19;
  const h2 = H * 0.38;
  const top = H * 0.93;
  const curve = (sx: number, sz: number, y0: number, y1: number, b0: number, b1: number, bow: number) => {
    // concave leg: quadratic from (b0) at y0 to (b1) at y1, bowing outward by `bow`
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 4; i++) {
      const u = i / 4;
      const r = b0 + (b1 - b0) * u - bow * Math.sin(Math.PI * u) * -1 * (1 - u) * 0.6;
      const rr = b0 + (b1 - b0) * Math.pow(u, 0.72);
      void r;
      pts.push(new THREE.Vector3(sx * rr, y0 + (y1 - y0) * u, sz * rr));
    }
    return pts;
  };
  const legs: [number, number][] = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  const parts: React.ReactNode[] = [];
  legs.forEach(([sx, sz], li) => {
    const p = curve(sx, sz, 0, h1, base, base * 0.42, base * 0.1);
    for (let i = 0; i < p.length - 1; i++) parts.push(segMesh(p[i], p[i + 1], H * (0.03 - i * 0.003), H * (0.03 - (i + 1) * 0.003), latt, `L${li}${i}`));
    const q = curve(sx, sz, h1, h2, base * 0.38, base * 0.16, 0);
    for (let i = 0; i < q.length - 1; i++) parts.push(segMesh(q[i], q[i + 1], H * (0.017 - i * 0.0015), H * (0.017 - (i + 1) * 0.0015), latt, `M${li}${i}`));
    // corner feet
    parts.push(<Box key={`F${li}`} size={[H * 0.05, H * 0.012, H * 0.05]} color="#6b5a4a" position={[sx * base, H * 0.006, sz * base]} r={0.05} />);
  });
  // spire: 4 lattice columns converging + core
  const spire: THREE.Vector3[][] = legs.map(([sx, sz]) => [new THREE.Vector3(sx * base * 0.15, h2, sz * base * 0.15), new THREE.Vector3(sx * H * 0.012, top, sz * H * 0.012)]);
  spire.forEach(([a, b], i) => parts.push(segMesh(a, b, H * 0.011, H * 0.004, latt2, `S${i}`)));
  return (
    <G {...t}>
      {parts}
      {/* the big decorative arches under the first platform */}
      {[0, 1, 2, 3].map((i) => {
        const off = base * 0.7;
        const pos: [number, number, number] = i === 0 ? [0, h1 * 0.38, off] : i === 1 ? [0, h1 * 0.38, -off] : i === 2 ? [off, h1 * 0.38, 0] : [-off, h1 * 0.38, 0];
        return (
          <mesh key={`a${i}`} position={pos} rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]} material={solid} castShadow>
            <torusGeometry args={[base * 0.6, H * 0.007, 6, 28, Math.PI]} />
          </mesh>
        );
      })}
      <Box size={[base * 1.02, H * 0.024, base * 1.02]} color={new THREE.Color(color).multiplyScalar(0.9).getStyle()} position={[0, h1, 0]} r={0.05} />
      <Box size={[base * 0.9, H * 0.012, base * 0.9]} color="#c9a227" position={[0, h1 + H * 0.017, 0]} r={0.03} />
      <Box size={[base * 0.44, H * 0.016, base * 0.44]} color={new THREE.Color(color).multiplyScalar(0.9).getStyle()} position={[0, h2, 0]} r={0.04} />
      <mesh position={[0, top + H * 0.012, 0]} material={deck} castShadow>
        <boxGeometry args={[H * 0.03, H * 0.024, H * 0.03]} />
      </mesh>
      <Cyl r={H * 0.0035} h={H * 0.06} color="#5b4334" position={[0, top + H * 0.024, 0]} />
    </G>
  );
};

/** A folded newspaper (front page faces +z). */
export const Newspaper: React.FC<T & { masthead?: string; headline: string; sub?: string; w?: number }> = ({ masthead = "LE MATIN", headline, sub = "", w = 0.62, ...t }) => {
  const h = w * 1.25;
  const fam = font("DM Serif Display");
  const map = useMemo(
    () =>
      canvasTex(`news|${masthead}|${headline}|${sub}`, 800, 1000, (g, W, Hh) => {
        g.fillStyle = "#f4efe2";
        g.fillRect(0, 0, W, Hh);
        g.fillStyle = "#1b1b1f";
        g.textAlign = "center";
        g.font = `400 110px "${fam}", serif`;
        g.fillText(masthead, W / 2, 130);
        g.fillRect(40, 160, W - 80, 6);
        g.fillRect(40, 176, W - 80, 2);
        // headline (wrap)
        const words = headline.split(" ");
        const lines: string[] = [];
        let cur = "";
        g.font = `400 92px "${fam}", serif`;
        for (const wd of words) {
          const tst = cur ? cur + " " + wd : wd;
          if (g.measureText(tst).width > W - 90 && cur) {
            lines.push(cur);
            cur = wd;
          } else cur = tst;
        }
        if (cur) lines.push(cur);
        lines.slice(0, 3).forEach((l, i) => g.fillText(l, W / 2, 290 + i * 96));
        // a little drawing of the tower + columns of text
        g.strokeStyle = "#3a3a3a";
        g.lineWidth = 6;
        const ty = 300 + lines.length * 96;
        g.beginPath();
        g.moveTo(W * 0.28, ty + 330);
        g.lineTo(W * 0.36, ty);
        g.lineTo(W * 0.44, ty + 330);
        g.moveTo(W * 0.31, ty + 230);
        g.lineTo(W * 0.41, ty + 230);
        g.stroke();
        g.fillStyle = "#8a8a8a";
        for (let r = 0; r < 12; r++) {
          g.fillRect(W * 0.54, ty + r * 28, W * 0.38 * (r % 4 === 3 ? 0.6 : 1), 10);
          if (ty + 360 + r * 28 < Hh - 30) g.fillRect(50, ty + 360 + r * 28, W - 100, 10);
        }
        if (sub) {
          g.fillStyle = "#c0392b";
          g.font = `400 46px "${fam}", serif`;
          g.fillText(sub, W / 2, ty - 30);
        }
      }),
    [masthead, headline, sub, fam],
  );
  return (
    <G {...t}>
      <mesh material={unlit("#ffffff", map, 1.02)} castShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]} material={toon("#e9e2cf")}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </G>
  );
};

export const Easel: React.FC<T & { text?: string; tex?: THREE.Texture; w?: number }> = ({ text = "", tex, w = 1.2, ...t }) => (
  <G {...t}>
    {[-0.35, 0.35].map((x) => (
      <mesh key={x} position={[x * w, 0.9, 0.12]} rotation={[0.12, 0, x > 0 ? -0.08 : 0.08]} material={toon("#8b5a2b")} castShadow>
        <boxGeometry args={[0.05, 1.8, 0.05]} />
      </mesh>
    ))}
    <mesh position={[0, 0.9, -0.2]} rotation={[-0.25, 0, 0]} material={toon("#8b5a2b")} castShadow>
      <boxGeometry args={[0.05, 1.8, 0.05]} />
    </mesh>
    <Board w={w} h={w * 0.78} text={text} tex={tex} bg="#fbf7ee" fg="#1b1b1f" position={[0, 1.35, 0.17]} rotation={[-0.12, 0, 0]} />
  </G>
);

export const Chandelier: React.FC<T & { r?: number }> = ({ r = 0.6, ...t }) => (
  <G {...t}>
    <Cyl r={0.015} h={1.2} color="#c9a227" position={[0, 0, 0]} />
    <mesh position={[0, -0.05, 0]} material={toon("#d4a017")}>
      <torusGeometry args={[r, 0.035, 8, 32]} />
    </mesh>
    {Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * r, 0.05, Math.sin((i / 8) * Math.PI * 2) * r]} material={glow("#fff0c2", 4.5)}>
        <sphereGeometry args={[0.06, 10, 8]} />
      </mesh>
    ))}
  </G>
);

export const Suitcase: React.FC<T & { color?: string; open?: number }> = ({ color = "#8b5a2b", open = 0, ...t }) => (
  <G {...t}>
    <Box size={[0.7, 0.18, 0.48]} color={color} position={[0, 0.09, 0]} r={0.04} />
    <group position={[0, 0.18, -0.24]} rotation={[-open * 1.7, 0, 0]}>
      <Box size={[0.7, 0.12, 0.48]} color={color} position={[0, 0.06, 0.24]} r={0.04} />
    </group>
    <Box size={[0.2, 0.04, 0.04]} color="#d4a017" position={[0, 0.2, 0.25]} r={0.01} />
    {open > 0.2 ? Array.from({ length: 6 }).map((_, i) => <Box key={i} size={[0.3, 0.04, 0.15]} color="#6fbf5b" position={[-0.2 + (i % 3) * 0.2, 0.2 + Math.floor(i / 3) * 0.04, -0.05 + (i % 2) * 0.1]} r={0.005} />) : null}
  </G>
);

export const Train: React.FC<T & { color?: string; carriages?: number; sign?: string; smoke?: number }> = ({ color = "#2b6fd6", carriages = 2, sign, smoke = 0, ...t }) => (
  <G {...t}>
    {/* locomotive: horizontal boiler, cab, chimney, cowcatcher, red wheels */}
    <mesh position={[1.1, 1.45, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(color)} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 2.6, 24]} />
    </mesh>
    <mesh position={[2.42, 1.45, 0]} rotation={[0, 0, Math.PI / 2]} material={toon("#2b2f3a")}>
      <cylinderGeometry args={[0.72, 0.72, 0.08, 24]} />
    </mesh>
    <Box size={[1.5, 2.1, 1.6]} color={color} position={[-0.85, 1.55, 0]} r={0.12} />
    <Box size={[1.7, 0.22, 1.8]} color="#2b2f3a" position={[-0.85, 2.7, 0]} r={0.05} />
    <mesh position={[-0.85, 1.95, 0.81]} material={unlit("#ffe9a8", null, 1.2)}>
      <planeGeometry args={[0.8, 0.6]} />
    </mesh>
    <Cyl r={0.2} rTop={0.3} h={0.9} color="#2b2f3a" position={[1.9, 2.05, 0]} />
    <Ball r={0.22} color="#d4a017" position={[0.9, 2.2, 0]} />
    <mesh position={[2.75, 0.55, 0]} rotation={[0, 0, -0.6]} material={toon("#c0392b")}>
      <coneGeometry args={[0.55, 0.9, 4]} />
    </mesh>
    <Box size={[3.8, 0.35, 1.5]} color="#2b2f3a" position={[0.4, 0.62, 0]} r={0.05} />
    {[-1.1, 0.25, 1.6].map((x, i) => (
      <group key={i}>
        {[0.78, -0.78].map((z) => (
          <mesh key={z} position={[x, 0.55, z]} rotation={[Math.PI / 2, 0, 0]} material={toon("#c0392b")} castShadow>
            <cylinderGeometry args={[i === 1 ? 0.55 : 0.42, i === 1 ? 0.55 : 0.42, 0.12, 20]} />
          </mesh>
        ))}
      </group>
    ))}
    {smoke > 0
      ? Array.from({ length: 6 }).map((_, i) => {
          const ph = (smoke * 0.04 + i / 6) % 1;
          return (
            <mesh key={i} position={[1.9 - ph * 3.2, 2.7 + ph * 2.2, 0]} material={toon("#f4f6fb")} scale={0.25 + ph * 0.6}>
              <sphereGeometry args={[1, 12, 8]} />
            </mesh>
          );
        })
      : null}
    {Array.from({ length: carriages }).map((_, c) => (
      <group key={c} position={[-(c + 1) * 3.6 - 0.9, 0, 0]}>
        <Box size={[3.2, 1.8, 1.6]} color={c % 2 ? "#e14b4b" : "#f2c14e"} position={[0, 1.4, 0]} r={0.15} />
        <Box size={[3.4, 0.16, 1.8]} color="#2b2f3a" position={[0, 2.36, 0]} r={0.05} />
        {[-1, 0, 1].map((k) => (
          <mesh key={k} position={[k * 0.95, 1.6, 0.81]} material={unlit("#bfe3ff", null, 1)}>
            <planeGeometry args={[0.7, 0.6]} />
          </mesh>
        ))}
        {[-1.0, 1.0].map((x) =>
          [0.78, -0.78].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.42, z]} rotation={[Math.PI / 2, 0, 0]} material={toon("#25262b")}>
              <cylinderGeometry args={[0.36, 0.36, 0.12, 16]} />
            </mesh>
          )),
        )}
      </group>
    ))}
    {sign ? <Board w={1.9} h={0.45} text={sign} bg="#1b1b22" fg="#ffcc33" position={[-4.5, 1.05, 0.82]} /> : null}
  </G>
);

export const Platform: React.FC<T & { len?: number }> = ({ len = 30, ...t }) => (
  <G {...t}>
    <Box size={[len, 0.9, 3]} color="#c9c2b4" position={[0, 0.45, 0]} r={0.03} />
    <Box size={[len, 0.05, 0.3]} color="#f2c14e" position={[0, 0.92, -1.2]} r={0.01} />
    {Array.from({ length: Math.floor(len / 0.8) }).map((_, i) => (
      <Box key={i} size={[0.25, 0.08, 2.4]} color="#6b4f3a" position={[-len / 2 + i * 0.8, 0.04, -3]} r={0.01} />
    ))}
    {[-0.7, 0.7].map((z) => (
      <Box key={z} size={[len, 0.08, 0.08]} color="#7d828c" position={[0, 0.12, -3 + z]} r={0.01} />
    ))}
  </G>
);

export const Phone: React.FC<T & { screen?: string }> = ({ screen = "", ...t }) => (
  <G {...t}>
    <Box size={[0.08, 0.16, 0.012]} color="#1d1f26" r={0.012} />
    <Board w={0.068} h={0.135} text={screen || " "} bg="#4d7cff" fg="#ffffff" border={null} position={[0, 0, 0.007]} glowK={1.3} />
  </G>
);

export const FileDrawer: React.FC<T & { label?: string; open?: number; empty?: boolean }> = ({ label = "", open = 0, empty = true, ...t }) => (
  <G {...t}>
    <Box size={[0.9, 1.4, 0.7]} color="#7b8794" position={[0, 0.7, 0]} r={0.03} />
    {[0.3, 0.75].map((y, i) => (
      <group key={i} position={[0, y, 0.36 + (i === 1 ? open * 0.5 : 0)]}>
        <Box size={[0.8, 0.38, i === 1 ? 0.6 : 0.04]} color="#8e9aa8" position={[0, 0, i === 1 ? -0.28 : 0]} r={0.02} />
        <Board w={0.34} h={0.1} text={i === 1 ? label : "1924"} bg="#f4efe2" fg="#1b1b1f" position={[0, 0.06, 0.03]} />
        {i === 1 && !empty ? <Box size={[0.7, 0.25, 0.5]} color="#e8d9a8" position={[0, 0.02, -0.28]} r={0.01} /> : null}
      </group>
    ))}
  </G>
);

export const Ship: React.FC<T & { sign?: string; color?: string }> = ({ sign, color = "#1f2a44", ...t }) => (
  <G {...t}>
    <Box size={[9, 1.8, 2.4]} color={color} position={[0, 0.9, 0]} r={0.3} />
    <Box size={[9.2, 0.25, 2.5]} color="#c0392b" position={[0, 0.2, 0]} r={0.08} />
    <Box size={[5, 1.2, 2]} color="#f4efe6" position={[0.5, 2.3, 0]} r={0.12} />
    {[-1, 0.6, 2.2].map((x, i) => (
      <group key={i} position={[x, 3.4, 0]}>
        <Cyl r={0.35} h={1.4} color="#e8b23e" />
        <Cyl r={0.36} h={0.25} color="#1b1b22" position={[0, 1.2, 0]} />
      </group>
    ))}
    {sign ? <Board w={3.2} h={0.6} text={sign} bg="#1b1b22" fg="#ffcc33" position={[0.5, 2.3, 1.02]} /> : null}
  </G>
);

export const Water: React.FC<T & { size?: number; color?: string }> = ({ size = 60, color = "#2f7fd1", ...t }) => {
  const map = canvasTex(`water${color}`, 512, 512, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = new THREE.Color(color).multiplyScalar(1.25).getStyle();
    g.lineWidth = 5;
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % w;
      const y = (i * 53) % h;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 20, y - 8, x + 40, y);
      g.stroke();
    }
  }, [size / 6, size / 6]);
  return (
    <G {...t}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={toon("#ffffff", { map })}>
        <planeGeometry args={[size, size]} />
      </mesh>
    </G>
  );
};

/** Rotating police light (red/blue), drive `t` with the frame. */
export const PoliceLight: React.FC<T & { t: number }> = ({ t: ph, ...t }) => {
  const red = Math.sin(ph * 0.5) > 0;
  return (
    <G {...t}>
      <Box size={[0.6, 0.15, 0.25]} color="#2b2f3a" r={0.03} />
      <mesh position={[-0.16, 0.12, 0]} material={red ? glow("#ff3030", 6) : toon("#7a1a1a")}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </mesh>
      <mesh position={[0.16, 0.12, 0]} material={!red ? glow("#3a6bff", 6) : toon("#1a2a7a")}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </mesh>
    </G>
  );
};

export const CafeTable: React.FC<T & { cloth?: string }> = ({ cloth = "#e14b4b", ...t }) => (
  <G {...t}>
    <Cyl r={0.5} h={0.05} color="#ffffff" position={[0, 0.74, 0]} />
    <mesh position={[0, 0.79, 0]} material={toon(cloth)} castShadow>
      <cylinderGeometry args={[0.52, 0.54, 0.04, 24]} />
    </mesh>
    <Cyl r={0.05} h={0.74} color="#2b2f3a" />
    <Cyl r={0.28} h={0.04} color="#2b2f3a" />
  </G>
);

export const Cup: React.FC<T & { color?: string }> = ({ color = "#ffffff", ...t }) => (
  <G {...t}>
    <Cyl r={0.06} rTop={0.07} h={0.11} color={color} />
    <Cyl r={0.11} h={0.012} color={color} />
  </G>
);

export const Awning: React.FC<T & { w?: number; a?: string; b?: string; text?: string }> = ({ w = 5, a = "#e14b4b", b = "#f4efe6", text, ...t }) => {
  const map = paint.stripes(a, b, 12, [w / 2.5, 1]);
  return (
    <G {...t}>
      <mesh rotation={[0.5, 0, 0]} material={toon("#ffffff", { map, side: THREE.DoubleSide })} castShadow>
        <planeGeometry args={[w, 1.3]} />
      </mesh>
      {text ? <Board w={w * 0.7} h={0.5} text={text} bg="#1b1b22" fg="#f4efe6" fontName="DM Serif Display" position={[0, 0.95, -0.25]} /> : null}
    </G>
  );
};

export const LampPost: React.FC<T & { on?: boolean }> = ({ on = false, ...t }) => (
  <G {...t}>
    <Cyl r={0.08} h={3.2} color="#1f2a2f" />
    <Ball r={0.2} color={on ? "#fff0c2" : "#f4efe6"} position={[0, 3.35, 0]} />
    {on ? (
      <mesh position={[0, 3.35, 0]} material={glow("#ffe7a8", 4)}>
        <sphereGeometry args={[0.16, 12, 8]} />
      </mesh>
    ) : null}
  </G>
);

export { textBoard };
