<!-- Mode: ug-rap. Built 2026-11-15 from the checked niche bibles in references/niche/ (ug-rap, story-formats, archive-fashion, resale) and the owner's brief. Re-check the "Freshness" tables there before every episode. -->

## MODE 10 — UG RAP (the second channel: stories, scenarios, biographies)

**Purpose.** A separate channel about the underground-rap ("Ug") scene: how artists rose, how sounds and scenes were
born, and fictional scenarios inside that world, told as tight animated stories with the same quality bar as every
Nomen Studio video, and each episode ties into pileGo! through the scene's clothes (merch, fits, the pile after a show).

**Input:** an artist, a scene / subgenre, or a premise ("how jerk took over", "a bedroom producer's first leak",
"<artist>'s rise"). Pick the kind, say it in one line, go.

**Read first:** `niche/ug-rap.md` (the map, artists, bio-ready list, fan culture, cringe list), `niche/story-formats.md`
(formats, posting compliance), `brands/pilego.md`, `niche/archive-fashion.md` (fits, the merch / resale angle),
`styles/stickworld.md` (stand-in cast, `Venue`, `look="club"`), `modes/case-file.md` (the true-story beat grammar this
mode borrows for bios).

## Three kinds of episode (`subject.kind` in script.json)
| kind | what it is | facts | characters |
|---|---|---|---|
| `bio` | a real artist's rise / a turning point, 45-60 s | every claim from `research.md`, two sources each, >= 6 rows before the script; dates exact; "about" when sources differ | the artist drawn as THEMSELVES, recognisably, from the look sheet (below) in the StickWorld style; name label too |
| `scene` | how a sound, a subgenre or a scene moment happened (jerk, rage, plugg, UK Ug, sleazepop...) | as `bio` | artists who appear are drawn from their look sheets; the crowd and fans are original characters |
| `scenario` | fiction inside the scene ("POV: your song leaks before you finish it"), 25-45 s | real scene mechanics only (how leaks, snippets, shows, merch actually work, from the niche file) | original characters only (`SCENE_CAST.rapper` and friends); invented names that are not real artists' names |

**Living people (bio / scene):** verified facts only; no rumours, allegations, legal matters, health, relationships,
family, addresses or money claims; no invented quotes or "imagined" dialogue for a real person (narration describes; the
drawn artist acts out only sourced public moments: the upload, the show, the walk-out, the shoot); no mockery; pronouns as the artist uses them (`niche/ug-rap.md`). Never imply a real person uses,
likes or endorses pileGo! or anything else.

## Drawing the real artist (bio / scene): accurate to the real person
Owner decision (2026-11-16): in bio and scene episodes the artist is drawn as themselves, as accurately as the
StickWorld style allows, so fans recognise them at a glance. A generic stand-in under a real name reads as wrong to
the people this channel is for. The steps:
1. **Look sheet** (gate, before any scene code): a `## Look sheet` section in `videos/<slug>/research.md`, one table
   per era the video shows (e.g. the bedroom era, the breakout, now). Rows: hair (cut, length, colour), facial hair,
   skin tone, build, eyewear, piercings / earrings, visible tattoos (as simple marks), the era's signature garments
   (cut and colour, no logos), signature accessories (chain, mask, balaclava, cap, bag). Each row cites public
   photos: press shoots, news photos of shows, the artist's own posts, with outlet, URL and date. A trait goes on the
   sheet only when two photos of that era show it; a single-photo trait is marked `(1 photo)` and used only for the
   moment that photo shows. Do not guess an era's look from a later photo: an era with no photos gets the nearest
   sourced look and the sheet says so.
2. **Cast entry:** map the sheet to a `StickSpec` in `src/channels/ugCast.ts` (`UG_CAST.<artist>.<era>`), reused by
   every episode about that artist. Skin tone through the drawing's `head` colour, never a default that contradicts
   the photos. If a signature trait has no field (a specific cut, a mask shape), add it to
   `styles/stickworld/draw.ts` the way `skullet` and `gilet` were added, then look-dev it before scene work.
3. **Likeness check** (gate): render the cast entry (a scene still or a lab still), open it next to the look-sheet
   photos, and tick every row of the sheet (`ok` / `fixed`). The critic checks the figure against the sheet (a P0
   when it is off model).
4. **Limits that stay:** a drawn StickWorld cartoon, never photoreal, never a traced photo or a photo texture on the
   face; no logos, monograms or printed artwork on their clothes (the garment in its cut and colours, an abstract
   print in place of a photo print); flattering, not mocking (no exaggerated unflattering features); never voiced,
   never quoted beyond sourced quotes in narration; never in a plug shot, next to pileGo! UI or holding a phone with
   it; nothing about private life. Scenario episodes still use original characters, never a real artist's look.
5. **post.md:** one line for the owner under "Owner decision to re-check": a recognisable real person in a branded
   post (right-of-publicity and endorsement rules: FTC, UK CAP 6.1, EU); the pure-bio cut without the plug is the
   safer alternative. Posting stays the owner's call.

