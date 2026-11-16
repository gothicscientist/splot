# Nomen Studio

One-line topic in, finished viral-quality animated vertical short out (1080x1920, 30 fps, H.264 + AAC), rendered
entirely in code: Remotion 4 (React 19) + three.js / React Three Fiber for 3D styles, SVG for 2D styles, a Python/Node
pipeline for voice, timing, sound and QA, and Claude Code skills (`skills/`) that drive it. It is the 10x successor of
the team's hackathon repo Nomen and a free, higher-quality equivalent of MotionLab (see
`docs/research/reference-motionlab.md`).

- **How to make a video** (the procedure, gates and craft rules): `skills/reel/SKILL.md`. Do not duplicate it here.
- **Agents start here:** `AGENTS.md` (setup, which skill for which request, the pipeline, the rules that must hold).
- **Current state, open issues, next steps:** `docs/STATUS.md`. Read it first; update it before ending a session.
- **Research behind every rule and number:** `docs/research/` (the skill references are excerpts of it).

## Owner requirements (non-negotiable)
- Production quality 1:1 with what is blowing up on TikTok / Reels / Shorts. Zero visible glitches, zero caption
  errors, zero pipeline errors: every gate in `skills/reel/SKILL.md` must pass before a render is shown.
- Work autonomously: the owner asked not to be asked things. Pick defaults, decide, and say what you picked.
  Still confirm anything destructive or outward-facing (git push, posting, deleting renders, spending on paid APIs).
- Research-driven: copy the winning FORMAT and HOOK MECHANIC of outlier videos, never their words, footage, characters.
- Four styles: **StickWorld** (2D cast in a toon 3D world, the reference look), **Blockcraft** (original voxel,
  Minecraft-genre), **Glowvector** (glow-lit flat vector, Kurzgesagt-like but original), **Atlas** (maps and data).
- Eight modes: case-file, what-if, how-it-works, history, back-then, lore, map, problem-solution; switches usable in
  any mode: interview, versus/rating, series.
- Two story channels (modes of the same skill, same gates): **`tiff`** (the Tiff x pileGo! series: a broad premise
  fleshed into a story on the archive-fashion / underground-rap scene's real jokes; `/tiff`) and **`ug-rap`** (the
  underground-rap channel: bios, scene stories, scenarios with original stand-ins; `/ug-rap`). Every episode ties into
  the owner's app pileGo! (`skills/reel/references/brands/pilego.md`) after ~70 % of the runtime; the owner has
  permission for pileGo!'s automatic relisting, so scripts never hedge it. Tiff's look is the owner-approved
  `src/styles/stickworld/tiff.ts` (silver-lavender hair, black tank, jean shorts, black boots).
- Facts always sourced in `videos/<slug>/research.md`. Legal fences: no Mojang/Microsoft assets and no "Minecraft"
  in titles/tags; lore mode uses original stand-in characters; no real person's likeness; never copy Kurzgesagt's
  characters, logo or music.

## Layout
```
skills/reel/            master skill (SKILL.md) + references/ (modes/, styles/, niche/, brands/, hooks, script rules...)
skills/tiff, ug-rap/   entry skills of the two story channels; reel-research / -hooks / -script / -critic: step skills
AGENTS.md              how an agent uses the studio (setup, skill map, pipeline, rules)
docs/                   STATUS.md (live state), research/ (full reports, reference analysis, tiff-niche/ raw sweeps),
                        characters/tiff/ (Tiff's model sheet)
scripts/                pipeline CLIs (see Commands); lib/ shared helpers (common.py, textnorm.py, bundle.mjs)
audio/                  synth.py (vendored from Nomen, procedural SFX/score/master) + sfx_extra.py (short-form SFX)
src/index.ts, Root.tsx  Remotion entry; registers every video from src/videos/registry.ts + lab compositions
src/core/               style-agnostic engine: types, timeline (word clock), Reel, captions, fx2d, anim, fonts
src/core/three/         3D: Stage (canvas + camera rig + post chain), camera, looks, mats, tex, particles, look/ (vendored MIT)
src/styles/<style>/     kits: stickworld (draw, Stick, cast + SCENE_CAST, props, props2, tiff = the shaped lead,
                        closet = clothes / chair pile / venue, frame = frameOn), blockcraft (blocks, VoxelWorld,
                        Blocky, Sky), glowvector (kit), atlas (kit)
src/brands/pilego.tsx   pileGo! devices (phone insert, sale pings, DMs, comment reply, listing cards, relist snap, end card)
src/channels/ug.tsx     ug-rap channel devices (track card, year stamp, alias stack, gothic title card)
src/videos/<slug>/      per-video code: index.tsx (scenes) + timeline.json (generated); registry.ts (generated)
src/lab/                look-dev compositions (GlSmoke, StickLab, CastSheet, SkyLab, MeasureLab, BlockLab, FontLab,
                        TiffHero/Sheet/Walk/Stage, SceneCast, PileGoLab, UgLab)
videos/<slug>/          per-video data: brief.md, research.md, script.json, voice/, audio/, renders/, qa/
public/v/<slug>/        voice.wav + mix.wav served to Remotion (keep public/ small: every bundle copies it)
```

