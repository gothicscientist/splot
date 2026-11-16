---
name: reel-research
description: Research step for a Nomen Studio short. Writes videos/<slug>/research.md (every fact exactly as it will be narrated, two independent sources each, every number recomputed, conflicting sources flagged and kept out of the script, allegations hedged) and finds 2-3 outlier reference videos in the niche (views far above their own channel's median), measuring their hook mechanic, beat structure, pacing and visual device into brief.md, so the video copies the FORMAT and never the words, footage or characters. Use when asked to research, fact-check or source a topic for a reel / short / TikTok / animated video, to verify a number or claim in a script, to find viral, outlier or reference videos for a topic or niche, and as step 2 of the `reel` skill.
---

# /reel-research: facts you can defend, formats that already won

Two outputs before any script exists: a sourced fact table and 2-3 measured outlier references. A sentence with no row
in `research.md` does not go into the script.

Studio: `C:\Users\bhara\nomen-studio` (or `$NOMEN_STUDIO`). Run every command from there.

## Inputs
- Slug, topic, mode and style (`reel` steps 0-1; `node scripts/new-video.mjs` has scaffolded `videos/<slug>/`).
- `skills/reel/references/modes/<mode>.md`: its **Research steps** (the mode's musts: case-file timeline marked
  confirmed / alleged / disputed, what-if speculation flags, history myth check, lore canon vs theory and IP safety,
  map neutrality and Natural Earth borders, problem-solution user words and honest feature claims) and its **Evidence
  and real winners** table (outliers measured in Nov 2026: the head start for part B).
- Background when unsure: `docs/research/A-x-playbooks.md` §2.B (research and fact-check musts) and §3-4;
  `docs/research/B-formats-modes.md` §1 (research steps per mode), §2 (evidence per format), §4.2-4.3 (channel
  leaderboard, pacing benchmarks), §4.6 (how outliers were measured); index in `docs/research/README.md`.

## A. Facts -> `videos/<slug>/research.md`
1. Collect 8-12 facts for a 45-62 s video, more than the script needs: who, what, where, when, how many, plus the
   mechanism or causal chain the mode's beat sheet asks for.
2. **Two independent sources per fact.** Two pages that copy each other count as one. Trust order: primary (court
   records, official and agency pages, treaty text, manufacturer docs, peer-reviewed papers, museum and university
   pages) > reference works and major outlets (Britannica, Smithsonian, Scientific American) > Wikipedia (one source;
   follow its citations for the second). Never cite another Short, a content farm or an AI summary. Only one good
   source? Attribute it in the line ("according to the FBI") or cut it.
3. Write each fact as it will be SAID, in the conservative wording, not as the source phrases it.
4. **Numbers:** copy the exact figure and unit; recompute every derived number (ratio, percentage, unit conversion,
   year span) and show the arithmetic in the row ("12.262 / 6,371 km = 0.19 %, said as 0.2 percent"). Rounding in
   speech must not change the claim ("about 0.2 percent" for 0.19 % is fine, "nearly half" for 38 % is not). No
   unsourced inflation or currency conversion. The exact figure goes on screen, the rounded one in speech.
5. **Conflicts:** when sources disagree (5 vs 6 dealers, a 1992 vs 1995 end date), put both figures and their sources
   in the row, then keep the detail out of the script, or use the conservative figure with "about", or attribute it.
   Write `disputed` in the `checked` column and say which choice the script makes. A popular story with no primary
   record gets "might be" wording (`videos/eiffel-tower-con/research.md` row 12).
6. Write `alleged` in the `checked` column where the script must hedge ("allegedly", "according to"). Safety pass:
   no private individuals or minors by name, no gore, no weapon / drug / dangerous how-to detail, neutral wording for
   live conflicts, canon vs fan theory for lore, no invented product claims, no real person's likeness (scenes use
   stand-ins).
7. While reading, collect the **spine** for the next steps: the hook number (the single most absurd figure), the twist
   (the small mistake, the irony, the counter-intuitive turn) and one drawable detail per beat (object, place, screen).
8. Write the file in the house format (finished examples: `videos/eiffel-tower-con/research.md`,
   `videos/chile-shape/research.md`, `videos/deepest-hole/research.md`):

