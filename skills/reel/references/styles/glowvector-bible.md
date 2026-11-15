<!-- Glowvector (glow-lit flat-vector explainer, Kurzgesagt-like, original) style bible. Research compiled 2026-11-13/14 for Nomen Studio (art-styles study). Numbers are measured or cited; see the sources inside. -->

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

