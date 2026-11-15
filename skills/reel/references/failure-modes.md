<!-- Failure modes of AI/Claude-made videos and how the best fix them. Research compiled 2026-11-13/14 for Nomen Studio (X playbooks study). Numbers are measured or cited; see the sources inside. -->

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

