<!-- StickWorld (2D cast in a toon 3D world) look values. Research compiled 2026-11-13/14 for Nomen Studio (art-styles study + mromidev/claude-animated-shorts STYLE_BIBLE (MIT)). Numbers are measured or cited; see the sources inside. -->

### 2.B Style B: "Toon world + flat cast" (MotionLab look)

The full bible for this style is omitted here because the coordinator already holds an MIT repo that covers it ([mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts), `references/STYLE_BIBLE.md` and `references/reports/*.md`). The key measured numbers are:
- 3.5-head-height bean cast; plum ink `#241726` at about 5% of head width, with a thick/thin ratio of about 3:1.
- Limbs are single ink strokes about 0.055 W wide.
- World ink is about 3 px, constant screen width, applied before the DOF.
- Characters are lit by the scene and get contact shadows.
- The camera holds still only about 10% of the time, and every hold creeps 0.15-0.35%/frame.
- Moves are symmetric ease-in-out glides of about 23 frames.
- Characters animate on ones, with no line boil.
- No grain.
- Narration runs at 3.7 words/s, mixed to -14 LUFS.

---


### #1. mromidev/claude-animated-shorts: SKILL.md, STYLE_BIBLE.md, short_qa.py
- Repo: https://github.com/mromidev/claude-animated-shorts. Created 2026-11-01. **3,298★ / 706 forks** after 13 days. MIT.
- Companion video by Mr omi, "How to Make Viral Animated Shorts Using Claude (Full Workflow)", uploaded Nov 1, 2026: **1,042,564 views, 25.2K likes**. https://www.youtube.com/watch?v=OtbLL6OBNE4
- Amplified by @RoundtableSpace on Nov 2 (72.7K views, 881 bm): https://x.com/RoundtableSpace/status/2117236532482396349

Why it is #1: it is the open-source twin of MotionLab's look (flat 2D bean-head characters in a toon-shaded, ink-outlined 3D town, with lens blur, gliding cameras, synthesized SFX and music), and it publishes the measured target, the pipeline and the QA.

What it teaches:
- **Measure the reference first, in numbers.** Claude studied 20 shorts of an unnamed reference channel at 30 fps. It wrote a style bible and 7 reports (motion, depth, textures, characters, lighting, outlines, grade), one analysis agent per topic, with numbers instead of adjectives.
- **The reference format:**
  - 1080x1920, 30 fps, 31-78 s (median about 60 s).
  - The voice starts on frame 1-4. No intro, no logo, no outro, no call to action.
  - Narration at 3.5-4.1 words/s. Total word gaps over 0.25 s add up to less than 1 s per video.
  - -14 LUFS integrated, loudness range about 2.4 LU (heavily compressed).
  - Captions are one word at a time, white bold sans with a thin outline, lower-middle, hard swaps.
- **The script formula that 20 of 20 references follow:**
  - A paradox stated as fact in sentence 1, about 10-16 words, no setup.
  - A short setting, then 3-6 escalating beats.
  - A mystery beat.
  - A pivot on "You see," (14 of 20 videos), then the mechanism through an everyday analogy.
  - An ironic payoff, and the video ends on the last word.
- **Camera grammar:**
  - Hard cuts almost never happen: 0-1 per video in 12 of the 20.
  - The camera holds about 80% of frames.
  - Moves are ease-out bursts, fastest on the first frame and decaying over 8-10 frames.
  - Transitions are continuous: follow an object, whip pan, fly through, or a 6-8 frame dissolve.
  - The build rules add: every hold creeps forward, no static hold of 4+ frames, impact shakes that flip sign and decay over 7 frames, depth of field on about a third of screen time, and every visual reaction 0-3 frames before its word.
- **Look-match loop:**
  - Sandbox copies of the project, with one owner agent per file group (camera, world, materials, characters, post).
  - A merge step, then a fresh "Opus max" verifier.
  - The verifier compares side-by-side sheets against the reference frames, scores 7 areas out of 10 and returns a numbered fix list with frame numbers.
  - The bridge short climbed over 4 rounds (e.g. lighting 3 → 5-6, depth 4 → 6-7).
- **QA script (`short_qa.py`):**
  - Per-frame luma, saturation and motion.
  - Flags black frames (mean luma under 0.04), unplanned white frames (over 0.93), frozen spans of 12+ frames, and "pops" (frame-diff over 3x the local median).
  - Also reports EBU R128 loudness and silences, and makes 2-second contact sheets with frame numbers burned in.
- **Operational gotchas:**
  - Each Remotion bundle copies `public/` (~1.3 GB) into temp, which filled 60-110 GB. Point TEMP at a big drive.
  - Remotion writes a silent audio track, so mux the mix explicitly.
  - Film grain made files 3-4x bigger and turns to mush on YouTube.
  - 2K renders ran at about 4 fps.
  - A "readability traps" list: a one-rope swing reads as a hanging, foreground props cut by the frame edge read as blobs, flag designs collide with real-world flags.

