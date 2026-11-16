// Cross-process GPU slots: at most N Chrome/WebGL jobs (stills, renders) run at once on this machine, no matter how
// many agents or terminals start them (~14 GB RAM, one iGPU). A slot is a lock file created with O_EXCL; a slot whose
// process is gone, or that is older than the stale limit, is reclaimed.
//   NOMEN_GPU_SLOTS=2 (default)   NOMEN_GPU_STALE_MIN=45 (default)
import fs from "node:fs";
import path from "node:path";
import { STUDIO } from "./bundle.mjs";

const DIR = path.join(STUDIO, "out", "locks");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};

function tryTake(file, label) {
  try {
    const fd = fs.openSync(file, "wx");
    fs.writeSync(fd, JSON.stringify({ pid: process.pid, label, t: Date.now() }));
    fs.closeSync(fd);
    return true;
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
    try {
      const info = JSON.parse(fs.readFileSync(file, "utf8"));
      const staleMs = Number(process.env.NOMEN_GPU_STALE_MIN ?? 45) * 60000;
      if (!alive(info.pid) || Date.now() - info.t > staleMs) fs.rmSync(file, { force: true });
    } catch {
      // half-written or vanished lock: try again next round
    }
    return false;
  }
}

/** Run `fn` while holding one GPU slot (waits, polling every 3 s, until one is free). */
export async function withGpuSlot(label, fn) {
  const slots = Math.max(1, Number(process.env.NOMEN_GPU_SLOTS ?? 2));
  fs.mkdirSync(DIR, { recursive: true });
  let held = null;
  let waited = 0;
  while (!held) {
    for (let i = 0; i < slots && !held; i++) {
      const f = path.join(DIR, `gpu-${i}.lock`);
      if (tryTake(f, label)) held = f;
    }
    if (!held) {
      if (waited % 60000 === 0) console.log(`  waiting for a GPU slot (${slots} in use) ...`);
      await sleep(3000);
      waited += 3000;
    }
  }
  const release = () => fs.rmSync(held, { force: true });
  process.once("exit", release);
  for (const sig of ["SIGINT", "SIGTERM"]) process.once(sig, () => (release(), process.exit(130)));
  try {
    return await fn();
  } finally {
    release();
  }
}
