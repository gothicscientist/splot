<!-- Blockcraft (voxel, Minecraft-genre, original) style bible. Research compiled 2026-11-13/14 for Nomen Studio (art-styles study). Numbers are measured or cited; see the sources inside. -->

### 2.A Style A: "Blockworld" voxel animation (original, Minecraft-*genre*)

**Intent.** The cozy-cinematic blocky look of top Minecraft animation channels, rebuilt with 100% original characters, textures, UI and sounds. See section 3 for the deep dive and the legal fence.

**Palette (original, sRGB).** Every material gets a 4-step hue-shifted ramp. Highlights shift warm and toward yellow; shadows shift cool, toward blue or violet.

| Role | Hex |
|---|---|
| Day sky, top to horizon (fog = horizon) | `#5E9CFF` to `#BBD8FF` |
| Golden hour | sky `#F59E5B` to horizon `#FFD9A0`, shadow tint `#4B4F8F` |
| Night | sky `#0B1230` to `#1F2B5C`, moonlight `#A9C1FF`, torch `#FFB04A` (emissive) |
| Grass top (hi / mid / lo / deep) | `#8CC459` `#5FA83A` `#4C9131` `#3B7A28` |
| Dirt | `#A06C48` `#8A5A3B` `#74492F` `#5E3A25` |
| Stone | `#A6A9AE` `#8E9196` `#7A7D83` `#66696F` |
| Planks | `#CC9A62` `#B5834F` `#9C6D3E` `#7E5530` |
| Leaves | `#56A84B` `#3E8E3A` `#2F7330` |
| Sand | `#F0E4B4` `#E3D49B` `#D2C084` |
| Water | `#3B7BE0` at alpha .7, deep `#1D3F8F` |
| Hero skins (examples) | "Pip": hoodie `#FF6B57`, denim `#3D5A8C`, skin `#E8B48A`, hair `#3A2618`. "Moss": overalls `#6FAF5B`, shirt `#F2E6C9`, skin `#C98E62` |
| UI panel | `#1C1B22` at 85%, 1-texel bevel `#FFFFFF33` / `#00000066`; text `#FFFFFF` with a 1-text-pixel shadow `#2A2A2A` |

Never use these combinations:
- Cyan shirt + blue trousers + brown hair: that is Steve.
- Green shirt + brown trousers + orange braid: that is Alex.
- A green mottled four-legged body with a frowning face: that is the Creeper.
- Black, very tall, with purple eyes: that is the Enderman.

**Line / outline rules (1080x1920)**
- No geometric outlines. Form reads from face shading plus texture.
- Texture-level edges are allowed: plank seams and brick mortar 1 texel dark.
- Captions: 6-8 px black stroke (`paint-order: stroke`) or a hard drop shadow offset by one font-pixel.

