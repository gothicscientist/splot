// Camera grammar for the toon world (measured reference behaviour):
//  * the camera holds ~80% of the time, but every hold CREEPS forward (no static hold of 4+ frames)
//  * moves are smootherstep glides (18-40 f) or ease-out bursts (fastest on the first frame, settle in 8-10 f)
//  * impacts "kick": a shake that flips sign every frame and decays over 7 frames
//  * rolls of 4-5 degrees for drama, low lens heights
import * as THREE from "three";
import { clamp, easeOut, invLerp, kick, smootherstep } from "../anim";
import type { Vec3 } from "../types";

export type CamPose = { pos: Vec3; look: Vec3; fov: number; roll: number };
export type CamKey = {
  /** frame (shot-local) at which the camera ARRIVES at this pose */
  f: number;
  pos: Vec3;
  look: Vec3;
  fov?: number;
  roll?: number;
  /** how it gets here from the previous key: glide (smootherstep, default), burst (ease-out), cut, linear */
  ease?: "glide" | "burst" | "cut" | "linear";
  /** frames the move takes (default: from the previous key's frame) */
  dur?: number;
  /** push-in rate per frame while holding on this key (default 0.0022; 0.006 on punch words; 0 = locked) */
  creep?: number;
};

const L3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Pose at shot-local frame f from a key list. */
export function poseAt(keys: CamKey[], f: number, kicks: number[] = [], kickAmp = 0.035): CamPose {
  if (!keys.length) return { pos: [0, 1.6, 6], look: [0, 1.2, 0], fov: 40, roll: 0 };
  const ks = [...keys].sort((a, b) => a.f - b.f);
  let i = 0;
  while (i + 1 < ks.length && f >= ks[i + 1].f) i++;
  const cur = ks[i];
  let pose: CamPose;
  let holdStart = cur.f;
  const nxt = ks[i + 1];
  if (f < ks[0].f) {
    pose = { pos: ks[0].pos, look: ks[0].look, fov: ks[0].fov ?? 40, roll: ks[0].roll ?? 0 };
    holdStart = Math.min(f, 0);
  } else if (nxt && nxt.ease !== "cut") {
    const dur = nxt.dur ?? nxt.f - cur.f;
    const start = nxt.f - dur;
    if (f >= start) {
      const u = invLerp(start, nxt.f, f);
      const t = nxt.ease === "burst" ? easeOut(u) : nxt.ease === "linear" ? u : smootherstep(u);
      pose = {
        pos: L3(cur.pos, nxt.pos, t),
        look: L3(cur.look, nxt.look, t),
        fov: (cur.fov ?? 40) + ((nxt.fov ?? cur.fov ?? 40) - (cur.fov ?? 40)) * t,
        roll: (cur.roll ?? 0) + ((nxt.roll ?? 0) - (cur.roll ?? 0)) * t,
      };
      // creep accumulated before the move started blends out during the move
      const crept = creepPose(pose, cur.creep ?? 0.0022, Math.max(0, start - holdStart) * (1 - t));
      return withKicks(crept, f, kicks, kickAmp);
    }
    pose = { pos: cur.pos, look: cur.look, fov: cur.fov ?? 40, roll: cur.roll ?? 0 };
  } else {
    pose = { pos: cur.pos, look: cur.look, fov: cur.fov ?? 40, roll: cur.roll ?? 0 };
  }
  return withKicks(creepPose(pose, cur.creep ?? 0.0022, Math.max(0, f - holdStart)), f, kicks, kickAmp);
}

function creepPose(p: CamPose, rate: number, frames: number): CamPose {
  if (rate <= 0 || frames <= 0) return p;
  // fast at first, then keeps moving slowly forever (a capped creep froze long holds)
  const k = Math.min(0.14, frames * rate) + Math.min(0.2, Math.max(0, frames * rate - 0.14) * 0.3);
  const q = L3(p.pos, p.look, k);
  // a whisper of lateral drift so even flat, textureless frames keep living
  const d = Math.hypot(p.pos[0] - p.look[0], p.pos[2] - p.look[2]);
  const drift = Math.sin(frames * 0.035) * d * 0.006;
  return { ...p, pos: [q[0] + drift, q[1] + Math.sin(frames * 0.027) * d * 0.002, q[2]] };
}

function withKicks(p: CamPose, f: number, kicks: number[], amp: number): CamPose {
  if (!kicks.length) return p;
  const v = kick(f, kicks, 1, 7);
  if (v === 0) return p;
  const d = Math.hypot(p.pos[0] - p.look[0], p.pos[1] - p.look[1], p.pos[2] - p.look[2]);
  const s = amp * d * v;
  return { ...p, pos: [p.pos[0] + s, p.pos[1] - s * 0.6, p.pos[2]], look: [p.look[0] + s * 0.5, p.look[1] - s * 0.3, p.look[2]], roll: p.roll + v * 0.6 };
}

const tmp = new THREE.Vector3();
/** Apply a pose to a three camera (position, look-at, fov, roll in degrees). */
export function applyPose(cam: THREE.PerspectiveCamera, p: CamPose) {
  cam.position.set(...p.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(tmp.set(...p.look));
  if (p.roll) cam.rotateZ((p.roll * Math.PI) / 180);
  if (cam.fov !== p.fov) {
    cam.fov = p.fov;
    cam.updateProjectionMatrix();
  }
  cam.updateMatrixWorld();
}

/** Orbit helper: a camera position around a target (deg yaw/pitch, distance). */
export const orbit = (target: Vec3, yawDeg: number, pitchDeg: number, dist: number): Vec3 => {
  const y = (yawDeg * Math.PI) / 180;
  const p = (pitchDeg * Math.PI) / 180;
  return [target[0] + Math.sin(y) * Math.cos(p) * dist, target[1] + Math.sin(p) * dist, target[2] + Math.cos(y) * Math.cos(p) * dist];
};
