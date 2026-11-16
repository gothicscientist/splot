"""eleven-take.py - record ONE full ElevenLabs narration take for a reel (the take flow of skills/reel step 5).

    PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/eleven-take.py <slug> --check   # free: key, quota, voice
    PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe scripts/eleven-take.py <slug>           # writes voice/take.mp3

The text is voice.py's take prompt (one beat per line, `takeText` / `direction` / `voice.ipa` applied). Voice id,
model and settings come from script.json `voice.take` ({"voice": id, "model": "eleven_v4", "settings": {...}}),
defaulting to the house storyteller voice. The key comes from ELEVENLABS_API_KEY (env, then the .env files) and is
never printed. Afterwards set "voice.provider": "take" and run voice.py <slug> --verify (alignment + ASR check).
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib.util  # noqa: E402

spec = importlib.util.spec_from_file_location("voice", Path(__file__).resolve().parent / "voice.py")
voice = importlib.util.module_from_spec(spec)
spec.loader.exec_module(voice)
from lib.common import die, load_env, log, read_json, video_dir  # noqa: E402

HOUSE = {"voice": "VCgLBmBjldJmfphyB8sZ", "model": "eleven_v4"}  # "Liam - Viral Short-Form Storyteller"


def get(url: str, key: str) -> dict:
    req = urllib.request.Request(url, headers={"xi-api-key": key})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--check", action="store_true", help="only check the key, the quota and the voice (no cost)")
    ap.add_argument("--force", action="store_true", help="overwrite an existing take.mp3")
    a = ap.parse_args()
    vdir = video_dir(a.slug)
    script = read_json(vdir / "script.json")
    cfg = {**HOUSE, **((script.get("voice") or {}).get("take") or {})}
    key = load_env().get("ELEVENLABS_API_KEY")
    if not key:
        die("ELEVENLABS_API_KEY is not set in this session (env or .env files)")
    text = voice.take_prompt(script)
    if a.check:
        sub = get("https://api.elevenlabs.io/v1/user/subscription", key)
        left = int(sub.get("character_limit", 0)) - int(sub.get("character_count", 0))
        v = get(f"https://api.elevenlabs.io/v1/voices/{cfg['voice']}", key)
        log(f"key ok | tier {sub.get('tier')} | characters left {left} | voice '{v.get('name')}' | take needs ~{len(text)} chars")
        return
    out = vdir / "voice" / "take.mp3"
    if out.exists() and not a.force:
        die(f"{out} exists (pass --force to re-record)")
    out.parent.mkdir(parents=True, exist_ok=True)
    log(f"recording {len(text)} chars with voice {cfg['voice']} ({cfg['model']})")
    align = voice.tts_elevenlabs(text, cfg["voice"], key, out, cfg.get("settings"), cfg["model"])
    (vdir / "voice" / "take.alignment.json").write_text(json.dumps(align or {}), encoding="utf-8")
    log(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
