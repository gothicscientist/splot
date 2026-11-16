// Screen-space FX that sit above any style's picture and below the captions: stamps, tags, counters, bubbles,
// checks/crosses, comic bursts, arrows, highlight rings. Coordinates are px at 1080x1920 (scaled to the output).
// Every element pops on its frame with an overshoot and leaves with a short ease-in (exits ~40% shorter).
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useLocalFrame } from "./timeline";
import { backOut, clamp, countUp, easeIn, fmtNum, invLerp, kick } from "./anim";
import { font } from "./fonts";

type Base = { at: number; out?: number; x: number; y: number; rot?: number; scale?: number };

export function useLife(at: number, out?: number, inDur = 7, outDur = 5) {
  const f = useLocalFrame();
  if (f < at) return { f, s: 0, visible: false, since: f - at };
  const sIn = backOut(invLerp(at, at + inDur, f), 2.3);
  const sOut = out !== undefined && f >= out ? 1 - easeIn(invLerp(out, out + outDur, f)) : 1;
  return { f, s: Math.max(0, sIn * sOut), visible: out === undefined || f < out + outDur, since: f - at };
}

export const Pos: React.FC<{ x: number; y: number; rot?: number; scale: number; children: React.ReactNode; dx?: number; dy?: number }> = ({ x, y, rot = 0, scale, children, dx = 0, dy = 0 }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return (
    <div style={{ position: "absolute", left: x * k + dx, top: y * k + dy, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale * k})`, transformOrigin: "center" }}>
      {children}
    </div>
  );
};

/** Rubber-stamp slam: big bordered word, starts huge, lands with a kick. */
export const Stamp: React.FC<Base & { text: string; color?: string; size?: number }> = ({ at, out, x, y, rot = -12, scale = 1, text, color = "#e0262f", size = 150 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const t = invLerp(at, at + 5, f);
  const s = f < at + 5 ? 2.4 - 1.4 * (t * t) : 1;
  const o = out !== undefined && f >= out ? 1 - invLerp(out, out + 5, f) : 1;
  const sh = kick(f, [at + 5], 9, 7);
  return (
    <Pos x={x} y={y} rot={rot} scale={s * scale} dx={sh} dy={-sh * 0.6}>
      <div
        style={{
          fontFamily: font("Anton"),
          fontSize: size,
          lineHeight: 1,
          color,
          border: `${size * 0.09}px solid ${color}`,
          borderRadius: size * 0.12,
          padding: `${size * 0.08}px ${size * 0.22}px`,
          letterSpacing: size * 0.04,
          opacity: clamp(o * (0.35 + t)),
          background: "rgba(255,255,255,0.06)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          boxShadow: `0 0 0 ${size * 0.03}px rgba(255,255,255,0.5) inset`,
        }}
      >
        {text}
      </div>
    </Pos>
  );
};

/** Pill label that pops in (callouts, names, prices). */
export const Tag: React.FC<Base & { text: string; bg?: string; fg?: string; size?: number; fontName?: string; border?: string }> = ({
  at,
  out,
  x,
  y,
  rot = 0,
  scale = 1,
  text,
  bg = "#FFD43B",
  fg = "#141414",
  size = 64,
  fontName = "Montserrat",
  border = "#141414",
}) => {
  const L = useLife(at, out);
  if (!L.visible || L.s <= 0) return null;
  return (
    <Pos x={x} y={y} rot={rot} scale={L.s * scale}>
      <div style={{ fontFamily: font(fontName), fontWeight: 900, fontSize: size, color: fg, background: bg, padding: `${size * 0.16}px ${size * 0.42}px`, borderRadius: size * 0.36, border: `${Math.max(3, size * 0.08)}px solid ${border}`, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,0.25)" }}>
        {text}
      </div>
    </Pos>
  );
};

/** A number that spins up from `from` to `to` between at and at+dur (with a label). */
export const Counter: React.FC<Base & { from?: number; to: number; dur?: number; prefix?: string; suffix?: string; label?: string; size?: number; bg?: string; fg?: string; compact?: boolean }> = ({
  at,
  out,
  x,
  y,
  rot = 0,
  scale = 1,
  from = 0,
  to,
  dur = 24,
  prefix = "",
  suffix = "",
  label,
  size = 110,
  bg = "#141414",
  fg = "#4dff9a",
  compact = false,
}) => {
  const L = useLife(at, out);
  if (!L.visible || L.s <= 0) return null;
  const v = countUp(L.f, at, at + dur, from, to);
  return (
    <Pos x={x} y={y} rot={rot} scale={L.s * scale}>
      <div style={{ background: bg, borderRadius: size * 0.22, padding: `${size * 0.18}px ${size * 0.36}px`, border: `${size * 0.06}px solid #FFD43B`, textAlign: "center", boxShadow: "0 12px 0 rgba(0,0,0,0.3)" }}>
        {label ? <div style={{ fontFamily: font("Montserrat"), fontWeight: 800, fontSize: size * 0.28, color: "#ffffff", opacity: 0.85, letterSpacing: 2 }}>{label}</div> : null}
        <div style={{ fontFamily: font("Montserrat"), fontWeight: 900, fontSize: size, color: fg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", lineHeight: 1.05 }}>
          {fmtNum(v, { prefix, suffix, compact })}
        </div>
      </div>
    </Pos>
  );
};

/** Speech / thought bubble. */
export const Bubble: React.FC<Base & { text: string; kind?: "speech" | "thought"; tail?: "left" | "right" | "down"; size?: number; width?: number }> = ({
  at,
  out,
  x,
  y,
  rot = 0,
  scale = 1,
  text,
  kind = "speech",
  tail = "down",
  size = 54,
  width = 520,
}) => {
  const L = useLife(at, out);
  if (!L.visible || L.s <= 0) return null;
  return (
    <Pos x={x} y={y} rot={rot} scale={L.s * scale}>
      <div style={{ position: "relative", width, background: "#ffffff", border: "8px solid #1d1418", borderRadius: kind === "thought" ? 120 : 46, padding: "26px 34px", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: size, color: "#1d1418", textAlign: "center", lineHeight: 1.15 }}>
        {text}
        {kind === "speech" ? (
          <div style={{ position: "absolute", width: 0, height: 0, left: tail === "left" ? 60 : tail === "right" ? width - 110 : width / 2 - 30, bottom: -44, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: "46px solid #1d1418" }} />
        ) : (
          <>
            <div style={{ position: "absolute", width: 44, height: 44, borderRadius: 22, background: "#fff", border: "7px solid #1d1418", left: width / 2 - 70, bottom: -58 }} />
            <div style={{ position: "absolute", width: 26, height: 26, borderRadius: 13, background: "#fff", border: "6px solid #1d1418", left: width / 2 - 110, bottom: -100 }} />
          </>
        )}
      </div>
    </Pos>
  );
};

/** Green check or red cross in a disc. */
export const Mark: React.FC<Base & { ok?: boolean; size?: number }> = ({ at, out, x, y, rot = 0, scale = 1, ok = true, size = 200 }) => {
  const L = useLife(at, out, 8);
  if (!L.visible || L.s <= 0) return null;
  const c = ok ? "#2fbf5b" : "#e0262f";
  const draw = clamp(invLerp(at + 2, at + 9, L.f));
  return (
    <Pos x={x} y={y} rot={rot} scale={L.s * scale}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill={c} stroke="#1d1418" strokeWidth="6" />
        {ok ? (
          <path d="M28 52 L44 67 L73 35" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - draw)} />
        ) : (
          <path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 * (1 - draw)} />
        )}
      </svg>
    </Pos>
  );
};

