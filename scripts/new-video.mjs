#!/usr/bin/env node
// new-video.mjs - scaffold a video workspace.
//
//   node scripts/new-video.mjs <slug> --style stickworld|blockcraft|glowvector|atlas --mode case-file|what-if|...|tiff|ug-rap [--title "..."]
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
const mode = arg(args, "--mode", "case-file");
const style = arg(args, "--style", "stickworld");
// story modes: channel defaults (skills/reel/references/modes/tiff.md, ug-rap.md)
const STORY = {
  tiff: {
    channel: "tiff",
    voice: { provider: "auto", voice: "en-US-AvaMultilingualNeural", rate: "+6%", wpm: 192, cast: {} },
    music: { mood: "plugg" },
    captions: { preset: "lower" },
    series: { name: "Tiff", episode: 1 },
  },
  "ug-rap": {
    channel: "ug",
    voice: { provider: "auto", voice: "en-US-BrianMultilingualNeural", rate: "+6%", wpm: 188, cast: {} },
    music: { mood: "rage" },
    captions: { preset: "boxed" },
    series: { name: "", episode: 1 },
    subject: { kind: "bio", name: "", real: true },
  },
}[mode];
const title = arg(args, "--title", slug.replace(/-/g, " "));
const vdir = path.join(STUDIO, "videos", slug);
const sdir = path.join(STUDIO, "src", "videos", slug);
fs.mkdirSync(vdir, { recursive: true });
fs.mkdirSync(sdir, { recursive: true });
const write = (p, s) => {
  if (!fs.existsSync(p)) fs.writeFileSync(p, s);
};
const CAPTION = { stickworld: "boxed", blockcraft: "chunky", glowvector: "clean", atlas: "bold-pop" };
write(
  path.join(vdir, "brief.md"),
  STORY
    ? `# ${title}\n\n- mode: ${mode} (channel: ${STORY.channel})\n- style: ${style}\n- premise (the owner's words):\n- episode: ${STORY.series.episode} (series "${STORY.series.name}")\n- format (fit check / POV skit / storytime / roast / comment-reply / bio / scenario):\n- the joke engine in one line:\n- niche facts and memes used (each with its row in research.md or the niche file it comes from):\n- pileGo! tie-in: pattern (punchline / habit / ad-beat), which beat, which pain it releases:\n- platform: tiktok + reels + shorts; target length: 40-60 s\n- reference videos (outliers) and what we copy from them (format + hook mechanic only):\n`
    : `# ${title}\n\n- mode: ${mode}\n- style: ${style}\n- platform: tiktok + reels + shorts\n- target length: 45-62 s\n- audience:\n- the one thing the viewer should feel/learn:\n- reference videos (outliers) and what we copy from them (structure, hook pattern, pacing):\n`,
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
      ...(STORY ? { channel: STORY.channel, series: STORY.series, ...(STORY.subject ? { subject: STORY.subject } : {}) } : {}),
      voice: STORY?.voice ?? { provider: "auto", wpm: 175 },
      music: STORY?.music ?? { mood: null },
      captions: STORY?.captions ?? { preset: CAPTION[style] ?? "bold-pop" },
      pronounce: STORY ? { pileGo: "pile go" } : {},
      hooks: [],
      hookVariants: [],
      ...(STORY ? { plug: { pattern: "punchline", beats: [] } } : {}),
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
