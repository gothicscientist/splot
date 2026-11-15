#!/usr/bin/env python3
"""Forced alignment + speech check. Runs inside a Python that has whisperx (see lib/common.find_align_python).

    python align_words.py job.json out.json

job.json:
  {"language": "en",
   "items": [{"id": "b01", "wav": "<16 kHz mono wav>", "words": ["how", "could", ...]}],
   "transcribe": [{"id": "full", "wav": "<16 kHz mono wav>"}]     # optional ASR check
  }
out.json:
  {"items": {"b01": [[start, end, score] | null, ...]}, "transcripts": {"full": "text ..."}}

The aligner is given the exact words the voice was asked to read, so it only has to find WHEN each one is said.
"""
import json
import os
import sys
import time
import warnings

warnings.filterwarnings("ignore")
os.environ.setdefault("PYANNOTE_METRICS_ENABLED", "0")


def main():
    job_path, out_path = sys.argv[1], sys.argv[2]
    with open(job_path, encoding="utf-8") as f:
        job = json.load(f)
    import whisperx  # noqa: E402

    lang = job.get("language", "en")
    device = "cpu"
    out = {"items": {}, "transcripts": {}}
    items = job.get("items", [])
    if items:
        t0 = time.time()
        model, meta = whisperx.load_align_model(language_code=lang, device=device)
        print(f"[align] model ready in {time.time() - t0:.1f}s; {len(items)} clips", flush=True)
        for it in items:
            words = [w for w in it["words"] if w]
            audio = whisperx.load_audio(it["wav"])
            dur = len(audio) / 16000.0
            res = [None] * len(it["words"])
            if words:
                text = " ".join(words)
                try:
                    r = whisperx.align([{"start": 0.0, "end": dur, "text": text}], model, meta, audio, device,
                                       return_char_alignments=False)
                    segs = r.get("word_segments", [])
                except Exception as e:  # never crash the batch; caller interpolates
                    print(f"[align] {it['id']}: {type(e).__name__}: {e}", flush=True)
                    segs = []
                # map back sequentially onto the requested word list (skipping empty entries)
                j = 0
                for k, w in enumerate(it["words"]):
                    if not w:
                        continue
                    while j < len(segs) and segs[j].get("word", "").strip().lower() != w.lower():
                        j += 1
                    if j < len(segs):
                        s = segs[j]
                        if "start" in s and "end" in s:
                            res[k] = [round(float(s["start"]), 4), round(float(s["end"]), 4), round(float(s.get("score", 0.0)), 3)]
                        j += 1
            out["items"][it["id"]] = res
    tr = job.get("transcribe", [])
    if tr:
        t0 = time.time()
        asr = whisperx.load_model(job.get("asr_model", "small"), device, compute_type="int8", language=lang)
        print(f"[asr] model ready in {time.time() - t0:.1f}s", flush=True)
        for it in tr:
            audio = whisperx.load_audio(it["wav"])
            r = asr.transcribe(audio, batch_size=8, language=lang)
            out["transcripts"][it["id"]] = " ".join(s.get("text", "").strip() for s in r.get("segments", []))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print("[align] done", flush=True)


if __name__ == "__main__":
    main()
