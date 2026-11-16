// ug-rap channel devices (2D, px at 1080x1920, like core/fx2d): the evidence of an underground rise, drawn
// generically (no platform's trade dress, no real cover art). Use them with StickWorld scenes of ORIGINAL stand-in
// characters; facts on them (aliases, years, play counts) come from research.md rows.
//
//   <TrackCard at={s.hit("uploaded")} x={540} y={600} title="untitled (demo)" artist="stand-in alias" plays={[1200, 2400000]} countFrom={s.hit("blew")} />
//   <YearStamp at={s.hit("2019")} text="2019" />
//   <AliasStack at={s.hit("names")} names={["alias one", "alias two"]} />
//   <TitleCard at={0} kicker="the rise of" title="a bedroom producer" />
import React from "react";
import { AbsoluteFill } from "remotion";
import { useLocalFrame } from "../core/timeline";
import { backOut, clamp, countUp, easeOut, fmtNum, invLerp, kick, rand } from "../core/anim";
import { font } from "../core/fonts";
import { Pos, useLife } from "../core/fx2d";

export const UG = {
  bg: "#0d0b10",
  ink: "#f1edf5",
  dim: "#9a93a6",
  hot: "#ff3b6b",
  violet: "#7b5cff",
  ice: "#38d6ff",
  card: "#17141d",
  line: "#2b2633",
};

/** A procedural cover square: an original, seeded gradient + line sigil (never real cover art). */
export const Cover: React.FC<{ seed?: number; size?: number; hue?: string }> = ({ seed = 3, size = 240, hue = UG.violet }) => {
  const pts = Array.from({ length: 7 }).map((_, i) => [20 + rand(seed, i) * 60, 20 + rand(seed, i + 9) * 60]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", borderRadius: size * 0.06 }}>
      <defs>
        <radialGradient id={`cg${seed}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor={hue} />
          <stop offset="1" stopColor="#0b0a0e" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#cg${seed})`} />
      <path d={d} fill="none" stroke="#f1edf5" strokeWidth="1.6" strokeLinejoin="round" opacity="0.85" />
      <circle cx={pts[0][0]} cy={pts[0][1]} r="2.6" fill="#f1edf5" />
      <path d={`M${pts[3][0]} 8 L${pts[3][0]} 92`} stroke="#f1edf5" strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
};

/** A generic music-upload card: cover, title, alias, a seeded waveform with a playhead, plays counting up. */
export const TrackCard: React.FC<{
  at: number;
  out?: number;
  x?: number;
  y?: number;
  title: string;
  artist: string;
  /** [from, to] plays; counts up from `countFrom` over `countDur` frames */
  plays?: [number, number];
  countFrom?: number;
  countDur?: number;
  seed?: number;
  hue?: string;
  rot?: number;
  scale?: number;
}> = ({ at, out, x = 540, y = 640, title, artist, plays, countFrom, countDur = 36, seed = 5, hue = UG.violet, rot = -2, scale = 1 }) => {
  const L = useLife(at, out, 8);
  if (!L.visible || L.s <= 0) return null;
  const f = L.f;
  const c0 = countFrom ?? at + 8;
  const n = plays ? countUp(f, c0, c0 + countDur, plays[0], plays[1]) : 0;
  const head = clamp(invLerp(at, at + 120, f));
  const bars = 46;
  const sh = plays && f >= c0 + countDur && f < c0 + countDur + 8 ? kick(f, [c0 + countDur], 5, 7) : 0;
  return (
    <Pos x={x} y={y} scale={L.s * scale} rot={rot} dx={sh}>
      <div style={{ width: 860, borderRadius: 34, background: UG.card, border: `3px solid ${UG.line}`, boxShadow: "0 26px 70px rgba(0,0,0,0.55)", padding: 26, fontFamily: font("Inter"), color: UG.ink }}>
        <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
          <Cover seed={seed} size={220} hue={hue} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 46, lineHeight: 1.08, letterSpacing: "-0.01em" }}>{title}</div>
            <div style={{ fontWeight: 600, fontSize: 32, color: UG.dim, marginTop: 8 }}>{artist}</div>
            {plays ? (
              <div style={{ fontWeight: 900, fontSize: 40, color: UG.hot, marginTop: 14 }}>
                ▶ {fmtNum(Math.round(n), { compact: n >= 10000 })} <span style={{ color: UG.dim, fontWeight: 700, fontSize: 28 }}>plays</span>
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, height: 90, marginTop: 22 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const h = 18 + rand(seed, i * 3) * 62 * (0.55 + 0.45 * Math.sin(i * 0.37 + seed));
            const played = i / bars < head;
            return <div key={i} style={{ flex: 1, height: Math.max(10, h), borderRadius: 4, background: played ? UG.hot : UG.line }} />;
          })}
        </div>
      </div>
    </Pos>
  );
};

