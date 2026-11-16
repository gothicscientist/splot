// scenes: hand-written
// "The man who sold the Eiffel Tower" - StickWorld (2D cast in a toon 3D world) x Case File.
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
// Camera keys and staging live in CAMS / LAYOUT (pure functions of the word clock) so framing can be measured
// offline. Screen FX that belong to a 3D object (the SOLD stamp on the tower) follow it through `screenAt`.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import type { ShotApi } from "../../core/timeline";
import { Stage, NOINK } from "../../core/three/Stage";
import { applyPose, poseAt } from "../../core/three/camera";
import type { CamKey } from "../../core/three/camera";
import { Rain, Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Counter, Bubble, FXLayer, FlashFX, Burst } from "../../core/fx2d";
import { backOut, clamp, invLerp, lerp, smootherstep } from "../../core/anim";
import { canvasTex } from "../../core/three/tex";
import { toon, unlit } from "../../core/three/mats";
import { font } from "../../core/fonts";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { Face, Pose, StickSpec } from "../../styles/stickworld/draw";
import { Room, Desk, Lamp, Plant, Bookshelf, Table, Chair, Ground, Tree, Building, Cloud, Board, Box, Cyl, Window, Clock, Car, StreetLamp } from "../../styles/stickworld/props";
import {
  EiffelTower,
  Newspaper,
  Easel,
  Chandelier,
  Train,
  Platform,
  FileDrawer,
  Ship,
  Water,
  PoliceLight,
  CafeTable,
  Cup,
  Awning,
  Rails,
  Carriage,
  StickPortrait,
  Drapes,
  LightPool,
  towerSheetTex,
} from "../../styles/stickworld/props2";
import type { Timeline, Vec3 } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
type W = Pick<ShotApi, "hit" | "at" | "end" | "beat" | "dur">;
const K = (f: number, pos: Vec3, look: Vec3, fov: number, o: Partial<CamKey> = {}): CamKey => ({ f, pos, look, fov, ...o });
const ramp = (f: number, a: number, d: number) => smootherstep(invLerp(a, a + d, f));
const popK = (f: number, a: number, d = 8) => (f < a ? 0 : backOut(invLerp(a, a + d, f), 2.2));
/** stamp slam scale: 2.2x on its first frame, lands at 1 after 5 frames (matches fx2d Stamp) */
const slamK = (f: number, a: number) => (f < a ? 0 : f < a + 5 ? 2.2 - 1.2 * invLerp(a, a + 5, f) ** 2 : 1);

// ------------------------------------------------------------------------------------------------ 3D -> screen
const _cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 900);
const _v = new THREE.Vector3();
/** screen position (px at 1080x1920) of a world point seen by a key camera at shot-local frame f */
const screenAt = (keys: CamKey[], f: number, p: Vec3, kicks: number[] = []): [number, number] => {
  const pose = poseAt(keys, f, kicks);
  _cam.fov = pose.fov;
  _cam.aspect = 1080 / 1920;
  _cam.updateProjectionMatrix();
  applyPose(_cam, pose);
  _v.set(p[0], p[1], p[2]).project(_cam);
  return [((_v.x + 1) / 2) * 1080, ((1 - _v.y) / 2) * 1920];
};

// ------------------------------------------------------------------------------------------------ cast
const LUSTIG: StickSpec = { body: "#2b2f3a", outfit: "suit", accent: "#c0392b", hat: "tophat", hatColor: "#1b1b22", mustache: "#2a1a14", hair: "slick", hairColor: "#2a1a14", seed: 4 };
const POISSON: StickSpec = { body: "#6b5440", outfit: "suit", accent: "#e1b12c", glasses: "round", mustache: "#7a4a2a", hair: "bald", build: "stout", seed: 9 };
const DEALERS: StickSpec[] = [
  { body: "#3f5d7a", outfit: "suit", accent: "#f2c14e", hat: "tophat", hatColor: "#2b2f3a", mustache: "#4a3020", seed: 21 },
  { body: "#7a3f4a", outfit: "suit", accent: "#ffffff", hair: "short", hairColor: "#5a3b2a", glasses: "square", seed: 22 },
  { body: "#4a6b3a", outfit: "jacket", hair: "curly", hairColor: "#2a1a10", beard: "#2a1a10", seed: 23 },
  { body: "#5a4a7a", outfit: "suit", accent: "#e14b4b", hat: "tophat", hatColor: "#3a2a20", seed: 24 },
];
const HISTORIAN: StickSpec = { ...CAST.scientist, outfit: "jacket", body: "#8b6f4e", seed: 41 };
const COP: StickSpec = { ...CAST.cop, seed: 33 };

// ------------------------------------------------------------------------------------------------ poses + faces
const PP = (armL: [number, number], armR: [number, number], extra: Partial<Pose> = {}): Pose => ({ armL, armR, legL: [0, 0], legR: [0, 0], ...extra });
const SIT = { legL: [90, -90] as [number, number], legR: [90, -90] as [number, number], crouch: 0.45 };
const POSE = {
  pointTower: PP([12, 6], [146, 6], { head: -8 }),
  showCash: PP([12, 6], [120, -40], { head: 6 }), // cash fanned beside the face
  whisper: PP([12, 6], [127, 97], { head: 7, lean: 6, front: "R" }), // hand cupped at the mouth corner, drawn over the face
  phoneEar: PP([14, 8], [135, 57], { head: 9 }), // handset at the ear
  cheeks: PP([144, 89], [144, 89], { head: 8, front: "both" }), // both hands on the cheeks, over the face (stout, seated)
  stampUp: PP([30, -40], [128, 50], { head: 10 }),
  stampDown: PP([30, -40], [55, -15], { head: 16, lean: 4 }),
  waveBag: PP([150, 20], [150, 30], { head: 4 }),
  waveBagB: PP([150, 20], [150, -18], { head: 4 }),
  sitRead: { ...PP([55, -78], [55, -78]), ...SIT } as Pose,
  sitThink: { ...PP([44, -50], [35, -150], { head: 8 }), ...SIT } as Pose,
  sitShrug: { ...PP([55, 112], [55, 112], { head: 8 }), ...SIT } as Pose,
  sitTable: { ...PP([44, -50], [44, -50]), ...SIT } as Pose,
  sitLeanR: { ...PP([44, -50], [52, -40], { lean: 9, head: 6 }), ...SIT } as Pose,
  sitLeanL: { ...PP([52, -40], [44, -50], { lean: -9, head: -6 }), ...SIT } as Pose,
  sitCheer: { ...PP([150, 20], [140, 30], { head: -4 }), ...SIT } as Pose,
  sitRub: { ...PP([14, -109], [14, -109], { head: 4, bob: 4 }), ...SIT } as Pose, // hands together at the chest
  holdBrief: PP([12, 6], [97, -126], { lean: 3 }), // Poisson's hand meets Lustig's between them (IK-solved)
  take: PP([12, 6], [77, -85], { lean: -3 }),
  laugh: PP([150, 24], [150, 24], { head: -8, bob: 8 }),
  pullDrawer: PP([20, 8], [74, -14], { lean: -6 }),
};
const FACE: Record<string, Face> = {
  lookUpGrin: { eyes: "dot", mouth: "teeth", brows: "raised", look: [0.35, -1.1] },
  greedy: { eyes: "dollar", mouth: "teeth", brows: "raised", extras: ["sparkle"] },
  slyGrin: { eyes: "lidded", mouth: "teeth", brows: "oneUp" },
  slyLook: { eyes: "lidded", mouth: "teeth", brows: "oneUp", look: [0.8, 0.3] },
  wink: { eyes: "wink", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] },
  suspicious: { eyes: "lidded", mouth: "flat", brows: "angry", look: [0.7, 0] },
  aha: { eyes: "wide", mouth: "o", brows: "raised", extras: ["sparkle"] },
  happyR: { eyes: "dot", mouth: "smile", brows: "raised", look: [0.8, 0] },
  lookR: { eyes: "dot", mouth: "smile", brows: "raised", look: [0.8, 0] },
  lookL: { eyes: "dot", mouth: "smirk", brows: "oneUp", look: [0.8, 0] }, // drawn mirrored on a left-facing card
  curious: { eyes: "dot", mouth: "o", brows: "raised", look: [0.8, 0] },
  readDown: { eyes: "dot", mouth: "flat", brows: "neutral", look: [0, 0.9] },
  spotted: { eyes: "wide", mouth: "flat", brows: "raised", look: [0, 1] },
  thinkUp: { eyes: "dot", mouth: "flat", brows: "oneUp", look: [0.5, -0.8] },
  embarrassed: { eyes: "closed", mouth: "wavy", brows: "worried", extras: ["blush", "sweat"] },
  shout: { eyes: "angry", mouth: "scream", brows: "angry", extras: ["anger"] },
  tellsOff: { eyes: "lidded", mouth: "flat", brows: "angry", look: [-0.8, 0] },
};

