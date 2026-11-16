# Glowvector kit: glow-lit flat vector in SVG

Dark saturated fields, one key light from the top-left (every lit shape gets a violet shadow crescent at the
bottom-right and a warm highlight line at the top-left), emissives with halo rings, capsule people and a robot mascot,
springy pops, text that rises through a clip and a 2D world camera that zooms in log space. Pure SVG at 1080x1920:
no three.js, no `Stage`. Look values: `glowvector-bible.md`. Sample (read it before writing a new one):
`src/videos/noise-cancelling/index.tsx`.

**Legal fence.** Kurzgesagt-like, fully original: never copy Kurzgesagt's characters (their birds, duck or dog), logo
or music. People are our own capsule people; the series character is our own `Mascot`.

## Imports
```tsx
import { Reel } from "../../core/Reel";
import { useShot, useLocalFrame } from "../../core/timeline";
import { clamp, invLerp, lerp, smoothstep, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";                   // for your own <text>: "Fredoka", "Space Grotesk"
import { FlashFX } from "../../core/fx2d";                 // the white flash Shockwave does not draw (HTML, outside World)
import { Field, Grain, World, cam2d, LitPath, LitCircle, LitRect, circlePath, rrectPath, Glow, Contact, usePop, Pop,
         RiseText, Callout, BigNumber, Wave, Flow, Shockwave, Person, Mascot, GV, mixC, shadowOf, lightOf,
         noise } from "../../styles/glowvector/kit";
import type { Cam2DKey, PersonSpec, PersonFace } from "../../styles/glowvector/kit";
```

