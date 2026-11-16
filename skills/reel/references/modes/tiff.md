<!-- Mode: tiff. Built 2026-11-15 from the checked niche bibles in references/niche/ (story-formats, ug-rap, archive-fashion, resale) and the owner's brief. Numbers and rules cite those files; re-check the "Freshness" tables there before every episode. -->

## MODE 9 — TIFF x pileGo! (the story series)

**Purpose.** Episodic comedy about the archive-fashion / underground-rap ("Ug") side of TikTok and Instagram, starring
**Tiff**, an original animated lead, that makes insiders laugh and every episode ties into the owner's app **pileGo!**.
The owner gives a broad premise ("tiff gets lowballed", "tiff at a show", "the chair pile"); this mode fleshes it into a
whole story using the scene's real formats, jokes and memes. Views first: the joke must land with the plug cut out.

**Input:** a premise in the owner's words (anything from 3 words to a paragraph). Nothing else is required. Do not ask
questions: pick the format, the episode number, the plug pattern, and say in one line what you picked.

**Read first:** `brands/pilego.md` (what the app does, plug rules), `niche/story-formats.md` (formats, framing, posting
compliance), `niche/ug-rap.md`, `niche/archive-fashion.md`, `niche/resale.md` (facts, slang, cringe lists),
`styles/stickworld.md` (Tiff, closet kit, `frameOn`, `look="club"`, SCENE_CAST, brand devices). And the last 3 Tiff
episodes' `script.json` so this one differs (format, villain, location, plug pattern).

## Tiff (character bible)
| | |
|---|---|
| Who | Tiff, 23. Original character (not any real person); obviously drawn, never presented as a real woman. Her own flat, a job, rent; 18+ life only (never school settings). |
| Look (fixed) | Long silver-lavender hair, big blue eyes, black choker, black scoop tank, frayed high-waisted jean shorts, black block-heel boots. A fit episode may add ONE layer (jacket, beanie); the anchors stay. `CAST.tiff`. |
| Taste | Deep in the Ug scene and archive fashion; knows the lore better than the gatekeepers. Owns pieces that look plain and are worth a lot to insiders (the ballhog mechanic). Honest seller: never lists reps as genuine. |
| Voice | Dry, deadpan, fast, lowercase energy. Understates. Never explains the meme inside the joke. At most 2 scene slang words per episode, used correctly (`niche/story-formats.md` glossary). Punches up (at gatekeepers, lowballers, herself), never at fans who are new. |
| Repeatable bit | **The relist snap** (every episode, ~1 s): she photographs the offending pile, the shutter + the same chime, and a deadpan "listed." Same pose (`phone`), same sound pair (`shutter` then `ding`), same stamp. |
| Relationship to pileGo! | She is pileGo!'s own character (the advertiser's spokesperson), never an independent user who "found" the app: no "I found this app" lines, no testimonials, no results claims. |
| Recurring cast | `SCENE_CAST`: the gatekeeper, the lowballer (one recurring villain per saga), the archive bro, the bestie, the newgen, original stand-in rappers, security. Real people are never characters. |
| Narration | First person, present tense, Tiff narrating (`en-US-AvaMultilingualNeural`, rate +6 %, ~190 wpm). Other characters speak their lines in their own cast voices (`speaker` + `voice.cast`). |

## Premise -> story (the step this mode adds)
1. **Format.** Pick the format from `niche/story-formats.md` (F1-F11) that best fits the premise; default by premise:
   a person who quizzes / judges her -> **F4 gatekeeper flip**; a buyer / DM -> **F6 numbered reseller saga** or **F8
   chat-thread sitcom**; her clothes / fit -> **F1 plain-fit reveal** or **F10 keep / relist / burn**; the scene itself
   -> **F3 types lineup** or **F5 obscurity ladder**; an ad joke -> **F11 honest-ad parody** (at most monthly);
   anything else -> **storytime** (the beat sheet below).
2. **Joke engine in one line:** "Tiff vs <who> over <what>; the reversal is <twist>". If you cannot write it, the
   premise needs a sharper conflict: make someone underestimate her.
3. **3-5 real scene details** that make insiders laugh (from the niche files, confidence verified or single-source,
   each copied as a row into `research.md` with its source). Facts about real artists: verified only, and never the
   butt of the joke.
