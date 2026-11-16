#!/usr/bin/env node
// doctor.mjs - is this machine ready to make a video? One PASS / WARN / FAIL line per item, exit 1 on any FAIL.
//
//   node scripts/doctor.mjs          (or: npm run doctor)
//
// Checks what the pipeline really calls: Node + npm, ffmpeg/ffprobe (rubberband for voice.py's tempo, ebur128 for the
// loudness gates, drawtext/xstack/tile for the contact sheets), the project venv (numpy, scipy, edge_tts, num2words),
// the WhisperX aligner (voice.py falls back without it), Remotion's Chrome headless shell, node_modules, free disk and
// RAM, the optional API keys (reported as set / not set, NEVER their values), yt-dlp for outlier research, and last
// whether the free Edge TTS endpoint and Google Fonts answer (network, WARN only, short timeout).
// Node built-ins only, so it also runs before `npm install`.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIN = process.platform === "win32";
const HOME = os.homedir();
const GB = 1024 ** 3;
const tally = { PASS: 0, WARN: 0, FAIL: 0 };

const report = (level, item, detail) => {
  tally[level]++;
  console.log(`${level}  ${item}: ${detail}`);
};
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", timeout: 30000, windowsHide: true, ...opts });
const ok = (r) => !r.error && r.status === 0;
const firstLine = (s) => String(s ?? "").trim().split(/\r?\n/)[0] ?? "";
const gb = (n) => `${(n / GB).toFixed(1)} GB`;
const proj = (p) => path.relative(STUDIO, p).replace(/\\/g, "/");
const tilde = (p) => (p.toLowerCase().startsWith(HOME.toLowerCase()) ? "~" + p.slice(HOME.length) : p).replace(/\\/g, "/");
const readText = (p) => {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

// Keys and settings: the environment first, then ~/.config/nomen-studio/.env, then <studio>/.env (scripts/lib/common.py).
const ENV_FILES = [path.join(HOME, ".config", "nomen-studio", ".env"), path.join(STUDIO, ".env")].map((file) => {
  const map = {};
  for (const raw of (readText(file) ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const k = line.slice(0, line.indexOf("=")).trim();
    const v = line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
    if (v) map[k] = v;
  }
  return { label: file.startsWith(STUDIO) ? "./.env" : tilde(file), map };
});
function lookup(key) {
  if (process.env[key]) return { value: process.env[key], from: "env" };
  for (const f of ENV_FILES) if (f.map[key]) return { value: f.map[key], from: f.label };
  return null;
}

/** Import modules in a Python interpreter; returns {python, <module>: version | null} or {err}. */
function pyImports(py, mods) {
  const code = [
    "import importlib, importlib.metadata as md, json, sys",
    `mods = ${JSON.stringify(mods)}`,
    "out = {'python': sys.version.split()[0]}",
    "for mod, dist in mods:",
    "    try:",
    "        importlib.import_module(mod)",
    "        try:",
    "            out[mod] = md.version(dist)",
    "        except Exception:",
    "            out[mod] = 'ok'",
    "    except Exception:",
    "        out[mod] = None",
    "print(json.dumps(out))",
  ].join("\n");
  const r = run(py, ["-c", code], { timeout: 120000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  if (!ok(r)) return { err: firstLine(r.stderr) || r.error?.message || `exit code ${r.status}` };
  try {
    return JSON.parse(String(r.stdout).trim().split(/\r?\n/).pop());
  } catch {
    return { err: "unexpected output" };
  }
}

// ------------------------------------------------------------------------------------------------ node + npm
{
  const v = process.versions.node;
  const major = Number(v.split(".")[0]);
  if (major >= 24) report("PASS", "node", `v${v}`);
  else if (major >= 18) report("WARN", "node", `v${v} (the studio is tested on Node 24)`);
  else report("FAIL", "node", `v${v} (needs Node 18+, tested on 24)`);
}
{
  // npm is npm.cmd on Windows, which only runs through a shell (one command string: no args array with shell:true)
  const r = WIN ? spawnSync("npm --version", { shell: true, encoding: "utf8", timeout: 30000, windowsHide: true }) : run("npm", ["--version"]);
  const v = firstLine(r.stdout);
  if (!ok(r) || !/^\d+\./.test(v)) report("FAIL", "npm", "not found on PATH");
  else if (Number(v.split(".")[0]) >= 10) report("PASS", "npm", v);
  else report("WARN", "npm", `${v} (tested with npm 12)`);
}

// ------------------------------------------------------------------------------------------------ ffmpeg
{
  const r = run("ffmpeg", ["-hide_banner", "-version"]);
  const p = run("ffprobe", ["-hide_banner", "-version"]);
  const ver = (x) => firstLine(x.stdout).replace(/\s+Copyright.*$/, "");
  if (!ok(r)) report("FAIL", "ffmpeg", "not found on PATH (install a full build, e.g. winget install Gyan.FFmpeg)");
  else report("PASS", "ffmpeg", ver(r));
  if (!ok(p)) report("FAIL", "ffprobe", "not found on PATH (render.mjs and check.mjs need it)");
  else report("PASS", "ffprobe", ver(p));
  if (ok(r)) {
    const have = new Set();
    for (const l of String(run("ffmpeg", ["-hide_banner", "-filters"]).stdout).split(/\r?\n/)) {
      const m = l.match(/^\s*\S+\s+(\w+)\s+\S+->\S+/);
      if (m) have.add(m[1]);
    }
    const need = ["rubberband", "ebur128"].filter((f) => !have.has(f));
    if (need.length) report("FAIL", "ffmpeg filters", `missing ${need.join(", ")} (voice.py tempo needs rubberband, the loudness gates need ebur128: install a full build)`);
    else report("PASS", "ffmpeg filters", "rubberband, ebur128");
    const sheet = ["drawtext", "xstack", "tile"].filter((f) => !have.has(f));
    const font = "C:/Windows/Fonts/arialbd.ttf"; // hard-coded in stills.mjs / check.mjs for the frame labels
    const fontOk = fs.existsSync(font);
    if (sheet.length || !fontOk) {
      const why = [sheet.length ? `missing filters ${sheet.join(", ")}` : "", fontOk ? "" : `no ${font}`].filter(Boolean).join("; ");
      report("WARN", "contact sheets", `${why} (stills.mjs and check.mjs sheets will fail)`);
    } else report("PASS", "contact sheets", "drawtext, xstack, tile + arialbd.ttf");
  }
}

// ------------------------------------------------------------------------------------------------ python venvs
{
  const py = path.join(STUDIO, ".venv", WIN ? "Scripts/python.exe" : "bin/python");
  const mods = ["numpy", "scipy", "edge_tts", "num2words"];
  if (!fs.existsSync(py)) report("FAIL", "python venv", `no ${proj(py)} (create it with uv, Python 3.12, then install numpy scipy edge-tts num2words)`);
  else {
    const r = pyImports(py, [["numpy", "numpy"], ["scipy", "scipy"], ["edge_tts", "edge-tts"], ["num2words", "num2words"]]);
    const miss = r.err ? mods : mods.filter((m) => !r[m]);
    if (r.err) report("FAIL", "python venv", `${proj(py)} does not run: ${r.err}`);
    else if (miss.length) report("FAIL", "python venv", `Python ${r.python} cannot import ${miss.join(", ")}`);
    else report("PASS", "python venv", `Python ${r.python}: ${mods.map((m) => `${m} ${r[m]}`).join(", ")}`);
  }
}
{
  // same order as find_align_python() in scripts/lib/common.py: NOMEN_ALIGN_PYTHON, the watch plugin venv, .venv-align
  const exe = WIN ? "Scripts/python.exe" : "bin/python";
  const pinned = lookup("NOMEN_ALIGN_PYTHON");
  const cands = [pinned?.value, path.join(HOME, ".cache", "watch", "whisperx-venv", exe), path.join(STUDIO, ".venv-align", exe)];
  const py = cands.find((c) => c && fs.existsSync(c));
  const note = pinned && !fs.existsSync(pinned.value) ? `NOMEN_ALIGN_PYTHON (${pinned.from}) points to a missing file; ` : "";
  const fallback = "voice.py falls back to a word-boundary voice (lower quality) and recorded takes cannot be aligned";
  if (!py) report("WARN", "whisperx aligner", `${note}not found (set NOMEN_ALIGN_PYTHON or install the watch plugin's WhisperX venv): ${fallback}`);
  else {
    const r = pyImports(py, [["whisperx", "whisperx"]]);
    if (r.err || !r.whisperx) report("WARN", "whisperx aligner", `${note}${tilde(py)} cannot import whisperx${r.err ? ` (${r.err})` : ""}: ${fallback}`);
    else report("PASS", "whisperx aligner", `${note}whisperx ${r.whisperx} (Python ${r.python}) at ${tilde(py)}`);
  }
}

// ------------------------------------------------------------------------------------------------ remotion + node_modules
{
  // Remotion keeps its browser in node_modules/.remotion/chrome-headless-shell/<platform>/ (renderer/dist/browser/BrowserFetcher.js)
  const plat = WIN ? "win64" : process.platform === "darwin" ? (process.arch === "arm64" ? "mac-arm64" : "mac-x64") : process.arch === "arm64" ? "linux-arm64" : "linux64";
  const base = path.join(STUDIO, "node_modules", ".remotion", "chrome-headless-shell");
  const dir = path.join(base, plat, `chrome-headless-shell-${plat}`);
  const exe = [path.join(dir, "headless_shell"), path.join(dir, WIN ? "chrome-headless-shell.exe" : "chrome-headless-shell")].find((p) => fs.existsSync(p));
  const have = readText(path.join(base, "VERSION"))?.trim() ?? null;
  const want = readText(path.join(STUDIO, "node_modules", "@remotion", "renderer", "dist", "browser", "get-chrome-download-url.js"))?.match(/TESTED_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? null;
  if (!exe) report("WARN", "chrome headless shell", `not in ${proj(base)}: Remotion downloads it on the first still/render (needs network), or run npx remotion browser ensure`);
  else if (want && have && !have.startsWith(want)) report("WARN", "chrome headless shell", `version ${have} but this Remotion expects ${want}: it re-downloads on the next render`);
  else report("PASS", "chrome headless shell", `${have ?? "unknown version"} (${proj(exe)}; renders use gl=angle)`);
}
{
  const pkg = JSON.parse(readText(path.join(STUDIO, "package.json")) ?? "{}");
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const names = [...Object.keys(deps), "@remotion/bundler"]; // the bundler is imported by scripts/ and comes with @remotion/cli
  const missing = [];
  const drift = [];
  for (const name of names) {
    const pj = readText(path.join(STUDIO, "node_modules", ...name.split("/"), "package.json"));
    if (!pj) missing.push(name);
    else if (/^\d/.test(deps[name] ?? "") && JSON.parse(pj).version !== deps[name]) drift.push(`${name} ${JSON.parse(pj).version} (pinned ${deps[name]})`);
  }
  if (!fs.existsSync(path.join(STUDIO, "node_modules"))) report("FAIL", "node_modules", "not installed (run npm install)");
  else if (missing.length) report("FAIL", "node_modules", `missing ${missing.length}: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", ..." : ""} (run npm install)`);
  else if (drift.length) report("WARN", "node_modules", `version drift: ${drift.slice(0, 4).join(", ")} (run npm install)`);
  else report("PASS", "node_modules", `${names.length} packages present, pinned versions match (remotion ${deps.remotion})`);
}

// ------------------------------------------------------------------------------------------------ disk + RAM
{
  const spots = [
    ["studio", STUDIO],
    ["TEMP", os.tmpdir()],
  ].map(([label, p]) => {
    const root = path.parse(path.resolve(p)).root;
    try {
      const s = fs.statfsSync(p);
      return { label, root, free: s.bavail * s.bsize, id: `${root}|${s.type}:${s.blocks}:${s.bsize}` };
    } catch {
      return { label, root, free: null, id: p };
    }
  });
  const same = spots[0].id === spots[1].id && spots[0].free !== null;
  for (const s of same ? [{ ...spots[0], label: "studio + TEMP" }] : spots) {
    if (s.free === null) report("WARN", `disk (${s.label})`, `could not read free space on ${s.root}`);
    else if (s.free < 2 * GB) report("FAIL", `disk (${s.label})`, `${gb(s.free)} free on ${s.root} (renders and Remotion bundles need several GB)`);
    else if (s.free < 10 * GB) report("WARN", `disk (${s.label})`, `${gb(s.free)} free on ${s.root} (keep 10+ GB for renders, bundles and stills)`);
    else report("PASS", `disk (${s.label})`, `${gb(s.free)} free on ${s.root}`);
  }
}
{
  const free = os.freemem();
  const conc = Math.max(1, Math.min(3, Math.floor(os.cpus().length / 5))); // render.mjs default
  const tail = `render.mjs default concurrency ${conc} (never above 3 on this class of machine)`;
  if (free < 2 * GB) report("WARN", "free RAM", `${gb(free)} of ${gb(os.totalmem())}: close apps before rendering, use --concurrency 1-2; ${tail}`);
  else report("PASS", "free RAM", `${gb(free)} of ${gb(os.totalmem())}; ${tail}`);
}

// ------------------------------------------------------------------------------------------------ optional keys (never print values)
{
  const el = lookup("ELEVENLABS_API_KEY");
  report("PASS", "ELEVENLABS_API_KEY", el ? `set (${el.from})` : "not set (optional: voice.py uses a recorded take or the free Edge voice)");
  const oa = lookup("OPENAI_API_KEY");
  const on = lookup("NOMEN_USE_OPENAI_TTS"); // any non-empty value switches OpenAI TTS on (voice.py resolve_provider)
  if (oa) report("PASS", "OPENAI_API_KEY", `set (${oa.from})${on ? "; OpenAI TTS is on (NOMEN_USE_OPENAI_TTS)" : "; unused unless NOMEN_USE_OPENAI_TTS=1"}`);
  else report(on ? "WARN" : "PASS", "OPENAI_API_KEY", on ? `not set, but NOMEN_USE_OPENAI_TTS is set (${on.from})` : "not set (optional)");
}

// ------------------------------------------------------------------------------------------------ research tools
{
  const y = run("yt-dlp", ["--version"]);
  const d = run("deno", ["--version"]);
  const yv = ok(y) ? firstLine(y.stdout) : null;
  const dv = ok(d) ? firstLine(d.stdout).replace(/^deno\s+/, "").split(" ")[0] : null;
  const what = `${yv ? `yt-dlp ${yv}` : "yt-dlp not found"}, ${dv ? `deno ${dv}` : "deno not found"}`;
  report(yv && dv ? "PASS" : "WARN", "yt-dlp", yv && dv ? `${what} (outlier research)` : `${what} (only reel-research's outlier step needs them: winget install yt-dlp.yt-dlp DenoLand.Deno)`);
}

// ------------------------------------------------------------------------------------------------ network (WARN only)
function probe(url, method, ms = 4000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const done = (r) => {
      clearTimeout(timer);
      resolve({ ...r, ms: Date.now() - t0 });
    };
    const req = https.request(url, { method, timeout: ms }, (res) => {
      done({ status: res.statusCode });
      req.destroy(); // the status is enough: do not download the body
    });
    const timer = setTimeout(() => req.destroy(new Error(`no answer in ${ms / 1000} s`)), ms + 500);
    req.on("timeout", () => req.destroy(new Error(`no answer in ${ms / 1000} s`)));
    req.on("error", (e) => done({ error: e.code || e.message }));
    req.end();
  });
}
{
  // the voice list endpoint edge-tts itself uses (public client token from edge_tts/constants.py)
  const EDGE = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  const gf = readText(path.join(STUDIO, "node_modules", "@remotion", "google-fonts", "dist", "cjs", "Montserrat.js"));
  const FONT = gf?.match(/https:\/\/fonts\.gstatic\.com\/[^"'\s)]+\.woff2/)?.[0] ?? "https://fonts.gstatic.com/";
  const [edge, font] = await Promise.all([probe(EDGE, "GET"), probe(FONT, "HEAD")]);
  const say = (r) => (r.error ? `unreachable (${r.error})` : `HTTP ${r.status} in ${r.ms} ms`);
  if (!edge.error && edge.status < 400) report("PASS", "edge tts endpoint", `reachable (${say(edge)})`);
  else report("WARN", "edge tts endpoint", `${say(edge)}: the free voice needs it (voice.py retries 10x); a recorded take or ElevenLabs does not`);
  if (!font.error && font.status < 400) report("PASS", "google fonts", `reachable (${say(font)}; caption fonts load at render time)`);
  else report("WARN", "google fonts", `${say(font)}: caption fonts load from fonts.gstatic.com at render time; without them text falls back to a system font`);
}

console.log(`doctor: ${tally.PASS} pass, ${tally.WARN} warn, ${tally.FAIL} fail`);
process.exitCode = tally.FAIL ? 1 : 0;
