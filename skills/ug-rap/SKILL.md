---
name: ug-rap
description: Make a finished episode for the underground-rap channel, an animated vertical short (TikTok / Reels / Shorts, 1080x1920) that tells a real artist's rise (sourced biography), how a sound or scene was born, or a fictional scenario inside the Ug scene (rage, plugg, jerk, sigilkore, sleazepop, UK Ug and so on), with original stand-in characters, original music, the same quality gates as every Nomen Studio video, and a pileGo! tie-in through the fans' clothes. Use when the user says /ug-rap, asks for an underground rapper story, biography, rise, scenario or scene history video, or names an underground artist or subgenre for that channel.
---

# /ug-rap: an artist, a scene or a premise in, a finished ug-rap episode out

This is the `reel` skill's `ug-rap` mode with the channel preset filled in. Follow `skills/reel/SKILL.md` step by
step: every gate and every number there applies. This file adds what is specific to the channel. Work autonomously:
pick the kind (bio / scene / scenario), decide, say what you picked in one line.

Studio: `C:\Users\bhara\nomen-studio` (or `$NOMEN_STUDIO`). Run every command from there.

## 0. Read (every episode)
1. `skills/reel/references/modes/ug-rap.md`: the playbook (kinds, living-people rules, beat sheet, hooks, visuals,
   voice, the pileGo! rule for this channel).
2. `skills/reel/references/niche/ug-rap.md`: the scene map, artists, bio-ready list, fan culture, cringe list.
3. `skills/reel/references/niche/story-formats.md` (posting checklist), `brands/pilego.md`, `niche/archive-fashion.md`.
4. `skills/reel/references/styles/stickworld.md` (stand-ins, `Venue`, `look="club"`) and `src/channels/ug.tsx`.
5. The channel's last three episodes (`videos/*/script.json` with `"channel": "ug"`): vary artist, scene and kind.

## 1. Workspace
```bash
node scripts/new-video.mjs ug-<nn>-<short-slug> --mode ug-rap --title "<working title>"
```
It writes the channel defaults (Brian narrator, `rage` bed, `boxed` captions, `series`, `plug`, `subject`). Set
`subject` = `{"kind": "bio" | "scene" | "scenario", "name": "<artist or scene>", "real": true | false}`.

## 2. Research (gate: >= 6 rows, two sources each, for any real subject)
`reel-research` on the subject: dated facts (hometown, first uploads, aliases, the breakout release, collectives,
tours) with two independent sources each, from the bio-ready list in `niche/ug-rap.md` first; anything not
confirmable is left out. Also the fan / merch angle for the plug (what fans wore, what the merch is worth to
insiders: prices only with a source). `node scripts/lint-script.mjs` refuses a real-subject script with fewer rows.

## 3-4. Hooks and script (gates: hook >= 80, lint clean)
`reel-hooks` with the templates in `modes/ug-rap.md`; `reel-script` with the bio sheet (or the storytime sheet for a
scenario). The plug beat belongs to a fan stand-in or the narrator and never names the real subject.

## 5. Voice (gate: --verify)
```bash
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/voice.py <slug> --verify
```
Narrator `en-US-BrianMultilingualNeural`; scenario characters from `voice.cast`. Never voice a real artist.

## 6-11. Scenes, look check, sound, render, deliver
StickWorld stand-ins + the channel kit; two fresh `reel-critic` agents (story-mode and real-people checks);
`sound.py` (`rage` / `plugg` / `jerk`), `render.mjs --variants`, `check.mjs` exit 0; `post.md` with the caption,
<= 5 specific hashtags, the sources list, and the posting checklist from `niche/story-formats.md` ticked. Never post
anything yourself: posting is the owner's call.
