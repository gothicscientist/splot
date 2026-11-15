<!-- A/B hooks, post copy, hashtags, cadence. Research compiled 2026-11-13/14 for Nomen Studio (hooks study + X playbooks). Numbers are measured or cited; see the sources inside. -->

## 7. Hook A/B testing, post captions, hashtags, cadence

### 7.1 What the platforms actually offer (Nov 2026)
| Platform | Native tool | Details |
|---|---|---|
| **YouTube** | **Test & Compare**: titles, thumbnails, or both; up to 3 variants; winner = highest **watch time**; desktop Studio only; ≤2 weeks | **Not available for Shorts** (Shorts are uploads ≤3 min, square or vertical) [P] ([YouTube Help](https://support.google.com/youtube/answer/16391400?hl=en)). Title testing went global in Dec 2025 |
| **Instagram** | **Trial Reels** (launched Dec 10 2024): shown to **non-followers first**; optional auto-share to followers if it performs well (launch text said views within 72 h; later Help text says "soon after you publish"); scheduling added in 2026 | Mosseri: trial reels almost always get less reach, so **compare trials only with other trials** [P/C] ([Meta](https://about.fb.com/news/2024/12/trial-reels-try-content-non-followers-first-see-what-perfoms-best/)) |
| **Facebook** | Reels A/B test: up to **4 captions or thumbnails** (Nov 2023); winner auto-applied | Tests only text and thumbnail, not the video [P] ([Meta](https://about.fb.com/news/2023/11/helping-creators-test-content-and-earn-rewards/)) |
| **TikTok** | **No organic A/B tool.** Ads Manager **split test** (one variable, ~90% confidence) for paid/Spark Ads | A "don't show on profile" posting option was spotted in testing (Aug 2026), unconfirmed by TikTok. "Follower-first testing" claims are unverified as of Oct 2026 [V] |

### 7.2 Hook-variant protocol (what top operators do)
1. **Build 3 hook variants from different families** (§2.1), each changing the **visual + text + spoken + audio** of the first 2–3 s. The body, length and ending stay identical. Hook-only testing isolates the variable, as in UGC and ad practice: 5 hooks with everything else held constant, then roll the winner across formats [V].
2. **Instagram**: post variants as **Trial Reels** 24 h apart, at a similar time of day. Read at 24–72 h:
   - 3-s hold / skip rate
   - average watch time and % watched
   - **sends per reach**
   - likes per reach
   Auto-share or manually share the winner.
3. **TikTok**: there's no clean A/B. Either (a) test hook variants as Spark/Ads Manager split tests with a small budget, or (b) post sequentially on different days and compare against your rolling median.
   - Avoid deleting and reposting the same video.
   - Avoid near-duplicate uploads, which risk "unoriginal / duplicate" treatment.
4. **YouTube Shorts**: publish the **winner** from the TikTok/IG tests. Shorts can't be A/B tested natively.
   - Check **stayed to watch** (≥70% working bar [C/D: Galloway 2023]) and average % viewed against the channel's median.
   - A swap of title only doesn't change the in-feed hook.
5. **Decision rule:**
   - Pick a winner only if it beats the others by **≥15–20% relative** on the primary metric, with **≥1,000 views each**.
   - Otherwise call it inconclusive and rerun.
   - After 10–15 tests, update the family priors per niche (e.g., D/Q beat C for history); a bandit over families works.
6. **Primary metric by platform:**
   - Shorts: stayed-to-watch + APV
   - TikTok: average watch time + completion + 2-s/5-s retention (in TikTok Studio)
   - IG: watch time + sends per reach

### 7.3 Post copy, hashtags, titles
- **TikTok**:
  - The caption's first line is a **keyword-led search phrase**, mirroring the spoken hook. Add 3–5 specific hashtags (niche > generic).
  - TikTok uses captions, sounds and hashtags as video-information signals [P].
  - Put the core keyword in the on-screen text and say it in the first sentence.
- **Instagram**:
  - **≤5 hashtags** (cap announced Dec 18 2025, @creators/Mosseri) [P].
  - Hashtags help search and categorization, not reach.
  - The caption opens with the hook or keyword. Add a "send this to…" line only if it's natural, since sends drive non-follower reach.
- **YouTube Shorts**:
  - Title = the hook claim, keyword in the first ~40 characters (truncation in feed), optional single emoji at the end (Zack D pattern).
  - `#shorts` is not required. Use 1–3 hashtags. If a video has more than 60, YouTube ignores all of them [P].
  - A short description with sources.
- **AI disclosure**:
  - YouTube requires disclosure only for **realistic** synthetic content. Clearly animated or unrealistic content is exempt [P] ([YouTube blog](https://blog.youtube/news-and-events/disclosing-ai-generated-content/)).
  - TikTok requires AIGC labels for realistic AI images, audio and video. Use the toggle when a synthetic voice or visual could pass as real.
  - Never clone real voices or likenesses.

### 7.4 Posting cadence (2025–2026 data)
- **TikTok**:
  - Buffer (Oct 2025; 11.4M posts, 150k+ accounts): accounts posting 2–5×/week got about +17% views per post vs 1×/week, and 11+/week got about +34%. Median views were roughly flat; the gain comes from more shots at outliers [D].
  - Creafico (Oct 2026; 24k videos, 2,769 creators): median views per video fall with cadence, from 5,657 (<2/week) to 3,222 (5–7/week) to 348 (3+/day). Yet expected 5× outliers per month rise from 0.19 to 2.09 to 9.21 [D].
  - **House: 5–7/week (1/day)**, scaling to 2/day only if quality and originality hold.
- **Instagram**: Buffer (2M+ posts, 100k+ accounts): **3–5 posts/week** is the sweet spot, with diminishing returns after that [D]. Add Trial Reels for tests.
- **YouTube Shorts**:
  - No Shorts-specific cadence study found.
  - Shorts decay within 7–14 days unless they're top 0.1% (Kallaway, Dec 2024) [C].
  - Reports since Sep–Dec 2025 say Shorts favor newer uploads (one strategist's data; YouTube unconfirmed) [V].
  - **House: 3–7/week.**
- **Consistency**: Buffer found accounts posting in 20+ of 26 weeks earned about 450% more engagement per post than those posting in ≤4 weeks [D].
- **Originality guardrails**:
  - YouTube's "inauthentic content" (Jul 15 2025) covers mass-produced or repetitive output.
  - YouTube's Shorts originality push (Oct 1 2026).
  - Instagram demotes primarily-unoriginal accounts.
  - **Every upload needs a distinct idea, script and visual set.** Hook variants belong in tests, not as duplicate public posts.
- **Times**: post when your audience is active (analytics). Universal "best times" are weak evidence [F].

## 8. Folklore vs evidence
| Claim | Verdict |
|---|---|
| "You have 3 seconds" | **Partly supported.** TikTok: 90% of ad-recall impact lands in the first 6 s [P]. Shorts' stayed-to-watch is decided in the first seconds [P]. Kallaway's ~4-s value timer [C]. The exact 3 s figure is a heuristic |
| "8-second attention span (goldfish)" | **Folklore** [F]; widely debunked |
| "Viewed vs swiped ≥70% needed" | **Creator benchmark** [C/D]: Galloway 2023, n=5,400 (<60% rarely performed). No official threshold [P] |
| "Pattern interrupt every 3 s" | **Heuristic** [V]. Visual change every ~1–1.5 s is what narrated viral Shorts imply [M] |
| "160–180 WPM is optimal" | **No platform study.** Viral narrated Shorts run at a median 177 WPM [M]. Comprehension holds across ~130–190 WPM in lab studies |
| "Loops / >100% retention make videos viral" | Loops count as replays (views since Mar 31 2025) [P]. "Must exceed 110%" claims are unverified [F] |
| "Sends are worth 3–5× likes" | **Unverified** [F]. Mosseri: sends matter more for non-follower reach [P] |
| "Hashtags boost reach" | **No** on IG (Mosseri) [P]. TikTok uses them as content info [P] |
| "Trending sound = +47% reach" | **Vendor claim** [F] |
| "New Shorts get a 200-viewer seed test" | **Unverified** [F] |
| "Captions +12% view time / +80% completion" | **Dated** (Facebook 2016; Verizon/Publicis 2019) [D-old] |
| "Longer TikToks get more views" | **Correlational** [D]: Socialinsider 2026 and Creafico 2026 favor 60–180 s. Confounded by account maturity; test it |
| "11–20 s Shorts get the most views" | **One vendor dataset** [D/V]: quso 108k. Contradicts top-channel practice (median 40 s) |


---

### 3.11 Hook testing and posting
| Rule | Value | Source |
|---|---|---|
| Hooks per message | 3-5; only the first 3 s change | aesty / Nadia |
| Read window | 48-72 h | aesty |
| Kill rule | Over 30% drop in the first 3 s | aesty |
| Keep rule | Top 20% on 2 of 3 (watch-through, saves+shares, profile visits) | aesty |
| Throttle signal | At low views, engagement over about 1% = throttled; under 1% = content failing | Nadia |
| Duplicates | 5 identical posts in a row got throttled; never mirror a post across your own accounts on one platform | Nadia |
| Warm-up | 7-14 days of normal use before automating | Larry |
| Hashtags | At most 5 | Larry |
| Audio | Add trending audio manually (claimed about 10x reach); the API can't | Larry |
| Product placement | End-card solution (Peef) vs within 12 s (CalAI via Sabrina) vs the first 3 s (TikTok research cited by Aurli: 63% of top-CTR ads) | conflicting, so test it |

