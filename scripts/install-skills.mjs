#!/usr/bin/env node
// install-skills.mjs - copy every skill folder in skills/ into ~/.claude/skills/<name>/ (real copies, not junctions),
// so Claude Code can use the studio's skills in any session.
//
//   node scripts/install-skills.mjs             dry run (the default): print the plan, change nothing
//   node scripts/install-skills.mjs --dry-run   same
//   node scripts/install-skills.mjs --yes       copy           (npm run install-skills -- --yes)
//
// It never clobbers a skill it did not install: a folder that already exists in ~/.claude/skills/ is replaced only
// when it holds the marker file `.nomen-studio`, which this script writes into every copy it makes. Folders without
// the marker, files, symlinks and junctions are left untouched and reported. Skills that were removed from skills/
// are never deleted, only listed. A replacement is staged next to the old folder and swapped in at the end, so a failed
// copy leaves the old version in place.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MARKER = ".nomen-studio";
const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SOURCE = path.join(STUDIO, "skills");
const DEFAULT_TARGET = path.join(os.homedir(), ".claude", "skills");
const STAGE = ".nomen-installing";

/** Every file under dir as sorted relative paths (forward slashes), without the marker. */
function listFiles(dir, base = dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) listFiles(p, base, out);
    else if (name !== MARKER) out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out.sort();
}

function diff(src, dest) {
  const a = listFiles(src);
  const b = listFiles(dest);
  const inA = new Set(a);
  const inB = new Set(b);
  return {
    added: a.filter((f) => !inB.has(f)),
    removed: b.filter((f) => !inA.has(f)),
    changed: a.filter((f) => inB.has(f) && !fs.readFileSync(path.join(src, f)).equals(fs.readFileSync(path.join(dest, f)))),
  };
}

const lstat = (p) => {
  try {
    return fs.lstatSync(p);
  } catch {
    return null;
  }
};
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

