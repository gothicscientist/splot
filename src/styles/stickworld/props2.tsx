// StickWorld prop kit, part 2: landmarks, paper, travel, police, office extras.
import React, { useMemo } from "react";
import * as THREE from "three";
import { toon, unlit, glow } from "../../core/three/mats";
import { canvasTex, paint, textBoard } from "../../core/three/tex";
import { NOINK } from "../../core/three/look/ink";
import { font } from "../../core/fonts";
import { Box, Board, Cyl, Ball } from "./props";
import { drawStick, FACES, POSES } from "./draw";
import type { Face, Pose, StickSpec } from "./draw";
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

/** Ink drawing of the Eiffel Tower filling the box (x, y, w, h): solid silhouette with the great arch and the gap
 *  between the first two decks cut out, wide decks, lattice hatching. Reads as the tower at thumbnail size. */
export function drawTowerSketch(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ink = "#2a2522", paper = "#f4efe2") {
  const cx = x + w / 2;
  const P = (u: number, v: number): [number, number] => [cx + u * w, y + v * h];
  const left: [number, number][] = [
    [-0.012, 0.0], [-0.02, 0.06], [-0.034, 0.2], [-0.054, 0.33], [-0.082, 0.45], [-0.125, 0.57], [-0.185, 0.68], [-0.26, 0.79], [-0.35, 0.89], [-0.46, 1.0],
  ];
  const outline = () => {
    g.beginPath();
    left.forEach(([u, v], i) => (i ? g.lineTo(...P(u, v)) : g.moveTo(...P(u, v))));
    [...left].reverse().forEach(([u, v]) => g.lineTo(...P(-u, v)));
    g.closePath();
  };
  g.save();
  g.fillStyle = ink;
  outline();
  g.fill();
  // lattice hatching inside the silhouette
  g.save();
  outline();
  g.clip();
  g.strokeStyle = paper;
  g.lineWidth = Math.max(1.5, w * 0.007);
  const step = w * 0.055;
  g.beginPath();
  for (let k = -h; k < w + h; k += step) {
    g.moveTo(x + k, y + h * 0.1);
    g.lineTo(x + k + h, y + h * 1.1);
    g.moveTo(x + k + h, y + h * 0.1);
    g.lineTo(x + k, y + h * 1.1);
  }
  g.stroke();
  g.restore();
  // cut-outs: the great arch under the first deck, the gap between the first and second decks
  g.fillStyle = paper;
  g.beginPath();
  g.moveTo(...P(-0.3, 1.0));
  g.bezierCurveTo(...P(-0.27, 0.85), ...P(-0.13, 0.79), ...P(0, 0.79));
  g.bezierCurveTo(...P(0.13, 0.79), ...P(0.27, 0.85), ...P(0.3, 1.0));
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(...P(-0.112, 0.66));
  g.lineTo(...P(-0.048, 0.445));
  g.lineTo(...P(0.048, 0.445));
  g.lineTo(...P(0.112, 0.66));
  g.closePath();
  g.fill();
  // decks: wider than the legs (the classic read), the top lantern and flag pole
  g.fillStyle = ink;
  g.fillRect(...P(-0.25, 0.655), 0.5 * w, 0.04 * h);
  g.fillRect(...P(-0.115, 0.42), 0.23 * w, 0.03 * h);
  g.fillRect(...P(-0.032, 0.055), 0.064 * w, 0.03 * h);
  g.fillRect(...P(-0.004, -0.035), 0.008 * w, 0.05 * h);
  g.restore();
}

/** Rust streaks over a drawTowerSketch box: orange drips running down from the decks and the legs; `amount` 0..1
 *  grows them (the drips lengthen as the tower "rusts"). */