/** A year / date slam (the bio timeline's chapter marks). */
export const YearStamp: React.FC<{ at: number; out?: number; text: string; x?: number; y?: number; color?: string }> = ({ at, out, text, x = 540, y = 420, color = UG.ink }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 5)) return null;
  const t = invLerp(at, at + 5, f);
  const s = f < at + 5 ? 1.9 - 0.9 * (t * t) : 1;
  const o = out !== undefined && f >= out ? 1 - invLerp(out, out + 5, f) : 1;
  const sh = kick(f, [at + 5], 8, 7);
  return (
    <Pos x={x} y={y} scale={s} dx={sh}>
      <div style={{ fontFamily: font("Grenze Gotisch"), fontWeight: 900, fontSize: 210, lineHeight: 1, color, opacity: clamp(o * (0.4 + t)), textShadow: `0 0 34px ${UG.hot}, 0 8px 0 rgba(0,0,0,0.6)` }}>{text}</div>
    </Pos>
  );
};

/** Stacked "aka" tags: every name an artist went by, popping one by one. */
export const AliasStack: React.FC<{ at: number; out?: number; names: string[]; x?: number; y?: number; gap?: number }> = ({ at, out, names, x = 540, y = 520, gap = 6 }) => {
  const L = useLife(at, out, 6);
  if (!L.visible) return null;
  const f = L.f;
  return (
    <>
      {names.map((nm, i) => {
        const a = at + i * gap;
        if (f < a) return null;
        const p = backOut(invLerp(a, a + 7, f), 2.2);
        return (
          <Pos key={i} x={x + (i % 2 ? 40 : -40)} y={y + i * 118} scale={p * L.s} rot={i % 2 ? 3 : -3}>
            <div style={{ fontFamily: font("Inter"), fontWeight: 900, fontSize: 58, color: UG.bg, background: i === names.length - 1 ? UG.hot : UG.ink, padding: "10px 30px", borderRadius: 16, whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 700, fontSize: 34, opacity: 0.6, marginRight: 14 }}>aka</span>
              {nm}
            </div>
          </Pos>
        );
      })}
    </>
  );
};

/** Gothic title card for an episode's open or a chapter (Grenze Gotisch; readable, not a tattoo script). */
export const TitleCard: React.FC<{ at: number; out?: number; kicker?: string; title: string; y?: number }> = ({ at, out, kicker, title, y = 520 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const a = easeOut(invLerp(at, at + 10, f));
  const o = out !== undefined && f >= out ? 1 - invLerp(out, out + 6, f) : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", opacity: o }}>
        {kicker ? <div style={{ fontFamily: font("Inter"), fontWeight: 800, fontSize: 40, letterSpacing: "0.3em", textTransform: "uppercase", color: UG.dim, opacity: a }}>{kicker}</div> : null}
        <div style={{ fontFamily: font("Grenze Gotisch"), fontWeight: 900, fontSize: 130, lineHeight: 1, color: UG.ink, transform: `translateY(${(1 - a) * 50}px)`, opacity: a, textShadow: `0 0 40px ${UG.violet}, 0 10px 0 rgba(0,0,0,0.6)`, padding: "0 60px" }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};
