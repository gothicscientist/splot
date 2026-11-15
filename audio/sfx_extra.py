"""Short-form SFX staples missing from synth.py, in the same house style (soft, warm, no harsh snaps).

Registered into synth.SFX on import: whoosh, swoosh_up, riser, impact, sub_drop, glitch, shutter, cash, typewriter,
ding, click, error_buzz, success, boing, tick, thud, sparkle, record_scratch, heart_pop, stamp, notify.
All are deterministic functions (rng) -> synth.Sound with the anchor on the perceptual peak.
"""
import numpy as np

import synth as S
from synth import SR, Sound, bp, fades, hp, lp, norm, nsamp, pink, sweep_filter, tvec, white, unit_rms, mtof


def sfx_whoosh(rng, dur=0.42, peak=0.24, bright=1.0, pan_sweep=0.8):
    """Air whoosh for whip pans / fast moves; anchor = loudest point (the seam)."""
    n = nsamp(dur)
    t = tvec(n)
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / (0.09)))
    fc = np.where(t < peak, 500 * (3600 * bright / 500) ** (t / peak), 3600 * bright * np.exp(-(t - peak) / 0.25) + 600)
    L = sweep_filter(pink(n, rng), fc, 1.1)
    R = sweep_filter(pink(n, rng), fc * 1.04, 1.1)
    p = np.linspace(-pan_sweep, pan_sweep, n)
    th = (p + 1) * np.pi / 4
    y = np.vstack([L * np.cos(th), R * np.sin(th)]) * env
    return Sound(norm(fades(lp(y, 8000), 0.003, 0.02)), anchor=peak)


def sfx_swoosh_up(rng, dur=0.5):
    """Rising swoosh (text / object flying in)."""
    n = nsamp(dur)
    t = tvec(n)
    u = t / dur
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.5
    fc = 400 * (5000 / 400) ** u
    y = sweep_filter(white(n, rng), fc, 1.4) * env
    return Sound(norm(fades(lp(np.vstack([y, y]), 9000), 0.002, 0.03)), anchor=dur * 0.6)


def sfx_riser(rng, dur=1.6):
    """Tension riser into a reveal: noise swell + rising detuned tone; anchor = end (the hit lands after it)."""
    n = nsamp(dur)
    t = tvec(n)
    u = t / dur
    env = u ** 2.4
    f = 120 * (2 ** (u * 2.5))
    tone = sum(np.sin(2 * np.pi * np.cumsum(f * d) / SR) for d in (1.0, 1.007, 0.993)) / 3
    nz = sweep_filter(pink(n, rng), 300 * (6000 / 300) ** u, 0.8)
    y = (0.6 * unit_rms(tone) + 0.8 * unit_rms(nz)) * env
    y = np.vstack([y, np.roll(y, 40)])
    return Sound(norm(fades(lp(y, 9000), 0.05, 0.01)), anchor=dur)


def sfx_impact(rng, size=1.0):
    """Cinematic soft impact (a reveal / slam): sub thump + low boom tail + felt transient."""
    n = nsamp(1.6 * size)
    t = tvec(n)
    f = 38 + 70 * np.exp(-t / 0.05)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.45 * size))
    body = lp(pink(n, rng), 300) * np.exp(-t / 0.18) * 0.6
    click = bp(white(n, rng), 900, 3000) * np.exp(-t / 0.006) * 0.35
    y = np.tanh(1.8 * (sub + body + click))
    y = np.vstack([y, y]) + 0.18 * S.convolve(np.vstack([y, y]) * 0.3, S.hall_ir())[:, :n]
    return Sound(norm(fades(lp(y, 5000), 0.0005, 0.2)), onsets=[(0.0, "transient")])


def sfx_sub_drop(rng, dur=1.4):
    """808-ish pitch drop under a big number."""
    n = nsamp(dur)
    t = tvec(n)
    f = 30 + 90 * np.exp(-t / 0.25)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    y = np.tanh(1.5 * y)
    return Sound(norm(fades(np.vstack([y, y]), 0.002, 0.15)), onsets=[(0.0, "soft")])