## A shot
Abridged from `noise-cancelling` S03 ("A chip takes that sound wave and flips it upside down." / "Then the speaker
plays the flipped wave straight into your ear.").
```tsx
const ANTI = GV.cyan;                                       // one colour per idea for the whole film
const S03: React.FC = () => {
  const s = useShot();
  const chip = s.hit("chip");                               // 2 frames before the word
  const flips = s.hit("flips");
  const upside = s.hit("upside");
  const speaker = s.hit("speaker");
  const ear = s.hit("ear");
  const Y = 640;
  const cam = cam2d(                                        // world camera; keys in shot-local frames
    [
      { f: -6, x: 430, y: 800, z: 1.34 },                   // from before frame 0: the incoming transition shows it
      { f: flips, x: 600, y: 800, z: 1.4 },
      { f: flips + 26, x: 800, y: 800, z: 1.4 },
      { f: speaker + 6, x: 1230, y: 800, z: 1.36 },         // the world is wider than the frame: pan along it
      { f: ear, x: 1570, y: 800, z: 1.38 },
      { f: s.dur + 10, x: 1610, y: 795, z: 1.46 },          // last key after the shot ends: no dead hold
    ],
    s.f,
  );
  return (
    <AbsoluteFill>
      <Field grain={0} stars={false} cam={cam} top={GV.indigo} bottom={GV.plum} haze={[GV.violet, "#285FC3", GV.teal]} />
      <World cam={cam}>
        <Glow cx={96} cy={Y} r={30} color={GV.gold} intensity={0.5} pulse={0.1} />
        <Chip x={540} y={Y} busy={s.f >= chip ? 1 : 0.3} />
        <Speaker x={1290} y={Y} />
        <Ear x={1830} y={Y} k={1.5} />
        <Callout at={chip} out={flips + 18} x={540} y={380} text="Chip" to={[540, 500]} color={ANTI} size={56} />
        <RiseText at={upside} x={920} y={830} text="UPSIDE DOWN" size={70} color={ANTI} out={speaker + 4} />
        <Callout at={speaker} out={ear - 8} x={1290} y={400} text="Speaker" to={[1290, 520]} color={GV.cream} size={52} />
      </World>
    </AbsoluteFill>
  );
};
```
`Chip`, `Speaker` and `Ear` are the sample's own props: small components of `LitRect`, `LitPath` and `Glow` under a
`transform`. Everything inside `World` is in world units; every `at` / `out` / key frame is shot-local.

## Camera and layers
- `cam2d(keys: Cam2DKey[], f)` returns `{ f, x, y, z, rot }`. `Cam2DKey` = `{ f, x, y, z, rot? }`: the world point at
  the frame centre, the zoom (> 0) and a rotation in degrees. Between keys x, y and rot ease in-out cubic and the zoom
  moves in log space (constant-feeling speed). Before the first key the camera holds that key, frozen; after the last
  key it drifts (x ±6 px, y +0.05 px/f, zoom +0.12 %/f). Two equal keys in a row freeze it: make every hold a small
  push (z x1.03-1.08).
- `<World cam depth = 1>`: an SVG group in world units (1 unit = 1 px at z 1) that puts (cam.x, cam.y) at the screen
  centre (540, 960). On screen, without `rot`: `X = 540 + (x - cam.x) * z`, `Y = 960 + (y - cam.y) * z`. `depth` < 1
  makes a parallax layer (pans by `depth`, zooms by `z ** depth`; 0 = fixed to the screen). Each `World` is its own
  full-frame `<svg>`: stack several for parallax.
- `<Field top bottom stars = true haze grain = 0.05 cam>`: the screen-space backdrop, drawn first and outside `World`:
  a vertical gradient (default `GV.field`, #081D2C to #102348), three slowly drifting haze blobs (`haze` colours,
  default teal, #285FC3, coral), three star layers (34 stars each; parallax 0.12 / 0.35 / 0.6 of the camera pan, zoom
  ignored; 40 % of the near layer are 4-point sparkles), a vignette and `Grain`. Pass it the same `cam`.
- `<Grain amount = 0.05>`: overlay film grain, re-seeded 24 times a second. It is a full-frame SVG `feTurbulence`
  filter, rasterised on the CPU in headless Chrome (STATUS flags the cost); the sample sets `grain={0}` on every `Field`.

## Lit shapes
| component | meaning |
|---|---|
| `LitPath d fill light = 0.18 shade = 0.3 rim = true opacity = 1 off = 14 transform` | any SVG path lit from the top-left: the base fill, a shadow crescent where the shape shifted up-left by `off` px does not cover it (`shadowOf(fill, shade)`), and a 7 px highlight line inside the top-left edge (`lightOf(fill, light * 2.2)` at 55 %). `rim={false}` drops that line, and with it the only use of `light` |
| `LitCircle cx cy r` / `LitRect x y w h r = 24` | the same lighting on a circle (`off` = max(6, 0.16 r)) or on a rounded rect given by its top-left corner (`off` = max(6, 0.1 * min(w, h))); same `fill light shade rim opacity transform` props |
| `Glow cx cy r color core = GV.cream intensity = 1 pulse = 0` | emissive: a radial core (`core` -> `color` -> clear) plus four screen-blended halo rings at 1.23 / 1.48 / 1.76 / 2.1 r; `pulse` = radius wobble as a fraction (period ~52 f) |
| `Contact cx cy rx` | soft dark ellipse (ry = 0.22 rx, 28 %) under grounded things |

Helpers: `circlePath(cx, cy, r)` and `rrectPath(x, y, w, h, r)` return path strings (the radius is clamped to half a
side). `GV` is the palette: `field` [top, bottom], indigo, plum, cream, gold, tangerine, coral, teal, cyan, violet,
leaf, ocean, deep, white, navy, `skin` [5 tones]. `shadowOf(c, k = 0.3)` multiplies toward violet #6B5FD6,
`lightOf(c, k = 0.2)` screens toward warm #FFE7B0, `mixC(a, b, t)` mixes two colours. `noise(t, seed)` is smooth value
noise in -1..1 (`noise1` from `core/anim`) for drifts and flickers.

## Motion and text
| component | meaning |
|---|---|
| `usePop(at)` | hook: a damped spring 0 -> 1 from frame `at` (ζ 0.45, ~20 % overshoot, settled in ~20 f); 0 before |
| `Pop at x y out` | wraps children and scales them about the pivot (x, y) on `usePop`, stretching the overshoot 1.4x vertically; `out` shrinks them to 0 over 6 f |
| `RiseText at x y text size = 72 color = GV.white weight = 700 anchor = "middle" out fontName = "Fredoka" spacing = 4` | one line that rises 1.3x its size through a clip (14 f, ease-out quint); `y` is the baseline; a trailing full stop is dropped; `out` fades it over 7 f; no wrapping |
| `Callout at x y text to color = GV.cyan size = 46 out` | uppercase Fredoka 700 pill centred on (x, y) that pops in; `to` = [x, y] draws a 5 px leader over 10 f, ending in a dot; `out` fades it over 6 f |
| `BigNumber at x y to from = 0 dur = 24 prefix suffix size = 150 color = GV.gold decimals = 0` | pops and counts (ease-out cubic over `dur` f) in Space Grotesk 700 tabular figures; centred on `x`, baseline `y` |
| `Wave x y w amp wl = 160 speed = 0.12 color = GV.cyan width = 10 phase = 0 draw = 1 glow = true` | one travelling sine: left edge `x`, centre line `y`; width, amplitude and wavelength in px; `speed` in rad per frame (it moves toward +x); `draw` 0..1 reveals it left to right; `glow` adds a wide faint stroke under it |
| `Flow d n = 8 color = GV.gold speed = 6 r = 9 draw = 1` | glowing packets moving `speed` px per frame along any path over a faint dashed track; they loop; `draw` limits them to the first fraction of the path |
| `Shockwave at x y r = 300 color = GV.cream` | a ring that grows to 3 r over 30 f while it thins and fades |

## Characters
- `<Person spec x y face = "neutral" armL = 12 armR = 12 lean = 0 pop seed = 1 talk = false flip = false>`: an original
  capsule person standing at (x, y) = the feet. At `scale` 1 it is ~240 px tall: head centre at y - 191, head radius
  46, shoulders at y - 120, body 112 px wide (all times `scale`). Arms in degrees (0 = down, 90 = straight out, 180 =
  up, negative = across the body), `lean` in degrees about the feet, `pop` springs it in (overshoot stretched 1.3x),
  `talk` flaps the mouth every 4 frames, `flip` mirrors it. It bobs ±3 px (`Math.sin(f * 0.07 + seed) * 3`, not
  scaled): props fixed to the head need the same offset (the sample's headphones use it).
- `PersonSpec`: `shirt` (required), `skin` (default `GV.skin[seed % 5]`), `pants` (default `GV.navy`), `hair` (default
  #3a2a2a), `hairStyle` none|short|bun|long|curly, `scale`.
- `PersonFace`: neutral happy shock bored sad talk wince. All but shock and happy blink by themselves; "shock" = big
  whites and an O mouth, "happy" = arc eyes and a smile, "bored" = flat-line eyes, "talk" = a held-open mouth.
- `talk` is a boolean: drive it from the word clock, `talk={s.speaking(["b04"]).some((w) => s.f >= w.s && s.f < w.e)}`.
- `<Mascot x y look = [0, 0] pop scale = 1 color = GV.white mood = "calm">`: the series' original round robot, a 160 x
  150 px body around (x, y) (antenna up to y - 110, contact shadow at y + 150, at scale 1) hovering ±10 px; its visor
  eyes glow cyan (calm), coral (alarm) or gold (happy) and shift toward `look` (x and y each -1..1).

```tsx
// S01 / S07: the listener (HEAD = [540, 660], PK = 2.2) and headphones that follow his bob (seed 2)
const bob = Math.sin(f * 0.07 + 2) * 3;
<Person spec={{ ...LISTENER, scale: PK }} x={HEAD[0]} y={1080} face={face} seed={2} armL={10} armR={10} />
<HeadSet x={HEAD[0]} y={HEAD[1] + bob} k={PK} />
// S05: the mascot shrinks into a corner as the plane arrives
<Mascot x={lerp(540, 150, planeIn)} y={lerp(480, 250, planeIn)} scale={lerp(1.9, 0.8, planeIn)}
  mood={s.f >= catchAt && s.f < works ? "alarm" : s.f >= engine ? "happy" : "calm"}
  look={planeIn > 0.5 ? [0.9, 0.6] : [0, 1]} />
```

## Conventions (from the sample)
- One colour per idea for the whole film, as constants at the top (there: coral = outside noise, cyan = anti-noise,
  gold = a voice, white = what you hear).
- Every shot: `const cam = cam2d([...], s.f)`, then `<Field cam={cam} />` and `<World cam={cam}>`. First key at f -6
  (the incoming transition renders negative local frames), last key at `s.dur + 10`, a move or a transformation on
  every narration line. The hook shot's `variant` changes only its first key.
- Worlds may be wider than the frame: S03 lays microphone, chip, speaker and ear along x 96-1830 and pans along them.
- Text and callouts live inside `World` and zoom with it: check where they land with the formula above. Near the
  frame edge they get cut while the camera pans (STATUS noted S03's callouts).
- Waves of any shape: the sample's own `WaveLine` builds a path from a function `fn(x)` and tapers both ends to zero
  (sums of sines, an anti-phase copy `(x) => -fn(x)`, an amplitude that falls to a flat "silence" line).
- Caption preset: `clean` (Inter 800, phrase chunks), the scaffold default.

## Gotchas
- The colour math (`shadowOf`, `lightOf`, `mixC`, so every `Lit*` `fill`, `Person` `shirt` and `Mascot` `color`) parses
  6-digit `#RRGGBB` only: `#fff`, `rgb()`, names or alpha hex give wrong or black shading.
- Zoom must stay > 0 (`cam2d` interpolates its log).
- A `transform` rotation or mirror on a lit shape turns its light with it (`flip` puts a person's shadow at the
  bottom-left): rotate the path data instead when the key light must stay top-left.
- `font()` falls back to Montserrat for an unknown family: `fontName` must be a loaded one ("Fredoka", "Space Grotesk",
  "Nunito"...; list in `core/fonts.ts`).
- Kit doc comments promise more than the code: `Shockwave` draws no flash (add `<FlashFX at={...} />` from `core/fx2d`
  as an HTML sibling outside `World`), `Wave` has no inverted copy (use `phase={Math.PI}`), "curly" hair draws the
  short cut, and "wince" draws the same face as "sad".
- `Flow` `draw` hides packets only (the dashed track is always drawn in full); on an open path the packets jump from
  the end back to the start.
- `Callout` sizes its pill from the character count (0.62 em each + 60 px), not the real width: check long or wide
  (M, W) labels in stills. `RiseText` clips to `length * 0.7 em + 80` px.
- `BigNumber` and `Glow` have no `out` (stop rendering them); `Pop`, `Callout` and `RiseText` do.
- Captions own y 1100-1350 px: after the camera transform, keep faces, numbers and callouts out of it (STATUS flagged
  the S05 badge and the S06 chip close to it); TikTok's right rail is x > 900, y > 840.
