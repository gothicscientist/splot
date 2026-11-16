---
name: tiff
description: Make a finished Tiff x pileGo! episode, an animated vertical story short (TikTok / Reels / Shorts, 1080x1920) starring Tiff, the series' original anime-style lead from the archive-fashion / underground-rap side of TikTok, from a broad premise, with every episode tying into the owner's app pileGo! (snap the clothes pile, it lists them everywhere you sell, and when one sells it comes down everywhere else). Use when the user says /tiff, asks for a Tiff or Tiffany video, episode or story, or gives a premise about Tiff, pileGo!, archive or ballhog fashion, lowballers, reselling or underground rap for that series.
---

# /tiff: a broad premise in, a finished Tiff x pileGo! episode out

This is the `reel` skill's `tiff` mode with the channel preset filled in. Follow `skills/reel/SKILL.md` step by step:
every gate and every number there applies. This file only adds what is specific to the series. Work autonomously:
pick, decide, and say in one line what you picked (the owner asked not to be asked things).

Studio: `C:\Users\bhara\nomen-studio` (or `$NOMEN_STUDIO`). Run every command from there.

## 0. Read (every episode)
1. `skills/reel/references/modes/tiff.md`: the playbook (Tiff's character bible, premise -> story, beat sheet, hooks,
   visuals, voices, series mechanics).
2. `skills/reel/references/brands/pilego.md`: the only product facts allowed, and the plug rules.
3. `skills/reel/references/niche/story-formats.md`, `ug-rap.md`, `archive-fashion.md`, `resale.md`: the checked scene
   facts, slang, formats, cringe lists and the posting checklist.
4. `skills/reel/references/styles/stickworld.md`: Tiff (`CAST.tiff`, `frameOn`), the closet kit, `look="club"`,
   `SCENE_CAST`, the pileGo! devices.
5. `docs/STATUS.md` and the last three Tiff episodes (`videos/*/script.json` with `"channel": "tiff"`): this one must
   differ in format, villain, location and plug pattern.

## 1. Workspace
Episode number = the highest `series.episode` among Tiff episodes + 1.
```bash
node scripts/new-video.mjs tiff-<nn>-<short-slug> --mode tiff --title "<working title>"
```
It writes the channel defaults (Ava narrator, `plugg` bed, `lower` captions, `series`, `plug`, `pronounce pileGo`).
Put the owner's premise verbatim in `brief.md`.

## 2. Premise -> story (gate: the joke engine fits in one line)
Run "Premise -> story" in `modes/tiff.md`: format, joke engine, 3-5 real scene details (each a row in
`research.md` with its source), the freshness check (what you searched, in `brief.md`), the plug pattern and beat,
the closer. Outlier references: 2-3 posts of the chosen format from the niche files' sources or a fresh search;
copy the format and hook mechanic only.

## 3-4. Hooks and script (gates: hook >= 80, lint clean)
`reel-hooks` with the templates in `modes/tiff.md`; `reel-script` with the storytime template (or the format's beat
timings), dialogue via `speaker` + `voice.cast`, `plug.beats`, `series.episode`, a kicker as the last beat.
```bash
node scripts/lint-script.mjs <slug>
```

## 5. Voice (gate: --verify)
```bash
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/voice.py <slug> --verify
```
Narrator `en-US-AvaMultilingualNeural` (Edge, free); side characters from `voice.cast`. With an ElevenLabs connector,
the narrator may be one take, but dialogue lines still need per-beat voices.

## 6-8. Timeline, scenes, look check (gate: critic PASS, 2 critic agents max)
Scenes in StickWorld; Tiff framed only with `frameOn`; the relist snap in every episode; the pileGo! device after
~70 %; the `EndCard` after the last line. Stills -> ONE fresh `reel-critic` agent (both lenses: outlier bar,
phone viewer + glitch hunter) with the story-mode checks in `critic.md`, one fix pass, ONE verify critic on the
changed shots, then stop (the critic budget in `critic.md`: 2 critic agents per episode).

## 9-11. Sound, render + QA, deliver
`sound.py` (mood from script.json), `render.mjs --variants`, `check.mjs` must exit 0. Deliver the MP4 and write
`post.md` with the caption (hook restated + one line + a real comment question), <= 5 specific hashtags, 1-2 emoji
(😭 / 🥀), and the **posting checklist** from `niche/story-formats.md` ticked: TikTok "Your brand" disclosure,
Instagram "Add AI label", the pileGo! link obvious in handle / bio, no real person endorsing, claims only from
`brands/pilego.md`. Never post anything yourself: posting is the owner's call.