**Texel density**
- 16 texels per block (1 block = 1 m) on every surface, and the same density on characters. A character texel is 1/16 block, scaled 0.9375 as in the genre, so a character is 1.875 m tall.
- Never mix 32x and 16x assets ("mixels"). Never scale a texture to add detail. This rule is from [Blockbench's Minecraft Style Guide](https://blockbench.net/wiki/guides/minecraft-style-guide/).

**Shading**
- *Vanilla look:* per-face multipliers of top 1.0, N/S 0.8, E/W 0.6, bottom 0.5, applied in display (sRGB) space, plus 4-level vertex AO (1.0 / 0.8 / 0.62 / 0.45). Unlit material. This is the authentic "it looks right" baseline.
- *Cinematic "shader pack" look* (what top channels render in Blender): directional sun with soft shadows, warm key `#FFE3B0`, blue-violet shadow tint, hemisphere fill (sky `#9EC3FF`, ground `#6B5A45`), bloom only on emissives (torches, lava, screens), light fog, and DOF on close-ups.
- Pick one look per video. Don't mix.

**Character design**
- **Box model, in texels:** head 8x8x8, torso 8x12x4, arms 4x12x4 (slim 3x12x4), legs 4x12x4, total 32 tall. Overlay shell for hair, hats and jackets: +0.5 texel per side on the head, +0.25 on torso and limbs.
- **Optional "house" variant** to add distance from the genre's default silhouette: 10x10x10 bobble-head, 8x10x4 torso, 4x10x4 limbs. It is cuter and gives more face texels.
- **Faces in pixel language**, on the 8x8 (or 10x10) front:
  - Eyes are 2x2 texels with a 1-texel white sclera; pupils shift ±1 texel to look around.
  - Brows are 2x1 bars that raise, lower or tilt by being redrawn on the texel grid.
  - The mouth is 2-4 texels and opens to a 2x2 dark box.
  - A blink is 3 frames: half, shut, half.
  - Use a separate face plane 0.01 block in front of the head so expressions swap without re-skinning.
- **Emotion = pose + face + pixel FX**:
  - Sad: head pitch -15°, arms hang, slow walk. Joy: arms up, small hops.
  - Shock: eyes become 3x3 whites with 1-texel pupils, plus a 4-frame camera kick.
  - Pixel icons: sweat square, anger "vein", hearts, "!".
- **Rigid boxes.** No squash and stretch on characters; it breaks the material. Exaggerate with rotation, timing and holds instead.

**Environment / props**
- Everything sits on the 1-block grid. Props are box assemblies: a table is a 16x2x16 top on 2x14x2 legs.
- Plants are crossed alpha-cutout planes. Held items are 16x16 sprites extruded 1 texel.
- Terrain is layered: 1 grass, 3-4 dirt, then stone. Trees have 4-6 trunk blocks and a leaf blob.
- Hide the far edge with fog at 24-48 blocks.
- Great explainer prop: the **cut-open ground block** (cross-section dioramas). It is the same visual hook as You Built It's 58.6M-view TikTok series, but in voxels.

**Typography (Google Fonts)**

| Font | Use |
|---|---|
| **Pixelify Sans** 600/700 | Captions, 84-110 px |
| **Jersey 10** | Titles |
| **Silkscreen** | HUD labels (keep sizes on its pixel grid, e.g. 48/64/80 px) |
| **VT323** | Terminal / code |

Never use the game's own font or a lookalike. Mojang's usage guidelines treat fonts and textures as part of the brand.

**Camera and motion**
- **Lens:** cinematic FOV 40-50° vertical. Use 70° only for POV "gameplay-feel" shots, matching the game's default FOV.
- **Distances** for a 1.875 m character at a 45° vertical FOV: full body ~3.0 m, medium ~1.5 m, close-up ~0.7 m.
- **Height:** eye level (1.6 m) by default; low angles for heroes.
- **Camera moves:** ease-in-out (cubic) dolly or orbit over 20-45 frames. Punch-in of 6-10% over 4-6 frames on punchlines. No handheld wobble.
- **Characters:** animated on ones at 30 fps. Limb timing per section 3.4: a walk cycle takes 16 frames at 30 fps (vanilla walk), legs swing ±1.2 rad (vanilla) or ±0.6-0.8 rad (cinematic), arms in opposite phase.
- **Overshoot** goes on objects, not bodies. A placed block scales 0 to 1.08 to 1 over 6 frames with a dust puff. A popped-up item bobs 0.1 block at a ~3 s period and spins 1 rad/s.
- **Holds:** let poses hold 8-15 frames on beats, but keep idle arm-bob and blinks running.

**Transitions**
- *Voxel wipe:* the frame fills with cubes popping on a diagonal, one column per frame, then empties onto the new scene.
- *Dig-through:* the camera drops through ground strata into the next location.
- *Time-lapse:* a sun/moon arc with sky-colour interpolation.
- *Whip pan* with motion blur.
- *Fade to black* for chapter breaks: 6-8 frames.

**Textures**
- 16x16 procedural tiles from seeded noise, quantised to the 4-step ramps.
- Use checker dithering sparingly. Avoid "pillow" and "banding" shading (Blockbench rules).
- Test every block on a 3x3 tiling check.
- Character skins are 64x64. Filtering is always nearest-neighbour.

**Lighting**
- The sun and moon are square discs.
- Time-of-day presets:
  - Day: key `#FFF4E0`, ambient 0.55.
  - Golden: key `#FFB070` at elevation 8°, ambient 0.4, purple shade.
  - Night: ambient 0.15 `#3A4A8A`.
- Torches flicker ±8% at 6-8 Hz, driven by deterministic noise.
- Light pools from windows and lava. Bloom threshold 1.0, emissives only.

**Particles / FX**
- *Square* particles only:
  - Block chips: 2-4 texel squares sampled from the block's own texture, ~0.1 block in size, falling with gravity, 6-20 frame life.
  - Smoke: grey squares `#CFCFCF` to `#7A7A7A` that shrink.
  - Others: sparkle squares, original pixel hearts (7x6), a "poof" ring of white squares, splash squares, dust on landing.
- **Hurt:** red tint `#FF3B3B` at 35% for 8 frames, 0.4-block knockback, 3° camera roll.
- **Mining:** a crack overlay in 10 stages (drawn by us), plus a swing every 9 frames.

**Sound palette (all original or synthesized)**
- **Footsteps** by material, from filtered noise bursts of 40-90 ms: grass 1-4 kHz soft, stone 1.5-5 kHz clicky, wood 200-600 Hz knock, sand low hiss.
- **Dig tick** every 0.3 s while mining. Place "thock". Pickup "pop": a sine sweep from 700 to 1400 Hz over 60 ms. Door creak, splash.
- **Creature voices** are pitched vocal grunts and whistles.
- **Music:** sparse lo-fi piano and pad (calm), or chiptune (comedy).
- Never use Mojang sounds or music, or "oof"-type game sounds.

**Pro vs cheap: top 10**
1. One texel density everywhere. Mixels are the #1 amateur tell.
2. Nearest filtering on textures, but MSAA on geometry edges, and no shimmering on far terrain (see 4.2 on mips and fog).
3. Directional face shading plus vertex AO. Flat-lit cubes look like a tech demo.
4. Correct pivots (shoulder and hip at the top of the limb), and limb swing locked to ground speed, so no foot-skating.
5. Faces that act: pupils look, brows move, 3-frame blinks. Static faces scream "asset flip".
6. A cinematic lens (40-50°, low angles, DOF on close-ups) instead of the game's first-person camera.
7. Lighting design with golden hour, torch pools, fog depth and emissive bloom.
8. Hue-shifted, restricted palettes. No straight value ramps, no brush noise.
9. Grid logic: things snap into place, break into square chips, and items bob.
10. Foley per material plus a warm, sparse score. No ear-rape meme sounds and no borrowed game SFX.

**References to emulate.** Emulate the craft only. All of these use Mojang IP, which we must not.

| Channel | Signal | Video to study |
|---|---|---|
| Dangoheart Animation | latest-30 Shorts median 5.1M; emotional micro-stories | ["Enderman takes a nap"](https://www.youtube.com/shorts/HfzFoj276_0) 57M; ["Stay with me in the dark"](https://www.youtube.com/watch?v=-yEjkCtnWWg) 1.49M |
| BlobbyClips | median 8.85M; relatable skits | ["Crafting Circles"](https://www.youtube.com/shorts/TKv74nlJCXs) 47M; ["What … Wolves Are Like!"](https://www.youtube.com/shorts/7hfCF2SKG_c) 35M |
| SosonyaCraft | median 9.9M; brainrot meme stories | ["Ballerina Cappuccina is Zombie"](https://www.youtube.com/shorts/TCuDayja1Ao) 120M |
| PRINCE PLYZ | story and versus formats | ["He Sacrificed Everything / Iron Golem Story"](https://www.youtube.com/shorts/FIa9XWWecO8) 48.7M; ["Villager vs Pillager"](https://www.youtube.com/shorts/hFwQtcqUW68) 9.7M |
| toonz CRAFT | median 3.5M | ["Shortest Sad Story…"](https://www.youtube.com/shorts/_Hsua9qDXsw) 71.1M (4 s!) |
| pamtri | comedic summary | ["… In A Nutshell"](https://www.youtube.com/watch?v=_wbzPFyWHi8) 57.2M |
| Alan Becker | stick figures inside a block world | ["Creeper Clan – Animation vs. … Ep 40"](https://www.youtube.com/watch?v=FcQlQAs5EDM) 26.5M |
| You Built It (TikTok; per [@theoardley](https://x.com/theoardley/status/2116684286837330374)) | 48 TikToks, 58.6M views since Oct 11, 2026 | Cut-open ground "what if" builds: the voxel-friendly *explainer* format |

---


## 3. Minecraft-style deep dive (what makes it "look right"), plus the legal fence

### 3.1 Character box model, in texels (1 texel = 1/16 block before model scale)

| Part | Box w x h x d | Pivot (y up from the soles) | Overlay shell |
|---|---|---|---|
| Head | 8 x 8 x 8 | neck at y = 24, centred | "hat" layer, +0.5 per side (9 x 9 x 9) |
| Torso | 8 x 12 x 4 | spans y 12-24 | "jacket", +0.25 per side |
| Arms | 4 x 12 x 4 (slim / "Alex-type" 3 x 12 x 4) | shoulder at x = ±5, y = 22 (2 below the torso top). The box spans 2 above to 10 below the pivot and sits 1 texel outside the torso | sleeves, +0.25 |
| Legs | 4 x 12 x 4 | hip at x = ±1.9, y = 12. The box hangs 12 down from the hip | pants, +0.25 |

- **Height:** 32 texels in total. The game draws the model at 0.9375 scale, so it is **1.875 m tall**, with a 1.8 x 0.6 m hitbox and **eye height 1.62 m** ([Minecraft Wiki: Player](https://minecraft.wiki/w/Player)).
- **Speeds:** walk 4.317 blocks/s, sprint 5.612, sneak 1.295. Jump height is about 1.25 blocks.
- **Skin:** a **64 x 64 PNG** (legacy 64 x 32; Bedrock also 128 x 128). The inner layer is forced opaque. The outer layer is 0.5 px larger on body and limbs and 1 px larger on the head ([Minecraft Wiki: Skin](https://minecraft.wiki/w/Skin)).
- **Box-UV layout** for a box (w, h, d) at atlas offset (u, v):
  - top (u+d, v), size w x d; bottom (u+d+w, v), w x d
  - right (u, v+d), d x h; front (u+d, v+d), w x h
  - left (u+d+w, v+d), d x h; back (u+2d+w, v+d), w x h
- **Standard offsets:**
  - head (0,0), hat (32,0)
  - right leg (0,16), torso (16,16), right arm (40,16)
  - right pants (0,32), jacket (16,32), right sleeve (40,32)
  - left leg (16,48), left arm (32,48), left pants (0,48), left sleeve (48,48)
- The layout is a technical convention (Luanti/Minetest uses the same). **Only our own skin art goes into it.**

### 3.2 Block textures, filtering and shading

- **Resolution:** 16 x 16 texels per face; 1 block = 16 texels = 1 m, so 1 texel = 6.25 cm. Recognisability beats strict scale ([Blockbench Minecraft Style Guide](https://blockbench.net/wiki/guides/minecraft-style-guide/)).
- **Filtering:** nearest-neighbour, always. Far terrain needs per-tile mips, or a texture array plus `NearestMipmapLinear`, or fog, or it shimmers (section 4.2).
- **Directional face shade:** top 1.0, north/south 0.8, east/west 0.6, bottom 0.5. Community-documented (e.g. [Veyra PR](https://github.com/glebKovshov/Veyra/pull/135)); shader mods disable it unless `oldLighting`. It applies *before* light level and is not gamma-correct, so bake it in sRGB space (section 4.2).
- **Smooth lighting:** per-vertex AO darkening in inner corners, plus light levels 0-15 (a torch is about 14). Night ambient is low and blue.
- **Texture craft (Blockbench guide):**
  - Restricted, hue-shifted ramps: start with the midtone, add one shadow and one highlight, then more shades.
  - Light from the top-left on items.
  - Avoid "pillow" and "pancake" shading, banding, jaggies, brush noise and over-dithering.
  - Check tiling on a 3x3 wall.
  - Entity tops and fronts are brighter than bottoms and backs.

### 3.3 Animation conventions

**Vanilla math** (decompiled `HumanoidModel.setupAnim`, widely reproduced in mod code, e.g. [MCreator thread](https://mcreator.net/forum/59260/give-human-entity-alphaclassic-walking-animation) and [Mekanism model](https://github.com/mekanism/Mekanism/blob/1.18.x/src/additions/java/mekanism/additions/client/model/ModelBabyCreeper.java)). Time is in game ticks, 20/s.

- **Walk.** `pos += speed` per tick, with `speed = min(4 x blocks moved per tick, 1)`.
  - Formulas: legs `xRot = cos(pos·0.6662)·1.4·speed`, with the other leg at +π. Arms `xRot = cos(pos·0.6662 + π)·1.0·speed`, in opposite phase to the legs.
  - At walking speed (speed ≈ 0.86): legs **±1.21 rad (±69°)**, arms ±0.86 rad (±49°). One cycle is 10.9 ticks = **0.55 s = 16.4 frames at 30 fps** (about 8 frames per step).
  - Sprint: legs ±80°, cycle 0.47 s = 14 frames.
- **Idle sway.** `arm.zRot += cos(t·0.09)·0.05 + 0.05` and `arm.xRot += sin(t·0.067)·0.05`. That is about ±3° of drift with 3.5 s and 4.7 s periods, and it never stops.
- **Head look.** The head yaws and pitches to the target. The body yaw lags and catches up once the head exceeds about 50-75°.
- **Mining / attack swing.** Each swing is 6 ticks = **0.3 s = 9 frames at 30 fps**, repeating while digging (about 3.3 swings/s). With p the swing progress from 0 to 1:
  - `f = 1-(1-p)^4`
  - `arm.xRot -= sin(f·π)·1.2 + sin(p·π)·(0.7 - headPitch)·0.75`
  - `arm.zRot -= 0.4·sin(p·π)`
  - `body.yRot = 0.2·sin(√p·2π)`
  - The crack overlay runs through 10 stages.
- **Sneak.** Body pitches 0.5 rad. **Dropped items** bob `0.1·sin(age/10 + k) + 0.1` blocks (about 3.1 s period) and spin `age/20` rad (about 1 rad/s).

**Cinematic conventions** (top Blender / Mine-imator channels)
- Bendy two-segment limbs: elbows and knees up to about 90°.
- Walk cycles of 16-24 frames, with **softer swings of legs ±30-45° and arms ±25-35°**, body bob 0.5-1 texel and head counter-rotation.
- Face rigs: pupils, eyelids, brows and mouths.
- Anticipation and overshoot on gestures, then holds.
- DOF and motion blur. The vanilla ±69° stiff swing reads as "game"; the softer cycle reads as "film".

### 3.4 Camera framing
- Vertical 9:16, subject centred in the upper-middle third.
- **Cinematic FOV 40-50° vertical.** The game's default is 70°; keep that for POV jokes.
- Eye level is 1.62 m. Heroes get a low angle.
- Distances at a 45° FOV: full shot about 3 m, medium about 1.5 m, close-up about 0.7 m.
- Slow orbits and dollies, over-the-shoulder shots, DOF on close-ups.

### 3.5 Sky, fog, lighting, time of day
- A day is 24,000 ticks = 20 min. The sky is a gradient with **fog colour = horizon colour**, an orange or pink band at sunrise and sunset, square sun and moon (8 moon phases), and square stars.
- Clouds are a flat layer of 12 x 12-block cells, about 4 blocks thick, high above the terrain.
- Vanilla plains reference values (data-driven per biome; do **not** copy them, use the Style A palette): sky `#78A7FF`, fog `#C0D8FF`, water `#3F76E4`.
- The "shader-pack" film look: warm sun, blue shadows, god rays, emissive bloom, waving leaves (±2° at about 0.5 Hz), light fog.

### 3.6 Particles
- Camera-facing axis-aligned **squares**, never round:
  - Block chips are 4 x 4-texel sub-regions of the block's own texture.
  - Smoke is grey squares that shrink.
  - Others: crit stars and hearts as pixel icons, splash squares, an explosion as a flash plus white-grey cube puffs.
- Lifetimes 0.2-1 s, with gravity.

### 3.7 UI conventions and fonts
- Players read UI by its pixel font, 9-slice bevelled panels, hotbar, hearts, chat lines and toasts.
- **Make our own:** a pixel panel with 1-texel bevels and our own icons.
- **Fonts (Google Fonts):** Pixelify Sans, Silkscreen, Jersey 10, VT323, Press Start 2P (wider, NES-like), Tiny5, Micro 5, Sixtyfour, Workbench, Handjet, DotGothic16.
- Never use the in-game font or a lookalike. It is part of the "brand" in Mojang's definition.

### 3.8 Sound conventions
- **Genre:** per-material footsteps, dig ticks, place thunks, item "pop", hurt grunt, cave ambience, and a calm sparse piano score.
- **Ours:** all synthesized or original (section 2.A). No game SFX, no C418-style lookalike melodies, no "oof".

### 3.9 Most popular Minecraft-style short formats now (YouTube, latest-30 Shorts panel and searches, 2026-11-13)

| Format | Evidence | Original, legal-safe equivalent for us |
|---|---|---|
| Brainrot meme stories | SosonyaCraft median 9.9M; ["Ballerina Cappuccina is Zombie"](https://www.youtube.com/shorts/TCuDayja1Ao) 120M; ["END of 67 Meme Story"](https://www.youtube.com/shorts/Umh1xF_MA0c) 83M | Our own absurd blockfolk characters (the memes are third-party IP) |
| Relatable gamer skits | BlobbyClips median 8.85M; ["Crafting Circles"](https://www.youtube.com/shorts/TKv74nlJCXs) 47M; ["…YouTubers Be Like"](https://www.youtube.com/shorts/epC5_oIAZNU) 37.4M | "When you…" blocky skits about the *viewer's* problem. This is the app-marketing hook |
| Emotional creature micro-stories | Dangoheart median 5.1M; ["Enderman takes a nap"](https://www.youtube.com/shorts/HfzFoj276_0) 57M; PRINCE PLYZ ["He Sacrificed Everything"](https://www.youtube.com/shorts/FIa9XWWecO8) 48.7M | Original creatures with their own silhouettes |
| Ultra-short sad gag | toonz CRAFT ["Shortest Sad Story…"](https://www.youtube.com/shorts/_Hsua9qDXsw) 71.1M (4 s) | 4-8 s loopable gags |
| Versus / "who will win" / build battles | ["Villager vs Pillager"](https://www.youtube.com/shorts/hFwQtcqUW68) 9.7M; Squared Media build battle 962K | "Noob vs Pro vs Master" builds with our own blocks |
| "In a nutshell" comedy summaries | pamtri ["…In A Nutshell"](https://www.youtube.com/watch?v=_wbzPFyWHi8) 57.2M | "X in a nutshell" voxel explainers |
| Cut-open ground "what if" (not Minecraft) | You Built It: 48 TikToks, 58.6M views since Oct 11 ([@theoardley](https://x.com/theoardley/status/2116684286837330374)) | Voxel cross-section explainers (geology, wells, subways, "dig straight down") |

Context: A Minecraft Movie (Apr 2025) grossed about **$960M** worldwide ([The Numbers](https://www.the-numbers.com/movie/Minecraft-Movie-A-(2025))), which helped keep the blocky look mainstream through 2025-26.

### 3.10 LEGAL: what to avoid, what is safe

**What Mojang's [Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines) say:**
- **"Brand"** means "any names, related logos, fonts, textures, and any other distinctive characteristics". **"Assets"** means code, graphics, textures, models, sounds, and videos or screenshots of the games.
- Sharing anything is "commercial use", even when free.
- Companies, brands, agencies "and individual artists" may **not** "use Minecraft gameplay to promote or market products… unrelated to Minecraft" without written approval. Our app-marketing shorts must contain **zero** Minecraft assets.
- **Naming:** the name may appear only as a *secondary* title, only to describe a creation honestly. "Don't use our name as keywords or search tags for products that have no relationship with them." Our videos are not Minecraft, so don't use "Minecraft" in titles, thumbnails, tags or hashtags.
- Required disclaimer whenever you do reference it: "NOT AN OFFICIAL MINECRAFT [PRODUCT]. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT."
- Their own example of what is not okay: "A box that features Steve's face in the Minecraft textures but with green eyes". A small recolour of a character is still infringing.
- **Enforcement precedent:** in Feb 2026 Microsoft DMCA'd the voxel game *Allumeria* off Steam, citing a side-by-side screenshot and Minecraft-like textures and UI. It was withdrawn the same day ([Notebookcheck](https://www.notebookcheck.net/Microsoft-issues-DMCA-takedown-of-Minecraft-like-Steam-game-raising-copyright-debate.1223656.0.html); [PC Gamer](https://www.pcgamer.com/games/survival-crafting/i-genuinely-do-not-know-what-to-do-says-developer-of-minecraft-like-allumeria-after-microsoft-issues-a-dmca-takedown-forcing-it-off-steam/)). Lookalikes can attract claims even when the claims don't hold.

**Avoid:**
- The word "Minecraft"; logos, or stone-textured title lettering.
- Any Mojang texture, skin, model, sound, music or font, and the in-game UI (hotbar, hearts, hunger, XP bar, crafting grid, advancement toast, the chat format).
- Characters and mobs and their lookalikes: Steve, Alex, Creeper, Enderman, Iron Golem, Villager, Pillager, Ender Dragon, Wither, Allay. Also community or third-party characters: Herobrine, Verity (ThatMob), JJ & Mikey (Maizen), Italian-brainrot characters.
- Signature items: cyan diamond tools, the red TNT block, creeper heads, the purple swirl portal in an obsidian frame, the crafting-table top.

**Safe:**
- Generic voxel worlds and box-humanoids; the genre includes MagicaVoxel, Crossy Road, Cube World, Luanti and Vintage Story.
- Procedurally generated original textures and palettes, original faces and outfits.
- Our own UI, pixel fonts from Google Fonts, synthesized sound.
- Describe videos as "blocky", "voxel" or "cube world".
- Keep seeds and source files as provenance.
- Note YouTube's July 2025 rename of "repetitious" to **"inauthentic content"** (mass-produced, near-identical videos are demonetisable): vary the stories, don't just reskin a template ([YouTube Help](https://support.google.com/youtube/answer/1311392?hl=en)).

---


### 4.1 Style A (voxel) in R3F
- **Geometry.** One merged `BufferGeometry` per 16^3 chunk with hidden-face culling. Skip greedy meshing (it breaks per-texel atlas UVs) unless you use texture arrays with repeat. Shorts-scale scenes stay under about 1M triangles.
- **Textures.** Generate 16x16 tiles procedurally on a Canvas2D from seeded ramps into a 256 x 256 atlas:
  ```ts
  const tex = new THREE.CanvasTexture(atlas);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace;
  ```
  For far terrain without shimmer, either:
  - supply manual per-tile mips (`tex.mipmaps = [...]`, each tile downsampled on its own) with `NearestMipmapLinearFilter`, or
  - use a `DataArrayTexture` with one layer per tile, or
  - keep the far plane inside fog at 24-48 blocks.
- **Face shade plus AO, baked into vertex colours in sRGB space.** The vanilla look is not gamma-correct, so a linear 0.6 would look too bright:
  ```ts
  const SHADE = { up: 1.0, down: 0.5, north: 0.8, south: 0.8, east: 0.6, west: 0.6 };
  const AO = [0.45, 0.62, 0.8, 1.0]; // 0fps vertex AO: ao = (s1 && s2) ? 0 : 3 - (s1 + s2 + corner)
  color.setRGB(v, v, v, THREE.SRGBColorSpace); // v = SHADE[face] * AO[ao]; three converts to linear
  ```
  Split each quad along the diagonal that joins the corner pair with the larger AO sum (0fps rule) to avoid anisotropic seams.
- **Materials.**
  - Vanilla: `MeshBasicMaterial({ map, vertexColors: true })` plus `scene.fog = new THREE.Fog(horizon, 24, 64)`. The sky dome is a `ShaderMaterial` (top-to-horizon mix by direction y) with `fog: false`.
  - Cinematic: `MeshLambertMaterial` or `MeshStandardMaterial` with the same vertex colours, a `DirectionalLight` with `castShadow` (2048-4096 map, PCFSoft), a `HemisphereLight`, and bloom on emissives only.
- **Characters.** A `Group` per part, positioned at the section 3.1 pivots, with boxes UV-mapped by the box-UV formula onto our 64 x 64 skin. Overlay boxes inflated by +0.5 / +0.25 texel with `alphaTest: 0.5`. The face is a separate plane offset 0.01 block, using a CanvasTexture expression atlas (swap the UV offset per frame; don't redraw).
- **Limb pose from the frame:**
  ```ts
  export const limbPose = (frame: number, fps: number, speed = 0.86) => {
    const t = (frame / fps) * 20;                 // game ticks
    const ph = t * speed * 0.6662;                // integrate speed over frames if it varies
    const bob = Math.sin(t * 0.067) * 0.05;
    return {
      legR: Math.cos(ph) * 1.4 * speed, legL: Math.cos(ph + Math.PI) * 1.4 * speed,
      armR: Math.cos(ph + Math.PI) * speed + bob, armL: Math.cos(ph) * speed - bob,
      armZ: Math.cos(t * 0.09) * 0.05 + 0.05,       // +armZ right, -armZ left
    };
  };
  ```
  Use about 0.5x amplitude for the "cinematic" cycle.
- **Particles.** An `InstancedMesh` of camera-facing quads with a per-instance UV offset into the block texture. Positions are analytic (`p0 + v·t + ½·g·t²`), seeded by `random('chip-'+i)`. No physics simulation.
- **Post.** `<EffectComposer multisampling={4}>` with bloom (mipmapBlur, threshold 1.0) and an optional custom DOF. If you use SSAO such as N8AO, disable temporal accumulation and noise.

