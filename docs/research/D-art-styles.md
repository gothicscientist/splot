# D. Art styles for code-rendered viral vertical shorts: evidence, picks, style bibles, Minecraft deep dive, Remotion notes

*Research date: 2026-11-13. Scope: faceless, AI-made or code-made animated Shorts, Reels and TikToks, 2025 to Nov 2026. Output target: Remotion (React + SVG/Canvas/CSS + React Three Fiber via `@remotion/three`), 1080x1920, no paid image or video generation.*

---

## 0. TL;DR

**Recommended extra styles:**

1. **Style C: "Glow-lit flat-vector explainer"** (Kurzgesagt-*like*, fully original). This is the strongest explainer look that code can render at studio quality. Kurzgesagt's latest 30 Shorts have a median of **1.35M views**, and The Infographics Show's latest 30 have a median of **346K**. In Oct and Nov 2026, the most-bookmarked code-made video prompts on X were in this style: @finnardley's Kurzgesagt-style prompt had 262K views and 5.3K bookmarks, and motion_so used a "kurzgesagt-style explainer" as its benchmark brief across 48 test renders. It also covers app marketing through a built-in *kinetic-type / UI-motion* sub-mode. The @twoclipping UI-morph reel prompt had 1.19M views and 21K bookmarks.
2. **Style D: "Map & data infographic"** (history, geography, numbers). Map timelapses are still among the biggest long-form history videos of the last 12 months: Cottereau's "The History of Europe: Every Year" has **33.9M views** and Ollie Bye's "History of the World: Every Year" has **13.9M**. Map Shorts channels have median views around **300-340K** (History on Maps; GBuri countryballs), with 1-1.7M tops. 3D data comparisons reach 58M (Real Data). `/map-route` and `/graph` are two of the six "viral reel formats" shipped as Claude Code skills in Nov 2026. Accurate maps and charts are also something generative video still gets wrong, while code gets them exactly right.

