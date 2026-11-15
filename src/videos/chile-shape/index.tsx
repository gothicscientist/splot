// scenes: hand-written
// "Why Chile is so long and thin" - Atlas (map & data) x Map mode.
// The map never leaves the screen; every claim is a change of map state keyed to its spoken word via useShot().
// Chile's own shots use the "local" projection (true proportions); the Europe comparison uses an equirectangular
// map, where north-south distances are true everywhere, so the shifted copy of Chile shows its real length.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { backOut, clamp, countUp, easeOut, invLerp, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import { ATLAS, Ghost, Label, MapHelpers, MapKey, MapView, Pin, country, sharedBorder } from "../../styles/atlas/kit";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

const RED = ATLAS.focus.red;
const BLUE = ATLAS.focus.blue;
const GOLD = ATLAS.focus.gold;
const TEAL = ATLAS.focus.teal;
const INK = "#0B1220";
const CH: [number, number] = [-71, -36.75]; // Chile's north-south midpoint
const SA: [number, number, number, number] = [-100, -62, -28, 16];
const N_TIP: [number, number] = [-69.48, -17.5];
const S_TIP: [number, number] = [-67.27, -55.98];
const FULL = 6.6; // zoom at which Chile is ~840 px tall
const ANCHOR: [number, number] = [430, 650]; // Chile sits left of centre, above the caption band

/** A hold that keeps pushing in (two keys), so the map never freezes between moves. */
const hold = (f0: number, f1: number, lon: number, lat: number, zoom: number, push = 1.05): MapKey[] => [
  { f: f0, lon, lat, zoom },
  { f: Math.max(f0 + 1, f1), lon, lat, zoom: zoom * push },
];

// ------------------------------------------------------------------------------------------------ screen HUD
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

/** Big screen-space word (the question mark, the year). */
const Word: React.FC<{ at: number; out?: number; x: number; y: number; text: string; size?: number; color?: string; rot?: number }> = ({ at, out, x, y, text, size = 300, color = GOLD, rot = 0 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const s = backOut(invLerp(at, at + 8, f), 2.4) * (out !== undefined && f > out ? 1 - invLerp(out, out + 6, f) : 1);
  const wob = Math.sin((f - at) * 0.12) * 3;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot + wob}deg) scale(${s})`, fontFamily: font("Bebas Neue"), fontSize: size, lineHeight: 1, color, textShadow: `0 8px 0 ${INK}, 0 0 40px rgba(11,18,32,0.9)`, WebkitTextStroke: `4px ${INK}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ map-space pieces