## Environment (this machine, Windows 11)
- Node 24 / npm 12; packages pinned in `package.json` (Remotion 4.0.543, three 0.187, R3F 9.8, postprocessing 6.39).
- Python: `.venv/Scripts/python.exe` (3.12 via uv: numpy, scipy, edge-tts 7.3.1, num2words). Run with
  `PYTHONIOENCODING=utf-8`.
- ffmpeg 9 full build (has rubberband + ebur128), yt-dlp and deno via winget.
- Forced alignment + ASR check use the `watch` plugin's WhisperX venv `~/.cache/watch/whisperx-venv`
  (override with `NOMEN_ALIGN_PYTHON`). Without it, voice.py falls back to a word-boundary voice (lower quality).
- No NVIDIA GPU: WebGL renders through ANGLE on the iGPU. RAM is ~14 GB with often ~1 GB free: keep render
  concurrency at 3 or less.
- Optional keys (env, then `~/.config/nomen-studio/.env`, then `./.env`; never print them): `ELEVENLABS_API_KEY`
  (best voice, used automatically), `OPENAI_API_KEY` + `NOMEN_USE_OPENAI_TTS=1`. Default voice is free Microsoft
  Edge neural TTS (`en-US-AndrewMultilingualNeural`).

## Commands (from the repo root)
```bash
node scripts/new-video.mjs <slug> --style stickworld --mode case-file --title "..."   # scaffold (--mode tiff | ug-rap: channel defaults)
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/voice.py <slug> --verify    # TTS + alignment + ASR check
node scripts/timeline.mjs <slug>          # script + words -> src/videos/<slug>/timeline.json (frames)
node scripts/register.mjs                 # regenerate src/videos/registry.ts
npx tsc --noEmit                          # must be clean
node scripts/stills.mjs v-<slug> --shots <slug> --scale 0.5 --sheet 6   # critic frames + contact sheet (out/stills/)
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/sound.py <slug>  # score + SFX + voice mix -> public/v/<slug>/mix.wav
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/sound.py --preview plugg   # music-only preview of a mood (out/audio-preview/)
node scripts/render.mjs <slug> --variants # final MP4 + hook variants (videos/<slug>/renders/)
node scripts/check.mjs <slug>             # automated QA -> videos/<slug>/qa/report.md + 1-fps sheets
node scripts/lint-script.mjs <slug>       # script.json lint (beat lengths, keywords, sound/transition names, hooks)
node scripts/render-range.mjs <slug> <from> <to>   # muted MP4 of a frame range (bugs that only show in real renders)
npm run doctor                            # environment check (node, ffmpeg filters, venvs, Chrome, fonts, RAM, keys)
npm run install-skills -- --yes           # copy skills/* into ~/.claude/skills (dry run without --yes)
npm run studio                            # Remotion Studio (manual preview / editor)
```
Composition ids are `v-<slug>` (non `[a-zA-Z0-9-]` chars become `-`). Re-run sound.py after any timing change.