def sfx_glitch(rng, dur=0.32):
    """Digital glitch stutter (hacks, errors, screens)."""
    n = nsamp(dur)
    y = np.zeros(n)
    k = 0
    while k < n:
        L = int(rng.uniform(0.008, 0.03) * SR)
        f = rng.choice([180, 360, 720, 1440, 2880])
        tt = np.arange(min(L, n - k)) / SR
        seg = np.sign(np.sin(2 * np.pi * f * tt)) * rng.uniform(0.3, 1.0)
        y[k:k + len(seg)] = seg * (rng.uniform() > 0.25)
        k += L
    y = lp(y, 4500)
    return Sound(norm(fades(np.vstack([y, np.roll(y, 25)]), 0.001, 0.02)), onsets=[(0.0, "transient")])


def sfx_shutter(rng):
    n = nsamp(0.18)
    t = tvec(n)
    a = bp(white(n, rng), 1500, 6000) * np.exp(-t / 0.008)
    b = bp(white(n, rng), 1200, 5000) * np.exp(-np.clip(t - 0.06, 0, None) / 0.01) * (t > 0.06)
    y = a + 0.8 * b
    return Sound(norm(fades(np.vstack([y, y]), 0.0005, 0.02)), onsets=[(0.0, "transient")])


def sfx_cash(rng):
    """Cash register 'ka-ching': two mechanical clicks + a bright bell."""
    n = nsamp(1.2)
    t = tvec(n)
    clk = bp(white(n, rng), 1800, 6000) * (np.exp(-t / 0.004) + 0.7 * np.exp(-np.clip(t - 0.07, 0, None) / 0.004) * (t > 0.07))
    bell = np.zeros(n)
    for m, a in ((93, 1.0), (100, 0.6), (105, 0.35)):
        bell += a * np.sin(2 * np.pi * mtof(m) * t) * np.exp(-np.clip(t - 0.11, 0, None) / 0.35) * (t > 0.11)
    y = 0.6 * clk + 0.5 * bell
    return Sound(norm(fades(lp(np.vstack([y, y]), 9000), 0.0005, 0.1)), onsets=[(0.0, "transient"), (0.11, "transient")])


def sfx_typewriter(rng, dur=1.0, rate=12.0):
    n = nsamp(dur)
    y = np.zeros(n)
    k = 0.0
    while k < dur - 0.02:
        st = int(k * SR)
        L = nsamp(0.03)
        tt = np.arange(L) / SR
        hit = bp(white(L, rng), 1200, 5000) * np.exp(-tt / 0.004) * rng.uniform(0.6, 1.0)
        y[st:st + L] += hit[: max(0, min(L, n - st))]
        k += 1.0 / rate * rng.uniform(0.7, 1.3)
    return Sound(norm(fades(np.vstack([y, y]), 0.001, 0.02)), onsets=[(0.0, "transient")])


def sfx_ding(rng, midi=88, dur=1.2):
    """Clean notification ding (an idea / correct)."""
    n = nsamp(dur)
    t = tvec(n)
    y = sum(a * np.sin(2 * np.pi * mtof(midi) * r * t) * np.exp(-t / (0.4 / r)) for r, a in ((1, 1.0), (2.76, 0.25), (5.4, 0.08)))
    return Sound(norm(fades(np.vstack([y, y]), 0.001, 0.1)), onsets=[(0.0, "transient")])


def sfx_click(rng, pitch=1.0):
    n = nsamp(0.06)
    t = tvec(n)
    y = bp(white(n, rng), 1500 * pitch, 6000 * pitch) * np.exp(-t / 0.003)
    return Sound(norm(fades(np.vstack([y, y]), 0.0002, 0.01)), onsets=[(0.0, "transient")])


def sfx_error_buzz(rng, dur=0.45):
    n = nsamp(dur)
    t = tvec(n)
    ph = 2 * np.pi * 140 * t
    y = sum(np.sin(k * ph) / k for k in range(1, 9)) * (0.6 + 0.4 * (np.sin(2 * np.pi * 9 * t) > 0))
    y = lp(y, 2200) * np.exp(-t / (dur * 0.7))
    return Sound(norm(fades(np.vstack([y, y]), 0.002, 0.05)), onsets=[(0.0, "soft")])


