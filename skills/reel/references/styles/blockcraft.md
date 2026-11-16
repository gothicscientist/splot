# Blockcraft kit: original voxel world and box-model cast

The cozy look of the blocky voxel-game genre, rebuilt from scratch: procedural 16x16 pixel blocks meshed into one unlit
draw call with baked face shading (top 1.0, N-S 0.8, E-W 0.6, bottom 0.5, applied in sRGB) and vertex ambient
occlusion; box-model characters with pixel faces; a square sun, a flat cloud layer and an original pixel UI. Look
values: `blockcraft-bible.md`. Sample (read it before writing a new one): `src/videos/deepest-hole/index.tsx`.

**Legal fence.** An original style in the genre: no Mojang/Microsoft assets (textures, skins, models, sounds, music,
fonts, UI), no lookalike characters, and never the word "Minecraft" in titles, tags or hashtags (say "blocky",
"voxel"). Full list: `blockcraft-bible.md` §3.10.

## Imports
```tsx
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";                        // canvas, camera rig, post chain
import { orbit } from "../../core/three/camera";                       // orbit(target, yawDeg, pitchDeg, dist) -> pos
import type { CamKey } from "../../core/three/camera";
import { Rain, Burst3D } from "../../core/three/particles";            // snow, sparks, confetti, gems...
import { clamp, invLerp, keys as kf, countUp } from "../../core/anim";  // kf(s.f, [[frame, value], ...]) for readouts
import { VoxelWorld, Block, Voxels } from "../../styles/blockcraft/VoxelWorld";
import type { VoxelLight } from "../../styles/blockcraft/VoxelWorld";
import { Blocky, BCAST, BPOSES, PixelItem, ITEM_KINDS, walkB, runB, mineB } from "../../styles/blockcraft/Blocky";
import type { BlockySpec, BlockyPose, BlockyFace, BlockyProps } from "../../styles/blockcraft/Blocky";
import { SquareSun, CloudLayer, PixelTag, PixelGauge, PixelToast, PixelThermo } from "../../styles/blockcraft/Sky";
import { BLOCK_TYPES, TRANSPARENT, EMISSIVE, getAtlas, faceUV, tileTexture } from "../../styles/blockcraft/blocks";
import type { BlockType } from "../../styles/blockcraft/blocks";
```

## A shot
Abridged from `deepest-hole` S01 ("What if you dug straight down and never stopped?").
```tsx
const PIP: BlockySpec = BCAST.hero;                                     // module level: textures build once
const shaftLight: VoxelLight = (_x, y) => (y > -0.01 ? 1 : Math.max(0.12, Math.exp(y / 7)));  // shaft fades to dark
const meadow = (v: Voxels) => {
  v.terrain({ x0: -26, x1: 26, z0: -40, z1: -13, base: 0, amp: 2.4, seed: 5, minY: -4, ores: false }); // hills behind
  v.terrain({ x0: -26, x1: 26, z0: -12, z1: 12, base: -1, flat: true, minY: -4, ores: false });        // floor at y = 0
  v.tree(-5, 0, -4, 5).tree(6, 0, -7, 6);
  v.house(-11, 0, -9, 6, 5, 4);
  // ...a deep rock column under the dig site, then the 2x2 shaft carved out of it (the 4 lid cells stay empty)
  for (let y = -45; y <= -1; y++) for (const x of [0, 1]) for (const z of [1, 2]) v.set(x, y, z, null);
};

const S01: React.FC = () => {
  const s = useShot();
  const dug = s.hit("dug");                                             // 2 frames before the word
  const down = s.hit("down");
  return (
    <AbsoluteFill>
      <Stage look="day" ink={false} fog={[45, 300]}                     // voxels never take ink; fog hides the edge
        cam={[
          { f: 0, pos: [3.1, 1.75, 6.4], look: [1, 0.75, 1.2], fov: 40, creep: 0.004 },
          { f: down + 12, pos: [1, 5.2, 2.6], look: [1, -20, 1.95], fov: 52, ease: "glide", dur: 14, creep: 0.002 },
        ]}
        kicks={[dug + 1, dug + 13]} dof={(f) => (f < down ? 5 : 0)} focus={[1, 1, 0.4]}>
        <VoxelWorld build={meadow} light={shaftLight} />
        <SquareSun position={[40, 70, -110]} size={16} />
        <CloudLayer y={36} />
        <Block type="grass" at={[0, -1, 1]}                             // one of the 4 lid cells (staggered breakAt)
          breakAt={dug} />
        <Blocky spec={PIP} at={[1, 0, 0.3]}                             // feet on the top face of the y = -1 blocks
          poses={[[0, "lookDown"]]}
          faces={[[0, "determined"], [dug + 13, "shocked"]]}
          mining={[-20, dug + 14]} />
      </Stage>
      <PixelTag at={3} out={down + 4} text="DIG STRAIGHT DOWN?" x={540} y={300} size={56} color="#ffe14d" />
    </AbsoluteFill>
  );
};
```
The hook shot reads `variant` (0..2) and changes only its first camera key. All `at` / `out` / key frames are
shot-local (`s.hit(...)`).

