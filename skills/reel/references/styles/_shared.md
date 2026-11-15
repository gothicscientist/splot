<!-- Shared style rules + determinism + WebGL on Windows. Research compiled 2026-11-13/14 for Nomen Studio (art-styles study). Numbers are measured or cited; see the sources inside. -->

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