// ------------------------------------------------------------------------------------------------ camera keys (pure)
/** a look target `d` m along (yaw, pitch) from pos: near targets keep the hold creep small on far-looking shots */
const aim = (pos: Vec3, yawDeg: number, pitchDeg: number, d = 5): Vec3 => {
  const y = (yawDeg * Math.PI) / 180;
  const p = (pitchDeg * Math.PI) / 180;
  return [pos[0] + Math.sin(y) * Math.cos(p) * d, pos[1] + Math.sin(p) * d, pos[2] - Math.cos(y) * Math.cos(p) * d];
};
// Poisson (left, facing right) and Lustig (right, facing left), heads ~0.75 m apart
const TWO_SHOT = K(0, [-1.33, 1.45, 3.6], [-1.43, 1.08, -0.4], 40, { ease: "glide", creep: 0.003 });
// hook end: low angle, the tower looms over Lustig on the left; his head never crosses the caption band
const END01 = K(0, [1.5, 0.6, 4.4], aim([1.5, 0.6, 4.4], 0, 11), 48, { creep: 0.0012 });
export const CAMS = {
  s01: (s: W, v = 0): CamKey[] => {
    const eiffel = s.hit("Eiffel");
    const end = { ...END01, f: eiffel + 22, ease: "glide" as const, dur: 24 };
    if (v === 1) return [K(0, [1.5, 2.62, -36.6], [0.85, 2.2, -40.55], 40, { creep: 0.003 }), { ...end, dur: 28 }];
    if (v === 2) return [K(0, [1.32, 1.12, 3.05], [1.2, 1.25, 0.3], 44, { creep: 0.003 }), end];
    return [K(0, [1.2, 0.55, 3.0], aim([1.2, 0.55, 3.0], -1.5, 15), 51, { creep: 0.002 }), end];
  },
  s02: (s: W): CamKey[] => {
    const paper = s.hit("paper");
    const spots = s.hit("spots");
    const rusting = s.hit("rusting");
    const repainting = s.hit("repainting");
    const fortune = s.hit("fortune");
    return [
      K(0, [3.6, 2.0, 5.6], [0, 1.1, 0], 38, { creep: 0.004 }),
      K(s.hit("Lustig") + 8, [2.0, 1.6, 3.6], [0, 1.12, 0.1], 36, { ease: "glide", dur: 20, creep: 0.004 }),
      K(paper + 10, [0.45, 1.3, 2.75], [0, 1.1, 0.06], 36, { ease: "glide", dur: 16, creep: 0.004 }),
      K(spots + 8, [0.02, 1.2, 2.1], [0, 1.02, 0.06], 34, { ease: "burst", dur: 10, creep: 0.0025 }),
      // insert on the front-page drawing: the frame top sits below the sub-head, so no word is cut by the edge
      K(rusting + 6, [0.0, 0.856, 0.6], [0, 0.822, 0.06], 34, { ease: "burst", dur: 10, creep: 0.003 }),
      K(repainting + 14, [0.45, 1.5, 3.0], [0, 1.15, 0.0], 38, { ease: "glide", dur: 16, creep: 0.003 }),
      K(fortune + 4, [0.25, 1.45, 2.45], [0, 1.2, 0.0], 34, { ease: "burst", dur: 8, creep: 0.003 }),
    ];
  },
  s03: (s: W): CamKey[] => {
    const forges = s.hit("forges");
    const gov = s.hit("government");
    const becomes = s.hit("becomes");
    return [
      K(0, [0.62, 1.78, 4.5], [0.3, 0.96, 0.0], 38, { creep: 0.003 }),
      // insert: the letterhead fills the frame, Lustig's card stays outside it (his stamp hand comes in from the left)
      K(forges + 8, [0.6, 2.05, 1.15], [0.62, 0.557, -0.02], 32, { ease: "burst", dur: 9, creep: 0.0015 }),
      // the stamped letter wholly in frame beside him...
      K(gov + 30, [0.6, 1.42, 3.6], [0.32, 1.02, -0.1], 35, { ease: "glide", dur: 14, creep: 0.002 }),
      // ...then a push on his badge with the letter wholly out
      K(becomes + 12, [-0.08, 1.38, 2.85], [-0.2, 1.05, -0.1], 35, { ease: "glide", dur: 12, creep: 0.002 }),
    ];
  },
  s04: (s: W): CamKey[] => {
    const invites = s.hit("invites");
    const pitch = s.hit("pitch");
    const secretly = s.hit("secretly");
    const tearing = s.hit("tearing");
    const seven = s.hit("Seven");
    const tons = s.hit("tons");
    const dealers = K(0, [0, 2.85, 3.3], [0, 0.9, -3.0], 50, { ease: "burst", dur: 10, creep: 0.002 });
    return [
      K(0, [3.24, 2.4, 3.0], [2.59, 1.0, -2.8], 44, { creep: 0.003 }),
      { ...dealers, f: invites + 22, ease: "glide", dur: 24 },
      K(pitch + 8, [3.14, 1.95, 0.75], [2.89, 0.9, -2.8], 50, { ease: "burst", dur: 10, creep: 0.003 }),
      // four dealers lean in (the fifth is wholly out of frame, never cut by the edge)
      K(secretly + 8, [0.55, 2.6, 2.6], [0.55, 0.92, -3.0], 50, { ease: "burst", dur: 10, creep: 0.002 }),
      K(tearing + 6, [2.99, 1.85, 0.6], [2.79, 1.0, -2.8], 50, { ease: "burst", dur: 9, creep: 0.003 }),
      K(seven + 2, [3.94, 1.65, 2.0], [2.39, 0.9, -2.8], 50, { ease: "burst", dur: 9, creep: 0.003 }),
      { ...dealers, f: tons + 6, fov: 49 },
    ];
  },
  s05: (s: W): CamKey[] => {
    const badly = s.hit("badly");
    const off = s.hit("off");
    const lustig = s.hit("Lustig");
    const confession = s.hit("confession");
    const bribe = s.hit("bribe");
    return [
      K(0, [-1.62, 1.28, 2.6], [-1.85, 1.1, -0.55], 32, { creep: 0.003 }),
      K(badly + 6, [-1.66, 1.26, 2.2], [-1.85, 1.12, -0.55], 32, { ease: "burst", dur: 9, creep: 0.003 }),
      K(off + 4, [-1.62, 1.28, 2.55], [-1.85, 1.08, -0.55], 29.5, { ease: "burst", dur: 8, creep: 0.002, roll: -4 }),
      { ...TWO_SHOT, f: lustig + 10, dur: 18 },
      // tighter and higher on the confession: Lustig leans in, hand at his mouth
      K(confession + 4, [-1.7, 1.7, 2.4], [-1.4, 1.2, -0.45], 46, { ease: "burst", dur: 9, creep: 0.003 }),
      K(bribe + 6, [-1.36, 1.43, 3.25], [-1.44, 1.1, -0.4], 39, { ease: "burst", dur: 9, creep: 0.003 }),
    ];
  },
  s06: (s: W): CamKey[] => {
    const proof = s.hit("proof");
    const only = s.hit("Only");
    const pays = s.hit("pays");
    const plus = s.hit("plus");
    return [
      K(0, [-1.79, 1.2, 1.72], [-1.83, 1.08, -0.55], 32, { creep: 0.003 }),
      K(proof + 4, [-1.8, 1.24, 1.42], [-1.83, 1.12, -0.55], 32, { ease: "burst", dur: 9, creep: 0.003 }),
      // low angle from the side: Poisson and his thought, the suite rising behind them
      K(only + 8, [-3.28, 0.68, 2.95], [-1.5, 1.0, -0.45], 40, { ease: "glide", dur: 16, creep: 0.0015 }),
      // insert: the briefcase changes hands between them
      K(pays + 2, [-1.49, 0.95, 0.75], [-1.49, 0.72, -0.45], 36, { ease: "burst", dur: 9, creep: 0.002 }),
      { ...TWO_SHOT, f: plus + 6, pos: [-1.33, 1.5, 3.9], fov: 41, ease: "burst", dur: 10 },
    ];
  },
  s08: (s: W): CamKey[] => {
    const headlines = s.hit("headlines");
    const nothing = s.hit("Nothing");
    const poisson = s.hit("Poisson");
    const emb = s.hit("embarrassed");
    return [
      K(0, [-0.18, 1.2, 1.7], [-0.24, 1.08, 0.1], 36, { creep: 0.003 }),
      K(headlines + 8, [-0.22, 1.12, 1.4], [-0.24, 1.02, 0.1], 36, { ease: "glide", dur: 14, creep: 0.002 }),
      K(nothing, [0.06, 1.5, 3.2], [0.0, 1.16, -0.1], 40, { ease: "burst", dur: 6, creep: 0.003 }),
      // whip to Poisson's office next door (blurred in the scene while it moves)
      K(poisson + 3, [7.25, 1.45, 3.1], [7.0, 1.18, -0.2], 36, { ease: "burst", dur: 5, creep: 0.004 }),
      K(emb + 8, [7.2, 1.42, 2.65], [7.0, 1.18, -0.2], 35, { ease: "glide", dur: 14, creep: 0.002 }),
    ];
  },
  s09: (s: W): CamKey[] => {
    const tries = s.hit("tries");
    const again = s.hit("again");
    const calls = s.hit("calls");
    const escapes = s.hit("escapes");
    return [
      // wide: the tower behind Lustig, the FOR SALE sign beside him, the two new dealers listening
      K(0, [1.35, 1.0, 5.9], [-0.45, 1.3, -4], 56, { creep: 0.002 }),
      K(tries + 6, [1.2, 1.0, 5.5], [-0.5, 1.3, -4], 56, { ease: "glide", dur: 24, creep: 0.002 }),
      // the sign takes the stamp; the far dealer is wholly out of frame
      K(again + 4, [0.8, 1.1, 5.0], [-1.2, 1.5, -4], 44, { ease: "burst", dur: 7, creep: 0.003 }),
      K(calls + 6, [1.38, 1.42, 2.75], [1.15, 1.15, -0.35], 36, { ease: "burst", dur: 10, creep: 0.003 }),
      K(escapes + 12, [2.6, 2.1, 7.4], [7.2, 0.8, -1.8], 48, { ease: "glide", dur: 18, creep: 0.002 }),
    ];
  },
  s10: (s: W): CamKey[] => {
    const single = s.hit("single");
    const only = s.hit("only");
    return [
      K(0, [0.75, 2.25, 4.2], [0.05, 0.82, -0.6], 40, { creep: 0.003 }),
      K(single + 10, [-0.3, 2.7, 3.6], [0, 0.6, -0.6], 44, { ease: "glide", dur: 14, creep: 0.0008 }),
      // over the cabinets to the portrait (it hangs left of the opening frames, so it is never cut by an edge)
      K(only + 18, [-2.0, 1.7, 2.4], [-2.55, 2.3, -3.0], 36, { ease: "glide", dur: 22, creep: 0.002 }),
    ];
  },
};