## World: `<VoxelWorld>` and `Voxels`
Units: 1 block = 1 m, +y up. Block `(x, y, z)` (integers) fills `[x, x+1] x [y, y+1] x [z, z+1]`, so a surface block
at y = -1 puts the floor at y = 0, where characters stand. Fronts face +z (house door and windows, cut-away faces):
put the camera on +z looking toward -z.

| prop | meaning |
|---|---|
| `build` | `(v: Voxels) => void` fills the world; runs once per `deps` change, then the mesh is static |
| `deps` | default `[]` = built once per mount. Re-mesh only on discrete steps, e.g. `deps={[cut]}` with `cut = Math.floor(bitY - 0.6)` (S03: one re-mesh per drilled block, never per frame) |
| `light` | `VoxelLight` = `(x, y, z) => number \| [r, g, b]`: a LINEAR multiplier per vertex (integer corner coords) on top of the baked shade and AO, e.g. darker and warmer with depth. Skipped on emissive blocks; read together with `build`, so it cannot animate |
| `position` | offsets the whole world (m) |

One draw call holds the opaque blocks (leaves are alpha-cut in it), a second one glass, water and ice. Hidden faces
are culled: a face survives next to air or a different transparent block, so the ground shows under water.

| `Voxels` method (all chain except `get`, `top`) | meaning |
|---|---|
| `set(x, y, z, t)` / `get(x, y, z)` | place one block (`null` = air) / read it (`undefined` = air) |
| `box(x0, y0, z0, x1, y1, z1, t, hollow = false)` | inclusive cuboid; `hollow` = a closed shell (floor and ceiling too); `null` carves |
| `terrain({ x0, x1, z0, z1, base = 0, amp = 2, freq = 0.12, minY = -8, top = "grass", seed = 1, ores = true, flat = false })` | columns from bedrock at `minY` up to `base` (`flat`) or rolling about `base` by up to ~`amp`: the `top` block, 2 dirt (sand under sand), then stone; `ores` adds coal 3.5 %, iron 1.5 %, gold in the 5 and gem in the 3 layers above bedrock, and deepstone in those bottom 3 layers |
| `tree(x, y, z, h = 5, log = "log", leaves = "leaves")` | trunk from `y` (the ground's top face) up `h` blocks and a 5x5 diamond canopy up to `y + h + 1`; never overwrites blocks |
| `house(x, y, z, w = 7, d = 6, h = 4, wall = "planks", roof = "darkPlanks")` | hollow shell (its floor is layer `y`), a 1x2 door at `x + 1` and two glass panes in the +z wall, stepped roof with a 1-block overhang |
| `shaft(x, z, y0, y1, r = 0)` | carves a (2r+1)² column from `y1` (bottom) up to `y0` (top); nothing happens if `y0 < y1` |
| `sphere(cx, cy, cz, R, t)` | ball around a cell; `null` carves a cave |
| `planet(R, layers, cut = true, surface?)` | ball of radius R centred on the origin; `layers` = `[radiusFraction, block][]`, outermost first (the first `r > R * frac` wins); `cut` removes the +x +y +z octant to show the inside; `surface(x, y, z)` may return a crust block |
| `top(x, z, from = 64, to = -64)` | y of the top face of the highest block in that column (where a character stands); counts water, leaves and glass; 0 for an empty column |
| `m`, `key(x, y, z)` | the raw `Map<"x,y,z", BlockType>` |

```tsx
// S06: a cut-open planet; the top of the ball is y = R, where Pip stands
v.planet(R, [[0.93, "stone"], [0.56, "magma"], [0.27, "lava"], [0, "glow"]], true, (x, y, z) => {
  const n = Math.sin(x * 0.45 + 1) + Math.cos(z * 0.5 + y * 0.35) + Math.sin(y * 0.6 + x * 0.2);
  if (Math.abs(y) > R - 3) return "snow";                                // polar caps
  return n > 0.35 ? "grass" : n > 0.1 ? "sand" : "water";
});

// S03: a cross-section, lit darker and warmer with depth; the open half of the shaft sits in shadow
const cutLight = (depth: number, d0 = 0) => (x: number, y: number, z: number): [number, number, number] => {
  const d = clamp(d0 + -y / depth);
  let k = 1 - 0.3 * d;
  if (z < 0.5 && x > -0.01 && x < 1.01 && y < 0.99) k *= 0.38;
  return [k * (1 + 0.36 * d), k * (1 + 0.06 * d), k * (1 - 0.18 * d)];
};
<VoxelWorld deps={[cut]} light={cutLight(62)} build={(v) => {
  for (let x = -9; x <= 9; x++) for (let y = -62; y <= 0; y++) for (const z of [-1, 0]) v.set(x, y, z, rockAt(x, y, z, "snow"));
  for (let y = Math.max(-62, cut); y <= 0; y++) v.set(0, y, 0, null); // front half only: the back wall stays
}} />
```

## Blocks (`blocks.ts`)
`BlockType` (43, original procedural textures): grass dirt stone cobble deepstone bedrock sand sandstone gravel clay
path | log planks darkPlanks leaves bookshelf | glass water ice | lava magma glow | brick obsidian snow quartz |
coalOre ironOre goldOre gemOre redOre goldBlock gemBlock ironBlock tnt | wool_white wool_red wool_blue wool_yellow
wool_green wool_black wool_orange wool_purple. Grass, snow and path have their own top over dirt sides, log shows
rings on top, bookshelf a planks top. `BLOCK_TYPES` lists them all (handy for a test wall).
- `TRANSPARENT` = glass, water, ice (blended second mesh, no depth write) and leaves (alpha-cut, drawn with the opaques).
- `EMISSIVE` = lava, magma, glow: vertex colour x2.6 so they bloom (Stage bloom threshold 1.0); no AO, `light` or `tint`.
- `getAtlas()` is the shared nearest-filtered atlas texture; `faceUV(type, face)` its UV rect (`0` top, `1` side,
  `2` bottom); `tileTexture(tileName)` one 16x16 tile as its own texture (UI, sprites). It takes TILE names
  ("grass_top", "grass_side", "log_top", "log_side", "sandstone_top", "snow_side", "tnt_side"; single-texture blocks use
  their own name): "grass", "log", "sandstone" and "tnt" silently give stone. It builds a new texture per call:
  `useMemo` it.

## Animated blocks: `<Block>`
| prop | meaning |
|---|---|
| `type`, `at` | block type and cell (min corner, same integers as `v.set`) |
| `pop` | pops in (0 -> overshoot -> 1 over 6 f); hidden before |
| `breakAt` | cracks over the 18 f before (shrinks 6 %, jitters), then bursts into 14 mini-blocks of its own texture, gone 24 f later |
| `fallFrom` | drops from 6 m above `at` under gravity (9.8 m/s²) from this frame and lands ~33 f later; before that frame it hangs 6 m up, visible |
| `size`, `wobble` | uniform scale (default 1) about the cell centre (`at` + 0.5), so a small block needs its `at` offset to rest on something; amplitude of a soft sag-and-bulge with the bottom kept in place |
| `tint` | `[r, g, b]` linear multiplier that matches it to a world shaded with `light` (ignored on emissive types) |

Each `<Block>` is its own mesh with no neighbour culling, AO or `light`: use it only for cells that move and leave
those cells empty in the world (the S01 lid, the S05 soft rock). A block slightly over 1 m and nudged forward covers a
world block in the same cell without z-fighting (the S04 magma).
```tsx
<Block type={head} at={[x, -0.2, z]} size={0.2} />   // S01 flower head: a 0.2 m cube at 0.2-0.4 m on a thin stem
<Block type={d % 8 === 0 ? "lava" : "magma"} at={[x, y, 0.02]} pop={wrong + d} size={1.03} />            // S04
<Block type={i % 3 === 2 ? "magma" : "deepstone"} at={[x, y, 0]} wobble={0.2 * soft * (0.7 + (i % 3) * 0.2)}
  tint={DEEP_TINT} />                                // S05: rock "acting like plastic"; DEEP_TINT = cutLight at d = 1
```

## Characters: `<Blocky>`
An original box-model figure (head 8x8x8, torso 8x12x4, limbs 4x12x4 texels; 1 texel = 5.625 cm): 1.8 m tall,
0.9 m across the arms, hips at 0.675 m, shoulders ~1.24 m, neck 1.35 m, eyes ~1.55 m. Unlit, shaded like the world.

| prop | meaning |
|---|---|
| `spec` | `BlockySpec` or a `BCAST.*` preset; keep it a module-level constant (every texture is rebuilt when the object changes) |
| `at` / `path` | feet on the top face of the block below, or `[[frame, [x, y, z]], ...]`: between keys it moves on a smootherstep ease with a planted walk cycle (one stride per 1.1 m) and faces the way it goes |
| `yaw` | facing in degrees: 0 = toward +z (the camera), + turns toward +x |
| `poses` | `[[frame, name \| BlockyPose], ...]`, blended over 6 f with a small overshoot (default idle) |
| `faces` | `[[frame, BlockyFace], ...]`, switched instantly (default neutral); blinks are automatic |
| `item` | `[[frame, kind \| null], ...]`: a pixel item in the +x hand (`armR`) |
| `mining` | `[from, to]` frames: arms and head take a 9-frame chop loop (legs keep the pose) |
| `talking` | `s.speaking(["b04"])`: the mouth opens on alternate 3-frame steps inside each word (not while "shocked") |
| `run` | every `path` segment uses the run cycle (1.6 m per stride, 8° forward lean) |
| `scale`, `pop`, `shadow` | overall scale (default 1); pop-in frame (7 f overshoot); blob shadow of radius 0.34 m (default on) |

`BlockySpec`: `skin`, `hair`, `hairStyle` short|long|bald|spiky|bob|buzz, `eyes` (iris), `shirt`, `shirtAccent`,
`shirtStyle` tee (short sleeves)|hoodie|jacket|armor|robe|lab|suit, `pants`, `shoes`, `hat`
`{ kind: cap|helmet|crown|hardhat|hood|band, color }`, `beard` (colour), `emblem` (colour of a chest square), `seed`.
Colours are CSS hex. `BlockyProps` is the prop type.

`BCAST` presets: hero ("Pip": coral hoodie, denim, spiky hair; deliberately not the genre's default-skin colours),
heroine, miner, scientist, king, knight, villager, kid, suit. **Keep one recurring lead per channel**, and never restyle
a preset toward a genre character (the bible's §3.10 list).

`BPOSES`: idle wave point pointUp armsUp hold holdOne think shrug sit scared celebrate facepalm crouch look lookUp
lookDown. A custom `BlockyPose` is `{ armL, armR: [pitch, roll], legL, legR: pitch, head?: [yaw, pitch], bob?, lean?,
crouch? }` in degrees: arm pitch 0 = down, -90 = straight forward, -180 = up, roll + = outward; leg pitch -90 =
straight forward (sit); head yaw + = toward +x, pitch + = down; `bob` in m, `lean` degrees forward, `crouch` = the
fraction of the 0.675 m leg the body drops (sit 0.37). `armL` / `legL` are on -x (screen left when facing the camera).
Cycles: `walkB(phase, k = 1)` (legs ±34°·k, arms opposite), `runB(phase)` (±62°), `mineB(f)` (the 9-frame chop);
`poses={[[0, walkB(s.f / 16)]]}` walks on the spot (after the 6-frame blend).

Faces (`BlockyFace`): neutral happy shocked angry sad smug scared wink determined sleep talk ("determined" = angry
brows on a neutral face, "smug" = lopsided smile, "talk" = open mouth).

Items (`ITEM_KINDS`): pickaxe sword torch gem apple ingot book plate map. `<PixelItem kind position rotation size = 0.5
spin = 0 />` stands one in the world: the 16x16 art spans `size` m, centred on `position`, one texel thick, turning
`0.05 * spin` rad per frame (spin 0.67 = the genre's 1 rad/s).
```tsx
<PixelItem kind="plate" position={[PLATE_X, plateY, HOLE[2]]} rotation={[-Math.PI / 2, 0, 0]} size={0.29} />  // S02: flat
<Blocky spec={SCI_B} at={[3.5, 0, 0.7]} yaw={-14}                                                             // S02
  poses={[[0, "lookUp"], [real, "celebrate"], [real + 30, "idle"]]} faces={[[0, "neutral"], [real, "happy"]]} />
```

## Sky (3D, inside `<Stage>`) and pixel UI (screen, outside it)
- `<SquareSun position size = 14 moon = false />`: an unfogged HDR square that blooms (`moon`: cooler and dimmer). It is
  a plane facing +z, so park it far behind the set (S01: `[40, 70, -110]`) for a camera on +z.
- `<CloudLayer y = 38 extent = 160 cell = 6 seed = 2 speed = 0.02 night = false />`: translucent 6 x 2 x 6 m cloud cells
  over ±`extent` m at height `y`, drifting +x by `speed` m per shot-local frame; `night` tints them blue-grey.

Pixel UI: px at 1080x1920, `x` / `y` = the element's CENTRE, Silkscreen 400 throughout, white pixel border.

| component | meaning |
|---|---|
| `PixelTag at out text x y color = "#ffffff" bg = "rgba(20,18,26,0.82)" size = 60` | boxed label with a hard drop shadow; pops in over 6 f, shrinks out over 5 f after `out` |
| `PixelGauge at out label value x = 540 y = 330 unit = "" decimals = 0 size = 64 color = "#9ee05a"` | `LABEL 12,262 m` readout of the `value` you pass each frame (count it with `kf` / `countUp`); `unit` is glued on, so include the space (`" m"`); `color` is the label's |
| `PixelToast at out title sub icon = "★" x = 540 y = 360 scale = 1` | original "goal reached" toast: slides down 120 px into place over 8 f, shrinks out over 6 f after `out`; title and sub are one line each (no wrap) |
| `PixelThermo at out fill value x = 800 y = 560 unit = "°C"` | 10-segment tube (green, yellow, red) lit to `fill` 0..1 beside the rounded reading (no thousands separator); above 0.8 it shakes and the number turns red |

```tsx
<PixelGauge at={went} label="DEPTH" value={Math.round(depth)} unit=" m" y={320} size={64} />  // depth = kf(s.f, [...])
<PixelToast at={deepest} title="New record!" sub="Deepest hole ever dug" icon="#1" y={560} scale={1.15} />
<PixelThermo at={rock - 2} x={770} y={520} fill={invLerp(20, 180, temp)} value={temp} />
```

## Stage and framing (from the sample)
- Always `ink={false}`: the style has no geometric outlines, and voxel meshes are unlit basic materials without normals.
- Voxels, characters and items ignore the look's lights and the sun's shadows (`<Blocky>` brings its own blob);
  `look` picks the sky dome, fog and grade ("day" meadow, "overcast" tundra, "night" underground and space). Fog does
  tint them: `fog={[45, 300]}` keeps a set crisp and hides the world's edge; the underground shots (S04, S05) pass
  `sky={false} fog={null}` inside an `AbsoluteFill` with a dark `background`; the space shot (S06) keeps the night sky,
  sets `fog={null}` and adds its own square stars on layer 3 (`NOINK`).
- Camera keys are the shared rig (`stickworld.md`): `{ f, pos, look, fov, ease: "glide" | "burst" | "cut" | "linear",
  dur, creep }`, or a function `(f) => ({ pos, look, fov, roll })` with `creep` to follow a moving subject (S03 rides
  the drill bit down). FOV 36-58 in the sample (70 only for the dive down the shaft); framing distances: bible §3.4.
- Cross-sections ("cut-open ground"): a slab two blocks deep (z -1 and 0), the hole carved only in the front layer so
  the back wall stays, the open half shaded with `light` so it reads as a hole, not a window, the camera square-on.
- Underground worlds are schematic (a block is not a metre there); every number on screen is the sourced one.
- Small things stay small: full wool blocks as flowers read as random red boxes next to the hero in a low angle, so
  the sample builds 0.2 m flower heads on thin stems.
- Space: `orbit(target, yaw, pitch, dist)` for camera positions; Pip at `scale={1.25}` on the planet's top (y = R).
- Particles: `Rain kind="snow" at={-150}` (already falling on frame 0); a spark stream from `Burst3D` re-keyed every 6 f
  (`at={Math.floor(s.f / 6) * 6}`, `seed={Math.floor(s.f / 6)}`); `Burst3D kind="confetti"` on the record.
- Captions own y 1100-1350 px: keep faces above them; the sample keeps pixel UI at y 250-560.

## Gotchas
- Fonts: the pixel UI is Silkscreen 400. Pixelify Sans is out (its capital C reads as an O) and Silkscreen 700 merges W
  into a blob ("WAS WRONG" read badly). Voxel videos caption with the `chunky` preset (Lilita One 400, 104 px, dark
  outline 11, hard shadow, keyword #FFE14D): `new-video.mjs` scaffolds it and `deepest-hole` sets
  `"captions": { "preset": "chunky" }` in script.json. `pixel` (now Silkscreen 400) is the less legible fallback.
- Silkscreen is wide. Sizes that fit the 1080 px frame in the sample: PixelTag 56-112 px for 4-18 characters
  (56 for "DIG STRAIGHT DOWN?", 110 for "1970"), PixelGauge 50 px for "TO THE CENTER 6,371 km" and 64-80 px for shorter
  readouts, PixelToast `scale={1.15}` for a 21-character sub. Nothing wraps: shorten the text or lower `size` / `scale`.
- `build`, `light` and every value they close over are frozen until `deps` changes. List those values in `deps`, but
  never the raw frame: each change re-meshes the whole world (old buffers are disposed), which is slow per frame.
  Step it (e.g. `deps={[cut]}` with an integer depth), as `deepest-hole` s03 does.
- A `spec` object created during render (`spec={{ ... }}`) rebuilds all of that figure's textures every frame.
- Unknown names fail silently: a pose falls back to idle, an item to the pickaxe, a tile to stone.
- `path`: a stationary segment (two keys at one spot) turns the figure to face +z, and after the last key it snaps back
  to `yaw` with no turn: set `yaw` to the final heading. Heading changes between segments are instant too.
- While `talking`, the open-mouth steps use the plain `talk` face (neutral brows and eyes), so an angry, sad or happy
  face flickers on every word: keep dialogue on neutral faces or accept it. Head materials are cached per figure and
  face key, so expression changes no longer allocate (or leak) textures.
- `Block fallFrom` hangs visible 6 m up until it falls; `Voxels.top` returns 0 for an empty column; `shaft` wants
  `y0 >= y1`.
- Rolling terrain under a character makes it float or sink: use `flat: true` under characters, or build the same
  function into your own `new Voxels()` (in a `useMemo`) and stand them at `world.top(x, z)`.
- Glass, water and ice are one blended mesh with no per-face sorting: don't stack them in view.
- `light` and `tint` values above ~1 can push bright textures past the bloom threshold, and they glow.
- `SquareSun` does not turn to the camera; hats are flat-coloured (helmet and hardhat look the same).
- Legal: the bible lists cyan diamond tools and the red TNT block among signature items to avoid. The kit's `pickaxe`
  is steel grey (it used to be cyan). `tnt` is still a red block with a white band: keep it out of thumbnails, titles
  and hero shots (item colours are not a prop; recolouring is a kit change).
