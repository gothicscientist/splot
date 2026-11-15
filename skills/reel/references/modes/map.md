<!-- Mode: map. Research compiled 2026-11-13/14 for Nomen Studio (formats study: 104 channels, ~3,800 Shorts, 97 transcribed hits). Numbers are measured or cited; see the sources inside. -->

## MODE 7 — MAP EXPLAINED (geography, borders, countries)

**Purpose.** Make a map oddity make sense through 3–5 historical moves: a weird border, a long or thin country, a divided island, an exclave, a land purchase, a region name, a language split. The map is the stage, so this is the cheapest mode to render in code (SVG/GeoJSON) and highly re-usable.

**Input.** A place plus its oddity ("Why is Chile so long?", "Why Cyprus is divided", "Why Bolivia owns this tiny triangle").

**Research steps:**

1. Wikipedia, CIA World Factbook, and treaty or official sources. Get real coordinates/GeoJSON for borders from Natural Earth (public domain).
2. Causal chain: 3–5 dated events, each one change in map state (annex, treaty, war, purchase, partition).
3. One surprising number (e.g. "$15 million… 4 cents an acre").
4. Neutrality pass for live conflicts: give sourced facts and both names for disputed places. Avoid current-war takes; Instagram down-ranks political content.

**Script template, 45 s (~145 words at ~190 wpm):**

| t (s) | Beat | Script job | On screen |
|---|---|---|---|
| 0–3 | HOOK | "This is [place]. But did you know [oddity]?" | Map zoom from globe to the place; oddity highlighted (pulsing outline) |
| 3–10 | SHOW THE ODDITY | Make it concrete (size, shape, who owns what) | Colour fills, labels, inset photo circle, scale bar |
| 10–32 | CAUSAL CHAIN | 3 moves at about 7 s each ("1802…", "then yellow fever…", "so Napoleon needed money…") | Each move = a border redraw, troop/ship arrows and a year stamp; countryball or stick-figure leaders react |
| 32–40 | TWIST | The irony ("they were only authorised to buy one city") | Slam zoom; "?!" reaction; a number counter |
| 40–45 | SUMMARY KICKER | "And that's how [place] ended up [state]…" + a number | Final map state; loop to the opening framing |

**75–100 s extension:** 5 moves plus the present-day consequence (identity, culture, disputes). GeoGlobeTales routinely runs 85–103 s and still gets 5–18.6M, because each map change is a mini-reveal.

**Hook templates:**

1. "This is [country]. But did you know [weird fact]?" (GeoGlobeTales, Gibraltar 6.7M; geoalldayog, Asia regions 2.5M)
2. "[Country] offered to buy just [small thing], but somehow ended up buying [huge thing]." (Louisiana, 18.6M)
3. "[Place] has some really weird borders." (Historically, USA borders, 16.5M) / "Why does [country] own this tiny [shape]?" (geoalldayog, Bolivia triangle, 7.3M)

Also: "Have you ever wondered why [word / language quirk]?" — e.g. "…why the meat of cows… is called beef… and only chicken is still just chicken?" (9.5M).

**Best art styles.**

- Flat vector map (Historically) or satellite-style relief map (GeoGlobeTales)
- Countryballs as characters (KingCountryballAnimations median 7.25M; MrSpherical 441K)
- Stick-figure diplomats walking on a 3D globe

**Visual conventions.**

- The map never disappears.
- Every claim is a map-state change: fill, border, arrow or pin.
- Year stamp, inset photo circles, red arrow pointers.
- Ranking variant ("Widest Countries", 24M): a sorted bar of country silhouettes.

**Voice and audio.**

- Friendly, curious explainer at 185–195 wpm.
- Light orchestral/world music; a whoosh for each zoom.

**Ending.** "And that's how/why…" summary plus a kicker number or irony ("…stand in America, look at Russia, and see tomorrow.").

**Common mistakes.**

- Static maps.
- Too many place names.
- Political editorialising.
- Wrong borders: always use real data.


---

## Evidence and real winners for this mode

## 2.7 Maps and geography

**Why it wins.** A map gives instant visual context. Each map change is a reveal. "This is X. But did you know…" is a tidy curiosity gap, the topic is evergreen, and it works globally.

**Accounts and videos.**

| Channel / video | Views | Notes |
|---|---|---|
| @GeoGlobeTales | median L30 3.3M; 28/30 ≥1M | |
| — "27 Years to Walk Around the World" | 61M | |
| — "Spain's Strangest Borders" | 47M | |
| — "Why Chile Is So Long & So Thin" | 34M | |
| — "How America Bought Louisiana" | 18.6M | 101 s, 189 wpm |
| — "How a French Invasion Changed Meat Names" | 9.5M | |
| — "Why Is Gibraltar British" | 6.7M | 101 s |
| — "Why Cyprus Is Divided" | 5.0M | 85 s |
| @geoalldayog | median 283K | |
| — "Why Bolivia Owns This Tiny Triangle" | 7.3M | |
| @KingCountryballAnimations "Widest Countries" | 24M | 10 s |
| — "European Countries' Size Compared to Others" | 12M | |
| @HeyHistorically "The WEIRD borders of the USA" | 16.5M | |
| @MapNerdYT "The Coastline Paradox" | 13M | Channel median only 14K |

The search median for "geography explained" (45K) shows that generic geography is weak. The "why is this place weird" angle carries it.

**Verbatim hooks:**

1. "The United States sent two diplomats to France to meet with Napoleon and offered to buy just one city, but somehow ended up buying the entire Louisiana territory for almost the same price."
2. "This is Spain. But did you know that a tiny piece of it belongs to Britain?"
3. "Cyprus, formerly a single country, part of the European Union, but for more than 50 years it has effectively been split in two."
4. "Have you ever wondered why the meat of cows, pigs, sheep, and deer is called beef, pork, mutton, and venison? And only chicken is still just chicken?"
5. "This is Asia, but do you know the difference between South Asia and Southeast Asia?"
6. "America has some really weird borders. Take the border with Canada."

**Length and pace.** 63–103 s at 177–193 wpm. This is the one format where 90–100 s routinely works.

**Ending.** "And that's how Cyprus ended up divided between four different powers." / "…for just 4 cents an acre."

**Mistakes.** Static maps; political takes; fake borders.

