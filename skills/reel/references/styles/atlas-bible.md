<!-- Atlas (map & data infographics) style bible. Research compiled 2026-11-13/14 for Nomen Studio (art-styles study). Numbers are measured or cited; see the sources inside. -->

### 2.D Style D (PICK #2): "Map & data infographic" (history, geography, numbers)

**Intent.** Accurate cartography and data viz in motion: borders that change every day or year, routes that draw themselves, fronts that advance, size and number comparisons, live counters. Use it for history, geography, economics, "how big / how many", and app-marketing stats. Its moat: generative video hallucinates geography and numbers, while code gets them exactly right.

**Palettes (pick one per series)**

| Role | "Dark atlas" (default) | "Parchment" (historical) | "Globe / space" |
|---|---|---|---|
| Ocean | radial `#13263B` to `#0E1B2C` | `#B8CCC9` | `#0A2A4A` |
| Land | `#2A3A4C` (hi `#33475C`) | `#E6D7B0` on paper `#EBDDBE` | `#3E6B48`, desert `#C8A86B`, ice `#EEF4F8` |
| Borders | `#8FA3B8` at 45% | ink `#7A5C3E` | `#FFFFFF` at 35% |
| Coast glow | `#4C7DA8` at 25% | none | atmosphere rim `#6FC3FF` |
| Focus colours | red `#E63946`, blue `#3A86FF`, gold `#FFBE0B`, teal `#2EC4B6`, orange `#FB8500`, purple `#8338EC`, green `#52B788` | muted empires `#B5523B` `#4F6D7A` `#8A9A5B` `#C49A3A` `#6B4E71` at 70% multiply | same as dark atlas |
| Labels | `#F1F5F9` with a `#0B1220` halo | `#3B2A1A` with a paper halo | `#FFFFFF` |
| Context dimming | non-focus land at 55% brightness and -50% saturation | same | same |

- One colour per country or faction for the whole video. Show a legend whenever more than 3 factions are on screen.
- Charts reuse the focus colours. Gridlines are 1 px at 12% opacity.

**Line rules (1080x1920, constant in screen space at every zoom)**

| Line | Spec |
|---|---|
| Coastline | 2 px |
| Borders | 1.5 px. Disputed or planned borders dashed 14/10 |
| Focus outline | 4 px, plus an outer glow of 8-16 px at 40% |
| Routes | 6-8 px with a 2 px darker casing, round caps, tapered arrowheads |
| Front lines | 6 px with a sawtooth pattern |
| Label halo | 4-6 px (`paint-order: stroke`) |

Re-project instead of scaling bitmaps, or use `vector-effect: non-scaling-stroke`.

**Shading**
- Flat fills.
- Optional hillshade raster (Natural Earth shaded relief, public domain) at 15-30% multiply.
- Lift the focus country with a 0-offset shadow: 12 px blur at 35%.
- Optional extruded 3D bar-maps in R3F.
- On the globe: a terminator plus an atmosphere rim.