## Script template: bio, 45-60 s (~150-185 words at ~188 wpm)
| t (s) | Beat | Script job | On screen |
|---|---|---|---|
| 0-3 | HOOK | The paradox of the rise in <= 12 words (a number, an age, a place, a "nobody knew") | The artist (look sheet) mid-action (bedroom studio, a stage) + a 3-5 word text hook; `TitleCard` is NOT frame 0 |
| 3-12 | ORIGIN | Where and when, the first uploads, the first alias | `YearStamp`, `AliasStack`, `TrackCard` (plays counting) |
| 12-25 | THE RISE | 2-3 beats, each a dated step (the track, the scene, the move) | Shows growing (`Venue` crowd size up), a map pin, a counter |
| 25-38 | THE TURN | The moment it changed (a release, a tour, a sound others copied), the "but" | Push-in, `YearStamp` / stamp on the word |
| 38-48 | THE SCENE NOW | What it means for the scene / fans (verified) | The crowd, the merch line, fits |
| 42-55 | PILEGO! (>= 70 %) | The fans' side only: the merch / fit afterlife, the pile after the show; pileGo! lists it everywhere | A fan stand-in's chair pile, `PileGoPhone` or `SoldStack`; the artist is not in these shots |
| 55-60 | KICKER | A loop back to the hook or a comment question ("which era are you from?") | `EndCard` after the line |
Scene episodes use the same sheet with a sound / movement as the subject. Scenarios use the storytime sheet in
`modes/tiff.md` (hook, escalation, turn, twist, plug >= 70 %, kicker).

## Hook templates (mechanics)
- **Origin paradox:** "<age> years old, <place>, and the scene already <copied / knew> him." (only with sourced facts)
- **Number:** "<n> plays before anyone knew <his / their> name." (exact number from research.md)
- **Alias reveal:** "He had <n> names before this one." / an alias stack on frame 0.
- **Scene birth:** "This sound started in <place>, and now <scale>."
- **Scenario POV:** "POV: your song leaks before you finish it." (original characters)
Score with `reel-hooks` (>= 80). Weak openers in this niche (Nov 2026): "come with me", "watch until the end", "wait
for it", "you need this".

## Visual conventions (StickWorld + the channel kit `src/channels/ug.tsx`)
- Sets: a bedroom studio (desk, laptop, a lamp: the SoundCloud era), the underground show (`Venue`, `look="club"`,
  strobes on beats), the merch line, a city at night (`look="night"`), an Atlas map insert for hometowns (only places
  in research.md).
- Devices: `TitleCard` (Grenze Gotisch blackletter, chapter titles only), `YearStamp`, `AliasStack`, `TrackCard`
  (generic upload card with a seeded original cover and a play counter), fx2d `Counter` / `Tag` / `Stamp`.
- Real artists (bio / scene): `UG_CAST.<artist>.<era>` from the look sheet, with a name label the first time they
  appear. Scenario characters: `SCENE_CAST.rapper` and variants (colours, hair, outfit per character), never a real
  artist's signature look.
- Text on screen in lowercase (the scene's case); blackletter only on title cards; captions `boxed`.

## Voice and audio
- Narrator: `en-US-BrianMultilingualNeural` (Edge; casual, sincere), ~188 wpm; a different voice from the house
  explainer voice (Andrew) so the channels never sound alike. An ElevenLabs take if a connector is attached.
- Music: `rage` (default; hype rise stories), `plugg` (nostalgic origins), `jerk` (NYC / UK bounce). Original beds
  only: never a real song, beat, sample, lyric or soundalike (the channel cannot use the artists' music).
- Scenarios may voice characters (`speaker` + `voice.cast`); bios never voice the real artist.

## pileGo! in this channel
The product beat belongs to the fans or the narrator, never the artist: the merch from that era sitting in a fan's
pile, a fit from the show, the tour tee that is now worth something to insiders (prices only from research rows).
Patterns: punchline (the fan's pile meets the app) or a self-aware ad beat by the narrator. One spoken "pileGo!",
after ~70 %. lint fails a plug beat that names the episode's real subject.

## Series mechanics
Eras and scenes as seasons ("UG files", "how a sound was born"); number episodes in `series.episode`; end on a
question fans will argue about (eras, best tape, first show). Vary artists, scenes and kinds between episodes.

## Compliance (before every post)
The checklist in `niche/story-formats.md` (own-brand disclosure, AI-voice label on Instagram, the brand connection
obvious in handle / bio / caption, no real person endorsing, no artist music, no logos), plus: `research.md` complete
with two sources per fact, and the critic's real-people checks passed.

## Common mistakes
- A bio artist who does not match the look sheet (wrong hair, the wrong era's fit, a generic stand-in under a real
  name); a scenario character that copies a real artist's look; the artist in a plug shot; voicing them; inventing a
  quote.
- An unsourced date, number or "first"; repeating a rumour; mocking the artist or their fans.
- The plug touching the artist or appearing before 70 %; using their music or a soundalike.
- Dated slang or the wrong subgenre name (the map in `niche/ug-rap.md` is the reference).
