#!/usr/bin/env python3
"""sound.py - the score, the foley and the voice, mixed and mastered on the timeline's clock.

    .venv/Scripts/python scripts/sound.py <slug> [--mood heist] [--no-music] [--verify]
    .venv/Scripts/python scripts/sound.py --preview plugg [--seconds 24]     # music-only audition -> out/audio-preview/

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
from lib.common import PUBLIC, SRC_VIDEOS, STUDIO, die, log, read_json, video_dir, write_json  # noqa: E402

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
    # --- trap family (style "trap": the groove is the "beat" spec, rendered by synth.render_beat; see synth.py section 5b).
    # One chord per bar (chord_beats 4). Grids are 16 sixteenths per bar ("." rest, 1-9 velocity tenths, x full) and cycle;
    # bass = [step, len (0 = hold), semitones above the chord's bass note, glide]; motif = [step, len, chord-tone index or
    # [indices] for a stab, vel(, bend)]. Original progressions, motifs and patterns, written for this engine.
    # tiff / storytime - plugg: dreamy, playful, nostalgic. Half-time at 146 counted (clap + snare on beat 3, kick on 1 and
    # the and-of-2), a soft round 808 that slides up at phrase ends, a glass-bell motif with a dotted-1/8 ping-pong echo,
    # an airy per-chord pad, soft swung 1/8 hats with a triplet roll every 4 bars and a 1/32 roll every 8.
    "plugg": {"bpm": 146, "prog": [["Gmaj7", "F#m7", "Bm7", "Asus2"], ["Em7", "F#m7", "Gmaj7", "A"]], "style": "trap", "inst": "bell",
              "drum": None, "pad": 0.0, "strings": False, "chord_beats": 4,
              "beat": {"swing": 0.12, "humanize": 0.004, "gain_db": -12.0, "room_db": -16.0,
                       "drums": {"kick": {"kind": "kick_soft", "vel": 0.85, "grid": ["x.....x.........", "x.....x.........", "x.....x.........", "x.....x...x....."]},
                                 "clap": {"kind": "clap_soft", "vel": 0.7, "db": 6.0, "grid": ["........x......."]},
                                 "snare": {"kind": "snare", "vel": 0.35, "db": 6.0, "grid": ["........x......."]},
                                 "hat": {"kind": "hat", "vel": 0.4, "db": 6.0, "pan": 0.12, "grid": ["8.5.7.5.8.5.7.5.", "8.5.7.5.8.5.7...", "8.5.7.5.8.5.7.55", "8.5.7.5.8.5....."]},
                                 "ohat": {"kind": "ohat", "vel": 0.28, "db": 6.0, "pan": -0.12, "grid": ["................", "..............6.", "................", "................"]}},
                       "rolls": [{"every": 4, "bar": 3, "step": 12, "steps": 4, "rate": 6, "vel": [0.3, 0.7], "tone": [0.96, 1.1]},
                                 {"every": 8, "bar": 6, "step": 14, "steps": 2, "rate": 8, "vel": [0.25, 0.55]}],
                       "bass": {"range": [28, 39], "vel": 0.9, "db": -1.5,
                                "tone": {"decay": 1.5, "glide": 0.09, "punch": [5.0, 0.018], "drive": 1.8, "tri": 0.1, "harm": 1.0, "lp": 900},
                                "pattern": [[[0, 6, 0, 0], [6, 0, 0, 0]], [[0, 6, 0, 0], [6, 4, 0, 0], [10, 0, 12, 1]],
                                            [[0, 6, 0, 0], [6, 0, 0, 0]], [[0, 6, 0, 0], [6, 2, 0, 0], [8, 4, 7, 1], [12, 0, 12, 1]]]},
                       "leads": [{"voice": "glass", "range": [74, 93], "vel": 0.8, "db": -2.2, "hp": 350, "pan": 0.18, "rev_db": -9.0,
                                  "echo": {"beats": 0.75, "feedback": 0.32, "mix": 0.28, "lp_hz": 4200},
                                  "motif": [[[0, 2, 3, 0.9], [2, 2, 2, 0.6], [4, 3, 4, 0.8], [7, 3, 3, 0.65], [10, 2, 2, 0.7], [12, 4, 1, 0.75]],
                                            [[0, 3, 2, 0.85], [3, 3, 3, 0.7], [6, 2, 4, 0.8], [8, 4, 3, 0.7], [12, 2, 2, 0.65], [14, 2, 1, 0.55]],
                                            [[0, 2, 4, 0.9], [2, 2, 3, 0.6], [4, 3, 5, 0.8], [7, 3, 4, 0.65], [10, 2, 3, 0.7], [12, 4, 2, 0.75]],
                                            [[0, 4, 3, 0.85], [6, 2, 2, 0.6], [8, 2, 1, 0.6], [10, 6, 0, 0.7]],
                                            [[0, 2, 3, 0.9], [2, 2, 2, 0.6], [4, 3, 4, 0.8], [7, 3, 3, 0.65], [10, 2, 2, 0.7], [12, 4, 1, 0.75]],
                                            [[0, 3, 2, 0.85], [3, 3, 3, 0.7], [6, 2, 4, 0.8], [8, 4, 3, 0.7], [12, 2, 2, 0.65], [14, 2, 1, 0.55]],
                                            [[0, 2, 4, 0.9], [2, 2, 3, 0.6], [4, 3, 5, 0.8], [7, 3, 4, 0.65], [10, 2, 3, 0.7], [12, 4, 2, 0.75]],
                                            [[0, 1, 1, 0.6], [1, 1, 2, 0.62], [2, 1, 3, 0.66], [3, 1, 4, 0.7], [4, 6, 5, 0.85], [12, 2, 3, 0.6], [14, 2, 2, 0.55]]]}],
                       "duck": {"db": -2.5, "release": 0.12},
                       "pad": {"level": 1.0, "db": 7.0, "rev_db": -6.0, "hp": 240, "cutoff": 2600, "attack": 0.35, "release": 0.6},
                       "sting": {"voice": "glass", "lo": 81}}},
    # ug-rap / hype - rage: aggressive. Half-time at 160 counted (hard clap on beat 3), a distorted 808 (clean sub + driven
    # upper layer) that glides to the octave and fifth, 7-voice detuned saw-chord stabs with gaps and bend-down tails,
    # fast 1/16 hats with 1/32, 1/16-triplet and 1/32-triplet rolls at phrase ends, a dark pad and a very wet high bell.
    "rage": {"bpm": 160, "prog": [["Em", "Em", "C", "B"], ["Em", "F", "Em", "D"]], "style": "trap", "inst": "bell",
             "drum": None, "pad": 0.0, "strings": False, "chord_beats": 4,
             "beat": {"swing": 0.0, "humanize": 0.003, "gain_db": -13.5, "room_db": -13.0,
                      "drums": {"kick": {"kind": "kick_hard", "vel": 1.0, "db": -1.2, "grid": ["x.....x.........", "x.....x...x.....", "x.....x.........", "x.....x.x......."]},
                                "clap": {"kind": "clap_hard", "vel": 0.95, "db": 3.5, "grid": ["........x.......", "........x.......", "........x.......", "........x.....6."]},
                                "snare": {"kind": "snare", "vel": 0.45, "db": 3.5, "grid": ["........x......."]},
                                "hat": {"kind": "hat_tight", "vel": 0.45, "db": 4.5, "pan": 0.15, "grid": ["7474747474747474", "7474747474747474", "74747474747474..", "74747474........"]},
                                "ohat": {"kind": "ohat", "vel": 0.32, "db": 4.5, "pan": -0.15, "grid": ["................", "................", "..............7.", "................"]}},
                      "rolls": [{"every": 4, "bar": 1, "step": 12, "steps": 4, "rate": 8, "vel": [0.35, 0.85], "tone": [0.95, 1.15]},
                                {"every": 4, "bar": 3, "step": 8, "steps": 4, "rate": 6, "vel": [0.4, 0.7]},
                                {"every": 4, "bar": 3, "step": 12, "steps": 4, "rate": 12, "vel": [0.4, 0.95], "tone": [0.9, 1.2]}],
                      "bass": {"range": [26, 37], "vel": 0.95, "db": -1.0,
                               "tone": {"decay": 1.1, "glide": 0.06, "punch": [9.0, 0.014], "drive": 2.6, "tri": 0.15, "harm": 0.6,
                                        "dist": 0.7, "dist_drive": 5.0, "dist_band": [100, 2200], "lp": 2600},
                               "pattern": [[[0, 6, 0, 0], [6, 4, 0, 0], [10, 0, 12, 1]],
                                           [[0, 3, 0, 0], [3, 3, 0, 0], [6, 4, 0, 0], [10, 2, 7, 1], [12, 0, 12, 1]],
                                           [[0, 6, 0, 0], [6, 0, 0, 0]],
                                           [[0, 6, 0, 0], [6, 2, 0, 0], [8, 4, 12, 1], [12, 0, 7, 1]]]},
                      "leads": [{"voice": "stab", "range": [55, 79], "vel": 0.9, "db": 4.0, "hp": 280, "rev_db": -12.0,
                                 "echo": {"beats": 0.5, "feedback": 0.22, "mix": 0.16, "lp_hz": 3000},
                                 "tone": {"wave": "saw", "voices": 7, "detune": 28.0, "spread": 0.9, "decay": 0.08, "sustain": 0.6, "release": 0.045,
                                          "cut": 7000.0, "cut_lo": 2400.0, "cut_tau": 0.08, "drive": 0.35, "hp": 280.0, "bend_at": 0.4},
                                 "motif": [[[0, 2, [1, 2, 3], 1.0], [3, 1, [1, 2, 3], 0.7], [4, 2, [2, 3, 4], 0.9], [7, 1, [1, 2, 3], 0.65], [10, 3, [0, 1, 2], 0.85, -1.0]],
                                           [[0, 2, [1, 2, 3], 1.0], [3, 2, [2, 3, 4], 0.8], [6, 2, [3, 4, 5], 0.9], [8, 2, [2, 3, 4], 0.75], [11, 4, [1, 2, 3], 0.85, -2.0]],
                                           [[0, 2, [1, 2, 3], 1.0], [3, 1, [1, 2, 3], 0.7], [4, 2, [2, 3, 4], 0.9], [7, 1, [1, 2, 3], 0.65], [10, 3, [0, 1, 2], 0.85, -1.0]],
                                           [[0, 4, [1, 2, 3], 1.0, -0.5], [6, 6, [0, 1, 2], 0.8, -3.0]]]},
                                {"voice": "glass", "range": [79, 96], "vel": 0.55, "db": -6.4, "hp": 500, "rev_db": -2.0,
                                 "echo": {"beats": 1.5, "feedback": 0.4, "mix": 0.35, "lp_hz": 3000},
                                 "motif": [[[0, 8, 2, 0.7]], [[0, 8, 1, 0.6], [8, 8, 2, 0.5]]]}],
                      "duck": {"db": -4.0, "release": 0.1},
                      "pad": {"level": 1.0, "db": 8.0, "rev_db": -4.0, "hp": 320, "cutoff": 1800, "attack": 0.5, "release": 0.8},
                      "sting": {"voice": "glass", "lo": 76}}},
    # bouncy and fast - jerk: full-time claps on 2 and 4 at 152 (a staggered, late ghost snare), a punchy syncopated kick /
    # 808 bounce (3-3-4 with octave jumps and a sidechain pump), bright square stabs on the off-beats, a soft glass counter,
    # 1/8 hats with 1/16 stutters and triplet / 1/32 rolls.
    "jerk": {"bpm": 152, "prog": [["Gm7", "Cm7", "Ebmaj7", "D7"], ["Gm7", "Bb", "Cm7", "Dsus4"]], "style": "trap", "inst": "bell",
             "drum": None, "pad": 0.0, "strings": False, "chord_beats": 4,
             "beat": {"swing": 0.06, "humanize": 0.003, "gain_db": -11.5, "room_db": -15.0,
                      "drums": {"kick": {"kind": "kick_punch", "vel": 0.95, "db": -1.0, "grid": ["x..x......x..x..", "x..x..x...x.....", "x..x......x..x..", "x..x......x.x.x."]},
                                "clap": {"kind": "clap_snap", "vel": 0.9, "db": 4.8, "grid": ["....x.......x...", "....x.......x...", "....x.......x...", "....x.......x..5"]},
                                "snare": {"kind": "snare", "vel": 0.4, "db": 4.8, "late": 0.012, "grid": ["................", ".......4........", "................", "..........4....."]},
                                "hat": {"kind": "hat", "vel": 0.42, "db": 6.3, "pan": 0.12, "grid": ["7.5.7.5.7.5.7.5.", "7.5.7.557.5.7.5.", "7.5.7...7.5.7.5.", "7.5.7.5.7.5....."]},
                                "ohat": {"kind": "ohat", "vel": 0.3, "db": 6.3, "pan": -0.12, "grid": ["................", "................", "......6.........", "................"]}},
                      "rolls": [{"every": 4, "bar": 3, "step": 12, "steps": 4, "rate": 6, "vel": [0.35, 0.8], "tone": [0.96, 1.12]},
                                {"every": 4, "bar": 1, "step": 14, "steps": 2, "rate": 8, "vel": [0.3, 0.6]}],
                      "bass": {"range": [26, 37], "vel": 0.9, "db": 0.0,
                               "tone": {"decay": 0.45, "glide": 0.05, "punch": [12.0, 0.01], "drive": 1.8, "tri": 0.25, "harm": 0.65, "dist": 0.15, "lp": 1600},
                               "pattern": [[[0, 3, 0, 0], [3, 7, 12, 0], [10, 3, 0, 0], [13, 3, 12, 1]],
                                           [[0, 3, 0, 0], [3, 3, 0, 0], [6, 4, 12, 0], [10, 6, 0, 0]],
                                           [[0, 3, 0, 0], [3, 7, 12, 0], [10, 3, 0, 0], [13, 3, 12, 1]],
                                           [[0, 3, 0, 0], [3, 7, 12, 0], [10, 2, 0, 0], [12, 2, 7, 1], [14, 2, 12, 1]]]},
                      "leads": [{"voice": "stab", "range": [62, 86], "vel": 0.85, "db": 4.6, "hp": 320, "rev_db": -14.0,
                                 "echo": {"beats": 0.75, "feedback": 0.22, "mix": 0.18, "lp_hz": 4000},
                                 "tone": {"wave": "square", "voices": 3, "detune": 9.0, "spread": 0.5, "attack": 0.001, "decay": 0.06, "sustain": 0.35,
                                          "release": 0.03, "cut": 7500.0, "cut_lo": 2200.0, "cut_tau": 0.05, "drive": 0.15, "hp": 320.0},
                                 "motif": [[[2, 1, [2, 3, 4], 0.9], [5, 1, [2, 3, 4], 0.6], [7, 1, [3, 4, 5], 0.8], [10, 1, [2, 3, 4], 0.85], [14, 1, [1, 2, 3], 0.7]],
                                           [[2, 1, [2, 3, 4], 0.9], [6, 1, [3, 4, 5], 0.75], [8, 2, [4, 5, 6], 0.8], [11, 1, [3, 4, 5], 0.7], [14, 2, [2, 3, 4], 0.75]],
                                           [[2, 1, [2, 3, 4], 0.9], [5, 1, [2, 3, 4], 0.6], [7, 1, [3, 4, 5], 0.8], [10, 1, [2, 3, 4], 0.85], [14, 1, [1, 2, 3], 0.7]],
                                           [[2, 1, [2, 3, 4], 0.9], [4, 1, [2, 3, 4], 0.6], [6, 1, [3, 4, 5], 0.75], [8, 4, [4, 5, 6], 0.85]]]},
                                {"voice": "glass", "range": [74, 93], "vel": 0.6, "db": -4.0, "hp": 400, "rev_db": -8.0,
                                 "echo": {"beats": 0.75, "feedback": 0.3, "mix": 0.25, "lp_hz": 3800},
                                 "motif": [[[0, 6, 4, 0.6], [12, 4, 3, 0.45]], [[8, 8, 2, 0.5]]]}],
                      "duck": {"db": -6.0, "release": 0.09},
                      "pad": {"level": 1.0, "db": 6.0, "rev_db": -6.0, "hp": 280, "cutoff": 2400, "attack": 0.3, "release": 0.5},
                      "sting": {"voice": "glass", "lo": 79}}},
}
MODE_MOOD = {"case-file": "heist", "what-if": "wonder", "how-it-works": "workshop", "history": "epic", "back-then": "comedy",
             "lore": "drama", "map": "calm", "problem-solution": "uplift", "tiff": "plugg", "ug-rap": "rage"}

TRANSITION_SFX = {
    "whip-left": ("whoosh", -17), "whip-right": ("whoosh", -17), "whip-up": ("whoosh", -17), "whip-down": ("whoosh", -17),
    "whip": ("whoosh", -17), "push": ("whoosh", -21), "zoom-out": ("whoosh", -22), "dissolve": ("flash_swish", -27),
    "flash": ("flash_swish", -19), "dip": ("low_swell", -22), "iris": ("swoosh_up", -22), "slide-up": ("swoosh_up", -22),
}


UI_SOUNDS = {"pop", "ding", "click", "tick", "tick_roll", "swoosh_up", "whoosh", "stamp", "cash", "sparkle", "heart_pop", "notify", "glitch", "shutter"}


def snd_is_ui(name: str) -> bool:
    """Short graphic sounds stay on their visual (which lands on the word); foley/impacts go in the pause after."""
    return name in UI_SOUNDS


def trap_cues(ident: dict, D: float, start: float, chords: list, stings: list[float]) -> dict:
    """Trap family (plugg / rage / jerk): M["beat"] for synth.render_beat on a bar grid that starts with the music, a
    per-chord airy pad (instead of one held chord) and the keyword stings re-voiced in key on the beat's bell."""
    spec = ident["beat"]
    beat = {k: v for k, v in spec.items() if k != "pad"}
    beat.update({"bpm": ident["bpm"], "t0": round(start, 4), "t1": round(D, 4), "stings": [round(a, 4) for a in stings if a >= start]})
    pd = spec.get("pad")
    if pd:
        ends = [c[0] for c in chords[1:]] + [D]
        beat["pad"] = {"db": pd.get("db", 0.0), "rev_db": pd.get("rev_db", -6.0),
                       "regions": [{"t0": c[0], "t1": round(min(D - 0.2, e + 0.05), 4), "chord": c[1], "level": pd.get("level", 1.0),
                                    "attack": pd.get("attack", 0.3), "release": pd.get("release", 0.6), "cutoff": pd.get("cutoff", 2600),
                                    "hp": pd.get("hp", 220)} for c, e in zip(chords, ends) if c[0] < D - 0.4]}
    return {"beat": beat}


