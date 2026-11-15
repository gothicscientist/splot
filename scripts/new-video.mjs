#!/usr/bin/env node
// new-video.mjs - scaffold a video workspace.
//
//   node scripts/new-video.mjs <slug> --style stickworld|blockcraft|glowvector|atlas --mode case-file|what-if|... [--title "..."]
//
// Creates videos/<slug>/ (brief.md, research.md, script.json skeleton) and src/videos/<slug>/index.tsx with a
// placeholder scene per shot (so timing can be previewed before any art exists). Run again with --scenes to
// regenerate index.tsx from the current timeline's shots (never overwrites existing scene files).
import fs from "node:fs";
import path from "node:path";
import { STUDIO, arg } from "./lib/bundle.mjs";

const args = process.argv.slice(2);
const slug = args[0];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("usage: node scripts/new-video.mjs <slug: lowercase-with-dashes> --style stickworld --mode case-file [--title '...']");
  process.exit(1);
}
const style = arg(args, "--style", "stickworld");
const mode = arg(args, "--mode", "case-file");
const title = arg(args, "--title", slug.replace(/-/g, " "));
const vdir = path.join(STUDIO, "videos", slug);
const sdir = path.join(STUDIO, "src", "videos", slug);
fs.mkdirSync(vdir, { recursive: true });
fs.mkdirSync(sdir, { recursive: true });
const write = (p, s) => {
  if (!fs.existsSync(p)) fs.writeFileSync(p, s);
};
const CAPTION = { stickworld: "boxed", blockcraft: "pixel", glowvector: "clean", atlas: "bold-pop" };
write(
  path.join(vdir, "brief.md"),
  `# ${title}\n\n- mode: ${mode}\n- style: ${style}\n- platform: tiktok + reels + shorts\n- target length: 45-62 s\n- audience:\n- the one thing the viewer should feel/learn:\n- reference videos (outliers) and what we copy from them (structure, hook pattern, pacing):\n`,
);
write(path.join(vdir, "research.md"), `# Research: ${title}\n\n| # | fact (as it will be said) | source URL | checked |\n|---|---|---|---|\n`);
write(
  path.join(vdir, "script.json"),
  JSON.stringify(
    {
      slug,
      title,
      mode,
      style,
      language: "en",
      fps: 30,
      voice: { provider: "auto", wpm: 175 },
      music: { mood: null },
      captions: { preset: CAPTION[style] ?? "bold-pop" },
      pronounce: {},
      hooks: [],
      hookVariants: [],
      beats: [{ id: "b01", shot: "s01", role: "hook", text: "Replace me with the hook line.", visual: "", sfx: [] }],
    },
    null,
    1,
  ),
);
// index.tsx from the timeline's shots (if a timeline exists) or a single placeholder
const tlp = path.join(sdir, "timeline.json");
const shots = fs.existsSync(tlp) ? JSON.parse(fs.readFileSync(tlp, "utf8")).shots.map((s) => s.id) : ["s01"];
const idx = path.join(sdir, "index.tsx");
if (!fs.existsSync(idx) || args.includes("--scenes")) {
  const existing = fs.existsSync(idx) ? fs.readFileSync(idx, "utf8") : "";
  if (!existing.includes("// scenes: hand-written")) {
    const src = `// ${title} (${style}, ${mode}). Each shot id from the timeline maps to one scene component.
// Replace Placeholder with real scenes (see the style skill for the kit). Keep "// scenes: hand-written" once edited.
import React from "react";
import { Reel } from "../../core/Reel";
import { Placeholder } from "../../core/Placeholder";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel
    timeline={timeline}
    variant={variant}
    scenes={{
${shots.map((s) => `      ${s}: Placeholder,`).join("\n")}
    }}
  />
);
`;
    fs.writeFileSync(idx, src);
  }
}
console.log(`scaffolded ${slug}: videos/${slug}/ (brief, research, script.json) + src/videos/${slug}/index.tsx (${shots.length} shot(s))`);
