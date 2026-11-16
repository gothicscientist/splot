# AGENTS.md: how an agent makes videos with Nomen Studio

You are an agent (Claude Code or similar) in this repo. This page tells you how to turn one line from the owner
into a finished, gated, post-ready vertical video, which skill to load for which request, and the rules you must not
break. `CLAUDE.md` holds the stable engineering rules and layout; `docs/STATUS.md` holds the live state (read it
first, update it before you stop).

## 1. One-time setup (a fresh machine or clone)
```bash
npm install
npm run doctor                  # node, ffmpeg (rubberband + ebur128), Python venv, WhisperX, Chrome, fonts, RAM, keys
npm run install-skills -- --yes # copies skills/* into ~/.claude/skills so /reel, /tiff, /ug-rap... work in any session
```
Python: `.venv/Scripts/python.exe` (3.12; `uv venv` + numpy, scipy, edge-tts, num2words) with `PYTHONIOENCODING=utf-8`.
On a fresh clone, run `node scripts/timeline.mjs <slug>` and `scripts/sound.py <slug>` per existing video before
previewing or rendering it (`public/v/` is git-ignored). Re-run the skill installer after editing anything in
`skills/` (it only replaces folders it installed itself).

## 2. Which skill for which request
| The owner says | Load | What comes out |
|---|---|---|
| "/tiff <premise>", a Tiff / Tiffany episode, a story about lowballers, the clothes chair, archive / ballhog fits, a show | `skills/tiff` | a Tiff x pileGo! episode (`tiff` mode) |
| "/ug-rap <artist / scene / premise>", an underground rapper's story, rise, biography, an underground "saga" or scenario | `skills/ug-rap` | an episode for the underground-rap channel (`ug-rap` mode: `bio`, `scene` or `scenario`) |
| any other topic for a short (explainer, true story, what-if, map, history, app promo...) | `skills/reel` | the 8 classic modes x 4 styles |
| a single step | `reel-research`, `reel-hooks`, `reel-script`, `reel-critic` | that step's output |
`tiff` and `ug-rap` are modes of the `reel` skill: the entry skills (`skills/tiff/SKILL.md`, `skills/ug-rap/SKILL.md`)
add the channel preset and the story step; every gate in `skills/reel/SKILL.md` still applies.

## 3. The two story channels
**Tiff x pileGo!** Tiff (23) is an original, obviously drawn anime-style lead (silver-lavender hair, blue eyes, black
choker, black tank, frayed jean shorts, black boots; `CAST.tiff`, model sheet `docs/characters/tiff/`). She lives on
the archive-fashion / underground-rap side of TikTok. The owner gives a broad premise; you pick a winning format,
build the story on the scene's real jokes, and tie it into **pileGo!**, the owner's app (pilego.app: snap the clothes
pile, it lists everywhere you sell, and when one sells it comes down everywhere else).
**ug-rap channel.** Stories, scene histories and scenarios of underground rap (rage, plugg, jerk, sleazepop, UK Ug...),
told with the real artists drawn recognisably from sourced look sheets (original characters in scenarios) and original music, with pileGo! tie-ins through the fans' clothes.

Read before writing a single line:
- `skills/reel/references/modes/tiff.md` or `modes/ug-rap.md`: the playbook (formats, beat sheets, hooks, visuals,
  voices, series mechanics, common mistakes).
- `skills/reel/references/brands/pilego.md`: the only product facts allowed, the look, the plug devices and rules.
- `skills/reel/references/niche/`: four fact-checked bibles (`ug-rap.md`, `archive-fashion.md`, `resale.md`,
  `story-formats.md`) with slang, artist facts, formats, cringe lists, a posting compliance checklist, check logs and
  sources. Re-check their "Freshness" tables before every episode: this scene moves weekly.
- `skills/reel/references/styles/stickworld.md`: the kit (Tiff, `frameOn`, `SCENE_CAST`, the closet kit, `Venue` +
  `look="club"`, brand devices).

## 4. The pipeline (every video, from the repo root)
```bash
node scripts/new-video.mjs <slug> --mode tiff|ug-rap|<mode> --title "..."   # scaffold + channel defaults
node scripts/lint-script.mjs <slug>                                         # gate: script rules + story-mode rules
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/voice.py <slug> --verify   # gate: ASR check (WER)
node scripts/timeline.mjs <slug> && node scripts/register.mjs
npx tsc --noEmit                                                            # gate: clean
node scripts/stills.mjs v-<slug> --shots <slug> --scale 0.5 --sheet 6       # then 1 critic + 1 verify critic, max
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/sound.py <slug>     # gate: -14 LUFS, <= -1.5 dBTP, no masking
node scripts/render.mjs <slug> --variants                                   # main MP4 + hook variants
node scripts/check.mjs <slug>                                               # gate: must exit 0
```
Scenes are hand-written per video in `src/videos/<slug>/index.tsx`, keyed to spoken words (`useShot().hit("word")`),
one component per shot. Worked example of a story episode: `src/videos/tiff-01-the-quiz/` (+ `videos/tiff-01-the-quiz/`).
Look-dev compositions: `TiffStage` (Tiff in 3D sets), `SceneCast` (side cast), `PileGoLab` (plug devices), `UgLab`
(channel devices); render one with `node scripts/stills.mjs <Id> --frames 0,30 --sheet 2`.

## 5. Rules you must not break
1. **Gates:** never show the owner a render that failed `check.mjs`, a critic FAIL, a lint error or a WER above 6 %
   without saying so plainly. The critic is always a fresh agent that did not build the video, and a video gets at most 2 critic agents (full +
   verify; "The critic budget" in `skills/reel/references/critic.md`): never loop critics until PASS.
2. **Facts:** every claim in `videos/<slug>/research.md` with its source; real people (ug-rap bios, names dropped in
   jokes): verified facts only, no rumours, allegations, private life or invented quotes, never their voice; their
   likeness only in ug-rap bio / scene episodes, drawn from the look sheet (`modes/ug-rap.md`), and never in a plug shot, and never shown or implied using or endorsing pileGo! (lint fails a plug beat that names the real subject).
3. **The plug:** pileGo! never appears before ~70 % of the runtime (lint enforces it), at most two spoken mentions,
   only the facts in `brands/pilego.md`, never "I found this app" (Tiff is the brand's own character). The owner has
   permission for pileGo!'s automatic relisting: never hedge it.
4. **Tiff framing:** frame her only with `frameOn()` (face in the upper third); never body-focused framing, low angles,
   revealing variants, school settings, or a voice / look that imitates a real person. Keep her on model.
5. **IP:** no logos or trademarks drawn (designer labels, marketplaces, platforms), no real songs, lyrics or soundalikes
   (music is generated in code: moods `plugg`, `rage`, `jerk` for these channels), no Mojang assets or "Minecraft".
6. **Outward actions:** never post anything; posting is the owner's call. Ask before pushing to git, deleting
   renders, or spending on paid APIs (ElevenLabs is optional; the free Edge voices are the default).
7. **Machine:** no NVIDIA GPU and ~1 GB of free RAM: keep render concurrency at 3 or less; parallel jobs set
   `NOMEN_BUNDLE_DIR=out/bundle-<name>`; stills and renders share `NOMEN_GPU_SLOTS` (default 2).

## 6. Before you stop
Update `docs/STATUS.md` (what is done and verified, what is not, next steps), then say in plain words what you
shipped, what failed, and what needs the owner.