export function drawRust(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, amount: number) {
  const cx = x + w / 2;
  const r = (i: number) => {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const cols = ["#d0661c", "#b4501a", "#e3872e", "#9a3f15"];
  g.save();
  g.lineCap = "round";
  // drips from deck edges and joints: [u, v, length]
  const starts: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) starts.push([-0.24 + 0.48 * r(i), 0.69, 0.08 + 0.16 * r(i + 40)]);
  for (let i = 0; i < 8; i++) starts.push([-0.1 + 0.2 * r(i + 80), 0.45, 0.06 + 0.12 * r(i + 90)]);
  for (let i = 0; i < 10; i++) {
    const v = 0.72 + 0.22 * r(i + 120);
    const side = i % 2 ? 1 : -1;
    starts.push([side * (0.2 + 0.13 * ((v - 0.72) / 0.28) + 0.04 * r(i + 130)), v, 0.04 + 0.06 * r(i + 140)]);
  }
  starts.forEach(([u, v, len], i) => {
    const L = len * Math.min(1, amount * 1.25);
    if (L <= 0.002) return;
    g.strokeStyle = cols[i % cols.length];
    g.globalAlpha = 0.92;
    g.lineWidth = w * (0.012 + 0.012 * r(i + 200));
    g.beginPath();
    g.moveTo(cx + u * w, y + v * h);
    g.lineTo(cx + u * w + w * 0.004 * (r(i + 300) - 0.5), y + (v + L) * h);
    g.stroke();
    g.fillStyle = cols[i % cols.length];
    g.beginPath();
    g.arc(cx + u * w, y + (v + L) * h, g.lineWidth * 0.75, 0, Math.PI * 2);
    g.fill();
  });
  // blotches on the legs
  g.globalAlpha = 0.75 * Math.min(1, amount * 1.4);
  for (let i = 0; i < 14; i++) {
    const v = 0.5 + 0.48 * r(i + 400);
    const half = 0.04 + (v - 0.45) * 0.42;
    const u = (i % 2 ? 1 : -1) * half * (0.6 + 0.4 * r(i + 410));
    g.fillStyle = cols[(i + 1) % cols.length];
    g.beginPath();
    g.ellipse(cx + u * w, y + v * h, w * (0.018 + 0.02 * r(i + 420)), h * (0.012 + 0.012 * r(i + 430)), 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/** A rain-cloud news illustration (the WEATHER: RAIN gag). */
function drawRainArt(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  g.save();
  g.fillStyle = "#ffffff";
  g.strokeStyle = "#2a2522";
  g.lineWidth = w * 0.012;
  const cx = x + w / 2;
  const cy = y + h * 0.36;
  g.beginPath();
  for (const [dx, dy, rr] of [
    [-0.18, 0.04, 0.13],
    [-0.04, -0.06, 0.17],
    [0.13, 0.0, 0.14],
    [0.24, 0.07, 0.09],
    [-0.28, 0.09, 0.08],
  ])
    g.moveTo(cx + (dx + rr) * w, cy + dy * w), g.arc(cx + dx * w, cy + dy * w, rr * w, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillRect(cx - 0.3 * w, cy + 0.04 * w, 0.58 * w, 0.1 * w);
  g.strokeStyle = "#4a78b8";
  g.lineWidth = w * 0.016;
  g.lineCap = "round";
  g.beginPath();
  for (let i = 0; i < 9; i++) {
    const rx = cx - 0.26 * w + i * 0.065 * w;
    const ry = cy + 0.2 * w + (i % 3) * 0.05 * w;
    g.moveTo(rx, ry);
    g.lineTo(rx - 0.03 * w, ry + 0.12 * w);
  }
  g.stroke();
  g.restore();
}

/** A broadsheet front page (faces +z): masthead, a headline that wraps to at most 2 lines (auto-shrinks), a red
 *  sub-head, an illustration box (`art`: tower drawing, rain cloud or none) and text columns. `rust` 0..1 grows rust
 *  streaks on the tower drawing; `held` adds the reader's two ink-dot thumbs on the side edges. `res` scales the
 *  texture (2-3 for extreme close-ups on the drawing). */
export const Newspaper: React.FC<T & { masthead?: string; headline: string; sub?: string; w?: number; art?: "tower" | "rain" | "none"; rust?: number; held?: boolean; res?: number }> = ({
  masthead = "LE MATIN",
  headline,
  sub = "",
  w = 0.62,
  art = "tower",
  rust = 0,
  held = false,
  res = 1,
  ...t
}) => {
  const h = w * 1.25;
  const fam = font("DM Serif Display");
  // rust grows in 10 steps (5 at a raised resolution, so a hi-res insert caches at most 6 textures)
  const step = res > 1 ? 2 : 1;
  const rq = art === "tower" ? Math.round((Math.max(0, Math.min(1, rust)) * 10) / step) * step : 0;
  const map = useMemo(
    () =>
      canvasTex(`news2|${masthead}|${headline}|${sub}|${art}|${rq}`, Math.round(800 * res), Math.round(1000 * res), (g) => {
        g.scale(res, res);
        const W = 800;
        const Hh = 1000;
        g.fillStyle = "#f4efe2";
        g.fillRect(0, 0, W, Hh);
        g.fillStyle = "#1b1b1f";
        g.textAlign = "center";
        g.textBaseline = "alphabetic";
        g.font = `400 112px "${fam}", serif`;
        g.fillText(masthead, W / 2, 124);
        g.fillRect(40, 148, W - 80, 7);
        g.fillRect(40, 164, W - 80, 2);
        // headline: wraps at 92 px; shrinks until it fits in two lines inside the margins
        let size = 92;
        let lines: string[] = [];
        const wrap = () => {
          g.font = `400 ${size}px "${fam}", serif`;
          lines = [];
          let cur = "";
          for (const wd of headline.split(" ")) {
            const tst = cur ? cur + " " + wd : wd;
            if (g.measureText(tst).width > W - 110 && cur) {
              lines.push(cur);
              cur = wd;
            } else cur = tst;
          }
          if (cur) lines.push(cur);
        };
        wrap();
        while ((lines.length > 2 || lines.some((l) => g.measureText(l).width > W - 90)) && size > 52) {
          size -= 4;
          wrap();
        }
        const lh = size * 1.04;
        let yy = 176 + size;
        lines.forEach((l, i) => g.fillText(l, W / 2, yy + i * lh));
        yy += (lines.length - 1) * lh;
        if (sub) {
          g.fillStyle = "#c0392b";
          g.font = `400 50px "${fam}", serif`;
          g.fillText(sub, W / 2, yy + 66);
          yy += 66;
        }
        let top = yy + (art === "none" ? 34 : 74);
        if (art !== "none") {
          const bx = 64;
          const bw = W - 128;
          const bh = Math.min(420, Hh - 150 - top);
          g.fillStyle = "#e9e2cf";
          g.fillRect(bx, top, bw, bh);
          g.strokeStyle = "#5a5550";
          g.lineWidth = 4;
          g.strokeRect(bx, top, bw, bh);
          if (art === "tower") {
            const tx = bx + bw * 0.2;
            const tw = bw * 0.6;
            drawTowerSketch(g, tx, top + 22, tw, bh - 36, "#2a2522", "#e9e2cf");
            if (rq > 0) drawRust(g, tx, top + 22, tw, bh - 36, rq / 10);
          } else drawRainArt(g, bx, top, bw, bh);
          top += bh + 26;
        }
        g.fillStyle = "#8a8580";
        for (let r = 0; top + r * 26 < Hh - 34; r++) {
          g.fillRect(52, top + r * 26, W / 2 - 70, 9);
          g.fillRect(W / 2 + 18, top + r * 26, (W / 2 - 70) * (r % 4 === 3 ? 0.55 : 1), 9);
        }
      }),
    [masthead, headline, sub, fam, art, rq, res],
  );
  const mat = useMemo(() => unlit("#ffffff", map, 1.02), [map]);
  const thumb = useMemo(() => unlit("#1d1418"), []);
  return (
    <G {...t}>
      <mesh material={mat} castShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]} material={toon("#e9e2cf")}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {held
        ? [-1, 1].map((s) => (
            <mesh key={s} position={[s * (w / 2 - w * 0.012), -h * 0.06, 0.004]} material={thumb} layers={NOINK}>
              <circleGeometry args={[w * 0.04, 20]} />
            </mesh>
          ))
        : null}
    </G>
  );
};

export const Easel: React.FC<T & { text?: string; tex?: THREE.Texture; w?: number }> = ({ text = "", tex, w = 1.2, ...t }) => (
  <G {...t}>
    {/* front legs lean back behind the board (never across the drawing), back leg props it up */}
    {[-0.36, 0.36].map((x) => (
      <mesh key={x} position={[x * w, 0.9, 0.1]} rotation={[-0.12, 0, x > 0 ? 0.05 : -0.05]} material={toon("#8b5a2b")} castShadow>
        <boxGeometry args={[0.05, 1.8, 0.05]} />
      </mesh>
    ))}
    <mesh position={[0, 0.85, -0.25]} rotation={[0.3, 0, 0]} material={toon("#8b5a2b")} castShadow>
      <boxGeometry args={[0.05, 1.75, 0.05]} />
    </mesh>
    <Box size={[w * 0.95, 0.05, 0.1]} color="#7a4a24" position={[0, 1.35 - w * 0.39 - 0.02, 0.2]} r={0.01} />
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

/** Two-drawer filing cabinet. The top drawer slides out by `open` (0..1) as a hollow tray, so an open drawer shows
 *  whether it is `empty` (bare metal floor) or full of folders. */
export const FileDrawer: React.FC<T & { label?: string; label2?: string; open?: number; empty?: boolean }> = ({ label = "", label2 = "1924", open = 0, empty = true, ...t }) => (
  <G {...t}>
    <Box size={[0.9, 1.4, 0.7]} color="#7b8794" position={[0, 0.7, 0]} r={0.03} />
    {open > 0.01 ? (
      <mesh position={[0, 0.75, 0.352]} material={toon("#2b3038")}>
        <planeGeometry args={[0.78, 0.36]} />
      </mesh>
    ) : null}
    <group position={[0, 0.3, 0.36]}>
      <Box size={[0.8, 0.38, 0.04]} color="#8e9aa8" r={0.02} />
      <Board w={0.44} h={0.13} text={label2} bg="#f4efe2" fg="#1b1b1f" position={[0, 0.06, 0.03]} />
    </group>
    <group position={[0, 0.75, 0.36 + open * 0.5]}>
      <Box size={[0.8, 0.38, 0.04]} color="#8e9aa8" r={0.02} />
      <Board w={0.44} h={0.13} text={label} bg="#f4efe2" fg="#1b1b1f" position={[0, 0.06, 0.03]} />
      {open > 0.01 ? (
        <>
          <Box size={[0.74, 0.03, 0.56]} color="#6d7783" position={[0, -0.155, -0.3]} r={0.005} />
          {[-1, 1].map((s) => (
            <Box key={s} size={[0.03, 0.28, 0.56]} color="#8e9aa8" position={[s * 0.355, -0.03, -0.3]} r={0.005} />
          ))}
          <Box size={[0.74, 0.28, 0.03]} color="#8e9aa8" position={[0, -0.03, -0.575]} r={0.005} />
          {!empty
            ? [0, 1, 2, 3, 4].map((i) => <Box key={i} size={[0.66, 0.24, 0.02]} color={i % 2 ? "#e8d9a8" : "#d9c48a"} position={[0, -0.02, -0.08 - i * 0.1]} r={0.004} />)
            : null}
        </>
      ) : null}
    </group>
  </G>
);

export const Ship: React.FC<T & { sign?: string; color?: string }> = ({ sign, color = "#1f2a44", ...t }) => (
  <G {...t}>
    <Box size={[9, 1.8, 2.4]} color={color} position={[0, 0.9, 0]} r={0.3} />
    <Box size={[9.2, 0.25, 2.5]} color="#c0392b" position={[0, 0.2, 0]} r={0.08} />
    <Box size={[5, 1.2, 2]} color="#f4efe6" position={[0.5, 2.3, 0]} r={0.12} />
    {[-1, 0.6, 2.2].map((x, i) => (
      // seated on the cabin roof (the cabin top is at y 2.9)
      <group key={i} position={[x, 2.88, 0]}>
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

/** Coffee cup on a saucer: handle on the +x side, dark coffee showing at the rim. */
export const Cup: React.FC<T & { color?: string; coffee?: string | null; handle?: boolean }> = ({ color = "#ffffff", coffee = "#5a3220", handle = true, ...t }) => (
  <G {...t}>
    <Cyl r={0.1} h={0.012} color={color} />
    <Cyl r={0.048} rTop={0.06} h={0.08} color={color} position={[0, 0.012, 0]} />
    {coffee ? (
      <mesh position={[0, 0.087, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(coffee)}>
        <circleGeometry args={[0.052, 20]} />
      </mesh>
    ) : null}
    {handle ? (
      <mesh position={[0.063, 0.055, 0]} material={toon(color)} castShadow>
        <torusGeometry args={[0.022, 0.0075, 8, 18]} />
      </mesh>
    ) : null}
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

/** Railway track along x: ballast bed, sleepers and two rails (rail tops at y 0.25; put a Train at y 0.25). */
export const Rails: React.FC<T & { len?: number; gauge?: number }> = ({ len = 40, gauge = 1.56, ...t }) => (
  <G {...t}>
    <Box size={[len, 0.1, gauge + 1.4]} color="#8f8275" position={[0, 0.05, 0]} r={0.02} />
    {Array.from({ length: Math.floor(len / 0.62) }).map((_, i) => (
      <Box key={i} size={[0.2, 0.06, gauge + 0.6]} color="#5b4334" position={[-len / 2 + 0.31 + i * 0.62, 0.13, 0]} r={0.01} />
    ))}
    {[-1, 1].map((s) => (
      <Box key={s} size={[len, 0.09, 0.07]} color="#9aa0a8" position={[0, 0.205, (s * gauge) / 2]} r={0.01} />
    ))}
  </G>
);

/** Passenger carriage (length along x, side windows face +z). The `open` window is a real hole into a lit interior,
 *  so a character standing inside (z ~ 0.25, card y ~ 0.3) shows head, shoulders and raised hands through it.
 *  `windows`: [x centre, width] of each window in the row y winY[0]..winY[1]. `skirt` closes the space under the
 *  floor (hides the legs of a passenger card standing inside). */
export const Carriage: React.FC<T & { color?: string; len?: number; h?: number; windows?: [number, number][]; open?: number; winY?: [number, number]; sign?: string; signW?: number; signTop?: boolean; interior?: string; skirt?: boolean }> = ({
  color = "#f2c14e",
  len = 3.8,
  windows = [
    [-1.3, 0.62],
    [0.05, 1.22],
    [1.35, 0.62],
  ],
  open = 1,
  winY = [1.22, 2.16],
  sign,
  signW = 2.2,
  signTop = false,
  interior = "#ecd9b0",
  h = 2.34,
  skirt = false,
  ...t
}) => {
  const y0 = 0.62;
  const y1 = h;
  const d = 1.6;
  const th = 0.08;
  const zf = d / 2 - th / 2;
  const wins = [...windows].sort((a, b) => a[0] - b[0]);
  const posts: [number, number][] = [];
  let xa = -len / 2;
  for (const [x, w] of wins) {
    posts.push([xa, x - w / 2]);
    xa = x + w / 2;
  }
  posts.push([xa, len / 2]);
  const ym = (winY[0] + winY[1]) / 2;
  const wh = winY[1] - winY[0];
  return (
    <G {...t}>
      <Box size={[len, winY[0] - y0, th]} color={color} position={[0, (y0 + winY[0]) / 2, zf]} r={0.03} />
      <Box size={[len, y1 - winY[1], th]} color={color} position={[0, (winY[1] + y1) / 2, zf]} r={0.03} />
      {posts.map(([a, b], i) => (b - a > 0.01 ? <Box key={i} size={[b - a, wh, th]} color={color} position={[(a + b) / 2, ym, zf]} r={0.02} /> : null))}
      {wins.map(([x, w], i) =>
        i === open ? null : (
          <mesh key={i} position={[x, ym, zf - 0.01]} material={unlit("#bfe3ff", null, 1)}>
            <planeGeometry args={[w, wh]} />
          </mesh>
        ),
      )}
      <Box size={[len, y1 - y0, th]} color={interior} position={[0, (y0 + y1) / 2, -zf]} r={0.02} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[th, y1 - y0, d]} color={color} position={[s * (len / 2 - th / 2), (y0 + y1) / 2, 0]} r={0.02} />
      ))}
      <Box size={[len, th, d]} color="#7a5a3a" position={[0, y0 + th / 2, 0]} r={0.01} />
      <Box size={[len + 0.24, 0.16, d + 0.2]} color="#2b2f3a" position={[0, y1 + 0.08, 0]} r={0.05} />
      <Box size={[len - 0.5, 0.3, d - 0.3]} color="#2b2f3a" position={[0, 0.5, 0]} r={0.03} />
      {skirt ? <Box size={[len - 0.3, y0 - 0.06, d - 0.12]} color="#2b2f3a" position={[0, (y0 + 0.06) / 2, 0]} r={0.03} /> : null}
      {[-1, 1].map((s) =>
        [0.78, -0.78].map((z) => (
          <mesh key={`${s}${z}`} position={[s * (len / 2 - 0.7), 0.36, z]} rotation={[Math.PI / 2, 0, 0]} material={toon("#25262b")} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.12, 18]} />
          </mesh>
        )),
      )}
      {sign ? (
        <Board w={signW} h={signTop ? Math.min(0.42, (y1 - winY[1]) * 0.8) : 0.42} text={sign} bg="#1b1b22" fg="#ffcc33" position={[0, signTop ? (winY[1] + y1) / 2 : (y0 + winY[0]) / 2, d / 2 + 0.005]} />
      ) : null}
    </G>
  );
};

/** A framed oil portrait of a StickWorld character (bust crop, painted backdrop), drawn with the same Canvas2D cast
 *  so it is on-model; `pose` / `face` swap like a Stick's (pass the current key). Faces +z, centre at the group.
 *  `plaque` sits on the top rail of the frame. */
export const StickPortrait: React.FC<T & { spec: StickSpec; pose?: string | Pose; face?: string | Face; w?: number; h?: number; crop?: [number, number, number, number]; bg?: [string, string]; frame?: string; plaque?: string; blink?: number }> = ({
  spec,
  pose = "idle",
  face = "smug",
  w = 1.0,
  h = 1.25,
  crop = [70, 40, 460, 575],
  bg = ["#4f7a68", "#203a33"],
  frame = "#c9a227",
  plaque,
  blink = 0,
  ...t
}) => {
  const { canvas, fig, tex, mat } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = Math.round((768 * h) / w);
    const fig = document.createElement("canvas");
    fig.width = 1200;
    fig.height = 2000;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const mat = unlit("#ffffff", tex, 0.97);
    return { canvas, fig, tex, mat };
  }, [w, h]);
  const P = typeof pose === "string" ? POSES[pose] ?? POSES.idle : pose;
  const F = typeof face === "string" ? FACES[face] ?? FACES.neutral : face;
  const key = JSON.stringify([P, F, blink, spec, bg, crop]);
  useMemo(() => {
    const g = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const grd = g.createRadialGradient(W * 0.48, H * 0.36, W * 0.06, W * 0.5, H * 0.5, W * 0.9);
    grd.addColorStop(0, bg[0]);
    grd.addColorStop(1, bg[1]);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    const fg = fig.getContext("2d")!;
    drawStick(fg, fig.width, fig.height, spec, P, F, { blink });
    const k = fig.width / 600;
    g.drawImage(fig, crop[0] * k, crop[1] * k, crop[2] * k, crop[3] * k, 0, 0, W, H);
    // painted inner shadow along the frame
    const v = g.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, "rgba(0,0,0,0.18)");
    v.addColorStop(0.08, "rgba(0,0,0,0)");
    v.addColorStop(0.92, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.22)");
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    tex.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, canvas, fig, tex]);
  const fw = w * 0.1;
  return (
    <G {...t}>
      <mesh material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <Box size={[w + 2 * fw, fw, 0.09]} color={frame} position={[0, h / 2 + fw / 2, 0.02]} r={0.025} />
      <Box size={[w + 2 * fw, fw, 0.09]} color={frame} position={[0, -h / 2 - fw / 2, 0.02]} r={0.025} />
      <Box size={[fw, h, 0.09]} color={frame} position={[-w / 2 - fw / 2, 0, 0.02]} r={0.025} />
      <Box size={[fw, h, 0.09]} color={frame} position={[w / 2 + fw / 2, 0, 0.02]} r={0.025} />
      {plaque ? <Board w={w * 0.6} h={w * 0.16} text={plaque} bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" position={[0, h / 2 + fw / 2, 0.075]} /> : null}
    </G>
  );
};

/** Heavy velvet drapes: vertical folds (inked creases) under a gold valance. Back of the folds at z = 0. */
export const Drapes: React.FC<T & { w?: number; h?: number; color?: string; folds?: number; trim?: string }> = ({ w = 1.4, h = 3.2, color = "#8c1f2a", folds = 6, trim = "#d4a017", ...t }) => {
  const dark = new THREE.Color(color).multiplyScalar(0.8).getStyle();
  const fw = w / folds;
  return (
    <G {...t}>
      {Array.from({ length: folds }).map((_, i) => (
        <mesh key={i} position={[-w / 2 + fw * (i + 0.5), h / 2, fw * 0.6]} material={toon(i % 2 ? color : dark)} castShadow receiveShadow>
          <cylinderGeometry args={[fw * 0.6, fw * 0.74, h, 12, 1]} />
        </mesh>
      ))}
      <Box size={[w + 0.3, 0.34, fw * 1.7]} color={trim} position={[0, h - 0.05, fw * 0.7]} r={0.05} />
    </G>
  );
};

/** Soft light pool (lamp / chandelier glow on a wall or table): additive radial gradient, never inked. Faces +z. */
export const LightPool: React.FC<T & { w?: number; h?: number; color?: string; opacity?: number }> = ({ w = 2, h = 2, color = "#ffd59a", opacity = 0.5, ...t }) => {
  const map = canvasTex("lightpool", 256, 256, (g, W, H) => {
    const grd = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.4, "rgba(255,255,255,0.5)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  });
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    [map, color, opacity],
  );
  return (
    <G {...t}>
      <mesh material={mat} layers={NOINK} renderOrder={2}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </G>
  );
};

/** Easel / poster sheet with the tower drawing and a caption line under it (cream paper, ink). */
export const towerSheetTex = (caption = "LA TOUR EIFFEL", fontName = "DM Serif Display") =>
  canvasTex(`towersheet|${caption}|${fontName}`, 1024, 800, (g, W, H) => {
    g.fillStyle = "#fbf7ee";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#1d1418";
    g.lineWidth = 16;
    g.strokeRect(8, 8, W - 16, H - 16);
    drawTowerSketch(g, W * 0.29, 60, W * 0.42, H - 220, "#2a2522", "#fbf7ee");
    g.fillStyle = "#1b1b1f";
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    let size = 96;
    const fam = font(fontName);
    g.font = `400 ${size}px "${fam}", serif`;
    while (g.measureText(caption).width > W - 160 && size > 30) {
      size -= 4;
      g.font = `400 ${size}px "${fam}", serif`;
    }
    g.fillText(caption, W / 2, H - 60);
  });

export { textBoard };