/** What would happen for every folder in `source` (nothing is changed). */
export function plan({ source = DEFAULT_SOURCE, target = DEFAULT_TARGET } = {}) {
  const names = fs
    .readdirSync(source, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();
  const items = names.map((name) => {
    const src = path.join(source, name);
    const dest = path.join(target, name);
    const base = { name, src, dest, files: listFiles(src).length, skillMd: fs.existsSync(path.join(src, "SKILL.md")) };
    const st = lstat(dest);
    if (!st) return { ...base, action: "new" };
    if (st.isSymbolicLink()) return { ...base, action: "skip", why: "a symlink or junction is there" };
    if (!st.isDirectory()) return { ...base, action: "skip", why: "a file with that name is there" };
    if (!fs.existsSync(path.join(dest, MARKER))) return { ...base, action: "skip", why: `exists without the ${MARKER} marker (not installed by this script)` };
    const d = diff(src, dest);
    return { ...base, d, action: d.added.length || d.removed.length || d.changed.length ? "update" : "same" };
  });
  const orphans = fs.existsSync(target)
    ? fs
        .readdirSync(target, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !names.includes(e.name) && fs.existsSync(path.join(target, e.name, MARKER)))
        .map((e) => e.name)
    : [];
  return { source, target, items, orphans };
}

function copyInto(it) {
  const staged = it.dest + STAGE;
  fs.rmSync(staged, { recursive: true, force: true });
  try {
    fs.cpSync(it.src, staged, { recursive: true, dereference: true });
    fs.writeFileSync(
      path.join(staged, MARKER),
      `Installed by nomen-studio scripts/install-skills.mjs from ${it.src} on ${new Date().toISOString()}.\n` +
        "The next install replaces this folder. Delete this file to keep local edits (the installer will then skip it).\n",
    );
    if (it.action === "update") {
      // re-check right before removing: only ever delete a real folder that carries our marker
      const st = lstat(it.dest);
      if (!st || st.isSymbolicLink() || !st.isDirectory() || !fs.existsSync(path.join(it.dest, MARKER))) {
        throw new Error("the existing folder changed since the plan was made; left untouched");
      }
      fs.rmSync(it.dest, { recursive: true, force: true });
    } else if (lstat(it.dest)) {
      throw new Error("a folder appeared there since the plan was made; left untouched");
    }
    fs.renameSync(staged, it.dest);
  } catch (e) {
    fs.rmSync(staged, { recursive: true, force: true });
    throw e;
  }
}

/** Print the plan (dry run) or carry it out (yes). Returns the number of failures. */
export function installSkills({ yes = false, source = DEFAULT_SOURCE, target = DEFAULT_TARGET, log = console.log } = {}) {
  const p = plan({ source, target });
  const w = Math.max(...p.items.map((i) => i.name.length), 4);
  log(`install-skills: ${p.source} -> ${p.target}${yes ? "" : "   (dry run)"}`);
  const count = { new: 0, update: 0, same: 0, skip: 0, failed: 0 };
  if (yes) fs.mkdirSync(p.target, { recursive: true });
  for (const it of p.items) {
    const what =
      it.action === "update"
        ? `${plural(it.d.changed.length, "file")} changed, ${it.d.added.length} added, ${it.d.removed.length} removed`
        : it.action === "skip"
          ? it.why
          : plural(it.files, "file");
    const warn = it.skillMd ? "" : "  (no SKILL.md: Claude Code will not load it as a skill)";
    if (!yes) {
      const verb = { new: "would install", update: "would update", same: "up to date", skip: "would skip" }[it.action];
      log(`  ${verb.padEnd(13)} ${it.name.padEnd(w)}  ${it.action === "same" ? "" : what}${warn}`.trimEnd());
      count[it.action]++;
      continue;
    }
    if (it.action === "same" || it.action === "skip") {
      log(`  ${(it.action === "same" ? "unchanged" : "skipped").padEnd(13)} ${it.name.padEnd(w)}  ${it.action === "same" ? "" : what}`.trimEnd());
      count[it.action]++;
      continue;
    }
    try {
      copyInto(it);
      log(`  ${(it.action === "new" ? "installed" : "updated").padEnd(13)} ${it.name.padEnd(w)}  ${what} -> ${it.dest}${warn}`);
      count[it.action]++;
    } catch (e) {
      log(`  ${"FAILED".padEnd(13)} ${it.name.padEnd(w)}  ${e.message}`);
      count.failed++;
    }
  }
  for (const o of p.orphans) log(`  ${"left alone".padEnd(13)} ${o.padEnd(w)}  installed earlier, no longer in skills/ (delete it by hand if unwanted)`);
  if (yes) {
    log(`done: ${count.new} installed, ${count.update} updated, ${count.same} unchanged, ${count.skip} skipped${count.failed ? `, ${count.failed} FAILED` : ""}.`);
  } else {
    log(`dry run: nothing was changed (${count.new} new, ${count.update} to update, ${count.same} up to date, ${count.skip} skipped). Run with --yes to copy.`);
  }
  return count.failed;
}

const isMain = (() => {
  if (!process.argv[1]) return false;
  const a = path.resolve(process.argv[1]);
  const b = fileURLToPath(import.meta.url);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
})();
if (isMain) {
  const args = process.argv.slice(2);
  const known = new Set(["--yes", "--dry-run", "-h", "--help"]);
  const unknown = args.filter((a) => !known.has(a));
  if (unknown.length || args.includes("-h") || args.includes("--help")) {
    console.log("usage: node scripts/install-skills.mjs [--dry-run | --yes]   (default: --dry-run)");
    process.exit(unknown.length ? 1 : 0);
  }
  const yes = args.includes("--yes") && !args.includes("--dry-run");
  if (args.includes("--yes") && args.includes("--dry-run")) console.log("both --yes and --dry-run given: doing a dry run");
  process.exitCode = installSkills({ yes }) ? 1 : 0;
}
