<!-- Captions, safe zones, audio. Research compiled 2026-11-13/14 for Nomen Studio (hooks study). Numbers are measured or cited; see the sources inside. -->

## 5. Captions & platform safe zones

### 5.1 Chunking (word-by-word captions)
- **Default: 2–4 words per chunk** (~0.7–1.4 s at 175 WPM), **≤2 lines, ≤ ~15–18 characters per line**.
- **1-word chunks** for punchlines, numbers and hype moments.
- Never more than ~6 words visible at once [V: Subclip 2026, 1–2 lines and <40 characters; Submagic Hormozi recipe, 4–6 words over 2 lines at most].
- Remotion references:
  - Official TikTok template: `createTikTokStyleCaptions({combineTokensWithinMilliseconds: 1200})`; 200 ms gives one word at a time ([template-tiktok](https://github.com/remotion-dev/template-tiktok)).
  - Popping-word element: 800 ms. Basic captions element: 3000 ms (too long for Shorts).
- **Break rules:**
  - Break at punctuation and phrase boundaries.
  - Keep numbers with their units, and adjectives with their nouns.
  - Never end a chunk on an article or preposition ("a", "the", "of").
  - Put the keyword where it gets the highlight.
  - The chunk switches on the same frame as its picture (see §4).
- **Sync:** the active-word highlight starts at word onset from forced alignment (Whisper or faster-whisper word timestamps). Lead visual cuts by 0–2 frames, never late.

### 5.2 Typography (1080×1920)
| Spec | Narrative/explainer style (Zack D / Kurzgesagt-like) | Hype style (Hormozi / MrBeast-like) |
|---|---|---|
| Font (Google Fonts) | **Montserrat 800/900**, Poppins 800, **TikTok Sans** (official TikTok typeface, OFL, on Google Fonts since Jul 2025), Inter/Figtree 800, Rubik 700–800, Gabarito 800, Nunito 900 (rounded) | **Anton** (Submagic's "new Hormozi"), **Bebas Neue**, Archivo Black, Montserrat Black; cartoon: **Bangers / Luckiest Guy / Lilita One** (free stand-ins for MrBeast's Komika Axis) |
| Casing | Sentence case | ALL CAPS (only for 1–3-word chunks) |
| Size | **72–90 px** for 3–4 words | **100–130 px** for 1–2 words (Remotion template: 120 px max, fit to width) |
| Weight | 800–900 | 800–900 |
| Fill / stroke | White #FFFFFF; stroke ≈ **fontSize/7** black with `paint-order: stroke fill` (Remotion caption elements use exactly fontSize/7) *or* no stroke plus a soft shadow `0 4px 12px rgba(0,0,0,.6)` | White; thick black stroke (Remotion template uses a 20 px WebkitTextStroke at 120 px with paint-order stroke) plus a drop shadow |
| Active word | Color swap (yellow #FFE600, green #39E508 as in the Remotion template, cyan #00E5FF), scale 1.03–1.1 | Color swap plus pop scale 1.1–1.2, or a moving pill/box behind the word (#2563EB-style, radius ~0.25 em) |
| Keyword box | ≤1 per sentence | ≤1 per chunk |
| Line height | 1.05–1.15 | 0.95–1.05 |
| Enter animation | 3–5 frames (Remotion template: spring damping 200, 5 frames, scale 0.8→1, y +50→0) | pop-in from below, 4–6 frames |

**Font usage data [D]:** Submagic's export of ~2M short videos (2025 update) found Montserrat on 61%, then Rubik 7.9%, Fira Sans Condensed 6.5%, Gabarito 6.3%, Poppins 5.1%, and DM Serif Display 3.1% ([Submagic](https://www.submagic.co/blog/best-font-for-subtitle)). Captions are near-universal: 80.2% of 12.2M OpusClip clips (Q1 2026) had captions and 78.6% were animated [D] ([OpusClip](https://www.opus.pro/research/best-caption-strategy-short-form)).

**Not on Google Fonts**, so license before use: The Bold Font (old Hormozi style; default in Remotion's TikTok template), Komika Axis, Proxima Nova, CocoGoose, Circular.

**Emoji:**
- Optional. 0–1 per sentence, at emotional keywords only, sized ≈1× cap height, popping in with the word.
- Never replace words with emoji, and skip emoji for serious or tragic topics.
- Observed pattern [M]: Zack D. puts one emotion emoji at the **end of every title** (25/25 top titles) and none in the captions. Submagic offers auto-emoji (a styling choice, not evidence).

**Captions and sound-off:** directional, dated evidence only.
- Facebook (2016): captions lifted ad view time ~12%.
- Verizon/Publicis 2019 (n=5,616): 69% watch muted in public; 80% are more likely to finish when captions are available [D, dated].
- On TikTok, 88% of users say sound is vital [P], so treat captions as a **comprehension and retention layer**, not a mute fallback.

### 5.3 Safe zones (px on 1080×1920)
| Platform | Top | Bottom | Left | Right | Status |
|---|---|---|---|---|---|
| **Instagram Reels** (also FB Reels/Stories) | **269** (14%) | **672** (35%; 768 = 40% if a disclaimer is present) | **65** (6%) | **65** (6%) | [P] Meta ads guidance in percentages; pixels computed ([Meta help 980593475366490](https://www.facebook.com/business/help/980593475366490/)) |
| **YouTube Shorts** | **288** | **672** | **48** | **192** | [P] Google's vertical safe-zone PNG template for ads, as read by multiple third parties → safe box 840×960 at (48, 288). No organic spec is published |
| **TikTok** | **~130–220** | **~400–484** (grows with long captions, CTA, anchors) | **~44–64** | **~120–180** (action rail) | [V] TikTok publishes only downloadable ad-template ZIPs and says the zone varies with caption length and format ([TikTok help](https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads)). Values are consensus third-party measurements |
| **Universal (strictest per side)** | **288** | **672** | **65** | **192** | Safe box **x 65–888, y 288–1248** (823×960) |

**Placement rules for the renderer:**
- **Text hook / title**: top band **y 290–620**, max width ~900 px (centered). The right rail does not reach this high on TikTok or IG, but YouTube's template still reserves the right 192 px, so keep text inside **x 90–888** if it is critical.
- **Captions**: block center **y ≈ 1050–1250**, bottom edge **≤ 1248** (ad-safe) or ≤ ~1400 (organic only), max width **~720 px** centered (x 180–900) to clear the right rail.
  - Remotion's TikTok template puts captions at `bottom: 350` (y ≈ 1420–1570) with 90% width. That sits **inside** TikTok's and IG's bottom UI and the right rail, so override it.
- **Faces, key objects and numbers**: keep inside the universal box. Don't put captions over the subject's face or the key object (move captions up to y ≈ 900 when the action is low).
- **Verify on a device** once per template: overlay the platform PNG and screenshot real app UI. The UI shifts across devices and with long post captions.

## 6. Audio

### 6.1 Loudness targets (final stereo mix)
- **Integrated −14 LUFS, true peak ≤ −1.0 dBTP**; use **−1.5 dBTP** to survive AAC/xHE-AAC transcoding. One master serves all three platforms [V consensus].
- YouTube normalizes loud content **down** to about −14 LUFS and does not boost quiet content. This is measured behavior, not documented [V].
- Instagram/Meta uses xHE-AAC with loudness management that adapts to playback context (reported). No published target.
- TikTok publishes no target. One 2026 source says in-feed playback is **not** normalized, so louder plays louder [V, unconfirmed]. Don't go hotter than about −12 LUFS: it risks distortion and fatigue for no proven gain.
- **Voice stem**: short-term −16 to −14 LUFS while speaking.
- **Voice chain**:
  - high-pass filter at 80–100 Hz
  - gentle compression, 3:1, 3–6 dB gain reduction
  - de-esser
  - +2–4 dB presence boost at 3–5 kHz
  - limiter
- Check on a phone speaker.

### 6.2 Music under voice
- **Static bed 18–24 dB below the voice during speech** (LU difference). With the voice at −14 to −16 LUFS short-term, the bed sits at about **−34 to −40 LUFS short-term**.
- Measured narrated documentary channels run 24–31 dB under [V]. W3C accessibility guidance (reported) says non-speech sound should be ≥20 dB below speech.
- **Ducking**: an additional 3–6 dB under speech, via sidechain from the voice:
  - attack 10–30 ms
  - hold 100 ms
  - release 200–400 ms
- In speech gaps of 0.6 s or more, the music may swell 4–8 dB.
- **Start the music at frame 0, with no fade-in. End on a hit or a hard stop that matches the loop point.**

**Music by mood/format [V/house]:**
| Format | Music | BPM |
|---|---|---|
| Mystery / dark history / disaster | dark ambient drone, pulses, ticking, low strings | 70–90 |
| Science / awe / space | cinematic pads plus arpeggios, swell at the reveal | 90–110 |
| Emotional true story | sparse piano or strings | 60–80 |
| How-it's-made / process | minimal electronic or lo-fi percussion; cut on the beat | 100–120 |
| Listicle / fast facts / hype | upbeat electronic, light phonk/trap | 120–150 |
| App marketing / tutorial | light, positive pop or lo-fi, unobtrusive | 100–120 |

**Rights and trending sounds:**
- Use licensed or royalty-free tracks, or the platform libraries (TikTok Commercial Music Library for business accounts, YouTube Audio Library). Rendered-in copyrighted music triggers Content ID.
- Trending-sound reach lifts (e.g., "+47%") are vendor claims [F]. If you use a trending sound, add it in-app at a very low level under the VO.

### 6.3 SFX
- **Vocabulary:**
  - whoosh (whip pans and transitions, < 0.3–0.5 s, peak on the cut frame)
  - pop/click/tick (caption or keyword pops, very quiet)
  - impact/boom/sub-drop (reveals, big numbers, hook frame)
  - riser (1–3 s into a reveal; resolve on the reveal frame)
  - ding/check (list items)
  - record-scratch or rewind (twist)
  - foley/room tone under actions (realism)
- **Density [V; no primary study]:**
  - **Accent SFX** the viewer consciously hears: **≈4–10 per minute**, placed on structure (hook frame, each re-hook, reveal, twist, ending), not on every cut.
  - **Micro-SFX** (ticks under caption pops, foley): allowed more often, but ≥20 dB under the voice.
  - Rotate 3–5 variants per SFX type so they don't wear out.
- **Levels**:
  - accent SFX peaks 6–12 dB under the voice peaks
  - micro-SFX −20 to −26 dB relative to the voice
  - never mask consonants: place hits between words or on vowels

### 6.4 Silence trimming between sentences (TTS)
**Measured [M]:**
- Across 70 viral Shorts, the onset-to-onset gap after a sentence-final word exceeded normal word spacing (median **0.24 s** between word onsets) by a **median 0.48 s** (p25 0.28, p75 0.72, p90 1.16; n=759 boundaries).
- At commas the excess was 0.20 s (p75 0.40).
- These figures include final-word lengthening, so **actual silence ≈ 0.25–0.45 s at sentence ends and 0.1–0.2 s at commas**.
- Dense TTS-style channels (The Infographics Show) had **zero** gaps ≥0.8 s. Emotional Zack D stories had 17–20 per minute.

**House rules:**
- Sentence gap **0.20–0.35 s** for energetic explainers; **0.35–0.50 s** for stories; **≤ 0.6 s** max otherwise.
- Comma 0.10–0.20 s. Paragraph or scene turn 0.45–0.6 s.
- **One planned dramatic beat** of 0.6–1.0 s before the reveal, filled with a riser or music swell, never dead air.
- Lead-in silence ≤ 0.1 s. After the last word, ≤ 0.3 s, then cut (or loop).
- A practitioner spec for Zack-D-style builds squeezes all pauses to ≤ 0.35 s [V]. Descript's gap tool example targets 200 ms [V].
- **Too rushed:** < 0.15 s at sentence ends combined with > 210 WPM reads as rushed for narrative. Fine for listicles.