**Runner-up:** *hand-drawn doodle / minimal line-art* (Casually Explained's latest Shorts median is 224K). It is very feasible to build, but it overlaps C and B in use, and the market reads it as "template whiteboard".

**Not recommended as standalone styles:**
- **3D Pixar / Ghibli / claymation.** These are generative-AI driven and can't reach quality in code.
- **Zack D. Films-style CGI.** Huge reach (6.4M median), but it needs Blender-grade modeling and rigging. The R3F pipeline of styles A and B can do the light "what-if cross-section" variant.
- **Pixel art.** Overlaps A.
- **Paper cut-out, low-poly isometric, motion comic.** Low demand in the data.
- **Crude 2D storytime.** Popular, but it is personality-driven and overlaps B, so treat it as B's "flat background" mode.
- **Kinetic typography.** Make it a shared layer used by all four styles, not a style of its own.

**Most important rules per style:** see sections 2.A-2.D. The one-line versions:
- **A (voxel):** one texel density (16 px/block), nearest filtering, baked face shading 1.0/0.8/0.6/0.5 plus vertex AO, rigid box limbs on correct pivots, and nothing that resembles Mojang IP.
- **B (toon world + flat cast):** characters lit by the scene with contact shadows, ~3 px constant-width world ink applied before the DOF, a 3.5-head-height bean cast with thin ink limbs, and a camera that never fully stops.
- **C (flat vector):** no outlines, one light direction (highlight, shadow, rim), dark field with 5-6 saturated hues, damped-spring pops, nothing still for more than ~0.6-2 s, and 4-6% grain.
- **D (map & data):** real projections and public-domain data, van Wijk smooth zooms, focus colour against a dimmed context, screen-constant line widths, a big tabular-numeral date counter stepping on the beat.

---

## 1. Popularity evidence (2025 to Nov 2026)

### 1.1 Method and caveats
- **YouTube sweep.** I ran 69 style queries x 3 variants: relevance, "This year" upload filter, and "This year + under 4 min". That is 207 searches of 40 results each, using `yt-dlp --flat-playlist --dump-json`, metadata only, run 2026-11-13. A second sweep of 26 Shorts-phrased queries kept only videos of 180 s or less.
  - Search results are noisy: kids' channels and brand ads leak into every bucket. The **count of results with 1M+ views under the "This year" filter** is the most robust cross-style signal. Medians in filtered mode are dragged down by brand-new 0-view uploads.
- **Channel-level panel.** I took the latest 30 Shorts from 50 representative channels (Shorts-tab flat metadata). YouTube rounds Shorts-tab counts (e.g. "1.6M"). Upload dates could not be fetched: YouTube now demands sign-in for per-video metadata and rate-limited the watch pages, and I did not log in. "Latest 30 Shorts" is therefore the recency window.
- **X / GitHub.** Tweets came via `api.fxtwitter.com`, with view, like and bookmark counts. X Articles were read through their fxtwitter JSON.
- **TikTok.** yt-dlp's TikTok tag extractor is marked broken ("No working app info"). TikTok numbers below are second-hand: creator write-ups that quote on-platform counts.
- **Vendor blogs** (OpusClip, Anijam and others) were read but given low weight, because they sell tools and rarely cite data.

### 1.2 YouTube search sweep (unique results per style bucket)

| Style bucket (queries) | Relevance: median views | Relevance: >=1M / n | **"This year": >=1M / n** | "This year + <4 min": >=1M / n |
|---|---|---|---|---|
| Minecraft-style animation (5) | 3.95M | 93 / 140 | **70 / 140** | 35 / 58 |
| Crude 2D comedy / history (4) | 1.02M | 70 / 139 | 17 / 101 | 2 / 47 |
| Map & infographic / data (6) | 795K | 77 / 161 | 17 / 155 | 0 / 68 |
| 3D "what-if" explainer, Zack D style (3) | 554K | 32 / 67 | 13 / 28 | 2 / 9 |
| Size-comparison 3D (2) | 2.35M | 42 / 68 | 12 / 72 | 5 / 78 |
| Whiteboard / doodle (4) | 165K | 39 / 125 | 27 / 148 * | 27 / 146 * |
| Flat-vector explainer (5) | 42K | 32 / 122 | 26 / 152 * | 25 / 140 * |
| Stick figure (5) | 164K | 26 / 102 | 16 / 151 | 14 / 127 |
| Claymation (3) | 2.54M | 45 / 74 | 10 / 83 | 7 / 54 |
| Ghibli / anime AI (2) | 479K | 16 / 50 | 17 / 48 | 1 / 4 |
| Pixar-like 3D AI (3) | 51K | 18 / 107 | 8 / 86 | 9 / 115 |
| Motion comic / manga (4) | 331K | 28 / 134 | 6 / 117 | 5 / 24 |
| Pixel art (3) | 167K | 33 / 104 | 5 / 94 | 16 / 82 |
| Kinetic typography / motion graphics (5) | 86K | 11 / 173 | 1 / 177 | 3 / 157 |
| Paper cut-out / collage (4) | 35K | 6 / 139 | 1 / 151 | 6 / 141 |
| Low-poly / isometric (3) | 6K | 4 / 103 | 1 / 110 | 0 / 76 |
| Rubber-hose (1) | 17K | 2 / 38 | 0 / 39 | 0 / 13 |

\* These buckets are heavily contaminated by hand-drawn *animator* skits (e.g. "The Living Artcade", RefCantDraw, Bunaye) and by kids' content. The true "doodle explainer" and "flat-vector explainer" hit counts are lower. The channel panel below gives a cleaner signal.

Shorts-only sweep (videos of 180 s or less, uploaded this year): **Minecraft-style animation had 55 results, median 2.6M, with 36 at 1M or more.** Every other category's "this year" Shorts list was dominated by unrelated kids' content, so no reliable median could be computed for them.

### 1.3 Channel panel: median of the latest 30 Shorts (2026-11-13)

| Style | Channel | Median | Max (title, views) |
|---|---|---|---|
| Minecraft-style | [SosonyaCraft](https://www.youtube.com/@SosonyaCraft) | **9.9M** | "Ballerina Cappuccina is Zombie - Minecraft Animation Story Meme Brainrot" 120M |
| Minecraft-style | [BlobbyClips](https://www.youtube.com/@BlobbyClips) | **8.85M** | "Crafting Circles in Minecraft!" 47M |
| Minecraft-style | [Dangoheart Animation](https://www.youtube.com/@DangoheartAnimation) | **5.1M** | "Enderman takes a nap" 57M |
| Minecraft-style | [toonz CRAFT](https://www.youtube.com/@toonzcraft) | 3.5M | "Verity brought Diamonds and... La Peace!" 35M |
| Minecraft-style | [Rainimator](https://www.youtube.com/@Rainimator) | 890K | "Love triangle" 4.5M |
| Minecraft-style | [PRINCE PLYZ](https://www.youtube.com/@PRINCE_PLYZ) | 498K | "He Sacrificed Everything / Iron Golem Story" 48M |
| 3D CGI explainer | [Zack D. Films](https://www.youtube.com/@zackdfilms) | **6.4M** | "How To Build A Matchbox Camera" 14M |
| Stick figure | [Alan Becker](https://www.youtube.com/@alanbecker) | **16.5M** | "Yellow's Speedrun - An Actual Short" 38M |
| Crude 2D storytime | [TheOdd1sOut](https://www.youtube.com/@theodd1sout) | 4.05M | "Urns For True Love" 41M |
| Crude 2D storytime | [Let Me Explain Studios](https://www.youtube.com/@LetMeExplainStudios) | 4.0M | "Accidentally made a VIRAL MEME" 11M |
| **Flat-vector explainer** | [Kurzgesagt](https://www.youtube.com/@kurzgesagt) | **1.35M** | "The Deadliest Thing in Your Kitchen" 5.3M |
| **Flat-vector explainer** | [The Infographics Show](https://www.youtube.com/@TheInfographicsShow) | 346K | "What Happens When You Are Shot" 2.9M |
| Flat-vector explainer | [TED-Ed](https://www.youtube.com/@TEDEd) | 128K | "Would you take the road less traveled?" 561K |
| Flat 2D kids explainer | [AumSum](https://www.youtube.com/@AumSum) | 94K | "The Day Earth Disappeared!" 11M |
| **Map** | [History on Maps](https://www.youtube.com/@HistoryonMaps) | **338K** | "Barbarossa to Berlin Every Day (1941-1945) in 1 minute using Maps" 1.7M |
| **Map (countryballs)** | [GBuri](https://www.youtube.com/@GBuri_P) | 313K | "The Last Dance - The German Reunification" 1.4M |
| Data / size comparison | [Global Data](https://www.youtube.com/@globaldata1) | 92K | "Distance Between Earth and the Moon 3d Animation" 205K |
| Doodle explainer | [Casually Explained](https://www.youtube.com/@CasuallyExplained) | 224K | "I'm sorry, I thought this was Latin America" 5.3M |
| Doodle comedy | [Doodland](https://www.youtube.com/@Doodland_) / [Goodland](https://www.youtube.com/@goodlandshort) | 56K / 42K | 184K / 162K |
| Hand-drawn animator skits | [The Living Artcade](https://www.youtube.com/@Made-of-lines) | 3.9M | 35M (character skits, not explainers) |
| Claymation | [Guldies](https://www.youtube.com/@Guldies) / [jaytheclay](https://www.youtube.com/@clayartisanjay9) | 452K / 224K | "CLAY BOY COMPILATION!!!" 50M / 8.2M |
| Pixel art | [Gatekid3](https://www.youtube.com/@Gatekid3) / [Insert Prompt](https://www.youtube.com/@InsertPrompt) | 176K / 27K | 1.8M / 455K (Insert Prompt also has a one-off 19.5M) |

Long-form map timelapses returned under the "This year" filter:
- [Cottereau, "The History of Europe: Every Year"](https://www.youtube.com/watch?v=UY9P0QSxlnI): 33.9M
- [Ollie Bye, "The History of the World: Every Year"](https://www.youtube.com/watch?v=-6Wu0Q7x5D0): 13.9M
- [Real Data, "Tallest statue size comparison 3d animation"](https://www.youtube.com/watch?v=YEPJDkZRdJU): 58.3M (111 s)

### 1.4 Code-made / AI-made community signals (X and GitHub, 2026)

| Date | Post | Reach | What it tells us |
|---|---|---|---|
| 2026-01-20 | [@Remotion "Agent Skills"](https://x.com/Remotion/status/2013626968386765291) | 18.9M views, 38K bookmarks | Code-made motion graphics went mainstream with Claude Code |
| 2026-09-24 | [@twoclipping UI motion-design prompt](https://x.com/twoclipping/status/2103273003555402193) | 1.19M views, **21.2K bookmarks** | One shape morphing through UI states is the most-saved free video prompt. App-marketing gold |
| 2026-09-25 | [@stephanlivera motion-graphics showreel](https://x.com/stephanlivera/status/2103315922098470926) | 2.32M views | Kinetic type / motion design impresses builders |
| 2026-10-24 | [@kelanoo](https://x.com/kelanoo/status/2114000213656702984) | 54K views, 1.7K bookmarks | Claim: a new YouTube channel made of Claude motion graphics got 7M views and 50K subs in 30 days |
| 2026-10-25 | [@finnardley Kurzgesagt-style prompt](https://x.com/finnardley/status/2114305886420086817) | 262K views, **5.3K bookmarks** | Strong demand for the flat-vector explainer look. Its spec is reused in section 2.C |
| 2026-11-01 | [@theoardley "viral videos with Claude Code" article](https://x.com/theoardley/status/2116684286837330374) | 517K views, 5K bookmarks | You Built It's 3D cut-open "what if" yard: **58.6M views over 48 TikToks since Oct 11**. Stickman survival stories: itsquarkboi "GRIDLOCK Day 1" 1.7M (TikTok), drawn.tosurvive "10th Floor Pt 1" 1.7M (IG). Lecture explainer reels: ByteByteGo 1.99M |
| 2026-11-02 | [@RoundtableSpace on mromidev/claude-animated-shorts](https://x.com/RoundtableSpace/status/2117236532482396349) | 72.7K views | "2D characters in a 3D world" skill. ~2.2K GitHub stars in week 1 ([explainx](https://explainx.ai/blog/claude-animated-shorts-remotion-threejs-agent-skill-github-trending-guide-2026)) |
| 2026-11-03 | [@RoundtableSpace "6 viral reel formats"](https://x.com/RoundtableSpace/status/2117583820426019134) | 70.4K views | Formats: zach-d-films 3D, stick-figure, **map-route**, breakdown, **graph**, minimalistic line art ([repo](https://github.com/artemnovitckii/claude-animation-skills)) |
| 2026-11-03 | [@motion_so "48 AI videos, 7 tools"](https://x.com/motion_so/status/2117733412362686521) | 40.5K views | Kurzgesagt-style explainer used as the benchmark brief. Harness rules: dead time 10% or less, no unplanned still over 0.6 s, no "yo-yo" camera |
| 2026-11-10 | [@theoardley](https://x.com/theoardley/status/2120124748159996152) | 12.4K views | Claim: a Zack D. Films 3D Short reached 255M views |
| 2026-11-13 | [@PeefTwt MotionLab](https://x.com/PeefTwt/status/2121240962374533413) | 13.3K views, 377 bookmarks | Style B as an app-marketing engine. Claim: "$700+ in one day, 100% organic". Advice: make the video about the user's problem, not the app |

Trend write-ups, weighted low:
- **[OpusClip, "17 viral AI video styles of 2026"](https://www.opus.pro/blog/viral-ai-video-styles-2026) (May 2026).** The animation looks it lists are claymation, Pixar-style, Ghibli and anime hybrids. All are generative-AI looks.
- **[Anijam YouTube Shorts trends](https://www.anijam.ai/blog/youtube-shorts-trends/) (refreshed Nov 2026).** Meme animation and song animatics are "the fastest-moving category". The same page claims explainer Shorts of 50-60 s reach "up to 76% watch-through" (vendor claim).

### 1.5 Scoring: popularity x feasibility in code at high quality x fit

Each dimension is scored 1-5. **Fit** means fit with explainer, story, history, how-it-works and app-marketing content.

| Style | Pop. | Feas. | Fit | Score | Verdict |
|---|---|---|---|---|---|
| A. Minecraft-style voxel *(decided)* | 5 | 4 | 4 | 80 | Biggest animated niche on Shorts. Legal care needed |
| B. 3D toon world + flat 2D cast *(decided)* | 4 | 4 | 5 | 80 | Proven app-marketing engine |
| **C. Flat-vector explainer (Kurzgesagt-like)** | 4 | 5 | 5 | **100** | **Pick #1** |
| **D. Map & data infographic** | 3.5 | 5 | 4 | **70** | **Pick #2.** Unique "accurate" moat over generative video |
| Doodle / whiteboard / minimal line art | 3 | 5 | 4 | 60 | Runner-up. Mini-bible in section 2.E |
| Crude 2D storytime / Oversimplified-style | 5 | 4 | 3 | 60 | Writing- and voice-driven, overlaps B. Use it as B's flat-background mode |
| Zack D. Films-style 3D CGI | 5 | 2 | 5 | 50 | Needs modeled and rigged assets. Only the "cut-open diorama" variant fits A/B |
| Kinetic type / UI motion | 3 | 5 | 3 | 45 | Fold into C as a sub-mode and a shared caption layer |
| Pixel art 2D | 2.5 | 5 | 3 | 37 | Overlaps A |
| Paper cut-out / collage | 1.5 | 4 | 4 | 24 | Little demand in 2025-26 data |
| Claymation | 3 | 2.5 | 3 | 22 | The viral clay is mostly real or AI. Code clay reads as "plastic" |
| Pixar-like 3D / Ghibli | 4 / 3.5 | 1 | 3 / 2 | 12 / 7 | Requires generative AI. Excluded |
| Low-poly isometric | 1 | 4 | 3 | 12 | Low demand |
| Motion comic / manga | 2 | 2 | 2 | 8 | Needs drawn art |

**Why C and D, and not the runner-ups:**
- C is the canonical explainer and how-it-works look. Kurzgesagt is still the top performer among faceless explainer Shorts channels. C is native to SVG/React (Remotion's sweet spot) and can absorb the kinetic-type / UI-motion demand for app marketing.
- D brings a capability none of the other three has, cartography and data viz, for the "history" and "how big / how many" topics. Its long-form demand is proven at 10-60M views. It is also exactly where AI video generators fail (hallucinated borders and numbers), so code-made accuracy is a real moat.
- Doodle and crude-2D are good, but too close to B, or to C used for the same explainer topics.

---

## 2. Style bibles

### 2.0 Shared rules for all four styles

**Format**
- 1080x1920 master, 30 fps. 60 fps is optional for C and D, which are cheap 2D. MotionLab outputs 60 fps; the measured style-B reference channel is 30 fps.
- Optionally export 1440x2560 for YouTube (`--scale 1.3333`) to get a better re-encode.
- H.264, CRF 16-18, yuv420p.

**Audio**
- -14 LUFS integrated, about -1.5 dBTP.
- Voice first. Music bed about 8-10 LU under the voice, SFX about 10-14 LU under. These are measured on the style-B reference and on mromi's cue sheet.

**Safe area**
- Keep faces, key props and text inside x 64-940 and y 220-1480.
- The right 140 px holds TikTok/Reels buttons. The bottom 420 px holds the caption/description UI.
- If you use word-captions, place them at 58-66% of the frame height. Never put them over a face.

**Hook**
- The visual event and the spoken paradox land together within 0-1.5 s.
- No logo intro.
- The voice starts at frames 1-4 (measured on the style-B reference).

**Literal illustration**
- Every sentence gets its own picture.
- Visual reactions land 0-3 frames *before* their word.

**Dead-time budget**
- No more than 10% of frames frozen. No unplanned still longer than 0.6 s (motion_so harness).
- Every hold creeps: a 0.15-0.35%/frame push-in, or idle secondary motion.

**Camera lint (motion_so)**
- Ban "yo-yo" moves: pushing in and straight back out.
- Ban landing where you started.
- Prefer one motivated move per beat.

**QA**
- Contact sheet of every beat.
- Black, white and frozen frame detection.
- Loudness check.
- Safe-area overlay.

**Kinetic-type layer, shared by all styles**
- 1-3 words per card, slammed in on the beat.
- Numbers count up with tabular numerals.
- Text rises through a clip mask on ease-out-quint. Never fade a whole sentence in.

---

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

### 2.B Style B: "Toon world + flat cast" (MotionLab look)

The full bible for this style is omitted here because the coordinator already holds an MIT repo that covers it ([mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts), `references/STYLE_BIBLE.md` and `references/reports/*.md`). The key measured numbers are:
- 3.5-head-height bean cast; plum ink `#241726` at about 5% of head width, with a thick/thin ratio of about 3:1.
- Limbs are single ink strokes about 0.055 W wide.
- World ink is about 3 px, constant screen width, applied before the DOF.
- Characters are lit by the scene and get contact shadows.
- The camera holds still only about 10% of the time, and every hold creeps 0.15-0.35%/frame.
- Moves are symmetric ease-in-out glides of about 23 frames.
- Characters animate on ones, with no line boil.
- No grain.
- Narration runs at 3.7 words/s, mixed to -14 LUFS.

---

### 2.C Style C (PICK #1): "Glow-lit flat-vector explainer" (Kurzgesagt-*like*, fully original)

**Intent.** Dark, saturated vector worlds lit by one consistent key light, with glowing emissives, constant gentle motion, and scale jumps (cell, then body, then planet). Use it for science, how-it-works, "what if" and app-marketing explainers. Everything is SVG or Canvas, so it is cheap to render and crisp at any size.

**Palette (sRGB).** The dark field below is the one in @finnardley's 5.3K-bookmark prompt.

| Role | Hex |
|---|---|
| Night field, top to bottom | `#081D2C` to `#102348` |
| Alternative fields | indigo `#1B1446`, plum `#2B1B4F`, day sky `#7FD3F7` to `#E9F7FF` |
| Haze / nebula blobs (huge, soft) | teal `#1896A0` at 20%, blue `#285FC3` at 16%, coral `#DC5F6E` at 10%, indigo `#3C46AF` at 15% |
| Warm accents | cream `#FFF7DC`, gold `#FFC857`, tangerine `#FF8F4A`, coral `#FF5E6C` |
| Cool accents | teal `#2EC4B6`, cyan glow `#8FD8E6`, violet `#7A5CFF` |
| Nature | leaf `#5FC47A`, forest `#48AD6B`, desert `#F5C75F`, ocean `#4DC7EB` to `#1A66B8`, ice `#F1F8FF` |
| Neutrals | white `#F3F7FB`, dark navy `#0A1C2C` (for dark *parts*, never outlines), caption pill `rgba(6,20,40,.62)` |

- Use 5-6 hues per video plus neutrals.
- **Shadows** multiply 25-35% toward blue-violet `#6B5FD6`. **Highlights** screen 15-25% of `#FFE7B0`. Never mix the base colour with black or white.

**Line rules (1080x1920)**
- **No outlines.** The reference prompt bans them explicitly. Shapes separate by value contrast: at least ~15% luma difference between neighbours.
- Detail lines *inside* shapes are 2-3 px, in a darker tone of the fill, never black.
- UI-mode icons may use 6-8 px round-cap strokes.
- Minimum feature size is 6 px.

**Shading**
- **3-tone flat:**
  - Base.
  - Shadow shape offset toward the bottom-right, 15-25% darker.
  - Highlight shape toward the top-left, 10-18% lighter.
  - Plus a 2-4 px rim light on the key side.
- Large surfaces get 2-stop linear gradients with a value change of 12% or less.
- **Emissives** (suns, screens, magic): radial gradient core plus additive halo rings at 1.23, 1.48, 1.76 and 2.1x the radius.
- **Spheres:** day/night is `smoothstep(-.12, .24, N·L)`, with a coral band on the terminator and a cyan rim.
- **Contact shadow:** a soft dark ellipse (alpha about .25) under grounded objects.
- **Depth:** far layers lerp 20-40% toward the field colour, with an optional 2-6 px blur.

**Character design (original "capsule people")**
- **Body:**
  - Head is a circle: no ears, no nose.
  - Body is a rounded trapezoid or capsule, 1.6-2.2 head-heights.
  - Limbs are tapered rounded paths with mitten hands.
- **Faces:**
  - Vertical-oval dot eyes about 0.09 x 0.13 head width.
  - White sclera only for strong emotion: shock = big whites with small pupils, happy = ∩ arcs, bored = half-lids.
  - Mouth is a small arc or none. Brows are short bars.
- **Emotion** also comes from pose (lean, arms) and symbols: sweat drop, sparkles, "!".
- **Motion:**
  - Squash and stretch on pops: scaleY .9 to 1.08 to 1.
  - Idle bob 2-4 px as a 0.3-0.5 Hz sine. Blink every 2-4 s, lasting 3 frames.
- **One original mascot per series**, for example an astronaut or robot about 180 px tall at 1080 wide, built from rounded rectangles, with a visor and glowing eyes that look at "whatever matters".
- **Never** use Kurzgesagt's birds, duck or dog, their music, or their logo.

**Environment / props**
- Iconic, geometric construction with consistent corner radii (12 / 24 / 48 px).
- Scale-jump worlds.
- Infographic elements: callouts with leader lines, rounded pills, live counters, thermometers, dotted orbits, dashed tangents.

**Typography (Google Fonts)**
- **Fredoka** 600/700 only, as in the reference spec. Captions in caps with +3-6 px tracking, 64-90 px, in rounded pills of `rgba(6,20,40,.62)`, coloured teal `#8FD8E6`, gold `#FFD98A` or white.
- **Space Grotesk** 600/700 for numbers and UI. Always use tabular numerals.
- Alternative: **Nunito** 800.
- Text **rises 1.3x its own height through a clip on ease-out-quint**.
- No full stops on screen. Never fade a whole line in.

**Camera and motion**
- **Pacing:** every narration line gets a camera move or a transformation.
  - Nothing still for more than 2 s (reference spec).
  - Under the motion_so bar: 10% dead time or less, and no unplanned still longer than 0.6 s.
- **Camera:** easeInOutCubic, with **zoom interpolated in log space** so the zoom speed feels constant.
- **Pops:** damped springs with damping ratio 0.42-0.5 and ω 12-16 rad/s. In Remotion that is `{mass: 1, stiffness: 150-250, damping: 11-16}`, which gives about 16-20% overshoot.
- **Entrances:** staggered 2-4 frames apart.
- **Secondary motion everywhere:** float ±6 px, rotate ±2°, twinkle.
- **Parallax:** 3-5 layers. Star layers move at .12 / .35 / .6 of camera motion.
- Animate on ones (30 or 60 fps). Motion blur: 2 sub-frames at shutter 0.6, or `<CameraMotionBlur>`. No yo-yo moves.

**Transitions**
- *Zoom-through:* dive into an object that becomes the next scene.
- *Morph match-cut:* shape to shape via `flubber` or `@remotion/paths` `interpolatePath`.
- *Iris / radial wipe* in an accent colour.
- *Parallax swipe.*
- *White flash plus shockwave ring* for big events: flash 1 to 0 over 4-6 frames, ring scale 0 to 3x over about 30 frames.

**Textures**
- 4-6% film grain, re-randomised 24 times a second.
- Vignette to `rgba(4,4,20,.45)`.
- The grain doubles as anti-banding dither on the dark gradients.
- No paper textures.

**Lighting.** One key light from the top-left in every scene. Glow on emissives only. Light streaks for speed. Terminator bands on planets.

**Particles / FX**
- Twinkling stars in 3 parallax layers, 40% of near stars drawn as 4-point sparkles.
- Dust motes, bubbles.
- "Data packets" flowing along curved paths.
- Shockwave rings, sparkle bursts on reveals.

**Sound palette**
- **Music:** calm cinematic or ambient bed 7 dB under the voice, swelling +5 dB under the title.
- **SFX:** one sound per *event kind* (collapse, impact, whoosh, tick, dive, pin tap, ping, click, reveal, frost, rewind), peak-aligned to its frame, 4-10 dB under the voice.
- **Master:** -14 LUFS, -2 dBTP.
- **Voice:** calm, warm and curious. About 165 wpm long-form; 3.2-3.6 words/s for Shorts.

**UI-motion sub-mode (app marketing)**
- Field `#0B0B0F` or `#F7F7F5`.
- One hero shape morphs through **8-12 UI states** while a cursor clicks every change, cut to 120 BPM (one beat = 15 frames at 30 fps).
- **Inter Tight** or **Manrope** 700 at -2% tracking.
- Phone frames with 48-60 px corner radius, spring-driven morphs, counting numbers.
- Reference: [@twoclipping](https://x.com/twoclipping/status/2103273003555402193), 1.19M views and 21.2K bookmarks.

**Pro vs cheap: top 10**
1. One light direction. Every shape has a highlight, a shadow and a rim.
2. Restricted, hue-shifted palette on a dark field. Rainbow defaults look cheap.
3. No outlines; value contrast separates shapes.
4. Constant gentle motion. Dead frames are the #1 cheap tell in AI-made video (68% frozen without a harness, per motion_so).
5. Springs with overshoot and staggered entrances. Linear tweens look like PowerPoint.
6. Depth: parallax, atmospheric fade, glow halos.
7. Consistent construction (radii, proportions) and original mascots.
8. Few, big words. Numbers that count up. Text that rises through a clip.
9. Transitions that travel through space (zoom-through, morph) instead of slideshow cuts.
10. Grain and dither against banding, plus a sound on every event under a voice-led mix.

**References to emulate**

| Reference | Signal |
|---|---|
| [Kurzgesagt Shorts](https://www.youtube.com/@kurzgesagt) | Latest-30 median 1.35M. ["The Deadliest Thing in Your Kitchen"](https://www.youtube.com/shorts/2cK8l5Yg5w8) 5.3M; ["Can Earth Run Out of Water?"](https://www.youtube.com/shorts/tZ8i1RxGSYM) 4.1M; long-form ["This Is What a Godlike Civilization Would Look Like"](https://www.youtube.com/watch?v=QW_jlUn4gA8) 9.6M |
| [The Infographics Show](https://www.youtube.com/@TheInfographicsShow) | Median 346K. ["What Happens When You Are Shot"](https://www.youtube.com/shorts/V15wrmD5VFs) 2.9M |
| [AumSum](https://www.youtube.com/@AumSum) (kids' flat-2D what-if) | ["The Day Earth Disappeared!"](https://www.youtube.com/shorts/rqUW1-ejYo0) 11M; AumSum's Lab ["What if we were Made of Water?"](https://www.youtube.com/shorts/cNUbHEXFDIo) 26.7M |
| [@finnardley code-made Kurzgesagt-style prompt](https://x.com/finnardley/status/2114305886420086817) | 262K views, 5.3K bookmarks. The full spec (palette, Fredoka, springs, log-space zoom, grain, banned list) |
| [@kelanoo](https://x.com/kelanoo/status/2114000213656702984) | Claim: a new channel of Claude-made motion-graphic explainers got 7M views and 50K subs in 30 days |

---

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

### 2.E Runner-up mini-bible: "Doodle / minimal line art"

- **Paper and ink:** paper `#FAF7F0`, ink `#1A1A1A`, one accent (red `#E63946` or blue `#2B6CB0`), highlighter `#FFE066` at 60% multiply.
- **Lines:** 4-6 px marker at 1080 wide. Use `perfect-freehand` for pressure taper.
- **Line boil:** re-seed an `feTurbulence` + `feDisplacementMap` filter every 2-3 frames (8-12 fps boil), scale 2-4 px.
- **Write-on:** 0.3-0.6 s per object via `@remotion/paths` `evolvePath`. No drawing hand; it reads as a 2015 VideoScribe template.
- **Fonts:** Patrick Hand, Kalam, Caveat, Permanent Marker.
- **Camera:** one giant canvas that the camera pans across. Animate characters on twos.
- **Sound:** marker squeaks, paper rustle, ukulele or glockenspiel.
- **References:**
  - [Casually Explained](https://www.youtube.com/@CasuallyExplained): Shorts median 224K.
  - The "minimalistic black-and-white line art" format in the 6-skill pack.

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

## 4. Remotion implementation notes

### 4.0 Determinism rules (all styles)
- **Frame drives everything.**
  - Every visual is a pure function of `useCurrentFrame()` ([flicker docs](https://www.remotion.dev/docs/flickering)).
  - Use `random(seed)` from `remotion` for randomness and `@remotion/noise` (`noise2D/3D`) for smooth noise.
  - No CSS animations, no `Date.now()`, no `Math.random()`. Avoid CSS `background-image` and `mask-image`.
- **`<ThreeCanvas>`** ([docs](https://www.remotion.dev/docs/three-canvas)):
  - Requires `width` and `height` props.
  - Forces `frameloop="never"` during render and calls `advance(performance.now())` once per frame. It wraps children in a Suspense `SuspenseLoader`, so `useLoader` / `useTexture` delay the render (checked in `ThreeCanvas.tsx` source).
  - **Never animate from `useFrame` delta or `clock.elapsedTime`.**
  - The drei helpers `<Float>`, `<Sparkles>`, `<Stars>`, `<Cloud>` and the wobble/distort materials run on the internal clock. Avoid them, or set speed 0 and drive them yourself.
  - Any postprocessing effect that reads `time` (noise, glitch) needs a custom uniform driven by the frame. mromi does this: `grain.seed = frame`.
  - Inside the canvas, use `<Sequence layout="none">`.
- **Async setup:** procedural asset builds go behind `delayRender` / `continueRender`.
- **Fonts:** load with `@remotion/google-fonts/<Family>` `loadFont()`. For text drawn into Canvas2D textures, await `document.fonts.ready` under a `delayRender`.
- **Media:** audio via `@remotion/media` (`useVideoTexture` and friends are deprecated in favour of it).
- **Pixel-sized parameters scale with output height.** R3F clamps dpr to 1 or more, so `--scale 0.5` stills still render 1080x1920 buffers. Express ink widths, blur radii and grain in units of `height/1920`.

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

### 4.2 Style C (flat vector) in SVG / React
- **Scene tree.** One `<svg viewBox="0 0 1080 1920">` and pure components. The camera is a parent `<g transform={`translate(${540-cx*z} ${960-cy*z}) scale(${z})`}>`.
  - **Zoom in log space:** `z = Math.exp(interpolate(f,[a,b],[Math.log(z0),Math.log(z1)],{easing: Easing.inOut(Easing.cubic), extrapolateLeft:'clamp', extrapolateRight:'clamp'}))`.
  - **Parallax:** each layer gets the camera offset times its depth factor.
- **Pops:** `spring({ frame: frame - start, fps, config: { mass: 1, stiffness: 196, damping: 12.6 } })`. That is ζ about 0.45 and ω = 14, giving about 20% overshoot.
- **Text rise:** a `clipPath` rect, with y going from 1.3h to 0 on `Easing.out(Easing.poly(5))` (ease-out-quint; Remotion has no named "quint").
- **Glows:** radial gradients plus `mix-blend-mode: screen` groups. Keep `feGaussianBlur` to small regions; full-frame SVG filters are CPU-rasterised in headless Chrome and slow.
- **Grain:** a 512^2 noise PNG via `staticFile()`, inside an SVG `<pattern><image/></pattern>` (not CSS background), offset by `random('g'+Math.floor(frame*24/fps))*512`, opacity .05, overlay blend.
- **Morphs:** `flubber.interpolate(a, b, { maxSegmentLength: 4 })`, memoised outside render and sampled per frame. Or `@remotion/paths` `interpolatePath`.
- **Motion blur:** `@remotion/motion-blur` `<CameraMotionBlur shutterAngle={180} samples={6}>`. Render cost multiplies by `samples`, so use it only on fast moves.
- **Transitions:** `@remotion/transitions` (`TransitionSeries` with `fade`, `slide`, `wipe`, `iris`, `clockWipe`), or custom zoom-throughs.
- **Particle-heavy scenes** (thousands of stars): `@remotion/skia` (GPU) or a single Canvas2D layer.

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

### 4.4 Style B and the doodle runner-up (pointers)
- **Style B** (the coordinator's MIT repo has the full recipe):
  - The ink is a *screen-space depth + normal edge Pass* before the DOF. It is not an inverted hull: a hull gives silhouettes only, scales with perspective, and would outline the billboards.
  - Use a custom thin-lens blur. pmndrs `DepthOfFieldEffect` caps the radius at about `bokehScale` px.
  - Then bloom (threshold 1, mipmapBlur), `ToneMappingMode.NEUTRAL`, grade, MSAA 4.
  - Characters are Canvas2D billboards on a no-ink layer, lit by a card shader.
  - Quick fallback: drei `<Outlines screenspace>` (inverted hull), or `MeshToonMaterial` with a `gradientMap` set to `NearestFilter`.
- **Doodle:**
  - Line boil: `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={Math.floor(frame/2)}/>` into `<feDisplacementMap scale={3}/>`, on twos, applied only to line layers.
  - rough.js with `seed: 1 + Math.floor(frame/2)` (never unseeded).
  - `perfect-freehand` for tapered marker strokes. Write-on via `evolvePath`.

### 4.5 WebGL headless on Windows: `--gl` options and pitfalls
- **Version.** The current release is **v4.0.543 (2026-11-11)**. In 4.x the default `gl` is `null` (Chrome decides), so three.js needs **`--gl=angle`**:
  - CLI: `--gl=angle`.
  - `remotion.config.ts`: `Config.setChromiumOpenGlRenderer('angle')`. This is not applied to SSR.
  - SSR: `chromiumOptions: { gl: 'angle' }` in `renderMedia`, `renderStill` and `getCompositions`.
  - Studio: render modal, Advanced, OpenGL backend.
  - The docs say 5.0 makes `angle` the default ([gl options](https://www.remotion.dev/docs/gl-options); [three](https://www.remotion.dev/docs/three)).
- **Other backends.** On Windows, ANGLE runs on D3D11, i.e. the real GPU. With no GPU (RDP, VM or CI), use `--gl=swangle` (SwiftShader on the CPU, much slower). `egl`, `vulkan` and `angle-egl` matter on Linux.
- **Verify first:**
  - `npx remotion gpu --gl=angle` (v4.0.52+; prints how Chrome uses the GPU).
  - Render a still (`npx remotion still … --gl=angle --frame=120`). Studio preview runs in your desktop Chrome with a GPU, so "looks fine in Studio" proves nothing about headless.
- **Memory leaks.** ANGLE has known leaks: split long renders (`--frames=0-899`, `--frames=900-1799`), render video `--muted`, then concat and mux the audio once.
- **Concurrency and context loss.**
  - Every tab holds its own WebGL context. VRAM pressure leads to context loss, which shows up as black or blank frames or a crash. Open reports: [#12293](https://github.com/remotion-dev/remotion/issues/12293) (context-loss crash), [#1761](https://github.com/remotion-dev/remotion/issues/1761) (context creation).
  - Use `--concurrency=1-3` for R3F, dispose geometries and textures, and keep no more than 2 `ThreeCanvas` mounted at once (only during crossfades).
- **Windows TDR.** A GPU frame over about 2 s can trigger a driver reset and lose the context. Keep per-frame GPU cost bounded: shadow maps of 4096 or less, bounded blur taps, no 4x supersampling at 1440p.
- **Hybrid laptops.** The headless shell may run on the iGPU. Pass `gl={{ powerPreference: 'high-performance' }}`. The user can also assign the GPU per app in Windows Graphics settings (a user action, not a script change).
- **Chrome mode.** `--chrome-mode=chrome-for-testing` mainly helps Linux GPU drivers and WebGPU. On Windows, the default headless-shell with `angle` works.
- **Disk.** Every bundle copies `public/` into `%TEMP%\remotion-webpack-bundle-*` and never deletes it. mromi hit 60+ GB and ENOSPC. Set `TEMP`/`TMP` to a big drive in the render script, and clean old bundles only when idle (ask the user first).
- **Paths.** In JS strings write `"D:/remotion-tmp"`. In `"D:\remotion-tmp"`, `\r` becomes a carriage return.
- **Audio.** Remotion writes a silent audio track. Mux the real mix with `ffmpeg -i video.mp4 -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k out.mp4`.
- **Typical render:**
  ```
  npx remotion render src/index.ts Short out/short.mp4 --gl=angle --concurrency=2 --codec=h264 --crf=16 --pixel-format=yuv420p --scale=1.3333
  ```
  `--scale=1.3333` gives a 1440x2560 delivery. 2D SVG styles can use higher concurrency (about cores/2).
- **Licensing.** Remotion is free for individuals and companies of up to 3 people; larger companies need a company licence. Check [remotion.pro/license](https://www.remotion.pro/license) before automating at scale.

### 4.6 QA hooks (all styles)
- Contact sheet of every beat with the safe area overlaid.
- Frozen-frame scan: flag any identical-frame run longer than 0.6 s that isn't marked as a deliberate hold.
- Black and white frame scan.
- `ffmpeg -af ebur128` loudness check (target -14 LUFS, -1.5 dBTP).
- Re-check far terrain (A) and thin lines (D) after a test YouTube upload. 4:2:0 chroma subsampling smears 2-3 px coloured lines, so prefer 1440p delivery or thicker lines.

---

## 5. Sources

**Remotion**
- [`--gl` options](https://www.remotion.dev/docs/gl-options)
- [@remotion/three](https://www.remotion.dev/docs/three)
- [ThreeCanvas](https://www.remotion.dev/docs/three-canvas)
- [`npx remotion gpu`](https://www.remotion.dev/docs/cli/gpu)
- [WebGL](https://www.remotion.dev/docs/webgl)
- [WebGL2 context troubleshooting](https://www.remotion.dev/docs/troubleshooting/webgl2-context)
- [Chromium flags](https://www.remotion.dev/docs/chromium-flags)
- [Flickering](https://www.remotion.dev/docs/flickering)
- [GPU](https://www.remotion.dev/docs/gpu)
- [ThreeCanvas.tsx source](https://github.com/remotion-dev/remotion/blob/main/packages/three/src/ThreeCanvas.tsx)
- Issues [#12293](https://github.com/remotion-dev/remotion/issues/12293) and [#1761](https://github.com/remotion-dev/remotion/issues/1761)
- [Releases (v4.0.543)](https://github.com/remotion-dev/remotion/releases)

**Style references and repos**
- [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts): STYLE_BIBLE, measured reports, Bridge templates (MIT)
- [artemnovitckii/claude-animation-skills](https://github.com/artemnovitckii/claude-animation-skills)
- [drei Outlines docs](https://github.com/pmndrs/drei/blob/master/docs/abstractions/outlines.mdx)
- [Blockbench Minecraft Style Guide](https://blockbench.net/wiki/guides/minecraft-style-guide/)

**Minecraft reference data and legal**
- [Minecraft Wiki: Player](https://minecraft.wiki/w/Player)
- [Minecraft Wiki: Skin](https://minecraft.wiki/w/Skin)
- [Minecraft Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines)
- Allumeria DMCA: [Notebookcheck](https://www.notebookcheck.net/Microsoft-issues-DMCA-takedown-of-Minecraft-like-Steam-game-raising-copyright-debate.1223656.0.html) / [PC Gamer](https://www.pcgamer.com/games/survival-crafting/i-genuinely-do-not-know-what-to-do-says-developer-of-minecraft-like-allumeria-after-microsoft-issues-a-dmca-takedown-forcing-it-off-steam/)
- [A Minecraft Movie box office](https://www.the-numbers.com/movie/Minecraft-Movie-A-(2025))
- [YouTube monetization policies (inauthentic content)](https://support.google.com/youtube/answer/1311392?hl=en)

**Map data**
- [Natural Earth](https://www.naturalearthdata.com/)
- [OpenHistoricalMap copyright](https://www.openhistoricalmap.org/copyright)
- [historical-basemaps licence discussion](https://github.com/aourednik/historical-basemaps/issues/84)

**X posts** (via api.fxtwitter.com): @Remotion, @twoclipping, @stephanlivera, @kelanoo, @finnardley, @theoardley, @RoundtableSpace, @motion_so, @Voxyz_ai, @PeefTwt. Links are inline in section 1.4.

**Trend blogs (low weight):** [OpusClip 2026 styles](https://www.opus.pro/blog/viral-ai-video-styles-2026), [Anijam Shorts trends](https://www.anijam.ai/blog/youtube-shorts-trends/).

**Raw data:** the YouTube sweep and channel panel were collected with yt-dlp flat metadata on 2026-11-13. JSONL files are in `scratchpad/ytdata/` (`_summary.json`, `channels/_channels.json`, `shortsq/`).
