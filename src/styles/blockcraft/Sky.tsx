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
export const PixelToast: React.FC<{ at: number; out?: number; title: string; sub: string; icon?: string; x?: number; y?: number; scale?: number }> = ({ at, out, title, sub, icon = "★", x = 540, y = 360, scale = 1 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const sIn = backOut(invLerp(at, at + 8, f), 1.8);
  const sOut = out !== undefined && f > out ? 1 - easeIn(invLerp(out, out + 6, f)) : 1;
  const fam = font("Silkscreen");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y - (1 - sIn) * 120} s={sOut * scale}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, whiteSpace: "nowrap", background: "#1e1b24", border: "8px solid #f2f2f2", boxShadow: "0 0 0 8px #1e1b24, 10px 12px 0 8px rgba(0,0,0,.4)", padding: "18px 30px 18px 18px", fontFamily: fam, imageRendering: "pixelated" }}>
          <div style={{ width: 84, height: 84, background: "#6b5a3a", border: "6px solid #c9a26a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#ffe36b" }}>{icon}</div>
          <div>
            <div style={{ color: "#ffe36b", fontSize: 44, fontWeight: 400 }}>{title}</div>
            <div style={{ color: "#ffffff", fontSize: 38, fontWeight: 400 }}>{sub}</div>
          </div>
        </div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Pixel label (hard drop shadow, no anti-aliased outline). A "\n" in `text` breaks the line (centred). */
export const PixelTag: React.FC<{ at: number; out?: number; text: string; x: number; y: number; color?: string; bg?: string; size?: number }> = ({ at, out, text, x, y, color = "#ffffff", bg = "rgba(20,18,26,0.82)", size = 60 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0) * (out !== undefined && f > out ? 1 - invLerp(out, out + 5, f) : 1);
  const multi = text.includes("\n");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y} s={s}>
        <div style={{ fontFamily: font("Silkscreen"), fontWeight: 400, fontSize: size, color, background: bg, padding: "12px 26px 10px", textShadow: `${size * 0.08}px ${size * 0.08}px 0 #2a2a2a`, border: "6px solid #f2f2f2", whiteSpace: multi ? "pre" : "nowrap", ...(multi ? { textAlign: "center" as const, lineHeight: 1.08 } : {}) }}>{text}</div>
      </Pix>
    </AbsoluteFill>
  );
};

/** On-screen hook title: 1-3 big lines in the chunky display face with a hard pixel outline and drop shadow, no
 *  panel. `at` <= -6 shows it at full size on frame 0. It never moves after landing (titles that keep moving are on
 *  the ban list); it shrinks out over 5 f after `out`. */
export const PixelTitle: React.FC<{ at: number; out?: number; lines: string[]; x?: number; y: number; size?: number; color?: string; outline?: string; fontName?: string; lineHeight?: number }> = ({
  at,
  out,
  lines,
  x = 540,
  y,
  size = 128,
  color = "#ffe14d",
  outline = "#141018",
  fontName = "Lilita One",
  lineHeight = 1.0,
}) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0) * (out !== undefined && f > out ? 1 - easeIn(invLerp(out, out + 5, f)) : 1);
  const w = Math.round(size * 0.075);
  const ring = [
    [w, 0], [-w, 0], [0, w], [0, -w], [w, w], [-w, w], [w, -w], [-w, -w],
    [Math.round(w * 0.6), w], [-Math.round(w * 0.6), w], [w, -Math.round(w * 0.6)], [-w, Math.round(w * 0.6)],
  ]
    .map(([dx, dy]) => `${dx}px ${dy}px 0 ${outline}`)
    .join(", ");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y} s={s}>
        <div style={{ fontFamily: font(fontName), fontWeight: 400, fontSize: size, lineHeight, color, textAlign: "center", whiteSpace: "pre", letterSpacing: 1, textShadow: `${ring}, ${w * 1.6}px ${w * 1.9}px 0 ${outline}` }}>
          {lines.join("\n")}
        </div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Original "record" stamp: a tilted pixel badge (a big first line over a smaller second line) that slams in from
 *  2.3x scale over 5 f, kicks once and then sits still. */