/** Character / prop placements shared by the scenes and the framing checks. */
export const LAYOUT = {
  s01: { lustig: [0.9, 0, 0.3] as Vec3, tower: [5.1, 0, -46] as Vec3, towerH: 32, sale: [0.85, 2.8, -40.55] as Vec3, soldK: 0.78 },
  s02: { lustig: [0, 0.09, -0.22] as Vec3, table: [0, 0, 0.55] as Vec3, paperY: 0.985, paperZ: 0.06, tableTop: 0.652, down: [0, 0.12, -0.05] as Vec3 },
  s03: { lustig: [0, 0, 0] as Vec3, desk: [1.05, 0, 0] as Vec3, deskTop: 0.554, letter: [0.62, 0.557, 0.0] as Vec3, letterW: 0.483, letterD: 0.644 },
  s04: {
    seats: [-1.4, -0.7, 0, 0.7, 1.4].map((x) => [x, 0.09, -3.42] as Vec3),
    lustig: [3.26, 0, -2.55] as Vec3,
    easel: [2.55, 0, -2.95] as Vec3,
  },
  s05: { poisson: [-1.85, 0, -0.55] as Vec3, lustig: [-1.12, 0, -0.3] as Vec3 },
  s07: { carX: 3.8, lustig: [0.08, 0.12, 0.3] as Vec3 },
  s08: { lustig: [-0.24, 0.09, -0.25] as Vec3, poisson: [7.0, 0.14, -0.3] as Vec3 },
  s09: { lustig: [-0.3, 0, 0.3] as Vec3, sign: [-0.95, 0, -0.25] as Vec3, dealers: [[0.32, 0, 0.55], [1.3, 0, -0.35]] as Vec3[], tower: [-15.8, 0, -58] as Vec3, ship: [12.0, 0.03, -12] as Vec3, post: [5.3, 0, 0.9] as Vec3, cop: [1.68, 0, -3.5] as Vec3 },
  s10: { drawer: [-0.4, 0, -0.9] as Vec3, historian: [0.45, 0, -0.62] as Vec3, portrait: [-2.6, 2.75, -3.02] as Vec3 },
};

// ------------------------------------------------------------------------------------------------ Paris set
const ParisSet: React.FC<{ towerX?: number; towerZ?: number; trees?: boolean; right?: boolean }> = ({ towerX = 0, towerZ = -26, trees = true, right = true }) => (
  <>
    <Ground size={160} kind="tiles" />
    <EiffelTower position={[towerX, 0, towerZ]} H={32} />
    {trees
      ? [-15, -9, 9, 15].map((x, i) => <Tree key={x} position={[towerX + x, 0, towerZ + 9 + (i % 2) * 3]} size={1.3} leaf={i % 2 ? "#4aa356" : "#3f9e4a"} />)
      : null}
    <Building position={[towerX - 18, 0, -8]} w={6} h={10} d={6} color="#efe1c6" roof="#6f7f99" />
    <Building position={[towerX - 18, 0, -15]} w={6} h={12} d={6} color="#f2e6cf" roof="#6f7f99" />
    {right ? (
      <>
        <Building position={[towerX + 18, 0, -9]} w={6} h={11} d={6} color="#ead8b8" roof="#6f7f99" />
        <Building position={[towerX + 18, 0, -16]} w={6} h={9} d={6} color="#efe1c6" roof="#6f7f99" />
      </>
    ) : null}
    <Cloud position={[towerX - 22, 26, -70]} w={22} />
    <Cloud position={[towerX + 24, 30, -80]} w={26} />
    <Cloud position={[towerX + 2, 38, -95]} w={20} />
  </>
);

