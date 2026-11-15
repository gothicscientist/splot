#!/usr/bin/env python3
"""sound.py - the score, the foley and the voice, mixed and mastered on the timeline's clock.

    .venv/Scripts/python scripts/sound.py <slug> [--mood heist] [--no-music] [--verify]

Reads videos/<slug>/script.json (mood, per-beat "sfx" cues, "ambience") and src/videos/<slug>/timeline.json (frames).
Writes public/v/<slug>/mix.wav (48 kHz stereo, -14 LUFS, <= -1.5 dBTP) + videos/<slug>/audio/stems/*.wav, and sets
timeline.audio.hasMix so the composition plays the mix.

Rules baked in (measured on viral shorts): the SFX peak lands ~1 frame after its picture; 4-10 noticeable SFX per
minute on structural beats (not every cut); music ~14-20 dB under the voice and ducked a further ~8 dB while words
are spoken; one sound identity per video (key, tempo, instrument) chosen by mood.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "audio"))
from lib.common import PUBLIC, SRC_VIDEOS, die, log, read_json, video_dir, write_json  # noqa: E402

import synth as S  # noqa: E402
import sfx_extra  # noqa: E402,F401  (registers the extra SFX)

# ------------------------------------------------------------------------------------------- sound identities
IDENTITIES = {
    # case file / heist / scam: tense minor pulse on plucks, low strings, a soft taiko heartbeat
    "heist": {"bpm": 100, "prog": [["Am", "F", "C", "G"], ["Dm", "Am", "E", "Am"]], "style": "pulse", "inst": "pluck",
              "drum": ("taiko", [1, 0, 0, 0, 0.6, 0, 0, 0], 0.16), "pad": 0.38, "strings": True},
    "mystery": {"bpm": 86, "prog": [["Dm", "Bb", "Gm", "A"]], "style": "arp", "inst": "bell", "drum": None, "pad": 0.45, "strings": False},
    # what if / wonder: bright bell arpeggios
    "wonder": {"bpm": 108, "prog": [["C", "G", "Am", "F"], ["F", "C", "G", "C"]], "style": "arp", "inst": "bell",
               "drum": ("tick", [1, 0, 0.5, 0], 0.1), "pad": 0.35, "strings": False},
    # how it works / how it's made: the curious marimba ostinato (Nomen WORKSHOP identity)
    "workshop": {"bpm": 118, "prog": [["F", "C", "Dm", "Bb"], ["Dm", "Bb", "F", "C"]], "style": "ostinato", "inst": "piano",
                 "drum": ("taiko", [1, 0, 0.55, 0], 0.12), "pad": 0.42, "strings": False},
    # history / war: driving low strings + taiko
    "epic": {"bpm": 92, "prog": [["Dm", "Bb", "F", "C"], ["Gm", "Dm", "A", "Dm"]], "style": "strings", "inst": "piano",
             "drum": ("taiko", [1, 0, 0, 0.5, 1, 0, 0.4, 0], 0.22), "pad": 0.5, "strings": True},
    # back then / comedy: oom-pah bounce
    "comedy": {"bpm": 120, "prog": [["C", "F", "G", "C"], ["Am", "Dm", "G", "C"]], "style": "bounce", "inst": "piano",
               "drum": ("tick", [1, 0, 1, 0], 0.08), "pad": 0.0, "strings": False},
    # lore / drama: piano swells
    "drama": {"bpm": 90, "prog": [["Em", "C", "G", "D"], ["Am", "Em", "C", "B"]], "style": "swell", "inst": "piano",
              "drum": ("boom", [1, 0, 0, 0, 0, 0, 0, 0], 0.12), "pad": 0.5, "strings": True},
    # problem -> solution / app: uplifting plucks
    "uplift": {"bpm": 112, "prog": [["C", "G", "Am", "F"], ["F", "G", "C", "C"]], "style": "arp", "inst": "pluck",
               "drum": ("kick", [1, 0, 0, 0, 1, 0, 0, 0], 0.18), "pad": 0.36, "strings": False},
    # calm explainer / maps
    "calm": {"bpm": 96, "prog": [["Fmaj7", "Em7", "Dm7", "Cmaj7"]], "style": "arp", "inst": "bell", "drum": None, "pad": 0.4, "strings": False},
}
MODE_MOOD = {"case-file": "heist", "what-if": "wonder", "how-it-works": "workshop", "history": "epic", "back-then": "comedy",
             "lore": "drama", "map": "calm", "problem-solution": "uplift"}

TRANSITION_SFX = {
    "whip-left": ("whoosh", -17), "whip-right": ("whoosh", -17), "whip-up": ("whoosh", -17), "whip-down": ("whoosh", -17),
    "whip": ("whoosh", -17), "push": ("whoosh", -21), "zoom-out": ("whoosh", -22), "dissolve": ("flash_swish", -27),
    "flash": ("flash_swish", -19), "dip": ("low_swell", -22), "iris": ("swoosh_up", -22), "slide-up": ("swoosh_up", -22),
}


UI_SOUNDS = {"pop", "ding", "click", "tick", "tick_roll", "swoosh_up", "whoosh", "stamp", "cash", "sparkle", "heart_pop", "notify", "glitch", "shutter"}


def snd_is_ui(name: str) -> bool:
    """Short graphic sounds stay on their visual (which lands on the word); foley/impacts go in the pause after."""
    return name in UI_SOUNDS


def build_music(ident: dict, D: float, start: float, stings: list[float], booms: list[float]) -> dict:
    bpm = ident["bpm"]
    beat = 60.0 / bpm
    chords: list = []
    t = start
    cyc = 0
    while t < D - 1.2:
        prog = ident["prog"][(cyc // 2) % len(ident["prog"])]
        for sym in prog:
            if t >= D - 1.2:
                break
            chords.append([round(t, 4), sym])
            t += 4 * beat if ident["style"] in ("strings", "swell") else 2 * beat
        cyc += 1
    last_sym = ident["prog"][0][0]
    chords.append([round(t, 4), last_sym])
    st = ident["style"]
    sec = {"t0": start, "t1": D, "style": st, "vel": [[start, 0.24], [(start + D) / 2, 0.28], [D, 0.3]]}
    if st == "ostinato":
        sec.update({"inst": "mallet", "step": beat / 2, "pattern": [0, 2, 1, 2, 4, 2, 1, 2], "len": 0.85, "bass_every": 4, "bass_vel": 0.7})
    elif st == "pulse":
        sec.update({"step": beat / 2})
    elif st == "arp":
        sec.update({"step": beat / 2, "pattern": [0, 1, 2, 3, 2, 1]})
    elif st == "strings":
        sec.update({"step": beat / 4, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "accent": [1.0, 0.7, 0.8, 0.7], "len": 0.6, "sustain": 0.25})
    elif st == "bounce":
        sec.update({"step": beat})
    elif st == "swell":
        sec.update({"step": beat})
    mallet = []
    for a in stings:  # rising "ta-da" on keyword boxes (the build-genre signature)
        if a < start:
            continue
        mallet += [[round(a, 4), 77, 0.3, 0.16], [round(a + 0.08, 4), 81, 0.3, 0.16], [round(a + 0.16, 4), 84, 0.34, 0.34]]
    M = {
        "gain_db": 0.0, "reverb_db": -11.0, "pad_db": -6.0, "pad_reverb_db": -6.0, "mallet_db": -1.0, "drums_db": -8.0,
        "strings_db": -3.0, "instrument": ident["inst"], "leveler": {"thr_rel_db": 4.0, "ratio": 2.0, "tau": 0.3},
        "end": D, "chords": chords, "sections": [sec], "melody": [], "mallet_melody": sorted(mallet),
        "pad": [{"t0": start, "t1": D - 0.2, "chord": chords[0][1], "level": ident["pad"], "attack": 0.6, "release": 0.9, "cutoff": 1000, "hp": 40}] if ident["pad"] else [],
        "drums": [[round(b, 4), 0.42, "boom"] for b in booms],
        "drum_patterns": [{"t0": start + 0.02, "t1": max(start + 0.5, D - 1.0), "step": beat / 2 if len(ident["drum"][1]) == 8 else beat,
                           "pattern": ident["drum"][1], "vel": ident["drum"][2], "kind": ident["drum"][0]}] if ident["drum"] else [],
        "eq": [{"f": 2800, "q": 0.8, "db": -3.0}],  # presence dip so the voice reads on phone speakers
    }
    if ident.get("strings") and st not in ("strings",):
        M["layers"] = [{"t0": start, "t1": D, "style": "strings", "step": beat / 2, "pattern": [0, 1, 0, 2], "vel": 0.14, "len": 0.9}]
    return M


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--mood", default=None)
    ap.add_argument("--no-music", action="store_true")
    ap.add_argument("--verify", action="store_true")
    a = ap.parse_args()

    vdir = video_dir(a.slug)
    script = read_json(vdir / "script.json")
    tlp = SRC_VIDEOS / a.slug / "timeline.json"
    if not tlp.exists():
        die(f"no timeline at {tlp} (run scripts/timeline.mjs first)")
    tl = read_json(tlp)
    fps = tl["fps"]
    D = tl["durationInFrames"] / fps
    sec = lambda frame: frame / fps  # noqa: E731
    mood = a.mood or script.get("music", {}).get("mood") or MODE_MOOD.get(script.get("mode", ""), "workshop")
    ident = IDENTITIES.get(mood, IDENTITIES["workshop"])
    words = tl["words"]
    shots = tl["shots"]
    beats = {b["id"]: b for b in tl["beats"]}

    def word_time(phrase: str, beat_id: str | None) -> float | None:
        toks = [t for t in "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in phrase).split() if t]
        cand = [w for w in words if beat_id is None or w["beat"] == beat_id]
        norm = lambda s: "".join(ch for ch in s.lower() if ch.isalnum())  # noqa: E731
        for i in range(len(cand) - len(toks) + 1):
            if all(norm(cand[i + k]["text"]) == toks[k] or (k == len(toks) - 1 and norm(cand[i + k]["text"]).startswith(toks[k])) for k in range(len(toks))):
                return (cand[i]["start"], cand[i + len(toks) - 1]["end"])
        return None

    wins = [(w["start"], w["end"]) for w in words]

    def speaking(t: float) -> bool:
        return any(a - 0.02 <= t <= b + 0.02 for a, b in wins)

    def next_gap(t: float) -> float | None:
        for (a0, b0), (a1, b1) in zip(wins, wins[1:]):
            if b0 >= t - 0.02 and a1 - b0 >= 0.07:
                return b0 + 0.015
        return None

    events: list[dict] = []
    ambience: list[dict] = [{"sound": "room_tone", "t0": 0.0, "t1": max(0.5, D - 0.05), "fade_in": 0.05, "fade_out": 0.4, "gain_db": -44}]
    # 1. transitions: an air move on every motivated seam (whips/pushes), quieter on dissolves
    for s in shots[1:]:
        k = s.get("transitionIn") or "cut"
        if k in TRANSITION_SFX:
            snd, g = TRANSITION_SFX[k]
            events.append({"t": round(sec(s["s"]) + 1 / fps, 4), "sound": snd, "gain_db": g, "pan": 0.0})
    # 2. keyword boxes: a soft pop as the box lands (+1 frame), plus the music sting
    stings = []
    last_pop = -9.0
    for w in words:
        if w["emph"]:
            t = w["start"] + 1 / fps
            if t - last_pop > 0.6:
                events.append({"t": round(t, 4), "sound": "pop", "args": {"pitch": 1.35}, "gain_db": -30})
                stings.append(t)
                last_pop = t
    # 3. per-beat cues from the script: {"at": "billion", "sound": "impact", "gain": -12, "offset": 0.03}
    booms = []
    for b in script["beats"]:
        for c in b.get("sfx", []) or []:
            t = None
            if "at" in c:
                se = word_time(str(c["at"]), b["id"])
                if se is None:
                    die(f"beat {b['id']}: sfx cue word '{c['at']}' is not in the line")
                # "on": synced to a visual that lands on the word; default "after": in the pause after the word
                t = se[0] if c.get("place", "on" if snd_is_ui(c["sound"]) else "after") == "on" else se[1]
            elif "t" in c:
                t = beats[b["id"]]["s"] / fps + float(c["t"])
            else:
                t = beats[b["id"]]["s"] / fps
            t += float(c.get("offset", 1 / fps))
            snd = c["sound"]
            gain = float(c.get("gain", -16))
            # never bury a word: foley moves into the next pause; graphic pops that must stay on a word get capped
            if speaking(t):
                if not snd_is_ui(snd) and snd not in ("tick_roll",):
                    g0 = next_gap(t)
                    if g0 is not None and g0 - t < 0.7:
                        t = g0
                    else:
                        gain -= 6
                else:
                    gain = min(gain, -19.0)
            c = {**c, "gain": gain}
            if snd == "boom":
                booms.append(t)
                continue
            if snd == "tick_roll":
                events.append({"sound": "tick_roll", "t0": round(t, 4), "t1": round(t + float(c.get("dur", 1.0)), 4), "gain_db": c.get("gain", -24), "peak_rate": 16})
                continue
            if snd not in S.SFX:
                die(f"unknown sound '{snd}' (available: {', '.join(sorted(S.SFX))})")
            ev = {"t": round(t, 4), "sound": snd, "gain_db": float(c.get("gain", -16)), "pan": float(c.get("pan", 0.0))}
            if c.get("args"):
                ev["args"] = c["args"]
            if c.get("room"):
                ev["room"] = -12
            events.append(ev)
        for am in b.get("ambience", []) or []:
            bb = beats[b["id"]]
            sh = next(s for s in shots if s["id"] == bb["shot"])
            t0, t1 = sec(sh["s"]), sec(sh["e"])
            if am not in S.AMBIENCE:
                die(f"unknown ambience '{am}' (available: {', '.join(sorted(S.AMBIENCE))})")
            ambience.append({"sound": am, "t0": round(t0, 3), "t1": round(min(D - 0.05, t1 + 0.3), 3), "fade_in": 0.25, "fade_out": 0.35, "gain_db": -34})
    # density report (noticeable SFX per minute)
    loud = [e for e in events if e.get("gain_db", -40) > -20]
    per_min = 60 * len(loud) / max(1e-6, D)
    log(f"sound: mood={mood} bpm={ident['bpm']} | {len(events)} sfx events ({per_min:.1f} noticeable/min) | {len(ambience)} beds")
    if per_min > 14:
        log("  ! more than ~14 noticeable SFX per minute reads as noisy; thin the script cues")
    # music enters right after the hook line (foley-only hook reads more 'real'), or at 0 for calm moods
    hook_end = beats[tl["beats"][0]["id"]]["speechEnd"] / fps
    start = 0.0 if mood in ("calm", "wonder") else max(0.4, hook_end - 0.05)
    music = build_music(ident, D, start, stings, booms)
    if a.no_music:
        music["gain_db"] = -120.0
    cues = {
        "title": tl["title"],
        "duration": round(D, 4),
        "target_lufs": -14.0,
        "limiter_ceiling_dbtp": -1.5,
        "end_fade": [max(0, D - 0.35), D],
        "stem_gain_db": {"music": -14.0 + float(script.get("music", {}).get("gain", 0)), "sfx": 4.0, "amb": 0.0, "voice": 2.0},
        "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015},
                          "sfx": {"comp_thr_dbfs": -12.0, "ratio": 3.0, "win": 0.004, "limit_dbfs": -3.0}},
        "shots": [round(sec(s["s"]), 3) for s in shots] + [round(D, 3)],
        "ambience": ambience,
        "events": events,
        "music": music,
        "voice": {"file": "voice.wav", "gain_db": 0.0, "duck_db": -9.0, "amb_duck_db": -5.0, "presence_db": 2.0, "hp": 75},
    }
    adir = vdir / "audio"
    (adir / "stems").mkdir(parents=True, exist_ok=True)
    S.OUT_DIR = str(vdir / "voice")
    S.STEM_DIR = str(adir / "stems")

    def sound_len(e: dict) -> float:
        try:
            snd = S.SFX[e["sound"]][0](S.seeded("len", e["sound"]), **e.get("args", {}))
            return snd.x.shape[-1] / S.SR - snd.anchor
        except Exception:
            return 0.5

    def render_once(cues):
        stems, expected, notes = S.render_mix(cues, log=lambda *x: None)
        stems.pop("_duck")
        if "voice" in stems:
            from scipy import ndimage, signal as sig
            v = np.abs(stems["voice"].mean(axis=0))
            env = ndimage.uniform_filter1d(v, size=int(0.03 * S.SR))
            act = (env > np.percentile(env[env > 1e-6], 50) * 0.3).astype(float) if np.any(env > 1e-6) else np.zeros_like(env)
            act = ndimage.maximum_filter1d(act, size=int(0.12 * S.SR), mode="constant")
            aa = np.exp(-1.0 / (0.05 * S.SR))
            act = np.clip(sig.filtfilt([1 - aa], [1, -aa], act), 0, 1)
            stems["sfx"] = stems["sfx"] * (1 - (1 - S.db2lin(-7.0)) * act)
        y, proc, g, gr = S.master(stems, cues, log=lambda *x: None)
        return y, proc

    def masking(proc):
        v = proc.get("voice")
        bed = proc["music"] + proc["sfx"]
        out = []
        if v is None:
            return out
        fn_words = {"a", "an", "the", "of", "to", "in", "on", "at", "it", "is", "and", "or", "for", "by", "as"}
        for w in words:
            if w["end"] - w["start"] < 0.09 or "".join(ch for ch in w["text"].lower() if ch.isalpha()) in fn_words:
                continue
            # the word itself (at least 0.12 s), not the transition that follows the last word of a line
            a0 = int(w["start"] * S.SR)
            a1 = int(max(w["end"], w["start"] + 0.05) * S.SR)
            vr = np.sqrt(np.mean(v[:, a0:a1] ** 2) + 1e-12)
            br = np.sqrt(np.mean(bed[:, a0:a1] ** 2) + 1e-12)
            d = 20 * math.log10(vr / br)
            if d < 3.0:  # research: flag music/SFX within 3 dB of the voice during a word
                out.append((w, d))
        return out

    # mix-fix loop: lower exactly the events (or the music) that mask a word, re-render, up to 3 passes
    for it in range(4):
        y, proc = render_once(cues)
        masked = masking(proc)
        if not masked or it == 3:
            break
        touched = 0
        for w, d in masked:
            for e in cues["events"]:
                if "t" not in e:
                    continue
                L = sound_len(e)
                if e["t"] - 0.05 <= w["end"] and e["t"] + L >= w["start"] and e.get("gain_db", -20) > -34:
                    e["gain_db"] = e.get("gain_db", -20) - 4.0
                    touched += 1
        if touched == 0:
            cues["stem_gain_db"]["music"] -= 2.0
        log(f"  mix pass {it + 1}: {len(masked)} masked words -> lowered {touched} events{'' if touched else ' (music -2 dB)'}")
    masked = [f"{w['text']}@{w['start']:.2f}s ({d:.1f} dB)" for w, d in masking(proc)]
    write_json(adir / "cues.json", cues)
    for k in proc:
        if not np.all(np.isfinite(proc[k])):
            die(f"non-finite samples in stem {k}")
    out = PUBLIC / a.slug / "mix.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    S.write_wav(str(out), y, 24)
    for k, sg in proc.items():
        S.write_wav(str(adir / "stems" / f"{k}.wav"), sg, 24)
    L = S.integrated_lufs(y)
    tp = S.true_peak_db(y)
    v = proc.get("voice")
    mus_db = None
    if v is not None:
        sp = np.zeros(v.shape[1], dtype=bool)
        for w in words:
            sp[int(w["start"] * S.SR):int(w["end"] * S.SR)] = True
        if sp.any():
            mus_db = round(20 * math.log10((np.sqrt(np.mean(proc["music"][:, sp] ** 2)) + 1e-9) / (np.sqrt(np.mean(v[:, sp] ** 2)) + 1e-9)), 1)
    log(f"mix.wav {D:.2f}s  {L:.2f} LUFS  true peak {tp:.2f} dBTP  music {mus_db} dB vs voice -> {out}")
    if masked:
        log(f"  ! voice still masked on {len(masked)} words: {', '.join(masked[:8])}")
    report = {"lufs": round(L, 2), "truePeak": round(tp, 2), "mood": mood, "sfxPerMinute": round(per_min, 1), "musicVsVoiceDb": mus_db, "masked": masked}
    write_json(adir / "mix-report.json", report)
    tl["audio"]["hasMix"] = True
    with open(tlp, "w", encoding="utf-8") as f:
        json.dump(tl, f)
    if abs(L + 14.0) > 0.6 or tp > -1.0:
        die(f"loudness out of spec ({L:.2f} LUFS, {tp:.2f} dBTP)")


if __name__ == "__main__":
    main()
