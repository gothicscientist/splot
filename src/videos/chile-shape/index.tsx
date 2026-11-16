// scenes: hand-written
// "Why Chile is so long and thin" - Atlas (map & data) x Map mode.
// The map never leaves the screen; every claim is a change of map state keyed to its spoken word via useShot().
// Chile's own shots use the "local" projection (true proportions); the Europe comparison uses an equirectangular
// map, where north-south distances are true everywhere, so the shifted copy of Chile shows its real length.
// One colour grammar for the whole video: gold = length (4,270 km), teal = width (177 km), red = Chile,
// dim blue = Argentina, white = the 1881 line, the Andes = a hachured relief band + snow-capped peaks east of the line,
// the Pacific = a blue glow with moving waves west of the coast.
// Camera grammar: moves are glides (ease-in-out) or ease-out bursts; every hold is a linear creep (push + drift), so
// no key is a dead stop (an ease-in-out key stops the picture, and check.mjs fails 12 frames that barely change).
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { backOut, clamp, countUp, easeInOut, easeOut, invLerp, rand, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import { ATLAS, Ghost, KM_PX, Label, MapHelpers, MapKey, MapView, Pin, Trim, country, countryPart, makeProjection, sharedBorder, viewAt } from "../../styles/atlas/kit";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const RED = ATLAS.focus.red;
const BLUE = ATLAS.focus.blue;
const GOLD = ATLAS.focus.gold;
const TEAL = ATLAS.focus.teal;
const INK = "#0B1220";
const CH: [number, number] = [-71, -36.75]; // Chile's north-south midpoint
// South America without Antarctica (nothing under the captions); AMERICAS adds Central America and the Caribbean
const SA: [number, number, number, number] = [-100, -59, -28, 16];
const AMERICAS: [number, number, number, number] = [-120, -59, -20, 30];
const N_TIP: [number, number] = [-69.48, -17.5];
const S_TIP: [number, number] = [-67.27, -55.98];
const WHOLE = 6.11; // zoom at which Chile is 780 px tall: y 300-1080 with its midpoint at MID (tip above the caption band)
const MID: [number, number] = [430, 690]; // where Chile's midpoint sits in the "whole country" frames (left of centre)
const ANCHOR: [number, number] = [430, 650]; // s02's map anchor
const RULER_LON = -80; // the gold length ruler stands over the Pacific, west of every island
const BAR_LAT = -34.4; // the teal width bar: coast to border is 177.9 km here (Chile's average width: 177 km)
const BAR_W = -72.025;
const BAR_E = -70.087;
const MIDBAR: [number, number] = [(BAR_W + BAR_E) / 2, BAR_LAT];
const CHILE_TRIM: Trim = { bbox: [-77, -60, -60, -16] }; // no Juan Fernandez / Easter Island (lone specks)
const CHILE_CLEAN: Trim = { bbox: [-77, -60, -60, -16], minKm2: 400 }; // + no dust islands at country scale
// lone specks that read as dead pixels: the South Sandwich Islands (South Georgia stays) and the Galapagos
const TRIM_SPECKS: Record<string, Trim> = { "S. Geo. and the Is.": { bbox: [-39, -56, -33, -53] }, Ecuador: { bbox: [-82, -6, -75, 2] } };
const TRIM_FULL = { Chile: CHILE_TRIM, ...TRIM_SPECKS };
const TRIM_CLEAN = { Chile: CHILE_CLEAN, ...TRIM_SPECKS };
const TRIM_EUROPE = { Norway: { bbox: [4, 57, 32, 72] } as Trim, Spain: { largest: true } as Trim }; // mainland only
const SPECK = 80; // km²: smaller islands of the other countries are dropped (dust at these zooms)
const lin = (t: number) => t;
const outCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const chileKey = (f: number, zoom: number, at: [number, number] = MID, ease?: (t: number) => number): MapKey => ({ f, lon: CH[0], lat: CH[1], zoom, at, ease });
const pulseAt = (f: number, at: number | undefined, dur = 12) => (at === undefined || f < at ? 0 : Math.sin(Math.PI * clamp((f - at) / dur)));
const chileD = (h: MapHelpers, t: Trim = CHILE_CLEAN) => h.path(countryPart("Chile", t));
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t))).join(",")})`;
};

// ------------------------------------------------------------------------------------------------ screen overlays
/** A counter (Bebas, tabular, counts up) with a small caption under it: 4,270 KM, 177 KM. */
const Hud: React.FC<{ at: number; out?: number; x: number; y: number; to: number; from?: number; dur?: number; unit?: string; label?: string; color?: string; size?: number }> = ({
  at,
  out,
  x,
  y,
  to,
  from = 0,
  dur = 22,
  unit = "",
  label,
  color = GOLD,
  size = 170,
}) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const s = backOut(invLerp(at, at + 7, f), 2.0) * (out !== undefined && f > out ? 1 - invLerp(out, out + 6, f) : 1);
  const v = Math.round(countUp(f, at, at + dur, from, to));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: font("Bebas Neue"), fontSize: size, lineHeight: 0.95, color, fontVariantNumeric: "tabular-nums", textShadow: `0 6px 0 ${INK}, 0 0 30px rgba(11,18,32,0.9)`, WebkitTextStroke: `3px ${INK}`, paintOrder: "stroke fill" }}>
          {v.toLocaleString("en-US")}
          <span style={{ fontSize: size * (unit.length === 1 ? 0.8 : 0.5), marginLeft: size * 0.06 }}>{unit}</span>
        </div>
        {label ? (
          <div style={{ fontFamily: font("Oswald"), fontWeight: 700, fontSize: Math.max(34, size * 0.24), letterSpacing: 4, color: "#F1F5F9", marginTop: 6, textShadow: `0 3px 0 ${INK}, 0 0 16px rgba(11,18,32,0.95)` }}>{label}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** "24X / LONGER THAN / IT IS WIDE": the hook stat (already showing 24 from frame 0) and the small end callback. */
const Stat24: React.FC<{ at: number; x: number; y: number; size?: number; punch?: number; slam?: boolean }> = ({ at, x, y, size = 250, punch, slam = false }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  const e = invLerp(at, at + 7, f);
  const enter = slam ? 1.14 - 0.14 * backOut(e, 1.4) : backOut(e, 2.0);
  const sc = enter * (1 + 0.09 * pulseAt(f, punch, 8));
  const shadow = `0 ${Math.round(size * 0.026)}px 0 ${INK}, 0 0 ${Math.round(size * 0.14)}px rgba(11,18,32,0.9)`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${sc})`, textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={{ fontFamily: font("Bebas Neue"), fontSize: size, lineHeight: 0.9, color: GOLD, fontVariantNumeric: "tabular-nums", textShadow: shadow, WebkitTextStroke: `${Math.max(2, size * 0.014)}px ${INK}`, paintOrder: "stroke fill" }}>
          24<span style={{ fontSize: size * 0.62, marginLeft: size * 0.04 }}>X</span>
        </div>
        <div style={{ fontFamily: font("Oswald"), fontWeight: 700, fontSize: Math.round(size * 0.23), lineHeight: 1.12, letterSpacing: size * 0.016, color: "#F1F5F9", marginTop: size * 0.03, textShadow: `0 3px 0 ${INK}, 0 0 14px rgba(11,18,32,0.95)` }}>
          LONGER THAN
          <br />
          IT IS WIDE
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Big screen-space word (the question mark, the year): pops once and settles, no idle wobble. */
const Word: React.FC<{ at: number; out?: number; x: number; y: number; text: string; size?: number; color?: string; rot?: number }> = ({ at, out, x, y, text, size = 300, color = GOLD, rot = 0 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const s = backOut(invLerp(at, at + 8, f), 2.4) * (out !== undefined && f > out ? 1 - invLerp(out, out + 6, f) : 1);
  const r = rot + (1 - easeOut(invLerp(at, at + 10, f))) * 9;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${r}deg) scale(${s})`, fontFamily: font("Bebas Neue"), fontSize: size, lineHeight: 1, color, textShadow: `0 8px 0 ${INK}, 0 0 40px rgba(11,18,32,0.9)`, WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Dark-atlas vignette (bible: 15-25 %), keeps the eye on the middle of the frame. */
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 75% 62% at 50% 46%, rgba(3,7,15,0) 62%, rgba(3,7,15,0.34) 100%)" }} />
);

// ------------------------------------------------------------------------------------------------ measuring (map space)
/** The gold length ruler: a dotted extension line runs out from the northern tip (3 f), then the ruler drops from it
 *  down to Cape Horn's latitude, where a second extension line ties it to the southern tip. */
const LenRuler: React.FC<{ h: MapHelpers; at: number; dur?: number; pulse?: number; label?: number; labelOut?: number; ease?: (t: number) => number; o?: number }> = ({
  h,
  at,
  dur = 18,
  pulse,
  label,
  labelOut,
  ease = easeInOut,
  o = 1,
}) => {
  if (h.f < at || o <= 0.01) return null;
  const rx = h.p(RULER_LON, CH[1])[0];
  const n = h.p(...N_TIP);
  const so = h.p(...S_TIP);
  const tk = 18 / h.k;
  const te = outCubic(invLerp(at, at + 1.5, h.f));
  const t = ease(invLerp(at + 1.5, at + 1.5 + dur, h.f));
  const yb = n[1] + (so[1] - n[1]) * t;
  const ex = n[0] + (rx + tk - n[0]) * te;
  const done = t > 0.985;
  const glow = pulseAt(h.f, pulse, 14);
  const lo = label !== undefined ? clamp((h.f - label) / 6) * (labelOut !== undefined ? 1 - clamp((h.f - labelOut) / 6) : 1) : 0;
  return (
    <g opacity={o}>
      <g stroke={GOLD} strokeOpacity={0.85} strokeWidth={3} strokeDasharray="3 7" strokeLinecap="round" fill="none">
        <line x1={n[0]} y1={n[1]} x2={ex} y2={n[1]} vectorEffect="non-scaling-stroke" />
        {done ? <line x1={rx + tk} y1={so[1]} x2={so[0]} y2={so[1]} vectorEffect="non-scaling-stroke" /> : null}
      </g>
      {glow > 0 ? <line x1={rx} y1={n[1]} x2={rx} y2={yb} stroke={GOLD} strokeOpacity={0.4 * glow} strokeWidth={26} strokeLinecap="round" vectorEffect="non-scaling-stroke" /> : null}
      {te > 0.95
        ? [INK, GOLD].map((c, i) => (
            <g key={c} stroke={c} strokeWidth={i === 0 ? 13 : 7} strokeLinecap="round" fill="none">
              {t > 0 ? <line x1={rx} y1={n[1]} x2={rx} y2={yb} vectorEffect="non-scaling-stroke" /> : null}
              <line x1={rx - tk} y1={n[1]} x2={rx + tk} y2={n[1]} vectorEffect="non-scaling-stroke" />
              {done ? <line x1={rx - tk} y1={so[1]} x2={rx + tk} y2={so[1]} vectorEffect="non-scaling-stroke" /> : null}
            </g>
          ))
        : null}
      {lo > 0 ? (
        <g transform={`translate(${rx - 26 / h.k} ${(n[1] + so[1]) / 2}) scale(${1 / h.k})`} opacity={lo}>
          <text textAnchor="end" y={4} fontFamily={font("Bebas Neue")} fontSize={74} fill={GOLD} stroke={INK} strokeWidth={10} paintOrder="stroke" style={{ fontVariantNumeric: "tabular-nums" }}>
            4,270
          </text>
          <text textAnchor="end" y={48} fontFamily={font("Bebas Neue")} fontSize={44} letterSpacing={2} fill={GOLD} stroke={INK} strokeWidth={8} paintOrder="stroke">
            KM
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** The teal width bar across the strip (coast to border at BAR_LAT), growing west to east. */
const WidthBar: React.FC<{ h: MapHelpers; at: number; dur?: number; pulse?: number; tick?: number }> = ({ h, at, dur = 8, pulse, tick = 26 }) => {
  if (h.f < at) return null;
  const t = easeOut(invLerp(at, at + dur, h.f));
  const a = h.p(BAR_W, BAR_LAT);
  const b0 = h.p(BAR_E, BAR_LAT);
  const b: [number, number] = [a[0] + (b0[0] - a[0]) * t, a[1] + (b0[1] - a[1]) * t];
  const ty = tick / h.k;
  const glow = pulseAt(h.f, pulse, 14);
  return (
    <g>
      {glow > 0 ? <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={TEAL} strokeOpacity={0.55 * glow} strokeWidth={30} strokeLinecap="round" vectorEffect="non-scaling-stroke" /> : null}
      {[INK, TEAL].map((c, i) => (
        <g key={c} stroke={c} strokeWidth={i === 0 ? 14 : 8} strokeLinecap="round">
          <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} vectorEffect="non-scaling-stroke" />
          <line x1={a[0]} y1={a[1] - ty} x2={a[0]} y2={a[1] + ty} vectorEffect="non-scaling-stroke" />
          {t > 0.98 ? <line x1={b[0]} y1={b[1] - ty} x2={b[0]} y2={b[1] + ty} vectorEffect="non-scaling-stroke" /> : null}
        </g>
      ))}
    </g>
  );
};

/** 24 width-sized teal squares stacking down beside the ruler: 24 widths = the length. */
const Squares: React.FC<{ h: MapHelpers; at: number; rate?: number }> = ({ h, at, rate = 0.75 }) => {
  if (h.f < at) return null;
  const rx = h.p(RULER_LON, CH[1])[0];
  const y0 = h.p(...N_TIP)[1];
  const y1 = h.p(...S_TIP)[1];
  const side = (y1 - y0) / 24;
  const cx = rx + 14 / h.k + side / 2;
  return (
    <g>
      {Array.from({ length: 24 }, (_, i) => {
        const a = clamp((h.f - at - i * rate) / 4);
        if (a <= 0) return null;
        const sz = (side - 3 / h.k) * (0.55 + 0.45 * backOut(a, 2.2));
        const cy = y0 + side * (i + 0.5);
        return (
          <rect key={i} x={cx - sz / 2} y={cy - sz / 2} width={sz} height={sz} rx={4 / h.k} fill={TEAL} fillOpacity={i % 2 ? 0.5 : 0.88} stroke={INK} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ Chile, Argentina, the line
/** Chile's fill (trimmed: no lone islands). */
const ChileFill: React.FC<{ h: MapHelpers; o: number; trim?: Trim }> = ({ h, o, trim = CHILE_CLEAN }) => <path d={chileD(h, trim)} fill={RED} fillOpacity={o} />;

/** A soft red light around Chile, drawn UNDER the land (MapView `under`): the opaque neighbours hide its eastern half,
 *  so it glows over the Pacific only and never tints the peaks east of the border. */
const ChileGlow: React.FC<{ h: MapHelpers; id: string; o: number }> = ({ h, id, o }) => {
  if (o <= 0.005) return null;
  return (
    <g>
      <defs>
        <filter id={id} x="-60%" y="-8%" width="220%" height="116%">
          <feGaussianBlur stdDeviation={8 / h.k} />
        </filter>
      </defs>
      <path d={chileD(h)} fill="none" stroke={RED} strokeWidth={24} strokeOpacity={0.9 * clamp(o)} strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter={`url(#${id})`} />
    </g>
  );
};