```markdown
# Research: <title>

Every line of the script maps to a row here. Where sources disagree, the script uses the conservative version.
Checked <YYYY-MM-DD>.

| # | fact (as said in the video) | source | checked |
|---|---|---|---|
| 1 | <the fact as narrated> | <url> ; <url> | yes (2 sources) |
| 2 | <derived number> | arithmetic on rows 1 and 4 | yes |
| 3 | <detail the sources disagree on> | <url> (says X) ; <url> (says Y) | disputed: the script leaves it out |

Not used (true but cut for length): ...
Spine: hook number ... | twist ... | drawable details ...
```
Map videos add a `Map honesty:` note (projection, what is to scale, border data source).

**Gate:** no row without its sources, no number that was not recomputed, and once the script exists every factual
clause of every beat maps to a row (add the row or cut the clause).

## B. Outliers -> `videos/<slug>/brief.md`
An outlier is a Short with views far above its own channel's median. House rule of thumb (a heuristic, not a measured
threshold): at least 5x the median of the channel's latest 30 Shorts ("L30") and 1M+ views; a channel whose L30 median
is itself 1M+ is a proven format. Prefer uploads from the last ~18 months. Measure on YouTube: TikTok and Instagram
show no view counts to a logged-out client (B §4.6).

1. Start from the mode file's Evidence table, then search the topic and its neighbours with 3-5 phrasings plus format
   words ("how did", "what if", "why is", "explained", "the man who"). Keep entries of 180 s or less:
   ```bash
   mkdir -p out/research/<slug>        # out/ is git-ignored
   yt-dlp "ytsearch30:<query>" --flat-playlist --print "%(view_count)s|%(duration)s|%(channel)s|%(title)s|%(url)s" >> out/research/<slug>/search.txt
   yt-dlp "https://www.youtube.com/@<channel>/shorts" --flat-playlist --playlist-end 30 --print "%(view_count)s" > out/research/<slug>/l30-<channel>.txt
   PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe -c "import statistics as s,sys; v=[int(x) for x in open(sys.argv[1]) if x.strip().isdigit()]; print(len(v), s.median(v))" out/research/<slug>/l30-<channel>.txt
   ```
   Channel-tab counts are YouTube's rounded figures; search also returns long videos, hence the duration filter.
2. Pick 2-3: one in the same mode and topic area, one in the same mode on another topic and, for the visual device,
   one in a similar style.
3. Measure each without downloading the video (metadata + auto-captions only):
   ```bash
   yt-dlp --skip-download --write-auto-subs --sub-langs en --sub-format vtt --write-info-json -o "out/research/<slug>/%(id)s.%(ext)s" "<url>"
   ```
   No captions? Retry with `--extractor-args "youtube:player_client=web_embedded"` (what the formats study used).
   From the VTT word timings (method of `docs/research/C-hooks-retention.md` §9): first-word onset, words spoken by
   3 s, WPM = words / (last onset - first onset + 0.35 s), length. Then classify the hook family (letter code from
   `skills/reel/references/hooks.md` §1), map the beats onto the mode's beat sheet, and note re-hook times, the twist
   position (% of runtime) and the ending type (loop, irony punch, takeaway). Visual device and cut rate need
   pictures: run the `watch` skill on 1-2 references at most (it downloads the video; keep its output in `out/`).
4. **Premise check:** if the same premise already has a big recent hit, change the angle (another hook number, twist
   or point of view) and say so in the brief.
5. Fill `brief.md`: `audience:`, `the one thing the viewer should feel/learn:`, and one block per reference under the
   reference line:
   ```markdown
     1. @<channel> "<title>" <url>: <views> views vs L30 median <median> (<n>x); <length> s, <wpm> wpm, <n> words by 3 s
        hook: <family code + name> (<structure with placeholders, e.g. subject + vivid verb + year, no name>)
        beats: <beat list with times; twist at <n> %; ending type> | pacing: <new picture every ~n s; cuts>
        device: <the signature visual device> | copy: <format + hook mechanic>. Not copied: words, characters, footage, title.
   ```

## Hard rules
- Copy the FORMAT and the HOOK MECHANIC only. Transcripts, titles, characters, art and footage never enter the repo;
  name a pattern in a few words at most. Caption files and downloads stay in `out/research/`.
- Facts come from the sources behind a video, never from the video.
- Never invent a view count, a median or a source. If a number could not be fetched, write `n/a` and why.

## Output to the caller
`research.md` and `brief.md` written, plus three lines: facts (count; disputed ones and how the script avoids them),
the spine (hook number, twist), the outliers (multiple of median, hook family, the one mechanic to copy).