4. **Freshness check (5 minutes):** search the premise's terms on TikTok topic pages / WebSearch for this week; if a
   word in your joke has gone ironic or dated (see each niche file's Freshness table), keep the mechanic and swap
   the word. Write what you checked in `brief.md`.
5. **The plug:** choose the pattern (`brands/pilego.md`): punchline (~70 % of episodes), habit, or self-aware ad beat;
   it releases the exact pain the story built, after ~70 % of the runtime. Write `plug` in script.json.
6. **The closer:** a real comment question the next episode can act on ("accept the $4, counter or block?"). Never
   "like for part 2" / "follow for more".

## Script template: storytime, 35-45 s (~120-145 words at ~190 wpm)
| t (s) | Beat | Script job | On screen |
|---|---|---|---|
| 0-2 | HOOK | The premise as a conflict, <= 12 words, the villain or the problem named ("a guy at the show just asked me to name three songs") | Tiff's face + the other party in frame 1; lowercase premise overlay (3-5 words); "pt N" tag if a saga |
| 2-10 | ESCALATION | 2-3 beats: the other side pushes; she answers too fast and too deep; a dialogue line in his voice | Two-shot -> her CU deadpan -> his reaction; `Bubble` for his line |
| 10-22 | TURN | The reversal set up: the detail only she notices (the scene knowledge, the honest listing, the price) | Push-in on the detail; `Tag` / `Arrow` on the word |
| 22-30 | TWIST | The detail pays off: he is exposed by the thing he thought made him credible | Flash or whip to the proof (a listing card, a DM, the chair) |
| 30-38 | PILEGO! (>= 70 %) | The release in 1-3 s: the relist snap, the app does what it does, the pile shrinks | `PileGoPhone` (cut -> list -> live -> sold -> down everywhere else) or `SoldStack`; `ClothesChair sold=` |
| 38-45 | KICKER + CLOSER | The last laugh (an ironic callback to the hook) + the comment question | Her smug CU; then `EndCard` (1.2-1.6 s) |
Short formats (F1, F4, F6, F8: 15-30 s) use the per-format beat timings in `niche/story-formats.md`; keep the hook,
the >= 70 % plug and the closer. A 15-25 s episode posts best as a numbered saga part.

## Hook templates (mechanics; never copy a real post's words)
- **Role reversal:** "<someone> tried to <judge/quiz/lowball> me. <three words of foreshadow>."
- **Absurd number:** "he offered $4 for the boots." (the offer IS the hook; the number on screen)
- **Plain-fit dare:** "price this fit." (frame 1: the plain default fit; the payoff is the gap)
- **Comment reply:** a `CommentReply` sticker with a REAL comment (only once real comments exist) + "pt N".
- **Types title:** "types of people at an underground show (i'm #6)".
Score every candidate with `reel-hooks` (>= 80). Weak openers in this niche (Nov 2026): "come with me", "watch until
the end", a generic "wait for it", "you need this".

## Visual conventions (StickWorld)
- Sets: her bedroom (the chair pile, a rail, a mirror, shipping boxes: `src/lab/TiffStage.tsx`), an underground show
  (`Venue` + `look="club"`), the merch line, the street after the show (`look="night"`), a thrift / vintage shop
  (`Rack`s + `ShopCounter`), the post office queue (boxes). One location per shot; whip across side-by-side sets.
- Frame Tiff with `frameOn()` only; attractive through face, hair, attitude and fit; never body-focused framing,
  low angles or slow moves over the figure (P0 in critic.md). Deadpan = `unimpressed` / `smug`; reactions on words.
- Dialogue: the speaker talks (`talking={s.speaking(["b05"])}`), the camera is on them, a `Bubble` for punchy lines.
- Screen texts in lowercase (the scene's case); caps only for a shout. Captions: preset `lower`.
- A <= 10-frame deep-fry / flash on the reveal is on-genre (`FlashFX`); it never covers captions or a face.
- The pileGo! moment: Tiff's phone in hand (`items` phone) -> `PileGoPhone` insert (2-4 s) -> the chair pile shrinks
  (`sold` frames) / `SoldStack`. Platform names as text only.

## Voice and audio
- Narrator Tiff: Ava (Edge; an ElevenLabs take if a connector is attached: pick a young, dry female voice and keep it
  for the series). Side characters: `voice.cast` (gatekeeper `en-US-GuyNeural`, lowballer `en-US-RogerNeural`, archive
  bro `en-US-EricNeural`, bestie `en-US-EmmaNeural`, UK characters `en-GB-RyanNeural` / `en-GB-ThomasNeural`).
- Music: `plugg` (default: dreamy, playful), `jerk` for chaotic / show energy, `rage` for a hype reveal. Original
  code-made beds only (never real tracks or soundalikes).
- Signature sounds: the relist snap = `shutter` + `ding` (same args every episode); sale pings = `notify`; lowball
  messages = `pop`; the reveal = `record_scratch` or `impact` (one per episode).

## Series mechanics
- `series.episode` increments every episode ("pt N" in frame 1 for sagas). Season arcs with one recurring villain.
- End on a real choice; the next episode acts on the top comment (reply-to-comment format, real comments only).
- Vary format, location, villain and plug pattern across consecutive episodes (inauthentic / mass-produced rules).

## Compliance (before every post: the checklist in `niche/story-formats.md`)
TikTok "Your brand" disclosure on; Instagram "Add AI label" on (synthetic voice); handle or bio makes the pileGo! link
obvious ("pileGo!'s animated character, synthetic voice"); no real person shown / voiced / implied endorsing; no logos
drawn; claims only from `brands/pilego.md`.

## Common mistakes
- A video ABOUT the app; the app before 70 %; a feature list; a pitch voice; "I found this app".
- Explaining the meme; > 2 slang words; dated slang; a wrong artist fact; mocking newcomers or women in the scene.
- Body-focused framing of Tiff; a revealing variant of her fit; school-coded anything.
- Same format / villain / plug pattern as the last episode.
