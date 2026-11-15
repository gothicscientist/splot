<!-- Hook library + scoring rubric + first-3-seconds rules. Research compiled 2026-11-13/14 for Nomen Studio (hooks study: 70 measured Shorts, 11 channels). Numbers are measured or cited; see the sources inside. -->

## 0. TL;DR — the 25 rules the agent follows
1. **Key visual first**, then the hook family with the biggest contrast, then the words. Hook = visual + text + spoken + audio, all saying the same thing. Kallaway ranks visual > text > spoken [C].
2. **Frame 0 is already moving and shows the subject.** No logo, fade, title card or greeting. Frame 0 also serves as the thumbnail.
3. **Narration starts at 0.0–0.2 s** [M: 60/70 viral Shorts; Zack D 16/16].
4. **~9 spoken words in the first 3 s** [M: median 9, IQR 8–11]. Sentence 1 has ≤12 words and puts the topic noun in the first 5 words.
5. **Text hook of 3–5 words** on screen from frame 0, in the top safe band. It mirrors the spoken hook.
6. **Spoken hook = context lean → interjection ("but…") → snapback** [C: Kallaway]. Deliver the first value hit by ~4 s.
7. **Generate ≥12 hooks across ≥5 families, score them with the rubric (§2), and keep the top 3 from different families** as test variants.
8. **Structure**: hook → foreshadow (≤3 s) → minimal context, delivered late → but/therefore escalation → re-hook every 2–3 sentences (≈7–12 s) → twist at 60–80% → payoff → end ≤0.5 s after the payoff.
9. **Never let "and then" link two beats.** Use "but", "so", "because".
10. **Narration at 165–190 WPM, default 175** [M: narrated-channel median 177, IQR 165–188]. Use 150–165 for emotional stories.
11. **Reading level ≤ grade 6**, no sentence > 20 words, staccato hook, varied rhythm after it.
12. **Length**:
    - YouTube Shorts 30–45 s [D: top-channel median 40 s]
    - TikTok 25–45 s reach cut; 61–75 s monetized cut (Creator Rewards needs ≥1 min) [P/D]
    - Reels 20–45 s
13. **One new visual per caption chunk (≈1–1.5 s)**; never a static frame; a pattern interrupt every 4–8 s; the big reveal at 60–80%.
14. **Captions: 2–4 words per chunk** (1 word for punch moments), ≤2 lines, ≤ ~720 px wide.
    - Font: Montserrat ExtraBold/Black (61% of 2M Submagic videos [D]) or Anton/Poppins/TikTok Sans.
    - Size 80–110 px; stroke ≈ 1/7 of the font size; active-word color highlight.
15. **Caption block center at y ≈ 1050–1250** of 1920. **Text hook at y ≈ 290–620.**
    - Universal safe box: x 65–888, y 288–1248. These are the strictest margins of the three platforms: Meta 14/35/6% [P], Google's Shorts template 288/672/48/192 [P], TikTok ~130/480/60/140 [V].
16. **Master to −14 LUFS integrated, ≤ −1 dBTP** (use −1.5 for AAC safety).
    - Music under speech 18–24 dB below the voice.
    - Extra 3–6 dB ducking under speech.
