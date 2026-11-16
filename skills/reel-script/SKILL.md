---
name: reel-script
description: Script step for a Nomen Studio short. Turns the chosen hook, the payoff line and research.md into videos/<slug>/script.json on the mode's beat sheet: one sentence per beat, beats grouped into 2-9 s shots with motivated transitions that exist in the engine, one *starred* keyword per beat, a literal visual per beat, sfx cues keyed to spoken words using only registered sound names, pronounce respellings, the voice wpm target, music mood and caption preset; then lints it and reads it aloud. Use when asked to write, rewrite, tighten, shorten, re-time or lint a script, voice-over, narration, beat sheet or script.json for a reel / short / TikTok / animated video, to add or fix sound-effect cues, transitions, keywords or pronunciations, and as step 4 of the `reel` skill.
---

# /reel-script: from beat sheet to script.json

`script.json` is the one file the whole pipeline reads: voice.py speaks `text`, timeline.mjs turns beats and shots into
frames, the scenes key every move to its words, sound.py places the cues. Write it so each of them can.

Studio: `C:\Users\bhara\nomen-studio` (or `$NOMEN_STUDIO`). Run every command from there.

## Inputs
- From `reel-hooks`: the chosen hook, the payoff line, `hooks` and `hookVariants`. From `reel-research`: the fact rows
  and the spine in `research.md`, the outliers' beat structure and pacing in `brief.md`.
- `skills/reel/references/modes/<mode>.md` (the **Script template** table is the beat sheet; also the 75 s extension,
  the ending and the common mistakes), `skills/reel/references/styles/<style>.md` or `<style>-bible.md` (what the kit
  can draw), `skills/reel/references/script-rules.md` (§3 retention scripting, §3.9 editing checklist, §4 pacing).
  Evidence: `docs/research/C-hooks-retention.md` §3-4, `docs/research/B-formats-modes.md` §1.
- Worked example: `videos/eiffel-tower-con/script.json` (case-file: 15 beats in 10 shots, 197 words, 63.7 s at
  188 wpm). Shorter ones: `videos/noise-cancelling/`, `videos/deepest-hole/`, `videos/chile-shape/`.

## 1. Budget
- Length: 45-62 s unless the user said otherwise (61+ s when the video must earn on TikTok).
- Pace, `voice.wpm`: 165-200 (house band); 2D story modes (history, back-then, lore) 190-215. The research ranges per
  mode in `skills/reel/references/modes/_global.md` §4.5 run higher for comedic and lore channels; stay in the house
  band. The four sample videos run 176-188.
- Words = seconds x wpm / 60 (52 s at 180 wpm = 156 words). voice.py speeds the natural read up to the target
  (pitch-preserving, at most 1.25x). If the read would need more than ~1.1x, cut whole beats instead: a sped-up
  voice sounds cheap (A §2.D).

## 2. Beats
Fill the beat sheet in order, then apply script-rules.md §3:
- One beat = one sentence (or two very short ones that make one thought), 6-16 words; the hook sentence <= 12; never
  over 20; never two over 15 in a row; vary the lengths. Grade <= 6, present tense for stories, verbs you can animate,
  at most one proper noun per sentence.
- Chain cause and effect: if "and then" fits between two beats, rewrite the link as "but" (conflict) or "so" /
  "because" (consequence). A "You see," line delivers the late context (`"role": "pivot"`).
- Re-hook every 7-12 s (a "But...", a withheld answer, a new number); the twist at 60-80 % of runtime; at most one
  planned dramatic pause (`"pause": 0.7` = seconds of silence after that beat); end within 0.5 s of the payoff
  (`"role": "payoff"`): no sign-off, no call to action.
- `"role": "hook"` on `b01` (voice.py leaves a 0.22 s breath after it).
- Numbers as digits in `text` ("$20,000", "12,262", "1970", "0.2 percent"): `scripts/lib/textnorm.py` spells them for
  the voice and the caption shows them exactly. Round in speech ("about"), exact on screen.
- The line says what the picture cannot; never narrate what the viewer already sees.
- Every factual clause maps to a research.md row; a new claim needs a new row first.

## 3. One starred keyword per beat
Star one word or short phrase per beat: `*Eiffel Tower*`, `*Seven thousand tons*`, `*0.2 percent*`, usually the
number, the named object or the payoff word, often line-final (punctuation inside the stars: `*fortune.*`). Stars
make the boxed caption, a pop plus a music sting (sound.py) and a critic still 2 frames after the word (stills.mjs).
Never star a function word, never two in one beat.