**Characters**
- None by default. The *map is the character*.
- If needed, use markers instead: shields, helmets, crowns, unit counters, or small capsule people from Style C.
- Countryball-style "flag balls" are a community genre (GBuri's Shorts median is 313K). Keep any designs original.

**Environment / props**

| Prop | Spec |
|---|---|
| Pins | teardrop, 48-64 px |
| City dots | 8-12 px with a 2 px ring |
| Capitals | star |
| Battles | crossed-swords icon |
| Other | legend, scale bar, a subtle compass |
| Date counter | the big hero element |
| Data widgets | bars, lines, a "1 of these = X" unit grid, side-by-side silhouettes for size comparisons |

**Typography (Google Fonts)**
- **Oswald** 500-700 for place labels: uppercase, +4-8% tracking, 28-44 px.
- **Bebas Neue** for the year / date counter, 160-260 px, `font-variant-numeric: tabular-nums`.
- **Roboto Condensed** or **Inter** for data labels.
- **Cinzel** or **IM Fell English SC** for historical titles in Parchment mode.

**Camera and motion**
- **Fly-tos:** van Wijk-Nuij smooth zoom (`d3.interpolateZoom`) over 1.2-2.5 s with an ease-in-out on t.
- **Globe:** rotate with `d3.geoInterpolate` between centres.
- **Arrival:** hold 0.5-1.0 s for labels to land.
- **Stepped time ("every day / every year"):** 2-6 frames per step, synced to the music beat. Territory changes crossfade over 6-10 frames, or reveal through a clip that grows from the origin.
- **Arrows:** draw on in 0.6-1.2 s (ease-in-out), then the arrowhead pops on a spring.
- **Pins:** drop with a spring (10-15% overshoot) and a ripple ring (scale 0 to 2.5, fade over 20 frames).
- **Labels:** pop in over 6 frames (scale .9 to 1 plus opacity).
- **Bars:** grow ease-out-cubic over 12-20 frames. Counters ease out over 20-40 frames.
- **Never** a linear zoom with a separate pan. It looks amateur and induces nausea.

**Transitions**
- Zoom out to the globe, rotate, zoom in.
- Map-to-chart morph: a country shape becomes a bar (flubber).
- Split-screen comparisons.
- "Time wipe" along a year scrubber.
- A crossfade of 6-8 frames between eras.

**Textures**
- Parchment: paper grain plus edge burn at 15-25%.
- Dark atlas: 2-3% noise plus a 15-25% vignette.

**Lighting.** Flat. Use "spotlight" dimming of context instead of light.

**Particles / FX**
- Pulsing rings on events.
- Marching-ants dashed borders (animated `stroke-dashoffset`).
- Battle smoke and explosion icons.
- Data "heat" pulses.
- Sparkle on a record or extreme value.

**Sound palette**
- War and conflict: taiko / war drums, low brass.
- Counters: ticking clock, typewriter clicks.
- Zooms: whooshes. Pins: clicks.
- Parchment mode: paper rustle.
- Data: soft synth arps.
- Voice-first mix: date steps on the beat, bed 8-10 LU under the voice.

**Data and licensing**

| Source | Status |
|---|---|
| [Natural Earth](https://www.naturalearthdata.com/) via the `world-atlas` npm TopoJSON | Public domain |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/copyright) | CC0 by default; check per-feature `license=*` tags |
| World Bank data | CC BY 4.0, credit it |
| `flag-icons` | MIT |
| [historical-basemaps](https://github.com/aourednik/historical-basemaps) | **Avoid for monetized work.** GPL, and the maintainer says the CC equivalent is CC BY-NC |
| CShapes | **Avoid for monetized work.** CC BY-NC-SA |

**Pro vs cheap: top 10**
1. Real projections and real data. Simplify for scale: 110m data for the world, 50m or 10m clipped for zoomed regions.
2. Hierarchy: a saturated focus against dimmed, desaturated context.
3. Smooth van Wijk zooms, never linear zoom plus pan.
4. Consistent colour coding and a legend.
5. Haloed labels that never overlap. Tabular numerals on counters.
6. Stepped time locked to the beat, with a big date counter.
7. Borders crisp at every zoom, using screen-constant widths.
8. Arrows and fronts that draw on, with tapered heads.
9. Subtle texture and vignette, so it never looks like default GIS.
10. Accuracy: no anachronistic borders, and cite the source on screen or in the description.

**References to emulate**

| Reference | Signal |
|---|---|
| [History on Maps](https://www.youtube.com/@HistoryonMaps) | Latest-30 Shorts median 338K. ["Barbarossa to Berlin Every Day (1941-1945) in 1 minute"](https://www.youtube.com/shorts/lCD8KRevsc8) 1.7M; ["Sino-Japanese War in 1 minute"](https://www.youtube.com/shorts/rtUXN2J2HX4) 1.6M |
| [Cottereau](https://www.youtube.com/@Cottereau1) | ["The History of Europe: Every Year"](https://www.youtube.com/watch?v=UY9P0QSxlnI) 33.9M |
| [Ollie Bye](https://www.youtube.com/@OllieBye) | ["The History of the World: Every Year"](https://www.youtube.com/watch?v=-6Wu0Q7x5D0) 13.9M |
| [GBuri](https://www.youtube.com/@GBuri_P) (countryballs) | Median 313K. ["The Last Dance - German Reunification"](https://www.youtube.com/shorts/TgMB_5JN4fg) 1.4M |
| [Real Data](https://www.youtube.com/@RealDatacomparison) | ["Tallest statue size comparison 3d animation"](https://www.youtube.com/watch?v=YEPJDkZRdJU) 58.3M |
| [Map animation X](https://www.youtube.com/watch?v=RvvwxBFCg_Y) | "Top 10 Largest Empires in History" 340K |
| [Thomas White, "How History Animators Make Their Maps"](https://www.youtube.com/watch?v=a0RfM0lOnew) | 305K; a workflow primer |
| [artemnovitckii /map-route and /graph skills](https://github.com/artemnovitckii/claude-animation-skills) | Shipped as two of the "6 viral reel formats" ([X](https://x.com/RoundtableSpace/status/2117583820426019134)) |

---


### 4.3 Style D (maps and data) with d3-geo
- **Data, memoised at module scope:**
  ```ts
  import { geoOrthographic, geoPath, geoInterpolate } from 'd3-geo';
  import { feature } from 'topojson-client';
  import world from 'world-atlas/countries-50m.json';
  const countries = feature(world as any, (world as any).objects.countries);
  ```
- **Globe per frame:** `geoOrthographic().rotate([-lon,-lat]).scale(s).translate([540,960]).clipAngle(90)`, then `geoPath(proj)(feature)` gives the SVG `d`. Interpolate the centre with `geoInterpolate([lon0,lat0],[lon1,lat1])(t)`.
- **Flat-map fly-to (van Wijk):**
  ```ts
  import { interpolateZoom } from 'd3-interpolate';
  const zi = interpolateZoom([x0, y0, w0], [x1, y1, w1]);   // centre + view width in projected px
  const [cx, cy, w] = zi(Easing.inOut(Easing.cubic)(t)); const k = 1080 / w;
  // <g transform={`translate(${540 - cx*k},${960 - cy*k}) scale(${k})`}> ... paths with vectorEffect="non-scaling-stroke"
  ```
  `zi.duration` gives a perceptually right length to scale your frame budget.
- **Routes:** sample a great circle with `geoInterpolate(a,b)` at 100 points to build a LineString, then `geoPath`. Reveal with `@remotion/paths` `evolvePath(progress, d)`, which returns `strokeDasharray` / `strokeDashoffset`. Pop the arrowhead with a spring.
- **Time steps:**
  - `step = Math.floor((frame - start) / framesPerStep)`. Precompute border sets per date (OpenHistoricalMap or hand-authored polygons over Natural Earth).
  - Crossfade the fills over 6-10 frames.
  - The counter uses Bebas Neue with `fontVariantNumeric: 'tabular-nums'`.
- **Performance:**
  - Use 110m data for world views and 50m or 10m for regions.
  - `proj.clipExtent([[0,0],[1080,1920]])` plus pre-simplification (`topojson-simplify`).
  - For dense layers, draw to Canvas2D with `geoPath(proj, ctx)`.
- **3D globe option:** render polygons once into a 4096x2048 equirectangular `CanvasTexture`, map it onto an R3F sphere, and add a terminator / atmosphere-rim shader.
- **Charts:** `d3-scale` plus `d3-shape` (`line().curve(curveMonotoneX)`), bars grown with `interpolate`, counters via `Math.round(interpolate(...))`.