17. **SFX on structure, not on every cut**: an accent at the hook frame, at each re-hook or reveal, and at the end (≈4–10 audible accents/min), plus quiet micro-SFX for text pops.
18. **Pauses**: inter-sentence silence 0.20–0.35 s (energetic) or 0.35–0.50 s (story); comma 0.10–0.20 s; at most one planned 0.6–1.0 s dramatic beat [M: viral narrators' sentence-end gap is ≈0.48 s onset-to-onset beyond normal word spacing].
19. **Loop or punch ending**; no sign-off.
    - CTA only after the payoff.
    - App marketing: make the video about the user's problem; the app appears at 75–90% of runtime.
20. **Fact-check everything.** Vary templates across uploads: YouTube's "inauthentic content" policy (Jul 2025) and its originality push (Oct 2026) [P].
21. **A/B testing**:
    - YouTube Test & Compare does **not** support Shorts [P].
    - Use Instagram **Trial Reels** (shown to non-followers) for hook-variant tests [P].
    - TikTok has no organic A/B tool (only Ads Manager split tests) [P].
22. **Test hooks only**: same body, 3 different first 2–3 s. Judge on 3-s hold / stayed-to-watch and average % watched against your own medians.
23. **Instagram**: ≤5 hashtags (cap since Dec 2025) [P]; keywords in the caption for search. Hashtags are not a reach lever.
24. **Cadence**:
    - TikTok 5–7/week (more posts = more outlier chances, but lower median views per post [D]).
    - IG 3–5/week [D].
    - Shorts 3–7/week.
    - Shorts decay within 7–14 days [C].
25. **Judge every metric against your own channel's medians.** There are no official platform benchmarks [P].


## 1. Hook library (106 templates in 27 families, de-duplicated)

### 1.0 How to use this library

- **Hook = 4 aligned layers**: the *visual hook* (what frame 0–1.5 s shows), the *text hook* (3–5 big words on screen, not the captions), the *spoken hook* (first 1–2 sentences), and the *audio hook* (the first sound). Kallaway ranks visual > written > spoken, because the eye reads before the ear processes speech. Viewers go eyes → ears → eyes: they see, then hear, then look back to confirm the visual matches what they heard ([X, Apr 16 2025](https://x.com/kanekallaway/status/1912316912198943206); Kallaway, "I Studied 100 Viral Hooks…", YouTube `xnOe8aA9Pmw`). Any mismatch costs comprehension, and lost comprehension makes viewers leave.
- **Pick the key visual first, then the hook family that gives it the biggest contrast**, then write the spoken line. Any topic can be written in any family (Kallaway shows one backpack topic in all six of his archetypes). So **always generate candidates across ≥5 families, then score them (§2)**.
- **Spoken-hook shape (Kallaway's 3-step formula)**: (1) a *context lean* that states the topic in the first line and gives a reason to care (benefit, pain, common ground, or a mind-blowing fact); (2) a *scroll-stop interjection*, one contrast word or line such as "but", "however", or "but here's the thing"; (3) a *contrarian snapback* that turns the expectation the other way while staying on topic. Use **staccato** (short) sentences in the hook and vary sentence length later. Kallaway gives short-form roughly a **4-second** window to deliver the first value.
- **Word budgets** (sources: vidIQ 2026, Kallaway, and my measured corpus in §9):
  - Text hook: **3–5 words**. Kallaway says 3–5; vidIQ says 3–7.
  - Spoken hook: **6–14 words** for the first sentence. vidIQ says 5–10.
  - First 3 s: the measured median is **9 spoken words** (inter-quartile range 8–11) across 70 viral Shorts. Voice starts at **0.0 s** (median).
- **Kallaway's six archetypes map onto the families below**: Fortune Teller → R; Experimenter → J; Teacher → H/V; Magician → T (it can be stacked on any family); Investigator → I/O; Contrarian → C.
- **Jenny Hoyos's power words** are free, $0 / one dollar, banned, secret, cheap, stole. Avoid weak openers such as "This is…" and "I'm out…" ([Creator Science podcast transcript](https://creatorscience.com/podcast/jenny-hoyos/); [Marketing Examined](https://www.marketingexamined.com/blog/jenny-hoyos-short-form-video-playbook)).
- **The examples are illustrations, not verified fact sheets.** The script agent must fact-check every claim before use (see §3.6).

Column key:
- **W** = spoken words in the example.
- **Fit** = best-fit formats: Sto = story, His = history, Exp = explainer/science, HIM = how-it's-made / how-it-works, App = app/product marketing, Biz = business/money, HT = how-to/tips.
- **Visual (0–1.5 s)** = what frame 0 shows, already in motion.
- **Text** = the on-screen title hook. Captions are a separate layer.

### A. Curiosity gap / open loop
| # | Pattern | Filled example | W | Fit | Visual (0–1.5 s) | Text |
|---|---|---|---|---|---|---|
| A1 | [Familiar object] has a hidden [feature]—and almost nobody knows. | "Your car key has a hidden blade—and almost nobody knows it's there." | 12 | HIM, App, HT | Macro of thumb sliding the key release; blade pops out on frame 6 | THE HIDDEN BLADE |
| A2 | This [object] looks normal. But it [impossible property]. | "This brick looks normal. But it floats." | 7 | Exp, HIM | Brick dropping into water in slow motion, splash on the word "floats" | IT FLOATS?! |
| A3 | The reason [thing] is [shape/color/way] isn't what you think. | "The reason pencils have six sides isn't what you think." | 10 | Exp, His, HIM | Round pencil rolls off a desk; a hex pencil stops dead | WHY 6 SIDES? |
| A4 | There's a [place] where [rule-breaking fact]. Here's why. | "There's a town in Norway where you can't be buried. Here's why." | 12 | His, Exp | Snowy town sign, then a padlocked cemetery gate | NO BURIALS ALLOWED |
| A5 | Watch what happens when you [action] [object]. | "Watch what happens when you drop a magnet down a copper pipe." | 12 | Exp, HIM | Magnet entering the pipe; it hovers and falls slowly | IT WON'T FALL |
| A6 | Everyone's seen [X]. Almost no one knows what it's for. | "Everyone's seen the tiny hole in airplane windows. Almost no one knows why." | 13 | Exp, HIM | Push-in to the bleed hole on a frosted window | WHAT'S THIS HOLE? |

### B. Shock number / stat
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| B1 | [Number][unit] — [vivid comparison]. | "One fluffy cloud weighs about 500 tonnes—about 100 elephants." | 10 | Exp | 3D elephants stacked inside a cloud; a scale needle swinging | 500 TONNES |
| B2 | [X]% of [group] [do it wrong]—[consequence]. | "Most people brush their teeth at the worst possible time." | 10 | HT, App | Toothbrush plus a clock that snaps to "right after coffee" | WORST TIME TO BRUSH |
| B3 | In [tiny time], [one cause] [huge outcome]. | "In 37 seconds, one software bug destroyed a $370 million rocket." | 11 | His, Exp, Biz | Launch, a T+37 counter, explosion on the word "destroyed" | 37 SECONDS |
| B4 | There are [huge number] [things] hidden [unexpected place]. | "There are about 3 million shipwrecks on the ocean floor right now." | 12 | His, Exp | Camera dives from the waves to a seabed full of wrecks | 3,000,000 WRECKS |
| B5 | [Brand/thing] costs [$X] for [tiny unit]. | "A Super Bowl ad costs about $8 million—for 30 seconds." | 10 | Biz | Stopwatch counting down beside a burning cash stack | $8M / 30 SEC |
| B6 | You [do common thing] [huge number] times a [period]. | "You blink about 15,000 times a day—half an hour of darkness." | 11 | Exp | Extreme close-up of an eye; black flashes count up | 15,000 BLINKS |

### C. Contrarian / "you've been lied to"
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| C1 | [Belief] is a myth. [Truth]. | "Goldfish don't have 3-second memories. They remember for months." | 9 | Exp | Goldfish solving a maze to reach food | MYTH: 3-SEC MEMORY |
| C2 | Everything you learned about [topic] in school is wrong. | "The tongue map you learned in school is completely wrong." | 10 | Exp, His | The classic tongue-map diagram cracks and shatters | THE TONGUE MAP LIE |
| C3 | Stop [common action]. You're [making it worse]. | "Stop rinsing after you brush. You're washing away the fluoride." | 10 | HT, App | Hand under a tap; a red X stamps the frame | STOP RINSING |
| C4 | [Industry] won't advertise this, but [useful truth]. | "Supermarkets won't advertise this, but the freshest milk is at the back." | 12 | HT, Biz, App | Hand reaching past the front cartons to the back row | GRAB FROM THE BACK |
| C5 | Everyone loves [X]. But [X] [is overrated/harmful] for [use]. | "Everyone loves standing desks. But standing more won't protect your heart." | 11 | HT, App | Standing-desk worker with legs glowing red in a thermal view | STANDING ≠ HEALTHY |
| C6 | [Common villain] isn't the problem. [Real cause] is. | "Sugar isn't what rots your teeth. Bacteria are." | 8 | Exp, HT | Sugar cube dissolving; bacteria swarm the enamel | IT'S NOT THE SUGAR |
| C7 | You've been [doing X] wrong your whole life. | "You've been peeling bananas wrong your whole life." | 8 | HT | Fingers pinch the banana's bottom and it splits cleanly | YOU'RE DOING IT WRONG |

### D. In-medias-res story (the Zack D. Films default)
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| D1 | [He/She] [one strange physical act]. (Past tense, no name, no date) | "He drifted 76 days across the Atlantic on a five-foot raft." | 11 | Sto, His | Tiny raft on a huge swell, seen from above | 76 DAYS ADRIFT |
| D2 | Something was [moving/ticking/leaking] in his [everyday object]. | "Something was ticking inside his suitcase." | 6 | Sto | Airport X-ray monitor; the bag's outline glows | WHAT'S TICKING? |
| D3 | [N] minutes after [routine start], [shocking failure]. | "Thirteen minutes after takeoff, the windshield blew out—and the captain went with it." | 14 | Sto, His | Cockpit pane bursting; papers spiraling out | 13 MINUTES IN |
| D4 | He had [tiny resource] left when [obstacle]. | "He had 30 seconds of air left when his line snagged." | 11 | Sto | Diver tangled in rope; gauge needle in the red | 30 SECONDS OF AIR |
| D5 | A [vehicle/object] [did impossible thing]—and [survival twist]. | "A car drove off a 250-foot cliff—and all four people survived." | 12 | Sto | Car mid-air over a sea cliff | 250 FT. ALL ALIVE. |
| D6 | [Character] [ordinary action] when [inciting surprise]. | "She was mowing the lawn when the ground opened beneath her." | 11 | Sto | Mower tilting as the turf cracks into a sinkhole | THE GROUND OPENED |
| D7 | [Quoted line someone said], [time] into [event]. | "'Houston, we've had a problem'—56 hours into Apollo 13." | 9 | His, Sto | Spacecraft exterior with a side panel blowing off | 56 HOURS IN |

### E. Question
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| E1 | Why do [familiar thing] always [odd behavior]? | "Why do cats always land on their feet?" | 8 | Exp | Cat mid-fall rotating in slow motion | HOW?! |
| E2 | Have you ever wondered where [mundane mystery] goes? | "Ever wondered where airplane toilet waste actually goes?" | 8 | Exp, HIM | Flush triggers a vacuum animation that zooms into pipes | WHERE DOES IT GO? |
| E3 | [Option A] or [option B]? (counter-intuitive math/choice) | "A million dollars now, or a penny doubled every day for 30 days?" | 13 | Exp, Biz, App | Split screen: cash briefcase vs a single penny | $1M OR 1¢? |
| E4 | Who/what is the [most extreme] [X]? (the answer is the video) | "Who was the luckiest person who ever lived?" | 7 | His, Exp | Lottery balls and lightning bolts orbit a silhouette | THE LUCKIEST HUMAN? |
| E5 | How does [impossible-seeming thing] even work? | "How does a 400-ton plane even stay in the air?" | 10 | Exp, HIM | A747 rotating off the runway; airflow lines appear | HOW DOES IT FLY? |

### F. Warning / negative
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| F1 | Never [common action] [context]. Here's why. | "Never charge your phone under your pillow. Here's why." | 9 | HT, App | Phone under a pillow; thermal colors climbing | NEVER DO THIS |
| F2 | If you [habit], you need to see this. | "If you microwave food in plastic, you need to see this." | 11 | HT, Exp | Microwave interior; container shedding particles (stylized) | MICROWAVE + PLASTIC |
| F3 | This one [setting/habit] is [silently damaging X]. | "This one setting is draining your battery while you sleep." | 10 | App, HT | Battery icon draining from 100 to 20 under a moon | THE BATTERY KILLER |
| F4 | Don't [buy/do] [X] until you check [one thing]. | "Don't buy a used car until you check this one spot." | 11 | HT | Flashlight sweeping onto wheel-well rust | CHECK HERE FIRST |
| F5 | If [safeguard] stops working, [everyday thing] becomes deadly. | "If antibiotics stop working, a paper cut could kill you." | 10 | Exp, His | Paper cut close-up; bacteria bloom across the skin | A PAPER CUT COULD KILL |

### G. List / countdown / ranking
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| G1 | [N] [things] that [surprise]—and #1 is [teaser]. | "3 things in your kitchen dirtier than a toilet—number one is gross." | 12 | HT, Exp | Three-panel snap montage, each with a germ glow | DIRTIER THAN A TOILET |
| G2 | [N] [category] you've never heard of. | "Three animals that are basically immortal." | 6 | Exp | Jellyfish reverse-aging animation | BASICALLY IMMORTAL |
| G3 | Ranking [N] [things] from [low] to [unthinkable]. | "Ranking history's deadliest jobs, from bad to unthinkable." | 8 | His | Tier board with the first card sliding in | DEADLIEST JOBS RANKED |
| G4 | [N] signs you're [identity/state]. | "Four signs your phone has been hacked." | 7 | App, HT | Phone screen glitching, then a counter "1/4" | 4 SIGNS |

### H. "How X did Y" (teacher / case study)
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| H1 | How [company/person] [surprising result] with [unlikely asset]. | "How Duolingo turned a cartoon owl into its best marketer." | 10 | Biz, App | Green owl knocking on a phone screen | THE OWL STRATEGY |
| H2 | [Entity] did [impossible-seeming thing] in [short time]. Here's how. | "Japan built a train station in under six hours. Here's how." | 11 | HIM, Exp | Night time-lapse of a printed station dropping into place | BUILT IN 6 HOURS |
| H3 | [Ancient people] [hard feat] using one trick: [trick]. | "Egyptians moved 2-ton blocks with one trick: wet sand." | 9 | His, HIM | Sled with a stone block; a worker pours water ahead of it | THE WET-SAND TRICK |
| H4 | This is how [pros] [do task] in [time]. | "This is how pit crews change four tires in two seconds." | 11 | HIM, Exp | Stopwatch at 0.00; crew converging on the car | 2.0 SECONDS |

### I. "Nobody tells you" / secret / investigator
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| I1 | Nobody talks about [hidden side of topic]. | "Nobody talks about what a long flight does to your legs." | 11 | HT, Exp | Passenger stands up; X-ray legs show a clot forming | AFTER A LONG FLIGHT |
| I2 | I can't believe [product] doesn't tell people about this. | "I can't believe your phone doesn't tell you about this feature." | 11 | App, HT | Mock settings screen; a hidden toggle glows | HIDDEN FEATURE |
| I3 | There's a [secret thing] hidden [inside famous thing]. | "There's a secret room hidden behind Mount Rushmore's faces." | 8 | His | Camera pushes past Lincoln's head into a carved chamber | SECRET ROOM |
| I4 | [Industry] has a name for [thing you've noticed]. | "Casinos have no clocks or windows—and it's on purpose." | 10 | Biz, Exp | Camera sweeps a casino floor, searching for a clock | NO CLOCKS. ON PURPOSE. |

### J. Challenge / test / experiment
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| J1 | We tested [N] [things] so you don't have to. | "We tested five umbrellas in a wind tunnel so you don't have to." | 12 | App, HT | Umbrella inverting in a wind tunnel | 5 UMBRELLAS VS 60 MPH |
| J2 | Can [object] survive [extreme]? | "Can a phone survive a fall from space?" | 8 | Exp | Phone on a balloon at the edge of space | FROM SPACE? |
| J3 | [A] vs [B]: which one [breaks/wins]? | "Hydraulic press versus diamond—which one breaks?" | 6 | Exp, HIM | Press plate descending onto a diamond | PRESS VS DIAMOND |
| J4 | Let's try [risky thing] so you don't have to. | "Let's see what lightning does to a body—so you never find out." | 12 | Exp | Cartoon figure on a hill as a bolt forks down | STRUCK BY LIGHTNING |

### K. Time compression
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| K1 | [Long span] of [process] in [N] seconds. | "4.5 billion years of Earth in 45 seconds." | 8 | His, Exp | Molten Earth cooling as a year counter spins | 4.5B YEARS / 45 SEC |
| K2 | Every [era] of [object], from [year] to now. | "Every era of the phone, from 1983 to now." | 9 | His, HIM | Phone morphing on every beat | 1983 → 2026 |
| K3 | What [N] days of [habit] does to your [body/thing]. | "What 30 days without sugar does to your body." | 9 | HT, App | Body silhouette; day counter; organs lighting up | DAY 1 → DAY 30 |

### L. Before/after / transformation
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| L1 | This was [place] in [year]. This is it now. | "This was Dubai in 1990. This is Dubai today." | 9 | His | Wipe from desert to skyline on the beat | 1990 vs TODAY |
| L2 | From [bad state] to [good state] in [time]—with one change. | "From failing to straight A's in one semester—with one study trick." | 12 | HT, App | Report card flipping from F to A | F → A |
| L3 | I used [app/method] for [N] days. Here's what changed. | "I used a budgeting app for 30 days. Here's what changed." | 11 | App | Bank balance ticking up; day counter | 30 DAYS LATER |

### M. POV / second person
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| M1 | POV: you're a [role] in [time/place] and [incident]. | "POV: you're a medieval peasant and the plague just reached your village." | 12 | His, Sto | First-person view at the village gate as a cart arrives | POV: 1348 |
| M2 | POV: you just found the app that [solves pain]. | "POV: you just found the app that plans your meals for you." | 12 | App | Phone in hand, fridge door swinging open | POV: DINNER, SOLVED |
| M3 | You [impossible action]. Then [twist]. (instructional second person) | "You shrink to the size of an ant. Then it starts raining." | 12 | Exp | Tiny figure on a leaf; a raindrop the size of a car falls | ANT-SIZED IN THE RAIN |

### N. Identity call-out
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| N1 | If you [identity/pain], [watch/check] this first. | "If you get headaches every afternoon, check this first." | 9 | HT, App | Desk worker rubbing temples; clock at 3 pm | 3PM HEADACHES? |
| N2 | [Label group]—this one's for you. | "Night-shift workers, this one's for you." | 6 | HT, App | Nurse under fluorescent lights at 3 a.m. | NIGHT SHIFT? |
| N3 | Only people born before [year] will [recognize this]. | "Only people born before 2000 will remember this sound." | 9 | His | Dial-up modem screen with handshake waveform | REMEMBER THIS? |
| N4 | If you want [benefit], you need to [action/know X]. | "If you want to stop snoozing alarms, try this tonight." | 11 | HT, App | Phone alarm sliding across the room on its own | STOP SNOOZING |

### O. Mystery / "this shouldn't exist"
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| O1 | This [object] shouldn't exist. | "This 2,000-year-old computer shouldn't exist." | 6 | His, Exp | Corroded bronze gears; rotate to the reconstruction | 2,000 YEARS OLD?! |
| O2 | Scientists still can't explain [phenomenon]. | "Scientists still can't fully explain why we yawn." | 8 | Exp | Yawn spreading face to face | WHY WE YAWN |
| O3 | [Thing] was found [impossible place]. | "Whale skeletons were found in the middle of a desert." | 10 | His, Exp | Dunes, then a giant whale skeleton revealed | WHALES IN THE DESERT |
| O4 | [Place/object] has a [silent threat]. | "Mars has a silent killer—and it's not the cold." | 9 | Exp | Astronaut boot in red dust; toxic particles glint | MARS'S SILENT KILLER |

### P. Stakes
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| P1 | If [one component] fails, [huge consequence]. | "If this one undersea cable snaps, a whole country goes offline." | 11 | Exp, HIM | Ship anchor dragging toward a seabed cable | ONE CABLE |
| P2 | They had one chance to [fix]—or [lose everything]. | "Apollo 13 had one shot to fix their air filter—or suffocate." | 11 | His, Sto | Astronauts duct-taping a square filter into a round hole | ONE SHOT |
| P3 | If [danger happens], [instinctive move] is the worst thing to do. | "If a rip current grabs you, swimming to shore is the worst move." | 13 | HT | Top-down beach; a dark channel pulls a swimmer out | DON'T SWIM BACK |

### Q. "What if" hypothetical (Zack D's other default)
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| Q1 | If you had a [animal]'s [organ], [vivid consequence]. | "If you had an owl's eyes, they'd be the size of grapefruits." | 12 | Exp | Human face morphing to giant eyes | OWL EYES |
| Q2 | What would happen if [extreme scenario] tonight? | "What would happen if the Moon disappeared tonight?" | 8 | Exp | Moon blinks out; the ocean flattens | NO MOON? |
| Q3 | If you [impossible action], you'd [gruesome/funny outcome]. | "If you fell into a black hole, you'd be stretched like spaghetti." | 12 | Exp | Astronaut elongating near the event horizon | SPAGHETTIFIED |
| Q4 | If you replaced [material in landmark] with [absurd thing]… | "If you replaced the Eiffel Tower's iron with LEGO, it would…" | 11 | Exp, HIM | Tower rebuilt brick by brick, then wobbling | LEGO EIFFEL? |

### R. Fortune teller / future
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| R1 | [New thing] is about to change [domain] forever. | "See-through solar windows are about to change cities forever." | 9 | Exp, Biz | Skyscraper glass glowing with energy flow | WINDOWS = POWER |
| R2 | In [N] years, [familiar thing] could disappear. | "In 20 years, gas stations could disappear completely." | 8 | Biz, Exp | Gas station fading into grass | GONE BY 2046? |

### S. Comparison / scale / price
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| S1 | [Small] next to [huge] is terrifying. | "Earth next to the biggest known star is terrifying." | 9 | Exp | Continuous zoom-out past the Sun | SCALE CHECK |
| S2 | $[low] [item] vs $[high] [item]. | "A $1 pencil versus a $1,000 pencil—what's different?" | 9 | HIM, Biz | Split screen with flipping price tags | $1 vs $1,000 |
| S3 | Why [small thing] costs [huge price]. | "Why saffron is the most expensive spice on Earth." | 9 | HIM, Biz | Tweezers lifting threads beside a scale | WORTH ITS WEIGHT |

### T. Magician / visual stun (stackable on any family)
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| T1 | Look closely at [thing]—[instruction]. | "Look closely at this painting—the eyes follow you." | 9 | Exp, His | Camera arcs; the painted eyes track it | WATCH THE EYES |
| T2 | This is what [invisible thing] actually looks like. | "This is what a sound wave actually looks like." | 9 | Exp | Speaker cone pushing visible pressure rings | SOUND, VISIBLE |
| T3 | Check this out: [one-line context]. | "Check this out: a bridge that curls itself up like a caterpillar." | 12 | HIM | Bridge curling into an octagon | THE ROLLING BRIDGE |

### U. Authority / social proof
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| U1 | [Experts] are trained to do one thing first when [crisis]. | "Pilots are trained to do one thing first in every emergency." | 11 | Exp, HT | Cockpit alarm lights; hands grip the yoke | WHAT PILOTS DO FIRST |
| U2 | The trick [champions] use to [impressive result]. | "The trick memory champions use to remember 1,000 digits." | 9 | HT, App | Brain zooms into a house with numbers in each room | THE MEMORY PALACE |

### V. Mechanism / how-it-works / how-it's-made
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| V1 | Here's how [everyday object] actually works. | "Here's how a zipper actually works." | 6 | HIM | Macro cutaway of the slider meshing teeth | INSIDE A ZIPPER |
| V2 | This is how [product] is made—and [surprising step]. | "This is how pencils are made—and there's no lead in them." | 11 | HIM | Graphite-clay rods sliding into wood slats | NOT LEAD |
| V3 | The [object] that [does unexpected job]. | "The car hood that inflates to protect the person it hits." | 11 | HIM, Exp | Hood airbag bursting open as a car meets a pedestrian dummy | THE AIRBAG ON THE OUTSIDE |
| V4 | What's actually inside a [sealed object]? | "What's actually inside a golf ball?" | 6 | HIM | Ball sliced in half; layers rotate apart | INSIDE A GOLF BALL |
| V5 | [Imperative step 1]. Then [step 2]. (build-along, no preamble) | "Fold the paper in half. Then fold both corners to the crease." | 12 | HIM, HT | Hands doing step 1 on frame 0 | THE RECORD PAPER PLANE |

### W. Money / business mechanism
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| W1 | [Company] makes most of its profit from [unexpected source]. | "Costco makes most of its profit from one thing—and it's not food." | 12 | Biz, App | Membership card spinning, gold glow | IT'S NOT THE FOOD |
| W2 | [Cheap option] costs more in the end. Here's the math. | "Cheap boots cost more in the long run. Here's the math." | 11 | Biz, Exp | Two boot pairs on a timeline; cheap pair re-bought 5x | CHEAP = EXPENSIVE |

### X. Superlative / record
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| X1 | This was the [most extreme] [thing] on Earth—until [twist]. | "This was the loneliest tree on Earth—until a truck hit it." | 12 | His, Sto | Lone tree in a desert; truck headlights approach | LONELIEST TREE |
| X2 | The shortest [event] in history lasted [tiny number]. | "The shortest war in history lasted 38 minutes." | 8 | His | Stopwatch over a palace bombardment | 38 MINUTES |

### Y. Hidden in plain sight / perception
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| Y1 | Once you see [detail] in [familiar thing], you can't unsee it. | "Once you see the arrow in the FedEx logo, you can't unsee it." | 12 | Biz | Logo; the arrow glows into view | SEE THE ARROW? |
| Y2 | That [sensation] you feel when [moment]? There's a reason. | "That jolt you feel right as you fall asleep? There's a reason." | 11 | Exp | Person in bed twitching; a brain flash | THE SLEEP JOLT |

### Z. Outcome promise / tutorial
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| Z1 | How to [outcome] in [time], the way [experts] do. | "How to fall asleep in two minutes, the way pilots were trained." | 12 | HT, App | Person relaxing face muscles; timer at 2:00 | ASLEEP IN 2 MIN |
| Z2 | A [N]-second trick to [result]. | "A 5-second trick to tell if an egg is still fresh." | 11 | HT | Egg sinking vs floating in a glass | FRESH OR NOT? |
| Z3 | [Setup]—but wait until you see what [happened next]. | "They built a 30-foot sandcastle—wait until you see the tide." | 11 | Sto | Tower of sand; a wave rearing behind it | WAIT FOR THE TIDE |

### AP. App / product marketing (problem first, product last)
This family follows the pattern behind the motionlab result: make the video about the user's problem, teach something genuinely useful, and let the app appear near the end as the solution ([@PeefTwt](https://x.com/PeefTwt/status/2121240962374533413), Nov 2026, self-reported). Lightreel's Aug–Nov 2026 consumer-app reports describe the same move: open on emotion or tension and reveal the product late. They also note withheld-name hooks that send viewers to the comments for the app name, and numeric constraints such as a budget or calorie count ([Lightreel](https://www.lightreel.ai/blogs/consumer-apps-on-tiktok)).
| # | Pattern | Filled example | W | Fit | Visual | Text |
|---|---|---|---|---|---|---|
| AP1 | You forget [X] of [thing] within [time]. Here's the fix. | "You can forget most of what you read within a day. Here's the fix." | 14 | App, HT | Book pages dissolving into dust | FORGOTTEN IN 24H |
| AP2 | Why your [goal] keeps failing (it's not [assumed cause]). | "Why your diet keeps failing—and it's not willpower." | 9 | App, HT | Scale needle bouncing back up | IT'S NOT WILLPOWER |
| AP3 | Stop [manual painful process]. Do this instead. | "Stop counting calories by hand. Do this instead." | 8 | App | Crossed-out notebook full of numbers | STOP DOING THIS |
| AP4 | [Budget/constraint] → [outcome] (numeric constraint) | "Feeding a family of four on $50 a week. Here's the list." | 12 | App, HT | Receipt printing; total stops under $50 | $50 / WEEK / 4 PEOPLE |
| AP5 | Your [device/app] can already do this. You just never turned it on. | "Your phone can already translate signs live. You just never turned it on." | 13 | App, HT | Camera pointed at a foreign sign; text morphs | IT'S ALREADY ON YOUR PHONE |
| AP6 | Why is nobody talking about this [tool/trick]? | "Why is nobody talking about this way to learn languages?" | 10 | App | Phone flipping through flashcards at speed | WHY IS NOBODY TALKING ABOUT THIS |

### 1.9 Real openers from viral Shorts (structure, measured)

These openers are described structurally rather than quoted (copyright). The raw auto-caption files for every video are saved locally, so the build agent can mine the exact wording itself (paths in §9). The measured columns come from word-level ASR timestamps (n = 70 Shorts from 11 channels; full metrics in §9).

The canonical example is one 6-word, past-tense sentence with no name or setup: "Something was moving in his helmet." (Zack D. Films, `EL8k1jde88k`, 17M views). The snake is revealed at 21.4 s of a 30 s Short, about 71% through.

| Channel / video (views) | Family | Opener structure (paraphrased) | 1st word | Words in first 3 s | WPM | Speech length |
|---|---|---|---|---|---|---|
| Zack D. `ob4_mDwWkM0` (25M) | Q + E | Hypothetical organ transplant from an animal, framed as a yes/no superpower question | 0.1 s | 10 | 184 | 36 s |
| Zack D. `EL8k1jde88k` (17M) | D2 | Unexplained movement inside an everyday object; reveal at 71% | 0.0 | 9 | 183 | 30 s |
| Zack D. `BmVz7QMOg3c` (14M) | V5 | Imperative build step from word 1, no preamble | 0.0 | 11 | 184 | 38 s |
| Zack D. `orbNiULu_t0` (14M) | Q4 | Hypothetical swap of a landmark's building material for an absurd one | 0.0 | 10 | 164 | 37 s |
| Zack D. `6QqiYZ45nHQ` (12M) | M3 | Second-person impossible action performed on the viewer's behalf | 0.0 | 9 | 187 | 31 s |
| Zack D. `HoXWgtsx5T8` (12M) | D7 + C | Quotes the tattoo's text, then "But…" twist in the same breath | 0.0 | 7 | 158 | 35 s |
| Zack D. `Zy__AZ9WiCM` (12M) | Kallaway 3-step | Observation that immediately negates the obvious explanation; "You see," context at 5 s; "So," payoff at 14 s | 0.0 | 10 | 178 | 24 s |
| Zack D. `Myjedyp5Iwo` (11M) | D5 | Accident in progress (truck rolls over a cyclist); tech reveal | 0.2 | 12 | 177 | 34 s |
| Zack D. `TA-y7jVggZY` (10M) | D | Object pulled into a jet engine, then the man after it | 0.0 | 9 | 175 | 29 s |
| Zack D. `BT9qe_6onxw` (10M) | V5/Exp | Imperative geometry instruction ("Draw…"); paradox payoff | 0.0 | 8 | 162 | 30 s |
| Kurzgesagt `UC5Mpc-GQCg` (5.3M) | O4 | 6-word threat statement, then mechanism | 0.0 | 10 | 188 | 84 s |
| Kurzgesagt `KTu2V65Iiho` (4.3M) | E + J4 | Title question restated, then a promise to test it on the viewer's behalf | 0.0 | 8 | 184 | 71 s |
| Kurzgesagt `bo7QgxhrGnw` (3.3M) | C6 | Flat contrarian denial of a popular fear | 0.0 | 8 | 179 | 66 s |
| Kurzgesagt `VYhUa3WC4nU` (3.8M) | W2 | Paradox statement, then a promise to show the mechanism | 0.0 | 8 | 172 | 72 s |
| Kurzgesagt `dwZgy7SNMRc` (3.5M) | F5 | Universal-stakes warning | 0.48 | 7 | 160 | 78 s |
| Infographics `V15wrmD5VFs` (2.9M) | M/Exp | Second-person mechanism, step one stated immediately | 1.4 (late) | 6 | 168 | 27 s |
| Infographics `-4ugPoL6MOE` (2.5M) | Title-as-hook | Restates the title as a "here's how" line | 0.14 | 9 | 211 | 56 s |
| MrBeast `3GNyw4uaAqU` (1.2B) | P + CTA | Spectacle set-up whose rules *are* the subscribe CTA | 0.0 | 10 | 205 | 14 s |
| MrBeast `_sBRk9ADpK8` (1.2B) | Foreshadow | Announces the surprise he is about to deliver to a group | 0.0 | 11 | 163 | 46 s |
| MrBeast `hYahU_Cqwp8` (649M) | Mystery + urgency | An authority figure summons him urgently; he is already on site | 0.0 | 16 | 285 | 32 s |
| MrBeast `gar4U3n-ILY` (571M) | Challenge | Viewer is challenged to guess a hidden variable about what just happened to him | 0.0 | 13 | 163 | 36 s |
| Jenny Hoyos `5QX_L3Xq9ek` (10M) | E (live) | Asks strangers a yes/no question on camera | 0.0 | 19 | 270 | 37 s |

**Patterns observed in the corpus (my analysis):**
- **The voice starts at 0.0–0.2 s in 60 of 70 Shorts** (63/70 by 0.5 s). The exceptions are game or visual-first formats such as MrBeast's guessing videos and one Infographics Show video.
- **The title is the first line.** Kurzgesagt and Infographics restate the title as the spoken hook. This aligns title, text, and spoken hook.
- **Zack D's top-25 titles all end in one emotion emoji** (🤔 😨 😱 🤯 😢). The emoji is in the title, not the captions.
- **About 6 of the first 45 end mid-phrase**, with the last word or two cut, so the loop restart "completes" the thought (e.g., `Myjedyp5Iwo`, `6QqiYZ45nHQ`, `Gn-KqiRv0XI`). Treat this as a deliberate loop device. Caveat: ASR can also drop a final word under music.


## 2. Hook scoring rubric and first-3-second rules

### 2.1 Generation protocol (agent)
1. **Find the key visual first.** Identify the single most surprising thing the renderer can show: an object, an action, a number made physical, or a transformation. If the topic has no strong key visual and one can't be manufactured with motion graphics, demote the topic. Kallaway's rule: without a key visual, kill or rework the idea.
2. **Generate ≥12 candidate hooks from ≥5 families** in §1. Always include one each of D (in-medias-res) or Q (what-if), A or O (curiosity/mystery), C (contrarian), B (number), and one wildcard.
3. For each candidate, write the **triplet**:
   - `visual_frame0`: what is on screen at t=0, already moving.
   - `text_hook`: 3–5 words.
   - `spoken_hook`: 1–2 sentences, ≤14 words in sentence 1.
   - Optional `audio_hook`: e.g., an impact on frame 0, or a riser tail.
4. **Score with the rubric below.** Keep the **top 3 from 3 different families** as A/B variants (§7). Never ship 3 near-duplicates.
5. **Write the payoff line before the body** (Jenny Hoyos's order: idea, then hook, then final line, then foreshadowing, then body). Confirm the hook's promise is paid off inside the runtime.

### 2.2 Rubric (100 points, plus penalties)
| # | Criterion | Wt | 0 = | Full marks = | Source/rationale |
|---|---|---|---|---|---|
| 1 | **Contrast / curiosity gap** | 20 | No open question; obvious answer | Viewer believes A, hook asserts B; the distance A→B is large and the answer only comes later | Kallaway: hooks work through a curiosity loop built from contrast. Loewenstein's (1994) information-gap theory |
| 2 | **Instant topic clarity** | 15 | Topic unclear after sentence 1 | Topic noun in the **first 5 words**; a stranger could say what the video is about after ~1.5 s | Kallaway: context goes in line 1. Moving context to the back half of the first sentence raises skips (his own data) |
| 3 | **Visualizability + alignment** | 15 | Abstract claim with no image; text, visual and voice say different things | Frame 0 literally shows the claim; the text hook mirrors the spoken line; passes the **mute test** | Kallaway hook-alignment post; Jenny Hoyos: the hook must be understandable with the sound off |
| 4 | **Specificity** | 10 | Vague ("things", "amazing", "a lot") | Concrete numbers with units, named objects, physical verbs ("37 seconds", "2-ton block") | Practitioner consensus. Specific numbers are also easy to visualize |
| 5 | **Stakes / emotion** | 10 | No consequence | Danger, money, health, status, injustice, awe, or disgust; physical stakes in stories | Zack D corpus: 8 of 16 top Shorts open on bodily danger or a bodily/animal anomaly |
| 6 | **Speed & brevity** | 10 | >3.5 s spoken, or throat-clearing first | Sentence 1 ≤ 2.5 s at 170–190 WPM (≈7–12 words); staccato | Corpus: median 9 words in first 3 s. Kallaway: staccato hook, ~4 s window |
| 7 | **Payoff integrity** | 10 | Promise not delivered, or bait | Body delivers exactly what was promised, ideally with a twist | Kallaway: if the promise has nothing behind it, viewers feel cheated and churn. Bait hurts retention |
| 8 | **Audience self-selection** | 5 | Nobody in particular | Target viewer recognizes their pain, benefit, or identity, or a familiar reference ("cult hopping") | Kallaway context-lean levers; Hormozi callouts |
| 9 | **Novelty vs. feed & channel** | 5 | Cliché or reused opener | Fresh angle; family not used in the channel's last 3 posts | Avoids sameness; YouTube's "inauthentic content" rule targets templated, repetitive uploads |

**Penalties** (subtract):
- **−15**: opens with a greeting, brand, self-intro, date, "In this video", "So,", "Today we…", or a logo or title card.
- **−8**: the key visual or topic arrives only after 1.5 s.
- **−5**: context sits only in the back half of the first sentence.
- **−5**: jargon or an unknown proper noun in the first 5 words with no visual anchor (Kallaway's failed "generative world model" example).
- **−5**: a yes/no question whose honest answer is "no" or "who cares".
- **−5**: the hook needs sound to be understood (fails the mute test).
- **−5**: superlatives the body can't prove ("you won't believe", "scientifically impossible").
- **−3**: "This is…" or "I'm…" filler starts (Jenny Hoyos's rule).
- **−3**: spoken hook >14 words.
- **−10**: factual claim not verified.

**Decision rule:**
- Ship the highest score ≥ 75.
- If the best score is < 65, rework the topic or key visual rather than polishing words.
- Tie-break order: (a) stronger key visual, (b) fewer words, (c) family less used recently.

**Agent output schema (per candidate):**
```json
{"family":"D2","visual_frame0":"x-ray monitor, bag outline glowing, slow push-in","text_hook":"WHAT'S TICKING?","spoken_hook":"Something was ticking inside his suitcase.","audio_hook":"low tick SFX on frame 0 + sub drop at 0.4s","scores":{"contrast":17,"clarity":14,"visual":15,"specific":7,"stakes":9,"speed":10,"payoff":9,"audience":3,"novelty":4},"penalties":[],"total":88,"payoff_line":"…","fact_check":["source url"]}
```

### 2.3 First-3-seconds rules (30 fps timeline)
| Time | Rule | Evidence |
|---|---|---|
| **Frame 0 (0.000 s)** | Full-bleed key visual already **in motion** (camera drift or subject action). **No** black frame, fade-in, logo, title card, empty background or "loading" animation. Frame 0 doubles as the cover and thumbnail on several surfaces, so it must read as a still. | Paddy Galloway advises treating the intro like a thumbnail (Shorts study, Apr 2023). Kallaway: enough motion to catch the eye, like a deer noticing movement; too much overwhelms and too little bores |
| **0.0–0.2 s** | **Narration starts.** Leading silence trimmed to ≤ 6 frames. | Corpus: first word at **0.0 s (median)**; ≤ 0.2 s in 60/70 viral Shorts (Zack D. 16/16) |
| **0.0–0.3 s** | **Text hook on screen** (3–5 words, top-middle safe band; see §5), present before or with the first spoken word. It mirrors the spoken hook and doesn't duplicate the captions word for word. | Kallaway: 3–5 big bold words. vidIQ: 3–7 words. Viewers read the text hook first |
| **0.0 s** | **Audio hook**: music already playing (no fade-in) plus one accent (impact, whoosh tail, or riser resolve) on frame 0–3. | Kallaway names audio as the 4th hook component. TikTok: 88% of users call sound vital ([TikTok for Business](https://ads.tiktok.com/business/en/blog/creative-best-practices-top-performing-ads)) |
| **≤ 1.0–1.5 s** | **First visual change**: a cut, new element, or camera move. Then one new picture per caption chunk (≈ every 1–1.5 s). | Measured narration ≈ 2.9 words/s at 176 WPM, so a 2–4-word chunk lasts 0.7–1.4 s. Practitioner specs use one picture per 2–4-word chunk |
| **≤ 2.5 s** | **Sentence 1 complete**: topic plus tension stated (context lean). | Corpus: median 9 spoken words by 3.0 s (IQR 8–11, n=70) |
| **2.5–4.0 s** | **Scroll-stop interjection and snapback** ("but…", "except…", "here's the problem…"), *or* foreshadowing of the ending ("by the end…", "what he found next…"). | Kallaway 3-step. Jenny Hoyos: hook, then foreshadowing, each ≤ ~3 s |
| **≤ 4–5 s** | **First value hit**: a new fact, image, or number that pays a little immediately. | Kallaway's "speed to value" says short-form has about a 4-second timer. TikTok: 90% of ad recall impact lands in the first 6 s |
| **Always** | **Mute test**: play 0–5 s muted; a stranger must be able to say the topic. **Sound test**: the first spoken line must match the text hook. | Kallaway; Jenny Hoyos (visual-first hooks) |

**Hard bans for 0–3 s:**
- Greetings, channel or brand names, "Hey guys", "In today's video", "Let me tell you", or any intro sting.
- Slow fades from black.
- Static image held more than 0.5 s without motion.
- Establishing shots that don't show the subject.
- Text that takes more than ~1 s to read.
- A spoken line that describes something not on screen.

**What the platforms measure in this window:**
- **YouTube Shorts**: "stayed to watch" (formerly "viewed vs. swiped away") is the share of feed views that stay past the first seconds. YouTube publishes no target. Paddy Galloway's 2023 sample (5,400 Shorts) found <60% rarely performed and winners clustered at 70–90% ([X thread](https://x.com/PaddyG96/status/1646898368495382528)). Treat 70%+ as the working bar and compare to your channel median.
- **TikTok**: TikTok says completion of longer videos is a stronger signal than weak ones such as location ([newsroom](https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you)). There is no public 2-second or 3-second threshold.
- **Instagram**: the top ranking signals are watch time, likes per reach and sends per reach (Mosseri, Jan 2025). Sends matter more for non-follower reach.


