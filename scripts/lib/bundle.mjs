// Shared helpers for the Node pipeline scripts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";

export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const compId = (slug) => "v-" + slug.replace(/[^a-zA-Z0-9-]/g, "-");
export const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
export const timelineOf = (slug) => readJson(path.join(STUDIO, "src", "videos", slug, "timeline.json"));

/** Bundle once into a fixed folder (Remotion otherwise leaves a copy of public/ in TEMP on every run). */
export async function getBundle() {
  return bundle({
    entryPoint: path.join(STUDIO, "src", "index.ts"),
    outDir: path.join(STUDIO, "out", "bundle"),
    publicDir: path.join(STUDIO, "public"),
    onProgress: () => {},
  });
}

export function ff(args, opts = {}) {
  return execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
}
export function ffprobe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels,bit_rate:format=duration,size,bit_rate", "-of", "json", file], { encoding: "utf8" });
  return JSON.parse(out);
}
export const arg = (args, k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
