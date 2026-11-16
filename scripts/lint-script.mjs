// lint-script.mjs <slug> - checks videos/<slug>/script.json before voicing (step 4 of the reel skill).
// Usage (from the studio root): node scripts/lint-script.mjs <slug>   -> "x" lines are errors (exit 1), "!" warnings.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const slug = process.argv[2];
if (!slug) {
  console.error("usage: node scripts/lint-script.mjs <slug>");
  process.exit(2);
}
process.chdir(fileURLToPath(new URL("..", import.meta.url))); // paths below are relative to the studio root
const S = JSON.parse(fs.readFileSync(`videos/${slug}/script.json`, "utf8"));
const read = (p) => fs.readFileSync(p, "utf8");
const names = (txt, re) => new Set([...txt.matchAll(re)].map((m) => m[1]));
const sounds = names(read("audio/synth.py") + read("audio/sfx_extra.py"), /"(\w+)":\s*\(sfx_/g).add("tick_roll").add("boom");
const beds = names(read("audio/synth.py"), /"(\w+)":\s*amb_\w+\s*[,}]/g);
const kinds = names(read("src/core/Reel.tsx").match(/const DUR[^{]*\{([^}]*)\}/)[1], /"?([a-z-]+)"?\s*:/g);
const moods = names(read("scripts/sound.py"), /"(\w+)":\s*\{"bpm"/g);
let bad = 0;
const say = (lvl, m) => { if (lvl === "x") bad++; console.log(`${lvl} ${m}`); };
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const wpm = S.voice?.wpm ?? 175;
let total = 0, prev = 0, cuts = 0, lastShot = null;
const seen = new Set(), shotWords = new Map(), used = new Set();
for (const [k, b] of S.beats.entries()) {
  const id = b.id ?? `#${k + 1}`, text = b.text ?? "";
  const toks = text.replace(/\*/g, "").split(/\s+/).map(norm).filter(Boolean);
  const n = toks.length, first = text.replace(/\*/g, "").split(/(?<=[.!?…])\s+/)[0].split(/\s+/).filter(Boolean).length;
  total += n;
  for (const f of ["id", "shot", "text", "visual"]) if (!b[f]) say("x", `${id}: missing "${f}"`);
  if (k === 0 && first > 12) say("x", `${id}: hook sentence has ${first} words (max 12)`);
  if (n > 20) say("x", `${id}: ${n} words (max 20)`); else if (n > 16) say("!", `${id}: ${n} words (aim 6-16)`);
  if (n > 15 && prev > 15) say("x", `${id}: two beats over 15 words in a row`);
  const stars = (text.match(/\*/g) ?? []).length;
  if (stars > 2 || stars % 2) say("x", `${id}: star exactly one keyword or phrase (found ${stars} stars)`);
  else if (!stars) say("!", `${id}: no *starred* keyword`);
  if ((text.match(/[.!?…](\s|$)/g) ?? []).length > 2) say("!", `${id}: more than two sentences`);
  if (/\band then\b/i.test(text)) say("x", `${id}: "and then" (use but / so / because)`);
  if (b.shot !== lastShot) {
    if (seen.has(b.shot)) say("x", `${id}: shot ${b.shot} is not contiguous`);
    seen.add(b.shot);
    const tr = b.transition ?? S.shots?.[b.shot]?.transition ?? S.defaultTransition ?? "whip";
    if (k > 0) used.add(tr);
    if (k > 0 && tr === "cut") cuts++;
  } else if (b.transition) say("!", `${id}: transition on a beat inside shot ${b.shot} is ignored`);
  if (b.transition && !kinds.has(b.transition)) say("x", `${id}: unknown transition "${b.transition}" (${[...kinds].join(", ")})`);
  shotWords.set(b.shot, (shotWords.get(b.shot) ?? 0) + n);
  for (const c of b.sfx ?? []) {
    if (!sounds.has(c.sound)) say("x", `${id}: unknown sound "${c.sound}"`);
    if (c.at === undefined) continue;
    const q = String(c.at).split(/\s+/).map(norm).filter(Boolean);
    const hit = toks.some((_, i) => q.length && q.every((t, j) => toks[i + j] === t || (j === q.length - 1 && (toks[i + j] ?? "").startsWith(t))));
    if (!hit) say("x", `${id}: sfx word "${c.at}" is not in the line`);
  }
  for (const a of b.ambience ?? []) if (!beds.has(a)) say("x", `${id}: unknown ambience "${a}"`);
  prev = n;
  lastShot = b.shot;
}
for (const [s, n] of shotWords) {
  const sec = (60 * n) / wpm;
  if (sec > 6.5) say("!", `shot ${s}: ~${sec.toFixed(1)} s of speech (${sec > 9 ? "over 2-9 s: split it, or " : ""}change the picture every 1-2.5 s inside it)`);
}
if (S.defaultTransition && !kinds.has(S.defaultTransition)) say("x", `unknown defaultTransition "${S.defaultTransition}"`);
if (S.beats[0]?.role !== "hook") say("!", `${S.beats[0]?.id}: role should be "hook"`);
const hooks = S.hooks ?? [], chosen = hooks.filter((h) => h.chosen);
if (hooks.length < 3) say("x", `hooks: ${hooks.length} kept (keep the top 3+ from different families)`);
if (chosen.length !== 1) say("x", `hooks: ${chosen.length} marked "chosen" (exactly 1)`);
if (chosen[0] && norm(chosen[0].text) !== norm(S.beats[0].text)) say("!", "hooks: the chosen hook is not the text of the first beat");
const fam = (h) => String(h.family).match(/^[A-Z]{1,2}(?=\d|\s|$)/)?.[0] ?? String(h.family).split(/\s/)[0]; // "C1 contrarian" -> C
if (hooks.length >= 3 && new Set(hooks.slice(0, 3).map(fam)).size < 3) say("!", "hooks: the top 3 are not from 3 different families");
if ((S.hookVariants ?? []).length !== 3) say("x", `hookVariants: ${(S.hookVariants ?? []).length} (write 3: v1 = main opening, v2 + v3 = alternates)`);
for (const k of Object.keys(S.pronounce ?? {})) if (/\s/.test(k)) say("x", `pronounce "${k}": keys must be single words`);
if (S.music?.mood && !moods.has(S.music.mood)) say("x", `unknown music.mood "${S.music.mood}" (${[...moods].join(", ")})`);
if (!S.voice?.wpm) say("!", "voice.wpm not set (voice.py targets 172)");
if (cuts * 3 > seen.size - 1) say("!", `${cuts} hard cuts: at most a third of the seams`);
if (used.size < 3 || used.size > 5) say("!", `${used.size} transition kinds (${[...used].join(", ")}): aim for 3-5`);
// dialogue: every speaker needs a cast voice
const cast = S.voice?.cast ?? {};
for (const b of S.beats) if (b.speaker && b.speaker !== "narrator" && !cast[b.speaker]) say("x", `${b.id}: speaker "${b.speaker}" has no voice in voice.cast`);
// story modes (tiff, ug-rap): the plug ties into the story and comes late (skills/reel/references/brands/pilego.md)
if (["tiff", "ug-rap"].includes(S.mode)) {
  const words = S.beats.map((b) => (b.text ?? "").replace(/\*/g, "").split(/\s+/).filter(Boolean).length);
  const before = (id) => words.slice(0, Math.max(0, S.beats.findIndex((b) => b.id === id))).reduce((a, n) => a + n, 0);
  const P = S.plug;
  if (!P) say("x", `plug: missing (every ${S.mode} episode ties into pileGo!: {"pattern": "punchline|habit|ad-beat", "beats": ["b09"]})`);
  else {
    if (!["punchline", "habit", "ad-beat"].includes(P.pattern)) say("x", `plug.pattern "${P.pattern}" (punchline | habit | ad-beat)`);
    const ids = new Set(S.beats.map((b) => b.id));
    for (const id of P.beats ?? []) if (!ids.has(id)) say("x", `plug.beats: unknown beat "${id}"`);
    const first = (P.beats ?? []).filter((id) => ids.has(id)).sort((a, b) => before(a) - before(b))[0];
    if (!first) say("x", "plug.beats: none");
    else {
      const at = before(first) / Math.max(1, total);
      if (at < 0.68) say("x", `plug starts at ${(at * 100).toFixed(0)} % of the words (the product moment comes after ~70 %)`);
      else if (at < 0.7) say("!", `plug starts at ${(at * 100).toFixed(0)} % of the words (aim >= 70 %)`);
    }
  }
  const mentions = S.beats.filter((b) => /pile\s*go/i.test(b.text ?? ""));
  if (mentions.length > 2) say("x", `"pileGo!" is spoken in ${mentions.length} beats (max 2: the wordmark carries the brand)`);
  if (mentions.length && !Object.keys(S.pronounce ?? {}).some((k) => /^pilego$/i.test(k))) say("!", 'pronounce: add "pileGo": "pile go"');
  if (!S.series?.episode) say("!", "series.episode not set (number every episode; the series name goes in series.name)");
  const last = S.beats[S.beats.length - 1];
  if (last?.role === "cta") say("!", `${last.id}: the last spoken line is a CTA (end on the joke / loop / comment question; the EndCard carries the brand)`);
  if (S.mode === "ug-rap") {
    const sub = S.subject;
    if (!sub?.kind || !["bio", "scenario", "scene"].includes(sub.kind)) say("x", 'subject: {"kind": "bio|scenario|scene", "name": "...", "real": true|false}');
    else if (sub.real) {
      const rows = (fs.existsSync(`videos/${slug}/research.md`) ? read(`videos/${slug}/research.md`) : "").split("\n").filter((l) => /^\|\s*\d+/.test(l)).length;
      if (rows < 6) say("x", `subject is a real person: research.md has ${rows} sourced rows (need >= 6, two sources each)`);
      if (sub.kind !== "scenario") {
        // the artist is drawn as themselves: a look sheet from dated public photos is required (modes/ug-rap.md)
        const r = fs.existsSync(`videos/${slug}/research.md`) ? read(`videos/${slug}/research.md`) : "";
        const sec = r.split(/^## /m).find((p) => p.startsWith("Look sheet"));
        const urls = sec ? new Set(sec.match(/https?:\/\/[^\s)|>\]]+/g) ?? []).size : 0;
        if (!sec) say("x", `subject is a real artist: research.md has no "## Look sheet" (traits from dated public photos per era; modes/ug-rap.md)`);
        else if (urls < 2) say("x", `research.md "## Look sheet" cites ${urls} photo URL(s) (need >= 2)`);
      }
      const nm = norm(sub.name ?? "");
      for (const id of P?.beats ?? []) {
        const b = S.beats.find((x) => x.id === id);
        if (nm && b && norm(b.text ?? "").includes(nm)) say("x", `${id}: plug beat names ${sub.name} (no real person may appear to endorse pileGo!)`);
      }
    }
  }
}
if (/minecraft/i.test(`${S.title} ${(S.tags ?? []).join(" ")}`)) say("x", 'title/tags: never "Minecraft" (say blocky / voxel)');
console.log(`${S.beats.length} beats, ${seen.size} shots, ${total} words, ~${((60 * total) / wpm).toFixed(0)} s of speech at ${wpm} wpm (+ ~0.15 s per beat gap) -> ${bad ? `${bad} problem(s)` : "lint clean"}`);
process.exitCode = bad ? 1 : 0;
