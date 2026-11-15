#!/usr/bin/env node
// check.mjs - automated QA of a finished render (run it EVERY time before anyone watches the video).
//
//   node scripts/check.mjs <slug> [--file videos/<slug>/renders/<slug>.mp4] [--sheets]
//
// Hard fails (exit 1): wrong format, loudness/true peak out of spec, black frames, unplanned white flashes,
// frozen picture (>= 12 frames), mid-film blank stretch, voice not matching the script, narration starting late.
// Warnings: dead stretches (> 3 s without picture change), pops, slow hook, shots > 6.5 s, masked words, pacing.
// Thresholds come from measured viral shorts (see skills/reel/references/quality-bar.md).
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { STUDIO, ff, ffprobe, arg, timelineOf, readJson } from "./lib/bundle.mjs";

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) {
  console.error("usage: node scripts/check.mjs <slug> [--file path.mp4] [--sheets]");
  process.exit(1);
}
const vdir = path.join(STUDIO, "videos", slug);
const file = path.resolve(STUDIO, arg(args, "--file", path.join("videos", slug, "renders", `${slug}.mp4`)));
const qaDir = path.join(vdir, "qa");
fs.mkdirSync(qaDir, { recursive: true });
const tl = timelineOf(slug);
const script = readJson(path.join(vdir, "script.json"));
const fails = [];
const warns = [];
const notes = [];
const F = (m) => fails.push(m);
const W = (m) => warns.push(m);

// ---------------------------------------------------------------- 1. container + streams
if (!fs.existsSync(file)) {
  console.error(`no render at ${file}`);
  process.exit(1);
}
const pr = ffprobe(file);
const vs = pr.streams.find((s) => s.codec_type === "video");
const as = pr.streams.find((s) => s.codec_type === "audio");
const dur = Number(pr.format.duration);
if (!vs || vs.codec_name !== "h264") F(`video codec ${vs?.codec_name} (want h264)`);
if (vs && (vs.width !== tl.width || vs.height !== tl.height)) F(`size ${vs.width}x${vs.height} (want ${tl.width}x${tl.height})`);
if (vs && vs.pix_fmt !== "yuv420p") F(`pixel format ${vs.pix_fmt} (want yuv420p)`);
const [fn, fd] = (vs?.r_frame_rate ?? "0/1").split("/").map(Number);
if (Math.abs(fn / fd - tl.fps) > 0.01) F(`frame rate ${vs?.r_frame_rate} (want ${tl.fps})`);
if (!as) F("no audio stream");
else if (as.codec_name !== "aac" || Number(as.sample_rate) !== 48000) W(`audio ${as.codec_name} ${as.sample_rate} Hz (want aac 48000)`);
if (Math.abs(dur - tl.durationInFrames / tl.fps) > 0.15) F(`duration ${dur.toFixed(2)}s vs timeline ${(tl.durationInFrames / tl.fps).toFixed(2)}s`);
notes.push(`${vs?.width}x${vs?.height} ${tl.fps}fps ${dur.toFixed(2)}s ${(Number(pr.format.size) / 1e6).toFixed(1)} MB`);

// ---------------------------------------------------------------- 2. loudness (EBU R128) on the delivered file
let lufs = null;
let tp = null;
{
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
  const txt = (r.stderr || "") + (r.stdout || "");
  const mI = txt.match(/I:\s+(-?[\d.]+) LUFS/g);
  const mP = txt.match(/Peak:\s+(-?[\d.]+) dBFS/g);
  if (mI) lufs = Number(mI[mI.length - 1].match(/-?[\d.]+/)[0]);
  if (mP) tp = Number(mP[mP.length - 1].match(/-?[\d.]+/)[0]);
  if (lufs === null) W("could not measure loudness");
}
if (lufs !== null && Math.abs(lufs + 14) > 1.0) F(`integrated loudness ${lufs} LUFS (want -14 +-1)`);
if (tp !== null && tp > -0.9) F(`true peak ${tp} dBTP (want <= -1)`);
notes.push(`loudness ${lufs} LUFS, true peak ${tp} dBTP`);