def sfx_success(rng):
    """Rising major arpeggio (achievement / reveal)."""
    n = nsamp(1.3)
    t = tvec(n)
    y = np.zeros(n)
    for k, m in enumerate((72, 76, 79, 84)):
        st = k * 0.075
        tt = np.clip(t - st, 0, None)
        y += (t >= st) * np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-tt / 0.32) * (0.8 + 0.05 * k)
    return Sound(norm(fades(lp(np.vstack([y, y]), 8000), 0.001, 0.1)), onsets=[(0.0, "transient")])


def sfx_boing(rng, dur=0.5):
    n = nsamp(dur)
    t = tvec(n)
    f = 220 * (1 + 0.6 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.2))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
    return Sound(norm(fades(np.vstack([y, y]), 0.001, 0.05)), onsets=[(0.0, "soft")])


def sfx_tick(rng, pitch=1.0):
    return S.sfx_counter_tick(rng, bright=pitch)


def sfx_thud(rng, size=1.0):
    n = nsamp(0.5)
    t = tvec(n)
    f = 60 + 80 * np.exp(-t / 0.03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.12 * size)) + 0.3 * lp(pink(n, rng), 400) * np.exp(-t / 0.05)
    return Sound(norm(fades(np.vstack([y, y]), 0.0005, 0.05)), onsets=[(0.0, "transient")])


def sfx_sparkle(rng, dur=0.9):
    n = nsamp(dur)
    t = tvec(n)
    y = np.zeros(n)
    for k in range(9):
        st = rng.uniform(0, dur * 0.6)
        m = rng.choice([96, 98, 100, 103, 105, 108])
        tt = np.clip(t - st, 0, None)
        y += (t >= st) * np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-tt / 0.12) * 0.5
    return Sound(norm(fades(np.vstack([y, np.roll(y, 60)]), 0.002, 0.08)), onsets=[(0.0, "soft")])


def sfx_record_scratch(rng, dur=0.45):
    n = nsamp(dur)
    t = tvec(n)
    f = 900 * (1 + 0.8 * np.sin(2 * np.pi * 3.2 * t))
    y = sweep_filter(white(n, rng), f, 4.0) * np.exp(-t / 0.25)
    return Sound(norm(fades(np.vstack([y, y]), 0.001, 0.04)), onsets=[(0.0, "transient")])


def sfx_stamp(rng):
    """Rubber stamp slam (verdicts, 'DENIED', 'FROZEN')."""
    n = nsamp(0.4)
    t = tvec(n)
    y = lp(pink(n, rng), 900) * np.exp(-t / 0.03) + np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.06) * 0.8
    return Sound(norm(fades(np.vstack([y, y]), 0.0005, 0.05)), onsets=[(0.0, "transient")])


def sfx_notify(rng):
    """Phone notification (two soft rising notes)."""
    n = nsamp(0.6)
    t = tvec(n)
    y = np.zeros(n)
    for st, m in ((0.0, 84), (0.11, 91)):
        tt = np.clip(t - st, 0, None)
        y += (t >= st) * np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-tt / 0.12)
    return Sound(norm(fades(np.vstack([y, y]), 0.001, 0.05)), onsets=[(0.0, "transient")])


def sfx_heart_pop(rng):
    return S.sfx_pop(rng, pitch=1.6)


EXTRA = {
    "whoosh": (sfx_whoosh, "ui"),
    "swoosh_up": (sfx_swoosh_up, "ui"),
    "riser": (sfx_riser, "ui"),
    "impact": (sfx_impact, "prop"),
    "sub_drop": (sfx_sub_drop, "ui"),
    "glitch": (sfx_glitch, "ui"),
    "shutter": (sfx_shutter, "prop"),
    "cash": (sfx_cash, "prop"),
    "typewriter": (sfx_typewriter, "prop"),
    "ding": (sfx_ding, "ui"),
    "click": (sfx_click, "ui"),
    "error_buzz": (sfx_error_buzz, "ui"),
    "success": (sfx_success, "ui"),
    "boing": (sfx_boing, "prop"),
    "tick": (sfx_tick, "ui"),
    "thud": (sfx_thud, "prop"),
    "sparkle": (sfx_sparkle, "ui"),
    "record_scratch": (sfx_record_scratch, "ui"),
    "stamp": (sfx_stamp, "prop"),
    "notify": (sfx_notify, "ui"),
    "heart_pop": (sfx_heart_pop, "ui"),
}
S.SFX.update(EXTRA)