## 4. Shots and transitions
- `shot` groups consecutive beats: one set-up, location or camera idea, 2-9 s, usually 1-3 beats, ids `s01`, `s02`,
  ... in order. `s01` holds only the hook beat (hook variants re-render up to shot 2's start + 8 frames). A shot over
  6.5 s gets a warning: its scene must change the picture every 1-2.5 s.
- `transition` goes on the first beat of each new shot (or `"shots": {"s04": {"transition": "push"}}`); shots without
  one use `defaultTransition`, then `whip`. Names come from `src/core/Reel.tsx`; any other name silently becomes a
  dissolve:

| transition | frames | motivated by |
|---|---|---|
| `whip-left` / `whip-right` (`whip` = left) | 8 | a sideways jump to the next place or step in the same world |
| `whip-up` / `whip-down` | 8 | vertical travel: digging, falling, rising |
| `push` | 10 | going closer or inside: a detail, a cutaway, the "You see," pivot |
| `zoom-out` | 10 | pulling back for scale, context or the payoff |
| `dissolve` | 8 | time passing, a quiet related scene |
| `flash` | 4 (white) | a reveal, a shock, a date stamp |
| `dip` | 12 (black) | night, a time skip, "nothing happened" |
| `iris` | 12 | a playful circle reveal (rare) |
| `slide-up` | 9 | card, list or UI steps |
| `cut` | 0 | a hard jump only (at most a third of the seams) |

Use 3-5 kinds per video, each caused by something on screen. sound.py already plays an air move on every seam (a
whoosh on whips, push and zoom-out, a swish on dissolve and flash, a low swell on dip): never cue your own whoosh on a
seam.

## 5. A visual per beat
`visual` is the literal picture: setting, hero, what moves, what pops on which word ("on 'scrap' a giant SOLD stamp
slams onto it"), the camera move. Only what the style kit can draw (style file); numbers count up; the named object
glows on its word; faces stay out of the caption band (y 1100-1350) and the right rail (x > 900, y > 840).

## 6. Sound cues
Per beat: `"sfx": [{"at": "<word in this beat>", "sound": "<name>", "gain": -16}]`.
- `at` matches this beat's words ignoring case and punctuation ("12,262" works, phrases work, the last word may be a
  prefix). A word that is not in the line stops sound.py. `"t": 0.4` (seconds after the beat starts) replaces `at`
  for a cue on no word.
- Placement: graphic sounds land ON the word (pop, ding, click, tick, tick_roll, swoosh_up, whoosh, stamp, cash,
  sparkle, heart_pop, notify, glitch, shutter); every other sound goes in the pause AFTER it. Override with
  `"place": "on"` or `"after"`; nudge with `"offset"` (seconds, default one frame).
- Optional keys: `pan` (-1..1), `args` (generator options, e.g. `{"pitch": 1.1}`, `{"dur": 0.5}`), `"room": true`
  (reverb), `dur` (tick_roll length in seconds).
- `gain` defaults to -16: -10 for a big slam, -24 for texture. A graphic sound on a spoken word is capped at -19;
  foley that would land on speech moves into the next pause. Density: 4-10 noticeable cues per minute on structure
  (hook frame, re-hooks, reveals, numbers, the end); sound.py warns above 14. It already adds the seam moves and a
  pop with a music sting on every starred word, so 1-2 cues per beat is plenty.
- `"ambience": ["train"]` on a beat lays a bed under its whole shot.

Registered names (`audio/synth.py` + `audio/sfx_extra.py`; sound.py rejects anything else):

| use | sounds |
|---|---|
| reveals, numbers, stings | impact, sub_drop, riser, low_swell, pressure_drop, record_scratch, success, error_buzz, boing, thud, gold_chime, counter_tick, whoosh_timeskip, flash_swish |
| screen graphics, UI | pop, heart_pop, ding, click, tick, sparkle, notify, glitch, shutter, stamp, cash, swoosh_up, whoosh, scan_beep, typewriter, keyboard_type |
| home and body foley | door_open, door_close, latch_click, footstep, floorboard_creak, giant_step, blanket_rustle, mattress_sit, breath, snore, sneeze, slurp, heartbeat, lamp_switch_click, phone_pickup, phone_set_down_wood, plush_pickup, plush_place, plush_squeak, pen_scribble, chalk_write, alarm_beep, alarm_muffled, whimper |
| hits, breaks, digging | bonk, kick, knock, clunk, metal_clang, metal_groan, wood_snap, glass_crack, bone_clatter, crumble, dig, grate, candy_rattle, deflate |
| vehicles, machines, elements | car_pass, car_horn, car_alarm, car_crash, distant_boom, toot, zap, hiss, whoomp, portal_wub |
| water | water_splash, cartoon_splash, splash, plip, fish_blub |
| animals | dog_bark, cat_meow, crow_caw, parrot_chirp, hamster_squeak, puppy_howl, wing_flutter |
| special (sound.py) | tick_roll (a counter roll; give `dur`), boom (a drum hit inside the music) |
| ambience beds | applause, buzz, cabin_hum, city_day, clock, crickets, crowd_cheer, drill, dry_leaves, fan, fire, kids_laugh, lamp_hum, rain_window, rocket_rumble, room_tone (always on), siren, sleigh_bells, surf, traffic_flow, train, turbines, water_rush, wind |

After audio changes, re-list them:
```bash
PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe -c "import sys; sys.path.insert(0, 'audio'); import synth as S, sfx_extra; print(sorted(S.SFX)); print(sorted(S.AMBIENCE))"
```

## 7. Names, voice and globals
- `pronounce`: `{"Poisson": "Pwa-sohn"}`: one word to a hyphenated respelling, matched case-insensitively on the bare
  word, for every name or foreign word the TTS voice could miss (respelled words are wildcards in the ASR check).
- `voice`: the house default is one full ElevenLabs take (`reel` step 5): copy the `voice` block of a sample script
  (`"provider": "take"`, voice "Liam", `voiceId`, `"model": "eleven_v4"`, `direction`, `wpm`). A take reads the text
  as written, so `pronounce` does not apply to it: use a per-beat `takeText` (the spoken form for the take, e.g.
  numbers written out) or `voice.ipa` (replacements for hard names in the take prompt). Without a take,
  `"provider": "auto"` picks the ElevenLabs API when its key is set, else the free Edge voice; per beat `say`
  overrides the TTS text (prefer `pronounce`). `direction` (an ElevenLabs v4 audio tag) applies to the first line,
  a per-beat `direction` to that line.
- `music.mood`: heist, mystery, wonder, workshop, epic, comedy, drama, uplift, calm, or the trap-family beds plugg,
  rage, jerk (empty = sound.py's mode default; `tiff` -> plugg, `ug-rap` -> rage).
- `captions.preset`: keep the default that new-video.mjs wrote (stickworld boxed, blockcraft chunky, glowvector
  clean, atlas bold-pop; `tiff` lower = lowercase with a lilac keyword box). Avoid `pixel` for captions: pixel fonts
  read worse at caption size.

## 7b. Dialogue and the story modes (`tiff`, `ug-rap`)
- **Dialogue lines:** a beat with `"speaker": "<name>"` is spoken in that character's voice from `voice.cast`:
  `"cast": {"gatekeeper": {"voice": "en-US-GuyNeural", "rate": "+4%"}, "lowballer": {"voice": "en-US-RogerNeural",
  "pitch": "-2Hz"}}` (Edge voice names; `settings` for ElevenLabs). Beats without `speaker` are the narrator
  (`voice.voice`). One line of dialogue per beat; the caption shows it like any line; in the scene make that
  character talk with `talking={s.speaking(["b05"])}` and point the camera at them. A take (`provider: "take"`) is
  one voice only: dialogue needs per-beat TTS. Free voices: en-US Ava / Emma (+Multilingual), Aria, Jenny, Michelle,
  Ana (child); Andrew / Brian (+Multilingual), Guy, Roger, Christopher, Eric, Steffan; en-GB Ryan, Thomas, Sonia,
  Libby, Maisie.
- `channel` (`"tiff"` / `"ug"`) and `series: {"name": "Tiff", "episode": 7}`: number every episode.
- `plug: {"pattern": "punchline" | "habit" | "ad-beat", "beats": ["b10", "b11"]}`: the beats where pileGo! happens.
  lint fails a plug that starts before ~68 % of the words, more than two spoken "pileGo!", and (ug-rap) a plug beat
  that names the real person the episode is about. Add `"pronounce": {"pileGo": "pile go"}`.
- `subject` (ug-rap only): `{"kind": "bio" | "scenario" | "scene", "name": "...", "real": true}`; a real person needs
  >= 6 sourced rows in research.md before the script is written (two sources per fact).
- The last spoken beat is a joke, a loop or a comment question (`"role": "kicker"`), never a CTA; the brand end card
  is a picture after it.
- `defaultTransition` from step 4; `hooks` and `hookVariants` from `reel-hooks`.

## 8. Lint (gate)
```bash
node scripts/lint-script.mjs <slug>
```
It checks beat lengths, the hook sentence, one starred keyword per beat, contiguous shots, transition, sound,
ambience and mood names against the engine, that every sfx `at` word is in its line, the hooks / hookVariants
shape, `pronounce` keys and the transition mix.
Fix every `x` line; an `!` line stays only with a reason. Then walk script-rules.md §3.9 by hand: delete the first
sentence and see if it still works, kill throat-clearing, one new fact or turn per line, a re-hook at least every 3
sentences, stop at the payoff.

## 9. Read-aloud (gate)
Say every beat at the target pace. Split anything you cannot say in one breath; rewrite tongue-twisters, homographs
(read, lead, live, wind) and number strings that read two ways; add a `pronounce` entry for every name. After
voice.py, `--verify` (the ASR check) is the measured version of this test.

## Output to the caller
`script.json` written; words, estimated length at the target wpm, beats, shots, transitions used and the lint result.
