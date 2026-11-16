#!/usr/bin/env node
// render.mjs - final render(s) of a video: picture (H.264, CRF 18, yuv420p, bt709) + the mastered mix (AAC 256k),
// muxed explicitly (Remotion writes a silent track otherwise). Hook variants re-render ONLY the opening and reuse
// the body, so 5 variants cost ~1 render + 5 short segments.
//
//   node scripts/render.mjs <slug> [--variants] [--crf 18] [--concurrency 3] [--scale 1] [--fps-check]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { STUDIO, compId, getBundle, ff, ffprobe, arg, timelineOf } from "./lib/bundle.mjs";
import { withGpuSlot } from "./lib/gpulock.mjs";

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) {
  console.error("usage: node scripts/render.mjs <slug> [--variants] [--crf 18] [--concurrency 3] [--scale 1]");
  process.exit(1);
}
const tl = timelineOf(slug);
if (!tl.audio.hasMix) console.warn("! no mixed soundtrack yet (run scripts/sound.py) - the voice-only track will be used");
const crf = Number(arg(args, "--crf", "18"));
const concurrency = Number(arg(args, "--concurrency", String(Math.max(1, Math.min(3, Math.floor(os.cpus().length / 5))))));
const scale = Number(arg(args, "--scale", "1"));
const wantVariants = args.includes("--variants");
const vdir = path.join(STUDIO, "videos", slug);
const outDir = path.join(vdir, "renders");
fs.mkdirSync(outDir, { recursive: true });
const tmp = path.join(outDir, ".parts");
fs.mkdirSync(tmp, { recursive: true });

const audioFile = path.join(STUDIO, "public", tl.audio.hasMix ? tl.audio.mix : tl.audio.voice);
const serveUrl = await getBundle();
const id = compId(slug);

async function renderPart(variant, frameRange, out) {
  const comp = await selectComposition({ serveUrl, id, inputProps: { variant }, chromiumOptions: { gl: "angle" } });
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    serveUrl,
    composition: comp,
    codec: "h264",
    crf,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    x264Preset: "medium",
    muted: true,
    imageFormat: "jpeg",
    jpegQuality: 95,
    scale,
    concurrency,
    frameRange,
    inputProps: { variant },
    outputLocation: out,
    chromiumOptions: { gl: "angle" },
    timeoutInMilliseconds: 180000,
    overwrite: true,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== last) {
        last = p;
        process.stdout.write(`\r  rendering ${path.basename(out)} ${Math.round(progress * 100)}%   `);
      }
    },
  });
  process.stdout.write(`\r  rendered ${path.basename(out)} in ${((Date.now() - t0) / 1000).toFixed(0)}s            \n`);
}

function mux(video, out) {
  ff(["-i", video, "-i", audioFile, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", out]);
}

const total = tl.durationInFrames;
const main = path.join(outDir, `${slug}.mp4`);
const fullVideo = path.join(tmp, "full.mp4");
console.log(`render ${id}: ${total} frames @${tl.fps}fps, concurrency ${concurrency}${wantVariants ? `, ${tl.hook.variants} hook variants` : ""}`);
// one GPU slot for the whole render (stills and other renders wait: RAM and the iGPU are shared)
await withGpuSlot(`render ${id}`, async () => {
if (!wantVariants || tl.hook.variants <= 1) {
  await renderPart(0, [0, total - 1], fullVideo);
  mux(fullVideo, main);
} else {
  // the opening shot is the only one that changes between variants; cut after its outgoing transition settles
  const s2 = tl.shots[1];
  const boundary = Math.min(total - 1, (s2 ? s2.s : total) + 8);
  const body = path.join(tmp, "body.mp4");
  await renderPart(0, [boundary, total - 1], body);
  for (let v = 0; v < tl.hook.variants; v++) {
    const head = path.join(tmp, `head${v}.mp4`);
    await renderPart(v, [0, boundary - 1], head);
    const list = path.join(tmp, `list${v}.txt`);
    fs.writeFileSync(list, `file '${head.replace(/\\/g, "/")}'\nfile '${body.replace(/\\/g, "/")}'\n`);
    const joined = path.join(tmp, `joined${v}.mp4`);
    ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", joined]);
    const out = v === 0 ? main : path.join(outDir, `${slug}.hook${v + 1}.mp4`);
    mux(joined, out);
    console.log(`  -> ${path.relative(STUDIO, out)}`);
  }
}
});
const p = ffprobe(main);
const v = p.streams.find((s) => s.codec_type === "video");
const a = p.streams.find((s) => s.codec_type === "audio");
console.log(`done: ${path.relative(STUDIO, main)}  ${v.width}x${v.height} ${v.r_frame_rate} ${v.pix_fmt} | ${a?.codec_name} ${a?.sample_rate} Hz | ${(Number(p.format.size) / 1e6).toFixed(1)} MB, ${Number(p.format.duration).toFixed(2)}s`);
fs.rmSync(tmp, { recursive: true, force: true });
