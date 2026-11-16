# Status (updated 2026-11-15, late)

Live state of the studio. `CLAUDE.md` has the stable rules; this file has what is done, what is not, and what's next.
Update it at the end of every session.

## Critic budget + real-artist likeness (session of 2026-11-16, branch `video/ug-01-fakemink`)
Read this block first: it is the newest.
- **Critic loops are capped** (the owner's tokens): at most 2 critic agents per video: ONE full critic (both lenses in
  one agent, `model: "sonnet"`), one fix pass, ONE verify critic on the changed shots only, then stop and report the
  open notes. No critic on the final render unless scenes changed; no workflows that loop until PASS. Rules: "The
  critic budget" in `skills/reel/references/critic.md`; verify mode in `skills/reel-critic`.
  `node scripts/stills.mjs v-<slug> --shots <slug> --only s03,s07 --out out/stills/v-<slug>/r2` renders just the
  changed shots. The paused four-video critic loop below resumes under this budget (one full + one verify each), not
  the old 4-round workflow.
- **ug-rap artists are drawn as themselves** (owner decision): bio / scene episodes need a `## Look sheet` in
  research.md (traits per era from dated public photos, two photos per trait; lint fails a real bio / scene subject
  without one or with < 2 photo URLs), a cast entry in `src/channels/ugCast.ts` (`UG_CAST`), and a likeness check
  before scenes; the critic flags an off-model artist as P0. Still drawn, never photoreal, no logos, never voiced,
  never in a plug shot. Scenario and Tiff episodes keep original characters. Rules: `modes/ug-rap.md`, "Drawing the
  real artist".
- **ug-01-fakemink:** spec moved to `UG_CAST.fakemink` (no visual change; tsc + lint clean), look sheet written. The
  2025-26 look (skullet, goatee, fur-collar vest over a white shirt) matches the sources. **Open:** the 2019-24
  bedroom shots (s02-s04) reuse the later vest because no dated early-era photo was found yet.

## Story channels: Tiff x pileGo! + ug-rap (session of 2026-11-15 late, branch `studio/full-implementation`)
Read this block first: it is the newest. Agents start at `AGENTS.md`.
- **Built:**
  - **Tiff** is the owner-approved `src/styles/stickworld/tiff.ts` (commit 447b01c, pulled and merged with the local
    work; the draw.ts / STATUS.md conflicts were resolved by keeping both sides). Checked in 3D sets (`TiffStage`):
    lit card, contact shadow, walk, two-shots with the stick cast. `frameOn()` (`styles/stickworld/frame.ts`) frames
    her from a table measured on stills (eyes at 1.60 m); stick figures pass `{ who: "stick" }`.
  - **Modes** `tiff` and `ug-rap` (`skills/reel/references/modes/`), entry skills `skills/tiff` and `skills/ug-rap`,
    the master skill's mode table, critic P0 checks for story modes, dialogue / plug docs in `reel-script`.
  - **Niche bibles**, fact-checked on 2026-11-15 by fresh agents, each with a check log (`references/niche/`):
    `ug-rap.md` (12 artists, 7 bio-ready), `archive-fashion.md` (39 checks: 19 corrected, 2 refuted), `resale.md`
    (~50 checks), `story-formats.md` (~50 claims, including the TikTok / Instagram / FTC / ASA / EU AI Act posting
    rules). Raw sweeps: `docs/research/tiff-niche/`.
  - **pileGo!** brand file + kit, taken from the live site (Libre Franklin 900 italic wordmark, tag mark, palette,
    claims): `PileGoPhone`, `SoldPing` / `SoldStack`, `DMThread`, `CommentReply`, `ListingCard`, `RelistSnap` (Tiff's
    repeatable bit), `EndCard`, `PileGoBug` (`src/brands/pilego.tsx`, look-dev `PileGoLab`).
  - **Kits:** closet kit (`ClothesChair` / `ClothesHeap` with `sold` hops, `Garment`, `Rack`, `Mirror`, `Bed`,
    `ShipBox`, `Venue`, `Cutout`), `look="club"`, `SCENE_CAST`, ug-rap kit (`src/channels/ug.tsx`: `TrackCard`,
    `YearStamp`, `AliasStack`, `TitleCard`), fonts Libre Franklin + Grenze Gotisch, caption preset `lower`.
  - **Pipeline:** `voice.py` per-beat speakers (`speaker` + `voice.cast`, Edge rate / pitch); `lint-script.mjs`
    story-mode rules; `new-video.mjs` channel defaults; `sound.py` moods plugg / rage / jerk + `--preview` (the nine
    older moods render bit-identically; phone-speaker translation measured; nobody has listened to them yet).
