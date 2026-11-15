# Claude-animated vertical video: what the people getting results actually do

Research report for a topic-to-video Claude Code skill suite (1080x1920, code-rendered, Remotion-based).
Snapshot date: 2026-11-13/14. Engagement numbers were read live from the fxtwitter API, the GitHub API and yt-dlp metadata on that date.

**Method and caveats**
- About 90 primary sources read in full: X posts and X Articles (fetched by tweet ID), GitHub READMEs/SKILL.md/QA scripts, official docs (Anthropic, Remotion, HeyGen HyperFrames, ElevenLabs), YouTube metadata.
- View, revenue and "made in N minutes" claims are self-reported by creators unless marked otherwise. Several viral "one prompt" demos were shown to be misleading (see rameerez, Thariq, Florence).
- To respect copyright, the creators' prompts and articles are **paraphrased**: the numbers and rules are kept, the prose is not. Follow the links for the originals.
- MotionLab (@PeefTwt) is treated as known context and was not re-researched.

---

## 0. Executive summary (the 12 things that matter most)

1. **The harness beats the prompt.** The most-bookmarked guide of the Opus 5.5 wave (Movez, 4.27M views, 29.9K bookmarks) and a Claude Code team member (Thariq) both say the same thing: the "one-shot" videos came from long briefs (~10k characters), skills, references, API keys and review loops. Roughly, the prompt is 10% of the result and the pipeline is 90%.
2. **Three render routes dominate.** (A) one HTML file with a pure `seek(t)`/`draw(t)` function, captured frame by frame with Playwright and encoded with ffmpeg. This is what Opus 5.5 picks by itself unless told otherwise. (B) Remotion (React, official Agent Skills, `@remotion/three` for R3F). (C) HeyGen's HyperFrames (HTML+GSAP, 84K GitHub stars, now more than Remotion's 73K, and the richest built-in QA). For 3D toon worlds, people use three.js inside Remotion (mromidev) or headless Blender (nocodehack, Theo, Finn).
3. **The voice is the clock.** Everyone keys events to word timestamps, not seconds. Visual reactions and cuts land **0-3 frames before** their word. A sound effect's peak lands **about 1 frame after** its picture, and an illustrative hit goes **in the pause after** the word, not on it.
4. **Silence tightening is numeric and universal.** Pauses are capped at **0.24-0.35 s**, and only real silence is cut (e.g. below -44 dB for at least 60 ms, keeping 35 ms of handle). Pace runs **150-222 WPM** depending on the format. Never pad the voice to fit the picture: shorten the read.
5. **Two caption archetypes win.** (a) Feed style: 1-4 words, white bold sans, outline or soft shadow, **~64-104 px at 1080 wide**, centred at **64-78% of the height**, one keyword coloured. (b) Editorial karaoke: a top-left block, each word turns from grey to ink on its frame, one serif-italic keyword per line. Everything sits inside the platform-safe band (HyperFrames: **168-1330 px**; Hasan: nothing in the bottom 340 px or the right 160 px).
6. **Quality comes from measurement plus an independent critic.** Automated frame-diff checks catch black, white, frozen and "pop" frames, loudness errors, dead stretches over 3 s, lines on screen too briefly to read, tiny text and caption collisions. Contact sheets come next, then a **fresh agent that did not build the video**. One creator measured a self-score of 6.5 against a fresh critic's 4.2. One render cleared every automated check yet still looked like a horror movie.
7. **Ban lists beat adjectives.** Anthropic's own Opus 5.5 prompting guide says a vague "avoid a generic AI look" only swaps one default for another. Name the patterns instead: purple/blue gradients, glow, particles, fade-and-slide-up on everything, centred everything, cream-paper/serif/mono-label, three cards in a row, a docked logo. Florence's line sums it up: "Adjectives are where the default look lives."
8. **App marketing works, but the evidence conflicts on where the product goes.** Peef puts the app at the end. Sabrina notes CalAI shows the product within 12 s. A TikTok ad study, cited second-hand by Aurli, says 63% of the top-CTR ads show the product in the first 3 s. Make product placement an A/B variable, and close the loop on installs and revenue (Larry + RevenueCat).
9. **The hook-testing protocol is concrete.** Write 3-5 hooks per message, with only the first 3 s changing. Read retention after 48-72 h. Kill any hook that loses more than 30% of viewers in the first 3 s. Keep variants in the top 20% on 2 of 3 metrics. Never post near-duplicates back to back: 5 identical posts in a row got one founder throttled.
10. **Pacing depends on the format, so presets are needed.** The 2D-characters-in-3D story format uses almost no hard cuts: the camera holds about 80% of the time and moves in ease-out bursts. "What If" and Roblox-horror formats run 27+ cuts a minute, with shots of 0.5-2.5 s. HyperFrames' default for vertical: shots of 1-2 s and a new beat every 2-4 s.
11. **The reference look is 30 fps.** mromidev measured 20 reference "2D-in-3D" shorts: all 30 fps. 60 fps is used for UI-morph and launch films, where Playwright subframes add motion blur. If the suite renders at 60 fps it doubles the render cost; treat that as a choice, not a requirement.
12. **New since mid-2026:**
    - Opus 5.5 (Sep 22) set off a wave of code-rendered motion videos.
    - Claude Motion launched in beta on Oct 8 (Team/Enterprise only, MP4 export, no video model).
    - ElevenLabs released Eleven v4 on Sep 28.
    - Remotion shipped its Claude Code plugin, rough-notation (keyword boxes), WebGPU Whisper and HTML-in-canvas motion blur.
    - Free clones of the MotionLab look are already out: `mromidev/claude-animated-shorts` went from 0 to 3.3K stars in 13 days, and its tutorial has 1.04M views.
    - YouTube clarified its "inauthentic content" rules in July 2026.

---

## 1. Ranked sources (25), and what each one teaches

Ranked by how much each source changes the design of the suite. ★ = GitHub stars; bm = bookmarks.

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

### #2. @finnardley: three free prompts with exact numbers
- Explainer reel (Oct 30; 63.4K views, 1,028 likes, **1,901 bm**): https://x.com/finnardley/status/2116010421740007894
- Kurzgesagt-style "what if" (Oct 25; **262K views, 3,115 likes, 5,335 bm**): https://x.com/finnardley/status/2114305886420086817
- Roblox-horror story (Oct 31; 185K views, 909 likes, 1,988 bm): https://x.com/finnardley/status/2116504270199554078

What they teach: the most complete published spec for voice, silence, alignment, captions, lip-sync, SFX and loudness. All the numbers are in §3.
- Script gate: Claude writes the script and shows it before recording. The explainer shape is a 2-line hook, 3-7 points and 1 closing line.
- Voice: audition 3 voices on line 1, then render the whole read in one take so it flows.
- Pauses: tighten them only where the audio is truly silent.
- Alignment: get word times from faster-whisper and match them back to the script text. Never place an event on a guessed time.
- Lip-sync from loudness: a presenter's mouth shape is picked each frame from the voice level, with seeded blinks and nods on keywords.
- Ban list: no gradients, glow or stock photos; no full stops in on-screen text; never more than about 1 s without motion.
- Sound: one free SFX per event, peak-aligned, then a loudness master.
- Insight: Finn argues that 100K attentive learners are worth more than millions of entertainment viewers for selling something inside a video. That is the same thesis as Peef's.

### #3. HeyGen HyperFrames: the official skills' references
- Repo: https://github.com/heygen-com/hyperframes. **84,046★**, npm `hyperframes` 0.9.44, Apache-2.0, Node ≥22. There is a Claude Code plugin, and the CLI includes `check`, `snapshot --review` and `audio --json`.
- Files to read: `skills/hyperframes/references/types/vertical.md`, `captions.md`, `review.md`, `sound.md`, `motion.md`, `story.md`, `spec.md`, and `skills/media-use/references/mixing.md`.

What it teaches:
- **The vertical safe band:** nothing in the top 168 px; every word and the product inside 168-1330 px; only texture below that; nothing under the right-hand button rail.
- **Hook rules:** frame 0 is the thumbnail and the hook (never black, never a logo). The viewer decides in about a second.
- **Type and pacing:** type about 1.35x landscape size, nothing meant to be read under 28 px, about 5 English words per claim line (cut words, never shrink the type). Shots of 1-2 s, a new beat every 2-4 s.
- **Caption mechanics:** group sizes by energy, break on 150 ms pauses, start captions 0.1-0.3 s into a clip, hard-kill each group after its exit, use a fit-text function, sit about 600-700 px from the bottom in portrait.
- **Whisper failure handling:**
  - `small.en` silently translates non-English speech into English.
  - Whisper invents "Thank you." over silence.
  - Match transcript words to caption words by position, not by text.
- **`check` warnings:** `line_unread`, `dead_stretch` (over 3 s with nothing changing), `text_below_floor` (under 2.6% of the short side), `first_frame_empty`, `film_silent` (over 15 s with no sound).
- **Review protocol:**
  - Describe each beat frame as a stranger would. Anything that needs explaining is a P0.
  - Test the pictures alone, with the words covered.
  - Write notes as `t · where · problem → change · what stays`, ranked P0/P1/P2.
  - Do **not** score out of 10, because a score finds nothing to fix.
  - A fresh sub-agent gets only the storyboard and the sheets.
  - The delivery note (`REVIEW.md`) says what was measured versus only looked at, and that the sound was measured, not heard.
- **Sound rules:**
  - Every effect needs a cause on screen.
  - The peak lands 1 frame after the picture.
  - Hits sit 3-6 dB over the bed.
  - Energy under 150 Hz is inaudible on phone speakers.
  - Rotate 2-3 takes of repeated sounds: the same whoosh on every cut is the commonest tell.
  - No synthesized chimes or dings.
  - Music under a voice at about 0.14 volume.
- **Motion tells:** breathing or floating loops on titles, titles still moving after they land, a slow creeping scale, the same `power2.out 0.5s` ease everywhere, every scene entering the same way.
- **A table that turns vague words into numbers:** premium, modern, clean, dynamic, playful, cinematic.
- **Pro skills:** `reverse-any-video` (rebuild any video as an editable project, checked frame by frame) and `style-sampling` (five proven styles, including Animated Science Explainer and 3D True Crime).

### #4. Florence @flxrnc: "Opus 5.5 Motion Lab: Make Claude Animate Like a Studio" (X Article)
- Sep 30; **1,662,916 views, 2,270 likes, 8,920 bm**: https://x.com/flxrnc/status/2105311836190978392

