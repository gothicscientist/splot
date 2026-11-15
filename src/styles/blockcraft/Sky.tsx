// Blockcraft sky: square sun / moon, a flat layer of blocky clouds drifting slowly, and pixel UI overlays
// (an achievement-style toast, pixel tags, hearts) in an original design.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { backOut, easeIn, invLerp, rand } from "../../core/anim";
import { font } from "../../core/fonts";
import type { Vec3 } from "../../core/types";

export const SquareSun: React.FC<{ position: Vec3; size?: number; moon?: boolean }> = ({ position, size = 14, moon = false }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: moon ? new THREE.Color(1.6, 1.6, 1.7) : new THREE.Color(3.2, 2.9, 1.6), fog: false }), [moon]);
  return (
    <mesh position={position} material={mat} layers={3}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};

/** Blocky cloud layer at height y: random rectangles of cloud cells, drifting along +x. */
export const CloudLayer: React.FC<{ y?: number; extent?: number; cell?: number; seed?: number; speed?: number; night?: boolean }> = ({ y = 38, extent = 160, cell = 6, seed = 2, speed = 0.02, night = false }) => {
  const f = useLocalFrame();
  const geo = useMemo(() => {
    const boxes: THREE.BoxGeometry[] = [];
    const n = Math.floor(extent / cell);
    for (let i = -n; i < n; i++)
      for (let j = -n; j < n; j++) {
        const v = Math.sin(i * 0.35 + seed) + Math.cos(j * 0.27 + seed * 1.7) + (rand(seed, i * 977 + j) - 0.5) * 0.9;
        if (v > 1.05) {
          const b = new THREE.BoxGeometry(cell, cell * 0.33, cell);
          b.translate(i * cell, 0, j * cell);
          boxes.push(b);
        }
      }
    const pos: number[] = [];
    for (const b of boxes) pos.push(...(b.toNonIndexed().attributes.position.array as Float32Array));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [extent, cell, seed]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: night ? "#7b86a8" : "#ffffff", transparent: true, opacity: 0.82, depthWrite: false, fog: false }), [night]);
  return <mesh geometry={geo} material={mat} position={[f * speed, y, 0]} layers={3} />;
};

const Pix: React.FC<{ x: number; y: number; children: React.ReactNode; s: number }> = ({ x, y, children, s }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return <div style={{ position: "absolute", left: x * k, top: y * k, transform: `translate(-50%, -50%) scale(${s * k})` }}>{children}</div>;
};

/** Original "goal reached" toast: dark panel with a pixel border, an item icon square, title + subtitle. Slides in. */
export const PixelToast: React.FC<{ at: number; out?: number; title: string; sub: string; icon?: string; x?: number; y?: number }> = ({ at, out, title, sub, icon = "★", x = 540, y = 360 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const sIn = backOut(invLerp(at, at + 8, f), 1.8);
  const sOut = out !== undefined && f > out ? 1 - easeIn(invLerp(out, out + 6, f)) : 1;
  const fam = font("Pixelify Sans");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y - (1 - sIn) * 120} s={sOut}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, background: "#1e1b24", border: "8px solid #f2f2f2", boxShadow: "0 0 0 8px #1e1b24, 10px 12px 0 8px rgba(0,0,0,.4)", padding: "18px 30px 18px 18px", fontFamily: fam, imageRendering: "pixelated" }}>
          <div style={{ width: 84, height: 84, background: "#6b5a3a", border: "6px solid #c9a26a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#ffe36b" }}>{icon}</div>
          <div>
            <div style={{ color: "#ffe36b", fontSize: 44, fontWeight: 700, letterSpacing: 2 }}>{title}</div>
            <div style={{ color: "#ffffff", fontSize: 38, fontWeight: 500 }}>{sub}</div>
          </div>
        </div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Pixel label (hard drop shadow, no anti-aliased outline). */
export const PixelTag: React.FC<{ at: number; out?: number; text: string; x: number; y: number; color?: string; bg?: string; size?: number }> = ({ at, out, text, x, y, color = "#ffffff", bg = "rgba(20,18,26,0.82)", size = 60 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0) * (out !== undefined && f > out ? 1 - invLerp(out, out + 5, f) : 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y} s={s}>
        <div style={{ fontFamily: font("Pixelify Sans"), fontWeight: 700, fontSize: size, color, background: bg, padding: "10px 26px", textShadow: `${size * 0.08}px ${size * 0.08}px 0 #2a2a2a`, border: "6px solid #f2f2f2", whiteSpace: "nowrap", letterSpacing: 2 }}>{text}</div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Pixel depth gauge (e.g. "Y: -12,262 m") that counts with the camera. */
export const PixelGauge: React.FC<{ at: number; label: string; value: number; x?: number; y?: number; unit?: string }> = ({ at, label, value, x = 540, y = 330, unit = "" }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y} s={s}>
        <div style={{ fontFamily: font("Pixelify Sans"), fontWeight: 700, fontSize: 64, color: "#ffffff", background: "rgba(20,18,26,0.85)", border: "6px solid #f2f2f2", padding: "8px 28px", textShadow: "5px 5px 0 #2a2a2a", whiteSpace: "nowrap" }}>
          <span style={{ color: "#9ee05a" }}>{label}</span> {Math.round(value).toLocaleString("en-US")}
          {unit}
        </div>
      </Pix>
    </AbsoluteFill>
  );
};