## Data flow (one clock for everything)
`script.json` (authored: beats = one sentence each, `shot` grouping, `*starred*` keyword, `sfx` cues keyed to words,
`pronounce`, `hookVariants`) -> `voice.py` (per-beat TTS cached by hash, edge trim, pause tightening, rubberband
tempo, WhisperX forced alignment of the EXACT spoken words, `words.json`) -> `timeline.mjs` (frames, shots with
transitions, caption chunks) -> scenes call `useShot()` (`s.hit("word")` = 2 frames before the word, `s.at`, `s.end`,
`s.beat`) -> `sound.py` reads the same timeline -> `render.mjs` renders muted video and muxes the mix -> `check.mjs`.
Captions show the script text, never ASR output, so they cannot contain transcription errors.

## Critical decisions (and why)
1. **Code-rendered, no image/video generation models.** Deterministic, no hallucinated hands/borders/numbers, no
   API cost; numbers and text on screen are exact. ElevenLabs is the only optional paid service.
2. **Post-processing runs on the raw `postprocessing` EffectComposer driven from our own priority-1 `useFrame`**
   (`src/core/three/Stage.tsx`). The R3F `<EffectComposer>` wrapper renders blank under Remotion with these versions.
3. **Vendored look modules** (`src/core/three/look/`: ink, lensblur, grade, shade, cardshade, lights) from
   mromidev/claude-animated-shorts (MIT): proven, measured toon look. Pass order: Render -> Ink (own pass, before
   blur) -> lens blur pre + main -> bloom + Neutral tone map + grade. Edit them only with a note in
   `THIRD_PARTY_NOTICES.md`.
4. **Captions are laid out by the browser (HTML spans), not measured on a canvas.** Canvas `measureText` silently used
   a fallback font for the Google fonts in headless Chrome, which collapsed word spacing. Keyword runs share one box.
5. **Voice: one TTS clip per beat + forced alignment.** Free Edge multilingual voices give no word boundaries, and the
   endpoint fails intermittently (voice.py retries 10x with back-off). Numbers/acronyms are normalised for TTS and
   alignment (`scripts/lib/textnorm.py`); `pronounce` respellings are wildcards in the ASR check.
6. **Sound: Nomen's deterministic `synth.py`** wrapped by `sound.py`: one sound identity per mood (moods: heist,
   mystery, wonder, workshop, epic, comedy, drama, uplift, calm; defaults per mode), music ~20-24 dB under the voice and
   ducked on words, SFX bus ducked 7 dB under speech, foley auto-moved into the next pause, a 3-pass masking-fix loop,
   master -14 LUFS / -1.5 dBTP.
7. **Hook variants re-render only the opening** (`render.mjs --variants`): body once, each head segment, concat with
   stream copy, then mux.
8. **Camera grammar from measured references:** holds always creep (never freeze), glides or ease-out bursts,
   sign-flipping impact kicks, DOF only on close/medium shots. Function cameras get the same creep in `Stage`.
9. **StickWorld characters are Canvas2D drawings on scene-lit billboard cards** (`Stick.tsx`), redrawn per frame at a
   resolution chosen from their on-screen size, on the `NOINK` layer (they carry their own ink).
10. **Two Remotion bundle folders**: `out/bundle` (render.mjs) and `out/bundle-stills` (stills.mjs), so a render and
    look-dev stills can run at the same time without clobbering each other or filling TEMP. Parallel jobs (agents)
    set `NOMEN_BUNDLE_DIR=out/bundle-<name>` so each gets its own folder.
11. **No scene mounts before every font is drawable** (`useAllFontsReady` in `<Reel>`, `src/core/fonts.ts`). Canvas
    text (papers, signs, stickers, cards) is drawn once and cached, so a texture drawn before its Google font loaded
    kept the fallback face for the whole render tab: stills and the final MP4 showed different typefaces.
12. **Fresh critics gate every video** (`skills/reel-critic`): stills are scored by agents that did not build the
    video, two lenses (outlier bar; phone viewer + glitch hunter); PASS = every area >= 8 and no P0, for both.