- **Sample `tiff-01-the-quiz`** ("He quizzed me in a jacket I sold him", the F4 gatekeeper flip, 40.5 s + end
  card): lint clean, voice WER 3.1 % (Ava narrating, Guy as the gatekeeper), timeline, 8 hand-written shots; stills
  self-reviewed twice and fixed (staging, framing, overlaps, phone timing). **Not yet:** a fresh-critic PASS, the
  sound mix, the render, `check.mjs`, `post.md`.
- **Owner decisions (none blocks the work):**
  1. Tiff's hair (`#d9d8ef`) vs Tiffany Day, a real artist in this scene with bleached hair and anime-style
     visuals: the ug-rap bible advises the hair read clearly lavender, never platinum, and that Tiff never performs.
     Kept exactly as pushed.
  2. pileGo! and Grailed: the site lists eBay, Vinted, Depop, Poshmark and Mercari, so the kit never shows Grailed.
  3. UK CAP Code 6.1 advises written permission before marketing refers to a public figure: get a legal look before
     ug-rap biographies carry pileGo! plugs.
  4. The voice is the free Edge Ava; an ElevenLabs voice for Tiff would sound better (needs a key or connector).
- **Superseded, left untracked (not committed):** the first Tiffany draft (`src/styles/stickworld/anime.ts`,
  `AnimeCard.tsx`, `tiffany.ts`, `src/lab/Tiffany*.tsx`: black twin tails, revealing variants). Delete when ready.
  Its stick-figure fashion presets in `cast.ts` stay as side-cast looks.
- **Next, in order:** two fresh critics on the `tiff-01` stills, fix, sound, `render.mjs --variants`, `check.mjs`,
  `post.md`; then a first `ug-rap` sample (a `scenario`, or a bio of a bio-ready artist after decision 3); then resume
  the paused four-video critic loop (next block).

## In progress (session of 2026-11-15, branch `studio/full-implementation`)
Read this block first: it is newer than everything below it.
- **PAUSED by the owner on 2026-11-15** to focus on the Tiffany x pileGo! story series (see the Tiffany block when it
  exists). The critic-fix workflow `reel-critic-fix-loop-v2` (run `wf_1f27ee8b-479`) was stopped mid-run. Where it got:
  - chile-shape: critic r0 FAIL (6-7) -> builder r0 -> critic r1 **PASS (all areas 8)** -> render + `check.mjs`
    **PASS** (`videos/chile-shape/renders/*.mp4`, 41.93 s). Only the final critic on the QA sheets was not run.
  - noise-cancelling: critic r0 FAIL (7-8) -> builder r0 -> critic r1 FAIL (hook 7, story 7, composition 7, characters
    7) -> builder r1 was interrupted mid-edit.
  - deepest-hole: critic r0 FAIL (6-7) -> builder r0 -> critic r1 FAIL (hook 7, composition 7) -> builder r1 interrupted.
  - eiffel-tower-con: builder r0 (from the 12 earlier notes) interrupted mid-edit (it touched `src/styles/stickworld/
    draw.ts` and `props2.tsx` and the scene file).
  The interrupted builders' edits are in the working tree (typecheck clean at pause time, never reviewed as a whole).
  To resume: re-run stills for noise / deep-hole / eiffel, then the workflow (or one builder per video) with fresh
  critic notes.
- **Last critic scores (before this workflow):** chile-shape 6-7 (FAIL, 1 P0), noise-cancelling 4-6 (FAIL, 1 P0),
  eiffel-tower-con 5-6 (FAIL, 1 P0: the portrait in the last frame clips Lustig). deepest-hole not yet scored.
  A first workflow run was killed by the usage limit; its Chile and noise builders had already rewritten most of
  both scene files (kept; the v2 critics score that state).
- **Renders on disk:** eiffel-tower-con and noise-cancelling MP4s (+ hook2/hook3) pass `check.mjs` but predate the
  critic fixes and the font fix below, so they are NOT final. chile-shape's last render FAILED `check.mjs` (frozen map
  holds at ~12.1, 28.4, 35.0, 37.4 and 40.8 s). deepest-hole has not been rendered.