/** Comic starburst behind a short word (POW, BOOM, $$$). */
export const Burst: React.FC<Base & { text: string; color?: string; size?: number }> = ({ at, out, x, y, rot = -6, scale = 1, text, color = "#FFD43B", size = 420 }) => {
  const L = useLife(at, out, 6);
  if (!L.visible || L.s <= 0) return null;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 30 : 48;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <Pos x={x} y={y} rot={rot + L.since * 0.4} scale={L.s * scale}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <polygon points={pts} fill={color} stroke="#1d1418" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font("Bangers"), fontSize: size * 0.24, color: "#1d1418", letterSpacing: 3 }}>{text}</div>
      </div>
    </Pos>
  );
};

/** Hand-drawn arrow from (x,y) toward (x2,y2), drawn on over 8 frames. */
export const Arrow: React.FC<{ at: number; out?: number; x: number; y: number; x2: number; y2: number; color?: string; width?: number }> = ({ at, out, x, y, x2, y2, color = "#FFD43B", width = 16 }) => {
  const f = useLocalFrame();
  const { width: W, height: H } = useVideoConfig();
  if (f < at || (out !== undefined && f > out)) return null;
  const k = W / 1080;
  const d = clamp(invLerp(at, at + 8, f));
  const len = Math.hypot(x2 - x, y2 - y);
  const ang = Math.atan2(y2 - y, x2 - x);
  const hx = x2 - Math.cos(ang - 0.5) * 50;
  const hy = y2 - Math.sin(ang - 0.5) * 50;
  const hx2 = x2 - Math.cos(ang + 0.5) * 50;
  const hy2 = y2 - Math.sin(ang + 0.5) * 50;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W / k} ${H / k}`}>
        <path d={`M${x} ${y} Q ${(x + x2) / 2 + 40} ${(y + y2) / 2 - 60} ${x2} ${y2}`} fill="none" stroke="#1d1418" strokeWidth={width + 10} strokeLinecap="round" strokeDasharray={len * 1.2} strokeDashoffset={len * 1.2 * (1 - d)} />
        <path d={`M${x} ${y} Q ${(x + x2) / 2 + 40} ${(y + y2) / 2 - 60} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len * 1.2} strokeDashoffset={len * 1.2 * (1 - d)} />
        {d >= 1 ? <path d={`M${hx} ${hy} L${x2} ${y2} L${hx2} ${hy2}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Full-frame colour flash (alarm wash, camera flash), 0..1 envelope over `dur` frames. */
export const FlashFX: React.FC<{ at: number; dur?: number; color?: string; max?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ at, dur = 8, color = "#ffffff", max = 0.85, blend = "normal" }) => {
  const f = useLocalFrame();
  if (f < at || f > at + dur) return null;
  const o = max * (1 - invLerp(at, at + dur, f));
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: blend }} />;
};

/** Container for FX above a 3D stage. */
export const FXLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ pointerEvents: "none" }}>{children}</AbsoluteFill>;