13. **Story channels are modes, not a second engine** (`tiff`, `ug-rap`): same pipeline and gates, plus story-mode
    rules that `lint-script.mjs` enforces (plug after ~68 % of the words, <= 2 spoken "pileGo!", every speaker has a
    cast voice, a real subject needs >= 6 sourced rows and is never named in a plug beat) and critic P0 checks (Tiff
    framing, plug timing, real people, logos). Niche facts live in fact-checked bibles with check logs
    (`skills/reel/references/niche/`), because the sweep reports they came from were wrong on ~half the items.
14. **Dialogue = per-beat voices** (`speaker` on a beat + `voice.cast` in script.json, Edge voice / rate / pitch):
    one TTS clip per beat already, so a second character costs nothing; a single ElevenLabs take cannot voice two.
15. **Trap-family music is procedural too** (`plugg`, `rage`, `jerk` in `audio/synth.py` section 5b: a continuous-
    oscillator 808 with slides, hats with rolls, claps, stabs): platforms forbid real tracks for brand accounts, and
    the 808 carries harmonics so the groove survives phone speakers (measured with a phone-speaker filter).

## Gotchas (each one cost real debugging)
- Set uniforms/colours that the first frame needs synchronously in render, not in `useEffect` (R3F draws before
  effects run: the sky came out white).
- A StickWorld adult card is 2.2 m tall (the figure fills ~78 %), so heads sit at ~1.43 m. In close-ups aim the
  camera ~0.2-0.25 m below the eyes so faces stay above the caption band (y 1100-1350 px).
- Remotion writes a silent audio track: always mux `mix.wav` explicitly (render.mjs does).
- three r187: `PCFSoftShadowMap` is gone (falls back to PCF); `THREE.Clock` deprecation warnings are harmless.
- Item props drawn into a character card must stay inside its 600x1000 design canvas or they get clipped.
- Blockcraft characters stand at the terrain surface: use `flat: true` terrain under them (block y=-1 -> floor y=0).
- Pixel fonts: Pixelify Sans draws capital C like an O ("STUOK"), Silkscreen 700 merges W into a blob. Pixel UI uses
  Silkscreen 400; voxel captions use the `chunky` preset (Lilita One). Test any new font in `src/lab/FontLab.tsx`.
- Voxel worlds are unlit (baked face shade + AO): depth, shafts and heat come from `VoxelWorld light` (per-vertex
  multiplier) and `Block tint`. An open-backed cutaway shaft shows the sky through it: carve only its front half.
- Never animate from `useFrame` deltas or `Date`; everything is a function of the frame. No SMIL animations in SVG.
- Shell heredocs with JS template literals break quoting: write patch scripts to a file and run them.
- Tiff's eyes sit at ~1.60 m (a stick adult's at ~1.43 m): a camera aimed like the stick cast frames her torso. Use
  `frameOn(at, "cu" | "medium" | "full")`; avoid `mcu` for her (it centres the neckline); stick characters pass
  `{ who: "stick" }` (their big heads need a different table).
- 9:16 two-shots: put one character nearer the lens (offset in depth), or they end up tiny or cut by the frame edge.
- Lowercase captions (`lower` preset) keep camelCase brand tokens (pileGo!) as written.
- A UI insert (phone) must end above y ~1100 px: the caption band sits on top of it otherwise.

## Conventions
- Scenes: one component per shot, first line `// scenes: hand-written`, word-keyed timing only (a missing word
  throws with the list of words: fix the phrase, never hard-code frames). `npx tsc --noEmit` clean before stills.
- Verification is visual + measured: stills sheet reviewed (by a fresh critic agent for finals), then `check.mjs`
  must exit 0. There are no unit tests yet.
- Keep `public/` to audio only. Git-ignored: `renders/`, `qa/`, `voice/cache/`, `out/`, audio stems, the 16 kHz
  alignment copies and all of `public/v/` (on a fresh clone run `timeline.mjs` + `sound.py` per video before
  previewing or rendering). `videos/<slug>/voice/voice.wav` is tracked: it is the timing master.
- Licensing: Remotion is free for individuals and companies of up to 3 people (larger teams need a license).
  Vendored MIT and team code are listed in `THIRD_PARTY_NOTICES.md`; map data is world-atlas (ISC, Natural Earth
  public domain).
