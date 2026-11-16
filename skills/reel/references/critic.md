<!-- The critic rubric: 7 scored areas, the ban list, the traps list and the output format. Sources: docs/research/A-x-playbooks.md §0 item 7, §1 #1 (look-match loop), §2 L, §3.7-3.8, §4. -->

# Critic rubric

A render is shown to the owner only when **every area scores 8 or more** and the P0 list is empty. The builder never
scores its own work (self-scores run about 2 points high): a fresh agent gets the sheets and this file, nothing else
from the build conversation.

## What the critic looks at
1. The stills sheet(s): `out/stills/<comp>/sheet_*.jpg` (one frame per key moment) or the final 1-fps QA sheets
   `videos/<slug>/qa/sheet_*.jpg`. Frame numbers / timestamps are burned in.
2. `videos/<slug>/script.json` (the words and each beat's `visual` line) and `videos/<slug>/qa/report.md` if it exists.
3. Single frames at full size when a sheet cell is too small to judge (`out/stills/<comp>/f*.jpg`).

## Two tests before scoring
- **Stranger test.** For every sheet cell, name each object you can see in one second at phone size. Anything you
  cannot name, or name wrongly, is a readability defect (P0 if it is the subject of the line).
- **Pictures-only test.** Cover the captions. Does the story still read from the pictures in order? A beat whose
  picture does not literally show its line is a defect.

## The 7 areas (score each 0-10)
| # | Area | 10 looks like | Typical defects |
|---|---|---|---|
| 1 | **Hook (0-3 s)** | Frame 0 already shows the subject in motion; the paradox is readable without sound; one 3-5 word text hook; no logo, no intro | Empty/flat first frame, subject small, text hook late or long |
| 2 | **Story clarity** | Every picture literally illustrates its line; one idea per shot; the twist and payoff are visible, not only spoken | Generic picture under a specific line, two ideas fighting, payoff told but not shown |
| 3 | **Composition** | Hero fills >= 40 % of the frame; one hero move per moment; nothing important under the caption band (y 1100-1350) or the right rail (x > 900, y > 840); nothing cut by the frame edge unless it is foreground framing | Centred-everything, hero tiny, faces under captions, props clipped, empty thirds |
| 4 | **Characters and props** | On-model in every frame, expressive poses pushed 10-30 %, hands hold what they hold, feet on the ground, eyes looking at the action | Floating/sunk feet, limbs through props, same pose for 3+ s, dead faces, scale jumps between shots |
| 5 | **Light, colour and depth** | Light from a visible source; the hero is the brightest, sharpest thing; no crushed blacks or blown whites; clear fore/mid/background; palette of the style bible | Flat lighting, muddy darks, hero darker than the set, depth planes merging, off-palette colours |
| 6 | **Motion and pacing** (judge from consecutive cells) | The picture changes every 1-2.5 s; holds creep; transitions are caused by something on screen; 3-5 transition kinds; no dead stretch | Consecutive near-identical cells, same entrance every time, a move with no reason |
| 7 | **Text and captions** | Captions inside the safe band, one keyword boxed per group, never overlapping a face or on-screen text; all on-screen text spelled right, >= 28 px, readable in 1 s; numbers exact as in the script | Caption on a face or on a sign, typo, text too small, two texts competing, wrong number |

Scoring guide: 10 = indistinguishable from a top outlier in the niche; 8 = shippable, only taste notes left;
6 = a viewer would notice; 4 = looks generated/sloppy; 2 = broken.

## Ban list (any hit is at least a P1; name it)
- Purple/blue gradient backgrounds; glow halos on everything; particles as decoration; navy space + bloom.
  Exemption: in **Glowvector** a dark field with haze and glow-lit subjects is the style's signature (see
  `styles/glowvector-bible.md`), and in **Atlas** a dark ocean/space field is the base map. Judge those by whether
  the subject leads (brightest, largest, sharpest), not by the background colour.
- Fade-and-slide-up on every element; the same ease everywhere; bounce on text or UI; titles that keep moving after
  they land; breathing/floating loops on text.
- Centred text on a flat background; three cards in a row; cream paper + serif + mono labels; a docked logo; an
  intro, outro or logo sting.
- A static hold of 4+ frames; a blank or near-blank frame; a first frame without the subject.
- Captions that restate on-screen text word for word in the same place; full stops in captions.
- Real brands, real people's likenesses, copyrighted characters, Mojang textures, the word "Minecraft" on screen.

## Story modes (`tiff`, `ug-rap`): exemptions and extra checks
Exemptions: **pileGo!** is the owner's own app, so its wordmark, tag mark and UI are expected on screen (from ~70 % of
the runtime on). Marketplace names as plain text (eBay, Vinted, Depop, Poshmark, Mercari) are fine; their logos are
not. A show / club set (`look="club"`) whose stage wash comes from visible truss lights and haze is a lit source, not
a decorative purple gradient: judge it by whether the characters lead.
Extra checks (each hit is a **P0**):
- **Tiff framing:** any shot whose subject is her body instead of her face and attitude (torso-centred frame, a low
  angle looking up, a slow move over the figure, a pose that reads as suggestive); her face under the caption band.
  She must also stay on model: silver-lavender hair, blue eyes, black choker, black tank, frayed jean shorts, black
  boots (unless the script changes her fit on purpose).
- **The plug:** app UI, logo or a spoken "pileGo!" before ~70 % of the runtime (a chair pile in the background is fine);
  the plug interrupting the story instead of paying it off; a hard CTA on screen; more than two spoken mentions.
- **Real people:** a real artist (or anyone real) shown, named or implied as using or endorsing pileGo! or anything;
  a stand-in drawn with a real artist's signature look (hair, tattoos, mask, outfit) in a `scenario` episode.
- **Trademarks:** a real brand's logo, monogram or signature graphic on any garment, sign or screen.
Niche lens (score it under **hook** and **story clarity**): read the "Cringe, poser tells and hard avoids" sections of
`skills/reel/references/niche/*.md`. Would someone from this scene clown the video in the comments: dated or misused
slang, a wrong fact about an artist, a poser tell, a joke that only works because the app shows up? The joke must land
with the plug cut out.

## Readability traps (check each style's list too)
- A figure on one rope reads as a hanging; a prop next to a hand reads as the hand; a foreground bush reads as a
  green ball; dark limbs vanish on dark sets; an invented flag reads as a real country's.
- Camera inside a wall or a character; a prop intersecting the floor; shadows missing under a standing character.
- A number on screen that differs from the spoken number, even by rounding.

## Output format (exactly this)
```
SCORES  hook N · story N · composition N · characters N · light N · motion N · text N
P0 (must fix before any render is shown)
1. t=<time or frame> · <shot id> · <what is wrong, concretely> -> <the change> · keep: <what must stay>
P1 (fix if any area is under 8)
…
P2 (taste)
…
VERDICT  PASS | FAIL (FAIL if any area < 8 or any P0)
```
Rules: every note names a frame/time and a shot; describe what you SEE, never guess at code; at most 12 notes,
most damaging first; if a busy shot is the problem, say which third of its motion to remove.

## The fix loop (builder side)
Fix P0s, then the P1s in areas under 8. Re-render only the changed shots' stills. Send the new sheet to a NEW critic
(not the same agent). Stop when the verdict is PASS, or after 4 rounds: then report the remaining notes honestly.
Every confirmed defect class goes into `references/failure-modes.md` so the next video does not repeat it.