/** Argentina at background strength (dim blue). */
const ArgTint: React.FC<{ h: MapHelpers; o: number }> = ({ h, o }) =>
  o > 0.005 ? <path d={h.path(country("Argentina"))} fill={BLUE} fillOpacity={o} stroke="#7FA9F0" strokeOpacity={Math.min(0.5, o * 1.6)} strokeWidth={1.5} vectorEffect="non-scaling-stroke" /> : null;

/** The 1881 line (the real Chile-Argentina border), revealed north to south down to latitude `head`; thinner when
 *  zoomed out. `tip` draws a bright pen point on the line's head while it is drawing. */
const BORDER_PTS: [number, number][] = (() => {
  const m = sharedBorder("Chile", "Argentina") as unknown as { coordinates: [number, number][][] };
  return m.coordinates.flat().map((p) => [p[0], p[1]] as [number, number]);
})();
const BorderLine: React.FC<{ h: MapHelpers; head: number; id: string; tip?: boolean }> = ({ h, head, id, tip = false }) => {
  if (head > -21.5) return null;
  const d = h.path(sharedBorder("Chile", "Argentina"));
  const y0 = h.p(-70, -16.5)[1];
  const y1 = h.p(-70, head)[1];
  const w = clamp(h.k / 8, 0.42, 1);
  // the pen point: the border vertex nearest to the head latitude (north of it)
  let pen: [number, number] | null = null;
  if (tip && head > -52.5) {
    let best = Infinity;
    for (const [lon, lat] of BORDER_PTS) {
      const dl = lat - head;
      if (dl >= 0 && dl < best) {
        best = dl;
        pen = [lon, lat];
      }
    }
  }
  const pp = pen ? h.p(pen[0], pen[1]) : null;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={-100000} y={y0} width={200000} height={Math.max(0, y1 - y0)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={18 * w} vectorEffect="non-scaling-stroke" />
        <path d={d} stroke={INK} strokeWidth={10 * w} vectorEffect="non-scaling-stroke" />
        <path d={d} stroke="#FFFFFF" strokeWidth={6 * w} vectorEffect="non-scaling-stroke" />
      </g>
      {pp ? (
        <g transform={`translate(${pp[0]} ${pp[1]}) scale(${1 / h.k})`}>
          <circle r={17} fill="#FFFFFF" opacity={0.28} />
          <circle r={8} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

/** s07: the strip lights up north to south (deeper red -> full red) behind a bright leading edge. */
const SweepLit: React.FC<{ h: MapHelpers; t: number; id: string }> = ({ h, t, id }) => {
  if (t <= 0) return null;
  const d = chileD(h);
  const y0 = h.p(-70, -17.2)[1];
  const y1 = h.p(-70, -56.3)[1];
  const yf = y0 + (y1 - y0) * clamp(t);
  const band = 56 / h.k;
  const edgeO = 0.7 * Math.min(1, t * 10, (1 - t) * 10);
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
        <clipPath id={`${id}r`}>
          <rect x={-100000} y={y0 - 100} width={200000} height={Math.max(0, yf - y0 + 100)} />
        </clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3E6" stopOpacity="0" />
          <stop offset="0.7" stopColor="#FFD9DD" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFF4F5" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={d} fill={RED} clipPath={`url(#${id}r)`} />
      {edgeO > 0 ? <rect x={-100000} y={yf - band} width={200000} height={band} fill={`url(#${id}g)`} opacity={edgeO} clipPath={`url(#${id}c)`} /> : null}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the Andes
// Relief band, north to south: [lat, west edge lon, east edge lon]. Along Chile the west edge IS Chile's eastern border
// (the 1881 line follows the crest), so the band never covers the strip; north of Chile it follows the range to Venezuela.
const ANDES: [number, number, number][] = [
  [9.8, -70.4, -69.6], [8.5, -71.6, -70.2], [7.0, -73.4, -71.8], [5.5, -76.2, -72.8], [4.0, -76.6, -73.8], [2.5, -77.2, -75.2],
  [1.0, -78.1, -76.6], [-0.5, -78.9, -77.4], [-2.0, -79.3, -78.0], [-3.5, -79.6, -78.4], [-5.0, -79.7, -78.4], [-6.5, -79.2, -77.6],
  [-8.0, -78.5, -76.6], [-9.5, -77.9, -75.9], [-11.0, -77.0, -74.9], [-12.5, -76.0, -73.6], [-14.0, -74.8, -71.0], [-15.5, -73.2, -68.6],
  [-17.0, -70.5, -66.6], [-17.5, -69.5, -66.2], [-19.0, -68.95, -65.6], [-20.5, -68.5, -64.6], [-22.0, -68.06, -64.4], [-23.5, -67.3, -64.6],
  [-25.0, -68.45, -65.0], [-26.5, -68.4, -65.6], [-28.0, -69.2, -66.4], [-29.5, -69.85, -67.3], [-31.0, -70.3, -68.1], [-32.5, -70.2, -68.5],
  [-34.0, -69.9, -68.6], [-35.5, -70.4, -69.0], [-37.0, -71.1, -69.7], [-38.5, -71.25, -70.0], [-40.0, -71.65, -70.5], [-41.5, -71.85, -70.7],
  [-43.0, -72.1, -70.9], [-44.5, -71.7, -70.7], [-46.0, -71.7, -70.8], [-47.5, -72.2, -71.2], [-49.0, -73.0, -71.8], [-50.5, -73.4, -72.2],
  [-51.6, -72.6, -71.9], [-52.3, -72.3, -72.1],
];
const andesAt = (lat: number): [number, number] | null => {
  for (let i = 0; i + 1 < ANDES.length; i++) {
    const [la, wa, ea] = ANDES[i];
    const [lb, wb, eb] = ANDES[i + 1];
    if (lat <= la && lat >= lb) {
      const t = (la - lat) / (la - lb);
      return [wa + (wb - wa) * t, ea + (eb - ea) * t];
    }
  }
  return null;
};
// hachures (classic relief strokes running downslope from the crest): light on the west slope, dark on the east slope
const HACH = (() => {
  const light: [number, number, number, number][] = [];
  const dark: [number, number, number, number][] = [];
  let i = 0;
  for (let lat = 9.4; lat >= -52.0; lat -= 0.42, i++) {
    const e = andesAt(lat);
    if (!e) continue;
    const [w, ea] = e;
    const c = (w + ea) / 2;
    const sl = (rand(i, 3) - 0.5) * 0.3;
    light.push([c, lat, c + (w - c) * (0.5 + 0.42 * rand(i, 1)), lat - 0.1 + sl]);
    dark.push([c, lat, c + (ea - c) * (0.5 + 0.42 * rand(i, 2)), lat - 0.1 - sl]);
  }
  return { light, dark };
})();

/** The range as a soft relief band. `reveal` 0..1 grows it out from latitude `origin` (north to `latMax`, south to 53 S);
 *  `latMax` cuts the range off in the north (s06 shows only Chile's stretch). */
const AndesRelief: React.FC<{ h: MapHelpers; id: string; reveal?: number; o?: number; origin?: number; latMax?: number }> = ({ h, id, reveal = 1, o = 1, origin = 10.5, latMax = 10.5 }) => {
  if (reveal <= 0 || o <= 0) return null;
  const pt = (lon: number, lat: number) => {
    const [x, y] = h.p(lon, lat);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };
  const west = ANDES.map(([lat, w]) => pt(w, lat));
  const east = ANDES.map(([lat, , e]) => pt(e, lat));
  const crest = ANDES.map(([lat, w, e]) => pt((w + e) / 2, lat));
  const poly = (a: string[], b: string[]) => `M${[...a, ...[...b].reverse()].join("L")}Z`;
  const segs = (list: [number, number, number, number][]) => list.map(([a, b, c, d]) => `M${pt(a, b)}L${pt(c, d)}`).join("");
  const yTop = h.p(-70, Math.min(latMax, 10.5))[1];
  const yBot = h.p(-70, -53)[1];
  const yo = h.p(-70, Math.min(origin, latMax))[1];
  const r = clamp(reveal);
  const ya = yo + (yTop - yo) * r;
  const yb = yo + (yBot - yo) * r;
  const big = 100000;
  return (
    <g opacity={o}>
      <defs>
        <clipPath id={`${id}r`}>
          <rect x={-big} y={ya} width={2 * big} height={Math.max(0, yb - ya)} />
        </clipPath>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={2 * big} height={2 * big}>
          <rect x={-big} y={-big} width={2 * big} height={2 * big} fill="#FFFFFF" />
          <path d={chileD(h, CHILE_TRIM)} fill="#000000" />
        </mask>
        <filter id={`${id}b`} x="-30%" y="-5%" width="160%" height="110%">
          <feGaussianBlur stdDeviation={2.4 / h.k} />
        </filter>
      </defs>
      <g clipPath={`url(#${id}r)`}>
        <g mask={`url(#${id}m)`}>
          <g filter={`url(#${id}b)`}>
            <path d={poly(west, crest)} fill="#DCE6F0" fillOpacity={0.24} />
            <path d={poly(crest, east)} fill="#02060D" fillOpacity={0.34} />
          </g>
          <path d={segs(HACH.light)} fill="none" stroke="#E8EFF6" strokeOpacity={0.42} strokeWidth={1.7} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={segs(HACH.dark)} fill="none" stroke="#01050B" strokeOpacity={0.5} strokeWidth={1.7} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={`M${crest.join("L")}`} fill="none" stroke="#F1F5F9" strokeOpacity={0.5} strokeWidth={1.6} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </g>
    </g>
  );
};

// Chile's eastern border (with Bolivia, then Argentina) as points: the border peaks are placed just east of it.
const EAST_BORDER: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (const other of ["Bolivia", "Argentina"]) {
    const m = sharedBorder("Chile", other) as unknown as { coordinates: [number, number][][] };
    for (const line of m.coordinates) for (const p of line) out.push([p[0], p[1]]);
  }
  return out;
})();
// three peak glyphs (design units, base on y = 0, west foot at x = 0): a single cone, a twin peak, a broad massif
type Glyph = { w: number; h: number; body: string; shade: string; snow: string };
const GLYPHS: Glyph[] = [
  { w: 44, h: 48, body: "M0 0 L22 -48 L44 0 Z", shade: "M22 -48 L44 0 L27 0 Z", snow: "M22 -48 L14.7 -32 L19 -34.5 L22.5 -30.5 L26.5 -34.5 L29.3 -32 Z" },
  { w: 56, h: 40, body: "M0 0 L20 -40 L30 -24 L38 -36 L56 0 Z", shade: "M30 -24 L38 0 L56 0 L38 -36 Z", snow: "M20 -40 L13 -26 L20 -29 L25 -24 L30 -24 Z M38 -36 L32 -27 L39 -29 L43.5 -25 Z" },
  { w: 68, h: 38, body: "M0 0 L13 -21 L19 -15 L31 -38 L42 -20 L49 -26 L68 0 Z", shade: "M31 -38 L42 -20 L49 -26 L68 0 L37 0 Z", snow: "M31 -38 L24.7 -26 L28.5 -27.8 L32 -24.5 L35.5 -27.8 L38.3 -26 Z M49 -26 L44.3 -22 L47 -23 L49.5 -21 L51.9 -22 Z" },
];
// Peaks, north to south: [lon, lat, size, glyph, onBorder]. Crest peaks (north of Chile) sit on the relief band's crest;
// border peaks stand with their west foot 6 px east of the real border line, so the red strip stays clean. Sizes follow
// the real range: tallest in the north-centre (Llullaillaco, Ojos del Salado, Aconcagua), smaller down Patagonia, with
// the relief band carrying the chain in the gaps between them.
const PEAKS: [number, number, number, number, 0 | 1][] = [
  [0, 8.6, 0.7, 1, 0], [0, 5.6, 0.75, 0, 0], [0, 2.2, 0.8, 2, 0], [0, -1.5, 1.0, 0, 0], [0, -6.2, 0.75, 1, 0],
  [0, -9.1, 1.05, 2, 0], [0, -12.3, 0.8, 0, 0], [0, -14.6, 0.9, 1, 0], [0, -16.3, 0.8, 2, 0],
  [-69.2, -18.6, 0.95, 0, 1], [-68.4, -21.4, 1.0, 1, 1], [-67.6, -24.3, 1.15, 2, 1], [-68.5, -27.1, 1.3, 0, 1], [-69.9, -30.0, 1.05, 1, 1],
  [-70.0, -32.8, 1.4, 0, 1], [-70.4, -35.5, 0.95, 2, 1], [-71.0, -38.2, 0.85, 1, 1], [-71.7, -40.9, 0.75, 0, 1], [-71.9, -43.5, 0.68, 1, 1],
  [-71.7, -46.1, 0.62, 2, 1], [-72.6, -48.6, 0.6, 0, 1], [-73.2, -50.9, 0.55, 1, 1],
];
const rankCache = new Map<number, number[]>();
/** Order in which the peaks rise: outward from latitude `origin`. */
const rankFrom = (origin: number) => {
  let r = rankCache.get(origin);
  if (!r) {
    const order = PEAKS.map((p, i) => [Math.abs(p[1] - origin), i] as [number, number]).sort((a, b) => a[0] - b[0]);
    const out: number[] = new Array(PEAKS.length).fill(0);
    order.forEach(([, i], k) => (out[i] = k));
    r = out;
    rankCache.set(origin, r);
  }
  return r;
};
/** Snow-capped peaks rising one by one outward from `origin`; they fade out as the camera pulls back past `fade`
 *  (zoom range) so the relief band carries the range at continent scale. `north={false}` hides the peaks north of
 *  Chile; `ping` (the latitude the 1881 line has reached) lights up the peaks the line is passing. */
const Peaks: React.FC<{ h: MapHelpers; at: number; stagger?: number; origin?: number; north?: boolean; fade?: [number, number]; ping?: number; flashAt?: number }> = ({
  h,
  at,
  stagger = 1.4,
  origin = 10,
  north = true,
  fade = [4.0, 5.2],
  ping,
  flashAt,
}) => {
  const all = 0.8 * pulseAt(h.f, flashAt, 14);
  const zf = clamp(h.k / 6.5, 0.5, 1.1);
  const po = smootherstep(invLerp(fade[0], fade[1], h.k));
  if (po <= 0) return null;
  const bp = EAST_BORDER.map(([lon, lat]) => h.p(lon, lat));
  const rank = rankFrom(origin);
  return (
    <g opacity={po}>
      {PEAKS.map(([lon0, lat, size, gi, border], i) => {
        if (!border && !north) return null;
        const t0 = at + rank[i] * stagger;
        if (h.f < t0) return null;
        const a = backOut(invLerp(t0, t0 + 7, h.f), 2.2);
        if (a <= 0) return null;
        const g = GLYPHS[gi];
        const u = (size * zf) / h.k; // map units per glyph unit
        let cx: number;
        let by: number;
        if (border) {
          const b = h.p(lon0, lat);
          by = b[1];
          const top = by - g.h * u;
          let mx = -Infinity;
          for (const q of bp) if (q[1] >= top - 3 / h.k && q[1] <= by + 3 / h.k && q[0] > mx) mx = q[0];
          cx = (mx > -Infinity ? mx : b[0]) + 6 / h.k + (g.w * u) / 2;
        } else {
          const e = andesAt(lat);
          const c = h.p(e ? (e[0] + e[1]) / 2 : lon0, lat);
          cx = c[0];
          by = c[1];
        }
        const passed = ping !== undefined && border === 1 && lat >= ping;
        const flash = passed ? Math.max(clamp(1 - (lat - (ping as number)) / 4), all) : 0;
        const glow = passed ? Math.max(0.35, flash) : 0;
        return (
          <g key={i} transform={`translate(${cx} ${by}) scale(${u * a * (1 + 0.14 * flash)}) translate(${-g.w / 2} 0)`}>
            {flash > 0.02 ? <path d={g.body} fill="none" stroke="#FFFFFF" strokeOpacity={0.55 * flash} strokeWidth={10} strokeLinejoin="round" /> : null}
            <path d={g.body} fill={glow > 0 ? mixHex("#8FA3B8", "#D3DEEA", glow) : "#8FA3B8"} />
            <path d={g.shade} fill="#5E7289" opacity={0.65} />
            <path d={g.snow} fill={glow > 0 ? "#FFFFFF" : "#F1F5F9"} />
            <path d={g.body} fill="none" stroke={flash > 0.05 ? mixHex(INK, "#FFFFFF", flash * 0.85) : INK} strokeWidth={3.2} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the Pacific
const PACIFIC: [number, number][] = [
  [-79.5, 8], [-80.5, 3], [-82.8, -1], [-83.5, -5], [-81.8, -9], [-79.8, -13], [-75.8, -17], [-73.6, -20], [-73.8, -25], [-74.6, -30],
  [-75.4, -34], [-76.6, -38], [-77.6, -42], [-78.6, -46], [-78.4, -50], [-76.5, -54], [-72, -57],
];
/** A soft blue light along the west coast (drawn under the land, so the land masks its eastern half). */
const PacificGlow: React.FC<{ h: MapHelpers; id: string; o: number }> = ({ h, id, o }) => {
  if (o <= 0) return null;
  const pts = PACIFIC.map(([lon, lat]) => h.p(lon, lat));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const m = 70;
  const x0 = Math.min(...xs) - m;
  const y0 = Math.min(...ys) - m;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("");
  return (
    <g opacity={o}>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" x={x0} y={y0} width={Math.max(...xs) - x0 + m} height={Math.max(...ys) - y0 + m}>
          <feGaussianBlur stdDeviation={9} />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="#2E7DD1" strokeOpacity={0.62} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${id})`} />
    </g>
  );
};

const COAST: [number, number][] = [
  [8, -77.8], [4, -77.4], [0, -80.1], [-4, -81.2], [-8, -79.3], [-12, -77.1], [-15, -75.3], [-17, -72.3], [-18, -70.4], [-20, -70.2], [-23, -70.5],
  [-26, -70.7], [-29, -71.5], [-32, -71.5], [-35, -72.3], [-38, -73.5], [-41, -74.0], [-44, -74.8], [-47, -75.6], [-50, -75.6], [-53, -74.8], [-55, -71.5],
];
const coastLon = (lat: number) => {
  for (let i = 0; i + 1 < COAST.length; i++) {
    const [la, a] = COAST[i];
    const [lb, b] = COAST[i + 1];
    if (lat <= la && lat >= lb) return a + ((b - a) * (la - lat)) / (la - lb);
  }
  return lat > 0 ? COAST[0][1] : COAST[COAST.length - 1][1];
};
const ROWS_CHILE = [-19, -23, -27, -31, -35, -39, -43, -47, -51];
const ROWS_ALL = [6, 2, -2, -6, -10, -14, ...ROWS_CHILE];
/** Moving wave lines in the ocean west of the coast (under the land). */
const Waves: React.FC<{ h: MapHelpers; o: number; rows: number[] }> = ({ h, o, rows }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {rows.map((lat, r) => {
        const c = coastLon(lat) - 1.0;
        const pts: string[] = [];
        for (let i = 0; i <= 26; i++) {
          const lon = c - 9.5 + i * 0.36 + (r % 3) * 0.3;
          if (lon > c) break;
          const [x, y] = h.p(lon, lat + Math.sin(i * 0.9 + r * 1.7 - h.f * 0.14) * 0.34);
          pts.push(`${pts.length ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        return <path key={lat} d={pts.join("")} fill="none" stroke="#6FC3FF" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ desert and ice (s02)
/** A soft radial tint clipped to Chile, growing from a point (the Atacama turns sand-gold). */
const RegionTint: React.FC<{ h: MapHelpers; id: string; at: number; lon: number; lat: number; km: number; color: string; max?: number; dur?: number }> = ({
  h,
  id,
  at,
  lon,
  lat,
  km,
  color,
  max = 0.9,
  dur = 14,
}) => {
  if (h.f < at) return null;
  const t = easeOut(invLerp(at, at + dur, h.f));
  const [cx, cy] = h.p(lon, lat);
  const R = km * KM_PX;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}g`} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={R}>
          <stop offset="0" stopColor={color} stopOpacity={max} />
          <stop offset="0.6" stopColor={color} stopOpacity={max * 0.82} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={chileD(h, CHILE_TRIM)} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={R * t} fill={`url(#${id}g)`} clipPath={`url(#${id}c)`} />
    </g>
  );
};

// The two Patagonian ice fields (approximate outlines along the border, inside Chile): Northern 46.4-47.7 S,
// Southern 48.3-51.6 S. Only these turn white-blue; the rest of the strip stays red.
const ICE: [number, number][][] = [
  [[-73.05, -46.4], [-72.9, -46.9], [-73.05, -47.4], [-73.45, -47.78], [-74.0, -47.5], [-74.1, -46.9], [-73.65, -46.4]],
  [[-73.05, -48.25], [-72.9, -48.8], [-72.95, -49.3], [-73.15, -49.8], [-73.25, -50.3], [-73.2, -50.8], [-73.25, -51.3], [-73.45, -51.7], [-73.9, -51.6], [-74.25, -51.0], [-74.3, -50.4], [-74.15, -49.8], [-73.95, -49.2], [-73.75, -48.7], [-73.45, -48.3]],
];
// a ragged ice edge: each side gets two jittered points (outlet-glacier lobes), so the fields read as ice, not as blobs
const ICE_EDGE: [number, number][][] = ICE.map((ring, r) => {
  const out: [number, number][] = [];
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    for (const [k, u] of [[1, 0.36], [2, 0.7]] as const) {
      const j = (rand(r * 31 + i, k) - 0.35) * 0.16; // degrees off the side, biased to one side (lobes, not noise)
      out.push([a[0] + dx * u - (dy / len) * j, a[1] + dy * u + (dx / len) * j]);
    }
  });
  return out;
});
const IceFields: React.FC<{ h: MapHelpers; id: string; at: number }> = ({ h, id, at }) => {
  if (h.f < at) return null;
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={chileD(h, CHILE_TRIM)} />
        </clipPath>
        <filter id={`${id}b`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation={3 / h.k} />
        </filter>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        {ICE.map((ring, i) => {
          const t = easeOut(invLerp(at + i * 4, at + i * 4 + 12, h.f));
          if (t <= 0) return null;
          const pts = ICE_EDGE[i].map(([lon, lat]) => h.p(lon, lat));
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          const sc = 0.55 + 0.45 * t;
          const d = `M${pts.map(([x, y]) => `${(cx + (x - cx) * sc).toFixed(2)} ${(cy + (y - cy) * sc).toFixed(2)}`).join("L")}Z`;
          return (
            <g key={i} opacity={t}>
              <path d={d} fill="#FFFFFF" fillOpacity={0.5} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={10} strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter={`url(#${id}b)`} />
              <path d={d} fill="#E3F3FF" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </g>
    </g>
  );
};

const DUNES: [number, number][] = [[-69.7, -19.6], [-69.3, -20.9], [-69.8, -21.6], [-68.8, -21.4], [-69.4, -22.2], [-68.9, -23.4], [-69.5, -24.6], [-69.7, -25.9], [-69.9, -27.0]];
const Dunes: React.FC<{ h: MapHelpers; at: number }> = ({ h, at }) => {
  const o = clamp((h.f - at) / 10);
  if (o <= 0) return null;
  return (
    <g opacity={o} fill="none" stroke="#A8772A" strokeWidth={2.6} strokeLinecap="round">
      {DUNES.map(([lon, lat], i) => {
        const [x, y] = h.p(lon, lat);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${1 / h.k})`}>
            <path d="M-12 2 Q-5 -6 2 -1 T13 -2" />
            <path d="M-9 9 Q-3 3 3 7 T12 6" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

const Sparkle: React.FC<{ h: MapHelpers; at: number; lon: number; lat: number; size?: number }> = ({ h, at, lon, lat, size = 26 }) => {
  const u = (h.f - at) / 16;
  if (u <= 0 || u >= 1) return null;
  const s = Math.sin(Math.PI * u) * size;
  const [x, y] = h.p(lon, lat);
  return <path transform={`translate(${x} ${y}) scale(${s / h.k}) rotate(${u * 45})`} d="M0 -1 L0.2 -0.2 L1 0 L0.2 0.2 L0 1 L-0.2 0.2 L-1 0 L-0.2 -0.2 Z" fill="#FFFFFF" />;
};

// ------------------------------------------------------------------------------------------------ s01 hook
// "This country is 24 times longer than it is wide."
// v0 (main): frame 0 is tight on the narrow middle with the teal width bar across it and "24X LONGER THAN IT IS WIDE";
// the camera snaps back (ease-out, 12 f) to the whole country while the gold ruler drops from the northern tip; on
// "24 times" 24 width-squares stack down the ruler. v1 snaps in from all of South America; v2 opens on the whole
// country already measured and snaps the width bar across.
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const v = variant % 3;
  const n24 = s.hit("24");
  const longer = s.hit("longer");
  const wide = s.hit("wide");
  // after the opening move a constant creep that also lifts the country a little (Cape Horn stays above the captions)
  const hold: MapKey = chileKey(s.dur + 10, WHOLE * 1.1, [392, 666], lin);
  const keys: MapKey[] =
    v === 0
      ? [{ f: 0, lon: MIDBAR[0], lat: MIDBAR[1], zoom: 26, at: [440, 640] }, chileKey(12, WHOLE, MID, outCubic), hold]
      : v === 1
        ? [{ f: 0, lon: -60, lat: -22, zoom: 4.3, at: [560, 562] }, chileKey(12, WHOLE, MID, outCubic), hold]
        : [chileKey(0, WHOLE * 0.9, [430, 700]), chileKey(14, WHOLE, MID, outCubic), hold];
  const rulerAt = [4, 6, -24][v];
  const barAt = [-8, 16, 2][v];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={AMERICAS} keys={keys} focus={[{ name: "Chile", color: RED }]} trim={TRIM_CLEAN} minArea={SPECK}>
        {(h) => (
          <>
            <LenRuler h={h} at={rulerAt} dur={11} pulse={longer} ease={outCubic} />
            <Squares h={h} at={n24} />
            <WidthBar h={h} at={barAt} dur={8} pulse={wide} />
          </>
        )}
      </MapView>
      <Vignette />
      <Stat24 at={0} x={770} y={560} slam punch={n24} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 length
// "Chile runs 4,270 kilometers from top to bottom." / "It starts in one of the driest deserts on Earth, and ends among glaciers."
const S02: React.FC = () => {
  const s = useShot();
  const runs = s.at("runs");
  const said = s.end("4,270");
  const bottom = s.end("bottom");
  const starts = s.at("starts");
  const driest = s.hit("driest");
  const earth = s.end("Earth");
  const ends = s.hit("ends");
  const hold = (f0: number, f1: number, lon: number, lat: number, zoom: number, push = 1.05): MapKey[] => [
    { f: f0, lon, lat, zoom },
    { f: Math.max(f0 + 1, f1), lon, lat, zoom: zoom * push, ease: lin },
  ];
  const FULL = 6.6;
  const keys: MapKey[] = [
    { f: -6, lon: -69.9, lat: -20.2, zoom: 22 },
    { f: runs, lon: -69.9, lat: -20.6, zoom: 23, ease: lin },
    { f: bottom, lon: CH[0], lat: CH[1], zoom: FULL },
    { f: starts, lon: CH[0], lat: CH[1], zoom: FULL * 1.05, ease: lin },
    ...hold(driest, earth, -70.2, -23.6, 15, 1.07),
    ...hold(ends, s.dur + 10, -72.4, -49.6, 15, 1.1),
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={ANCHOR} keys={keys} focus={[{ name: "Chile", color: RED }]} trim={TRIM_FULL} minArea={SPECK}>
        {(h) => (
          <>
            {/* the ruler measures the fly-out, then bows out before the desert close-up (it would sit on the frame edge) */}
            <LenRuler h={h} at={runs} dur={bottom - runs - 2} ease={easeOut} o={1 - smootherstep(invLerp(starts, starts + 8, h.f))} />
            <RegionTint h={h} id="s02des" at={driest + 1} lon={-69.5} lat={-23.2} km={660} color="#E3B865" />
            <Dunes h={h} at={driest + 5} />
            <IceFields h={h} id="s02ice" at={ends + 3} />
            <Sparkle h={h} at={ends + 10} lon={-73.6} lat={-48.9} />
            <Sparkle h={h} at={ends + 15} lon={-73.7} lat={-50.9} size={20} />
            <Pin h={h} at={driest} lon={-69.3} lat={-23.9} color={GOLD} size={60} />
            <Label h={h} at={driest + 3} lon={-64.4} lat={-22.6} text="Atacama Desert" size={50} color="#FFE7A3" />
            <Pin h={h} at={ends + 2} lon={-73.4} lat={-49.8} color="#BFE9FF" size={60} />
            <Label h={h} at={ends + 5} lon={-67.6} lat={-48.4} text="Glaciers" size={58} color="#DDF4FF" />
          </>
        )}
      </MapView>
      <Vignette />
      {/* counts while "four thousand two hundred seventy" is said and lands as the number ends, then holds */}
      <Hud at={runs + 2} out={starts + 4} x={745} y={470} to={4270} dur={said - 2 - (runs + 2)} unit="KM" label="TOP TO BOTTOM" size={170} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 Europe
// "Slide it over Europe, and it reaches from the top of Norway past the bottom of Spain."
const S03: React.FC = () => {
  const s = useShot();
  const slide = s.hit("Slide");
  const norway = s.hit("Norway");
  const bottom = s.hit("bottom");
  const spain = s.hit("Spain");
  const LAT_N = 71.17; // North Cape
  const LAT_S = 36.0; // Punta de Tarifa
  const D_LAT = LAT_N - -17.5; // lift Chile so its northern tip sits on Norway's northern tip
  const D_LON = 83.5;
  const line = (h: MapHelpers, lat: number, at: number, color: string, label: React.ReactNode) => {
    if (h.f < at) return null;
    const t = easeOut(invLerp(at, at + 10, h.f));
    const a = h.p(-22, lat);
    const b = h.p(-22 + 62 * t, lat);
    return (
      <g>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {label}
      </g>
    );
  };
  const tail: [number, number] = [-67.3 + D_LON, -55.9 + D_LAT];
  return (
    <AbsoluteFill>
      <MapView
        proj="equirect"
        clip={[-30, 8, 50, 82]}
        keys={[
          { f: -6, lon: 5.5, lat: 39.0, zoom: 5.4 },
          { f: spain, lon: 5.5, lat: 37.0, zoom: 5.8, ease: lin },
          { f: s.dur + 10, lon: 5.5, lat: 36.6, zoom: 5.98, ease: lin },
        ]}
        focus={[
          { name: "Norway", color: TEAL, at: norway },
          { name: "Spain", color: GOLD, at: spain },
        ]}
        dimOthers={false}
        trim={TRIM_EUROPE}
      >
        {(h) => (
          <>
            {line(h, LAT_N, norway, "#7FE3D8", <Label h={h} at={norway} pop={6} lon={-1.5} lat={LAT_N} dy={-38} text="Top of Norway" size={52} color="#7FE3D8" />)}
            {line(
              h,
              LAT_S,
              bottom,
              "#FFD466",
              // on the open Atlantic west of Gibraltar, below the line: gold like Spain and its line
              <Label h={h} at={bottom} pop={6} lon={-14.2} lat={LAT_S} dy={62} text="Bottom of Spain" lines={["Bottom", "of Spain"]} size={40} color="#FFD466" />,
            )}
            {/* Chile rises from below the frame straight up into place (fast start, lands on "Norway") */}
            <Ghost h={h} name="Chile" dLon={D_LON} dLat={D_LAT} from={[D_LON, D_LAT - 86]} ease={outCubic} at={slide} travel={Math.max(14, norway - slide - 2)} color={RED} trim={CHILE_CLEAN} />
            {h.f >= spain + 2 ? (
              <g transform={`translate(${h.p(...tail)[0]} ${h.p(...tail)[1]}) scale(${backOut(invLerp(spain + 2, spain + 9, h.f), 2.2) / h.k})`}>
                <circle r={13} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              </g>
            ) : null}
          </>
        )}
      </MapView>
      <Vignette />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 width
// "But side to side, it averages just 177 kilometers." / "So why is it so thin?"
// The whole country stays in frame (the tall gold 4,270 ruler against the short teal bar); on "just 177" a round
// magnifier grows out of the bar and shows the narrow middle up close, with the counter under it.
const LENS: [number, number] = [742, 585];
const LENS_R = 170;
const LENS_ZOOM = 27;
const Lens: React.FC<{ open: number; from: [number, number]; r0?: number; children: React.ReactNode }> = ({ open, from, r0 = 20, children }) => {
  if (open <= 0.002) return null;
  const cx = from[0] + (LENS[0] - from[0]) * open;
  const cy = from[1] + (LENS[1] - from[1]) * open;
  const r = Math.max(r0, LENS_R * open);
  // the two outer tangents between the small ring on the bar and the lens: the magnifier's cone
  const dx = cx - from[0];
  const dy = cy - from[1];
  const d = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  const cone =
    d > r + r0 + 4
      ? [1, -1].map((sg) => {
          const al = Math.acos(clamp((r0 - r) / d, -1, 1));
          const ang = th + sg * al;
          return [from[0] + r0 * Math.cos(ang), from[1] + r0 * Math.sin(ang), cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
        })
      : [];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        {cone.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E8F4F2" strokeOpacity={0.7 * clamp(open * 3)} strokeWidth={3} strokeLinecap="round" />
        ))}
        <circle cx={from[0]} cy={from[1]} r={r0} fill="none" stroke={INK} strokeWidth={8} opacity={clamp(open * 3)} />
        <circle cx={from[0]} cy={from[1]} r={r0} fill="none" stroke="#E8F4F2" strokeWidth={3.5} opacity={clamp(open * 3)} />
        <circle cx={cx} cy={cy + 10} r={r + 6} fill="#02060D" opacity={0.45} />
      </svg>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={14} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8F4F2" strokeWidth={5} />
      </svg>
    </AbsoluteFill>
  );
};

const S04: React.FC = () => {
  const s = useShot();
  const side = s.at("side");
  const just = s.hit("just");
  const n177 = s.hit("177");
  const said = s.end("177");
  const why = s.at("why");
  const thin = s.hit("thin");
  const keys: MapKey[] = [
    chileKey(-6, WHOLE * 0.95, [450, 694]),
    chileKey(just, WHOLE * 1.0, [432, 690], lin),
    chileKey(why, WHOLE * 1.05, [422, 686], lin),
    chileKey(why + 14, WHOLE * 0.99, [430, 690], outCubic), // the lens closes: a small pull back, then "?"
    chileKey(s.dur + 10, WHOLE * 1.01, [427, 690], lin),
  ];
  const proj = useMemo(() => makeProjection("local", CH), []);
  // where the bar's centre is on screen (the main map's transform), for the magnifier's cone
  const { v } = viewAt(keys, s.f, proj, [540, 960]);
  const k = 1080 / v[2];
  const pc = proj(MIDBAR) as [number, number];
  const barC: [number, number] = [540 + (pc[0] - v[0]) * k, 960 + (pc[1] - v[1]) * k];
  const open = easeOut(invLerp(just, just + 10, s.f)) * (1 - easeInOut(invLerp(why - 4, why + 6, s.f)));
  const lc: [number, number] = [barC[0] + (LENS[0] - barC[0]) * open, barC[1] + (LENS[1] - barC[1]) * open];
  // inside the lens: from the main zoom up to LENS_ZOOM as it opens, drifting slowly south along the strip
  const lz = Math.exp(Math.log(k) + (Math.log(LENS_ZOOM) - Math.log(k)) * open);
  const drift = 0.35 - 0.012 * Math.max(0, s.f - just);
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} keys={keys} focus={[{ name: "Chile", color: RED }]} trim={TRIM_CLEAN} minArea={SPECK}>
        {(h) => (
          <>
            <LenRuler h={h} at={-8} dur={14} label={6} labelOut={why - 4} />
            <WidthBar h={h} at={side - 2} dur={10} pulse={n177} />
          </>
        )}
      </MapView>
      <Vignette />
      <Lens open={open} from={barC}>
        <MapView
          proj="local"
          center={CH}
          clip={SA}
          keys={[{ f: s.f, lon: MIDBAR[0], lat: MIDBAR[1] + drift * open, zoom: lz, at: lc }]}
          focus={[{ name: "Chile", color: RED }]}
          trim={TRIM_CLEAN}
          minArea={SPECK}
        >
          {(h) => <WidthBar h={h} at={-60} pulse={n177} tick={30} />}
        </MapView>
      </Lens>
      <Hud at={just} out={why - 4} x={LENS[0]} y={LENS[1] + LENS_R + 92} to={177} dur={n177 + 3 - just} unit="KM" label="AVERAGE WIDTH" size={130} color="#7FE3D8" />
      <Word at={thin} x={730} y={560} text="?" size={520} rot={8} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 walls
// "On one side, the Pacific Ocean." / "On the other, the Andes, the longest mountain range on any continent."
const S05: React.FC = () => {
  const s = useShot();
  const pacific = s.hit("Pacific");
  const other = s.at("other");
  const andes = s.hit("Andes");
  const keys: MapKey[] = [
    // starts on s04's last view so the dissolve is a match (one Chile), then swings west to the sea, then east to the range
    chileKey(-6, WHOLE * 0.99, [428, 690]),
    chileKey(pacific + 6, WHOLE * 1.08, [690, 680]),
    chileKey(other, WHOLE * 1.11, [678, 668], lin),
    chileKey(andes + 14, WHOLE * 1.0, [410, 692]),
    chileKey(s.dur + 10, WHOLE * 0.9, [438, 708], lin),
  ];
  const pacO = clamp((s.f - pacific) / 10);
  return (
    <AbsoluteFill>
      <MapView
        proj="local"
        center={CH}
        clip={SA}
        keys={keys}
        focus={[{ name: "Chile", color: RED }]}
        trim={TRIM_CLEAN}
        minArea={SPECK}
        under={(h) => (
          <>
            <PacificGlow h={h} id="s05pg" o={pacO} />
            <Waves h={h} o={pacO} rows={ROWS_ALL} />
          </>
        )}
      >
        {(h) => (
          <>
            <AndesRelief h={h} id="s05ar" origin={-17.5} reveal={easeOut(invLerp(other + 2, andes + 20, h.f))} />
            <Peaks h={h} at={other + 6} origin={-17.5} stagger={1.4} />
            <Label h={h} at={pacific - 1} pop={5} out={other + 4} lon={-86} lat={-30} text="Pacific Ocean" size={46} color="#BFE3FF" />
            <Label h={h} at={andes + 2} pop={6} lon={-55.8} lat={-28} text="Andes" size={72} color="#F1F5F9" />
          </>
        )}
      </MapView>
      <Vignette />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 treaty
// "You see, in 1881, Chile and Argentina signed a border treaty." / "The line would follow the highest peaks of the Andes."
const Treaty: React.FC<{ at: number; out: number; x: number; y: number }> = ({ at, out, x, y }) => {
  const f = useLocalFrame();
  if (f < at || f > out + 6) return null;
  const sc = backOut(invLerp(at, at + 8, f), 2.0) * (f > out ? 1 - invLerp(out, out + 6, f) : 1);
  const sign = (d: number) => clamp((f - at - d) / 12);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 340,
          boxSizing: "border-box",
          transform: `translate(-50%, -50%) rotate(-5deg) scale(${sc})`,
          background: "#F3E9CF",
          border: `6px solid ${INK}`,
          borderRadius: 10,
          padding: "22px 20px 16px",
          boxShadow: "0 18px 0 rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontFamily: font("Oswald"), fontWeight: 700, fontSize: 42, lineHeight: 1.1, letterSpacing: 3, color: "#3B2A1A", textAlign: "center" }}>BOUNDARY TREATY</div>
        {[0.92, 0.8, 0.86].map((w, i) => (
          <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "#B8A583", borderRadius: 5, margin: "16px auto 0" }} />
        ))}
        <svg width="288" height="128" viewBox="0 0 288 128" style={{ display: "block", marginTop: 10 }}>
          <g transform="translate(-2 4) scale(0.8)">
            <path d="M10 60 C 30 10, 50 100, 70 55 S 105 20, 120 62 S 150 80, 165 48" fill="none" stroke="#1B2A6B" strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sign(6)} />
          </g>
          <g transform="translate(-8 4) scale(0.8)">
            <path d="M205 58 C 220 15, 245 95, 262 50 S 290 25, 305 66 S 335 70, 358 40" fill="none" stroke="#7A1F2B" strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sign(14)} />
          </g>
          <line x1="4" y1="84" x2="134" y2="84" stroke="#3B2A1A" strokeWidth={3} />
          <line x1="154" y1="84" x2="284" y2="84" stroke="#3B2A1A" strokeWidth={3} />
          <text x="69" y="120" textAnchor="middle" fontFamily={font("Oswald")} fontWeight={600} fontSize={28} letterSpacing={1.5} fill="#3B2A1A">
            CHILE
          </text>
          <text x="219" y="120" textAnchor="middle" fontFamily={font("Oswald")} fontWeight={600} fontSize={28} letterSpacing={1} fill="#3B2A1A">
            ARGENTINA
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const S06: React.FC = () => {
  const s = useShot();
  const y1881 = s.hit("1881");
  const chile = s.hit("Chile");
  const argentina = s.hit("Argentina");
  const treaty = s.hit("treaty");
  const line = s.hit("line");
  const follow = s.at("follow");
  const peaks = s.hit("peaks");
  const andesEnd = s.end("Andes");
  // framed like s05 and s07: the whole country with Cape Horn above the caption band and Argentina to its right, so
  // the whole 1881 line draws above the captions; one push and leftward drift all shot long at a constant rate (the
  // second leg keeps the first one's speed: a slower leg froze the picture while the line finished drawing), lifting
  // the country as it grows so Cape Horn stays at y ~1080
  const keys: MapKey[] = [chileKey(-6, WHOLE * 0.8, [568, 750]), chileKey(line, WHOLE * 0.92, [466, 722], lin), chileKey(s.dur + 14, WHOLE * 1.0, [404, 692], lin)];
  const lt = smootherstep(invLerp(line, andesEnd + 2, s.f));
  const head = s.f >= line ? -22 - 33 * lt : undefined;
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} keys={keys} trim={TRIM_CLEAN} minArea={SPECK} under={(h) => <ChileGlow h={h} id="s06gl" o={0.8 * pulseAt(h.f, chile, 18)} />}>
        {(h) => (
          <>
            <ArgTint h={h} o={0.26 * clamp((h.f - argentina) / 6)} />
            <ChileFill h={h} o={(0.78 + 0.22 * clamp((h.f - chile) / 6)) * (1 - 0.2 * lt)} />
            {/* only Chile's stretch of the range: the year sits on empty map above the northern tip */}
            <AndesRelief h={h} id="s06ar" o={0.9} latMax={-17} />
            <Peaks h={h} at={-60} north={false} ping={head} flashAt={peaks} />
            <BorderLine h={h} head={head ?? 99} id="s06bl" tip={lt < 0.995} />
            {/* the map's names give way to the treaty card's signatures */}
            <Label h={h} at={chile} pop={6} out={treaty - 4} lon={-80.5} lat={-31.5} text="Chile" size={52} color="#FFB3B9" />
            <Label h={h} at={argentina} pop={6} out={treaty - 4} lon={-59.3} lat={-28.5} text="Argentina" size={36} color="#BBD6FF" />
          </>
        )}
      </MapView>
      <Vignette />
      <Word at={y1881} out={line - 6} x={440} y={284} text="1881" size={260} color="#F1F5F9" />
      <Treaty at={treaty} out={follow - 4} x={800} y={590} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 payoff
// "So Chile kept the narrow strip between the mountains and the sea." / "It's not a strange shape. It's the edge of a continent."
const S07: React.FC = () => {
  const s = useShot();
  const chile = s.at("Chile");
  const mountains = s.hit("mountains");
  const sea = s.hit("sea");
  const strange = s.at("strange");
  const edge = s.hit("edge");
  const continent = s.hit("continent");
  const keys: MapKey[] = [
    chileKey(-6, WHOLE * 0.98, [419, 699]), // s06's last view: the zoom-out seam reads as one camera
    // the seam's pull back carries on as a steady creep, drifting the strip right to centre it between its labels
    chileKey(strange, WHOLE * 0.78, [505, 700], lin),
    // all of South America, Panama at the top edge (no cut land anywhere in frame)
    { f: edge + 14, lon: -60, lat: -22, zoom: 4.3, at: [560, 562] },
    { f: s.dur + 20, lon: -60, lat: -22, zoom: 4.5, at: [530, 554], ease: lin },
  ];
  const sweep = smootherstep(invLerp(chile, sea + 2, s.f));
  const pacO = clamp((s.f - sea) / 10);
  const lit = clamp((s.f - edge) / 10);
  return (
    <AbsoluteFill>
      <MapView
        proj="local"
        center={CH}
        clip={AMERICAS}
        keys={keys}
        trim={TRIM_CLEAN}
        minArea={SPECK}
        under={(h) => (
          <>
            <PacificGlow h={h} id="s07pg" o={pacO} />
            <Waves h={h} o={pacO} rows={ROWS_ALL} />
            <ChileGlow h={h} id="s07gl" o={0.55 * sweep + 0.45 * lit + 0.25 * pulseAt(h.f, continent, 14)} />
          </>
        )}
      >
        {(h) => (
          <>
            <ArgTint h={h} o={0.26 * (1 - clamp(h.f / 9))} />
            <ChileFill h={h} o={0.74} />
            <SweepLit h={h} t={sweep} id="s07sw" />
            <AndesRelief h={h} id="s07ar" o={0.9 + 0.1 * pulseAt(h.f, mountains, 16)} />
            <Peaks h={h} at={-60} fade={[4.4, 4.85]} ping={-60} />
            <BorderLine h={h} head={-60} id="s07bl" />
            <Label h={h} at={mountains} pop={6} out={strange + 4} lon={-56.4} lat={-28} text="Andes" size={60} color="#F1F5F9" />
            <Label h={h} at={sea} pop={6} out={strange + 4} lon={-82} lat={-33} text="Pacific" size={54} color="#BFE3FF" />
          </>
        )}
      </MapView>
      <Vignette />
      {/* the hook's stat returns small, already at 24, on the open South Atlantic */}
      <Stat24 at={continent - 2} x={760} y={898} size={130} />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel
    timeline={timeline}
    variant={variant}
    background="#0E1B2C"
    scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }}
  />
);
