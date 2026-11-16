#!/usr/bin/env python3
"""voice.py - script.json -> voice.wav + words.json with word-exact timings.

    .venv/Scripts/python scripts/voice.py <slug> [--provider auto|elevenlabs|openai|edge] [--voice NAME]
                                          [--tempo 1.08] [--wpm 170] [--verify] [--force]

Pipeline per beat (one sentence or two short ones):
  display text -> normalised spoken text -> TTS (cached, retried) -> 48 kHz mono -> trim edges ->
  tighten long internal pauses -> tempo (pitch-preserving, rubberband) -> forced alignment of the exact
  spoken words -> beats laid end to end with designed gaps -> voice.wav + words.json.
Captions use the display text, never speech recognition, so they cannot carry transcription mistakes.
--verify transcribes the finished voice and fails if it does not match the script (skipped/garbled words).
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.common import (PUBLIC, STUDIO, die, find_align_python, load_env, log, read_json, read_wav_mono, run,
                        sha, to_wav, video_dir, write_json, write_wav_mono, ffmpeg_bin)
from lib.textnorm import Token, normalize_sentence, tts_text

SR = 48000
DEFAULT_VOICES = {
    "edge": "en-US-AndrewMultilingualNeural",
    "edge-wb": "en-US-ChristopherNeural",          # word-boundary capable fallback (no aligner available)
    "elevenlabs": "nPczCjzI2devNBz1zQrb",           # "Brian" - deep, confident narrator
    "openai": "ash",
}
ELEVEN_MODEL = "eleven_multilingual_v2"
OPENAI_MODEL = "gpt-4o-mini-tts"


# ----------------------------------------------------------------------------------------------------------- TTS
def tts_edge(text: str, voice: str, out_mp3: Path, want_words: bool = False, tries: int = 10, rate: str = "+0%", pitch: str = "+0Hz"):
    import edge_tts

    async def go():
        last = None
        for k in range(tries):
            try:
                kw = {"boundary": "WordBoundary"} if want_words else {}
                if rate and rate != "+0%":
                    kw["rate"] = rate
                if pitch and pitch != "+0Hz":
                    kw["pitch"] = pitch
                c = edge_tts.Communicate(text, voice, **kw)
                audio = bytearray()
                words = []
                async for ch in c.stream():
                    if ch["type"] == "audio":
                        audio += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        words.append({"text": ch["text"], "start": ch["offset"] / 1e7, "end": (ch["offset"] + ch["duration"]) / 1e7})
                if len(audio) < 2000:
                    raise RuntimeError("empty audio")
                out_mp3.write_bytes(bytes(audio))
                return words
            except Exception as e:  # the free endpoint fails intermittently; back off and retry
                last = e
                await asyncio.sleep(min(8.0, 0.7 * (k + 1)))
        raise RuntimeError(f"edge-tts failed after {tries} tries: {last}")

    return asyncio.run(go())


def tts_elevenlabs(text: str, voice: str, key: str, out_mp3: Path, settings: dict | None = None, model: str | None = None):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192"
    body = {"text": text, "model_id": model or ELEVEN_MODEL,
            "voice_settings": settings or {"stability": 0.42, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.06}}
    last = None
    for k in range(5):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.loads(r.read())
            out_mp3.write_bytes(base64.b64decode(d["audio_base64"]))
            return d.get("alignment")
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read()[:300]!r}"
            if e.code in (400, 401, 403, 422):
                break
        except Exception as e:
            last = e
        time.sleep(1.5 * (k + 1))
    raise RuntimeError(f"ElevenLabs failed: {last}")


def tts_openai(text: str, voice: str, key: str, out_mp3: Path, instructions: str | None = None):
    body = {"model": OPENAI_MODEL, "voice": voice, "input": text, "response_format": "mp3",
            "instructions": instructions or "Energetic, confident short-form narrator. Clear, fast but natural pace, punchy emphasis on numbers."}
    last = None
    for k in range(5):
        try:
            req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=json.dumps(body).encode(),
                                         headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                out_mp3.write_bytes(r.read())
            return None
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read()[:300]!r}"
            if e.code in (400, 401, 403):
                break
        except Exception as e:
            last = e
        time.sleep(1.5 * (k + 1))
    raise RuntimeError(f"OpenAI TTS failed: {last}")


# --------------------------------------------------------------------------------------------------- audio edits
def envelope(x: np.ndarray, sr: int, win_s: float = 0.010) -> np.ndarray:
    w = max(1, int(win_s * sr))
    p = np.convolve(x.astype(np.float64) ** 2, np.ones(w) / w, mode="same")
    return np.sqrt(np.maximum(p, 0))


def trim_edges(x: np.ndarray, sr: int, lead: float = 0.025, tail: float = 0.08) -> np.ndarray:
    env = envelope(x, sr)
    thr = max(10 ** (-48 / 20), env.max() * 10 ** (-38 / 20))
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    s = max(0, idx[0] - int(lead * sr))
    e = min(len(x), idx[-1] + int(tail * sr))
    y = x[s:e].copy()
    f = int(0.004 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


def tighten(x: np.ndarray, sr: int, max_pause: float = 0.30, keep: float = 0.20) -> tuple[np.ndarray, float]:
    """Shorten internal silences longer than max_pause to `keep` seconds (MotionLab-style 'silences cut')."""
    env = envelope(x, sr, 0.015)
    thr = max(10 ** (-46 / 20), env.max() * 10 ** (-34 / 20))
    quiet = env < thr
    out, i, n, removed = [], 0, len(x), 0.0
    xf = int(0.008 * sr)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            L = (j - i) / sr
            if L > max_pause and i > 0 and j < n:
                k = int(keep * sr)
                a, b = x[i:i + k // 2], x[j - k // 2:j]
                seg = np.concatenate([a, b])
                if len(a) > xf and len(b) > xf:  # tiny crossfade at the splice
                    seg[len(a) - xf:len(a)] *= np.linspace(1, 0, xf)
                    seg[len(a):len(a) + xf] *= np.linspace(0, 1, xf)
                out.append(seg)
                removed += L - keep
            else:
                out.append(x[i:j])
            i = j
        else:
            j = i
            while j < n and not quiet[j]:
                j += 1
            out.append(x[i:j])
            i = j
    return np.concatenate(out) if out else x, removed


def apply_tempo(src: Path, dst: Path, tempo: float):
    if abs(tempo - 1.0) < 0.005:
        dst.write_bytes(src.read_bytes())
        return
    try:
        run([ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-af",
             f"rubberband=tempo={tempo:.4f}:pitchq=quality:transients=crisp:formant=preserved", "-ar", str(SR), "-ac", "1", str(dst)])
    except RuntimeError:
        run([ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-af", f"atempo={tempo:.4f}",
             "-ar", str(SR), "-ac", "1", str(dst)])


# ------------------------------------------------------------------------------------------------- word timings
def syllables(w: str) -> int:
    w = re.sub(r"[^a-z]", "", w.lower())
    if not w:
        return 1
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups) - (1 if w.endswith("e") and len(groups) > 1 else 0)
    return max(1, n)


def proportional(tokens: list[Token], dur: float, lead: float = 0.03, tail: float = 0.06):
    weights = [sum(syllables(a) for a in t.align) if t.align else 0 for t in tokens]
    tot = sum(weights) or 1
    span = max(0.1, dur - lead - tail)
    t, out = lead, []
    for wgt in weights:
        d = span * wgt / tot
        out.append([t, t + d] if wgt else None)
        t += d
    return out


def token_times(tokens: list[Token], word_times: list, dur: float):
    """Collapse per-align-word times into one [start, end] per display token; interpolate gaps."""
    res, k = [], 0
    for t in tokens:
        n = len(t.align)
        ws = [w for w in word_times[k:k + n] if w] if n else []
        k += n
        res.append([ws[0][0], ws[-1][1]] if ws else None)
    # fill holes from neighbours (proportional inside the gap)
    known = [i for i, r in enumerate(res) if r]
    if not known:
        return proportional(tokens, dur)
    prop = proportional(tokens, dur)
    for i, r in enumerate(res):
        if r is None and tokens[i].align:
            prev = max([j for j in known if j < i], default=None)
            nxt = min([j for j in known if j > i], default=None)
            a = res[prev][1] if prev is not None else 0.02
            b = res[nxt][0] if nxt is not None else dur - 0.05
            if b <= a:
                b = a + 0.12
            gap_tokens = [j for j in range(prev + 1 if prev is not None else 0, nxt if nxt is not None else len(res)) if tokens[j].align]
            pos = gap_tokens.index(i)
            step = (b - a) / max(1, len(gap_tokens))
            res[i] = [a + pos * step, a + (pos + 1) * step]
        elif r is None:
            res[i] = None
    # monotonic + minimum length guard
    last = 0.0
    for i, r in enumerate(res):
        if r is None:
            continue
        s, e = max(r[0], last), max(r[1], r[0] + 0.06)
        res[i] = [round(s, 4), round(e, 4)]
        last = s
    _ = prop
    return res


# ------------------------------------------------------------------------------------- full-narration take
TAKE_NAMES = ("take.wav", "take.mp3", "take.m4a", "take.flac")


def find_take(vdir: Path) -> Path | None:
    for n in TAKE_NAMES:
        p = vdir / "voice" / n
        if p.exists():
            return p
    return None


def take_prompt(script: dict) -> str:
    """The text to hand to a narration voice (ElevenLabs connector) for one full take: one beat per line.

    Display text as written (v3/v4 voices read digits and currency correctly), stars removed, optional
    `voice.direction` / per-beat `direction` audio tags in [brackets], `voice.ipa` replacements for hard names.
    """
    vcfg = script.get("voice", {}) or {}
    ipa = vcfg.get("ipa", {}) or {}
    lines = []
    for i, b in enumerate(script["beats"]):
        t = b.get("takeText") or b["text"].replace("*", "")
        for word, rep in ipa.items():
            t = re.sub(rf"\b{re.escape(word)}\b", rep, t)
        tag = b.get("direction") or (vcfg.get("direction") if i == 0 else None)
        lines.append((f"[{tag}] " if tag else "") + t.strip())
    return "\n".join(lines)


def split_take(take: Path, specs: list[dict], cache: Path, lang: str, align_py: str | None):
    """Cut one full-narration recording into one raw clip per beat (written to each spec's raw_wav).

    The whole take is force-aligned against the exact script words; each cut lands on the quietest point
    of the pause between two beats, so no word is clipped and the usual per-beat pipeline can re-space them.
    """
    if not align_py:
        die("a full-narration take needs the WhisperX aligner (install the watch plugin or set NOMEN_ALIGN_PYTHON)")
    thash = sha(take.read_bytes().hex()[:200000], take.stat().st_size)
    full, full16 = cache / f"take.{thash}.wav", cache / f"take.{thash}.16k.wav"
    if not full.exists():
        to_wav(take, full, SR)
        to_wav(take, full16, 16000)
    sr, x = read_wav_mono(full)
    words, owner = [], []
    for k, s in enumerate(specs):
        for t in s["tokens"]:
            for w in t.align:
                words.append(w)
                owner.append(k)
    jp, op = cache / "take_job.json", cache / "take_out.json"
    write_json(jp, {"language": lang, "items": [{"id": "take", "wav": str(full16), "words": words}]})
    log(f"  aligning the full take ({len(x) / sr:.1f}s, {len(words)} words) ...")
    r = run([align_py, str(STUDIO / "scripts" / "align_words.py"), str(jp), str(op)], check=False)
    if r.returncode != 0:
        log(r.stdout[-1500:])
        log(r.stderr[-1500:])
        die("take alignment failed")
    wt = read_json(op)["items"].get("take", [])
    found = sum(1 for w in wt if w)
    if found < 0.9 * len(words):
        die(f"only {found}/{len(words)} script words were found in the take: it does not say the script. Re-record it.")
    spans = []
    for k, s in enumerate(specs):
        ts = [wt[i] for i in range(len(words)) if owner[i] == k and wt[i]]
        if not ts:
            die(f"beat {s['beat']['id']} was not found in the take (\"{s['beat']['text'][:50]}\"). Re-record it.")
        spans.append([ts[0][0], ts[-1][1]])
    for k in range(1, len(spans)):
        if spans[k][0] < spans[k - 1][1] - 0.05:
            die(f"take alignment is out of order around beat {specs[k]['beat']['id']}. Re-record the take.")
    env = envelope(x, sr, 0.020)
    cuts = [max(0, int((spans[0][0] - 0.20) * sr))]
    for k in range(len(spans) - 1):
        a, b = int(spans[k][1] * sr), int(spans[k + 1][0] * sr)
        if b - a < int(0.03 * sr):
            log(f"  ! no pause between {specs[k]['beat']['id']} and {specs[k + 1]['beat']['id']} in the take (run-on): check that seam by ear")
            cuts.append((a + b) // 2)
        else:
            cuts.append(a + int(np.argmin(env[a:b])))
    cuts.append(min(len(x), int((spans[-1][1] + 0.45) * sr)))
    for k, s in enumerate(specs):
        seg = x[cuts[k]:cuts[k + 1]].copy()
        f = min(len(seg) // 4, int(0.003 * sr))
        if f > 0:
            seg[:f] *= np.linspace(0, 1, f)
            seg[-f:] *= np.linspace(1, 0, f)
        write_wav_mono(s["raw_wav"], seg, SR)
        write_json(s["meta_p"], {"say": s["say"], "native": {"kind": "take", "span": [round(cuts[k] / sr, 4), round(cuts[k + 1] / sr, 4)]}})
    low = [words[i] for i, w in enumerate(wt) if w and w[2] < 0.25]
    if low:
        log(f"  ! {len(low)} low-confidence words in the take: {', '.join(low[:12])}")
    log(f"  take split into {len(specs)} beats")
    return thash


# --------------------------------------------------------------------------------------------------------- main
def resolve_provider(want: str, env: dict, vdir: Path | None = None) -> str:
    if want != "auto":
        return want
    if vdir is not None and find_take(vdir):
        return "take"
    if env.get("ELEVENLABS_API_KEY"):
        return "elevenlabs"
    if env.get("OPENAI_API_KEY") and env.get("NOMEN_USE_OPENAI_TTS"):
        return "openai"
    return "edge"


def gap_after(beat: dict, nxt: dict | None) -> float:
    if "pause" in beat:
        return float(beat["pause"])
    if nxt is None:
        return 0.0
    txt = beat.get("text", "").strip()
    if beat.get("role") == "hook" or txt.endswith("?"):
        return 0.22
    if nxt.get("shot") != beat.get("shot"):
        return 0.16
    if txt.endswith((".", "!", "…")):
        return 0.12
    return 0.06


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--provider", default=None)
    ap.add_argument("--voice", default=None)
    ap.add_argument("--tempo", type=float, default=None)
    ap.add_argument("--wpm", type=float, default=None, help="target words per minute (auto tempo)")
    ap.add_argument("--verify", action="store_true", help="transcribe the result and compare with the script")
    ap.add_argument("--force", action="store_true", help="ignore the TTS cache")
    ap.add_argument("--lead", type=float, default=0.06, help="silence before the first word (s)")
    ap.add_argument("--tail", type=float, default=0.7, help="silence after the last word (s)")
    ap.add_argument("--take-text", action="store_true", help="print the full-narration text for a voice take and exit")
    a = ap.parse_args()

    vdir = video_dir(a.slug)
    script = read_json(vdir / "script.json")
    if a.take_text:
        sys.stdout.buffer.write((take_prompt(script) + "\n").encode("utf-8"))
        return
    env = load_env()
    vcfg = script.get("voice", {}) or {}
    provider = resolve_provider(a.provider or vcfg.get("provider", "auto"), env, vdir)
    align_py = find_align_python(env)
    take = find_take(vdir) if provider == "take" else None
    if provider == "take" and not take:
        die(f"voice.provider is 'take' but there is no {vdir / 'voice' / 'take.mp3'} (record one from: voice.py {a.slug} --take-text)")
    if provider == "edge" and not align_py:
        log("! no whisperx aligner found: using a word-boundary voice for timings (install the watch plugin's WhisperX or set NOMEN_ALIGN_PYTHON)")
    voice = a.voice or vcfg.get("voice") or (DEFAULT_VOICES["edge-wb"] if provider == "edge" and not align_py else DEFAULT_VOICES.get(provider, provider))
    if provider == "elevenlabs" and not env.get("ELEVENLABS_API_KEY"):
        die("ELEVENLABS_API_KEY missing")
    if provider == "openai" and not env.get("OPENAI_API_KEY"):
        die("OPENAI_API_KEY missing")
    lang = script.get("language", "en")
    pron = script.get("pronounce", {})
    beats = script["beats"]
    cache = vdir / "voice" / "cache"
    cache.mkdir(parents=True, exist_ok=True)
    log(f"voice: provider={provider} voice={voice} beats={len(beats)} aligner={'whisperx' if align_py else 'none'}")

    # 1. synthesise + clean every beat
    take_id = ""
    if take:
        # a full take says the words as written, so respellings are not applied to the alignment words
        take_id = sha(take.read_bytes().hex()[:200000], take.stat().st_size)
        specs = []
        for b in beats:
            tokens = normalize_sentence(b["text"], None)
            say = tts_text(tokens)
            key = sha("take", take_id, b["id"], say, lang, "t1")
            specs.append({"beat": b, "tokens": tokens, "say": say, "raw_wav": cache / f"{key}.raw.wav", "meta_p": cache / f"{key}.json"})
        if a.force or not all(s["raw_wav"].exists() for s in specs):
            split_take(take, specs, cache, lang, align_py)
    clips = []
    cast = vcfg.get("cast", {}) or {}
    for b in beats:
        tokens = normalize_sentence(b["text"], None if take else pron)
        say = tts_text(tokens) if take else (b.get("say") or tts_text(tokens))
        # dialogue: a beat with "speaker" uses that cast member's voice (voice.cast.<speaker>.voice/rate/pitch/settings)
        spk = b.get("speaker")
        if spk and not take and spk not in cast and spk != "narrator":
            die(f"beat {b['id']}: speaker '{spk}' is not in voice.cast ({', '.join(cast) or 'empty'})")
        sv = cast.get(spk, {}) if spk and not take else {}
        b_voice = sv.get("voice", voice)
        edge_rate = sv.get("rate", vcfg.get("rate", "+8%"))
        edge_pitch = sv.get("pitch", vcfg.get("pitch", "+0Hz"))
        b_settings = sv.get("settings", vcfg.get("settings"))
        key = (sha("take", take_id, b["id"], say, lang, "t1") if take else
               sha(provider, b_voice, say, b_settings, vcfg.get("model"), lang, edge_rate if provider == "edge" else "", "v3")
               + ("" if edge_pitch in ("", "+0Hz") or provider != "edge" else sha(edge_pitch)[:6]))
        raw_wav = cache / f"{key}.raw.wav"
        meta_p = cache / f"{key}.json"
        if take and not raw_wav.exists():
            die(f"take clip for {b['id']} is missing; re-run with --force")
        if not take and (a.force or not raw_wav.exists()):
            mp3 = cache / f"{key}.mp3"
            native = None
            if provider == "edge":
                wb = tts_edge(say, b_voice, mp3, want_words=not align_py, rate=edge_rate, pitch=edge_pitch)
                native = {"kind": "edge-wb", "words": wb} if wb else None
            elif provider == "elevenlabs":
                native = {"kind": "eleven", "alignment": tts_elevenlabs(say, b_voice, env["ELEVENLABS_API_KEY"], mp3, b_settings, vcfg.get("model"))}
            elif provider == "openai":
                tts_openai(say, b_voice, env["OPENAI_API_KEY"], mp3, sv.get("instructions", vcfg.get("instructions")))
            to_wav(mp3, raw_wav, SR)
            write_json(meta_p, {"say": say, "native": native})
            log(f"  tts {b['id']}{' [' + spk + ']' if spk else ''}: {say[:70]}")
        sr, x = read_wav_mono(raw_wav)
        x = trim_edges(x, sr)
        x, removed = tighten(x, sr, max_pause=vcfg.get("maxPause", 0.30), keep=vcfg.get("keepPause", 0.18))
        clips.append({"beat": b, "tokens": tokens, "say": say, "key": key, "x": x, "removed": removed,
                      "meta": read_json(meta_p) if meta_p.exists() else {}})

    # 2. tempo from target words-per-minute (pitch preserved)
    n_words = sum(1 for c in clips for t in c["tokens"] if t.align)
    speech = sum(len(c["x"]) for c in clips) / SR
    gaps = sum(gap_after(c["beat"], clips[i + 1]["beat"] if i + 1 < len(clips) else None) for i, c in enumerate(clips))
    wpm_now = 60 * n_words / max(1e-6, speech + gaps)
    target = a.wpm or vcfg.get("wpm") or script.get("wpm") or 172
    tempo = a.tempo or vcfg.get("tempo") or float(np.clip(target / wpm_now, 1.0, 1.25))
    log(f"  natural pace {wpm_now:.0f} wpm -> tempo x{tempo:.3f} (target {target:.0f} wpm)")
    for c in clips:
        pre = cache / f"{c['key']}.trim.wav"
        post = cache / f"{c['key']}.t{tempo:.3f}.wav"
        write_wav_mono(pre, c["x"], SR)
        apply_tempo(pre, post, tempo)
        _, c["x"] = read_wav_mono(post)
        c["wav"] = post
        a16 = cache / f"{c['key']}.t{tempo:.3f}.16k.wav"
        if not a16.exists():
            to_wav(post, a16, 16000)
        c["wav16"] = a16

    # 3. word timings: forced alignment of the exact spoken words
    if align_py:
        job, todo = {"language": lang, "items": []}, []
        for c in clips:
            words = [w for t in c["tokens"] for w in t.align]
            akey = sha(c["key"], tempo, words, "al2")
            c["akey"] = akey
            ap_ = cache / f"{akey}.align.json"
            if ap_.exists() and not a.force:
                c["wt"] = read_json(ap_)
            else:
                job["items"].append({"id": akey, "wav": str(c["wav16"]), "words": words})
                todo.append(c)
        if todo:
            jp, op = cache / "align_job.json", cache / "align_out.json"
            write_json(jp, job)
            log(f"  aligning {len(todo)} clips with whisperx ...")
            r = run([align_py, str(STUDIO / "scripts" / "align_words.py"), str(jp), str(op)], check=False)
            if r.returncode != 0:
                log(r.stdout[-1500:])
                log(r.stderr[-1500:])
                die("alignment failed")
            res = read_json(op)["items"]
            for c in todo:
                c["wt"] = res.get(c["akey"], [])
                write_json(cache / f"{c['akey']}.align.json", c["wt"])
    for c in clips:
        dur = len(c["x"]) / SR
        if align_py:
            c["times"] = token_times(c["tokens"], c.get("wt", []), dur)
        else:
            nat = (c["meta"] or {}).get("native") or {}
            wt = None
            if nat.get("kind") == "edge-wb" and nat.get("words"):
                # spread each boundary (may span several align words) over its words; edges shift by the trim
                flat = []
                for w in nat["words"]:
                    n = max(1, len(re.findall(r"\S+", w["text"])))
                    for k in range(n):
                        s = w["start"] + (w["end"] - w["start"]) * k / n
                        flat.append([s / tempo, (s + (w["end"] - w["start"]) / n) / tempo, 1.0])
                wt = flat
            c["times"] = token_times(c["tokens"], wt or [], dur) if wt else proportional(c["tokens"], dur)
        bad = sum(1 for t, r in zip(c["tokens"], c["times"]) if t.align and r is None)
        if bad:
            log(f"  ! {c['beat']['id']}: {bad} words without timing (interpolated)")

    # 4. assemble
    pieces, words_out, beats_out = [], [], []
    t = a.lead
    pieces.append(np.zeros(int(a.lead * SR), dtype=np.float32))
    wi = 0
    for i, c in enumerate(clips):
        b = c["beat"]
        dur = len(c["x"]) / SR
        start = t
        pieces.append(c["x"].astype(np.float32))
        for tok, r in zip(c["tokens"], c["times"]):
            if not tok.align or r is None:
                continue
            words_out.append({"i": wi, "beat": b["id"], "text": tok.display, "spoken": " ".join(tok.align),
                              "start": round(start + r[0], 4), "end": round(start + r[1], 4), "emph": tok.emph})
            wi += 1
        t += dur
        g = gap_after(b, clips[i + 1]["beat"] if i + 1 < len(clips) else None)
        beats_out.append({"id": b["id"], "shot": b.get("shot", b["id"]), "start": round(start, 4), "speechEnd": round(t, 4),
                          "end": round(t + g, 4), "say": c["say"], "tightenedSec": round(c["removed"], 3)})
        if g > 0:
            pieces.append(np.zeros(int(g * SR), dtype=np.float32))
            t += g
    pieces.append(np.zeros(int(a.tail * SR), dtype=np.float32))
    y = np.concatenate(pieces)
    peak = float(np.max(np.abs(y))) or 1.0
    y = y * (10 ** (-1.0 / 20) / peak)  # peak-normalise to -1 dBFS (sound.py sets loudness)
    out_dir = vdir / "voice"
    write_wav_mono(out_dir / "voice.wav", y, SR)
    (PUBLIC / a.slug).mkdir(parents=True, exist_ok=True)
    total = len(y) / SR
    wpm = 60 * len(words_out) / max(1e-6, (words_out[-1]["end"] - words_out[0]["start"]) if words_out else 1)
    write_json(out_dir / "words.json", {"version": 2, "sampleRate": SR, "duration": round(total, 4), "lead": a.lead,
                                         "provider": provider, "voice": voice, "tempo": round(tempo, 4), "wpm": round(wpm, 1),
                                         "beats": beats_out, "words": words_out})
    log(f"voice.wav {total:.2f}s, {len(words_out)} words, {wpm:.0f} wpm -> {out_dir / 'words.json'}")

    # 5. verify against the script (catches skipped / garbled words)
    if a.verify:
        if not align_py:
            log("! --verify needs whisperx; skipped")
            return
        v16 = out_dir / "voice.16k.wav"
        to_wav(out_dir / "voice.wav", v16, 16000)
        jp, op = cache / "asr_job.json", cache / "asr_out.json"
        write_json(jp, {"language": lang, "items": [], "transcribe": [{"id": "full", "wav": str(v16)}]})
        r = run([align_py, str(STUDIO / "scripts" / "align_words.py"), str(jp), str(op)], check=False)
        if r.returncode != 0:
            die("ASR check failed to run:\n" + r.stderr[-800:])
        heard = read_json(op)["transcripts"].get("full", "")
        pr_keys = {k.lower() for k in pron}
        ref = []
        for c in clips:
            for t in normalize_sentence(c["beat"]["text"], spell_acronyms=False):
                core = re.sub(r"[^\w]", "", t.display.lower())
                if core in pr_keys:
                    ref.append("*")  # respelled for the voice: any heard word is fine
                else:
                    ref.extend(t.align)
        hyp = [w for w in re.split(r"[\s\-]+", normalize_for_wer(heard)) if w]
        wer, diffs = word_error(ref, hyp)
        write_json(out_dir / "voice-check.json", {"wer": wer, "heard": heard, "diffs": diffs[:60]})
        log(f"ASR check: WER {wer * 100:.1f}% ({len(diffs)} differences)")
        for d in diffs[:12]:
            log(f"   {d}")
        if wer > 0.12:
            die("the voice does not match the script closely enough - listen to voice.wav and fix pronunciations (script.pronounce) or re-run with --force")


def normalize_for_wer(s: str) -> str:
    toks = normalize_sentence(s, spell_acronyms=False)
    return " ".join(w for t in toks for w in t.align)


def word_error(ref: list[str], hyp: list[str]):
    """Levenshtein over words; returns (wer, list of human-readable differences)."""
    n, m = len(ref), len(hyp)
    d = np.zeros((n + 1, m + 1), dtype=np.int32)
    d[:, 0] = np.arange(n + 1)
    d[0, :] = np.arange(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            c = 0 if ref[i - 1] == hyp[j - 1] or _soft_eq(ref[i - 1], hyp[j - 1]) else 1
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + c)
    i, j, diffs = n, m, []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and d[i, j] == d[i - 1, j - 1] + (0 if ref[i - 1] == hyp[j - 1] or _soft_eq(ref[i - 1], hyp[j - 1]) else 1):
            if not (ref[i - 1] == hyp[j - 1] or _soft_eq(ref[i - 1], hyp[j - 1])):
                diffs.append(f"said '{hyp[j - 1]}' for '{ref[i - 1]}' (word {i})")
            i, j = i - 1, j - 1
        elif i > 0 and d[i, j] == d[i - 1, j] + 1:
            diffs.append(f"missing '{ref[i - 1]}' (word {i})")
            i -= 1
        else:
            diffs.append(f"extra '{hyp[j - 1]}'")
            j -= 1
    diffs.reverse()
    return (d[n, m] / max(1, n)), diffs


ORD = {"first": "one", "second": "two", "third": "three", "fifth": "five", "eighth": "eight", "ninth": "nine", "twelfth": "twelve"}


def _card(w: str) -> str:
    if w in ORD:
        return ORD[w]
    if w.endswith("ieth"):
        return w[:-4] + "y"
    if w.endswith("th") and len(w) > 4:
        return w[:-2]
    return w


def _soft_eq(a: str, b: str) -> bool:
    if a == "*" or b == "*":
        return True
    if a.rstrip("s") == b.rstrip("s") or _card(a) == _card(b):
        return True
    import difflib
    return len(a) > 4 and difflib.SequenceMatcher(None, a, b).ratio() >= 0.8


if __name__ == "__main__":
    main()
