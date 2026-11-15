"""Shared helpers for the Nomen Studio pipeline scripts (paths, config, audio I/O, ffmpeg)."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

STUDIO = Path(os.environ.get("NOMEN_STUDIO", Path(__file__).resolve().parents[2]))
VIDEOS = STUDIO / "videos"
PUBLIC = STUDIO / "public" / "v"
SRC_VIDEOS = STUDIO / "src" / "videos"
HOME_CFG = Path.home() / ".config" / "nomen-studio" / ".env"


def log(*a):
    print(*a, flush=True)


def die(msg: str, code: int = 1):
    print(f"ERROR: {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


def load_env() -> dict[str, str]:
    """Keys come from the environment, then ~/.config/nomen-studio/.env, then <studio>/.env (never printed)."""
    env: dict[str, str] = {}
    for f in (STUDIO / ".env", HOME_CFG):
        if f.exists():
            for line in f.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                v = v.strip().strip('"').strip("'")
                if v:
                    env[k.strip()] = v
    env.update({k: v for k, v in os.environ.items() if v})
    return env


def video_dir(slug: str) -> Path:
    d = VIDEOS / slug
    if not d.exists():
        die(f"no video folder {d} (create it with: node scripts/new-video.mjs {slug})")
    return d


def read_json(p: Path):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def write_json(p: Path, obj, indent: int = 1):
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(p.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=indent)
    os.replace(tmp, p)


def sha(*parts) -> str:
    h = hashlib.sha1()
    for p in parts:
        h.update(json.dumps(p, sort_keys=True, ensure_ascii=False).encode("utf-8"))
        h.update(b"\x00")
    return h.hexdigest()[:16]


def ffmpeg_bin() -> str:
    return os.environ.get("FFMPEG_PATH") or shutil.which("ffmpeg") or "ffmpeg"


def ffprobe_bin() -> str:
    return os.environ.get("FFPROBE_PATH") or shutil.which("ffprobe") or "ffprobe"


def run(cmd: list[str], check: bool = True, capture: bool = True) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=capture, text=True, encoding="utf-8", errors="replace")
    if check and r.returncode != 0:
        raise RuntimeError(f"command failed ({r.returncode}): {' '.join(cmd[:6])} ...\n{(r.stderr or '')[-2000:]}")
    return r


def to_wav(src: Path, dst: Path, sr: int = 48000, filters: str | None = None):
    cmd = [ffmpeg_bin(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-ac", "1", "-ar", str(sr)]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-c:a", "pcm_s16le", str(dst)]
    run(cmd)


def read_wav_mono(path: Path) -> tuple[int, np.ndarray]:
    with wave.open(str(path), "rb") as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    if sw == 2:
        x = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    elif sw == 3:
        b = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 3)
        i = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
        i = np.where(i >= 1 << 23, i - (1 << 24), i)
        x = i.astype(np.float32) / float(1 << 23)
    elif sw == 4:
        x = np.frombuffer(raw, dtype="<i4").astype(np.float32) / float(1 << 31)
    else:
        raise ValueError(f"unsupported sample width {sw}")
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return sr, x


def write_wav_mono(path: Path, x: np.ndarray, sr: int = 48000):
    path.parent.mkdir(parents=True, exist_ok=True)
    y = np.clip(x, -1.0, 1.0)
    pcm = (y * 32767.0).astype("<i2").tobytes()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm)


def find_align_python(env: dict[str, str]) -> str | None:
    """A Python that has whisperx (forced alignment + ASR check)."""
    cands = [env.get("NOMEN_ALIGN_PYTHON"),
             str(Path.home() / ".cache" / "watch" / "whisperx-venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")),
             str(STUDIO / ".venv-align" / ("Scripts/python.exe" if os.name == "nt" else "bin/python"))]
    for c in cands:
        if c and Path(c).exists():
            return c
    return None
