// Render a frame range of a video to an MP4 without audio, for checking a fix in a real multi-tab render
// (stills render one frame per page; some bugs, like canvas text drawn before its font loaded, only show here).
//   node scripts/render-range.mjs <slug> <from> <to> [--concurrency 2] [--variant 0] [--out out/range-<slug>.mp4]
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { STUDIO, compId, getBundle, arg } from "./lib/bundle.mjs";
import { withGpuSlot } from "./lib/gpulock.mjs";

const args = process.argv.slice(2);
const [slug, a, b] = args;
if (!slug || a === undefined || b === undefined) {
  console.error("usage: node scripts/render-range.mjs <slug> <from> <to> [--concurrency 2] [--variant 0] [--out file.mp4]");
  process.exit(2);
}
const concurrency = Number(arg(args, "--concurrency", "2"));
const variant = Number(arg(args, "--variant", "0"));
const out = path.resolve(STUDIO, arg(args, "--out", path.join("out", `range-${slug}.mp4`)));
const serveUrl = await getBundle();
const id = compId(slug);
await withGpuSlot(`range ${id}`, async () => {
const comp = await selectComposition({ serveUrl, id, inputProps: { variant }, chromiumOptions: { gl: "angle" } });
await renderMedia({
  serveUrl,
  composition: comp,
  codec: "h264",
  muted: true,
  outputLocation: out,
  inputProps: { variant },
  concurrency,
  chromiumOptions: { gl: "angle" },
  frameRange: [Number(a), Number(b)],
  crf: 18,
});
});
console.log(`range ${a}-${b} -> ${out}`);
