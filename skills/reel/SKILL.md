---
name: reel
description: Make a finished, viral-quality animated vertical short (TikTok / Reels / Shorts, 1080x1920) from a one-line topic, entirely in code with Nomen Studio (Remotion + three.js), with researched facts, a scored hook, a word-synced voice-over, word-by-word captions, a scored soundtrack and automated QA. Use whenever the user asks for an animated / faceless / explainer / story video, a "Claude-animated video", a reel or short about a topic, an app-marketing video, or names a style (StickWorld stick figures in a 3D toon world, Blockcraft Minecraft-style voxel, Glowvector Kurzgesagt-style flat vector, Atlas map & data) or a mode (case file / true story / heist, what if, how it works / how it's made, history, back then, lore / anime / game plot, map explained, problem-solution app promo).
---

# /reel: one line in, a finished animated short out

Studio (engine + scripts): `C:\Users\bhara\nomen-studio` (override with `$NOMEN_STUDIO`). Run every command from there.
Python: `.venv/Scripts/python.exe` (use `PYTHONIOENCODING=utf-8`). Node 24 + ffmpeg 9 are on PATH.

The pipeline is the product: the prompt is ~10% of a viral-quality result, the gates are the rest. Never skip a gate,
never "eyeball" a number the scripts measure, and never show the user a render that `check.mjs` failed.

## 0. Intake (one message, then go)
Parse: topic, **mode**, **style**, platform, length, language, brand/app (for problem-solution), voice preference.
If the user gave only a topic, pick mode + style yourself from the tables below and say which you picked in one line.
Defaults: 45-62 s (61+ s if they monetise on TikTok), all three platforms, English, StickWorld for stories, Glowvector
for how-it-works, Atlas for maps/history-of-places, Blockcraft for game/what-if/kids topics.

| Mode (references/modes/) | Use for | Best styles |
|---|---|---|
| `case-file` | true stories: heists, scams, hacks, spies, disasters, "the man who…" | StickWorld, Atlas |
| `what-if` | hypotheticals with one real, checked fact | Glowvector, Blockcraft, StickWorld |
| `how-it-works` | how a thing works / is made / why your body does X | Glowvector, StickWorld, Blockcraft |
| `history` | history explained (+ dark history / war tactics switches) | Atlas, StickWorld, Blockcraft |
| `back-then` | everyday life across eras ("how did people X before Y") | StickWorld, Blockcraft |
| `lore` | anime / game / film plot & lore (original stand-in characters only) | StickWorld, Blockcraft |
| `map` | geography & borders, "why is X shaped like this" | Atlas |
| `problem-solution` | app marketing: teach the user's problem, the app shows up late as THE solution | StickWorld, Glowvector |

Switches usable in any mode: `interview` (two voices), `versus/rating`, `series` (Part 1/2, end on a comment vote).
Read the chosen mode file AND the chosen style file before writing anything:
`references/modes/<mode>.md`, `references/styles/<style>.md`.

## 1. Workspace
```bash
node scripts/new-video.mjs <slug> --style <style> --mode <mode> --title "<title>"
```
Slug: lowercase-dashes. Creates `videos/<slug>/{brief.md,research.md,script.json}` + `src/videos/<slug>/index.tsx`.

## 2. Research (gate: every claim has a source)
Use the `reel-research` skill (or follow it inline): facts with 2 sources each into `videos/<slug>/research.md`; numbers
exactly as sourced; disputed details phrased conservatively ("might be", "about"). Also find 2-3 **outlier references**
in the niche (views >> channel median) and write down their hook pattern, beat structure, pacing and visual device in
`brief.md`. Copy the FORMAT and HOOK MECHANIC, never the words, characters or footage.

## 3. Hooks (gate: rubric score >= 80)
Use `reel-hooks`: >= 12 hooks across >= 5 families, scored on the 100-point rubric in `references/hooks.md`.
Keep the top 3 from different families in `script.json.hooks`; the best one opens the video. Also write 3 **visual**
hook variants (`hookVariants`) for the same spoken hook (they change only the first shot; rendered as A/B files).
First-3-seconds rules: frame 0 already shows the subject in motion; narration starts at 0.0-0.2 s; ~9 words by 3 s;
first line <= 12 words with the topic in the first 5; one on-screen text hook of 3-5 words.

## 4. Script (gate: lint + read-aloud)
Use `reel-script` (or `references/script-rules.md`): the mode's beat sheet, 165-200 wpm (story 2D: 190-215), one sentence
per beat (6-16 words, grade <= 6, present tense for stories), a "but/therefore" chain, a re-hook every 7-12 s, the twist
at 60-80 %, end within 0.5 s of the payoff (ironic kicker or loop back to frame 0). Mark ONE keyword per sentence with
`*stars*` (boxed caption + music sting). Group beats into shots (`shot`), 1 shot = 1 set-up / location, 2-9 s, and
give every shot a motivated `transition` (whip-left/right, push, dissolve, flash, dip; hard cuts only for jumps).
Per beat write `visual` (what is on screen, literally illustrating the line), and `sfx` cues keyed to words
(`{"at": "billion", "sound": "impact"}`; graphic sounds land on the word, foley auto-moves into the next pause).
Pronunciations for names go in `pronounce`. Never describe on screen what the viewer already sees.

## 5. Voice (gate: --verify passes)
```bash
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/voice.py <slug> --verify
```
Provider auto: ElevenLabs if `ELEVENLABS_API_KEY` (best), else free neural TTS (Microsoft Edge voices, retried).
Default voice `en-US-AndrewMultilingualNeural` (warm, confident). Alternatives: Brian (casual), Ava/Emma (female),
set `voice.voice` in script.json. Timings come from forced alignment of the exact script words (WhisperX), so captions
can never contain transcription errors. If the ASR check shows a garbled word: fix `pronounce` or reword, re-run with
`--force` for that beat. Never ship WER > 6 % unexplained (respelled names are wildcards).

## 6. Timeline
```bash
node scripts/timeline.mjs <slug>
node scripts/new-video.mjs <slug> --scenes      # placeholder scene per shot (only if index.tsx not hand-written yet)
node scripts/register.mjs
```
Warnings about shots > 6.5 s mean: keep the camera moving and change the picture every 1-2.5 s inside that shot.

## 7. Scenes (the craft)
Write `src/videos/<slug>/index.tsx` (first line `// scenes: hand-written`): one component per shot, mapped in `<Reel scenes={{...}}>`.
The style file is the kit reference. Universal rules:
- Key EVERYTHING to words: `const s = useShot(); s.hit("billion")` (2 frames before the word), `s.at`, `s.end`, `s.beat("b03")`.
  A missing word throws with the list of words: fix the phrase, never hard-code frame numbers.
- Every hold creeps (camera keys default to a 0.22 %/frame push); moves are glides (18-40 f) or ease-out bursts (8-12 f);
  impacts `kicks` (sign-flip shake over 7 f). No static stretch over ~1 s, no blank or flat frame, frame 0 shows the subject.
- One hero move per moment; the subject is the brightest/sharpest thing; keep faces out of the caption band
  (y 1100-1350 px) and out of the TikTok right rail (x > 900 px, y > 840 px).
- Screen FX (`core/fx2d`: Stamp, Tag, Counter, Bubble, Mark, Burst, Arrow, FlashFX) pop on words; numbers COUNT UP.
- Hook variants: the first shot reads `variant` (0..n-1) and changes its opening picture only.
- `npx tsc --noEmit` must be clean.

## 8. Look check (gate: critic score >= 8/10 on every area)
```bash
node scripts/stills.mjs v-<slug> --shots <slug> --scale 0.5 --sheet 6
```
Read the sheet yourself, then send the sheet to a FRESH subagent with the `reel-critic` skill (it did not build the video;
self-scores run ~2 points high). Fix every numbered item, re-render stills, repeat until every area >= 8.

## 9. Sound (gate: -14 LUFS, <= -1.5 dBTP, no masked words)
```bash
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/sound.py <slug> [--mood heist|mystery|wonder|workshop|epic|comedy|drama|uplift|calm]
```
One sound identity per video (key/tempo/instrument by mood), music ~20-24 dB under the voice and ducked further on
words, SFX bus ducked under speech, transitions get air moves, keyword boxes get stings. The script auto-fixes masking
over 3 passes; if words are still masked, lower or move those cues. Re-run after ANY timing change.

## 10. Render + QA (gate: check.mjs exit 0)
```bash
node scripts/render.mjs <slug> --variants          # main file + <slug>.hook2.mp4, hook3...
node scripts/check.mjs <slug>                      # format, loudness, black/white/frozen/pops, pacing, voice, mix
```
Fails are never shipped. Read `videos/<slug>/qa/report.md` and the 1-fps sheets `qa/sheet_*.jpg` (view them).

## 11. Deliver
Send the main MP4 (SendUserFile) + mention the hook variants. Write `videos/<slug>/post.md`: the post caption
(hook restated + 1 line of value + soft CTA), <= 5 hashtags, the A/B plan from `references/posting.md`
(IG Trial Reels for hooks, 48-72 h read, kill > 30 % 3-s drop), and the sources. Label AI-generated where required.

## Hard rules
- Facts: sourced, conservative, never invented numbers. No real person's likeness, no copyrighted characters
  (lore mode uses original stand-ins), no Mojang assets or the word "Minecraft" in titles/tags (say "blocky", "voxel").
- Originality: vary ideas, scripts and visuals per upload (platform "inauthentic/mass-produced" rules).
- Quality numbers live in `references/quality-bar.md`; the ban list in `references/critic.md`. Read both once per session.
- Remotion is free for individuals and companies of up to 3 people; larger teams need a Remotion license.