def build_music(ident: dict, D: float, start: float, stings: list[float], booms: list[float]) -> dict:
    bpm = ident["bpm"]
    beat = 60.0 / bpm
    cb = ident.get("chord_beats") or (4 if ident["style"] in ("strings", "swell") else 2)
    chords: list = []
    t = start
    cyc = 0
    while t < D - 1.2:
        prog = ident["prog"][(cyc // 2) % len(ident["prog"])]
        for sym in prog:
            if t >= D - 1.2:
                break
            chords.append([round(t, 4), sym])
            t += cb * beat
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
    for a in ([] if ident.get("beat") else stings):  # rising "ta-da" on keyword boxes (the build-genre signature)
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
    if ident.get("beat"):
        M.update(trap_cues(ident, D, start, chords, stings))
    return M


def preview(mood: str, seconds: float) -> None:
    """Music-only audition of a sound identity -> out/audio-preview/<mood>.wav, mastered like a mix (-14 LUFS, -1.5 dBTP)."""
    if mood not in IDENTITIES:
        die(f"unknown mood '{mood}' (available: {', '.join(IDENTITIES)})")
    M = build_music(IDENTITIES[mood], seconds, 0.0, [], [])
    n = S.nsamp(seconds)
    music, _, _ = S.render_music(M, n, log=lambda *x: None)
    for eq in M.get("eq", []):
        music = S.peak_eq(music, eq["f"], eq.get("q", 0.8), eq["db"])
    cues = {"target_lufs": -14.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [seconds - 0.35, seconds]}
    y = S.master({"music": S.hp(music, 18)}, cues, log=lambda *x: None)[0]
    out = STUDIO / "out" / "audio-preview" / f"{mood}.wav"
    S.write_wav(str(out), y, 24)
    log(f"preview {mood}: {seconds:.1f}s  {S.integrated_lufs(y):.2f} LUFS  true peak {S.true_peak_db(y):.2f} dBTP -> {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="?")
    ap.add_argument("--mood", default=None)
    ap.add_argument("--no-music", action="store_true")
    ap.add_argument("--verify", action="store_true")
    ap.add_argument("--preview", metavar="MOOD", help="music-only audition of a mood -> out/audio-preview/<mood>.wav")
    ap.add_argument("--seconds", type=float, default=24.0, help="preview length (s)")
    a = ap.parse_args()
    if a.preview:
        return preview(a.preview, a.seconds)
    if not a.slug:
        ap.error("slug is required (or --preview MOOD)")

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
        norm = lambda s: "".join(ch for ch in s.lower() if ch.isalnum())  # noqa: E731
        # split on spaces BEFORE stripping punctuation, exactly like the words: "12,262" -> "12262", not "12" "262"
        toks = [t for t in (norm(p) for p in phrase.split()) if t]
        cand = [w for w in words if beat_id is None or w["beat"] == beat_id]
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
