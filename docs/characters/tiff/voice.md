# Tiff's voice

Tiff is voiced by the owner's ElevenLabs voice **Kitty - Sweet, Sultry, Sexy and Playful** (`oqZQnEg1WK3eXtOOW4x8`),
read with the **sultry v4 recipe**. The recipe was recovered on 2026-11-16 from the owner's ElevenLabs history: it is
the Flows generation behind `final videos/tiff-nnn-sultry.mp4`, the reference reel the owner approved. A regenerated
take scored as close to it as the owner's own second take of the same prompt.

## The recipe

| Setting | Value |
|---|---|
| Model | `eleven_v4`. This gives the slightly raspy, breathy texture; v2, v3 and Turbo sound smoother and are wrong for Tiff. |
| Stability | `0.5`. Set nothing else; the voice's saved style and similarity are not sent. |
| Reading | One continuous take of the whole script. Never one clip per line, which loses the flow. |
| Speed | Natural. No `speed` setting and no time-stretch (about 135-156 wpm). |
| Opening tag | `[sultry, smirking, brisk TikTok storytelling pace]` |
| Mood tags | On some lines, as the reference did: `[soft, mock-sad]` on the sad beats, `[low, teasing]` on the setups, `[amused]` on the twists, `[playful]` on the pileGo line. |
| Language code | None. With v2 at stability 0.25 the voice drifted into a French accent; v4 without a language code stays American. |

## In a script

```json
"voice": {
  "provider": "elevenlabs-take",
  "voice": "oqZQnEg1WK3eXtOOW4x8",
  "name": "Kitty",
  "model": "eleven_v4",
  "settings": {"stability": 0.5},
  "direction": "sultry, smirking, brisk TikTok storytelling pace"
}
```

Optional per beat: `"direction": "soft, mock-sad"`. These are delivery tags: they are never spoken or captioned.

## Build

```bash
PYTHONIOENCODING=utf-8 .venv/bin/python scripts/voice-take.py <slug>   # one take + word timings (replaces voice.py)
node scripts/timeline.mjs <slug>
PYTHONIOENCODING=utf-8 .venv/bin/python scripts/sound.py <slug>
node scripts/render.mjs <slug>
node scripts/check.mjs <slug>
```

- The key lives in `~/.config/nomen-studio/.env` as `ELEVENLABS_API_KEY`.
- The take is cached by text, voice, model, settings and tags. Moving a caption `*star*` doesn't re-bill; changing words does.
- At v4's pace a 25-40 s reel holds about 65-100 words.
- If `sound.py` reports a masked word, it is usually a soft, tagged line ending on a starred word, which triggers the
  music sting. Move the star to an earlier word, or set `"music": {"gain": -3}`.
