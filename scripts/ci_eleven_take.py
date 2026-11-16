"""ci_eleven_take.py - the GitHub Actions side of a voice take (stdlib only; .github/workflows/voice-take.yml).

The ElevenLabs key lives only in the repo secret KEYFORVIDS (GitHub never hands it to a laptop), so a take is
recorded on GitHub: a session commits videos/<slug>/voice/take-request.json and pushes; this script records it and
the workflow commits videos/<slug>/voice/take.mp3 back to the same branch. Request shape:
  {"id": "<any string; a new id = a new take>", "check": false, "text": "<one beat per line>",
   "voice": "<voice id>", "model": "eleven_v4", "settings": {...}}
"check": true only verifies the key, the quota and the voice (no cost). The key is never printed.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.elevenlabs.io/v1"


def call(url: str, key: str, body: dict | None = None, raw: bool = False):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers={"xi-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            b = r.read()
            return b if raw else json.loads(b)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs HTTP {e.code}: {e.read()[:300]!r}")


def main():
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        sys.exit("the KEYFORVIDS secret is empty or not visible to this workflow")
    changed = [Path(p) for p in sys.argv[1:] if p.endswith("take-request.json") and Path(p).exists()]
    if not changed:
        print("no take request in this push")
        return
    for req_p in changed:
        req = json.loads(req_p.read_text(encoding="utf-8"))
        vdir = req_p.parent
        done_p = vdir / "take.done.json"
        sub = call(f"{API}/user/subscription", key)
        left = int(sub.get("character_limit", 0)) - int(sub.get("character_count", 0))
        voice = call(f"{API}/voices/{req['voice']}", key)
        info = {"id": req.get("id"), "tier": sub.get("tier"), "characters_left_before": left, "voice": voice.get("name"), "chars": len(req.get("text", ""))}
        print(f"{req_p}: key ok | tier {info['tier']} | characters left {left} | voice '{info['voice']}'")
        if req.get("check"):
            done_p.write_text(json.dumps({**info, "check": True}, indent=1), encoding="utf-8")
            continue
        if done_p.exists() and json.loads(done_p.read_text(encoding="utf-8")).get("id") == req.get("id") and (vdir / "take.mp3").exists():
            print("this request id was already recorded: skipped")
            continue
        body = {"text": req["text"], "model_id": req.get("model", "eleven_v4")}
        if req.get("settings"):
            body["voice_settings"] = req["settings"]
        audio = call(f"{API}/text-to-speech/{req['voice']}?output_format=mp3_44100_192", key, body, raw=True)
        (vdir / "take.mp3").write_bytes(audio)
        done_p.write_text(json.dumps({**info, "check": False, "bytes": len(audio)}, indent=1), encoding="utf-8")
        print(f"wrote {vdir / 'take.mp3'} ({len(audio) // 1024} KB, {info['chars']} chars)")


if __name__ == "__main__":
    main()