- **Fixed this session (all four videos benefit):**
  - Canvas text (newspapers, signs, stickers) could be drawn before its Google font loaded and keep the fallback face
    for the whole render tab, so the final MP4 showed a different typeface from the stills. `<Reel>` now mounts no
    scene until every registered font is drawable (`useAllFontsReady`, `src/core/fonts.ts`). Verified with
    `scripts/render-range.mjs` on Eiffel's newspaper stretch.
  - `sound.py` could not find sfx cue words with thousands commas ("12,262"): phrase tokens are now split on spaces
    before punctuation is stripped, like the words.
  - Music levels evened out (per-video `music.gain`): every mix -14.0 LUFS, -1.50 dBTP, music 20.7-22.7 dB under the
    voice, <= 12.9 noticeable SFX/min, no masked words.
  - Blockcraft: memory leaks fixed (VoxelWorld re-mesh disposal, cached Blocky head materials, memoised hat
    materials); the pickaxe is steel (the cyan "diamond" tool is a signature item of the genre's game); `VoxelWorld
    light` + `Block tint` for depth-lit cutaways; deepstone texture with more contrast; small voxel flowers.
  - Fonts: Pixelify Sans draws capital C like an O and Silkscreen 700 blobs the W. Pixel UI = Silkscreen 400; voxel
    captions = new `chunky` preset (Lilita One); `src/lab/FontLab.tsx` tests glyphs.
  - Parallel GPU work: `NOMEN_BUNDLE_DIR` gives each job its own bundle folder, and `scripts/lib/gpulock.mjs` holds
    stills / renders to `NOMEN_GPU_SLOTS` (default 2) machine-wide.
  - deepest-hole scenes reworked (derrick framing, true-scale 23 cm hole close-up with plate, dark shaft back wall,
    warm depth light); chile-shape and noise-cancelling leftovers from the previous session fixed before the critics ran.
- **Written this session:** sub-skills `reel-research`, `reel-hooks`, `reel-script`; kit API docs
  `styles/blockcraft.md`, `glowvector.md`, `atlas.md`; `scripts/doctor.mjs` (16 pass / 1 warn), `scripts/install-skills.mjs`
  (dry run: 5 new skills, nothing to overwrite), `scripts/lint-script.mjs` (all four scripts lint clean),
  `scripts/render-range.mjs`; `SKILL.md` step 5 now describes the ElevenLabs take flow; `post.md` for all four videos;
  `brief.md` for the three new ones; critic.md ban list exempts Glowvector / Atlas dark fields.
- **Research:** second independent sources added and checked (`second-sources` workflow, run `wf_5c110bb7-93d`).
  deepest-hole 8/8 done. Flags to keep in mind (the voice is recorded, so wording stays): noise b05 "you hear almost
  nothing" vs BBC Science Focus "around 70 per cent of ambient noise" (see `videos/noise-cancelling/research.md`
  "Conflicts to watch"); deepest-hole rows 2, 3+8 and 4 have notes in its research.md.
- **Known kit traps (documented, not fixed):** Glowvector colour helpers only parse `#RRGGBB`; Callout pill width is
  estimated from the character count; Atlas `DateCounter` prints years as "1,881" and ignores `x`; the globe's shading
  disc covers overlays and `h.p` does not hide far-side points; `dimOthers` dims from frame 0.
- **Next, in order:** let the workflow finish; for any video that still FAILs, run another fix round (resume the
  workflow or re-run its builder with the remaining notes); once all four pass: `npm run install-skills -- --yes`,
  update this file, commit, and ask the owner before pushing to `origin` (github.com/gothicscientist/splot).

## Done and verified
- **Engine** (`src/core/`): timeline word clock, `<Reel>` with 13 seam types (incl. hard cut), captions (8 presets: bold-pop,
  boxed, karaoke, pixel, clean, comic, marker, serif), screen FX (`fx2d`), 3D `Stage` (camera rig, looks: day golden
  overcast dawn dusk night interior alarm studio, custom post chain), particles.
- **Pipeline** (`scripts/`): new-video, voice (+ `--verify`), timeline, register, stills, sound, render
  (`--variants`), check. All ran end to end on the sample below.
- **StickWorld kit**: complete and production-tested (cast presets, 30+ poses incl. walk/run, 24 faces, 18 hand
  items, 2 prop files, rooms/streets/vehicles/landmarks). Kit API doc: `skills/reel/references/styles/stickworld.md`.
- **Sample 1: `eiffel-tower-con`** (StickWorld x case-file, "This man sold the Eiffel Tower... for scrap metal.",
  63.7 s, 197 words, 188 wpm, 10 shots, 3 hook variants). Voice ASR check WER 2.0 % (only the respelled name).
  Renders: `videos/eiffel-tower-con/renders/eiffel-tower-con.mp4` + `.hook2.mp4` + `.hook3.mp4`.
  QA: see "Last QA result" below.
- **Skill** `skills/reel/SKILL.md` + references: 8 mode playbooks, hook library + rubric, script rules,
  captions/audio, posting, quality bar, failure modes, tools, 4 style bibles, the StickWorld kit doc.
- **Research** preserved in `docs/research/` (4 reports + the reference analysis).

## Last QA result (eiffel-tower-con, 2026-11-14 21:57)
**PASS** (`node scripts/check.mjs eiffel-tower-con`): 1080x1920, 30 fps, 63.73 s, 37.0 MB; -14 LUFS, -1.5 dBTP;
0 frozen spans, 0 pops; 197 words, 188 wpm, 10 words by 3 s; voice WER 2.0 %; no masked words. Remaining warnings
are only "shot longer than 6.5 s" for s02/s04/s05/s06/s09 (the camera keeps moving inside them). The earlier
frozen-picture failure was fixed by the camera-creep change in `src/core/three/camera.ts`. No fresh-critic review
of this final render has been run yet.

## Not done (exact gaps)
1. **Critic PASS for all four videos** (every area >= 8, no P0) and final renders that pass `check.mjs`: in progress
   (see the block at the top).
2. **Skills not installed yet** in `~/.claude/skills/`: run `npm run install-skills -- --yes` once the docs are final
   (the installer never overwrites a folder it did not create; it writes a `.nomen-studio` marker).
3. **Blockcraft terrain** has no per-character surface helper beyond `Voxels.top`; keep `flat: true` under characters.
4. **Cleanup candidates:** pipeline test data `videos/_test/`, `src/videos/_test/`, `public/v/_test/` (kept as a
   pipeline smoke-test fixture); `src/lab/PostTest.tsx` / `PostRaw.tsx` (post-chain experiments, used by `GlSmoke`).
   The unused canvas caption-measuring helpers were removed.
5. **Git:** work is on `studio/full-implementation` (remote `origin` = github.com/gothicscientist/splot). Nothing from
   this session is committed yet; pushing needs the owner's OK.
6. **ElevenLabs connector** is not attached in every session: without it a new take cannot be recorded, so narration
   wording cannot change (critics are told to ask for picture changes only).

## Known issues / watch-outs
- The free Edge TTS endpoint fails intermittently ("No audio was received"); voice.py retries, but a long outage
  stops the run. ElevenLabs (`ELEVENLABS_API_KEY`) avoids it.
- The masking check in `sound.py` flags voice-vs-bed < 3 dB per content word; a word or two can stay flagged after the
  3 fix passes. Check them by ear before shipping.
- `check.mjs` warns on shots longer than 6.5 s even when the camera keeps moving; the hard gate is the frozen /
  dead-stretch detection.
- Hook variants cut at shot 2's start + 8 frames: a hook shot's variant must not change anything after that frame.

## Verified facts for the planned samples
- **Kola Superdeep Borehole** (Blockcraft x what-if): ~12,262 m true vertical depth reached in 1989; ~23 cm (9 in)
  wide; ~180 °C at the bottom vs ~100 °C expected; rock behaved "more like plastic"; drilling halted in 1992 because
  of the heat; sealing date conflicts between sources (avoid it). Sources:
  https://en.wikipedia.org/wiki/Kola_Superdeep_Borehole ,
  https://www.scientificamerican.com/article/how-deep-is-the-deepest-hole-in-the-world/ ,
  https://science.howstuffworks.com/engineering/civil/kola-superdeep-borehole.htm
- **Chile** (Atlas x map): ~4,270 km long, ~175-177 km average width (widest ~350 km, narrowest ~64 km per
  Wikipedia; gob.cl gives 445 / 90 km); 1881 Boundary Treaty set the border along the Andes' highest peaks /
  continental divide down to 52 S. Sources: https://en.wikipedia.org/wiki/Geography_of_Chile ,
  https://en.wikipedia.org/wiki/Boundary_Treaty_of_1881_between_Chile_and_Argentina , https://www.gob.cl/en/our-country/
  Planned comparison (geometry, not yet sourced): Chile's ~38.5 degrees of latitude exceed Europe's North Cape (71 N) to
  Tarifa (36 N) span (~3,900 km); show it with `Ghost` on an equirectangular map.
- **Active noise cancelling** (Glowvector x how-it-works): mics sample outside noise, a processor plays an inverted
  (anti-phase) wave, destructive interference near the ear; best on steady low-frequency sound (engines, below
  ~1 kHz), weak on sudden/high sounds (voices); passive padding handles highs. Sources:
  https://en.wikipedia.org/wiki/Noise-cancelling_headphones , https://en.wikipedia.org/wiki/Active_noise_control ,
  https://www.scientificamerican.com/blog/psi-vid/how-do-active-noise-canceling-headphones-work/

## Next steps (in order)
See "Next, in order" in the block at the top of this file.