/** A ruler with end ticks between two lon/lat points that draws on (constant width on screen). */
const Ruler: React.FC<{ h: MapHelpers; at: number; dur: number; from: [number, number]; to: [number, number]; color?: string; tick?: number; width?: number }> = ({ h, at, dur, from, to, color = GOLD, tick = 22, width = 7 }) => {
  if (h.f < at) return null;
  const t = easeOut(invLerp(at, at + dur, h.f));
  const a = h.p(...from);
  const b0 = h.p(...to);
  const b: [number, number] = [a[0] + (b0[0] - a[0]) * t, a[1] + (b0[1] - a[1]) * t];
  const len = Math.hypot(b0[0] - a[0], b0[1] - a[1]) || 1;
  const nx = (-(b0[1] - a[1]) / len) * (tick / h.k);
  const ny = ((b0[0] - a[0]) / len) * (tick / h.k);
  return (
    <g>
      {[INK, color].map((c, i) => (
        <g key={c} stroke={c} strokeWidth={i === 0 ? width + 6 : width} strokeLinecap="round" fill="none">
          <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} vectorEffect="non-scaling-stroke" />
          <line x1={a[0] - nx} y1={a[1] - ny} x2={a[0] + nx} y2={a[1] + ny} vectorEffect="non-scaling-stroke" />
          <line x1={b[0] - nx} y1={b[1] - ny} x2={b[0] + nx} y2={b[1] + ny} vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
};

/** The Andes: snow-capped peak glyphs along the range, rising one by one north to south. */
const ANDES: [number, number][] = [
  [-69.4, -18.2], [-68.6, -20.6], [-68.2, -22.9], [-68.5, -25.2], [-69.1, -27.4], [-69.9, -29.6], [-70.2, -31.6], [-70.0, -33.4],
  [-70.3, -35.2], [-70.9, -37.0], [-71.2, -38.9], [-71.6, -40.8], [-71.8, -42.8], [-71.9, -44.8], [-72.4, -46.8], [-73.0, -48.8], [-72.7, -50.6],
];
const Peaks: React.FC<{ h: MapHelpers; at: number; stagger?: number; size?: number }> = ({ h, at, stagger = 2, size = 1 }) => (
  <g>
    {ANDES.map(([lon, lat], i) => {
      const t0 = at + i * stagger;
      if (h.f < t0) return null;
      const s = backOut(invLerp(t0, t0 + 7, h.f), 2.2) * size * (0.9 + ((i * 37) % 10) / 40);
      const [x, y] = h.p(lon, lat);
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${s / h.k})`}>
          <path d="M-26 16 L-6 -24 L4 -8 L12 -20 L30 16 Z" fill="#8FA3B8" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M-6 -24 L-13 -10 L-6 -13 L-1 -8 L4 -8 Z M12 -20 L7 -11 L13 -13 L17 -9 Z" fill="#F1F5F9" />
          <path d="M4 -8 L12 16 L30 16 L12 -20 Z" fill="#5E7289" opacity={0.6} />
        </g>
      );
    })}
  </g>
);

/** Moving wave lines in the ocean west of Chile. */
const Waves: React.FC<{ h: MapHelpers; at: number }> = ({ h, at }) => {
  const o = clamp((h.f - at) / 10);
  if (o <= 0) return null;
  const rows = [-20, -25, -30, -35, -40, -45, -50, -55];
  return (
    <g opacity={o}>
      {rows.map((lat, r) => {
        const pts: string[] = [];
        for (let i = 0; i <= 28; i++) {
          const lon = -92 + i * 0.6 + r * 0.4;
          if (lon > -75.5 - (lat < -40 ? 1.5 : 0)) break;
          const [x, y] = h.p(lon, lat + Math.sin(i * 0.9 + r * 1.7 - h.f * 0.14) * 0.38);
          pts.push(`${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        return <path key={lat} d={pts.join("")} fill="none" stroke="#6FC3FF" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
      })}
    </g>
  );
};

/** A country shape filled through a clip that grows north to south (0..1). */
const Sweep: React.FC<{ h: MapHelpers; name: string; t: number; color: string; id: string; opacity?: number }> = ({ h, name, t, color, id, opacity = 1 }) => {
  if (t <= 0) return null;
  const y0 = h.p(-71, -16.5)[1];
  const y1 = h.p(-71, -57)[1];
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={-4000} y={y0} width={8000} height={(y1 - y0) * clamp(t)} />
        </clipPath>
      </defs>
      <path d={h.path(country(name))} fill={color} fillOpacity={opacity} clipPath={`url(#${id})`} />
    </g>
  );
};

const Tint: React.FC<{ h: MapHelpers; name: string; color: string; o: number }> = ({ h, name, color, o }) =>
  o > 0 ? <path d={h.path(country(name))} fill={color} fillOpacity={o} stroke={color} strokeOpacity={Math.min(1, o * 2)} strokeWidth={2.5} vectorEffect="non-scaling-stroke" /> : null;

const SpaceBg = "radial-gradient(ellipse at 50% 40%, #16233A 0%, #070B14 70%)";

// ------------------------------------------------------------------------------------------------ s01 hook
// "This country is 24 times longer than it is wide."
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const v = variant % 3;
  const n24 = s.hit("24");
  const longer = s.hit("longer");
  const wide = s.hit("wide");
  const overlays = (h: MapHelpers) => (
    <>
      <Ruler h={h} at={longer} dur={12} from={[-78.5, -17.5]} to={[-78.5, -56]} color={GOLD} tick={18} width={6} />
      <Ruler h={h} at={wide} dur={6} from={[-72.7, -35.5]} to={[-70.7, -35.5]} color={TEAL} tick={12} width={6} />
    </>
  );
  return (
    <AbsoluteFill>
      {v === 0 ? (
        <MapView
          proj="globe"
          background={SpaceBg}
          anchor={[540, 820]}
          keys={[
            { f: 0, lon: -46, lat: -18, zoom: 1.45 },
            { f: n24, lon: -67, lat: -37, zoom: 2.5 },
          ]}
          focus={[{ name: "Chile", color: RED }]}
        >
          {overlays}
        </MapView>
      ) : v === 1 ? (
        <MapView
          proj="local"
          center={CH}
          clip={SA}
          anchor={[540, 760]}
          keys={[
            { f: 0, lon: -71.2, lat: -33.5, zoom: 34 },
            { f: n24 + 2, lon: -71, lat: -36.75, zoom: 5.6 },
          ]}
          focus={[{ name: "Chile", color: RED }]}
        >
          {overlays}
        </MapView>
      ) : (
        <MapView
          proj="naturalEarth"
          res="110m"
          anchor={[540, 760]}
          keys={[
            { f: 0, lon: -30, lat: 0, zoom: 1.5 },
            { f: n24 + 2, lon: -68, lat: -36, zoom: 5.2 },
          ]}
          focus={[{ name: "Chile", color: RED }]}
        >
          {overlays}
        </MapView>
      )}
      <Hud at={n24} x={540} y={330} from={1} to={24} dur={10} unit="X" label="LONGER THAN IT IS WIDE" size={250} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 length
// "Chile runs 4,270 kilometers from top to bottom." / "It starts in one of the driest deserts on Earth, and ends among glaciers."
const S02: React.FC = () => {
  const s = useShot();
  const runs = s.at("runs");
  const bottom = s.end("bottom");
  const starts = s.at("starts");
  const driest = s.hit("driest");
  const earth = s.end("Earth");
  const glaciers = s.hit("glaciers");
  const keys: MapKey[] = [
    { f: -6, lon: -69.9, lat: -20.2, zoom: 22 },
    { f: runs, lon: -69.9, lat: -20.6, zoom: 23 },
    { f: bottom, lon: CH[0], lat: CH[1], zoom: FULL },
    { f: starts, lon: CH[0], lat: CH[1], zoom: FULL * 1.04 },
    ...hold(driest, earth, -70.2, -23.6, 15),
    ...hold(glaciers, s.dur + 10, -72.4, -49.6, 15, 1.08),
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={ANCHOR} keys={keys} focus={[{ name: "Chile", color: RED }]}>
        {(h) => (
          <>
            <Ruler h={h} at={runs} dur={bottom - runs} from={[-78.2, -17.5]} to={[-78.2, -56]} />
            <Pin h={h} at={driest} lon={-69.3} lat={-23.9} color={GOLD} size={60} />
            <Label h={h} at={driest + 3} lon={-64.4} lat={-22.6} text="Atacama Desert" size={50} color="#FFE7A3" />
            <Pin h={h} at={glaciers} lon={-73.4} lat={-49.8} color="#BFE9FF" size={60} />
            <Label h={h} at={glaciers + 3} lon={-67.6} lat={-48.4} text="Glaciers" size={54} color="#DDF4FF" />
          </>
        )}
      </MapView>
      <Hud at={runs + 2} out={starts + 4} x={745} y={470} to={4270} dur={bottom - runs - 4} unit="KM" label="TOP TO BOTTOM" size={170} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 Europe
// "Slide it over Europe, and it reaches from the top of Norway past the bottom of Spain."
const S03: React.FC = () => {
  const s = useShot();
  const slide = s.hit("Slide");
  const norway = s.hit("Norway");
  const spain = s.hit("Spain");
  const LAT_N = 71.17; // North Cape
  const LAT_S = 36.0; // Punta de Tarifa
  const D_LAT = LAT_N - -17.5; // lift Chile so its northern tip sits on Norway's northern tip
  const D_LON = 83.5;
  const line = (h: MapHelpers, lat: number, at: number, text: string, color: string) => {
    if (h.f < at) return null;
    const t = easeOut(invLerp(at, at + 10, h.f));
    const a = h.p(-22, lat);
    const b = h.p(-22 + 62 * t, lat);
    return (
      <g>
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <Label h={h} at={at + 2} lon={-9.5} lat={lat} dy={-34} text={text} size={40} color={color} />
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <MapView
        proj="equirect"
        clip={[-30, 8, 50, 82]}
        keys={[
          { f: -6, lon: 8, lat: 38.5, zoom: 5.6 },
          { f: spain, lon: 8, lat: 36.6, zoom: 6.0 },
          { f: s.dur + 10, lon: 8, lat: 35.6, zoom: 6.5 },
        ]}
        focus={[
          { name: "Norway", color: TEAL, at: norway },
          { name: "Spain", color: GOLD, at: spain },
        ]}
        dimOthers={false}
      >
        {(h) => (
          <>
            {line(h, LAT_N, norway, "Top of Norway", "#7FE3D8")}
            {line(h, LAT_S, spain, "Bottom of Spain", "#FFD466")}
            <Ghost h={h} name="Chile" dLon={D_LON} dLat={D_LAT} at={slide} travel={Math.max(14, norway - slide - 2)} color={RED} />
            {h.f >= spain + 2 ? (
              <circle cx={h.p(-67.3 + D_LON, -55.9 + D_LAT)[0]} cy={h.p(-67.3 + D_LON, -55.9 + D_LAT)[1]} r={(18 + 46 * (((h.f - spain) % 24) / 24)) / h.k} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeOpacity={1 - ((h.f - spain) % 24) / 24} vectorEffect="non-scaling-stroke" />
            ) : null}
          </>
        )}
      </MapView>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 width
// "But side to side, it averages just 177 kilometers." / "So why is it so thin?"
const S04: React.FC = () => {
  const s = useShot();
  const side = s.at("side");
  const n177 = s.hit("177");
  const km = s.end("kilometers");
  const why = s.at("why");
  const thin = s.hit("thin");
  const W_KM = 177;
  const LAT = -35.6;
  const lonW = -72.62;
  const lonE = lonW + W_KM / (111.2 * Math.cos((LAT * Math.PI) / 180));
  const keys: MapKey[] = [
    { f: -6, lon: CH[0], lat: CH[1], zoom: FULL * 1.1 },
    { f: side, lon: CH[0], lat: CH[1], zoom: FULL * 1.14 },
    { f: n177, lon: -71.4, lat: -35.9, zoom: 46 },
    { f: km, lon: -71.4, lat: -35.9, zoom: 49 },
    { f: thin, lon: CH[0], lat: CH[1], zoom: FULL * 1.02 },
    { f: s.dur + 10, lon: CH[0], lat: CH[1], zoom: FULL * 1.1 },
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={[540, 700]} keys={keys} focus={[{ name: "Chile", color: RED }]}>
        {(h) => <>{h.f < thin - 4 ? <Ruler h={h} at={n177} dur={8} from={[lonW, LAT]} to={[lonE, LAT]} color={TEAL} tick={26} width={8} /> : null}</>}
      </MapView>
      <Hud at={n177 + 2} out={why - 2} x={540} y={400} to={177} dur={12} unit="KM" label="AVERAGE WIDTH" size={210} color="#7FE3D8" />
      <Word at={thin} x={760} y={560} text="?" size={520} rot={8} />
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
    { f: -6, lon: -77, lat: -34, zoom: 9.0 },
    { f: other, lon: -77.5, lat: -35, zoom: 9.6 },
    { f: andes + 10, lon: -68.5, lat: -33, zoom: 11 },
    { f: s.dur + 10, lon: -69, lat: -41, zoom: 12 },
  ];
  return (
    <AbsoluteFill>
      <MapView
        proj="local"
        center={CH}
        clip={SA}
        anchor={[540, 700]}
        keys={keys}
        focus={[{ name: "Chile", color: RED }]}
        under={(h) => (
          <>
            <defs>
              <radialGradient id="s05sea">
                <stop offset="0" stopColor="#2E7DD1" stopOpacity="0.5" />
                <stop offset="0.6" stopColor="#2E7DD1" stopOpacity="0.22" />
                <stop offset="1" stopColor="#2E7DD1" stopOpacity="0" />
              </radialGradient>
            </defs>
            {h.f >= pacific ? <ellipse cx={h.p(-86, -36)[0]} cy={h.p(-86, -36)[1]} rx={70} ry={130} fill="url(#s05sea)" opacity={clamp((h.f - pacific) / 10)} /> : null}
            <Waves h={h} at={pacific} />
          </>
        )}
      >
        {(h) => (
          <>
            <Label h={h} at={pacific + 2} lon={-80.2} lat={-29} text="Pacific Ocean" size={54} color="#BFE3FF" />
            <Peaks h={h} at={andes} stagger={2} size={1.25} />
            <Label h={h} at={andes + 6} lon={-64.2} lat={-30.5} text="Andes" size={72} color="#F1F5F9" />
          </>
        )}
      </MapView>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 treaty
// "You see, in 1881, Chile and Argentina signed a border treaty." / "The line would follow the highest peaks of the Andes."
const Treaty: React.FC<{ at: number; out: number }> = ({ at, out }) => {
  const f = useLocalFrame();
  if (f < at || f > out + 6) return null;
  const sc = backOut(invLerp(at, at + 8, f), 2.0) * (f > out ? 1 - invLerp(out, out + 6, f) : 1);
  const sign = (d: number) => clamp((f - at - d) / 12);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 760, top: 820, width: 400, transform: `translate(-50%, -50%) rotate(-5deg) scale(${sc})`, background: "#F3E9CF", border: `6px solid ${INK}`, borderRadius: 10, padding: "26px 30px 30px", boxShadow: "0 18px 0 rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: font("Oswald"), fontWeight: 700, fontSize: 44, letterSpacing: 3, color: "#3B2A1A", textAlign: "center" }}>BOUNDARY TREATY</div>
        {[0.92, 0.8, 0.86].map((w, i) => (
          <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "#B8A583", borderRadius: 5, margin: "18px auto 0" }} />
        ))}
        <svg width="370" height="120" viewBox="0 0 370 120" style={{ display: "block", marginTop: 16 }}>
          <path d="M10 60 C 30 10, 50 100, 70 55 S 105 20, 120 62 S 150 80, 165 48" fill="none" stroke="#1B2A6B" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sign(6)} />
          <path d="M205 58 C 220 15, 245 95, 262 50 S 290 25, 305 66 S 335 70, 358 40" fill="none" stroke="#7A1F2B" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sign(14)} />
          <line x1="8" y1="92" x2="168" y2="92" stroke="#3B2A1A" strokeWidth={3} />
          <line x1="203" y1="92" x2="362" y2="92" stroke="#3B2A1A" strokeWidth={3} />
          <text x="88" y="116" textAnchor="middle" fontFamily={font("Oswald")} fontWeight={600} fontSize={22} letterSpacing={2} fill="#3B2A1A">CHILE</text>
          <text x="282" y="116" textAnchor="middle" fontFamily={font("Oswald")} fontWeight={600} fontSize={22} letterSpacing={2} fill="#3B2A1A">ARGENTINA</text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const BorderLine: React.FC<{ h: MapHelpers; t: number; id: string }> = ({ h, t, id }) => {
  if (t <= 0) return null;
  const d = h.path(sharedBorder("Chile", "Argentina"));
  const y0 = h.p(-71, -16.5)[1];
  const y1 = h.p(-71, -57)[1];
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={-4000} y={y0} width={8000} height={(y1 - y0) * clamp(t)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={18} vectorEffect="non-scaling-stroke" />
        <path d={d} stroke={INK} strokeWidth={10} vectorEffect="non-scaling-stroke" />
        <path d={d} stroke="#FFFFFF" strokeWidth={6} vectorEffect="non-scaling-stroke" />
      </g>
    </g>
  );
};

const S06: React.FC = () => {
  const s = useShot();
  const y1881 = s.hit("1881");
  const chile = s.hit("Chile");
  const argentina = s.hit("Argentina");
  const treaty = s.hit("treaty");
  const line = s.hit("line");
  const andesEnd = s.end("Andes");
  const keys: MapKey[] = [
    { f: -6, lon: -67, lat: -30, zoom: 8.2 },
    { f: line - 4, lon: -67, lat: -31, zoom: 8.8 },
    { f: line + 8, lon: -69.5, lat: -24, zoom: 13 },
    { f: andesEnd + 6, lon: -71, lat: -47, zoom: 13 },
    { f: s.dur + 12, lon: -71, lat: -49, zoom: 14 },
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={[540, 720]} keys={keys}>
        {(h) => (
          <>
            <Tint h={h} name="Chile" color={RED} o={0.55 * clamp((h.f - chile) / 6)} />
            <Tint h={h} name="Argentina" color={BLUE} o={0.5 * clamp((h.f - argentina) / 6)} />
            <Peaks h={h} at={-40} stagger={0} size={h.f < line - 4 ? 1.05 : 0.8} />
            <BorderLine h={h} t={invLerp(line, andesEnd + 4, h.f)} id="s06line" />
            {h.f < line ? (
              <>
                <Label h={h} at={chile + 2} out={line - 6} lon={-79.5} lat={-33} text="Chile" size={56} color="#FFB3B9" />
                <Label h={h} at={argentina + 2} out={line - 6} lon={-63.5} lat={-28.5} text="Argentina" size={56} color="#BBD6FF" />
              </>
            ) : null}
          </>
        )}
      </MapView>
      <Word at={y1881} out={line - 6} x={540} y={330} text="1881" size={300} color="#F1F5F9" />
      <Treaty at={treaty} out={line - 4} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 payoff
// "So Chile kept the narrow strip between the mountains and the sea." / "It's not a strange shape. It's the edge of a continent."
const S07: React.FC = () => {
  const s = useShot();
  const kept = s.at("kept");
  const sea = s.end("sea");
  const strange = s.at("strange");
  const edge = s.hit("edge");
  const continent = s.hit("continent");
  const keys: MapKey[] = [
    { f: -6, lon: -70.5, lat: -36, zoom: 8.6 },
    { f: sea, lon: -70.5, lat: -36.75, zoom: 7.6 },
    { f: strange, lon: -70, lat: -36, zoom: 7.3 },
    { f: edge + 14, lon: -60, lat: -21, zoom: 3.5 },
    { f: s.dur + 20, lon: -60, lat: -21, zoom: 3.8 },
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={[540, 700]} keys={keys}>
        {(h) => {
          const glow = 0.5 + 0.5 * Math.sin((h.f - continent) * 0.25);
          return (
            <>
              <Tint h={h} name="Chile" color={RED} o={0.35} />
              <Sweep h={h} name="Chile" t={smootherstep(invLerp(kept, sea, h.f))} color={RED} id="s07sweep" />
              {h.f >= edge ? <path d={h.path(country("Chile"))} fill="none" stroke="#FFFFFF" strokeWidth={2.5 + 1.5 * glow} strokeOpacity={clamp((h.f - edge) / 8)} vectorEffect="non-scaling-stroke" /> : null}
              {h.f < edge + 6 ? <BorderLine h={h} t={1} id="s07line" /> : null}
              <Peaks h={h} at={-40} stagger={0} size={h.f < edge ? 1 : 0.7} />
              <Label h={h} at={continent} lon={-93} lat={-36} text="24x longer" size={84} color="#FFD466" />
              <Label h={h} at={continent + 3} lon={-93} lat={-36} dy={84} text="than it is wide" size={56} color="#F1F5F9" />
            </>
          );
        }}
      </MapView>
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
