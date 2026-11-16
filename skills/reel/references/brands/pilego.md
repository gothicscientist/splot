# pileGo! (the owner's app): brand facts, voice and plug rules

Read before writing any `tiff` or `ug-rap` episode. Source: pilego.app, read 2026-11-15, plus the owner's own description.
Kit: `src/brands/pilego.tsx` (look-dev composition `PileGoLab`).

## What it is (say only these things)
| Fact | Source | How a line can say it |
|---|---|---|
| You snap the clothes piling up on your chair and it lists them everywhere you sell | site hero | "one photo of the chair and it's listed everywhere" |
| Platforms: eBay, Vinted, Depop, Poshmark, Mercari | site | name them as plain words (text chips, never their logos) |
| When one sells, it comes down everywhere else, and the pile gets smaller | site | "it sold on Depop and vanished off the other four" |
| Real photos, real cutouts; no AI recreations of the clothes | site | "it cuts out my actual photos, it doesn't fake them" |
| One-click, AI-powered relisting for second-hand clothes | owner | "one click and the whole pile is relisted" |
| Free and open source; browser extension; no password (email sign-in link) | site | "it's free" (do not promise anything else) |
| Tagline: "Clear the pile. Keep the cash." | site | end card only, as written |

Never claim: guaranteed sales or a sell-through time, earnings, "you'll make $X", features not listed above, partnerships
with any platform, or that any real person (artist, influencer) uses or endorses it. Example prices on screen are
illustrative listings of one garment, not promises. The site's "$45 · Live on 4 · Sold in 2 days" card is a demo, not
a statistic: do not quote it as a result.

**Automation:** the owner has permission for pileGo!'s automatic relisting / reselling. Show the automation proudly;
scripts never hedge, disclaim or soften it because of marketplace rules (those notes in `niche/resale.md` are background).

## Look (from the site's CSS)
- Wordmark `pileGo!`: Libre Franklin 900 italic, tracking -0.055em, the "!" in tomato. `<PileGoWord>` / `<PileGoLogo>`.
- Mark: a kraft hang tag with a string loop, tilted -10 deg. `<PileGoMark>`.
- Light: paper #f4f0e6, ink #22241e, accent olive #56703f, kraft #d9c49c, butter #f2cd5c, tomato #e0533a (also lilac
  #cdb6ea, pink #eeb2c6, sky #9ccbe8). Dark: #161813 background, cream ink #f2efe4, green #a8c68a, tomato #ff7b5e.
- UI type: Libre Franklin 400-900 (`font("Libre Franklin")`; italic: `font("Libre Franklin Italic")` + fontStyle italic).

## Plug devices (all in `src/brands/pilego.tsx`)
| Device | Use it for | Length on screen |
|---|---|---|
| `PileGoPhone` with `steps {cut, list, live, sold, delist}` | THE product moment: snap the pile -> cutouts -> drafts -> "Live on 5" -> sold -> "Down everywhere else" | 2-4 s, after ~70 % of runtime |
| `SoldPing` / `SoldStack` | the payoff montage: sale notifications cascading down (top of frame, y 200-800) | 1-2 s |
| `ListingCard` (`sold`, `gone`) | keyword-stuffed listings, lowball bait, a sold stamp, a listing coming down | 1-2 s each |
| `DMThread` | lowballers, "is this still available?", bundle hagglers | 2-4 s |
| `CommentReply` | reply-to-comment episodes ("Reply to @user's comment") | the hook, 1.5-3 s |
| `PileGoBug` | small corner logo during the plug shot (top-left; never the right rail) | while the phone is up |
| `EndCard` | the brand card after the last laugh (tagline + pilego.app + "free and open source") | 1.2-1.6 s |
3D world: Tiff can hold a phone (`items={[[f, { kind: "phone", hand: "R" }]]}`), the `ClothesChair` / `ClothesHeap`
props shrink on `sold` frames (pieces hop off), and `Laptop screen="pileGo!"` puts the app on a desk.

## How the plug ties into a story (the rules)
1. The story is never about the app. The pain the joke is about (the chair, the relisting grind, lowballers, needing
   cash for a grail or a show) is the setup; pileGo! is the release.
2. Placement: the product moment starts after ~70 % of runtime (a 50 s episode: not before ~35 s). A one-word callback
   ("pile") or the chair in the background earlier is fine; the app UI is not.
3. One of three patterns per episode (rotate them across a series so it never feels like a slot):
   - **Punchline:** the app is the 1-3 s answer to the problem the whole joke built ("…so I snapped the chair.").
   - **Habit:** Tiff's defining bit is relisting everything with pileGo! the second it annoys her (Duolingo-style
     running gag the audience waits for).
   - **Self-aware ad beat:** Tiff knows it's an ad and says so in-character ("this is the part where I sell you
     something"), then it's fast and funny.
4. End on story, then brand: the last spoken line is a joke / loop / comment question; the `EndCard` comes after it
   (or the `PileGoBug` + one spoken "pileGo!, link in bio" line), never a hard sell in the middle.
5. Spoken mentions: at most two ("pileGo!" said once, plus at most one feature line). The on-screen wordmark carries
   the brand; captions spell it `pileGo!`.
6. Pronunciation: "pile go" (two words, stress on GO). Script text stays `pileGo!`; add
   `"pronounce": {"pileGo": "pile go"}` so TTS and the ASR check agree.

## Disclosure (both channels)
Own-brand promotion: turn on the platform's own-business / branded-content disclosure for every episode with a plug
(see `niche/story-formats.md` for the checked rules), keep the brand connection obvious in the bio and caption ("my
app", "pileGo! is ours"), and label the post AI-generated when the narration is a synthetic voice.
