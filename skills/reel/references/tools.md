<!-- Tools, libraries, what's new. Research compiled 2026-11-13/14 for Nomen Studio (X playbooks study). Numbers are measured or cited; see the sources inside. -->

## 5. Recommended tools and libraries (versions as of 2026-11-13/14)

Versions were read from the npm registry, PyPI and the GitHub API on the snapshot date.

| Layer | Tool | Version (date) | Notes |
|---|---|---|---|
| Video engine (React) | `remotion` + `@remotion/*` | **4.0.543** (2026-11-11) | Agent Skills repo at the same version; Claude Code plugin `remotion-dev/claude-code-plugin` (Jul 2026). License: free for individuals and companies of up to 3 people; Automators $0.01/render ($100/mo minimum); Creators $25/seat/mo |
| Remotion add-ons | `@remotion/three`, `@remotion/captions`, `@remotion/media`, `@remotion/transitions`, `@remotion/motion-blur` (HtmlInCanvasMotionBlur ≥4.0.529), `@remotion/rough-notation` (new Jul 2026), `@remotion/whisper-webgpu` (new Aug 2026), `@remotion/elevenlabs` (new Mar 2026), `@remotion/layout-utils` | 4.0.543 | rough-notation = keyword box/highlight/circle; whisper-webgpu needs a GPU and not Linux arm64; preview HTML-in-canvas blur needs Chrome 149+ with a flag |
| Video engine (HTML) | `hyperframes` (HeyGen) | **0.9.44** (2026-11-14) | Apache-2.0; Node ≥22; `check`/`snapshot --review`/`audio --json`/`transcribe`/`beats`; about 450 registry blocks; Pro adds HeyGen models and `reverse-any-video`/`style-sampling` |
| Zero-dependency route | Single HTML + `seek(t)` + Playwright + ffmpeg | Playwright (py) **1.65.2** | What Opus 5.5 builds by itself. Use subframes for blur and a GPU browser for WebGL |
| 3D | `three` | **0.187.0** (r187, 2026-10-30) | r186 shipped Sep 24 (Florence); pin versions (r160 TextGeometry trap) |
| 3D (React) | `@react-three/fiber` / `@react-three/drei` | **9.8.2** / **10.7.9** | Inside Remotion use `ThreeCanvas` and `useCurrentFrame`, never `useFrame` |
| 3D (offline) | Blender + MPFB add-on + Blender MCP | **Blender 5.3.0** | Headless `blender -b -P`; EEVEE; AgX/Standard view; used by make-short, Theo, Finn |
| Timeline animation | `gsap` | **3.15.1** (2026-11-04) | 100% free including SplitText/MorphSVG/DrawSVG; official `greensock/gsap-skills` (18.4K★) |
| UI animation | `motion` (formerly Framer Motion) | **14.14.0** | No video renderer; for in-app motion only |
| Other 2D engines | Motion Canvas `@motion-canvas/core` **3.17.2** (last npm release Dec 2024; repo active Jul 2026); Revideo `@revideo/core` **0.11.0** (Jul 2026); Manim CE **0.22.1** (2026-10-27) | | Manim for math explainers (skills exist: `iart-ai/manim-skills`, `awesome-skills/manim-skill`) |
| Encode | FFmpeg | **n9.0.2** (stable), 9.1-dev | `loudnorm`, `silencedetect`, `ebur128`, `tmix`, `atempo` |
| TTS (cloud) | ElevenLabs **Eleven v4 / v4 Turbo** (`eleven_v4`, launched 2026-09-28), `eleven_multilingual_v2`; Python SDK `elevenlabs` **2.78.0** | | Audio tags, better IPA; with-timestamps endpoint (character timings); about 1 credit per character; free tier non-commercial. `music_v1` deprecated 2027-01-31 |
| TTS (local) | Kokoro (`kokoro` 0.9.4; `kokoro-onnx` **0.6.1**, Aug 2026) | | Free, fast, 54 voices; no cloning; speed 1.0-1.1 |
| TTS (cloning, permissive) | Qwen3-TTS (Apache-2.0), Chatterbox (`chatterbox-tts` 0.1.7, MIT, Perth watermark; the repo is still active in Nov 2026 although one blog calls it retired) | | Fish Audio S2 Pro weights are reportedly non-commercial per secondary reviews (use its hosted API) |
| Word alignment | `faster-whisper` **1.2.1**; WhisperX **3.8.6**; whisper.cpp **v1.9.5** (2026-10-06); `sherpa-onnx` **2.0.1** (Parakeet); `stable-ts` 2.19.1; `@remotion/whisper-webgpu`; `npx hyperframes transcribe` | | Pass a 16 kHz numpy array to faster-whisper (Theo); large-v3-turbo int8 on CPU (Finn) |
| Audio analysis | `pyloudnorm` 0.2.0; `librosa` **1.0.1** (2026-11-12); numpy | | Beat grid, peaks, LUFS, masking checks |
| QA / vision | Chrome DevTools MCP; Claude in Chrome (watch Studio); a cheap VLM triage (SageCut pattern) | | HyperFrames `check`/`snapshot`; explainroo `check --script`; mromi `short_qa.py` (ideas to port) |
| Motion knowledge skills | `remotion-dev/skills` (7.0K★), `heygen-com/hyperframes` skills, `greensock/gsap-skills`, `LottieFiles/motion-design-skill` (3.0K★), `showheyohtaki/motion-prompt` (2.1K★), `whaleyxbt/claude-motion` (972★) | | Good to vendor ideas from; check licenses |
| Free assets | Kenney CC0 kits (recolour), soundcn, Mixkit/Pixabay SFX and music, Internet Archive (Prelinger films, 78 rpm records), remotion.media SFX list | | Archive.org needs no API key (Elliot Padfield) |
| Publishing | Postiz API (drafts + analytics), Blotato (MCP; `claude mcp add --transport http Blotato https://mcp.blotato.com/mcp`), Upload-Post | | Drafts/private first |
| Attribution | RevenueCat (installs/trials/MRR by post time) | | The Larry loop |
| Skills CLI | `npx skills` (vercel-labs) **1.8.1** | | `npx skills add <repo>`; `npx remotion skills add` |
| Agents/models | Claude Opus 5.5 (2026-09-22; medium effort by default); Claude Fable 5.2 (followed the caption spec better in Theo's single test); GPT-6 Astra in Codex (Nate Herk); OpenCode with the free GLM-5.3-Flash (kelano86 ran a full episode on it for $0 model cost) | | Effort policy per stage |

---

## 6. What is surprising or new since mid-2026

1. **The Opus 5.5 motion wave (from Sep 22, 2026).** Within days the feed filled with code-rendered films:
   - showreels: @stephanlivera 2.32M views; @shneural 1.91M;
   - a launch-day animation by @devteamdrew: 1.85M;
   - a design studio's launch video in 3 prompts (@uxmiles): 1.81M;
   - a 3D browser world (@xikhar): 1.85M;
   - Donald's music video (@donaldjewkes): 4.06M views, about a 9,500-character dictated brief plus 12 hours of unattended work.

   Thariq (Claude Code team) publicly noted the gap between "one-shot" captions and the 10k-character prompts behind them. Honest "receipts" posts became a genre (Florence, @mablesjoseph, make-short).
2. **Anthropic shipped first-party motion.**
   - **Claude Motion** (Oct 8, 2026): beta for Team/Enterprise only, code-animated, MP4 export, no video model and no realistic people. Partners named for hand-off: Adobe, Descript, HeyGen, Higgsfield, invideo, Luma AI, Runway.
   - **Claude Design** (Apr 17, 2026) moved into Claude in October; the standalone site closes Dec 14 (per @mistm1st).
   - Consequence: individual users (Pro/Max) still need Claude Code + Remotion/HyperFrames. Third parties already sell "Claude Motion on any plan" (MotionKit, from $4.99).
3. **HyperFrames overtook Remotion on GitHub stars** (84K vs 73K) within about 8 months of release. It brings a Studio app, a Pro tier with HeyGen models, `reverse-any-video` and `style-sampling`, frame.md design systems, and the most detailed built-in review rules. In the awesome-list bake-off, though, it was the slowest (23.5 min against 4.4 min for no skill).
4. **Remotion turned agent-first:**
   - Agent Skills (Jan 20 launch: 18.9M views, 38K bookmarks, the trend's ignition point);
   - a Claude Code plugin (Jul 2026);
   - WebMCP support in Studio;
   - rough-notation (Jul 2026), whisper-webgpu (Aug 2026), an ElevenLabs package (Mar 2026), HTML-in-canvas motion blur (≥4.0.529);
