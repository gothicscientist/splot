# The reference: MotionLab / @PeefTwt, and what we took from Nomen

## The user's reference video
Source: https://x.com/PeefTwt/status/2121240962374533413 (posted 2026-11-13; ~13K views, 377 bookmarks at analysis).
Post text: an app made $700+ in a day, "100% organic", all content automated with a Claude folder (motionlab.life):
one-line topic -> Claude writes the script -> voice-over -> "animates every scene right on the words" -> post.
Tactic: **don't make a video about your app; make one about your users' problem, teach something useful, and the app
shows up at the end as THE solution.**

Measured (ffprobe / ebur128 / scene detection / WhisperX transcript):
- 43.2 s, 1080x1920, 30 fps, H.264 ~4.9 Mb/s, AAC stereo; **-14.2 LUFS** integrated.
- ~118 words in 43 s (**~165 wpm**), 10 sentences, ~1 set-up per sentence (~4.3 s each), **no hard cuts**
  (scene-change detector at 0.25 found none): camera pushes/dollies inside each set-up, dissolves/whips between them.
- **Captions:** one word at a time (function words and number+unit pairs grouped: "of code", "6 billion"), white
  geometric extra-bold sans with a dark outline, centred at ~70 % of the height.
- **Look:** toon-shaded 3D environments (night office with desk/lamp/poster/window, exchange office exterior, hallway
  with red carpet, vault with coin chutes, money raining with ground shadows, a museum podium, a border checkpoint, a
  refund counter, a night street) with depth of field and bloom on practical lights; **flat 2D stick-figure cast**
  (big white round heads, round glasses, bean-shaped coloured bodies with thick ink outlines, stick limbs, hooded
  villains with white grinning faces). Numbers on screen are in-world boards that count with the narration.
- **Script shape** (true-story "case file"): shocking-number question hook ("How could one single laptop cost $6
  billion?") -> setup (months of fake recruiters) -> "But…" turn (trapped code on one laptop) -> escalation with
  specifics (date, 20 minutes, 10 blockchains) -> aftermath (12,000 wallets) -> superlative -> twist (blame + denial)
  -> resolution -> open ending ("But the rest is still out there.").
- Visual reactions land on their word (alarm-red wash on "6 billion", the character sweats on the next word).

## MotionLab (motionlab.life), as advertised (2026-11-13)
A €49 lifetime "Claude folder" (638 files / 29 MB: skills 135, engine 26, scripts 174, editor 6; files such as
`Reel.tsx`, `Caption.tsx`, `Stage.tsx`, `Motion.tsx`, `moves.ts`, `voice.py`, `align.py`, `tighten.py`, `check.py`,
`check-caption.mjs`, `transcribe.mjs`, `doctor.mjs`, `hooks.md`, `taste.md`, `facts.md`, `interview.md`).
Claimed format "Full Visual": research with sources and fact checks; 3 hooks to pick from, then 5 visual versions to
A/B; ElevenLabs/OpenAI/Fish voice synced to the word with silences cut; word-by-word captions with one keyword boxed;
every sentence animated on its word; zero cuts, full screen, 1080x1920 at 60 fps; a post caption; preview before
render, critique, reviewers and automatic checks; any language; a saved look; a local editor.
Nomen Studio matches each of these (see `skills/reel/SKILL.md`) and renders at 30 fps by default (all 20 measured
references in this look are 30 fps; 60 fps doubles render time).

## What we took from the team's Nomen repo (https://github.com/aiden-guan/Nomen)
- `audio/synth.py` (from branch `generators/code-ads`, originally ED Studio): deterministic procedural SFX, beds,
  score composer, BS.1770 master. Used as-is, wrapped by `scripts/sound.py` + `audio/sfx_extra.py`.
- The philosophy: research outliers (views >> channel median), break them down beat by beat, copy the FORMAT and
  HOOK MECHANIC (never the words, footage or characters), a writer -> linter -> critic script room, cheap checks
  before expensive renders, a finishing chain at -14 LUFS.
- Not taken: the Naïve/Monid paid-API dependencies, the Next.js/Convex app, the three.js "code ad" scenes (their
  look was below the reference bar: muddy lighting, captions over faces, static camera).

## Also built on
`mromidev/claude-animated-shorts` (MIT): the ink-outline pass, thin-lens blur, colour grade, two-tone shading, lit
character cards and light presets are vendored in `src/core/three/look/` (see `THIRD_PARTY_NOTICES.md`); its
measured look values are summarised in `skills/reel/references/styles/stickworld-bible.md`.
