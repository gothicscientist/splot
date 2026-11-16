# Status (updated 2026-11-14)

Live state of the studio. `CLAUDE.md` has the stable rules; this file has what is done, what is not, and what's next.
Update it at the end of every session.

## Tiff, the new recurring lead (2026-11-15, branch `feat/tiff-character`)
- Shaped lead figure `src/styles/stickworld/tiff.ts` (`drawTiff`), iterated with the owner over many single-still
  reviews: 23-year-old anime-style cartoon woman; long straight silver-lavender hair with symmetric jagged bangs
  (kept off the eyes) and chest-length side locks, big blue anime eyes, black choker; hourglass figure (torso sides
  traced from the owner's red-line markup, saved at `out/stills/tiff-hero-redlines.png`); outfit black scoop tank,
  frayed high-waisted jean shorts (joined, no thigh gap), bare legs with knee detail, black block-heel boots drawn
  front-facing. Long hair counter-rotates against head tilt so it hangs with gravity.
- Same Pose/Face/Item vocabulary as the stick cast. Use `<Stick spec={CAST.tiff} ... />` (`StickSpec.figure: "tiff"`).
  Recolour via body (top), legColor (shorts), shoes (boots), accent (button), head (skin), hairColor.
- Look-dev: `TiffHero` (one standing still, `out/stills/tiff-hero.png`) and `TiffSheet` (16 poses,
  `out/stills/tiff-sheet.png`). Known leftovers: walk frames show crossing legs with front-facing boots (reads OK at
  size); not yet seen inside a 3D scene or a video; no storyline written yet.
- `drawItem` in `draw.ts` is now exported (Tiff reuses the hand items).

## Tiff reels batch 1 (2026-11-15, branch `feat/tiff-character`, uncommitted)
- Anime kit (`tiff.ts`, `AnimeLook`) now drives the whole side cast: `jake`, `mia`, plus one-offs `sasha`, `leo`,
  `friendA`, `friendB` in `cast.ts`.
- Shared Tiff world `src/videos/_tiff/set.tsx`: TiffRoom, ExRoom, CafeSet, `DinnerSet` (table optional), `CouchRoom`,
  recolourable `JacketStand`. Phone UI and the pileGo! `EndCard` (pilego.app) live in `src/videos/_tiff/ui.tsx`.
  Every Tiff reel ends on the EndCard over a 2 s voice tail (`voice.py --tail 2.0`).
- Daily script batches: `docs/daily-scripts/<date>.md` + draft `script.json`s. The scheduled task
  `tiff-daily-scripts` writes six each morning, Nov 16-18 at 08:30.
- **Tiff's voice:** the owner's ElevenLabs voice "Kitty" with the sultry v4 recipe (`docs/characters/tiff/voice.md`):
  `eleven_v4`, stability 0.5, one continuous take, opening tag `[sultry, smirking, brisk TikTok storytelling pace]`.
  Voice with `scripts/voice-take.py` (not voice.py). The recipe was recovered from the owner's ElevenLabs history.
  Per-line v2 sounded wrong, and v2 at low stability drifted into a French accent.
- Built with that voice, QA PASS: `tiff-soft-launch` (43.4 s), `tiff-same-jacket` (43.1 s; soft masking warning on
  "minute"), `tiff-no-labels` (40.7 s).
- Gotchas found:
  - `s.hit("sold")` hits the first "sold" in the shot; pass nth.
  - Hooks must run before any early return: the EndCard crashed renders with React #310, and stills don't catch it.
  - Hand items (signs) clip at the card's 600x1000 canvas when the arm is extended.

## In progress (session of 2026-11-14 late, stopped by a usage limit; branch `studio/full-implementation`)
Read this block first: it is newer than everything below it.
- **Voice is now ElevenLabs (connector), all four videos.** New `take` provider in `scripts/voice.py`: one full
  narration take per video (`videos/<slug>/voice/take.mp3`, eleven_v4, voice "Liam - Viral Short-Form Storyteller",
  id `VCgLBmBjldJmfphyB8sZ`) is force-aligned, cut per beat and re-spaced by the usual pipeline.
  `voice.py <slug> --take-text` prints the text to send. ASR check WER 0.0 % on all four takes.
- **Eiffel:** re-voiced, timeline + mix rebuilt (-14.03 LUFS, -1.50 dBTP), stills re-rendered and look fine to the
  builder. NOT yet re-rendered to MP4, NOT yet critic-reviewed, `check.mjs` not re-run. The old MP4s in `renders/`
  still carry the old Edge voice.
- **Three new videos scripted, researched (`research.md`), voiced and timed:** `chile-shape` (Atlas x map, 41.9 s),
  `noise-cancelling` (Glowvector x how-it-works, 39.6 s), `deepest-hole` (Blockcraft x what-if, 41.9 s).
  - `chile-shape` and `noise-cancelling`: scenes written, two stills rounds done (`out/stills/v-<slug>/sheet.jpg`).
    Known leftovers from the builder's own review: Chile s02 label timing at "glaciers" and the final "24x longer"
    label (partly hidden behind Chile) need a look; noise s01 "MORE NOISE?!" text overlaps the listener's head
    (move it up), s03 callouts are cut by the frame edge while the camera pans, s05 check badge and s06 chip sit
    close to the caption band.
  - `deepest-hole`: scenes written and type-clean, first stills were rendering when the session stopped
    (`out/stills-hole.log`); nothing has been looked at yet.
  - None of the three has sound (`sound.py`), a render, `check.mjs` or a critic review yet. `brief.md` is still the
    scaffold and `post.md` does not exist for any of them.
- **Kits extended:** Atlas (`local` projection, `clip`, `anchor`, `under`, `background`, `sharedBorder`, smooth globe
  zoom + shading), Blockcraft (`Voxels.top`, `Voxels.planet`, `Block wobble`, plate item, `PixelThermo`, gauge
  options, hero recoloured so it no longer resembles the genre's default skin).
- **Written:** `skills/reel-critic/SKILL.md`, `skills/reel/references/critic.md`. Note for the critic: Glowvector's
  dark field, haze and glows are that style's signature and are exempt from the generic ban list.
- **Still open from the list below:** sub-skills `reel-research`, `reel-hooks`, `reel-script`; kit API docs for
  blockcraft / glowvector / atlas; `scripts/doctor.mjs`; skill install; cleanup; `SKILL.md` step 5 still describes the
  old voice default and must be updated to the ElevenLabs take flow.
- **Next, in order:** look at the deep-hole stills and fix; finish the leftovers above; `sound.py` for the three new
  videos; `render.mjs <slug> --variants` + `check.mjs` for all four; fresh-critic review of each (fix until every
  area >= 8); then the open items; update this file; commit and push.

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
1. **Sub-skills referenced by `skills/reel/SKILL.md` do not exist yet:** `reel-research` (step 2), `reel-hooks`
   (step 3), `reel-script` (step 4), `reel-critic` (step 8). Write each as `skills/<name>/SKILL.md`, sourcing from
   `docs/research/` (A §2-4 for research/critic, C §1-3 for hooks/script).
2. **Missing references:** `skills/reel/references/critic.md` (critic rubric, 7 scored areas, ban list; sources: A §0
   item 7, §3.8, §4) and the kit API docs `references/styles/blockcraft.md`, `glowvector.md`, `atlas.md` (model them
   on `styles/stickworld.md`; the `*-bible.md` files are look rules, not APIs).
3. **Skills are not installed** in `~/.claude/skills/` and there is no install script (copy the folders; junctions
   are untested with Claude Code's skill loader).
4. **`scripts/doctor.mjs`** is referenced by `npm run doctor` but not written (environment check: node, ffmpeg,
   rubberband, .venv imports, WhisperX venv, edge-tts reachability, Chrome headless shell, fonts).
5. **Glowvector and Atlas kits** (`src/styles/glowvector/kit.tsx`, `src/styles/atlas/kit.tsx`) typecheck but have
   never been rendered: add lab compositions like `src/lab/BlockLab.tsx` and look-dev them. Watch Atlas performance
   (all 50m country paths per frame) and the Glowvector `Grain` SVG filter cost.
6. **Blockcraft** has only been look-dev'd (`BlockLab`). Its terrain has no surface-height helper, so characters on
   hilly terrain sink in (use `flat: true` under them for now).
7. **Three planned samples** (facts already checked, below): Blockcraft x what-if, Glowvector x how-it-works,
   Atlas x map.
8. **Cleanup candidates:** pipeline test data `videos/_test/`, `src/videos/_test/`, `public/v/_test/`; the unused
   canvas measuring helpers in `src/core/captions.tsx` (`measureText`, `spaceWidth`, `layout`, `useFontReady`
   is still used); `src/lab/PostTest.tsx` / `PostRaw.tsx` (post-chain experiments).
9. **Git:** the initial commit is on branch `studio/initial-import` (`master` was never created; merge or rename when
   ready). Tracked: code, docs, skills, scripts, per-video data incl. `videos/<slug>/voice/voice.wav`. Ignored and
   regenerable: stems, 16 kHz copies, `public/v/`. No remote is configured.

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
1. Write `skills/reel-critic/SKILL.md` + `skills/reel/references/critic.md` (gap 1-2; scored areas and ban list from
   `docs/research/A-x-playbooks.md` §0 item 7, §1 #1 look-match loop, §3.8, §4).
2. Use it: a fresh subagent reviews the final Eiffel render (`videos/eiffel-tower-con/qa/sheet_*.jpg`); fix anything
   scored < 8, re-render, re-run `check.mjs`.
3. Write the other sub-skills and kit docs (gaps 1-2), `scripts/doctor.mjs` and an install step; install the skills
   into `~/.claude/skills/` (gaps 3-4).
4. Look-dev Glowvector and Atlas in lab compositions (gap 5), fix what the stills show.
5. Produce the three planned samples through the full pipeline, each passing `check.mjs` and a fresh-critic review.
6. Cleanup (gap 8); decide the main branch name and merge `studio/initial-import` into it (gap 9).