What it teaches:
- **Directed versus vague, tested side by side.** A vague prompt produced the defaults: navy space, a halo, bloom, particles, an invented tagline. A 448-word directed prompt fixed that, but needed 15 picture follow-ups and 12 sound follow-ups.
- **The motion numbers cheat sheet:** easing by role, exits 40-50% shorter than entrances, springs named by damping ratio (Remotion's default spring works out to about 0.5), stagger values, the beat-grid formula, holds of at least 0.3 s per word plus 0.5 s, contrast of 4.5:1, at most 3 flashes per second, key poses exaggerated 10-30% at phone size.
- **A "render contract":** no clocks or timers, seeded randomness, loops rendered as frames 0..N-1, and the ability to freeze any frame by URL (`?t=`).
- **A numeric audit:** 71 checks of the live scene against the prompt's numbers. 6 failed on the first run.
- **Sound measured, not heard.** Opus can't listen, so it checked sync by decoding the MP4:
  - the first hits peaked 8-11 ms late;
  - the codec added 16 ms of padding at the loop seam;
  - one mix put 80% of its energy under 60 Hz, which phone speakers can't play.
- **Receipts:** publish the follow-up count with the work (e.g. 10 picture + 5 sound follow-ups for one 6 s loop). People trust receipts; "one prompt" makes them suspicious.
- **Effort setting:** medium by default; raise it only after two misses.
- **Engine choice:**
  - Plain HTML for a single idea under 10 s.
  - Remotion for series, templates or data-driven video.
  - HyperFrames if you think in GSAP.
  - three.js for anything 3D.

### #5. Movez @0xMovez: "How to build motion design studio with Opus 5.5 (Full-course)" (X Article)
- Sep 27; **4,267,879 views, 10,233 likes, 29,880 bm** (the most-saved source found): https://x.com/0xMovez/status/2104216919033192746
- Near-duplicate recap by @ridark_eth on Oct 2 (80K views): https://x.com/ridark_eth/status/2106005237190275109

What it teaches:
- **Why first tries look the same.** The default (centred text on a gradient, everything fading in, a logo at the end) comes from three missing things: a reference, a render engine, and self-review.
- **Opus picks its own engine.** Tommy Rossi's teardown found Opus 5.5 chose single-file HTML + Playwright + ffmpeg and skipped Remotion and HyperFrames even when they were installed. Name the framework explicitly if you want one.
- **Effort.** Every viral one-shot ran on xhigh or max. Use medium for fixes.
- **"Brief contagion."** Hundreds of people pasted the same showreel prompt and got reels that rhyme with each other. Use one-liners only as a smoke test.
- **Selling something? Three lines.** Tony Dinh's TypingMind reel took under 30 minutes, against $1,000+ for an agency video a year earlier. The three lines: the product URL, "use the actual product screenshots, logo and assets", and "must have music". Keep one session per brand.
- **The director's-brief skeleton:**
  - a logline;
  - references to keep or push;
  - a toolbox and budget;
  - a character bible with an identity lock;
  - a beat sheet with a hook in the first 2 s and a payoff every 3-5 s;
  - rules for on-screen text;
  - gates: plan → rig → stills → animatic → full pass → polish → audio → render;
  - self-review until every score is 8+;
  - deliverables: MP4, poster frame, contact sheet, loop check, README.
- **Multi-format.** Write scenes against a layout function so 9:16, 1:1 and 16:9 render from one timeline. Reframe each format; never crop.
- **Generate-then-trace.** A video model renders base motion, then Opus redraws everything in code on top.
- **Ship it as a skill or a service.** The Pocketsflow creator, @achxvi, sells the voice-plus-mascot format as a service (his reel got 1.15M views).

### #6. kelano86/what-if-animation, plus @kelanoo's launch post
- Repo (341★, Oct 21): https://github.com/kelano86/what-if-animation. Read `SKILL.md`, `references/look.md`, `traps.md` and `formula.md`.
- Launch post (Oct 24; 54K views, **1,721 bm**): https://x.com/kelanoo/status/2114000213656702984. He says he reverse-engineered a channel that got 7M views in its first 30 days.

What it teaches:
- **The seven-beat What If formula,** decoded from 4 channels, compressed to 15-25 s: a cold open with 3 quick demos, the premise on a title card, the fun, then the turn on one real, checked fact with a number. End on a question or a threat, never a resolution.
- **Script length:** 45-65 words, about 2.7 words/s after tightening. Every line must be a picture.
- **An 11-point storyboard checklist** run before any animation:
  - it reads in one second at phone size;
  - shot sizes change between neighbours;
  - light comes from a visible source;
  - the character is the brightest thing in its area;
  - a dark blurred foreground in about a third of shots;
  - wides show 20+ designed objects;
  - perspective holds;
  - acting matches the line;
  - continuity across shots;
  - text is only the title and readouts;
  - nothing resembles existing IP.
- **A motion check:** anticipation before big moves, a 2-frame hold on realization, overshoot and settle, nothing static over about 1 s, the action within 3 frames of its word, no pops.
- **`mixcheck.py`:** flags any moment where SFX or music comes within 3 dB of the voice while a word is spoken.
- **Cost reporting:** about 152 ElevenLabs credits per episode. A growing SFX library makes later episodes cheaper.
- **Rules:** facts live in a `science` field with sources; search YouTube for the premise first; never claim the viral channels are made with Claude.

### #7. Hasan Aboul Hasan: claude-faceless-shorts-creator, plus his free guide
- Repo (361★): https://github.com/hassancs91/claude-faceless-shorts-creator
- Guide (Jul 30, 2026): https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/

What it teaches:
- **A six-beat grammar on a 42 s short:**
  - Hook, 0-3.4 s: frame 0 is already the payoff and doubles as the thumbnail.
  - Setup to about 11 s: one piece of context, not the history of the topic.
  - An optional quiz card (about 2.5 s) that makes viewers guess.
  - A reveal in 2-4 steps, each on its spoken word.
  - A twist before the end.
  - A loop: the last frame equals frame 0.
  - No engagement outro.
- **Script length with numbers:** about 100 words per 40 s.
  - 2.7 words/s stayed clean (the TTS sped up at most 1.11x).
  - 3.3 words/s forced a 1.3x speed-up that sounded cheap.
- **QA rule:** render a frame at the exact moment of each payoff line and check that what the narration names is on screen. Checking only at beat boundaries missed a half-formed traffic jam.
- **Safe areas:** captions centred around y≈1500; nothing important in the bottom 340 px or the right 160 px.
- **A two-file brand contract:** `brand.md` is what the skills read and `brand.ts` is what the code imports. They drift if you edit only one.
- **Three tracks:**
  - pure code (Remotion TSX);
  - a generative track with a locked character sheet, where cost is stated before spending and a locked character is never regenerated from text;
  - a Vox-style collage track.
- **Library-first SFX** with measured audibility (an RMS difference, not hope).

### #8. Theo @theoardley: "how to make viral videos with Claude Code for $0 (full guide)", plus his Zack D. Films-style prompt
- Guide (Nov 1; **516,785 views, 1,843 likes, 4,995 bm**): https://x.com/theoardley/status/2116684286837330374 (also resolves under /theoxmotion/)
- Zack D. Films-style Blender prompt (Nov 10; 12.4K views): https://x.com/theoardley/status/2120124748159996152

What it teaches:
- **A map of the formats that are working, with numbers:**
  - "You Built It" 3D cut-away backyard: the page's first TikTok got 13.1M views; 48 TikToks got 58.6M views since Oct 11.
  - Stickman survival stories in parts, ending on a comment vote: @itsquarkboi's first reel got 1.7M, and 12 of 13 reels passed 100K.
  - Talking-teacher lecture reels: ByteByteGo's 1.99M; Jeff Su's 877K, about 36x his channel median.
- **A "blind Claude rater"** scored both his rebuilds and the originals (e.g. his stickman 104/120 against the originals' 96-99). That is a useful eval harness. His three repos now return 404.
- **The Zack D. prompt's numbers:**
  - 38-50 s, 100-140 words, 150-180 WPM, voice from 0.0 s.
  - Line 1 is the most surprising physical act. Each sentence starts with a hinge word and shows one visible action. The context comes late, after "You see,". No call to action.
  - Captions: 2-4 words, about 64 px at 1080 wide, centred at 78% of the height, soft shadow, no box.
  - A new picture for every caption chunk (about 1-1.5 s).
  - Pauses of at most 0.35 s.
  - A `sources.md` file with links and dates; anything unverifiable stays out.
  - A contact sheet every 0.5 s, plus a black-frame and one-frame-flicker check.
  - An extra 1008x1152 crop under 10 MB for X.
  - Calm shots only, because fast body action looks stiff.
- **Model comparison on the same prompt:**
  - Opus 5.5 ignored the caption spec (it used ALL CAPS with a thick outline), and one of its shots opened on a blank grey frame.
  - Fable 5.2 followed the spec.
  - Lesson: instruction adherence needs automated spec checks.

### #9. Remotion official: Agent Skills, the Claude Code plugin, licensing
- Launch post (Jan 20, 2026; **18,887,286 views, 21,887 likes, 38,136 bm**): https://x.com/Remotion/status/2013626968386765291
- Skills repo (6,979★; skill version 4.0.543): https://github.com/remotion-dev/skills
- Plugin (Jul 2026): `claude plugin marketplace add remotion-dev/claude-code-plugin`
- License page: https://www.remotion.dev/license

What it teaches:
- **Workflow:** open Studio and keep it live while building; render only when explicitly asked.
- **`video-layout.md`:** decide what the viewer notices first; keep a safe area of at least 80 px at the sides and 100 px at top and bottom at 1080 wide; headline at least 84 px; supporting text at least 44 px.
- **`voiceover.md`:** ElevenLabs per scene, then `calculateMetadata` sizes the composition from the audio length. The sample uses `eleven_multilingual_v2` with stability 0.5, similarity 0.75, style 0.3.
- **`silence-detection.md`:** take the `input_thresh` from ffmpeg `loudnorm`, feed it to `silencedetect` with d=0.5, and trim leading and trailing silence.
- **Captions:** the Basic Captions element. Keep a clip's captions inside the same `<Sequence>` as the clip so trims and speed changes carry over.
- **New pieces:** `@remotion/whisper-webgpu` (local Whisper on the GPU, Aug 2026); `@remotion/rough-notation` (highlight, circle, underline, box and strike drawn by frame, Jul 2026). Rough-notation is the right primitive for a "one keyword boxed" caption effect.
- **Motion blur:** `HtmlInCanvasMotionBlur` (from 4.0.529; 8 samples, 180° shutter by default).
- **Easing:** `interpolate` with `Easing.bezier(0.16,1,0.3,1)`, and `output:'perceptual-scale'` when animating scale.
- **3D:** wrap it in `<ThreeCanvas>` and drive everything from `useCurrentFrame()`. **Never** use R3F's `useFrame`, which causes flicker.
- **License warning:** free for individuals and companies of up to 3 people. Otherwise:
  - "Remotion for Automators" ($0.01 per render, $100/month minimum) covers prompt-to-video products and batch rendering.
  - "Remotion for Creators" ($25 per seat per month) covers local AI-agent work.
  - This matters if the suite sells to teams.

### #10. nocodehack/make-short: Blender, a critic agent, and lessons that compound
- Repo: https://github.com/nocodehack/make-short

What it teaches:
- **Self-scores are inflated.** Claude rated its own render 6.5; a fresh critic gave the same render 4.2. After critic-driven fix rounds it reached 7.9.
- **The critic** scores against a rubric and gives the exact second of every lost point.
- **Lessons compound.** Every mistake becomes a written rule in `references/lessons.md`.
- **Team structure:** an Opus manager and 4 Sonnet workers (look, characters, world, shots) coordinated through a `CONTRACT.md`.
- **Gates:** story, plan and render approvals.
- **Publishing:** never posts until the user types "go"; uploads go out private first.
- **Measured cost for a 15 s short:** about 26 minutes, about 3% of a 5-hour Max 5x window, about $5 at API prices. ElevenLabs costs about 1 credit per character (202 credits for 15 s).

### #11. @twoclipping: the UI-morph XML prompt template
- Sep 24; **1,189,480 views, 12,822 likes, 21,235 bm** (the most-saved free video prompt Theo found): https://x.com/twoclipping/status/2103273003555402193

What it teaches:
- **A structured-spec format:** sections for inputs, direction, structure, build, gotchas and start. It became the de-facto template for dozens of skills.
- **Its direction:**
  - One shape that is never cut, morphing between states.
  - Springs with a tiny overshoot at most.
  - Banned: bouncy easing, particle bursts, glows, dead time.
  - Last frame equals first frame, so it loops.
- **Its build:**
  - A pure `seek(t)` function. Closed-form springs, one per target change, summed so any frame renders on its own.
  - A beat grid measured with numpy, starting on a downbeat. SFX placed by their measured peak.
  - Playwright captures 4 subframes per frame, blended with ffmpeg `tmix` for motion blur at 60 fps.
  - Render one frame per beat before the full render.
- **Gotchas:**
  - `will-change` on a camera-scaled element makes text blurry.
  - Text swapping inside a morphing container needs its own enter and exit timing.
  - For a clean loop, cursor position and speed must match at the seam.
- It spawned AbubakrChan/product-launch-motion (461★), which now also sells done-for-you films at launchvideos.app from $20.

### #12. Vox @Voxyz_ai: huashu-art-motion, plus three curation posts
- huashu-art-motion (Oct 12; **257,599 views, 3,802 bm**; repo 6,880★): https://x.com/Voxyz_ai/status/2109690569563746755
- The "15 repos" list (Oct 10; 162.8K views, 1,509 bm): https://x.com/Voxyz_ai/status/2108905392776360333
- lemo-opuscar (Oct 15): https://x.com/Voxyz_ai/status/2110838129326473353
- motion-prompt (Oct 17; 65K views, 1,667 bm): https://x.com/Voxyz_ai/status/2111502499048026232

What they teach:
- **A delivery gate (huashu-art-motion):**
  - A QA script runs first.
  - Then an agent that took no part in making the film watches only the finished film and writes up the problems.
  - The delivery script refuses near-static films, blank stretches of 0.3+ s mid-film, and blue-purple backgrounds covering more than 30% of the film, a palette it counts as AI slop.
- **Reference recreation:** first break down a reference's cuts, beat and what moves where; then show 3 stills in 3 styles to choose from; then give each scene 1 main action plus 2 motif loops.
- **lemo-opuscar** (15.8K★, now 99 styles): a film takes 30-60 minutes and many tokens, and the first run downloads over 1 GB.
- **motion-prompt** (2.1K★): a clickable gallery of 120 labelled motion samples. The agent receives the motion spec and reference code for each sample you pick.

### #13. Rexan Wong @rexan_wong: the workflow behind the "one prompt" videos
- Sep 26; **652,518 views, 6,901 likes, 18,187 bm**: https://x.com/rexan_wong/status/2103707054108299437

What it teaches:
- Give a reference video, and name the style rather than describing it.
- Install an engine (HyperFrames or Remotion).
- Use real UI components (21st.dev) instead of UI Opus invents, which reads as cheap.
- Dump the brand and real screenshots into the brief.
- Ask for **3 storyboard variants**, then one still per scene before anything moves.
- Give notes in camera words (e.g. "slow every zoom to 0.7x"). His estimate: the first render is about 80% there.

### #14. Javi @rameerez: an honest field report
- Jan 26; **318,533 views, 1,720 likes, 2,098 bm**: https://x.com/rameerez/status/2015859121661059569

What it teaches:
- Vibe-coded Remotion video was 10-20x slower than building app code.
- It needs frame-by-frame correction.
- Claude has weak spatial and temporal reasoning: z-order, layers, proportions, temporal coherence.
- "Make it better" produces slop.
- Many viral "one prompt" demos were fake.
- **His key tip: parameterize every keyframe.** Hard-coded magic numbers make one retime cascade through the rest. Anchor the key moments and derive everything else from them.

### #15. Oliver Henry @oliverhenry: Larry, an OpenClaw agent doing app marketing on TikTok
- Feb 17; **1,363,059 views, 2,833 likes, 10,582 bm**: https://x.com/oliverhenry/status/2023776478446436696
- Skill: ClawHub "larry"; open-source port: https://github.com/Upload-Post/upload-post-larry-marketing-skill

These are slideshows, not animation, but the posting and funnel lessons carry over:
- **Hook text:** 6.5% of the image height, 30% from the top. The top 10% hides under the status bar and the bottom 20% under the caption and buttons. Manual line breaks every 4-6 words. The whole hook on the first slide.
- **Captions:** storytelling that continues the hook and mentions the product naturally. At most 5 hashtags.
- **Posting:** upload as drafts and add trending audio by hand. He claims about 10x the reach of no music; the API can't attach trending sounds.
- **Account warm-up:** 7-14 days before automating.
- **A daily report** crossing TikTok views with RevenueCat conversions, diagnosing each post:
  - high views, no conversions → rotate the call to action;
  - low views, good conversions → test new hooks;
  - downloads but no paying users → fix onboarding or the paywall.
- Three variations of every winning hook are generated automatically.
- The skill file grew from about 50 to 500+ lines, every rule learned from a failure.

### #16. Nadia Zueva @nestymee: "FGC > UGC" (Aesty), plus her $0 hook-testing playbook
- Article (Oct 26; 52.9K views): https://x.com/nestymee/status/2114723318033223994
- Testing playbook, as summarized by Vox (Jul 22): https://x.com/Voxyz_ai/status/2079997406481973556
- Skills: https://github.com/nestyme/awesome-prompts (`ugc-hooks`, `trendwatch`, `tiktok-shadowban-check`)

What it teaches:
- **Hook mining:**
  - Claude scraped 249 viral app promos and sorted them into 15 hook formats.
  - Only the last 6 months count, because hooks get copied across apps within weeks.
  - Hooks are read off the first frames with OCR.
  - Competitor comments are mined: a 10K-like question under a rival's video became her main hook.
- **Testing:**
  - 3-5 hooks per message, with only the first 3 s changing.
  - Post the batch to TikTok, Reels and Shorts.
  - Read retention after 48-72 h; kill any hook that loses more than 30% of viewers in the first 3 s.
  - Keep variants in the top 20% on 2 of 3 metrics: watch-through, saves plus shares, profile visits.
- **Throttling:**
  - 5 identical posts in a row got her account throttled.
  - Never mirror one post across your own accounts on the same platform; spread variants across days.
  - At low view counts, engagement above about 1% means throttled; below 1% means the content is failing.
- **Privacy:** a frame-by-frame scan of screen recordings caught a private photo and a friend's name before posting.
- **The counterpoint:** she believes viewers trust organic *AI video* less and less. That argues for code-animated video that doesn't read as "AI", plus real product footage.

### #17. awesome-claude-video-skills: a curated list plus a 16-skill bake-off
- Repo (2,039★; 499 repos listed and security-graded): https://github.com/zhuyansen/awesome-claude-video-skills

What it teaches:
- On 2026-10-11, the maintainers had 16 skills make the same 15 s promo. **Claude Code with no skill passed all 4 basic checks in 4.4 minutes.**
- All 16 skills also passed. They took 2.0-23.5 minutes (HyperFrames was slowest at 23.5). 9 of 16 added sound, and 6 of 16 looked like the no-skill default.
- The lesson: a skill only earns its place with a distinct look, a workflow, or footage handling.
- The list is also the best map of competitors (see Appendix A).

### #18. Big Iron Chris @bigironchris: SageCut, cheap frame QA
- Oct 14; 90,015 views, 407 bm: https://x.com/bigironchris/status/2110402795060822460

What it teaches:
- Having Claude sub-agents review every frame cost about $127 and 4+ hours per video.
- Routing all frames through a cheap multimodal model and sending only the defective ones to Opus gave the same output in 6 A/B tests, at 1/10 the cost and 1/4 the time: 3,153 frames for $0.16.
- Design implication: put a cheap triage step before expensive review.

### #19. explainroo: QA you can run on any MP4
- Repo (523★; fastest in the bake-off at 2.0 min): https://github.com/vincentsch/explainroo

What it teaches:
- `check`/`verify` work on any MP4 and report:
  - black or blank frames and stretches where the picture stands still;
  - silence, loudness and true peak;
  - text too small to read on a phone (`--view-width 854`);
  - with `--script`, the words the TTS got wrong, found by running speech-to-text and comparing with the script.
- A word-level cut tool with crossfades at every join.
- A `vertical-short` format with the hook in the first second.
- A `--max-cost` budget required for paid generation.

### #20. whaleyxbt/claude-motion: taste, a self-review loop, and a sound engine
- Repo (972★): https://github.com/whaleyxbt/claude-motion

What it teaches:
- Motion rules with numbers: `bezier(0.16,1,0.3,1)` entrances, exits at half the duration, 0.09 s between words.
- A review loop: a contact sheet with one timestamped frame per beat, checked for collisions, clipping, holds, safe area and phone readability.
- A stdlib-only Python SFX engine whose mastering reaches -14 LUFS on its own.
- **One `timeline.json`** read by the scenes, the sound and the review, so retiming the picture retimes everything.

### #21. Anthropic official: Claude Motion help, plus the Opus 5.5 prompting guide
- Claude Motion (dated Oct 8, 2026): https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
  - Beta on Team and Enterprise plans only.
  - Builds animations as code, with no video model, so no realistic footage or people.
  - MP4 export; edits by chat or in the editor; counts against usage limits.
  - Tip: say who will watch, where it plays and how long it should be, and attach your own data.
- Opus 5.5 prompting guide: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
  - Without design direction the model falls back on a few default styles.
  - Generic "avoid AI look" instructions just swap defaults.
  - Name specific patterns to avoid, check which ones the first result used, and extend the list.
- Context: Opus 5.5 launched Sep 22, 2026 (@claudeai: 29.7M views).

### #22. Sabrina Ramonov @Sabrina_Ramonov: faceless videos to market an app
- Aug 18; 368,435 views, 1,084 bm: https://x.com/Sabrina_Ramonov/status/2089761229418221683

Her route is generative (image → Seedance clip, about $0.75 each), but the marketing rules carry over:
- Formats that sell: problem → solution with your app as the fix; before/after; a "5 tools for X" countdown with your product at #1; a relatable story.
- CalAI shows its product organically within the first 12 s, which she says converts better than a watermark.
- TikTok's Creator Rewards only pays on videos of 60 s or more.
- Check a clip's dimensions before paying for it, and pull a frame after it arrives.
- Warm accounts up before automating.
- Publish through an API (Blotato).

### #23. cth9191/animate (Chase AI)
- Repo (1,825★); tutorial 202.8K views: https://github.com/cth9191/animate

What it teaches:
- Three cheap approvals before any animation: a story check (beats, with facts web-checked), a look check (2-4 style frames), and a storyboard.
- Measured delivery checks: cuts on the beat grid, the loudness arc of the story, hero anchoring, the loudest moment arriving after a silence, narration pace.
- A frame-hash regression test that confirms a kit change left a piece pixel-identical.
- Its craft rules include going silent before the payoff and being loudest on it, and making the end a changed version of the start.

### #24. OpenMontage, hypit and reelmimic: multi-agent production systems
- OpenMontage (80.2K★):
  - The storyboard is a real approval gate: a contact sheet showing takes, prompts, per-asset cost and quality scores before anything renders.
  - "Delivery promise enforcement" blocks renders that look like slideshows.
  - Mandatory post-render self-review (ffprobe + frame extraction + audio analysis).
- hypit (29.6K★):
  - Workflows are anchored to words instead of seconds.
  - Pitched as "1 command, 100 variants": 50 hook variants of a winning ad in a day.
  - WhisperX alignment; colour-box karaoke captions.
- reelmimic (2.0K★):
  - Up to 6 agents, and every finished shot is reviewed by a different agent.
  - Every fix needs before/after screenshots as proof.

### #25. Short but useful
- **Corey Ganim**, "Remotion Recaps" (Oct 27; 14K views, 329 bm): https://x.com/coreyganim/status/2115115153540669747
  - Use 6-10 scenes of 2-5 short lines, one idea per scene.
  - The default Mac voice sounds robotic; swap it for a better TTS.
- **Elvis @omarsar0** (Feb 10; 46.7K views): https://x.com/omarsar0/status/2021222728393687217
  - Claude-in-Chrome watches Remotion Studio and fixes what it sees. That is visual self-correction without screenshots pasted by hand.
- **Elliot Padfield** (Oct 22; **245.6K views, 8,285 bm**): https://x.com/ElliotPadfield/status/2113393903923581149
  - The Internet Archive API needs no key: Prelinger public-domain films and 78 rpm records for free b-roll and period music.
- **Ole Lehmann** (Jan 23; 213K views, 3,412 bm): https://x.com/itsolelehmann/status/2014740993208188959
  - Change one thing per prompt.
  - Tell Claude the intro/main/outro structure up front.
  - Expect 2-3 minutes per iteration.
- **Nate Herk** (Sep 8): https://x.com/nateherk/status/2097449583811125739
  - Cut retakes, stutters and silences *before* building visuals, or the timing shifts underneath the animations.
- **zafkiv** (Nov 3): https://x.com/zafkiv/status/2117568630082662709
  - Render a 2-second test before building 15 seconds.

---

## 2. MUST-HAVE feature list for the suite

Each feature below is backed by at least one source above. "Must" means the best creators all do it or a failure mode forces it. "Should" means it differentiates.

### A. Orchestration and production gates
- **Must: stage gates with cheap artefacts first.**
  - Gates: topic and facts → script → hooks → voice → shot plan (`story`/timeline JSON) → **stills and storyboard sheet** → animatic or draft → full render → mix → QA → delivery.
  - Sources: Movez, cth9191, what-if, Rexan, mromi, OpenMontage.
  - Never spend voice credits before the script is approved (Finn, Theo).
  - Never run a full render before the stills pass (what-if; stills take about 2 s, a full episode about 2.5 min).
- **Must: one timeline file as the single source of truth.** Every beat, shot, caption chunk and SFX cue is keyed to a **word index** with a per-event offset. Scenes, sound and QA all read it (whaleyxbt, hypit, Finn's word-index keying).
- **Must: parameterized keyframes, no magic numbers** (rameerez), so a retime or a voice change re-flows everything.
- **Must: resumable state.** Save after every stage, skip frames already on disk, re-render only the shots that changed (Theo, mromi, OpenMontage checkpoints).
- **Should: cost and usage ledger.** Record TTS credits and API spend per run. Show the cost *before* any paid generation, enforce a budget cap, and report the total at hand-off (what-if, make-short, explainroo `--max-cost`, Sabrina).
- **Should: effort policy.** Medium effort for fixes, xhigh for new films, max only for hooks that carry a launch (Movez, Florence).

### B. Research and fact-check
- **Must: a source file** (`sources.md`/`facts.md`): every claim with its URL and the date it was read. Anything unverifiable is left out (Theo, mromi, what-if `science` field, make-short).
- **Must: numbers worked and checked before they enter the script.** Never round a number into a different claim (what-if formula).
- **Must: a premise duplicate check.** Search YouTube/TikTok for the same premise and change the angle if it is taken (what-if). Never copy a channel's scripts, characters or titles (mromi, what-if).
- **Should: audience-problem mining for app marketing.**
  - Scrape the niche's viral promos from the last 6 months and cluster their hook formats (Nadia: 249 promos → 15 formats).
  - Read hooks off the first frames with OCR.
  - Mine the top comments under competitors' videos for the main hook.
- **Should: product truthfulness guard.** Never invent features, statistics or customer results (zafkiv). Keep every number exactly as given (MotionKit, Claude Motion).

### C. Hook generation and selection
- **Must: 3+ hooks on known formulas, picked by a human.**
  - Formulas: a paradox stated as fact (10-16 words, sentence 1, no setup); a surprising physical act in the past tense; problem-first; contrarian; micro-proof; a "what if" premise with three demos.
  - Sources: style bible, Theo, daniel's 10,114-video analysis, what-if.
- **Must: frame 0 is the hook and the thumbnail.** Fully composed, never black, never a logo, no fade-in (HyperFrames, Hasan). The first line goes on screen as text as well, for muted viewers (Aurli, HyperFrames).
- **Must: a visual hook as well as the spoken one.** Visual, text and audio hooks run at the same time (Buffer). Something changes by 0:02-0:03 (daniel).
- **Should: structured visual-hook variants.** Hold the body constant and vary only the first 1.5-3 s: the frame-0 composition, the opening camera move, the hook text, and the *product placement timing* (end vs first 12 s vs first 3 s).

### D. Scripting
- **Must: format presets with their own pacing.**
  - 2D-in-3D story: 55-70 s at about 3.7 words/s.
  - What-If: 15-25 s, 45-65 words.
  - Lecture or explainer: 30-60 s.
  - Zack D. style: 38-50 s, 100-140 words.
  - Faceless TSX explainer: 40 s ≈ 100 words.
- **Must: writing rules.**
  - Every line is a picture.
  - Never narrate what the viewer already sees (mromi).
  - Short spoken sentences (3-8 words for What-If; a median of about 13.5 words for story shorts).
  - Hinge words that chain cause and effect (Then, Suddenly, So, Because, But).
  - A late "You see," pivot into the mechanism.
  - End on the consequence or the payoff. No call-to-action outro (Hasan, style bible, Theo).
- **Must: app-marketing structure (Peef's thesis plus others).**
  - Teach the user's problem.
  - The app appears as *the* solution, shown as a real UI or screen recording.
  - The caption continues the story and names the product naturally (Larry).
- **Should: words-per-second fit check.** If the script needs more than about 1.1x TTS speed-up to fit the target length, cut words; don't speed up the voice (Hasan).

### E. Voice
- **Must: a provider abstraction.**
  - ElevenLabs `eleven_v4` (Sep 28, 2026), or `eleven_multilingual_v2`, through the with-timestamps endpoint.
  - OpenAI TTS.
  - Fish Audio (hosted API; the weights are non-commercial).
  - Local Kokoro as the free fallback. Qwen3-TTS for permissively licensed cloning.
- **Must: render the whole script in one take** so the read flows (Finn). Cache it: re-timing the gaps should cost nothing (what-if).
- **Must: only time-stretch, never pitch-shift** the narrator: ffmpeg `atempo` 1.0-1.25x (Finn). Kokoro at speed 1.0-1.1.
- **Must: voice audition.** Render line 1 in 3 voices and let the user pick (Finn).
- **Should: emotional direction** through v4 audio tags (e.g. [whispers], [excited]) and IPA pronunciations for brand names (ElevenLabs v4).
- **Should: speech QA.** Run speech-to-text on the output and diff it against the script to catch mispronounced or dropped words (explainroo).

### F. Alignment (word timings)
- **Must: two-source alignment.**
  - Use TTS character/word timestamps where available (ElevenLabs).
  - Otherwise run faster-whisper, WhisperX, Parakeet (sherpa-onnx) or `@remotion/whisper-webgpu` on the **final, tightened** audio.
  - Match the result to the script with a sequence diff (`difflib`) by **position**, not by text, so repeated words keep their own times (Finn, HyperFrames).
- **Must: silence-aware word boundaries.** Whisper swallows pauses into the next word, so find silences in the waveform and snap word edges to them (Finn).
- **Must: transcript sanity checks.**
  - Drop "Thank you." hallucinated over silence.
  - Fail the transcript if more than 20% of tokens are junk.
  - For non-English audio, pass the model and language explicitly (`small.en` translates) (HyperFrames).
- **Should: a hand-fix pass** on keyword timings (mromi does this for every short).

### G. Silence tightening
- **Must: an adaptive silence detector.** Measure integrated loudness and the gating threshold with ffmpeg `loudnorm`, then run `silencedetect`, or measure loudness directly in 30 ms windows (Remotion, Finn).
- **Must: pause targets by context.**
  - Inside a line: about 0.11 s.
  - Between sentences: 0.24 s (cap at 0.24-0.35 s).
  - Before a reveal or twist: about 0.30-0.36 s.
  - After a dramatic blackout: up to about 0.95 s.
  - Keep 35 ms of handle on each side of every cut (Finn's Roblox and Kurzgesagt specs, Theo).
- **Must: re-align after tightening**, or measure timings on the tightened file only.

### H. Captions
- **Must: 2-3 presets with strict geometry.**
  - **Feed** (most formats): 1-4 words per group, white bold sans, ~64-104 px at 1080 wide, 8-13 px outline or a soft shadow, no box, centred at 64-78% of the frame height. One key noun coloured or boxed. Punctuation stripped. Each group replaces the last on the same frame as its picture (Theo, Finn, style bible).
  - **Editorial karaoke** (explainers): a top-left block about 850 px wide. Each word appears on its spoken frame in light grey and turns ink in about 0.2 s. One serif-italic keyword per line at about 1.16x in an accent colour (Finn).
  - **No captions** (pure picture stories): mromi's rule. Never caption a reaction or a sound word (what-if, Finn).
- **Must: grouping logic.**
  - 2-3 words for high energy, 3-5 conversational, 4-6 calm.
  - Break at a sentence end, a pause of 150 ms or more, or the word limit.
  - One group visible at a time, with a hard kill on exit.
  - Don't start a caption at exactly 0 s.
  - Each word appears about 0.03 s before it is spoken; hold the last word about 0.25 s.
  - Sources: HyperFrames, Finn.
- **Must: a keyword emphasis engine.** Pick one keyword per line by importance (noun, number, the brand). Render the emphasis as a colour, a scale-up (≤1.16-1.2x, re-fit the width), a Remotion `rough-notation` `<Box>`/`<Highlight>`, or a boxed chip.
- **Must: safe-zone guard (automated).**
  - Text only inside 168-1330 px vertically (HyperFrames).
  - Never in the bottom 340 px or the right 160 px (Hasan). The ad-grade margins are wider: top 240 / bottom 660 / sides 120, plus a 180 px right rail from y=840 (TikTok In-Feed file, as reported).
  - Captions never cover faces or the key object.
- **Must: text-fit and layout lint.** `fitText`/`measureText` with a minimum size; flag text under 28 px or under 2.6% of the short side; flag overflow, collisions and clipping (HyperFrames `check`, explainroo).
- **Must: RTL and CJK handling.**
  - Set `dir="rtl"` on the container. Animate Arabic by word, never by letter.
  - Split CJK phrases and spread their time by character count.
  - Check that the fonts render the script (Claude Motion reportedly failed with Japanese Google Fonts).

### I. Animation system
- **Must: a deterministic frame function.** Every pixel is a pure function of the frame number (`useCurrentFrame`/`seek(t)`). No timers, no `Math.random`, no R3F `useFrame`. Use a seeded RNG (Remotion, twoclipping, what-if).
- **Must: a motion vocabulary in code** (MotionLab's `moves.ts`, generalized).
  - Closed-form springs named by damping ratio (1.0 none; 0.7-0.85 premium; 0.4-0.6 playful; under 0.3 cartoon). Position and size may overshoot; opacity and colour never do.
  - Ease by role.
  - Exits 40-50% shorter than entrances.
  - Stagger presets.
  - Pop, rise, slam and stamp presets (Finn).
  - A one-hero-per-shot rule.
- **Must: a camera grammar per format.**
  - Story 2D-in-3D: continuous camera, holds about 80% of the time, every hold creeps 0.15-0.35% per frame, moves are ease-out bursts over 8-10 frames, cuts only on big jumps, impact shakes decaying over 7 frames (mromi).
  - Cut formats: shot sizes change every cut (wide → insert → medium → close-up); no two neighbouring shots share a size and angle (what-if).
- **Must: words → events binding.** Each sentence gets its picture change on its anchor word, landing 0-3 frames before the word (cuts about 0.04 s before). Every payoff word gets a visual change.
- **Must: characters are rigs, not generations.** One rig with "looks" for costumes, so nothing drifts between shots. Expressions swap through a blink; poses use anticipation, a hold and overshoot (what-if, ClaudeAnimationBase, mromi).
- **Must: a shot kit:**
  - establishing wide, medium, close-up, macro insert;
  - over-the-shoulder (a dark blurred foreground filling about a third of the frame);
  - high and low angle; smash zoom on the key word; whip pan;
  - a glow highlight on the named object; a big 3D number lying in the scene; a schematic for the science beat.
  - Sources: Theo, what-if.
- **Must: a 3D toon pipeline (for the MotionLab look).**
  - Two-tone shading, then an ink outline pass *before* the blur, then lens blur and depth of field, then bloom on HDR emissives only (threshold 1.0), then a neutral tone map and a grade.
  - Character cards are billboards lit by the scene light, outlined in their own ink.
  - Every pixel-sized parameter scales with output height / 1920.
  - Fog uses the horizon colour.
  - A sight-line culler stops cameras from ending up inside houses.
  - Source: mromi's final values.
- **Must: motion blur.**
  - Subframe accumulation: 2-4 subframes (Finn uses 2 with shutter 0.6; twoclipping uses 4 blended with ffmpeg `tmix`).
  - Or Remotion `HtmlInCanvasMotionBlur` (8 samples, 180°).
  - In Blender, put an extra key half a frame after a shot's last frame so blur never crosses a cut (Theo).
- **Must: loop support** when a format calls for it. The last frame is visually frame 0, frames run 0..N-1, motion derives from phase, and cursors and velocities match at the seam (Florence, twoclipping, Hasan). HyperFrames treats a loop as a choice, not a default.
- **Should: a reference-match mode.**
  - Ingest a reference video and extract frames (30 fps contact sheets).
  - Write a numeric style bible (luma and saturation stats, camera speed in px per frame, cut rate, ink width).
  - Make side-by-side sheets of our frames against the reference (mromi, HyperFrames `reverse-any-video`, Rexan).
- **Should: real product UI.** Capture real app screens or recordings, or rebuild components pixel-for-pixel (claire vo), or use real component libraries (21st.dev). Never draw an invented UI (Rexan).
- **Should: multi-aspect output from one layout function.** 9:16 is the master, plus 1:1, 4:5 and 16:9, plus an X crop (1008x1152, under 10 MB). Reframe each one; never crop (Movez, Theo).

### J. Sound design and mix
- **Must: an event table → SFX.** One sound per visible action, each with a cause on screen. Peaks aligned to the frame (1 frame after the picture, or in the pause after its word for illustrative hits). Rotate 2-3 takes of anything repeated. Use a library first and generate only what's missing (HyperFrames, what-if, Hasan).
- **Must: a music bed with ducking.**
  - About 0.14-0.16 volume under the voice, or about 7 dB under it.
  - Duck about 4 dB under every word, with a fast attack and about 0.25 s release.
  - Beds under key lines at 0.1-0.15.
  - Enter the track at its strongest bar; end on a bar line (HyperFrames, Finn, what-if).
- **Must: a masking check.** Flag any word where music or SFX comes within 3 dB of the voice (what-if `mixcheck`).
- **Must: a phone-speaker check.** Flag a mix with most of its energy below about 150 Hz (HyperFrames; Florence saw 80% below 60 Hz).
- **Must: mastering.** -14 LUFS integrated (accept -16 to -13), true peak at or below -1 dBTP. Measure *after* AAC encoding, since AAC shifts loudness (Finn soft-clips so the file lands at -14 after AAC).
- **Should: TikTok trending-audio workflow.** Export a voice-plus-SFX stem with the bed muted, so the user can add a trending sound in the app (Larry claims about 10x reach). The API can't add trending sounds.
- **Should: an option to synthesize music on the beat grid** (huashu, whaleyxbt, mromi). HyperFrames argues the opposite (no synthesized chimes; don't write music in code nobody can hear), so make it a choice, with a licensed or free library (Mixkit, Pixabay, archive.org 78s) as the default.

### K. Automated QA (cheap, run every time)
- **Must: frame checks.**
  - Black frames, unplanned white flashes, frozen spans (12+ frames), "pops" (frame-diff over 3x the local median).
  - Blank stretches of 0.3+ s, dead stretches over 3 s, and nothing static over about 1 s (format-dependent).
  - Sources: mromi `short_qa.py`, huashu, HyperFrames, explainroo, Finn.
- **Must: layout and typography checks.** Text below the size floor, outside the safe band, overlapping, clipped, under the right rail, on screen too briefly (at least 0.3 s per word plus 0.5 s), or with a contrast below 4.5:1.
- **Must: sync checks.** Each event is within ±3 frames of its anchor word. Every payoff word has a visual change at its timestamp, verified by rendering a frame *at* the word (Hasan). SFX peaks are measured against their frames.
- **Must: audio checks.** Loudness and true peak, silences in the final file, the masking check, and speech-to-text versus the script.
- **Must: spec adherence checks.** Caption font, case, size and position match the brand profile; frame 0 is not empty; the length is within target (Theo saw Opus ignore a caption spec).
- **Must: a slop-palette and tell detector.**
  - A blue-purple share above 30% of frames.
  - Gradients and glow where they are banned.
  - Every element entering the same way.
  - The same ease everywhere.
  - Sources: huashu, HyperFrames.
- **Should: cheap triage before expensive review.** A small vision model scans every frame; only flagged frames go to Opus (SageCut: $127 → $0.16).
- **Should: PII and brand-safety scan** of screen recordings, for notifications, photos and names (Nadia).

### L. Critique and review (taste)
- **Must: contact sheets and review sheets.**
  - A sheet every 2 s (60 frames) for the whole film, one frame per beat, ±0.2 s strips across every cut, and the beat frames at 360 px phone width.
  - Sources: mromi, HyperFrames `snapshot --review`.
- **Must: an independent critic** in a fresh context that sees only the storyboard and sheets. It never grades its own work (make-short, reelmimic, huashu, HyperFrames).
  - Output 1: timestamped P0/P1/P2 notes (`t · where · problem → change · what stays`).
  - Output 2 (optional): a numeric rubric per area, used for tracking progress across rounds. HyperFrames says scores don't find fixes; mromi and make-short use them to measure the climb.
- **Must: a stranger test and a pictures-only test.** Describe each beat frame naming every object; with the words covered, does the story still read (HyperFrames)?
- **Must: a bounded fix loop.** Fix P0s first, then the P1s worth the time. Re-render only what changed. Stop after N rounds or when the critic's P0 list is empty. A busy film gets a third of its motion removed (HyperFrames).
- **Must: lessons memory.** Every confirmed failure becomes a rule in `lessons.md` or `taste.md`, read on the next run. Larry's skill grew from about 50 to 500+ lines this way (make-short, Larry, Florence's growing render contract).
- **Should: a reference side-by-side critic** scoring against measured reference frames per area: colour, lighting, ink, textures, characters, depth, composition (mromi).
- **Should: a blind rater eval set.** Score our outputs against top-performing originals on a fixed rubric (Theo).

### M. Variants and A/B testing
- **Must: hook variants with the body held constant.** 3-5 per message, changing only the first 1.5-3 s (the aesty playbook). MotionLab ships 5 visual-hook variants; hypit sells 50-100.
- **Must: a variant manifest.** Each variant's hook text, frame-0 still, product-placement timing, call to action and caption, for analysis later.
- **Must: anti-duplication rules.**
  - Variants must differ visually and by audio fingerprint.
  - Never post 5 identical posts in a row; spread variants across days and platforms.
  - Never mirror a post across your own accounts on the same platform (Nadia).
  - YouTube's July 2026 clarification targets generic or repetitive mass-produced content.
- **Should: a test protocol helper.**
  - Read retention after 48-72 h. Kill a hook that loses more than 30% in the first 3 s. Keep variants in the top 20% on 2 of 3 metrics (aesty).
  - The Larry matrix: views × conversions.

### N. Post caption and publishing
- **Must: a caption generator.**
  - A storytelling caption that continues the hook and names the product naturally, never "download now".
  - At most 5 hashtags (Larry).
  - Per-platform fields: a YouTube title under 100 characters and the made-for-kids flag; TikTok brand-content disclosure (Nadia).
- **Must: an AI-label decision.** TikTok requires a label on *realistic* AI content and may auto-label from C2PA metadata. Clearly stylized cartoons are likely exempt (inferred, not confirmed). YouTube requires disclosure for realistic synthetic content. Default to "not realistic" for toon styles, and warn when photoreal elements are used.
- **Should: publishing integration** through Postiz, Blotato or Upload-Post. Upload drafts or private posts, and require an explicit typed "go" before anything goes public (make-short, Larry, Nadia).

### O. Analytics loop (what separates "views" from "revenue")
- **Should: pull per-post metrics** (Postiz analytics; 3-second hold, watch-through, saves, shares, profile visits) and **installs/revenue** (RevenueCat), then attribute by post timestamps (Larry).
- **Should: automatic diagnosis.**
  - Low views → hook.
  - Views but no installs → call to action, or the audience the hook attracts.
  - Installs but no paying users → the app's onboarding or paywall.
- **Should: an auto-generated next batch.** Three variations of each winning hook (Larry, Nadia).

### P. Multi-language
- **Must: per-language voice and alignment settings.** ElevenLabs v4 multilingual or provider voices; Whisper with an explicit language (never `small.en` on non-English); CJK phrase splitting; RTL direction; fonts with the right glyphs.
- **Should: one timeline, localized text.** Re-run voice and alignment per language and re-key events by word index. Allow per-language pacing (WPM differs). Examples: an Arabic 43 s launch film (product-launch-motion); agencies offering "any language" (achxvi).

### Q. Brand profile
- **Must: a machine-readable brand file** (`brand.md` plus a code token file, kept in sync, Hasan) holding:
  - palette, with combinations that are hard to read refused (MotionKit);
  - typefaces for captions, titles and UI;
  - motion personality (spring ratios, ease set);
  - caption preset;
  - SFX taste;
  - a never/always list (no gradients, emoji, etc.);
  - logo usage;
  - product screens, app-store assets and real UI components;
  - characters with a character bible and identity lock.
  - Comparable approaches: HyperFrames `frame.md`, Claude Design design systems, `CLAUDE.md` house rules (Movez).
- **Should: a style guide distilled from the user's own archive** (`style_guide.md`) and optional reference frames to match (Movez, ridark).

### R. Safety, licensing and honesty
- **Must:**
  - Keys stay in `.env` and are named only by variable, never printed (what-if, Movez, Finn).
  - Original characters only, and an IP-resemblance check on new looks (what-if, mromi).
  - No claims about other channels' tools (what-if).
  - Show the license to the user: Remotion's company license for teams over 3 people, the ElevenLabs free plan is non-commercial and requires credit, Fish Audio's weights are non-commercial.
- **Should: honest marketing.** Show the follow-up count and receipts (Florence, make-short). The "one prompt" backlash is real (rameerez, Thariq, Jesse Hall).

### S. Render infrastructure
- **Must:**
  - Point TEMP at a large drive and garbage-collect Remotion bundle folders (60-110 GB observed).
  - Stills at 0.5x scale. A 2K master at 1440x2560 with `--scale 1.3333`, CRF 16, then a delivery encode at CRF 17-20, `yuv420p`, maxrate about 6M, AAC 256k.
  - Mux the audio explicitly (`-map 0:v:0 -map 1:a:0`).
  - Keep film grain off.
  - Use a GPU-backed browser for WebGL.
  - Sources: mromi, Finn.

---
## 3. Concrete quality rules and numbers

Every row names its source. Where sources disagree, the last column gives a suggested default for the suite. "1080w" means a 1080 px-wide vertical frame.

### 3.1 Format and encoding
| Rule | Value(s) seen | Source | Suggested default |
|---|---|---|---|
| Canvas | 1080x1920 for every vertical format | all | 1080x1920 master |
| Frame rate | 30 fps (all 20 measured 2D-in-3D refs, What-If, Zack D. style, Roblox); 60 fps for UI-morph and launch films | mromi, Theo, Finn, twoclipping, product-launch-motion | 30 fps for story formats; 60 fps as an option for UI/kinetic formats (doubles render time) |
| Hi-res master | 1440x2560 via `--scale 1.3333`, CRF 16 | mromi | Offer a 2K master; deliver 1080p |
| Delivery encode | H.264 `yuv420p` TV range; CRF 16 master / 20 delivery; CRF 17 with maxrate 6M; AAC 256k | Finn, Theo | CRF 18, maxrate 6-8M, AAC 256k |
| Motion blur | 2 subframes (shutter 0.6), or 4 subframes + ffmpeg `tmix`; Remotion HtmlInCanvasMotionBlur (8 samples, 180°) | Finn, twoclipping, Remotion skill | 4 subframes for fast moves; off for holds |
| Grain | Off (2.5% grain made files 3-4x bigger and mushes on YouTube) | mromi | Off by default |
| Extra crops | 1008x1152 under 10 MB for X; 1:1, 4:5, 16:9 re-laid-out, not cropped | Theo, Movez | 9:16 + 4:5 + 1:1 + X crop |

### 3.2 Length, pace and word budget
| Format | Length | Words / pace | Source |
|---|---|---|---|
| 2D-chars-in-3D story short (the MotionLab-like look) | 31-78 s, median about 60 s | 3.5-4.1 words/s, median 3.7 (≈222 WPM), almost no pauses | mromi style bible (20 references) |
| Faceless TSX explainer | about 40-42 s | about 100 words; **2.7 words/s is clean**, 3.3 words/s forced an audible 1.3x speed-up | Hasan |
| What-If cold open | 15-25 s | 45-65 words (about 2.7 words/s after tightening) | what-if formula |
| Zack D.-style 3D true story | 38-50 s | 100-140 words, 150-180 WPM | Theo |
| Kurzgesagt-style "what if" | 30 s | about 165 WPM | Finn |
| Roblox horror | 40-50 s | about 210 WPM, about 22 short lines per 45 s | Finn |
| Lecture/explainer reel | 30-60 s ("the voice decides") | 2-line hook + 3-7 points + 1 close; Kokoro at 1.1x | Finn |
| Recap explainer | 90-120 s | 6-10 scenes x 2-5 short lines | Corey Ganim |
| TikTok Creator Rewards | at least 60 s to earn | n/a | Sabrina |
| Sentence length | median about 13.5 words (story); 3-8 words (What-If) | | mromi, what-if |
| Subtitle reading speed | BBC: 160-180 WPM | | vendor-cited |
- Hook timing across sources: the hook arrives in the first 1-2 s (HyperFrames, Movez), there is a visual change by 0:02-0:03 (daniel), and a payoff lands every 3-5 s (Movez).
- Suggested default: a WPM target per format preset. Fail the script gate if it needs more than 1.1x TTS speed to fit.

### 3.3 Silence and pause shaping
| Rule | Value | Source |
|---|---|---|
| Cap pauses | Anything over 0.24 s is cut to 0.24 s, only where it is truly silent (loudness checked in 0.03 s windows) | Finn (explainer) |
| Cap pauses (alt.) | At most 0.35 s | Theo |
| What counts as silence | Below -44 dB for at least 0.06 s; keep 35 ms of audio either side of a cut | Finn (Roblox) |
| Inside a line | 0.11 s | Finn |
| Between lines | 0.06 s + 0.08-0.30 s (the longest right before the twist) | Finn |
| Between sentences / before the reveal | 0.24 s / 0.36 s | Finn (Kurzgesagt) |
| Dramatic beat | 0.95 s after the blackout word; about 3 s of real silence before a big return | Finn |
| Reference reality | Word gaps over 0.25 s add up to less than 1 s per 60 s video | mromi |
| Adaptive detection | `loudnorm` gives `input_thresh`, fed to `silencedetect` with d=0.5; trims under 0.2 s apart merge | Remotion skill |
| Whisper over silence | `silencedetect=noise=-35dB:d=0.6` to drop hallucinated words; real speech sits at -16 to -26 dB | HyperFrames |
| Golden rule | Never pad the voice to fit the visuals; tighten the read instead | Finn |

### 3.4 Sync offsets (the picture against the word)
| Event | Offset | Source |
|---|---|---|
| Visual reaction or beat | 0-3 frames **before** its word | mromi |
| Cut | 2 frames before the cue word; 0.04 s before the word | what-if, Finn |
| Caption word appears | 0.03 s before it is spoken; last word held 0.25 s | Finn |
| Caption plus picture swap | Same frame: round(start×30)+1 | Theo |
| Action lands | Within about 3 frames of its word | what-if motion check |
| SFX against its picture | The peak lands **1 frame after** the picture (the eye should get the event first) | HyperFrames, Florence |
| Illustrative hit against its word | In the pause **after** the word, never on it; cut short hits off at the next shot | what-if traps |
| Light dies | 0.06 s after its word, with a 0.12 s flicker | Finn |
| Measured slips to watch | Hits peaking 8-11 ms late; AAC/codec padding of about 16 ms at a loop seam | Florence |

### 3.5 Captions
| Parameter | Values seen | Source | Suggested default |
|---|---|---|---|
| Words per group | 1 (style bible, Roblox); 2-4 (Theo; bold mode in explainroo); 2-3 high-energy / 3-5 conversational / 4-6 calm (HyperFrames) | | 1-3 for story shorts; 3-5 for explainers |
| Font size at 1080w | 62 px editorial (Finn); about 64 px feed (Theo); 104 px one-word (Finn Roblox); fit-text base 78, minimum 42 (HyperFrames); 64-88 px (vendor); headline at least 84, support at least 44 (Remotion) | | Fit to a maxWidth of 900; base 78-96 for one-to-three-word groups |
| Vertical position | 64% of height (≈y1229); 78% (≈y1498); centred around y≈1500 (Hasan); 600-700 px from the bottom (HyperFrames); lower-middle (style bible) | | Centre at y≈1250-1450, inside the safe band |
| Style | White bold sans with a thin black outline (style bible); a 13 px outline + offset shadow 4/7 px at 60% (Finn); a soft dark shadow and no box (Theo) | | White, outline 6-10 px or a soft shadow |
| Keyword emphasis | Key nouns red (#EC1C24); one serif-italic keyword per line at 1.16x; white words highlighted in blue as spoken (Herk); colour-box karaoke (hypit) | | One keyword per group, boxed or coloured |
| Animation | Hard swaps on each word (style bible); grey → ink in 0.2 s (Finn); fade either the group or the words, not both (HyperFrames) | | Hard swap + 1-2 frame pop |
| Hygiene | Strip punctuation; no full stops on screen (Finn); a caption at exactly 0 s looks pre-existing, so start 0.1-0.3 s in; hard-kill stale groups; one group visible at a time (HyperFrames) | | Enforce in lint |
| Line rules | About 5 English words per claim line, cut rather than shrink; nothing read under 28 px (HyperFrames); manual breaks every 4-6 words (Larry) | | |
| Minimum on-screen time | At least 0.3 s per word + 0.5 s (a 2-word title needs 1.1 s) | Florence | lint: `line_unread` |
| When not to caption | Some formats use none (mromi rule; what-if: no captions of the voice) | | Per-preset toggle |

### 3.6 Safe zones (1080x1920)
| Source | Keep clear |
|---|---|
| HyperFrames (vertical.md) | Top 168 px; all words/product within **168-1330 px**; below 1330 only texture; nothing under the right rail |
| Hasan | Bottom **340 px**, right **160 px**; captions around y≈1500 |
| Larry (slides) | Top 10%, bottom 20%; hook text at 30% from the top, 6.5% of the height |
| TikTok In-Feed file (as reported by ToolsWebPro/ViewGum) | Top 240, bottom 660, sides 120, plus a right column of about 180 px from y=840 down |
| Meta Reels ads | About 14% top, 35% bottom, 6% sides |
| Cross-platform centre box | About 870x1360 clear on TikTok, Reels and Shorts (Vidova, vendor) |
| artemnovitckii | Contact sheet overlaid with Instagram's safe area |
- Suggested default: lint against the strictest union for "boost-ready" mode, and HyperFrames' band for organic. Overlay the zones on every contact sheet.

### 3.7 Motion and camera
| Rule | Value | Source |
|---|---|---|
| Easing by role | Enter with ease-out; exit with ease-in, 40-50% shorter; camera ease-in-out (quart or power2); linear only for rotation/progress/loop phase | Florence, HyperFrames |
| Entrance curve | `bezier(0.16,1,0.3,1)`; Remotion `Easing.bezier(0.16,1,0.3,1)` | whaleyxbt, Remotion |
| Springs (damping ratio) | 1.0 no bounce; 0.7-0.85 premium; 0.4-0.6 playful; under 0.3 cartoon. Remotion's default spring is about 0.5. Opacity and colour never bounce | Florence, HyperFrames |
| Durations | UI feedback 100-200 ms; UI moves 200-500 ms; hero reveals 600-900 ms; fast moves 0.3-0.6 s with blur (6-12 px text, 15-20 px full frame) | Florence, HyperFrames |
| Stagger | Letters 1 frame; words 60-120 ms (0.09 s); list items 40-80 ms; cards 0.16 s; start the next element at 30-50% of the previous one | Florence, whaleyxbt, Finn |
| Secondary motion | Travels 50-70% of the hero's distance, starts 100-200 ms later; ambient motion under 5% | Florence, HyperFrames |
| Presets | pop 0.55→1 / 0.34 s back.out(2.2); rise 70 px / 0.4 s; exit 50 px / 0.22 s; slam 1.22→1 / 0.24 s; stamp 1.75→1 / 0.2 s | Finn |
| Holds | Every hold creeps 0.15-0.35% per frame (0.6% per frame on punch words); a 2% push during a text hold; never a static hold of 4+ frames | mromi, Florence |
| Story camera (2D-in-3D) | Holds about 80% of frames; moves are ease-out bursts (peak on frame 1, decaying over 8-10 frames, peak at most 25 px/frame at 720p); smootherstep glides 18-40 frames; 4-5° rolls; impact shakes flip sign each frame and decay over 7 frames; 0-1 hard cuts per video | mromi |
| Cut-heavy formats | 27+ cuts per minute in the opening (What-If); a cut every 0.5-2.5 s, median 1.25 s (Roblox); shots 1-2 s and a new beat every 2-4 s (HyperFrames); a new picture every caption chunk of 1-1.5 s (Theo) | |
| Static limits | Nothing motionless for over about 1 s (Finn, what-if); dead stretch over 3 s flagged (HyperFrames); no static shot over about 3 s (what-if) | |
| Depth of field | On about a third of screen time (close-ups, mediums, inserts), blur radius 10-16 px at 1080; wides stay sharp | mromi |
| Beat grid | Frames per beat = fps×60/BPM; compute every beat from time (rounding accumulates: 2 frames off after 32 beats); cut on the beat, change the layout on the bar | Florence |
| Parallax | Foreground 1.0, middle 0.5, background 0.2 | Florence |
| Exaggeration | Push key poses 10-30% further for phone screens | Florence |
| Transitions | 3-5 kinds per film, each caused by something on screen; at most a third of seams are hard cuts; worlds never crossfade | HyperFrames |

### 3.8 Composition and readability
- The hero fills at least 40% of the frame's height or width. One hero move per shot; everything else waits, dims to about 40%, or holds (HyperFrames, Florence).
- Each frame reads in one second at phone size. Light comes from a visible source. The character is the brightest, sharpest thing in its area. A dark blurred foreground appears in about a third of shots. Wides show 20+ designed objects (what-if checklist).
- Contrast at least 4.5:1 on every frame. No more than 3 flashes per second (WCAG, via Florence).
- Reference colour stats for the 2D-in-3D look: day median luma about 0.57; non-ink 5th percentile about 0.23 (no crushed blacks); lit chroma C* 90th percentile about 55; ink about 3 px at 1080, near-black #0b0a0c; character ink in a dark plum #201628-#2f1d28; bean heads at a height/width ratio of about 0.93; adults about 3.5 head-heights tall (mromi).

### 3.9 Sound levels
| Rule | Value | Source |
|---|---|---|
| Integrated loudness | -14 LUFS (mromi refs, Florence, what-if, whaleyxbt); -15 LUFS (Finn explainer); -16 to -14 LUFS (HyperFrames); mix to -13 then soft-clip so it lands at -14 after AAC (Finn Roblox) | |
| True peak | ≤ -1 dBTP (Florence, HyperFrames, what-if); -2.2 dBTP (Finn) | |
| Loudness range | About 2.4 LU in the references (heavily compressed voice) | mromi |
| Music under the voice | 0.14 volume (HyperFrames); 0.16 with a 0.8 s fade (Finn); about 7 dB under (Finn); 5-10 dB under speech (refs); duck to 0.3-0.4 while speaking (HyperFrames); -21 dB RMS ducking 4 dB under every word, fast attack, about 0.25 s release (Finn) | |
| SFX levels | 4-10 dB under the voice (Finn); hits 3-6 dB over the bed (HyperFrames); a whole mix with music +3 dB and SFX -6 dB relative (mromi user rule) | |
| Masking guard | Flag music or SFX within 3 dB of the voice during words (0.4 s windows; recheck in 0.1 s windows) | what-if |
| Big-hit density | About 1 big hit every 7-10 s | Finn (Roblox) |
| Phone low end | Energy below 150 Hz plays as nothing; 80% of energy under 60 Hz was a failed mix | HyperFrames, Florence |
| Voice EQ fixes | Highpass at 80 Hz; +2.5 dB at 3 kHz for clarity; -4 dB at 200 Hz if boomy; limiter last | HyperFrames mixing.md |

### 3.10 QA thresholds (automatable)
| Check | Threshold | Source |
|---|---|---|
| Black frame | Mean luma under 0.04 | mromi |
| Unplanned white flash | Mean luma over 0.93 outside planned flashes | mromi |
| Frozen | Frame-diff under 0.02 for 12+ frames | mromi |
| Pop/jump | Frame-diff over 3x the local median + 1 (outside planned cuts or crossfades) | mromi |
| Blank stretch | 0.3+ s mid-film is a hard fail | huashu |
| Dead stretch | Over 3 s with no change | HyperFrames |
| Slop palette | Blue-purple background in over 30% of the film | huashu |
| Text floor | Under 2.6% of the short side (≈28 px) | HyperFrames |
| Line unread | Shorter than its words need (≥0.3 s/word + 0.5 s) | HyperFrames, Florence |
| Empty first frame | Fail | HyperFrames |
| Silent film | Over 15 s with no sound | HyperFrames |
| Phone readability | Render at 360 px (HyperFrames) or 854 px (explainroo) view width | |
| Transcript junk | Over 20% ♪ or junk tokens | HyperFrames |
| Contact sheets | 60 frames per 2 s (mromi); a frame every 0.5 s (Theo); one per beat (whaleyxbt); ±0.2 s across cuts (HyperFrames) | |
| Critic loop target | Every area scored 8+ (Movez); bridge from 5/3/4/5/4/7/4/6 → about 7/5.5/5.5/6/5.5/7/6.5/6.5 over 4 rounds (mromi); 4.2 → 7.9 (make-short) | |

### 3.11 Hook testing and posting
| Rule | Value | Source |
|---|---|---|
| Hooks per message | 3-5; only the first 3 s change | aesty / Nadia |
| Read window | 48-72 h | aesty |
| Kill rule | Over 30% drop in the first 3 s | aesty |
| Keep rule | Top 20% on 2 of 3 (watch-through, saves+shares, profile visits) | aesty |
| Throttle signal | At low views, engagement over about 1% = throttled; under 1% = content failing | Nadia |
| Duplicates | 5 identical posts in a row got throttled; never mirror a post across your own accounts on one platform | Nadia |
| Warm-up | 7-14 days of normal use before automating | Larry |
| Hashtags | At most 5 | Larry |
| Audio | Add trending audio manually (claimed about 10x reach); the API can't | Larry |
| Product placement | End-card solution (Peef) vs within 12 s (CalAI via Sabrina) vs the first 3 s (TikTok research cited by Aurli: 63% of top-CTR ads) | conflicting, so test it |

### 3.12 Cost and time benchmarks (self-reported)
- 15 s Blender short: about 26 min, about 3% of a 5-hour Max 5x window, about $5 at API prices; 202 ElevenLabs credits (make-short).
- What-If 20 s episode: 152 ElevenLabs credits (78 voice + 74 SFX); 170-242 credits on later runs. The free plan's 10K credits a month covers about 40 episodes but is non-commercial (what-if).
- 45 s hand-painted short: 62.7M tokens (96% cache reads), 163 model calls, about $34, about 6¾ h (1½ h hands-on), 12 min render (@mablesjoseph).
- Gravitational-lensing piece: 5 h 28 min end to end, about $90 at API prices (Vox).
- 2K 67 s render: about 10 min at about 4 fps. Stills at 0.5x: 3-8 s each after a 40 s bundle (mromi).
- Frame QA by Claude sub-agents: about $127 per video. A cheap VLM triage: $0.16 for 3,153 frames (SageCut).
- Bake-off: no-skill Claude Code 4.4 min; skills 2.0-23.5 min for the same 15 s promo (awesome list).

---

## 4. Failure modes and fixes

| # | Failure | Symptom | Fix that worked | Source |
|---|---|---|---|---|
| 1 | **The default "AI motion" look** | Centred text on a gradient, everything fading and sliding up, a logo at the end; navy space, halo, bloom, particles; cream paper + serif + mono labels; three cards in a row | A reference (name a style, attach frames); a numeric spec; a named BANNED list that grows after every render; real brand assets | Movez, Rexan, Florence, HyperFrames spec, Anthropic guide |
| 2 | **Brief contagion** | Outputs that rhyme with everyone else's | Treat one-liners as smoke tests; every video gets its own brief, references and brand profile | athemeroy dataset via Movez/ridark |
| 3 | **The model picks its own engine** | Spaghetti single HTML with magic numbers, ignoring Remotion | Name the framework explicitly; ship engine primitives (Reel/Stage/Motion) and forbid ad-hoc engines | Tommy Rossi via Movez |
| 4 | **Hard-coded timings** | Retiming one beat breaks the rest | Parameterized keyframes; one timeline JSON keyed to word indices | rameerez, whaleyxbt, Finn |
| 5 | **Weak spatial reasoning** | Wrong z-order, cards cutting through each other, props floating, wrong perspective, cameras inside houses | Layer contracts; contact-shadow and contact rules; a sight-line culler; stills checked against a checklist; one change per prompt | rameerez, Herk, what-if, mromi, Ole |
| 6 | **Readability traps** | A one-rope swing reads as a hanging; a prop by the hand reads as the hand; a foreground bush reads as a green ball; dark limbs vanish on dark sets; a flag reads as another country's | A "stranger test" (describe every object); a phone-size still review; a traps list per style | mromi, what-if, HyperFrames |
| 7 | **Desync** | Captions or visuals near the word but not on it; a reveal unfinished when the voice names it | Word timestamps from the final audio; diff-match to the script; silence-snapped word edges; a frame rendered *at* each payoff word | Finn, Hasan, HyperFrames |
| 8 | **Whisper errors** | Pauses swallowed into the next word; "Thank you." over silence; non-English audio translated; repeated words timed wrongly | Detect silence from the waveform; drop words in the final silence; set the model and language explicitly; match by position | Finn, HyperFrames |
| 9 | **Robotic or cheap voice** | The default Mac `say` voice; a 1.3x sped-up read; pitch-shifted narration | A real TTS (ElevenLabs v4 or Kokoro); 2.7-3.7 words/s by format; atempo only, at most about 1.25x; audition 3 voices | Corey Ganim, Hasan, Finn |
| 10 | **Mispronounced or dropped words** | TTS skips or garbles a brand name | Speech-to-text against the script ("speech check"); IPA or phoneme tags in v4 | explainroo, ElevenLabs v4 |
| 11 | **Caption bugs** | Words lose their spaces (inline-block in flex); RTL lines read backwards; Arabic letters fall apart; stale groups stay on screen; a caption at 0 s looks pre-existing; text flashes on frame 1 | Normal block layout; `dir="rtl"` and animate by word; hard kill after exit; start 0.1-0.3 s in; hide with CSS from the start | Finn, Remotion arabic-text, HyperFrames |
| 12 | **The spec is ignored** | Opus used ALL CAPS with a thick outline despite the caption spec | Automated spec-adherence checks (font, case, size, position) | Theo |
| 13 | **Empty or blank opening frame** | The first frame is grey or black, so the thumbnail is dead | `first_frame_empty` check; frame 0 = payoff; never cut to an empty frame (start pops at t+3) | Theo, HyperFrames, what-if |
| 14 | **Static or dead stretches** | Frozen holds, slideshow feel | Every hold creeps; nothing static over about 1 s; dead_stretch over 3 s flagged; OpenMontage blocks slideshow-looking renders; huashu blocks near-static films | mromi, Finn, HyperFrames, OpenMontage, huashu |
| 15 | **Generated-motion tells** | Breathing or floating loops on titles, titles still moving after landing, the same ease everywhere, bounce on UI, every scene entering the same way | Ease by role; one hero per shot; vary transitions (3-5 kinds); remove a third of the motion if busy | HyperFrames motion.md |
| 16 | **Renders that flicker or jitter** | 3D flickers, shapes jitter | Never R3F `useFrame`; seeded RNG; no timers; constant keys in Blender; nothing coplanar | Remotion 3d.md, Florence, Finn, Theo |
| 17 | **Blurry text** | Text soft when the camera scales it | No `will-change` on camera-scaled elements | twoclipping |
| 18 | **Loop hiccup** | A stutter at the seam | Render 0..N-1; phase-based motion; match velocity and cursor at the seam; account for codec padding | Florence, twoclipping |
| 19 | **3D and engine traps** | TextGeometry 50 deep (three r160 `height`/`depth`); the WebGL globe clips flat; Blender sRGB colours washed out; hair renders black; faces black from too much subsurface | Pin versions and name the right params; size canvases from radius and zoom; convert sRGB→linear; keep subsurface about 0.2 | Florence, Finn, Theo |
| 20 | **Inaudible or muddy mix** | Energy below 60-150 Hz; beds burying facts; hits covering words; the same whoosh on every cut | Phone-speaker check; masking check (3 dB); hits in the pause after the word; rotate takes; duck the bed | HyperFrames, Florence, what-if |
| 21 | **Claude can't hear** | Sync and level errors no one notices | Decode the MP4 and measure hit peaks against frames; loudness report; state that audio was measured rather than listened to; a human listen before posting | Florence, HyperFrames, Theo |
| 22 | **Self-grading bias** | A self-score of 6.5 against an independent 4.2; a render that cleared every automated check yet looked like a horror movie | A fresh-context critic with only the sheets; timestamped notes; never let the builder grade itself | make-short, reelmimic, huashu |
| 23 | **QA too expensive** | $127 and 4+ h per video of frame review | Cheap VLM triage, then Opus on flagged frames only | SageCut |
| 24 | **Disk and render blowups** | ENOSPC after 60-110 GB of Remotion bundles; 900 MB files from grain | TEMP on a big drive; GC old bundles (ask first); grain off | mromi |
| 25 | **Silent-audio-track mux** | The final MP4 has no sound | Map the mix explicitly (`-map 0:v:0 -map 1:a:0`) | mromi |
| 26 | **Fake "one prompt" expectations** | Users feel like failures; credibility hits | Show receipts (prompts + follow-ups + cost); set expectations of 2-4 review rounds | rameerez, Thariq, Florence, make-short |
| 27 | **Invented UI or claims** | Fake-looking buttons; invented stats | Real screenshots or recordings, 21st.dev components; a "never invent features/stats" rule; numbers copied exactly | Rexan, zafkiv, MotionKit |
| 28 | **Privacy leaks** | Private photos or names flash through a screen recording | Frame-by-frame PII scan before export | Nadia |
| 29 | **Platform throttling or demonetization** | 5 identical posts → shadowban; mass-produced, repetitive content | Visual variation across variants; spread schedules; no same-platform mirroring; the July 2026 YouTube "inauthentic content" clarifications | Nadia, TechCrunch/Tubefilter coverage |
| 30 | **AI-fatigue in organic video** | Trust drops when content reads as "AI video" | A code-animated original style (no gen-video look); show the real product; consider a founder face plus animated explainers | Nadia |
| 31 | **IP drift** | A character drifts toward a famous one; channel style copied too closely | A cast-sheet resemblance check; original stories; use references for the look only | what-if, mromi |
| 32 | **Locked character regenerated** | A generated character stops looking like itself | Rigs in code, or a locked reference sheet; never regenerate from text | Hasan, what-if |

---

## 5. Recommended tools and libraries (versions as of 2026-11-13/14)

Versions were read from the npm registry, PyPI and the GitHub API on the snapshot date.

| Layer | Tool | Version (date) | Notes |
|---|---|---|---|
| Video engine (React) | `remotion` + `@remotion/*` | **4.0.543** (2026-11-11) | Agent Skills repo at the same version; Claude Code plugin `remotion-dev/claude-code-plugin` (Jul 2026). License: free for individuals and companies of up to 3 people; Automators $0.01/render ($100/mo minimum); Creators $25/seat/mo |
| Remotion add-ons | `@remotion/three`, `@remotion/captions`, `@remotion/media`, `@remotion/transitions`, `@remotion/motion-blur` (HtmlInCanvasMotionBlur ≥4.0.529), `@remotion/rough-notation` (new Jul 2026), `@remotion/whisper-webgpu` (new Aug 2026), `@remotion/elevenlabs` (new Mar 2026), `@remotion/layout-utils` | 4.0.543 | rough-notation = keyword box/highlight/circle; whisper-webgpu needs a GPU and not Linux arm64; preview HTML-in-canvas blur needs Chrome 149+ with a flag |
| Video engine (HTML) | `hyperframes` (HeyGen) | **0.9.44** (2026-11-14) | Apache-2.0; Node ≥22; `check`/`snapshot --review`/`audio --json`/`transcribe`/`beats`; about 450 registry blocks; Pro adds HeyGen models and `reverse-any-video`/`style-sampling` |
| Zero-dependency route | Single HTML + `seek(t)` + Playwright + ffmpeg | Playwright (py) **1.65.2** | What Opus 5.5 builds by itself. Use subframes for blur and a GPU browser for WebGL |
| 3D | `three` | **0.187.0** (r187, 2026-10-30) | r186 shipped Sep 24 (Florence); pin versions (r160 TextGeometry trap) |
| 3D (React) | `@react-three/fiber` / `@react-three/drei` | **9.8.2** / **10.7.9** | Inside Remotion use `ThreeCanvas` and `useCurrentFrame`, never `useFrame` |
| 3D (offline) | Blender + MPFB add-on + Blender MCP | **Blender 5.3.0** | Headless `blender -b -P`; EEVEE; AgX/Standard view; used by make-short, Theo, Finn |
| Timeline animation | `gsap` | **3.15.1** (2026-11-04) | 100% free including SplitText/MorphSVG/DrawSVG; official `greensock/gsap-skills` (18.4K★) |
| UI animation | `motion` (formerly Framer Motion) | **14.14.0** | No video renderer; for in-app motion only |
| Other 2D engines | Motion Canvas `@motion-canvas/core` **3.17.2** (last npm release Dec 2024; repo active Jul 2026); Revideo `@revideo/core` **0.11.0** (Jul 2026); Manim CE **0.22.1** (2026-10-27) | | Manim for math explainers (skills exist: `iart-ai/manim-skills`, `awesome-skills/manim-skill`) |
| Encode | FFmpeg | **n9.0.2** (stable), 9.1-dev | `loudnorm`, `silencedetect`, `ebur128`, `tmix`, `atempo` |
| TTS (cloud) | ElevenLabs **Eleven v4 / v4 Turbo** (`eleven_v4`, launched 2026-09-28), `eleven_multilingual_v2`; Python SDK `elevenlabs` **2.78.0** | | Audio tags, better IPA; with-timestamps endpoint (character timings); about 1 credit per character; free tier non-commercial. `music_v1` deprecated 2027-01-31 |
| TTS (local) | Kokoro (`kokoro` 0.9.4; `kokoro-onnx` **0.6.1**, Aug 2026) | | Free, fast, 54 voices; no cloning; speed 1.0-1.1 |
| TTS (cloning, permissive) | Qwen3-TTS (Apache-2.0), Chatterbox (`chatterbox-tts` 0.1.7, MIT, Perth watermark; the repo is still active in Nov 2026 although one blog calls it retired) | | Fish Audio S2 Pro weights are reportedly non-commercial per secondary reviews (use its hosted API) |
| Word alignment | `faster-whisper` **1.2.1**; WhisperX **3.8.6**; whisper.cpp **v1.9.5** (2026-10-06); `sherpa-onnx` **2.0.1** (Parakeet); `stable-ts` 2.19.1; `@remotion/whisper-webgpu`; `npx hyperframes transcribe` | | Pass a 16 kHz numpy array to faster-whisper (Theo); large-v3-turbo int8 on CPU (Finn) |
| Audio analysis | `pyloudnorm` 0.2.0; `librosa` **1.0.1** (2026-11-12); numpy | | Beat grid, peaks, LUFS, masking checks |
| QA / vision | Chrome DevTools MCP; Claude in Chrome (watch Studio); a cheap VLM triage (SageCut pattern) | | HyperFrames `check`/`snapshot`; explainroo `check --script`; mromi `short_qa.py` (ideas to port) |
| Motion knowledge skills | `remotion-dev/skills` (7.0K★), `heygen-com/hyperframes` skills, `greensock/gsap-skills`, `LottieFiles/motion-design-skill` (3.0K★), `showheyohtaki/motion-prompt` (2.1K★), `whaleyxbt/claude-motion` (972★) | | Good to vendor ideas from; check licenses |
| Free assets | Kenney CC0 kits (recolour), soundcn, Mixkit/Pixabay SFX and music, Internet Archive (Prelinger films, 78 rpm records), remotion.media SFX list | | Archive.org needs no API key (Elliot Padfield) |
| Publishing | Postiz API (drafts + analytics), Blotato (MCP; `claude mcp add --transport http Blotato https://mcp.blotato.com/mcp`), Upload-Post | | Drafts/private first |
| Attribution | RevenueCat (installs/trials/MRR by post time) | | The Larry loop |
| Skills CLI | `npx skills` (vercel-labs) **1.8.1** | | `npx skills add <repo>`; `npx remotion skills add` |
| Agents/models | Claude Opus 5.5 (2026-09-22; medium effort by default); Claude Fable 5.2 (followed the caption spec better in Theo's single test); GPT-6 Astra in Codex (Nate Herk); OpenCode with the free GLM-5.3-Flash (kelano86 ran a full episode on it for $0 model cost) | | Effort policy per stage |

---

## 6. What is surprising or new since mid-2026

1. **The Opus 5.5 motion wave (from Sep 22, 2026).** Within days the feed filled with code-rendered films:
   - showreels: @stephanlivera 2.32M views; @shneural 1.91M;
   - a launch-day animation by @devteamdrew: 1.85M;
   - a design studio's launch video in 3 prompts (@uxmiles): 1.81M;
   - a 3D browser world (@xikhar): 1.85M;
   - Donald's music video (@donaldjewkes): 4.06M views, about a 9,500-character dictated brief plus 12 hours of unattended work.

   Thariq (Claude Code team) publicly noted the gap between "one-shot" captions and the 10k-character prompts behind them. Honest "receipts" posts became a genre (Florence, @mablesjoseph, make-short).
2. **Anthropic shipped first-party motion.**
   - **Claude Motion** (Oct 8, 2026): beta for Team/Enterprise only, code-animated, MP4 export, no video model and no realistic people. Partners named for hand-off: Adobe, Descript, HeyGen, Higgsfield, invideo, Luma AI, Runway.
   - **Claude Design** (Apr 17, 2026) moved into Claude in October; the standalone site closes Dec 14 (per @mistm1st).
   - Consequence: individual users (Pro/Max) still need Claude Code + Remotion/HyperFrames. Third parties already sell "Claude Motion on any plan" (MotionKit, from $4.99).
3. **HyperFrames overtook Remotion on GitHub stars** (84K vs 73K) within about 8 months of release. It brings a Studio app, a Pro tier with HeyGen models, `reverse-any-video` and `style-sampling`, frame.md design systems, and the most detailed built-in review rules. In the awesome-list bake-off, though, it was the slowest (23.5 min against 4.4 min for no skill).
4. **Remotion turned agent-first:**
   - Agent Skills (Jan 20 launch: 18.9M views, 38K bookmarks, the trend's ignition point);
   - a Claude Code plugin (Jul 2026);
   - WebMCP support in Studio;
   - rough-notation (Jul 2026), whisper-webgpu (Aug 2026), an ElevenLabs package (Mar 2026), HTML-in-canvas motion blur (≥4.0.529);
   - "Remotion for Automators" pricing aimed squarely at prompt-to-video products.
5. **ElevenLabs Eleven v4** (Sep 28, 2026): better cloning, audio tags and IPA, and a Turbo variant at about 100 ms. ElevenLabs says it ranks #1 on Artificial Analysis.
6. **Free open-source clones of paid "Claude folder" products appeared within days.**
   - **mromidev/claude-animated-shorts** is essentially the MotionLab look, free and MIT: 3.3K stars in 13 days, a 1.04M-view tutorial, and a Spanish fork.
   - Others: nocodehack/make-short (Blender + critic), artemnovitckii's `/zach-d-films` and `/stick-figure`, kelano86/what-if-animation, hassancs91's faceless shorts.
   - The awesome list grew from 180 to **499** video-skill repos.
   - Paid differentiation therefore has to come from quality systems, brand profiles, analytics loops and support, not from the pipeline alone.
7. **New code-rendered faceless formats broke out in Oct 2026:**
   - "What If" stick-figure channels (Ifverse, FunNotSoFun, IFinity, Could've Been Tales; one channel reportedly 7M views and 50K subs in 30 days);
   - the "You Built It" 3D cut-away backyard (58.6M TikTok views from 48 videos since Oct 11);
   - stickman survival serials ending in comment votes;
   - Kurzgesagt-style and Zack D. Films-style rebuilds.

   Code-rendered output is consistent across shots because characters are rigs, not generations.
8. **The independent critic became standard,** and cheaper. Fresh-context critics (make-short), different-agent review per shot (reelmimic), QA plus a non-participating reviewer plus delivery gates (huashu), and cheap VLM triage that cut QA cost 800x (SageCut).
9. **Audio verified by measurement instead of listening.** Agents now synthesize SFX and music on the picture's timeline and verify sync by decoding the MP4 (Florence, whaleyxbt, mromi). HyperFrames pushes the other way: no synthesized chimes, use a library.
10. **Platform policy tightened.** YouTube's July 2026 clarifications of "inauthentic content" cover generic or repetitive, mass-produced material, unsatisfying content, and AI personas posing as experts (as reported by TechCrunch/Tubefilter). TikTok auto-labels AI content via C2PA, and realistic AI content needs a label.
11. **A counter-trend worth noting.** Some founders report viewers' trust in *AI video* dropping in organic feeds and are moving to founder-generated content plus screen recordings (Nadia) or AI slideshows (Larry). Code-animated, non-photoreal explainers that show the real product sit between the two, a decent positioning for the suite.
12. **Model differences matter for spec adherence.** In one A/B, Fable 5.2 followed the caption spec while Opus 5.5 didn't (Theo), and Opus 5.5 at medium effort produced viral pieces only after iterations. Build automated adherence checks rather than trusting the prompt.

---

## Appendix A. Competitor landscape (products, skill packs, templates) and what they advertise

| Product | Type / price | Advertised quality features | Relevance |
|---|---|---|---|
| **MotionLab** (@PeefTwt) | Claude Code folder, €49 | (known context) topic → researched script, 3 hooks, ElevenLabs/OpenAI/Fish voice synced to the word with silences cut, word captions with a keyword box, every sentence animated on its word, zero cuts, 60 fps, 5 visual hooks, post caption, critique and checks | Baseline |
| **mromidev/claude-animated-shorts** | Free (MIT); paid Skool community for more | 2D-in-3D style with a measured style bible, 7 look reports, a QA script, a look-match multi-agent loop, synthesized SFX and march score, 2K export | The closest free competitor to MotionLab's look |
| **MoraViral** (moraviral.com; ReachMora's 553K-view tutorial) | SaaS $39 / $79 / $129 per month | Templates "Animated History" (flat 2D cartoon characters in rich 3D worlds) and "Stickman History"; one title → script, voice, scenes, edit; uses gen-video models | Same visual promise, generated rather than code |
| **launchvideos.app** (AbubakrChan) | Done-for-you films from $20 | One shape never cut, closed-form springs, a cursor driving every change, music-first beat sync, 60 fps motion blur | Launch/app videos |
| **MotionKit** (motionforclaude.com) | From $4.99; free web studio | "Claude Motion on any plan"; 37 styles; storyboard approval; keeps numbers exactly as written; HyperFrames check/render; refuses hard-to-read colour combinations | Business explainers |
| **Shorts & Skills** (shortsandskills.com) | $39 launch, then $66 | A skill box for ChatGPT/Claude: research → angle → script → visuals → review | Process kit |
| **HyperFrames Studio Pro** (HeyGen) | Paid tier | HeyGen video, image, voice and music models; reverse-any-video; style-sampling (5 proven styles) | Platform competitor |
| **HeyGen Video Agent** | SaaS | One prompt → avatar + script + motion graphics + edit | Avatar route |
| **Claude Motion** (Anthropic) | Team/Enterprise beta | Code animation from your data, chat or editor edits, MP4 export | First-party, business-focused |
| **Motion** (@motion_so) | MCP for Opus 5.5 | Builds scenes, type and transitions into an editable video | Editor route |
| **iart.ai** | SaaS + 19 open-source packs | `tiktok-video-skills` (hook → retention → loop grammar; karaoke captions with safe-area placement); "faceless video maker" | Funnel model |
| **OpenMontage** | Open source (80K★) | 12 pipelines, a storyboard approval gate with costs and quality scores, slideshow blocking, post-render self-review | Heavyweight OSS |
| **hypit** | Open source (29.6K★) | Clone any viral video; word-anchored workflows; 100 variants per command; WhisperX; karaoke captions | Variants at scale |
| **explainroo** | Open source (free; hosted share coming) | check/verify any MP4 (speech check, small text, black frames, loudness); vertical-short with the hook in the first second | QA tooling |
| **claude-motion-faceless-skills** (kevinbadi / Creator OS) | Free | 74 styles (whiteboard, claymation, CRT...), canvas renderer, synthesized score | Style breadth |
| **lemo-opuscar** | Free (15.8K★) | 99 film styles, each with a demo film; DIRECTOR.md self-checks | Style breadth |
| **AutoAIShorts, ReelForge, Revid, Crayo** | Faceless SaaS | Hook-first scripts, word-synced captions, about $0.25/video (AutoAIShorts); a "Variety Engine" over 9 axes (ReelForge); a safe-zone checker (Revid); clipping (Crayo) | Generic faceless |
| **Larry / upload-post-larry-marketing-skill, Postiz, Blotato, TokPortal, Hermoso** | Free skills + paid APIs | Slideshows, drafts, analytics, a RevenueCat loop | Distribution and analytics layer |

**Where the gaps are, and where a paid suite can win:**
1. Measured QA plus an independent critic is common in free repos, but is rarely packaged with spec-adherence, safe-zone and keyword checks for captions.
2. Almost nobody closes the **installs/revenue loop** except Larry (slideshows).
3. Brand-profile handling is weak in most free repos (Hasan's brand.md is the best).
4. Product-placement A/B and multi-aspect exports are rare.
5. Cost reporting and credit gating appear only in a few (what-if, make-short, Hasan).

---

## Appendix B. Formats currently working (with reported numbers)

| Format | Look | Key numbers | Sources |
|---|---|---|---|
| 2D characters in a 3D toon world (history/science paradox stories) | Bean-head cards, ink outlines, painted town, DOF, continuous camera | 55-70 s, 3.7 words/s, "You see," pivot, no captions or captions one word at a time; the tutorial got 1.04M views | mromi; MoraViral "Animated History" template |
| 3D "what if" cut-away world | A soil block cut like a cake, one caption word at a time, calm fast narrator | 13.1M views on a page's first TikTok; 58.6M across 48 TikToks | Theo (You Built It) |
| Stickman survival serials | Flat stick figures, a HUD (day/time/battery), rule and fact cards, a vote in the comments | 1.7M first reel; 12/13 reels >100K | Theo |
| What If (dusk-lit stick figures) | A rig in code, rooms in perspective, lit by practicals | 27+ cuts/min in the opening; 15-25 s cold opens; one channel reportedly 7M views and 50K subs in 30 days | kelanoo, what-if |
| Lecture or explainer reel with a cartoon presenter | Cards land on the word, presenter bottom right | ByteByteGo 1.99M; Jeff Su 877K (36x median); Finn's prompt has 1.9K bookmarks | Theo, Finn |
| Kurzgesagt-style | Space gradients, a WebGL planet, a mascot, narration on the word | 262K views / 5.3K bm for the prompt | Finn |
| Zack D. Films-style 3D true story | Realistic 3D game cutscene look, captions of 2-4 words | Reference Short reportedly 255M views; 100-140 words | Theo |
| Roblox horror | Block characters, night town, word-by-word captions | 185K views / 2K bm for the prompt; about 210 WPM, 36 shots | Finn |
| UI morph / launch films | One shape never cut, springs, cursor, 120 BPM | 1.19M views / 21K bm; Tony Dinh: $1,000 → under 30 min | twoclipping, Tony Dinh |
| App marketing: problem → solution, before/after, countdown with your app at #1, relatable story | Faceless or animated, the app shown as the fix | CalAI shows the product within 12 s; Peef claims $700+ in one day of organic sales | Sabrina, Peef (context) |
| Remotion recaps of docs and plans | Scenes with headline, cards and a progress bar | 6-10 scenes in 90-120 s | Corey Ganim |

---

## Appendix C. Implications for the build (prioritized)

1. **Make "measure the reference" a first-class skill.** Ingest 5-20 reference shorts and output a numeric style bible plus reference frames (mromi). This is how the "toon 3D + 2D stick figures" look gets its numbers (ink px, DOF radius, camera px/frame, luma and chroma stats), and how users clone *their own* winning style.
2. **Event model = word index + offset.** Visual reactions at -3..0 frames, cuts at -1..-2 frames, SFX peaks at +1 frame (or in the post-word pause). Compile from `timeline.json`. Fail QA when an event drifts more than 3 frames.
3. **Ship 3-4 format presets, each with its own pace, camera grammar and caption preset.**
   - "Continuous-camera story" (the MotionLab-like look; 30 fps default).
   - "Cut-driven What-If/Roblox".
   - "Lecture/explainer".
   - "UI-morph launch" (60 fps).
4. **Captions.** Two presets plus none. Keyword selection plus a `rough-notation` box. Fit-text. Safe-band lint. RTL/CJK. Spec-adherence check.
5. **QA stack, in order:**
   1. Cheap automated checks (port `short_qa.py` and the HyperFrames warnings).
   2. Cheap VLM triage.
   3. Opus review of flagged frames and beat sheets.
   4. A fresh-context critic with P0/P1 notes (plus an optional rubric score to track the climb).
   5. `lessons.md` updated after every run.
6. **Variants that matter:** hook text, frame-0 composition, opening camera move, product placement time (end / ≤12 s / ≤3 s), call-to-action wording. Generate a variant manifest, never byte-similar duplicates, and give scheduling advice for spreading them out.
7. **Close the loop.** Optional connectors for Postiz/Blotato (drafts) and RevenueCat (attribution), with the Larry diagnosis matrix in the weekly report.
8. **Brand profile** = `brand.md` + `brand.ts` + a character bible + a never/always list + product assets. Every skill reads it. Refuse low-contrast palettes.
9. **Cost and licensing honesty.** A credit and cost ledger before spending. Remotion license notice for teams over 3 people, with HyperFrames (Apache) as an alternative backend. ElevenLabs free-tier is non-commercial.
10. **Infra hygiene.** TEMP on a big drive, bundle garbage collection, explicit audio mux, stills-first rendering, frame-skip resume.
11. **Messaging.** Show receipts (rounds, follow-ups, cost) in marketing. The audience is primed to distrust "one prompt" claims.

---

## Appendix D. Source index (all links)

X / Twitter (date; views / likes / bookmarks as of 2026-11-13):
- Remotion Agent Skills launch, Jan 20 (18.89M / 21.9K / 38.1K): https://x.com/Remotion/status/2013626968386765291
- Ole Lehmann guide, Jan 23 (213K / 1.2K / 3.4K): https://x.com/itsolelehmann/status/2014740993208188959
- claire vo, Jan 23 (66.7K / 449 / 677): https://x.com/clairevo/status/2014819359244615890
- Javi (rameerez), Jan 26 (318.5K / 1.7K / 2.1K): https://x.com/rameerez/status/2015859121661059569
- Jonny Burger beginner guide, Jan 26 (97.9K / 453 / 833): https://x.com/JNYBGR/status/2015708193167479209
- Riley Brown, Jan 21 (95.5K): https://x.com/rileybrown/status/2013868186807242855
- Joshua Xu / HeyGen, Jan 29 (173.6K): https://x.com/joshua_xu_/status/2016714990242439600
- Elvis (omarsar0), Feb 10 (46.7K): https://x.com/omarsar0/status/2021222728393687217
- Oliver Henry (Larry), Feb 17 (1.36M / 2.8K / 10.6K): https://x.com/oliverhenry/status/2023776478446436696
- SuguruKun (Remotion captions, JP), Mar 17 (55K): https://x.com/SuguruKun_ai/status/2033841774121390490
- Mike Futia slideshow app, Jun 17 (34K): https://x.com/mikefutia/status/2067042344449564871
- Nadia/aesty testing playbook via Vox, Jul 22: https://x.com/Voxyz_ai/status/2079997406481973556
- Sabrina Ramonov, Aug 18 (368K / 578 / 1.1K): https://x.com/Sabrina_Ramonov/status/2089761229418221683
- Tim (timkochjar), Aug 25 (239K / 2.7K / 3.4K): https://x.com/timkochjar/status/2092278549679886507
- Nate Herk (GPT-6 Astra + HyperFrames), Sep 8 (47.8K): https://x.com/nateherk/status/2097449583811125739
- Claude Opus 5.5 launch, Sep 22 (29.7M): https://x.com/claudeai/status/2102435511222890900
- Thariq (trq212), Sep 23 (266.8K): https://x.com/trq212/status/2102870353781641416
- twoclipping UI morph, Sep 24 (1.19M / 12.8K / 21.2K): https://x.com/twoclipping/status/2103273003555402193
- Eric Buess roundup, Sep 24 (422K / 3.2K / 4.5K): https://x.com/EricBuess/status/2103226548413182366
- Mable Joseph receipts, Sep 25: https://x.com/mablesjoseph/status/2103465246014746943
- Rexan Wong, Sep 26 (652.5K / 6.9K / 18.2K): https://x.com/rexan_wong/status/2103707054108299437
- Tony Dinh, Sep 26 (198K): https://x.com/tdinh_me/status/2103703135902740699
- achxvi (Pocketsflow), Sep 26 (1.15M): https://x.com/achxvi/status/2103918792845963545
- Movez full course, Sep 27 (4.27M / 10.2K / 29.9K): https://x.com/0xMovez/status/2104216919033192746
- Florence Motion Lab, Sep 30 (1.66M / 2.3K / 8.9K): https://x.com/flxrnc/status/2105311836190978392
- Florence 14 repos, Nov 2 (150K / 1.7K / 3.5K): https://x.com/flxrnc/status/2117318336837017846
- Hamza Khalid course, Sep 30 (359K): https://x.com/humzaakhalid/status/2105203643758895454
- Ridark recap, Oct 2 (80K): https://x.com/ridark_eth/status/2106005237190275109
- Vox 15 repos, Oct 10 (162.8K): https://x.com/Voxyz_ai/status/2108905392776360333
- Vox huashu-art-motion, Oct 12 (257.6K / 2.1K / 3.8K): https://x.com/Voxyz_ai/status/2109690569563746755
- Big Iron Chris SageCut, Oct 14 (90K): https://x.com/bigironchris/status/2110402795060822460
- Vox lemo-opuscar, Oct 15 (23K): https://x.com/Voxyz_ai/status/2110838129326473353
- Vox motion-prompt, Oct 17 (65K): https://x.com/Voxyz_ai/status/2111502499048026232
- Elliot Padfield archive.org, Oct 22 (245.6K / 3.6K / 8.3K): https://x.com/ElliotPadfield/status/2113393903923581149
- kelanoo What If, Oct 24 (54.4K / 922 / 1.7K): https://x.com/kelanoo/status/2114000213656702984
- Finn Kurzgesagt prompt, Oct 25 (262K / 3.1K / 5.3K): https://x.com/finnardley/status/2114305886420086817
- Nadia FGC, Oct 26 (52.9K): https://x.com/nestymee/status/2114723318033223994
- Corey Ganim Remotion Recaps, Oct 27 (14K): https://x.com/coreyganim/status/2115115153540669747
- Finn explainer prompt, Oct 30 (63.4K / 1.0K / 1.9K): https://x.com/finnardley/status/2116010421740007894
- Finn Roblox prompt, Oct 31 (185K / 909 / 2.0K): https://x.com/finnardley/status/2116504270199554078
- Theo $0 guide, Nov 1 (516.8K / 1.8K / 5.0K): https://x.com/theoardley/status/2116684286837330374
- RoundtableSpace on claude-animated-shorts, Nov 2 (72.7K): https://x.com/RoundtableSpace/status/2117236532482396349
- zafkiv launch workflow, Nov 3: https://x.com/zafkiv/status/2117568630082662709
- mist雨 Claude Design/Motion pipeline, Nov 5: https://x.com/mistm1st/status/2118406062814498958
- Theo Zack D. prompt, Nov 10 (12.4K): https://x.com/theoardley/status/2120124748159996152
- Peef / MotionLab (context), Nov 13 (13.3K / 192 / 377): https://x.com/PeefTwt/status/2121240962374533413

GitHub:
- https://github.com/mromidev/claude-animated-shorts
- https://github.com/heygen-com/hyperframes
- https://github.com/remotion-dev/skills
- https://github.com/kelano86/what-if-animation
- https://github.com/hassancs91/claude-faceless-shorts-creator
- https://github.com/nocodehack/make-short
- https://github.com/alchaincyf/huashu-art-motion
- https://github.com/lemomo-ai/lemo-opuscar
- https://github.com/showheyohtaki/motion-prompt
- https://github.com/cth9191/animate
- https://github.com/whaleyxbt/claude-motion
- https://github.com/AbubakrChan/product-launch-motion
- https://github.com/vincentsch/explainroo
- https://github.com/OpenMontageInc/OpenMontage
- https://github.com/hypit-ai/hypit
- https://github.com/edenfunf/reelmimic
- https://github.com/artemnovitckii/claude-animation-skills
- https://github.com/iart-ai/tiktok-video-skills
- https://github.com/digitalsamba/claude-code-video-toolkit
- https://github.com/zhuyansen/awesome-claude-video-skills
- https://github.com/nestyme/awesome-prompts
- https://github.com/Upload-Post/upload-post-larry-marketing-skill
- https://github.com/greensock/gsap-skills
- https://github.com/LottieFiles/motion-design-skill
- https://github.com/JohnHeibel/ClaudeAnimationBase
- https://github.com/JohnHeibel/PDoomVideo

Official docs:
- Claude Motion: https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
- Opus 5.5 prompting guide: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Remotion skills docs: https://www.remotion.dev/docs/ai/skills
- Remotion license: https://www.remotion.dev/license
- ElevenLabs Eleven v4: https://elevenlabs.io/blog/eleven-v4 and https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4
- TikTok AI-generated content: https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content
- YouTube monetization policies: https://support.google.com/youtube/answer/1311392

YouTube:
- Mr omi, "How to Make Viral Animated Shorts Using Claude (Full Workflow)" (1.04M views): https://www.youtube.com/watch?v=OtbLL6OBNE4
- ReachMora, "I Tried Making a Viral Video Using ONLY Claude AI" (554K): https://www.youtube.com/watch?v=kDcxEIDC5NA
- Grow With Kaz, "I Made VIRAL Animation Videos Using Claude Code (FREE Plugin)" (386K): https://www.youtube.com/watch?v=3tpaWHaiLQ8
- Lukas Margerie, "How to Make Insane Motion Graphics With Opus 5.5" (798K): https://www.youtube.com/watch?v=747ZnEtsRbg
- Chase AI animate tutorial (203K): https://www.youtube.com/watch?v=rscb1DgJtNg
- kelano86 What If walkthrough (16K): https://www.youtube.com/watch?v=XeZTgiEFxY0

Guides:
- Hasan's faceless shorts guide: https://learnwithhasan.com/guide/how-to-make-faceless-youtube-shorts-with-claude-code/
- MotionKit: https://motionforclaude.com/
- MoraViral: https://moraviral.com/
- Shorts & Skills: https://shortsandskills.com/
