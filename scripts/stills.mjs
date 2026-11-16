#!/usr/bin/env node
// stills.mjs - render chosen frames of a composition as JPEGs + one labelled contact sheet (for look-dev and QA).
//
//   node scripts/stills.mjs <compositionId> [--frames 0,30,60 | --every 15 | --shots <slug>] [--out out/stills/<id>]
//                           [--props '{"variant":1}'] [--scale 0.5] [--sheet 4]
//
// --shots <slug> picks, for every shot of that video: its first frame, its middle and 2 frames after each
// starred keyword; that is the frame set the critic reviews.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { withGpuSlot } from "./lib/gpulock.mjs";
import { renderStill, selectComposition } from "@remotion/renderer";

const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const id = args[0];
const opt = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
if (!id) {
  console.error("usage: node scripts/stills.mjs <compositionId> [--frames a,b,c] [--every N] [--shots slug] [--out dir] [--props json] [--scale 0.5]");
  process.exit(1);
}
const outDir = path.resolve(STUDIO, opt("--out", path.join("out", "stills", id)));
fs.mkdirSync(outDir, { recursive: true });
const scale = Number(opt("--scale", "0.5"));
const inputProps = JSON.parse(opt("--props", "{}"));

export async function getBundle() {
  // separate from render.mjs so both can run at once; NOMEN_BUNDLE_DIR gives parallel jobs their own folder
  const bdir = process.env.NOMEN_BUNDLE_DIR ? path.resolve(STUDIO, process.env.NOMEN_BUNDLE_DIR) : path.join(STUDIO, "out", "bundle-stills");
  return bundle({
    entryPoint: path.join(STUDIO, "src", "index.ts"),
    outDir: bdir,
    publicDir: path.join(STUDIO, "public"),
    onProgress: () => {},
  });
}

const serveUrl = await getBundle();
let frames = [];
const files = [];
// one GPU slot for the whole Chrome session (other stills / renders wait: RAM and the iGPU are shared)
await withGpuSlot(`stills ${id}`, async () => {
const comp = await selectComposition({ serveUrl, id, inputProps, chromiumOptions: { gl: "angle" } });
if (opt("--frames")) frames = opt("--frames").split(",").map(Number);
else if (opt("--every")) for (let f = 0; f < comp.durationInFrames; f += Number(opt("--every"))) frames.push(f);
else if (opt("--shots")) {
  const tl = JSON.parse(fs.readFileSync(path.join(STUDIO, "src", "videos", opt("--shots"), "timeline.json"), "utf8"));
  for (const s of tl.shots) {
    frames.push(s.s + 2, Math.round((s.s + s.e) / 2));
    for (const w of tl.words) if (w.emph && s.beats.includes(w.beat)) frames.push(w.s + 2);
  }
} else frames = [0, Math.floor(comp.durationInFrames / 2), comp.durationInFrames - 1];
frames = [...new Set(frames.filter((f) => f >= 0 && f < comp.durationInFrames))].sort((a, b) => a - b);
const t0 = Date.now();
for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(5, "0")}.jpg`);
  await renderStill({
    serveUrl,
    composition: comp,
    frame: f,
    output,
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 88,
    scale,
    chromiumOptions: { gl: "angle" },
    overwrite: true,
    timeoutInMilliseconds: 120000,
  });
  files.push(output);
  process.stdout.write(`  still ${f} `);
}
console.log(`\n${files.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outDir}`);
});
// contact sheet with frame numbers burned in
const cols = Number(opt("--sheet", String(Math.min(4, files.length))));
try {
  const list = path.join(outDir, "list.txt");
  const inputs = [];
  files.forEach((f) => inputs.push("-i", f));
  const n = files.length;
  const w = Math.round(1080 * scale * 0.5);
  const parts = files.map(
    (_, i) =>
      `[${i}:v]scale=${w}:-1,drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='${frames[i]}':x=8:y=8:fontsize=${Math.round(w / 12)}:fontcolor=yellow:box=1:boxcolor=black@0.7[v${i}]`,
  );
  const rows = Math.ceil(n / cols);
  const pad = rows * cols - n;
  let chain = parts.join(";");
  const labels = files.map((_, i) => `[v${i}]`).join("");
  if (pad > 0) {
    for (let i = 0; i < pad; i++) chain += `;color=gray:s=${w}x${Math.round((w * 16) / 9)}:d=1[p${i}]`;
  }
  const all = labels + Array.from({ length: pad }, (_, i) => `[p${i}]`).join("");
  chain += `;${all}xstack=inputs=${n + pad}:layout=${Array.from({ length: n + pad }, (_, i) => `${(i % cols) === 0 ? "0" : Array.from({ length: i % cols }, () => "w0").join("+")}_${Math.floor(i / cols) === 0 ? "0" : Array.from({ length: Math.floor(i / cols) }, () => "h0").join("+")}`).join("|")}:fill=gray[out]`;
  if (n + pad === 1) chain = `${parts[0]};[v0]null[out]`;
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", chain, "-map", "[out]", "-frames:v", "1", "-q:v", "3", path.join(outDir, "sheet.jpg")]);
  fs.rmSync(list, { force: true });
  console.log(`sheet -> ${path.join(outDir, "sheet.jpg")}`);
} catch (e) {
  console.log("(contact sheet failed: " + String(e).slice(0, 200) + ")");
}