/** hotel rug: burgundy field, double gold border, a blue medallion */
const rugTex = () =>
  canvasTex("suiterug", 1024, 512, (g, W, H) => {
    g.fillStyle = "#7a1d2b";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#d4a017";
    g.lineWidth = 26;
    g.strokeRect(30, 30, W - 60, H - 60);
    g.lineWidth = 8;
    g.strokeRect(78, 78, W - 156, H - 156);
    g.fillStyle = "#2f4f6f";
    g.beginPath();
    g.ellipse(W / 2, H / 2, 190, 110, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 10;
    g.stroke();
    g.fillStyle = "#e8c46a";
    g.beginPath();
    g.ellipse(W / 2, H / 2, 70, 40, 0, 0, Math.PI * 2);
    g.fill();
    for (const [x, y] of [[150, 130], [W - 150, 130], [150, H - 130], [W - 150, H - 130]]) {
      g.beginPath();
      g.arc(x, y, 34, 0, Math.PI * 2);
      g.fill();
    }
  });

/** red rubber-stamp word on a transparent card (for 3D decals stamped onto paper and signs) */
const stampTex = (text: string) =>
  canvasTex(`stampword|${text}|${font("Anton")}`, 768, 320, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = "rgba(214,40,48,0.95)";
    g.lineWidth = 22;
    g.beginPath();
    g.roundRect(16, 16, W - 32, H - 32, 30);
    g.stroke();
    g.fillStyle = "rgba(214,40,48,0.95)";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = 210;
    g.font = `400 ${size}px "${font("Anton")}", sans-serif`;
    while (g.measureText(text).width > W - 110 && size > 40) {
      size -= 6;
      g.font = `400 ${size}px "${font("Anton")}", sans-serif`;
    }
    g.fillText(text, W / 2, H / 2 + 8);
  });

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const sold = s.hit("sold");
  const eiffel = s.hit("Eiffel");
  const scrap = s.hit("scrap");
  const v = variant % 3;
  const L = LAYOUT.s01;
  const cams = CAMS.s01(s, v);
  // the big SOLD stamp lands on "sold" (5-frame slam, so it starts 3 frames early); the FOR SALE variant stamps
  // its sign then, and the tower on "scrap"
  const soldIn = sold - 3;
  const bigSold = v === 1 ? scrap - 3 : soldIn;
  const kicks = [soldIn + 5, scrap + 1];
  const end = cams[cams.length - 1];
  const mv = smootherstep(invLerp(end.f - (end.dur ?? 24), end.f, s.f));
  // the cash variant opens low on the tower: its stamp rides up the left leg to the shared end position
  const k = v === 2 ? lerp(0.45, L.soldK, mv) : L.soldK;
  const ox = v === 2 ? lerp(-3.2, 0, mv) : 0;
  const [sx, sy] = screenAt(cams, s.f, [L.tower[0] + ox, L.towerH * k, L.tower[2]], kicks);
  const decal = slamK(s.f, soldIn);
  const decalMat = useMemo(() => new THREE.MeshBasicMaterial({ map: stampTex("SOLD"), transparent: true, depthWrite: false }), []);
  // v2 racks focus from the cash in his hands to the tower; the others keep the tower sharp from frame 0
  const dof = (f: number) => (v === 2 ? (f < eiffel ? 9 : 0) : f < eiffel - 4 ? 2 : 0);
  const focus = (f: number): Vec3 => (v === 2 && f < eiffel ? [0.95, 1.08, 0.3] : f < eiffel ? [0.9, 1.4, 0.3] : [L.tower[0], 9, L.tower[2]]);
  return (
    <AbsoluteFill>
      <Stage look="day" cam={cams} kicks={kicks} dof={dof} focus={focus} shadow={{ center: [0.5, 0, 0], size: 9 }}>
        <ParisSet towerX={L.tower[0]} towerZ={L.tower[2]} trees={false} />
        {v === 1 ? (
          <group position={L.sale}>
            {/* FOR SALE on the upper half, the lower half takes the SOLD stamp: both words stay readable */}
            <Board w={1.5} h={1.0} text={"FOR SALE\n "} bg="#fff6dd" fg="#22305a" rotation={[0, 0.0, 0.04]} />
            {decal > 0 ? (
              <mesh position={[0.02, -0.22, 0.03]} rotation={[0, 0, 0.1]} scale={[decal, decal, 1]} material={decalMat} layers={NOINK}>
                <planeGeometry args={[1.2, 0.46]} />
              </mesh>
            ) : null}
            {[-0.5, 0.5].map((x) => (
              <Cyl key={x} r={0.012} h={0.9} color="#2b2f3a" position={[x, 0.38, -0.02]} />
            ))}
          </group>
        ) : null}
        <Stick
          spec={LUSTIG}
          at={L.lustig}
          facing="right"
          pop={v === 1 ? eiffel + 17 : undefined}
          poses={[
            [0, v === 2 ? POSE.showCash : "pointUp"],
            [eiffel, POSE.pointTower],
            [scrap, "presentBoth"],
          ]}
          faces={[
            [0, "smug"],
            [sold, v === 2 ? "grin" : "smug"],
            [eiffel + 6, FACE.lookUpGrin],
            [scrap, "evil"],
          ]}
          items={v === 2 ? [[0, { kind: "money" }], [eiffel, null]] : []}
        />
      </Stage>
      <FXLayer>
        <Stamp at={bigSold} x={sx} y={sy} text="SOLD" size={150} rot={-12} />
        <Tag at={scrap} x={sx - 8} y={sy + 238} text="FOR SCRAP METAL" bg="#ffffff" fg="#d62f3a" size={54} rot={-4} />
        <FlashFX at={scrap} dur={5} max={0.35} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 cafe + newspaper
const S02: React.FC = () => {
  const s = useShot();
  const tiny = s.hit("tiny");
  const spots = s.hit("spots");
  const rust = s.hit("rusting");
  const repainting = s.hit("repainting");
  const fortune = s.hit("fortune");
  const L = LAYOUT.s02;
  // on "repainting" he lowers the paper into his lap, behind the table's far edge (it never cuts through the table)
  const lay = ramp(s.f, repainting + 2, 12);
  const peek = ramp(s.f, spots - 2, 6);
  const heldY = L.paperY - 0.035 * peek;
  const paperPos: Vec3 = [lerp(0, L.down[0], lay), lerp(heldY, L.down[1], lay), lerp(L.paperZ, L.down[2], lay)];
  const close = s.f > spots && s.f < repainting + 8;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={CAMS.s02(s)}
        dof={(f) => (f > spots && f < repainting + 8 ? 12 : 8)}
        focus={(f) => (f > spots && f < repainting + 8 ? [0, 0.95, L.paperZ] : [0, 1.25, 0])}
        shadow={{ center: [0, 0, 0], size: 8 }}
      >
        <Ground size={80} kind="tiles" />
        <Building position={[0, 0, -7]} w={14} h={9} d={4} color="#efe1c6" roof="#6f7f99" />
        <Awning position={[0, 3.2, -4.6]} w={7} text="CAFÉ DE LA PAIX" />
        <EiffelTower position={[-10, 0, -60]} H={34} />
        <group position={L.table} scale={[1, 0.8, 1]}>
          <CafeTable />
        </group>
        <Cup position={[0.5, L.tableTop - 0.004, 0.8]} rotation={[0, -0.5, 0]} />
        <Chair position={[0, 0, -0.5]} color="#2b2f3a" />
        <CafeTable position={[2.6, 0, -1.6]} cloth="#3f7ad6" />
        <Chair position={[2.6, 0, -2.4]} />
        <Plant position={[-2.4, 0, -1.8]} size={1.1} />
        <Stick
          spec={LUSTIG}
          at={L.lustig}
          poses={[[0, POSE.sitRead], [repainting + 4, POSE.sitRead], [repainting + 14, POSE.sitThink], [fortune, POSE.sitRub]]}
          faces={[[0, FACE.readDown], [spots, FACE.spotted], [tiny + 8, FACE.readDown], [repainting + 8, FACE.thinkUp], [fortune, FACE.greedy], [fortune + 16, "smug"]]}
        />
        <Newspaper
          position={paperPos}
          rotation={[-0.06, 0, 0]}
          w={0.62}
          headline="TOWER NEEDS COSTLY REPAIRS"
          sub="LA TOUR ROUILLE"
          art="tower"
          rust={ramp(s.f, rust - 2, 16)}
          held={lay < 0.5}
          res={close ? 2 : 1}
        />
      </Stage>
      <FXLayer>
        <Tag at={s.hit("Paris")} out={s.hit("paper") - 6} x={540} y={420} text="PARIS · 1925" bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" size={64} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 forgery at night
/** letterhead: crest, the ministry in two big lines (auto-fit so nothing runs off the sheet), text, signature */
const letterTex = () =>
  canvasTex(`letterhead2|${font("DM Serif Display")}`, 768, 1024, (g, W, H) => {
    const fam = font("DM Serif Display");
    g.fillStyle = "#fbf7ee";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#22305a";
    g.lineWidth = 10;
    g.strokeRect(26, 26, W - 52, H - 52);
    g.fillStyle = "#22305a";
    g.beginPath();
    g.arc(W / 2, 118, 50, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fbf7ee";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `400 50px "${fam}", serif`;
    g.fillText("RF", W / 2, 122);
    g.fillStyle = "#22305a";
    const lines = ["MINISTÈRE", "DES POSTES"];
    let size = 104;
    const fit = () => {
      g.font = `400 ${size}px "${fam}", serif`;
      return Math.max(...lines.map((l) => g.measureText(l).width));
    };
    while (fit() > W - 150 && size > 40) size -= 2;
    lines.forEach((l, i) => g.fillText(l, W / 2, 236 + i * size * 1.02));
    const ruleY = 236 + size * 1.02 + size * 0.62;
    g.fillRect(90, ruleY, W - 180, 6);
    g.fillStyle = "#a3a7b0";
    for (let i = 0; i < 8; i++) g.fillRect(96, ruleY + 50 + i * 44, i === 7 ? 300 : W - 192, 12);
    g.strokeStyle = "#22305a";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(440, 910);
    g.bezierCurveTo(480, 860, 520, 950, 560, 890);
    g.bezierCurveTo(590, 860, 620, 910, 660, 880);
    g.stroke();
  });

/** the insert's stamp hand: one ink arm stroke from the top-left (Lustig stands left of the desk), the ink-dot hand
 *  gripping the knob, the stamp block and its red rubber face (bottom centre = the anchor) */
const stampHandTex = () =>
  canvasTex("stamphand", 1024, 1024, (g, W, H) => {
    const ink = "#1d1418";
    g.clearRect(0, 0, W, H);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = ink;
    g.lineWidth = 26;
    g.beginPath();
    g.moveTo(-30, 120);
    g.quadraticCurveTo(250, 300, 512, 548);
    g.stroke();
    const box = (x: number, y: number, w: number, h: number, fill: string, r: number) => {
      g.fillStyle = fill;
      g.beginPath();
      g.roundRect(x, y, w, h, r);
      g.fill();
      g.lineWidth = 12;
      g.strokeStyle = ink;
      g.stroke();
    };
    box(488, 590, 48, 170, "#a06a35", 12);
    box(362, 750, 300, 150, "#5b3a24", 22);
    box(374, 892, 276, 72, "#d0312d", 8);
    g.fillStyle = "#8b5a2b";
    g.beginPath();
    g.arc(512, 584, 52, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 12;
    g.strokeStyle = ink;
    g.stroke();
    g.fillStyle = ink;
    g.beginPath();
    g.arc(512, 548, 32, 0, Math.PI * 2);
    g.fill();
  });
const HAND_GEO = (() => {
  const geo = new THREE.PlaneGeometry(0.9, 0.9);
  geo.translate(0, (964 / 1024) * 0.9 - 0.45, 0); // the rubber face's bottom centre sits at the origin
  return geo;
})();
const _q = new THREE.Quaternion();
/** orientation of the key camera at frame f (a billboard parallel to the image plane) */
const camQuat = (keys: CamKey[], f: number, kicks: number[] = []): [number, number, number, number] => {
  applyPose(_cam, poseAt(keys, f, kicks));
  _q.copy(_cam.quaternion);
  return [_q.x, _q.y, _q.z, _q.w];
};

const S03: React.FC = () => {
  const s = useShot();
  const forges = s.hit("forges");
  const gov = s.hit("government");
  const becomes = s.hit("becomes");
  const L = LAYOUT.s03;
  const cams = CAMS.s03(s);
  const hit = gov + 1; // the stamp meets the paper one frame before "government"
  const kicks = [hit];
  // insert: the stamp hand drops in, hangs, slams, lifts and leaves the frame before the camera pulls back
  const lift =
    s.f < forges + 3
      ? 0.75
      : s.f < forges + 7
        ? lerp(0.75, 0.3, smootherstep(invLerp(forges + 3, forges + 7, s.f)))
        : s.f < hit - 4
          ? 0.3 + 0.015 * Math.sin(s.f * 0.9)
          : s.f < hit
            ? 0.3 * (1 - invLerp(hit - 4, hit, s.f) ** 2)
            : s.f < hit + 2
              ? 0
              : s.f < hit + 8
                ? 0.22 * smootherstep(invLerp(hit + 2, hit + 8, s.f))
                : 0.22 + 1.1 * invLerp(hit + 8, hit + 15, s.f) ** 2;
  const handOn = s.f >= forges + 1 && s.f < hit + 15;
  const imprint: Vec3 = [L.letter[0] - 0.01, L.deskTop + 0.005, L.letter[2] + (0.53 - 0.5) * L.letterD];
  const imp = s.f < hit ? 0 : s.f < hit + 3 ? 1.12 - 0.12 * invLerp(hit, hit + 3, s.f) : 1;
  const badge = popK(s.f, becomes, 8);
  const letterMat = useMemo(() => unlit("#ffffff", letterTex(), 1.0), []);
  const impMat = useMemo(() => new THREE.MeshBasicMaterial({ map: stampTex("OFFICIAL"), transparent: true, depthWrite: false }), []);
  const handMat = useMemo(() => new THREE.MeshBasicMaterial({ map: stampHandTex(), alphaTest: 0.5, color: new THREE.Color("#f1e7da") }), []);
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={cams}
        kicks={kicks}
        dof={(f) => (f >= forges + 4 && f < hit + 16 ? 9 : 8)}
        focus={(f) => (f >= forges + 4 && f < hit + 16 ? [L.letter[0], L.deskTop + 0.1, L.letter[2]] : [0.1, 1.25, 0])}
        shadow={{ center: [0.4, 0, 0], size: 6 }}
      >
        <Room w={7} d={6} h={3.4} wall="#2f5d50" wallTex="plain" baseboard="#1f3b33" floor="wood" floorColor="#8a5a32" position={[0, 0, -1.2]} />
        <Window kind="night" position={[1.9, 1.85, -4.13]} curtain="#8c1f2a" />
        <Bookshelf position={[-2.2, 0, -3.9]} />
        <Clock position={[-0.5, 2.6, -4.13]} time={0.95} />
        <LightPool position={[1.5, 1.15, -4.12]} w={3.2} h={2.6} color="#ffcf8a" opacity={0.42} />
        <LightPool position={[0.9, L.deskTop + 0.006, 0.0]} rotation={[-Math.PI / 2, 0, 0]} w={1.9} h={1.3} color="#ffd9a0" opacity={0.35} />
        <group position={L.desk} scale={[1, 0.64, 1]}>
          <Desk w={1.5} d={0.8} color="#7a4a2a" />
        </group>
        <Lamp position={[1.62, L.deskTop, 0.26]} rotation={[0, 2.9, 0]} color="#c9a227" />
        <mesh position={L.letter} rotation={[-Math.PI / 2, 0, 0.03]} material={letterMat}>
          <planeGeometry args={[L.letterW, L.letterD]} />
        </mesh>
        {imp > 0 ? (
          <mesh position={imprint} rotation={[-Math.PI / 2, 0, -0.1]} material={impMat} layers={NOINK} scale={[imp, imp, 1]}>
            <planeGeometry args={[0.29, 0.12]} />
          </mesh>
        ) : null}
        {handOn ? (
          <mesh position={[imprint[0], imprint[1] + lift, imprint[2]]} quaternion={camQuat(cams, s.f, kicks)} geometry={HAND_GEO} material={handMat} layers={NOINK} />
        ) : null}
        <Stick
          spec={{ ...LUSTIG, badge: badge > 0 ? { text: "DEPUTY DIRECTOR", scale: badge } : undefined }}
          at={L.lustig}
          facing="right"
          poses={[
            [0, POSE.stampUp],
            [becomes, "handsHips"],
          ]}
          faces={[
            [0, FACE.slyGrin],
            [becomes, "smug"],
          ]}
          items={[[0, { kind: "stamp", hand: "R" }], [becomes, null]]}
        />
      </Stage>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the Crillon suite (s04-s06)
const SuiteSet: React.FC<{ children?: React.ReactNode; cloth?: boolean }> = ({ children, cloth = true }) => (
  <>
    <Room w={10} d={8} h={5.4} wall="#8c1f2a" wallTex="stripes" baseboard="#d4a017" floor="carpet" floorColor="#6e1f2a" position={[0, 0, -1]} />
    <Window kind="day" position={[-2.7, 2.0, -4.93]} w={1.7} h={2.1} curtain={null} />
    <Drapes position={[-3.95, 0, -5]} w={0.9} h={3.7} />
    <Drapes position={[-1.45, 0, -5]} w={0.9} h={3.7} />
    <Box size={[1.3, 1.7, 0.08]} color="#c9a227" position={[1.2, 2.05, -4.95]} r={0.03} />
    <Box size={[1.1, 1.5, 0.02]} color="#9fc2d8" position={[1.2, 2.05, -4.9]} r={0.01} />
    <Drapes position={[4.3, 0, -5]} w={0.9} h={3.7} />
    <LightPool position={[0, 2.7, -4.95]} w={5.2} h={3.4} color="#ffd38a" opacity={0.34} />
    <Chandelier position={[0, 3.4, -2.6]} />
    <Table w={3.8} d={1.2} color="#7a4a2a" position={[0, 0, -2.6]} />
    {cloth ? (
      <>
        {/* white cloth with a gold hem over the table front: the lower frame reads as the table, not as carpet */}
        <Box size={[3.9, 0.06, 1.3]} color="#f4efe2" position={[0, 0.83, -2.6]} r={0.02} />
        <Box size={[3.9, 0.5, 0.03]} color="#f4efe2" position={[0, 0.58, -1.94]} r={0.01} />
        <Box size={[3.9, 0.05, 0.035]} color="#d4a017" position={[0, 0.35, -1.93]} r={0.01} />
        {[-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => (
          <group key={x} position={[x, 0.86, -2.35]}>
            <Box size={[0.3, 0.008, 0.22]} color="#fbf7ee" position={[0.02, 0, 0.02]} rotation={[0, 0.1 * (i - 2), 0]} r={0.002} />
            <Cyl r={0.04} h={0.13} color="#cfe6f2" position={[0.24, 0, -0.06]} />
          </group>
        ))}
      </>
    ) : null}
    <LightPool position={[0, 0.9, -2.6]} rotation={[-Math.PI / 2, 0, 0]} w={3.6} h={1.6} color="#ffe2a8" opacity={0.26} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.4, 0.006, 0.2]} material={toon("#ffffff", { map: rugTex() })} receiveShadow>
      <planeGeometry args={[7.2, 3.6]} />
    </mesh>
    {LAYOUT.s04.seats.map(([x], i) => (
      <Chair key={i} position={[x, 0, -3.55]} color="#d4a017" />
    ))}
    <Plant position={[-4.2, 0, -3.8]} size={1.2} />
    {children}
  </>
);

// ------------------------------------------------------------------------------------------------ s04 hotel suite pitch
const easelX = (f: number, a: number) => clamp(invLerp(a, a + 5, f));
const S04: React.FC = () => {
  const s = useShot();
  const books = s.hit("books");
  const invites = s.hit("invites");
  const pitch = s.hit("pitch");
  const secretly = s.hit("secretly");
  const tearing = s.hit("tearing");
  const seven = s.hit("Seven");
  const tons = s.hit("tons");
  const L = LAYOUT.s04;
  const sheet = useMemo(() => towerSheetTex("LA TOUR EIFFEL"), []);
  const x1 = easelX(s.f, tearing + 1);
  const x2 = easelX(s.f, tearing + 7);
  const red = useMemo(() => unlit("#e0262f", null, 1.05), []);
  const diag = Math.atan2(0.78, 1.0);
  const dealerSpec = (i: number) => (i === 2 ? POISSON : DEALERS[i < 2 ? i : i - 1]);
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={CAMS.s04(s)}
        kicks={[seven + 1]}
        dof={(f) => (f >= pitch + 4 ? 10 : 5)}
        focus={(f) => (f >= secretly + 2 && f < tearing + 2) || f >= tons + 2 ? [0.3, 1.3, -3.42] : f >= pitch + 4 || f < invites + 6 ? [2.95, 1.45, -2.65] : [0, 1.3, -3.3]}
        shadow={{ center: [0.6, 0, -2.6], size: 7 }}
      >
        <SuiteSet>
          {L.seats.map((p, i) => (
            <Stick
              key={i}
              spec={dealerSpec(i)}
              at={i === 2 ? [p[0], 0.144, p[2]] : p}
              pop={invites + 2 + i * 6}
              poses={[
                [0, POSE.sitTable],
                [secretly, i === 0 ? POSE.sitTable : POSE.sitLeanR],
                [tearing + 6, POSE.sitTable],
                [tons, i % 2 ? POSE.sitCheer : POSE.sitRub],
              ]}
              faces={[
                [0, i === 2 ? "happy" : "neutral"],
                [pitch, FACE.curious],
                [secretly, FACE.slyGrin],
                [tearing + 4, "shocked"],
                [tons - 2, FACE.greedy],
              ]}
            />
          ))}
          <group position={L.easel} rotation={[0, -0.3, 0]}>
            <Easel tex={sheet} w={1.0} />
            <group position={[0, 1.35, 0.2]} rotation={[-0.12, 0, 0]}>
              {[
                [x1, -0.5, 0.39, -diag],
                [x2, -0.5, -0.39, diag],
              ].map(([k, sx, sy, a], i) =>
                k > 0 ? (
                  <group key={i} position={[sx, sy, 0.01]} rotation={[0, 0, a]}>
                    <mesh position={[0.63 * k, 0, 0]} scale={[k, 1, 1]} material={red}>
                      <boxGeometry args={[1.26, 0.075, 0.02]} />
                    </mesh>
                  </group>
                ) : null,
              )}
            </group>
          </group>
          <Stick
            spec={LUSTIG}
            at={L.lustig}
            facing="left"
            poses={[
              [0, "handsHips"],
              [invites, "presentBoth"],
              [pitch, "point"],
              [secretly, POSE.whisper],
              [tearing, "point"],
              [seven, "presentBoth"],
            ]}
            faces={[
              [0, "smug"],
              [pitch, "determined"],
              [secretly, FACE.slyGrin],
              [tearing, "evil"],
              [seven, "grin"],
            ]}
          />
        </SuiteSet>
      </Stage>
      <FXLayer>
        <Tag at={books} out={invites + 2} x={540} y={400} text="HÔTEL DE CRILLON" bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" size={60} />
        <Counter at={seven - 8} x={540} y={360} from={0} to={7000} dur={8} suffix=" TONS" size={124} fg="#FFD43B" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 Poisson + the confession
const S05: React.FC = () => {
  const s = useShot();
  const badly = s.hit("badly");
  const off = s.hit("off");
  const lustigW = s.hit("Lustig");
  const confession = s.hit("confession");
  const corrupt = s.hit("corrupt");
  const bribe = s.hit("bribe");
  const L = LAYOUT.s05;
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={CAMS.s05(s)}
        dof={(f) => (f < lustigW + 4 ? 13 : f >= confession + 2 && f < bribe + 2 ? 12 : 10)}
        focus={(f) => (f < lustigW + 4 ? [L.poisson[0], 1.3, L.poisson[2]] : f >= confession + 2 && f < bribe + 2 ? [L.lustig[0], 1.35, L.lustig[2]] : [-1.5, 1.3, -0.45])}
        shadow={{ center: [-1.5, 0, -1.5], size: 7 }}
      >
        <SuiteSet>
          {LAYOUT.s04.seats.map((p, i) =>
            i === 2 ? null : <Stick key={i} spec={DEALERS[i < 2 ? i : i - 1]} at={p} poses={[[0, POSE.sitTable]]} faces={[[0, i % 2 ? FACE.lookR : "neutral"]]} />,
          )}
          <Stick
            spec={POISSON}
            at={L.poisson}
            facing="right"
            poses={[
              [0, "holdFront"],
              [badly, "armsUp"],
              [off, "crossArms"],
              [confession, { ...PP([34, -122], [34, -122]), lean: 7, head: 9 }],
              [bribe + 4, "relaxed"],
            ]}
            faces={[
              [0, "happy"],
              [badly, "starstruck"],
              [off, FACE.suspicious],
              [confession, FACE.curious],
              [corrupt, "thinking"],
              [bribe + 4, "grin"],
            ]}
          />
          <Stick
            spec={LUSTIG}
            path={[
              [lustigW - 16, [-0.1, 0, -0.6]],
              [lustigW + 6, L.lustig],
            ]}
            facing="left"
            poses={[
              [0, "idle"],
              [confession - 2, POSE.whisper],
              [bribe, PP([12, 6], [74, -10], { head: 4 })],
            ]}
            faces={[
              [0, FACE.lookL],
              [confession, FACE.slyLook],
              [bribe, "evil"],
            ]}
          />
        </SuiteSet>
      </Stage>
      <FXLayer>
        <Tag at={s.hit("André")} out={off - 4} x={540} y={262} text="ANDRÉ POISSON" bg="#ffffff" size={58} />
        <Bubble at={corrupt} out={bribe - 2} x={600} y={215} text="Psst... I'm a corrupt official." width={600} size={46} tail="right" />
        <Burst at={bribe} x={300} y={360} text="BRIBE?" size={380} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 pivot + the payment
const S06: React.FC = () => {
  const s = useShot();
  const proof = s.hit("proof");
  const only = s.hit("Only");
  const pays = s.hit("pays");
  const twenty = s.hit("$20,000");
  const plus = s.hit("plus");
  const fifty = s.hit("$50,000");
  const win = s.hit("win");
  const L = LAYOUT.s05;
  const pass = pays + 4; // the briefcase changes hands
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={CAMS.s06(s)}
        kicks={[pass]}
        dof={(f) => (f < only + 4 ? 14 : f >= pays && f < plus + 2 ? 11 : 10)}
        focus={(f) => (f < only + 4 ? [L.poisson[0], 1.3, L.poisson[2]] : f >= pays && f < plus + 2 ? [-1.49, 0.72, -0.42] : [-1.5, 1.3, -0.45])}
        shadow={{ center: [-1.5, 0, -1.5], size: 7 }}
      >
        <SuiteSet>
          {LAYOUT.s04.seats.map((p, i) =>
            i === 2 ? null : <Stick key={i} spec={DEALERS[i < 2 ? i : i - 1]} at={p} poses={[[0, POSE.sitTable], [plus, POSE.sitCheer]]} faces={[[0, "neutral"], [plus, FACE.greedy]]} />,
          )}
          <Burst3D kind="bills" at={pass} origin={[-1.49, 0.7, -0.4]} count={80} power={3.4} life={60} />
          <Rain kind="bills" at={plus} spread={34} count={110} center={[-1.5, 0, -0.4]} half={[1.6, 1.0]} height={3.4} />
          <Stick
            spec={POISSON}
            at={L.poisson}
            facing="right"
            poses={[
              [0, "think"],
              [proof, { ...PP([34, -122], [30, -165], { head: -4 }) }],
              [only, "relaxed"],
              [pays - 8, POSE.holdBrief],
              [pass + 3, "relaxed"],
              [plus, POSE.laugh],
            ]}
            faces={[
              [0, FACE.suspicious],
              [proof, FACE.aha],
              [proof + 14, FACE.happyR],
              [pays, "grin"],
              [plus, "joy"],
            ]}
            items={[[pays - 8, { kind: "briefcase", hand: "R" }], [pass, null]]}
          />
          <Stick
            spec={LUSTIG}
            at={L.lustig}
            facing="left"
            poses={[
              [0, "handsHips"],
              [pays - 4, POSE.take],
              [plus, POSE.laugh],
            ]}
            faces={[
              [0, "smug"],
              [pays, FACE.greedy],
              [plus, "joy"],
            ]}
            items={[[pass, { kind: "briefcase", hand: "R" }]]}
          />
        </SuiteSet>
      </Stage>
      <FXLayer>
        <Bubble at={only - 4} out={pays - 6} kind="thought" x={330} y={320} text="A bribe? He must be REAL." width={480} size={46} />
        <Counter at={twenty - 10} out={win + 30} x={540} y={300} from={0} to={20000} dur={10} prefix="$" size={100} fg="#4dff9a" />
        <Counter at={fifty - 11} out={win + 30} x={540} y={470} from={0} to={50000} dur={11} prefix="+ $" size={100} fg="#FFD43B" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 train to Vienna
const S07: React.FC = () => {
  const s = useShot();
  const train = s.hit("train");
  const vienna = s.hit("Vienna");
  const cash = s.hit("cash");
  const L = LAYOUT.s07;
  const t0 = train - 2;
  const txAt = (f: number) => (f > t0 ? 0.5 * 0.0048 * (f - t0) ** 2 : 0);
  const tx = txAt(s.f);
  const speed = txAt(s.f + 1) - tx;
  // low view from beside the track, square to the lit side of the carriage: his window, the sign, the smoke
  // streaming back over the roof; the camera follows the train at 70 % so it visibly pulls out to the left
  const camX = -tx * 0.7;
  const smokeMat = useMemo(() => unlit("#eee8de", null, 1.0), []);
  return (
    <AbsoluteFill>
      <Stage
        look="dawn"
        cam={() => ({ pos: [3.25 + camX, 1.0, 4.5], look: [3.75 + camX, 1.4, 0], fov: 58, roll: 0 })}
        creep={0.0012}
        dof={2}
        focus={[L.carX - tx, 1.9, 0.8]}
        shadow={{ center: [L.carX, 0, 0], size: 12 }}
      >
        <Ground size={160} kind="concrete" color="#9a8b7c" />
        <Rails position={[0, 0, 0]} len={90} />
        <Platform position={[0, -0.05, -2.75]} len={70} />
        <StreetLamp position={[L.carX - 1.5, 0.85, -2.3]} h={3.0} on={false} />
        <StreetLamp position={[L.carX + 4.5, 0.85, -2.3]} h={3.0} on={false} />
        <group position={[-tx, 0.25, 0]}>
          <group scale={[-1, 1, 1]}>
            <Train carriages={0} color="#2b6fd6" />
          </group>
          {/* the smoke streams back over the carriages: longer and flatter as the train picks up speed */}
          {Array.from({ length: 11 }).map((_, i) => {
            const ph = (s.f * 0.032 + i / 11) % 1;
            const drift = ph * (5.5 + speed * 55);
            return (
              <mesh key={i} position={[-1.9 + drift, 3.0 + ph * (2.2 - Math.min(1.2, speed * 7)), -0.1 - ph * 0.6]} material={smokeMat} scale={0.32 + ph * 0.85} layers={NOINK}>
                <sphereGeometry args={[1, 14, 10]} />
              </mesh>
            );
          })}
          <group position={[L.carX, 0, 0]}>
            <Carriage color="#f2c14e" h={2.62} sign="PARIS → VIENNA" signW={1.5} signTop skirt />
            <Stick
              spec={LUSTIG}
              at={L.lustig}
              shadow={false}
              poses={[
                [0, POSE.waveBag],
                [train + 6, POSE.waveBagB],
                [vienna, POSE.waveBag],
                [vienna + 10, POSE.waveBagB],
                [cash, POSE.waveBag],
              ]}
              faces={[[0, "joy"], [vienna, "grin"], [cash, FACE.greedy]]}
              items={[[0, { kind: "bag", text: "$", hand: "L" }]]}
            />
          </group>
          <group position={[L.carX + 4.1, 0, 0]}>
            <Carriage color="#e14b4b" h={2.62} open={-1} skirt />
          </group>
        </group>
        <Building position={[-8, 0, -9]} w={10} h={8} d={4} color="#d9b98a" roof="#8a3b2e" />
        <Building position={[6, 0, -10]} w={8} h={10} d={4} color="#c9a37a" roof="#8a3b2e" />
        <Building position={[16, 0, -9]} w={8} h={7} d={4} color="#d9b98a" roof="#8a3b2e" />
        <Cloud position={[-8, 16, -60]} w={18} />
        <Cloud position={[14, 20, -70]} w={20} />
      </Stage>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s08 waiting / Poisson embarrassed (one world, whip between two rooms)
const S08: React.FC = () => {
  const s = useShot();
  const nothing = s.hit("Nothing");
  const poisson = s.hit("Poisson");
  const emb = s.hit("embarrassed");
  const report = s.hit("report");
  const L = LAYOUT.s08;
  // on "Nothing" he drops the paper flat onto the table
  const low = ramp(s.f, nothing, 9);
  const whip = Math.sin(Math.PI * clamp(invLerp(poisson - 2, poisson + 3, s.f)));
  return (
    <AbsoluteFill style={{ filter: whip > 0.02 ? `blur(${(22 * whip).toFixed(1)}px)` : undefined }}>
      <Stage
        look="interior"
        cam={CAMS.s08(s)}
        dof={(f) => (f < nothing + 4 ? 12 : f < poisson ? 9 : 11)}
        focus={(f) => (f < nothing ? [-0.24, 1.0, 0.1] : f < poisson ? [0, 1.1, 0] : [7.0, 1.3, -0.3])}
        shadow={{ center: [3.5, 0, 0], size: 12 }}
      >
        <Room w={7} d={6} h={3.4} wall="#d9b98a" wallTex="stripes" baseboard="#6b4f3a" floor="wood" floorColor="#6b4f3a" position={[0, 0, -1.5]} />
        <Window kind="night" position={[1.55, 1.9, -4.43]} curtain="#5a2b3e" />
        <LightPool position={[-0.6, 1.35, -4.42]} w={3.6} h={3.0} color="#ffcf8a" opacity={0.55} />
        <Table w={1.5} d={0.85} h={0.66} position={[0, 0, 0.4]} color="#6b4f3a" />
        <Lamp position={[0.55, 0.695, -0.05]} rotation={[0, 2.7, 0]} color="#c9a227" />
        <LightPool position={[0.1, 0.7, 0.4]} rotation={[-Math.PI / 2, 0, 0]} w={1.7} h={1.0} color="#ffd9a0" opacity={0.42} />
        <Newspaper position={[0.27, 0.66 + 0.24, 0.62]} rotation={[-0.4, -0.12, 0]} headline="WEATHER: RAIN" art="rain" w={0.42} />
        <Box size={[0.32, 0.12, 0.2]} color="#7a3f4a" position={[0.27, 0.72, 0.48]} r={0.02} />
        <Newspaper
          position={[lerp(L.lustig[0], -0.3, low), lerp(1.0, 0.705, low), lerp(0.1, 0.36, low)]}
          rotation={[lerp(-0.06, -Math.PI / 2 + 0.05, low), lerp(0, 0.2, low), 0]}
          headline="NOTHING TO REPORT"
          art="none"
          w={0.56}
          held={low < 0.25}
        />
        <Stick spec={LUSTIG} at={L.lustig} poses={[[0, POSE.sitRead], [nothing, POSE.sitShrug]]} faces={[[0, FACE.readDown], [nothing, "confused"]]} />
        {/* Poisson's office across town, in the same world (the camera whips over) */}
        <Room w={7} d={6} h={3.4} wall="#d8c39a" wallTex="stripes" baseboard="#7a4a2a" floor="wood" position={[7.0, 0, -1.5]} />
        <Window kind="day" position={[8.4, 1.9, -4.43]} curtain="#2f6b5a" />
        <Bookshelf position={[5.4, 0, -4.1]} />
        <group position={[7.0, 0, 0.45]} scale={[1, 0.8, 1]}>
          <Desk color="#7a4a2a" />
        </group>
        <Box size={[0.14, 0.2, 0.14]} color="#1b1b22" position={[7.75, 0.79, 0.4]} r={0.03} />
        <Stick
          spec={POISSON}
          at={L.poisson}
          poses={[
            [0, { ...POSE.cheeks, ...SIT }],
            [report, { ...POSE.cheeks, ...SIT, crouch: 0.62, head: 14 }],
          ]}
          faces={[[0, "nervousSmile"], [emb, FACE.embarrassed]]}
        />
      </Stage>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s09 again + police + escape
const S09: React.FC = () => {
  const s = useShot();
  const again = s.hit("again");
  const calls = s.hit("calls");
  const police = s.hit("police");
  const escapes = s.hit("escapes");
  const L = LAYOUT.s09;
  const stampK = slamK(s.f, again - 3);
  const againMat = useMemo(() => new THREE.MeshBasicMaterial({ map: stampTex("AGAIN?!"), transparent: true, depthWrite: false }), []);
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={CAMS.s09(s)}
        kicks={[again + 2, police + 1]}
        dof={(f) => (f >= calls && f < escapes ? 10 : 3)}
        focus={(f) => (f >= calls && f < escapes ? [L.dealers[1][0], 1.35, L.dealers[1][2]] : [-0.3, 1.4, 0.3])}
        shadow={{ center: [2, 0, -1], size: 14 }}
      >
        <ParisSet towerX={L.tower[0]} towerZ={L.tower[2]} trees={false} right={false} />
        <Water position={[22, 0.03, -8]} size={30} />
        <Box size={[0.5, 0.22, 30]} color="#c9c2b4" position={[7.0, 0.11, -8]} r={0.03} />
        <Ship position={L.ship} />
        <group position={L.post}>
          <Cyl r={0.06} h={2.6} color="#2b2f3a" />
          <Board w={1.75} h={0.5} text="TO AMERICA →" bg="#ffffff" fg="#22305a" position={[0.45, 2.25, 0.06]} />
        </group>
        <group position={L.sign}>
          <Cyl r={0.05} h={2.75} color="#6b4f3a" position={[-0.55, 0, 0]} />
          <Cyl r={0.05} h={2.75} color="#6b4f3a" position={[0.55, 0, 0]} />
          {/* FOR SALE on the upper half, the lower half takes the AGAIN?! stamp */}
          <Board w={1.3} h={0.9} text={"FOR SALE\n "} bg="#fff6dd" fg="#22305a" position={[0, 2.3, 0.06]} />
          {stampK > 0 ? (
            <mesh position={[0.01, 2.08, 0.09]} rotation={[0, 0, 0.1]} scale={[stampK, stampK, 1]} material={againMat} layers={NOINK}>
              <planeGeometry args={[1.08, 0.42]} />
            </mesh>
          ) : null}
        </group>
        {L.dealers.map((p, i) => (
          <Stick
            key={i}
            spec={DEALERS[i + 1]}
            at={p}
            facing="left"
            poses={[[0, "holdFront"], ...(i === 1 ? ([[calls, POSE.phoneEar]] as [number, Pose][]) : [])]}
            faces={[
              [0, "happy"],
              [again, i === 1 ? "thinking" : "happy"],
              [calls, i === 1 ? "determined" : "shocked"],
            ]}
            items={i === 1 ? [[calls, { kind: "handset", hand: "R", front: true }]] : []}
          />
        ))}
        <Stick
          spec={LUSTIG}
          path={[
            [escapes, L.lustig],
            [escapes + 30, [6.4, 0, 0.6]],
            [escapes + 56, [9.6, 0, -2.6]],
          ]}
          run
          facing="right"
          poses={[
            [0, "present"],
            [again - 6, "presentBoth"],
          ]}
          faces={[
            [0, "smug"],
            [again, "grin"],
            [police, "panic"],
          ]}
        />
        {/* the police arrive behind the caller (seen over his shoulder in the phone close-up) */}
        <group position={[L.cop[0] - 0.2 + Math.max(0, police + 8 - s.f) * 0.6, 0, -4.6]} rotation={[0, 0.25, 0]}>
          <Car color="#3a5ba8" />
          <PoliceLight position={[0, 1.24, 0]} t={Math.max(0, s.f - police)} />
        </group>
        <Stick spec={COP} at={L.cop} pop={police + 6} facing="left" poses={[[0, "point"]]} faces={[[0, FACE.shout]]} />
      </Stage>
      <FXLayer>
        <FlashFX at={police} dur={10} color="#ff2a2a" max={0.28} blend="screen" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s10 archive, empty drawer, the wink
const S10: React.FC = () => {
  const s = useShot();
  const single = s.hit("single");
  const report = s.hit("report");
  const word = s.hit("word");
  const L = LAYOUT.s10;
  const open = ramp(s.f, single - 6, 12);
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={CAMS.s10(s)}
        dof={(f) => (f >= s.hit("only") + 10 ? 9 : 8)}
        focus={(f) => (f < s.hit("only") + 6 ? [L.drawer[0], 0.9, L.drawer[2] + 0.3] : L.portrait)}
        shadow={{ center: [0, 0, -1], size: 7 }}
      >
        <Room w={8} d={6} h={4.8} wall="#c9b48a" wallTex="plain" baseboard="#6b4f3a" floor="wood" floorColor="#7a5a3a" position={[0, 0, -0.1]} />
        {[
          [-3.0, "1920", "1921"],
          [-2.0, "1922", "1923"],
          [1.3, "1926", "1927"],
          [2.3, "1928", "1929"],
        ].map(([x, a, b]) => (
          <FileDrawer key={String(x)} position={[Number(x), 0, -2.7]} label={String(a)} label2={String(b)} />
        ))}
        <FileDrawer position={L.drawer} label="POLICE 1925" label2="1925" open={open} empty />
        <LightPool position={[-2.75, 2.63, -3.05]} w={2.6} h={2.4} color="#ffe0a8" opacity={0.3} />
        <StickPortrait
          spec={LUSTIG}
          position={L.portrait}
          w={1.0}
          h={1.25}
          pose={s.f >= word ? "salute" : "idle"}
          face={s.f >= word ? FACE.wink : "smug"}
          plaque="V. LUSTIG"
        />
        <Stick
          spec={HISTORIAN}
          path={[
            [s.hit("proof"), L.historian],
            [s.hit("proof") + 26, [2.6, 0, -0.2]],
          ]}
          facing={s.f >= s.hit("proof") ? "right" : "left"}
          poses={[
            [0, "holdOne"],
            [single - 6, POSE.pullDrawer],
            [report, "shrug"],
          ]}
          faces={[
            [0, "thinking"],
            [single + 6, "shocked"],
            [report, "confused"],
          ]}
          items={[[0, { kind: "magnifier", hand: "R" }], [single - 6, null], [report, { kind: "magnifier", hand: "R" }]]}
        />
      </Stage>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#9cc8f0" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, s10: S10 }} />
);
