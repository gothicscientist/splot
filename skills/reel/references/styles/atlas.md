# Atlas kit: maps and data in motion

Accurate cartography and data viz: Natural Earth borders (world-atlas TopoJSON at 50m and 110m), d3-geo projections,
van Wijk smooth fly-tos, a rotating globe, screen-constant line widths at any zoom, focus countries saturated over a
dimmed context, and overlays (labels, pins, routes, measuring bars, shifted "ghost" shapes, counters, bar charts).
Pure SVG and HTML: no three.js, no `Stage`. Look values: `atlas-bible.md`. Sample (read it before writing a new one):
`src/videos/chile-shape/index.tsx`.

**Data.** Country shapes come from world-atlas (ISC; Natural Earth, public domain). Other layers follow the bible's
licensing table (public domain, CC0 or CC BY; no GPL or NC data in monetized work), and every number on screen is
sourced in `videos/<slug>/research.md`.

## Imports
```tsx
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { backOut, clamp, countUp, easeOut, invLerp, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";                     // "Oswald" labels, "Bebas Neue" numbers
import { MapView, Label, Pin, Route, Measure, Ghost, DateCounter, Bars, ATLAS, KM_PX, country, sharedBorder,
         viewAt } from "../../styles/atlas/kit";
import type { MapKey, MapHelpers, MapProps, Focus, ProjName } from "../../styles/atlas/kit";
```