// ---------------------------------------------------------------- 3. per-frame picture analysis (caption band masked)
const SW = 270;
const SH = 480;
const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `scale=${SW}:${SH}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
const N = Math.floor(raw.length / (SW * SH));
const capTop = Math.floor(SH * 0.55);
const capBot = Math.floor(SH * 0.75);
const mean = new Float64Array(N);
const diff = new Float64Array(N);
const varr = new Float64Array(N);
for (let i = 0; i < N; i++) {
  let s = 0;
  let s2 = 0;
  let d = 0;
  let cnt = 0;
  const o = i * SW * SH;
  for (let y = 0; y < SH; y++) {
    if (y >= capTop && y < capBot) continue; // captions change every word: judge the PICTURE
    for (let x = 0; x < SW; x++) {
      const v = raw[o + y * SW + x];
      s += v;
      s2 += v * v;
      if (i > 3) d += Math.abs(v - raw[o - 4 * SW * SH + y * SW + x]);
      cnt++;
    }
  }
  mean[i] = s / cnt / 255;
  varr[i] = s2 / cnt / 65025 - mean[i] * mean[i];
  diff[i] = i > 3 ? d / cnt / 255 / 4 : 0; // per-frame motion averaged over 4 frames
}
const seams = new Set();
for (const s of tl.shots) for (let k = -8; k <= 8; k++) seams.add(s.s + k);
const flashes = new Set();
const dips = new Set();
for (const s of tl.shots) {
  if (s.transitionIn === "flash") for (let k = 0; k < 5; k++) flashes.add(s.s + k);
  if (s.transitionIn === "dip") for (let k = -7; k <= 7; k++) dips.add(s.s + k);
}
let black = [];
let white = [];
for (let i = 0; i < N; i++) {
  if (mean[i] < 0.04 && !dips.has(i)) black.push(i);
  if (mean[i] > 0.93 && !flashes.has(i)) white.push(i);
}
if (black.length) F(`${black.length} black frames (first at frame ${black[0]})`);
if (white.length) F(`${white.length} unplanned white frames (first at ${white[0]})`);
if (varr[0] < 0.0015) F("frame 0 is (nearly) a flat colour - the first frame must already show the subject");
// frozen picture: >= 12 frames with (almost) no change
const FROZEN = 0.0006;
let run = 0;
const frozen = [];
for (let i = 4; i < N; i++) {
  if (diff[i] < FROZEN && !dips.has(i)) run++;
  else {
    if (run >= 12) frozen.push([i - run, i - 1]);
    run = 0;
  }
}
if (run >= 12) frozen.push([N - run, N - 1]);
const tailFreeze = frozen.filter(([a]) => a > N - tl.fps * 1.0);
const realFrozen = frozen.filter((r) => !tailFreeze.includes(r));
if (realFrozen.length) F(`frozen picture: ${realFrozen.map(([a, b]) => `${a}-${b}`).join(", ")} (every hold needs a creeping push-in)`);
// dead stretch: 3 s windows with very low motion
const win = tl.fps * 3;
const dead = [];
for (let i = 0; i + win < N; i += Math.floor(tl.fps / 2)) {
  let m = 0;
  for (let k = i; k < i + win; k++) m += diff[k];
  if (m / win < 0.0012) dead.push(i);
}
if (dead.length) W(`low-motion stretches (3 s) starting at frames ${dead.slice(0, 6).join(", ")} - add a camera move or an action`);
// pops: frame-diff spike > 3x local median outside seams
const pops = [];
for (let i = 2; i < N - 2; i++) {
  if (seams.has(i)) continue;
  const loc = [];
  for (let k = Math.max(1, i - 15); k < Math.min(N, i + 15); k++) if (k !== i) loc.push(diff[k]);
  loc.sort((a, b) => a - b);
  const med = loc[Math.floor(loc.length / 2)] ?? 0;
  const spike = diff[i] > 3 * med + 0.05;
  const isolated = diff[i - 1] < diff[i] * 0.45 && diff[i + 1] < diff[i] * 0.45;
  if (spike && isolated) pops.push(i);
}
if (pops.length) W(`${pops.length} picture pops (sudden jumps) at frames ${pops.slice(0, 8).join(", ")} - check for glitches`);
const avgMotion = diff.reduce((a, b) => a + b, 0) / N;
notes.push(`picture motion avg ${(avgMotion * 1000).toFixed(2)} (x1e-3), frozen spans ${realFrozen.length}, pops ${pops.length}`);

// ---------------------------------------------------------------- 4. timeline + script rules
const words = tl.words;
const first = words[0]?.start ?? 9;
if (first > 0.25) F(`narration starts at ${first.toFixed(2)}s (start speaking within 0.2 s)`);
const by3 = words.filter((w) => w.start < 3).length;
if (by3 < 7) W(`only ${by3} words spoken in the first 3 s (viral median ~9)`);
const span = (words[words.length - 1]?.end ?? 1) - first;
const wpm = (60 * words.length) / Math.max(1, span);
notes.push(`${words.length} words, ${wpm.toFixed(0)} wpm, ${by3} words by 3 s`);
if (wpm < 145) W(`pace ${wpm.toFixed(0)} wpm is slow for short-form (165-200 target)`);
if (wpm > 245) W(`pace ${wpm.toFixed(0)} wpm may be too fast to follow`);
const firstSentence = tl.beats[0]?.text ?? "";
const fsWords = firstSentence.split(/\s+/).filter(Boolean).length;
if (fsWords > 16) W(`first line is ${fsWords} words (hook line should be <= 12-16)`);
for (const s of tl.shots) {
  const L = (s.e - s.s) / tl.fps;
  if (L > 6.5) W(`shot ${s.id} lasts ${L.toFixed(1)}s - keep the picture changing every 1-2.5 s inside it`);
}
const D = tl.durationInFrames / tl.fps;
if (D < 20) W(`${D.toFixed(1)}s is short for most formats (median hit ~58 s; TikTok rewards >= 61 s)`);
if (D > 95) W(`${D.toFixed(1)}s is long for a short`);
for (const c of tl.captions) if (c.text.length > 22 && (tl.captionStyle.mode ?? "single") === "single") W(`caption "${c.text}" is long for one-word style`);
// voice + mix reports
const vc = path.join(vdir, "voice", "voice-check.json");
if (fs.existsSync(vc)) {
  const r = readJson(vc);
  notes.push(`voice ASR check WER ${(r.wer * 100).toFixed(1)}%`);
  if (r.wer > 0.12) F(`voice does not match the script (WER ${(r.wer * 100).toFixed(1)}%)`);
  else if (r.wer > 0.06) W(`voice ASR differences: ${r.diffs.slice(0, 4).join("; ")}`);
} else W("voice not verified (run voice.py --verify)");
const mr = path.join(vdir, "audio", "mix-report.json");
if (fs.existsSync(mr)) {
  const r = readJson(mr);
  if (r.masked?.length) W(`voice masked by music/sfx on ${r.masked.length} words: ${r.masked.slice(0, 4).join(", ")}`);
} else W("no mix report (run sound.py)");
if (!tl.audio.hasMix) F("the render has no mixed soundtrack (run sound.py before render.mjs)");
// facts must have sources
const facts = path.join(vdir, "research.md");
if (!fs.existsSync(facts)) W("no research.md with sources next to the script");

// ---------------------------------------------------------------- 5. contact sheets for the critic
if (args.includes("--sheets") || true) {
  const every = 1.0;
  ff(["-i", file, "-vf", `fps=${1 / every},scale=216:-1,drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=6x3:padding=4:color=gray`, "-q:v", "3", path.join(qaDir, "sheet_%02d.jpg")]);
}

// ---------------------------------------------------------------- report
const report = { slug, file: path.relative(STUDIO, file), pass: fails.length === 0, fails, warns, notes, lufs, truePeak: tp, wpm: Math.round(wpm), frames: N };
fs.writeFileSync(path.join(qaDir, "report.json"), JSON.stringify(report, null, 1));
const md = [
  `# QA: ${slug}`,
  ``,
  `**${report.pass ? "PASS" : "FAIL"}** · ${notes.join(" · ")}`,
  ``,
  ...(fails.length ? ["## Fails", ...fails.map((x) => `- ${x}`), ""] : []),
  ...(warns.length ? ["## Warnings", ...warns.map((x) => `- ${x}`), ""] : []),
  `Contact sheets: qa/sheet_*.jpg (1 frame per second).`,
].join("\n");
fs.writeFileSync(path.join(qaDir, "report.md"), md);
console.log(md);
process.exit(fails.length ? 1 : 0);
