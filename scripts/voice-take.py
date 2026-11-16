"""voice-take.py - voice a reel as ONE continuous ElevenLabs take (no per-line clips, no tempo change).

    PYTHONIOENCODING=utf-8 .venv/bin/python scripts/voice-take.py <slug> [--model eleven_multilingual_v2] [--tail 2.0]

Replaces voice.py for voices that lose their character when read line by line (Tiff's "Kitty": breathy, sultry,
reads at her own pace). The whole script goes to /with-timestamps in one request with the voice's own saved settings
(override with script voice.settings), and the character timestamps become voice/words.json in the format
timeline.mjs reads. Then run timeline.mjs, sound.py, render.mjs and check.mjs as usual.
Script voice block (Tiff's sultry recipe, matched against the owner's original reel):
  {"provider": "elevenlabs-take", "voice": "oqZQnEg1WK3eXtOOW4x8", "name": "Kitty", "model": "eleven_v4",
   "settings": {"stability": 0.5}, "direction": "sultry, smirking, brisk TikTok storytelling pace"}
plus optional per-beat "direction" tags ("soft, mock-sad", "low, teasing", "amused", "playful").
The take is cached by text + voice + model + settings, so re-running costs nothing unless the script changed.
"""
import argparse
import base64
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.common import die, load_env, log, read_wav_mono, to_wav, video_dir, write_wav_mono  # noqa: E402

SR = 48000


def tts(text: str, voice: str, model: str, settings: dict | None, key: str, lang: str | None = "en") -> dict:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192"
    body = {"text": text, "model_id": model}
    if lang:  # v3 / turbo / flash: lock the language (v2 ignores it; v4 is used as the website sends it, without one)
        body["language_code"] = lang
    if settings:
        body["voice_settings"] = settings
    last = None
    for k in range(4):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read()[:300]!r}"
            if e.code in (400, 401, 403, 422):
                break
        except Exception as e:  # network hiccup: retry
            last = e
        time.sleep(2 * (k + 1))
    raise RuntimeError(f"ElevenLabs take failed: {last}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--model")
    ap.add_argument("--tail", type=float, default=2.0, help="silence after the last word (s), holds the end card")
    a = ap.parse_args()
    vdir = video_dir(a.slug)
    script = json.loads((vdir / "script.json").read_text())
    vcfg = script.get("voice") or {}
    voice = vcfg.get("voice") or die("voice.voice (ElevenLabs voice id) missing")
    model = a.model or vcfg.get("model") or "eleven_multilingual_v2"
    settings = vcfg.get("settings")
    key = load_env().get("ELEVENLABS_API_KEY") or die("ELEVENLABS_API_KEY missing")
    pron = {k.lower(): v for k, v in (script.get("pronounce") or {}).items()}

    # tokens: display text (as captioned), spoken text (respelled), starred = emphasis; char span in the take text
    # v4 direction tags ([sultry, smirking, ...]) go in front of a beat; they are spoken as delivery, never as words
    toks, parts, pos = [], [], 0
    for k, b in enumerate(script["beats"]):
        star = False
        tag = b.get("direction") or (vcfg.get("direction") if k == 0 else None)
        if tag:
            t = ("" if not parts else " ") + f"[{tag}]"
            parts.append(t)
            pos += len(t)
        for raw in b["text"].split():
            opens, closes = raw.startswith("*"), raw.rstrip(".,!?;:…\"'”)").endswith("*")
            emph = star or opens
            if opens and not closes:
                star = True
            if closes:
                star = False
            disp = raw.replace("*", "")
            bare = re.sub(r"^[^\w$]+|[^\w%]+$", "", disp)
            spoken = disp.replace(bare, pron[bare.lower()]) if bare.lower() in pron else disp
            if parts:
                parts.append(" ")
                pos += 1
            toks.append({"beat": b["id"], "text": disp, "spoken": spoken, "emph": emph, "c0": pos, "c1": pos + len(spoken)})
            parts.append(spoken)
            pos += len(spoken)
    text = "".join(parts)

    cache = vdir / "voice" / "cache"
    cache.mkdir(parents=True, exist_ok=True)
    lang = vcfg.get("language", "en") if "language" in vcfg or model in ("eleven_v3", "eleven_turbo_v2_5", "eleven_flash_v2_5") else None
    h = hashlib.sha1(json.dumps([text, voice, model, settings, lang], sort_keys=True).encode()).hexdigest()[:16]
    mp3, alj = cache / f"take11.{h}.mp3", cache / f"take11.{h}.json"
    if mp3.exists() and alj.exists():
        log(f"voice-take: cached take {h}")
        al = json.loads(alj.read_text())
    else:
        log(f"voice-take: {a.slug} -> {vcfg.get('name', voice)} ({model}), {len(text)} chars in one take")
        d = tts(text, voice, model, settings, key, lang)
        mp3.write_bytes(base64.b64decode(d["audio_base64"]))
        al = d.get("alignment") or die("no alignment returned")
        alj.write_text(json.dumps(al))
    starts, ends = al["character_start_times_seconds"], al["character_end_times_seconds"]
    if "".join(al["characters"]) != text:
        log("! alignment text differs from the request; mapping by position")

    tmp = cache / f"take11.{h}.wav"
    to_wav(mp3, tmp, SR)
    _, x = read_wav_mono(tmp)
    x = np.concatenate([x, np.zeros(int(a.tail * SR), dtype=x.dtype)])
    vd = vdir / "voice"
    write_wav_mono(vd / "voice.wav", x, SR)
    dur = len(x) / SR

    n = len(starts)
    words = []
    for i, t in enumerate(toks):
        c0, c1 = min(t["c0"], n - 1), min(max(t["c0"], t["c1"] - 1), n - 1)
        words.append({"i": i, "beat": t["beat"], "text": t["text"], "spoken": t["spoken"].lower(),
                      "start": round(float(starts[c0]), 4), "end": round(float(max(ends[c1], starts[c0] + 0.05)), 4), "emph": t["emph"]})
    beats = []
    ids = [b["id"] for b in script["beats"]]
    for k, b in enumerate(script["beats"]):
        ws = [w for w in words if w["beat"] == b["id"]]
        s = 0.0 if k == 0 else beats[-1]["end"]
        nxt = [w for w in words if w["beat"] == ids[k + 1]] if k + 1 < len(ids) else None
        e = nxt[0]["start"] if nxt else dur
        beats.append({"id": b["id"], "shot": b.get("shot", b["id"]), "start": round(s, 4), "speechEnd": ws[-1]["end"], "end": round(e, 4), "say": " ".join(w["spoken"] for w in ws), "tightenedSec": 0.0})
    speech = words[-1]["end"] - words[0]["start"]
    out = {"version": 2, "sampleRate": SR, "duration": round(dur, 4), "lead": round(words[0]["start"], 4), "provider": "elevenlabs-take",
           "voice": vcfg.get("name", voice), "model": model, "tempo": 1.0, "wpm": round(len(words) / speech * 60, 1), "beats": beats, "words": words}
    (vd / "words.json").write_text(json.dumps(out, indent=1))
    log(f"voice.wav {dur:.2f}s, {len(words)} words, {out['wpm']} wpm (natural pace) -> {vd / 'words.json'}")


if __name__ == "__main__":
    main()
