#!/usr/bin/env node
// timeline.mjs - videos/<slug>/script.json + voice/words.json -> src/videos/<slug>/timeline.json
//
// The timeline is the single clock for picture, captions and sound: every frame number the scenes, the
// captions and sound.py use comes from here, so re-voicing a line can never desync anything.
//
//   node scripts/timeline.mjs <slug> [--fps 30]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: node scripts/timeline.mjs <slug> [--fps 30]");
  process.exit(1);
}
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > 0 ? process.argv[i + 1] : d;
};
const vdir = path.join(STUDIO, "videos", slug);
const script = JSON.parse(fs.readFileSync(path.join(vdir, "script.json"), "utf8"));
const wordsFile = path.join(vdir, "voice", "words.json");
if (!fs.existsSync(wordsFile)) {
  console.error(`missing ${wordsFile} - run: .venv/Scripts/python scripts/voice.py ${slug}`);
  process.exit(1);
}
const voice = JSON.parse(fs.readFileSync(wordsFile, "utf8"));
const fps = Number(arg("--fps", script.fps ?? 30));
const W = script.width ?? 1080;
const H = script.height ?? 1920;
const F = (sec) => Math.round(sec * fps);

// ---------------------------------------------------------------- words
const words = voice.words.map((w) => ({
  i: w.i,
  beat: w.beat,
  text: w.text,
  start: w.start,
  end: w.end,
  s: F(w.start),
  e: Math.max(F(w.start) + 1, F(w.end)),
  emph: !!w.emph,
}));

// ---------------------------------------------------------------- beats
const vb = new Map(voice.beats.map((b) => [b.id, b]));
const beats = script.beats.map((b) => {
  const v = vb.get(b.id);
  if (!v) throw new Error(`beat ${b.id} has no voice timing - re-run voice.py`);
  const ws = words.filter((w) => w.beat === b.id);
  return {
    id: b.id,
    shot: b.shot ?? b.id,
    role: b.role ?? null,
    text: b.text.replace(/\*/g, ""),
    s: F(v.start),
    speechEnd: F(v.speechEnd),
    e: F(v.end),
    words: ws.length ? [ws[0].i, ws[ws.length - 1].i] : [-1, -1],
    transition: b.transition ?? null,
  };
});

// ---------------------------------------------------------------- shots (one visual set-up each; zero hard cuts)
const LEAD = Math.round(0.1 * fps); // picture changes ~0.1 s before the first word of a shot
const shots = [];
for (const b of beats) {
  let sh = shots.find((s) => s.id === b.shot);
  if (!sh) {
    sh = { id: b.shot, beats: [], s: 0, e: 0, transitionIn: null };
    shots.push(sh);
  }
  sh.beats.push(b.id);
}
const total = Math.ceil(voice.duration * fps);
shots.forEach((sh, k) => {
  const first = beats.find((b) => b.id === sh.beats[0]);
  sh.s = k === 0 ? 0 : Math.max(0, first.s - LEAD);
  const tr = (script.shots && script.shots[sh.id] && script.shots[sh.id].transition) || first.transition;
  sh.transitionIn = k === 0 ? null : tr ?? script.defaultTransition ?? "whip";
});
shots.forEach((sh, k) => {
  sh.e = k + 1 < shots.length ? shots[k + 1].s : total;
});

// ---------------------------------------------------------------- captions
const FUNCTION_WORDS = new Set(
  "a an the of to in on at for by with and or but is was are were be it its it's my your his her our their this that these those i you we he she they so as if no not than then from into onto up out over just very".split(" "),
);
const MAGNITUDE = new Set(["hundred", "thousand", "million", "billion", "trillion", "percent", "%", "dollars", "years", "times"]);
const bare = (t) => t.toLowerCase().replace(/[^a-z0-9$%']/g, "");
const isNumberish = (t) => /[0-9]/.test(t);
const cfg = { mode: "single", maxChars: 16, maxWords: 3, ...(script.captions ?? {}) };

function chunkWords(list) {
  const chunks = [];
  let cur = [];
  const flush = () => {
    if (cur.length) chunks.push(cur);
    cur = [];
  };
  for (let k = 0; k < list.length; k++) {
    const w = list[k];
    const prev = cur[cur.length - 1];
    if (prev) {
      const sameBeat = prev.beat === w.beat;
      const len = cur.map((x) => x.text).join(" ").length + 1 + w.text.length;
      const prevEndsSentence = /[.!?…:]$/.test(prev.text) || /,$/.test(prev.text);
      let join = false;
      if (cfg.mode === "phrase") {
        join = sameBeat && !prevEndsSentence && cur.length < cfg.maxWords && len <= cfg.maxChars + 6;
      } else {
        const prevFn = cur.every((x) => FUNCTION_WORDS.has(bare(x.text)));
        const numUnit = isNumberish(prev.text) && MAGNITUDE.has(bare(w.text));
        const keyPhrase = prev.emph && w.emph; // a starred phrase stays one caption ("Eiffel Tower")
        join = sameBeat && !prevEndsSentence && (prevFn || numUnit || keyPhrase) && len <= cfg.maxChars + (keyPhrase ? 6 : 0) && cur.length < cfg.maxWords;
      }
      if (!join) flush();
    }
    cur.push(w);
  }
  flush();
  return chunks;
}
const chunks = chunkWords(words);
const captions = chunks.map((c, k) => {
  const next = chunks[k + 1];
  const s = c[0].s;
  const last = c[c.length - 1];
  let e = next ? next[0].s : last.e + Math.round(0.35 * fps);
  if (next && next[0].s - last.e > Math.round(0.55 * fps)) e = last.e + Math.round(0.3 * fps); // long pause: clear
  return {
    text: c.map((w) => w.text).join(" "),
    words: c.map((w) => w.i),
    s,
    e: Math.max(e, s + 2),
    emph: c.some((w) => w.emph),
    beat: c[0].beat,
  };
});

// ---------------------------------------------------------------- write
const out = {
  version: 2,
  slug,
  title: script.title ?? slug,
  fps,
  width: W,
  height: H,
  durationInFrames: total,
  style: script.style ?? "stickworld",
  mode: script.mode ?? "explainer",
  captionStyle: { preset: "bold-pop", ...(script.captions ?? {}) },
  hook: { shot: shots[0].id, variants: Math.max(1, (script.hookVariants ?? []).length || 1) },
  audio: { mix: `v/${slug}/mix.wav`, voice: `v/${slug}/voice.wav` },
  words,
  beats,
  shots,
  captions,
};
const dst = path.join(STUDIO, "src", "videos", slug.replace(/[^a-zA-Z0-9_-]/g, "_"));
fs.mkdirSync(dst, { recursive: true });
fs.writeFileSync(path.join(dst, "timeline.json"), JSON.stringify(out));
// voice for preview / fallback when no mix exists yet
const pub = path.join(STUDIO, "public", "v", slug);
fs.mkdirSync(pub, { recursive: true });
fs.copyFileSync(path.join(vdir, "voice", "voice.wav"), path.join(pub, "voice.wav"));
const dur = (total / fps).toFixed(2);
console.log(`timeline: ${dur}s @${fps}fps, ${beats.length} beats, ${shots.length} shots, ${captions.length} caption chunks -> ${path.relative(STUDIO, dst)}/timeline.json`);
const longest = Math.max(...shots.map((s) => (s.e - s.s) / fps));
if (longest > 6.5) console.log(`! longest shot is ${longest.toFixed(1)}s - split it or keep the camera moving (retention drops on static shots)`);