## A shot
Abridged from `chile-shape` S02 ("Chile runs 4,270 kilometers from top to bottom." / "It starts in one of the driest
deserts on Earth, and ends among glaciers.").
```tsx
const RED = ATLAS.focus.red;
const GOLD = ATLAS.focus.gold;
const CH: [number, number] = [-71, -36.75];                          // Chile's north-south midpoint
const SA: [number, number, number, number] = [-100, -62, -28, 16];   // clip box: South America
const FULL = 6.6;                                                    // zoom at which Chile is ~840 px tall
const ANCHOR: [number, number] = [430, 650];                         // left of centre, above the caption band
/** A hold that keeps pushing in (two keys), so the map never freezes between moves. */
const hold = (f0: number, f1: number, lon: number, lat: number, zoom: number, push = 1.05): MapKey[] => [
  { f: f0, lon, lat, zoom },
  { f: Math.max(f0 + 1, f1), lon, lat, zoom: zoom * push },
];

const S02: React.FC = () => {
  const s = useShot();
  const runs = s.at("runs");
  const bottom = s.end("bottom");
  const starts = s.at("starts");
  const driest = s.hit("driest");                                    // 2 frames before the word
  const earth = s.end("Earth");
  const ends = s.hit("ends");
  const keys: MapKey[] = [
    { f: -6, lon: -69.9, lat: -20.2, zoom: 22 },                    // close on the northern tip
    { f: runs, lon: -69.9, lat: -20.6, zoom: 23 },
    { f: bottom, lon: CH[0], lat: CH[1], zoom: FULL },              // fly out to the whole country as it is said
    { f: starts, lon: CH[0], lat: CH[1], zoom: FULL * 1.04 },
    ...hold(driest, earth, -70.2, -23.6, 15),
    ...hold(ends, s.dur + 10, -72.4, -49.6, 15, 1.08),
  ];
  return (
    <AbsoluteFill>
      <MapView proj="local" center={CH} clip={SA} anchor={ANCHOR} keys={keys}
        focus={[{ name: "Chile", color: RED }]}>
        {(h) => (
          <>
            <Pin h={h} at={driest} lon={-69.3} lat={-23.9} color={GOLD} size={60} />
            <Label h={h} at={driest + 3} lon={-64.4} lat={-22.6} text="Atacama Desert" size={50} color="#FFE7A3" />
            <Pin h={h} at={ends + 2} lon={-73.4} lat={-49.8} color="#BFE9FF" size={60} />
            <Label h={h} at={ends + 5} lon={-67.6} lat={-48.4} text="Glaciers" size={58} color="#DDF4FF" />
          </>
        )}
      </MapView>
      <Hud at={runs + 2} out={starts + 4} x={745} y={470} to={4270} dur={bottom - runs - 4} unit="KM"
        label="TOP TO BOTTOM" size={170} />
    </AbsoluteFill>
  );
};
```
`Hud` is the sample's own screen-space counter (Bebas Neue, `countUp`, pops in and out), drawn as a sibling of the
map. Map overlays live in `children(h)`; every `at` / `out` / key frame is shot-local.

## The map: `<MapView>`
| prop | meaning |
|---|---|
| `keys` | `MapKey[]` = `{ f, lon, lat, zoom }`: frame, the point that lands on `anchor`, zoom. Flat maps fly between keys on a van Wijk smooth zoom with ease-in-out (long jumps zoom out and back in); after the last key a slow push (+0.15 %/f) |
| `proj` | `ProjName`, default "mercator" (table below) |
| `center` | `[lon, lat]` centre of the "local" projection (ignored by the others) |
| `palette` | "dark" (default) or "parchment": ocean, land, border and coast colours only |
| `res` | "50m" (default) or "110m"; the globe always uses 110m |
| `focus` | `Focus[]` = `{ name, color, at?, out?, outline? }`: the country fills with `color` (35 -> 100 % over 8 f from `at`, off at once at `out`) and gets a 4 px white outline over a blurred colour glow unless `outline: false` |
| `dimOthers` | default true: while `focus` is non-empty, every other country is drawn at 62 %, from frame 0 (also before a focus `at`) |
| `clip` | `[lonMin, latMin, lonMax, latMax]`: only countries whose bounds touch the box are drawn (big speed-up at 50m); borders are then drawn per country, so coastlines get the border line too |
| `anchor` | screen point (px) where the key centre lands, default [540, 960]: moves the subject off centre and out of the caption band |
| `background` | CSS background behind the map (default the palette's ocean radial gradient; a dark space gradient for globes) |
| `under` | `(h) => ReactNode` drawn in map space under the land (ocean glows, wave lines, graticules) |
| `children` | `(h) => ReactNode` overlays in map space, over the land, borders and focus outlines |

| `proj` | what it is | 1° at zoom 1 |
|---|---|---|
| "mercator" | the default world map, 1080 px wide at zoom 1; areas swell toward the poles | 3.0 px of longitude |
| "naturalEarth" | compromise world map, ~1040 px wide at zoom 1 | ~2.9 px at the equator |
| "equirect" | plain lon/lat grid; north-south distances are true everywhere | 3.32 px |
| "local" | azimuthal equidistant around `center`: true distances from it, < 2 % error within ~2,000 km, clipped at 75° | 3.32 px (111 km x `KM_PX`) |
| "globe" | orthographic, radius 470 px at zoom 1, centred on `anchor`; turns to face each key | 8.2 px at the centre |

`MapHelpers` (`h`, passed to `under`, `children` and every overlay): `p(lon, lat)` -> map-space `[x, y]`; `k` = screen
px per map px (the current zoom), so divide every size meant in SCREEN px by `h.k` and give lines
`vectorEffect="non-scaling-stroke"`; `f` the shot-local frame; `proj` the d3 projection; `path(geojson)` -> SVG `d`.

Scale on "local": a distance near the centre is `km * KM_PX * zoom` screen px (`KM_PX` = 190 / 6371 ≈ 0.0298 px per km
at zoom 1), so `zoom = targetPx / (km * KM_PX)`: the sample's `FULL = 6.6` makes Chile's ~4,280 km about 840 px tall.

Globe: the keys turn it toward each centre along a great circle (ease-in-out) while the zoom moves in log space, with
a slow push (+0.12 %/f) after the last key. It draws an ocean disc with a light rim, and a shading disc on top of
everything, overlays included.

## Lookups
- `country(nameOrId, res = "50m")`: the feature with that exact name (case-insensitive) or ISO numeric id (a 3-digit
  string, "152" = Chile), else the FIRST partial name match; throws with example names. Names are Natural Earth short
  forms: "United States of America", "Dem. Rep. Congo", "Central African Rep.", "Bosnia and Herz.", "Dominican Rep.",
  "S. Sudan", "Eq. Guinea", "Côte d'Ivoire", "Czechia", "eSwatini". Partial matches follow file order, which differs
  by resolution ("Korea" = South Korea at 50m, North Korea at 110m): use full names.
- `sharedBorder(a, b, res = "50m")`: the border two countries share, as a MultiLineString; draw it with `h.path(...)`.
- `viewAt(keys, f, proj)`: the flat-map view MapView uses (`{ v: [cx, cy, viewWidth], key }`), for custom maps.
- `ATLAS`: the `dark` and `parchment` palettes (oceanA, oceanB, land, landHi, border, coast, label, halo) and the `focus`
  colours red #E63946, blue #3A86FF, gold #FFBE0B, teal #2EC4B6, orange #FB8500, purple #8338EC, green #52B788.

## Overlays in map space (inside `children`, all take `h`)
| component | meaning |
|---|---|
| `Label h at lon lat text size = 40 color = "#F1F5F9" out dy = 0` | uppercase Oswald 700 with a dark #0B1220 halo, centred on the point; `size` and `dy` in screen px; springs in (~18 % overshoot), shrinks and fades over 6 f after `out` |
| `Pin h at lon lat color = ATLAS.focus.red size = 56 label` | teardrop with its tip on the point (1.15 x `size` tall) that drops 80 px on a spring, with a ripple ring (2.5 x `size`, 20 f); optional 34 px label to its right |
| `Route h at dur = 30 from to color = ATLAS.focus.gold width = 7 dashed = false` | great-circle line `[lon, lat]` -> `[lon, lat]` that draws on (ease-in-out over `dur` f) with a dark casing; the arrowhead appears at the end (t > 0.98) |
| `Measure h at from to value unit = " km" dur = 26 color = "#FFBE0B" side = 1` | straight bar that draws on (ease-out over `dur` f) with a Bebas Neue 96 px count from 0 to `value` (you supply the sourced number), 90 px to the right (`side = -1`: left); its end ticks are always horizontal |
| `Ghost h name dLon dLat at color = ATLAS.focus.red res = "50m" travel = 30` | a copy of a country sliding by (dLon, dLat) degrees over `travel` f; a pure translation only on "equirect", so use it there for north-south length comparisons |

```tsx
// S03: Chile slid onto Europe on an equirectangular map, its northern tip on Norway's North Cape
<MapView proj="equirect" clip={[-30, 8, 50, 82]} dimOthers={false}
  keys={[{ f: -6, lon: 8, lat: 38.5, zoom: 5.6 }, { f: spain, lon: 8, lat: 36.6, zoom: 6.0 }, { f: s.dur + 10, lon: 8, lat: 35.6, zoom: 6.5 }]}
  focus={[{ name: "Norway", color: TEAL, at: norway }, { name: "Spain", color: GOLD, at: spain }]}>
  {(h) => <Ghost h={h} name="Chile" dLon={83.5} dLat={71.17 + 17.5} at={slide} travel={Math.max(14, norway - slide - 2)} color={RED} />}
</MapView>
// S01 hook variant 0: a globe in space that turns and zooms to Chile
<MapView proj="globe" background="radial-gradient(ellipse at 50% 40%, #16233A 0%, #070B14 70%)" anchor={[540, 820]}
  keys={[{ f: 0, lon: -46, lat: -18, zoom: 1.45 }, { f: n24, lon: -67, lat: -37, zoom: 2.5 }]}
  focus={[{ name: "Chile", color: RED }]}>
  {overlays}
</MapView>
```

## Screen overlays (siblings of `MapView`, px at 1080x1920)
- `<DateCounter at from to dur = 30 x = 540 y = 360 size = 220 prefix suffix color = "#F1F5F9" step = 1>`: a Bebas Neue
  tabular counter (ease-out cubic, rounded to `step`), horizontally centred whatever `x` says, `y` ≈ its vertical
  centre. It formats with thousands separators, so a year reads "1,881": show years as plain text (the sample's `Word`).
- `<Bars at rows x = 120 y = 520 width = 840 unit = "" stagger = 5>`: horizontal bars `{ label, value, color? }[]` that
  grow (ease-out cubic over 18 f, rows `stagger` f apart) with counting values; rows are 120 px apart, so 4 fit above
  the caption band at the default `y`. The longest bar takes 82 % of `width` and its number follows it in the remaining
  ~130 px: a longer value (5 digits, or a number with a unit) wraps under the bar.
- Only `Label` takes `out`: stop rendering the others (`Pin`, `Route`, `Measure`, `Ghost`, `DateCounter`, `Bars`) to
  remove them.

## Conventions (from the sample)
- Holds: two keys with a 4-8 % zoom push (`hold()` above); two equal keys freeze the map. First key at f -6, last at
  `s.dur + 10` to `+ 20`.
- One region per shot: "local" with `center` on the subject's midpoint and `clip` to its continent box (fast at 50m,
  honest in shape); "equirect" for north-south comparisons with `Ghost`; the globe for the hook; "naturalEarth" with
  `res="110m"` for world views.
- `anchor` keeps the subject above the caption band (y 1100-1350 px): Chile sits at [430, 650] with its labels to the
  east, in empty map space next to the subject, never on it.
- Big numbers and words are screen-space HTML beside the map (the sample's `Hud`, `Word`, `Treaty` card), not map
  overlays.
- Custom map pieces follow the same rules (positions from `h.p`, sizes `/ h.k`, strokes `non-scaling-stroke`): the
  sample's `Ruler` (end ticks perpendicular to the bar), `Peaks` (glyphs that rise one by one), `Waves` (ocean lines in
  `under`), `Sweep` (a country filled through a clip that grows north to south), `Tint`, `BorderLine` (a
  `sharedBorder` drawn with a dark casing and a white core).
- Caption preset: `bold-pop`, the scaffold default.

## Gotchas
- `<clipPath>` and gradient ids in your own pieces must be unique per shot: two shots render together during a
  transition (the sample passes `id="s07sweep"`, `"s06line"`).
- Countries without an ISO id in world-atlas (Kosovo, N. Cyprus, Somaliland, plus Indian Ocean Ter. and Siachen Glacier
  at 50m) break `focus`: focusing one highlights all of them, and its outline lands on the first one. Draw these with
  `h.path(country(name))` yourself.
- `h.p` does not clip on the globe: far-side points land on the visible face, so pins, labels and routes there still
  draw; hide them yourself (`geoDistance` from d3-geo above π/2).
- The globe's shading disc covers `children` too: labels near the limb darken.
- A `Route` across the antimeridian draws a line across the whole flat map.
- `palette="parchment"` recolours the map only: `Label` keeps its light default text and its dark navy halo (the
  palette's `label` and `halo` are unused), so the bible's dark-ink-on-paper label needs your own `<text>`.
- `DateCounter` ignores `x`; `Measure`'s horizontal end ticks vanish on a horizontal bar (the sample's `Ruler` draws
  perpendicular ones).
- Performance: every frame redraws every shown country path (coast glow and fill, plus outlines with `clip`). At 50m
  without `clip` that is all 241 countries: use `clip` for regions and 110m for world views.