export const PixelStamp: React.FC<{ at: number; out?: number; top: string; bottom: string; x: number; y: number; rot?: number; size?: number; color?: string; bg?: string }> = ({
  at,
  out,
  top,
  bottom,
  x,
  y,
  rot = -6,
  size = 72,
  color = "#ffe14d",
  bg = "rgba(22,18,30,0.92)",
}) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const t = invLerp(at, at + 5, f);
  const slam = f < at + 5 ? 2.3 - 1.3 * t * t : 1;
  const d = f - (at + 5);
  const shake = d >= 0 && d <= 7 ? (1 - d / 7) * (d % 2 === 0 ? 1 : -1) * 10 : 0;
  const o = out !== undefined && f > out ? 1 - easeIn(invLerp(out, out + 5, f)) : 1;
  const fam = font("Silkscreen");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x + shake} y={y - shake * 0.5} s={slam * o}>
        <div
          style={{
            transform: `rotate(${rot}deg)`,
            opacity: Math.min(1, 0.35 + t),
            background: bg,
            border: `10px solid ${color}`,
            boxShadow: `0 0 0 6px #141018, 12px 14px 0 6px rgba(0,0,0,.45)`,
            padding: "14px 34px 18px",
            fontFamily: fam,
            fontWeight: 400,
            color,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: 1.0,
            textShadow: `${Math.round(size * 0.08)}px ${Math.round(size * 0.08)}px 0 #2a2a2a`,
          }}
        >
          <div style={{ fontSize: size * 1.6 }}>{top}</div>
          <div style={{ fontSize: size, color: "#ffffff", marginTop: 6 }}>{bottom}</div>
        </div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Pixel depth gauge (e.g. "Y: -12,262 m") that counts with the camera. */
export const PixelGauge: React.FC<{ at: number; out?: number; label: string; value: number; x?: number; y?: number; unit?: string; decimals?: number; size?: number; color?: string }> = ({ at, out, label, value, x = 540, y = 330, unit = "", decimals = 0, size = 64, color = "#9ee05a" }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0) * (out !== undefined && f > out ? 1 - invLerp(out, out + 5, f) : 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x} y={y} s={s}>
        <div style={{ fontFamily: font("Silkscreen"), fontWeight: 400, fontSize: size, color: "#ffffff", background: "rgba(20,18,26,0.85)", border: "6px solid #f2f2f2", padding: "10px 28px 8px", textShadow: `${Math.round(size * 0.08)}px ${Math.round(size * 0.08)}px 0 #2a2a2a`, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color }}>{label}</span> {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
          {unit}
        </div>
      </Pix>
    </AbsoluteFill>
  );
};

/** Pixel thermometer: a segmented tube that fills (0..1) from green to red, with the reading beside it. `readout`
 *  puts the reading beside the bottom of the tube (default) or beside its hot top end (leaves the side of the lower
 *  tube free, e.g. for an "expected" mark half way up). */
export const PixelThermo: React.FC<{ at: number; out?: number; x?: number; y?: number; fill: number; value: number; unit?: string; unitSize?: number; readout?: "bottom" | "top" }> = ({ at, out, x = 800, y = 560, fill, value, unit = "°C", unitSize = 64, readout = "bottom" }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const s = backOut(invLerp(at, at + 6, f), 2.0) * (out !== undefined && f > out ? 1 - invLerp(out, out + 5, f) : 1);
  const n = 10;
  const lit = Math.round(Math.max(0, Math.min(1, fill)) * n);
  const hot = fill > 0.8;
  const shake = hot ? Math.sin(f * 2.4) * 4 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Pix x={x + shake} y={y} s={s}>
        <div style={{ display: "flex", alignItems: readout === "top" ? "flex-start" : "flex-end", gap: 22 }}>
          <div style={{ background: "#1e1b24", border: "8px solid #f2f2f2", boxShadow: "8px 10px 0 rgba(0,0,0,.4)", padding: 10, display: "flex", flexDirection: "column-reverse", gap: 6 }}>
            {Array.from({ length: n }).map((_, i) => {
              const on = i < lit;
              const c = i < 4 ? "#7bd84f" : i < 7 ? "#ffcf3a" : "#ff4b3a";
              return <div key={i} style={{ width: 64, height: 30, background: on ? c : "#3a3644" }} />;
            })}
          </div>
          <div style={{ fontFamily: font("Silkscreen"), fontWeight: 400, fontSize: 100, lineHeight: 1, color: hot ? "#ff6b5a" : "#ffffff", textShadow: "8px 8px 0 #2a2a2a", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", background: "rgba(20,18,26,0.85)", border: "6px solid #f2f2f2", padding: "10px 22px 14px" }}>
            {Math.round(value)}
            <span style={{ fontSize: unitSize }}>{unit}</span>
          </div>
        </div>
      </Pix>
    </AbsoluteFill>
  );
};
