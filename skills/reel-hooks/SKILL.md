---
name: reel-hooks
description: Hook step for a Nomen Studio short. Generates at least 12 candidate hooks across at least 5 families from the 106-template hook library, writes each as an aligned frame-0 visual + 3-5 word text hook + spoken line (+ first sound), scores every one on the 100-point rubric with penalties, fact-checks it against research.md, picks the opener (gate: score >= 80) and writes script.json `hooks` plus 3 `hookVariants` (the main opening and 2 visual A/B alternates of the same spoken hook). Use when asked to write, brainstorm, score, rank, fix or A/B test a hook, an opening line, a cold open, the first 3 seconds, a text hook or hook variants for a reel / short / TikTok / animated video, and as step 3 of the `reel` skill.
---

# /reel-hooks: twelve hooks in, one opener and two visual variants out

A hook is four aligned layers: the frame-0 picture, a 3-5 word text hook, the spoken line and the first sound. The eye
reads before the ear, so the picture comes first. Score criterion by criterion, never a total by feel.

Studio: `C:\Users\bhara\nomen-studio` (or `$NOMEN_STUDIO`). Run every command from there.

## Inputs
- `videos/<slug>/research.md` (fact rows and the spine: hook number, twist, drawable details) and `brief.md` (the
  outliers' hook mechanics).
- `skills/reel/references/hooks.md`: §0 rules, §1 library (families A-Z and AP, every template with a frame-0 visual
  and a text hook), §1.9 measured real openers, §2.1 protocol, §2.2 rubric and penalties, §2.3 first-3-seconds rules.
- `skills/reel/references/modes/<mode>.md` "Hook templates". Full evidence: `docs/research/C-hooks-retention.md` §1-3;
  the variant test protocol: §7.2 (excerpt in `skills/reel/references/posting.md`).

## Procedure
1. **Key visual.** Name the single most surprising thing this style's kit can show for the topic: an object, an
   action, a number made physical, a transformation. No key visual means rework the topic, not the words.
2. **Payoff line first.** Write the script's last line now; every hook must be paid off by it.
3. **Generate >= 12 candidates across >= 5 families.** A family is a letter in hooks.md §1 (two templates of one
   letter are one family). Include one D (in-medias-res) or Q (what-if), one A or O (curiosity / mystery), one C
   (contrarian), one B (number) and one wildcard, plus one from the mode file's templates and one built on the best
   outlier's mechanic from `brief.md` (the mechanic, never its words).
4. **Write each as a triplet:** `frame0` (what is on screen at t = 0, already moving), `text` (3-5 words that mirror
   the line; not the caption), `spoken` (sentence 1 <= 12 words with the topic noun in the first 5; staccato; shape:
   context lean, then a "but" interjection, then the snapback), optional `audio` (an impact or whoosh on frames 0-3).
5. **Score** each on hooks.md §2.2: contrast 20, topic clarity 15, visual + alignment 15, specificity 10, stakes 10,
   speed 10, payoff integrity 10, audience 5, novelty 5. Novelty = a family the channel has not opened with in its
   last 3 videos:
   ```bash
   grep -h '"chosen": true' videos/*/script.json
   ```
   Then subtract the penalties: -15 greeting, brand, "So,", "In this video" or a title card; -10 a claim that is not
   in research.md; -8 topic or key visual after 1.5 s; -5 context only in the back half of sentence 1; -5 jargon or
   an unknown proper noun in the first 5 words with no visual anchor; -5 a yes/no question whose honest answer is
   "no"; -5 needs sound to be understood (mute test); -5 a superlative the body cannot prove; -3 a "This is..." or
   "I'm..." opener; -3 a spoken hook over 14 words.
6. **Fact-check** every claim word against research.md: a hook says only what a row says, at the row's strength, and
   never promises more than the body delivers.
7. **Decide.** The top total opens the video if it scores **>= 80** (the house gate; hooks.md's research floor is 75).
   Best 65-79: rework the key visual or the contrast and rescore. Best < 65: go back to the topic or the key visual.
   Ties: the stronger key visual, then fewer words, then the family used least recently.
8. **First-3-seconds check** of the winner (hooks.md §2.3): the subject is on screen and moving at frame 0 (no title
   card, fade or logo); narration starts at 0.0-0.2 s; about 9 words by 3 s (check.mjs warns under 7); first line
   <= 12 words (check.mjs warns over 16); the text hook is on screen from frame 0 in the top band (y ~290-620, clear
   of the caption band y 1100-1350); a first value hit by ~4 s; mute test: a stranger names the topic from 0-5 s with
   the sound off.

## Visual hook variants
`node scripts/render.mjs <slug> --variants` re-renders only the opening (the frames before shot 2's start + 8) once
per `hookVariants` entry, passing `variant` = 0, 1, 2 to the first shot's scene, and reuses the body. A variant
therefore changes the PICTURE of the first shot only: the spoken hook, its timing and everything after that frame stay
identical.
- Write exactly 3: `v1` = the main video's opening (variant 0, `<slug>.mp4`); `v2` and `v3` = the alternates
  (`<slug>.hook2.mp4`, `<slug>.hook3.mp4`).
- Vary one axis each, all obeying the frame-0 rules and keeping the same text hook: framing (close-up, wide,
  inside-out POV), the opening move (tilt-up, pull-back reveal, dive), the first object (the hero, the key prop, the
  number). For problem-solution, product-placement timing is also an axis.
- Each variant must read as a still: frame 0 is also the thumbnail on several surfaces.
- A different spoken hook needs its own voice and timeline, which `--variants` cannot do. Keep the runners-up in
  `hooks` for such a test.

## Write it
Exact shape used by every video in `videos/` (e.g. `videos/noise-cancelling/script.json`):
```json
"hooks": [
  { "text": "<chosen spoken hook>", "family": "C1 contrarian", "score": 88, "chosen": true },
  { "text": "<runner-up>", "family": "B1 shock-number", "score": 84 },
  { "text": "<third, another family>", "family": "D2 in-medias-res", "score": 81 }
],
"hookVariants": [
  { "id": "v1", "visual": "<frame 0, opening move and text hook of the main video>" },
  { "id": "v2", "visual": "<alternate 1>" },
  { "id": "v3", "visual": "<alternate 2>" }
]
```
- `hooks`: best first, at least the top 3 from 3 different families, exactly one `"chosen": true`. `family` = the
  hooks.md code plus a short name (older videos used free names such as `paradox-as-fact`; codes make the family
  spread checkable).
- The chosen `text` becomes beat `b01`'s `text` (star its keyword there); its frame 0 and text hook go into
  `b01.visual` and `v1`.
- Append the whole scored table to `brief.md` under `## Hooks` (family, spoken, text hook, frame 0, the nine scores,
  penalties, total) so the choice can be audited later.

## Output to the caller
The opener (score, family, text hook), the two runners-up, and the three variants in one line each.
