<!-- The measured quality bar (numbers the scripts and the critic enforce). Research compiled 2026-11-13/14 for Nomen Studio (X playbooks study: 25 ranked sources, ~90 primary). Numbers are measured or cited; see the sources inside. -->

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

