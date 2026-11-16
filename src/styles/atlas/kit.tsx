// Atlas kit: accurate cartography + data viz in motion (the moat: generative video gets borders and numbers wrong).
// Natural Earth borders via world-atlas (ISC), d3-geo projections, van Wijk smooth zoom (d3-interpolate) for fly-tos,
// constant-width lines at any zoom (vector-effect), focus countries saturated over dimmed context.
import React, { useId, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { geoPath, geoMercator, geoNaturalEarth1, geoEquirectangular, geoOrthographic, geoAzimuthalEquidistant, geoInterpolate, geoBounds, geoArea, geoCentroid, GeoProjection } from "d3-geo";
import { interpolateZoom } from "d3-interpolate";
import { feature, mesh } from "topojson-client";
import type { Topology } from "topojson-specification";
import world50 from "world-atlas/countries-50m.json";
import world110 from "world-atlas/countries-110m.json";
import { useLocalFrame } from "../../core/timeline";
import { clamp, invLerp } from "../../core/anim";
import { font } from "../../core/fonts";

export const ATLAS = {
  dark: { oceanA: "#13263B", oceanB: "#0E1B2C", land: "#2A3A4C", landHi: "#33475C", border: "rgba(143,163,184,0.45)", coast: "rgba(76,125,168,0.35)", label: "#F1F5F9", halo: "#0B1220" },
  parchment: { oceanA: "#B8CCC9", oceanB: "#A9BFBC", land: "#E6D7B0", landHi: "#EFE3C2", border: "rgba(122,92,62,0.7)", coast: "rgba(122,92,62,0.25)", label: "#3B2A1A", halo: "#EBDDBE" },
  focus: { red: "#E63946", blue: "#3A86FF", gold: "#FFBE0B", teal: "#2EC4B6", orange: "#FB8500", purple: "#8338EC", green: "#52B788" },
};

type Feat = { id: string; properties: { name: string }; geometry: any; type: "Feature" };
const cache: Record<string, { countries: Feat[]; borders: any; land: any }> = {};
function data(res: "50m" | "110m") {
  if (cache[res]) return cache[res];
  const topo = (res === "50m" ? world50 : world110) as unknown as Topology;
  const countries = (feature(topo, (topo.objects as any).countries) as any).features as Feat[];
  const borders = mesh(topo, (topo.objects as any).countries, (a: any, b: any) => a !== b);
  const land = feature(topo, (topo.objects as any).land ?? (topo.objects as any).countries);
  cache[res] = { countries, borders, land };
  return cache[res];
}
/** Find a country by name (case-insensitive, also partial) or ISO numeric id. */
export function country(nameOrId: string, res: "50m" | "110m" = "50m") {
  const { countries } = data(res);
  const q = nameOrId.toLowerCase();
  const c = countries.find((x) => x.id === nameOrId || x.properties.name.toLowerCase() === q) ?? countries.find((x) => x.properties.name.toLowerCase().includes(q));
  if (!c) throw new Error(`atlas: no country "${nameOrId}". Example names: ${countries.slice(0, 12).map((x) => x.properties.name).join(", ")}`);
  return c;
}

/** Which polygons of a country to keep: those whose centroid is inside `bbox` [lonMin, latMin, lonMax, latMax]
 *  (drops far islands: Svalbard, the Canaries, Juan Fernandez...), only the `largest` one (the mainland), and/or
 *  those of at least `minKm2` (drops dust islands that read as specks at country scale). */
export type Trim = { bbox?: [number, number, number, number]; largest?: boolean; minKm2?: number };
const partCache = new Map<string, Feat>();
/** A country with only some of its polygons (see Trim). Memoised; without a trim it is `country()`. */
export function countryPart(nameOrId: string, trim?: Trim, res: "50m" | "110m" = "50m"): Feat {
  const c = country(nameOrId, res);
  if (!trim) return c;
  const key = `${res}:${c.id}:${c.properties.name}:${JSON.stringify(trim)}`;
  const hit = partCache.get(key);
  if (hit) return hit;
  const g = c.geometry;
  const polys: any[] = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : [];
  let rows = polys.map((p) => {
    const pg = { type: "Polygon", coordinates: p } as any;
    return { p, a: geoArea(pg) * 6371 * 6371, ct: geoCentroid(pg) };
  });
  if (trim.largest && rows.length) rows = [rows.reduce((m, r) => (r.a > m.a ? r : m), rows[0])];
  if (trim.bbox) {
    const [x0, y0, x1, y1] = trim.bbox;
    rows = rows.filter((r) => r.ct[0] >= x0 && r.ct[0] <= x1 && r.ct[1] >= y0 && r.ct[1] <= y1);
  }
  if (trim.minKm2) rows = rows.filter((r) => r.a >= (trim.minKm2 as number));
  const out: Feat = { ...c, geometry: { type: "MultiPolygon", coordinates: rows.map((r) => r.p) } };
  partCache.set(key, out);
  return out;
}

/** A camera key: (lon, lat) is framed at `zoom`; it lands on the MapView anchor, or on the screen point `at`.
 *  `ease` shapes the move INTO this key (default ease-in-out cubic): pass a linear one for a hold that keeps creeping
 *  at a constant rate (every ease-in-out key is a momentary stop), or an ease-out for a fast burst. */
export type MapKey = { f: number; lon: number; lat: number; zoom: number; at?: [number, number]; ease?: (t: number) => number };
const EASE_KEY = Easing.inOut(Easing.cubic);
export type ProjName = "mercator" | "naturalEarth" | "equirect" | "globe" | "local";
const W = 1080;
const H = 1920;
/** Projected px per km at zoom 1 for the "local" projection (scale 190 px per Earth radius). */
export const KM_PX = 190 / 6371;

/** The border two countries share, as a GeoJSON MultiLineString (e.g. the Chile-Argentina line along the Andes). */
export function sharedBorder(a: string, b: string, res: "50m" | "110m" = "50m") {
  const topo = (res === "50m" ? world50 : world110) as unknown as Topology;
  const A = country(a, res).id;
  const B = country(b, res).id;
  return mesh(topo, (topo.objects as any).countries, (x: any, y: any) => (x.id === A && y.id === B) || (x.id === B && y.id === A));
}

const boundsCache = new Map<string, [[number, number], [number, number]]>();
const boundsOf = (c: Feat, res: string) => {
  const k = `${res}:${c.id}:${c.properties.name}`;
  let b = boundsCache.get(k);
  if (!b) {
    b = geoBounds(c as any) as [[number, number], [number, number]];
    boundsCache.set(k, b);
  }
  return b;
};

/** The projection MapView builds for `proj` (+ `center` for "local"), e.g. to place screen-space overlays with viewAt. */
export const makeProjection = (name: ProjName, center: [number, number] = [0, 0]) => makeProj(name, center);

function makeProj(name: ProjName, rotate: [number, number] = [0, 0]): GeoProjection {
  // "local": azimuthal equidistant centred on `rotate` = true distances from the centre, under 2 % distortion
  // within ~2,000 km. Use it for one country or region so its shape and proportions are honest.
  if (name === "local") return geoAzimuthalEquidistant().clipAngle(75).scale(190).translate([W / 2, H / 2]).rotate([-rotate[0], -rotate[1]]);
  const p = name === "mercator" ? geoMercator() : name === "naturalEarth" ? geoNaturalEarth1() : name === "equirect" ? geoEquirectangular() : geoOrthographic().clipAngle(90);
  if (name === "globe") return p.scale(470).translate([W / 2, H / 2]).rotate([-rotate[0], -rotate[1]]);
  return p.scale(name === "mercator" ? 172 : 190).translate([W / 2, H / 2]);
}

/** View at frame f from keys: van Wijk-Nuij smooth zoom between keys (ease-in-out on t). Returns centre + zoom.
 *  `anchor` is the screen point the view centre lands on (needed only for keys that carry their own `at`). */
export function viewAt(keys: MapKey[], f: number, proj: GeoProjection, anchor: [number, number] = [W / 2, H / 2]) {
  const ks = [...keys].sort((a, b) => a.f - b.f);
  const toView = (k: MapKey) => {
    const [x, y] = proj([k.lon, k.lat]) as [number, number];
    // shift the projected centre so that (lon, lat) lands on k.at instead of the anchor
    const dx = k.at ? (anchor[0] - k.at[0]) / k.zoom : 0;
    const dy = k.at ? (anchor[1] - k.at[1]) / k.zoom : 0;
    return [x + dx, y + dy, W / k.zoom] as [number, number, number];
  };
  if (f <= ks[0].f) return { v: toView(ks[0]), key: ks[0] };
  for (let i = 0; i + 1 < ks.length; i++) {
    if (f <= ks[i + 1].f) {
      const t = (ks[i + 1].ease ?? EASE_KEY)(invLerp(ks[i].f, ks[i + 1].f, f));
      return { v: interpolateZoom(toView(ks[i]), toView(ks[i + 1]))(t) as [number, number, number], key: ks[i + 1] };
    }
  }
  const last = ks[ks.length - 1];
  const v = toView(last);
  const d = f - last.f;
  return { v: [v[0], v[1], v[2] / (1 + d * 0.0015)] as [number, number, number], key: last }; // hold: slow push
}

export type Focus = { name: string; color: string; at?: number; out?: number; outline?: boolean };
export type MapProps = {
  keys: MapKey[];
  proj?: ProjName;
  palette?: "dark" | "parchment";
  res?: "50m" | "110m";
  focus?: Focus[];
  dimOthers?: boolean;
  /** centre of the "local" projection [lon, lat] */
  center?: [number, number];
  /** only draw countries whose bounds touch this box [lonMin, latMin, lonMax, latMax] (big speed-up at 50m) */
  clip?: [number, number, number, number];
  /** screen point (px at 1080x1920) where the key centre lands; default the frame centre [540, 960] */
  anchor?: [number, number];
  /** CSS background behind the map (default: the palette's ocean gradient; pass a dark space gradient for globes) */
  background?: string;
  /** layer drawn UNDER the land in map space (ocean texture, graticule) */
  under?: (helpers: MapHelpers) => React.ReactNode;
  /** per-country polygon filter by country name, e.g. { Norway: { bbox: [4, 57, 32, 72] } } (pass a stable object) */
  trim?: Record<string, Trim>;
  /** drop every polygon smaller than this many km² in countries without their own `trim` (dust islands that read as
   *  dead pixels at the shot's zoom); default keeps everything */
  minArea?: number;
  children?: (helpers: MapHelpers) => React.ReactNode;
};
export type MapHelpers = { p: (lon: number, lat: number) => [number, number]; k: number; f: number; proj: GeoProjection; path: (g: any) => string };

/** The map. Overlays are drawn by `children(helpers)` in map space (use helpers.p(lon, lat) for positions; divide
 *  screen sizes by helpers.k so they stay constant on screen). */
export const MapView: React.FC<MapProps> = ({ keys, proj = "mercator", palette = "dark", res = "50m", focus = [], dimOthers = true, center, clip, anchor = [W / 2, H / 2], background, under, trim, minArea, children }) => {
  const f = useLocalFrame();
  const uid = useId().replace(/:/g, "");
  const P = ATLAS[palette];
  const isGlobe = proj === "globe";
  // globe: rotate toward the key centre (geoInterpolate) instead of zooming a flat map
  let rot: [number, number] = center ?? [0, 0];
  let globeZoom = 1;
  if (isGlobe) {
    const ks = [...keys].sort((a, b) => a.f - b.f);
    let i = 0;
    while (i + 1 < ks.length && f > ks[i + 1].f) i++;
    const a = ks[i];
    const b = ks[Math.min(i + 1, ks.length - 1)];
    const t = (b.ease ?? EASE_KEY)(invLerp(a.f, b.f, f));
    const c = geoInterpolate([a.lon, a.lat], [b.lon, b.lat])(t);
    rot = [c[0], c[1]];
    // zoom in log space between the keys, then a slow push so a hold never freezes
    globeZoom = Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t) * (f > b.f ? 1 + (f - b.f) * 0.0012 : 1);
  }
  const projection = useMemo(() => makeProj(proj, rot), [proj, rot[0], rot[1]]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const resName = isGlobe ? "110m" : res;
  const d = data(resName);
  const shown = useMemo(
    () =>
      clip
        ? d.countries.filter((c) => {
            const [[x0, y0], [x1, y1]] = boundsOf(c, resName);
            const lonOk = x0 <= x1 ? x0 <= clip[2] && x1 >= clip[0] : true; // crosses the antimeridian: keep
            return lonOk && y0 <= clip[3] && y1 >= clip[1];
          })
        : d.countries,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d, resName, clip?.[0], clip?.[1], clip?.[2], clip?.[3]],
  );
  const trimKey = trim ? JSON.stringify(trim) : "";
  const paths = useMemo(() => {
    const trims = new Map<string, Trim>();
    if (trim) for (const [name, t] of Object.entries(trim)) trims.set(country(name, resName).properties.name, t);
    return shown
      .map((c) => {
        const t = trims.get(c.properties.name) ?? (minArea ? { minKm2: minArea } : undefined);
        return { id: c.id, name: c.properties.name, d: path((t ? countryPart(c.properties.name, t, resName) : c) as any) ?? "" };
      })
      .filter((c) => c.d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, path, trimKey, resName, minArea]);
  const borders = useMemo(() => (clip ? "" : path(d.borders) ?? ""), [d, path, clip]);
  const { v } = isGlobe ? { v: [W / 2, H / 2, W] as [number, number, number] } : viewAt(keys, f, projection, anchor);
  const k = isGlobe ? globeZoom : W / v[2];
  const tx = anchor[0] - v[0] * k;
  const ty = anchor[1] - v[1] * k;
  const focusMap = new Map(focus.map((x) => [country(x.name, isGlobe ? "110m" : res).id, x]));
  const helpers: MapHelpers = { p: (lon, lat) => projection([lon, lat]) as [number, number], k, f, proj: projection, path: (g) => path(g) ?? "" };
  return (
    <AbsoluteFill style={{ background: background ?? `radial-gradient(ellipse at 50% 45%, ${P.oceanA}, ${P.oceanB})` }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id={`fg${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={10 / Math.max(1, k)} />
          </filter>
          <radialGradient id={`gs${uid}`} cx="0.36" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#BFE3FF" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="#0B1220" stopOpacity="0" />
            <stop offset="1" stopColor="#02060F" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        {isGlobe ? <circle cx={anchor[0]} cy={anchor[1]} r={470 * k} fill={P.oceanA} stroke="#6FC3FF" strokeOpacity={0.35} strokeWidth={10} /> : null}
        <g transform={isGlobe ? `translate(${anchor[0]} ${anchor[1]}) scale(${k}) translate(${-W / 2} ${-H / 2})` : `translate(${tx} ${ty}) scale(${k})`}>
          {under ? under(helpers) : null}
          {/* coast glow under the land */}
          <g opacity={0.9}>
            {paths.map((c) => (
              <path key={`g${c.id}${c.name}`} d={c.d} fill="none" stroke={P.coast} strokeWidth={10} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          {paths.map((c) => {
            const fo = focusMap.get(c.id);
            const on = fo && (fo.at === undefined || f >= fo.at) && (fo.out === undefined || f < fo.out);
            const t = fo && fo.at !== undefined ? clamp((f - fo.at) / 8) : 1;
            const fill = on ? fo!.color : P.land;
            const dim = dimOthers && focus.length > 0 && !on;
            return <path key={`${c.id}${c.name}`} d={c.d} fill={fill} fillOpacity={on ? 0.35 + 0.65 * t : dim ? 0.62 : 1} stroke="none" />;
          })}
          {clip ? (
            paths.map((c) => <path key={`b${c.id}${c.name}`} d={c.d} fill="none" stroke={P.border} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />)
          ) : (
            <path d={borders} fill="none" stroke={P.border} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          )}
          {focus.map((fo) => {
            const id = country(fo.name, isGlobe ? "110m" : res).id;
            const pp = paths.find((x) => x.id === id);
            const on = pp && (fo.at === undefined || f >= fo.at) && (fo.out === undefined || f < fo.out);
            if (!pp || !on || fo.outline === false) return null;
            return (
              <g key={`o${fo.name}`}>
                <path d={pp.d} fill="none" stroke={fo.color} strokeWidth={14} strokeOpacity={0.4} vectorEffect="non-scaling-stroke" filter={`url(#fg${uid})`} />
                <path d={pp.d} fill="none" stroke="#FFFFFF" strokeWidth={4} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          {children ? children(helpers) : null}
        </g>
        {isGlobe ? <circle cx={anchor[0]} cy={anchor[1]} r={470 * k} fill={`url(#gs${uid})`} style={{ pointerEvents: "none" }} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ overlays (map space)
const springAt = (f: number, at: number, fps: number) => (f < at ? 0 : spring({ frame: f - at, fps, config: { mass: 1, stiffness: 180, damping: 13 } }));

/** Place label with a halo (Oswald caps). Size in SCREEN px. Default entrance: a spring from 0 (~18 % overshoot).
 *  `pop` (frames) swaps it for the bible's quick label pop (scale .86 -> 1 plus opacity, no overshoot), so the label
 *  is fully readable `pop` frames after `at`. `halo` recolours the outline; `lines` stacks the text (line gap 1.08 em). */
export const Label: React.FC<{ h: MapHelpers; at: number; lon: number; lat: number; text: string; size?: number; color?: string; out?: number; dy?: number; halo?: string; pop?: number; lines?: string[] }> = ({ h, at, lon, lat, text, size = 40, color = "#F1F5F9", out, dy = 0, halo = "#0B1220", pop, lines }) => {
  const { fps } = useVideoConfig();
  const s = pop ? (h.f < at ? 0 : 0.86 + 0.14 * Easing.out(Easing.cubic)(invLerp(at, at + pop, h.f))) : springAt(h.f, at, fps);
  if (s <= 0 || (out !== undefined && h.f > out + 6)) return null;
  const o = out !== undefined && h.f > out ? 1 - (h.f - out) / 6 : 1;
  const alpha = pop ? invLerp(at - 1, at + pop * 0.6, h.f) * o : clamp(s * o);
  const [x, y] = h.p(lon, lat);
  const k = h.k;
  const rows = lines ?? [text];
  const y0 = size * 0.35 - ((rows.length - 1) * size * 1.08) / 2;
  return (
    <g transform={`translate(${x} ${y + dy / k}) scale(${(s * (pop ? 1 : o)) / k})`} opacity={alpha}>
      <text textAnchor="middle" fontFamily={font("Oswald")} fontWeight={700} fontSize={size} letterSpacing={size * 0.06} fill={color} stroke={halo} strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">
        {rows.map((r, i) => (
          <tspan key={i} x={0} y={y0 + i * size * 1.08}>
            {r.toUpperCase()}
          </tspan>
        ))}
      </text>
    </g>
  );
};

/** Teardrop pin that drops on a spring with a ripple ring. */
export const Pin: React.FC<{ h: MapHelpers; at: number; lon: number; lat: number; color?: string; size?: number; label?: string }> = ({ h, at, lon, lat, color = ATLAS.focus.red, size = 56, label }) => {
  const { fps } = useVideoConfig();
  if (h.f < at) return null;
  const s = springAt(h.f, at, fps);
  const [x, y] = h.p(lon, lat);
  const k = h.k;
  const rip = clamp((h.f - at) / 20);
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / k})`}>
      <circle r={size * 2.5 * rip} fill="none" stroke={color} strokeWidth={4} opacity={1 - rip} />
      <g transform={`translate(0 ${-(1 - s) * 80}) scale(${s})`}>
        <path d={`M0 0 C ${-size * 0.6} ${-size * 0.55} ${-size * 0.5} ${-size * 1.15} 0 ${-size * 1.15} C ${size * 0.5} ${-size * 1.15} ${size * 0.6} ${-size * 0.55} 0 0Z`} fill={color} stroke="#0B1220" strokeWidth={4} />
        <circle cy={-size * 0.78} r={size * 0.2} fill="#FFFFFF" />
      </g>
      {label ? (
        <text x={size * 0.7} y={-size * 0.6} fontFamily={font("Oswald")} fontWeight={700} fontSize={34} fill="#F1F5F9" stroke="#0B1220" strokeWidth={6} paintOrder="stroke" opacity={s}>
          {label.toUpperCase()}
        </text>
      ) : null}
    </g>
  );
};

/** Route drawn on along a great circle, arrowhead popping at the end. */
export const Route: React.FC<{ h: MapHelpers; at: number; dur?: number; from: [number, number]; to: [number, number]; color?: string; width?: number; dashed?: boolean }> = ({ h, at, dur = 30, from, to, color = ATLAS.focus.gold, width = 7, dashed = false }) => {
  if (h.f < at) return null;
  const t = Easing.inOut(Easing.cubic)(clamp((h.f - at) / dur));
  const gi = geoInterpolate(from, to);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 64 * t; i++) pts.push(h.p(...(gi(i / 64) as [number, number])));
  if (pts.length < 2) return null;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("");
  const a = pts[pts.length - 1];
  const b = pts[Math.max(0, pts.length - 3)];
  const ang = (Math.atan2(a[1] - b[1], a[0] - b[0]) * 180) / Math.PI;
  return (
    <g>
      <path d={d} fill="none" stroke="#0B1220" strokeWidth={width + 4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? "14 10" : undefined} vectorEffect="non-scaling-stroke" />
      {t > 0.98 ? <path d="M0 -14 L26 0 L0 14 Z" fill={color} transform={`translate(${a[0]} ${a[1]}) scale(${1 / h.k}) rotate(${ang})`} /> : null}
    </g>
  );
};

/** A measuring bar between two points with a counting distance label (screen-constant widths). */
export const Measure: React.FC<{ h: MapHelpers; at: number; from: [number, number]; to: [number, number]; value: number; unit?: string; dur?: number; color?: string; side?: number }> = ({ h, at, from, to, value, unit = " km", dur = 26, color = "#FFBE0B", side = 1 }) => {
  if (h.f < at) return null;
  const t = Easing.out(Easing.cubic)(clamp((h.f - at) / dur));
  const a = h.p(...from);
  const b0 = h.p(...to);
  const b: [number, number] = [a[0] + (b0[0] - a[0]) * t, a[1] + (b0[1] - a[1]) * t];
  const k = h.k;
  const v = Math.round(value * t);
  const mx = (a[0] + b[0]) / 2 + (side * 90) / k;
  const my = (a[1] + b[1]) / 2;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={6} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      {[a, b].map((p, i) => (
        <line key={i} x1={p[0] - 22 / k} y1={p[1]} x2={p[0] + 22 / k} y2={p[1]} stroke={color} strokeWidth={6} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      ))}
      <g transform={`translate(${mx} ${my}) scale(${1 / k})`}>
        <text textAnchor="middle" fontFamily={font("Bebas Neue")} fontSize={96} fill={color} stroke="#0B1220" strokeWidth={10} paintOrder="stroke" style={{ fontVariantNumeric: "tabular-nums" }}>
          {v.toLocaleString("en-US")}
          {unit}
        </text>
      </g>
    </g>
  );
};

/** Draw any GeoJSON feature shifted by (dLon, dLat): honest N-S length comparisons in an equirectangular map. */
export const Ghost: React.FC<{ h: MapHelpers; name: string; dLon: number; dLat: number; at: number; color?: string; res?: "50m" | "110m"; travel?: number; trim?: Trim; from?: [number, number]; ease?: (t: number) => number }> = ({ h, name, dLon, dLat, at, color = ATLAS.focus.red, res = "50m", travel = 30, trim, from = [0, 0], ease = EASE_KEY }) => {
  // `from`: the shift (dLon, dLat) it starts at (default its real place), e.g. just below the frame so the slide reads at once
  if (h.f < at) return null;
  const t = ease(clamp((h.f - at) / travel));
  const c = countryPart(name, trim, res);
  const sx = from[0] + (dLon - from[0]) * t;
  const sy = from[1] + (dLat - from[1]) * t;
  const shift = (coords: any): any => (typeof coords[0] === "number" ? [coords[0] + sx, coords[1] + sy] : coords.map(shift));
  const g = { ...c, geometry: { ...c.geometry, coordinates: shift(c.geometry.coordinates) } };
  return <path d={h.path(g)} fill={color} fillOpacity={0.85} stroke="#FFFFFF" strokeWidth={3} vectorEffect="non-scaling-stroke" />;
};

// ------------------------------------------------------------------------------------------------ screen overlays
/** The hero date / number counter (Bebas Neue, tabular). */
export const DateCounter: React.FC<{ at: number; from: number; to: number; dur?: number; x?: number; y?: number; size?: number; prefix?: string; suffix?: string; color?: string; step?: number }> = ({ at, from, to, dur = 30, x = 540, y = 360, size = 220, prefix = "", suffix = "", color = "#F1F5F9", step = 1 }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  const v = interpolate(f, [at, at + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const shown = Math.round(v / step) * step;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, textAlign: "center", fontFamily: font("Bebas Neue"), fontSize: size, lineHeight: 1, color, fontVariantNumeric: "tabular-nums", textShadow: "0 8px 0 rgba(0,0,0,0.35)" }}>
        {prefix}
        {shown.toLocaleString("en-US")}
        {suffix}
      </div>
    </AbsoluteFill>
  );
};

/** Horizontal bar chart that grows (ease-out cubic), values counting, focus colours. */
export const Bars: React.FC<{ at: number; rows: { label: string; value: number; color?: string }[]; x?: number; y?: number; width?: number; unit?: string; stagger?: number }> = ({ at, rows, x = 120, y = 520, width = 840, unit = "", stagger = 5 }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {rows.map((r, i) => {
        const t = Easing.out(Easing.cubic)(clamp((f - at - i * stagger) / 18));
        return (
          <div key={r.label} style={{ position: "absolute", left: x, top: y + i * 120, width }}>
            <div style={{ fontFamily: font("Oswald"), fontWeight: 700, fontSize: 38, color: "#F1F5F9", letterSpacing: 2, marginBottom: 6 }}>{r.label.toUpperCase()}</div>
            <div style={{ height: 54, width: `${(r.value / max) * 82 * t}%`, background: r.color ?? ATLAS.focus.blue, borderRadius: 8, display: "inline-block", verticalAlign: "middle" }} />
            <span style={{ fontFamily: font("Bebas Neue"), fontSize: 64, color: "#F1F5F9", marginLeft: 18, verticalAlign: "middle", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(r.value * t).toLocaleString("en-US")}
              {unit}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
