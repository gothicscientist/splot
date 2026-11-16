// Tiff: the recurring lead (23), anime-style cartoon. Same card system, Pose and Face vocabulary as the stick cast
// (every POSES / FACES key, walkPose, runPose, items, blink and talk work), but a fully shaped figure: curvy
// hourglass (full bust, narrow waist, wide hips, thick thighs, long legs), big glossy blue anime eyes, small face
// with a pointed chin, long straight silver-lavender hair to the hips with jagged bangs and chest-length side locks,
// black choker. Outfit: black scoop tank top, high-waisted frayed jean shorts, bare legs, black
// block-heel mid-calf boots. Original design; fully clothed and platform-safe.
//
// Design space: 600 x 1000 units, soles at y = 975, head top at ~y 190 (same headroom as the stick adult, so the
// 2.2 m card and the camera rules in CLAUDE.md still hold). Recolour via the spec: body = tank top, legColor =
// shorts, shoes = boots, accent = button, head = skin, hairColor.
import { INK, drawItem } from "./draw";
import type { DrawOpts, Face, Pose, StickSpec } from "./draw";

type Ctx = CanvasRenderingContext2D;
type V = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
function hexMul(c: string, k: number) {
  const n = parseInt(c.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

export const TIFF = {
  skin: "#fbe3d6",
  top: "#1d1b22",
  denim: "#4a78b5",
  boots: "#17151a",
  gold: "#e2b23c",
  hair: "#d9d8ef",
  hairLine: "#5e5a8c",
  lips: "#c2185b",
  irisTop: "#24407e",
  irisBot: "#8fd4ff",
  shadow: "rgba(150,70,110,0.30)",
};

/** Options for the shaped anime figure (Tiff is the default; side cast override pieces). */
export type AnimeLook = {
  build: "curvy" | "slim" | "male";
  hair: "long" | "bob" | "short";
  hairLine: string;
  iris: [string, string];
  top: "tank" | "tee";
  bottom: "shorts" | "jeans";
  shoes: "boots" | "sneakers";
  choker: boolean;
  lashes: boolean;
};
export const TIFF_LOOK: AnimeLook = {
  build: "curvy", hair: "long", hairLine: "#5e5a8c", iris: ["#24407e", "#8fd4ff"], top: "tank", bottom: "shorts",
  shoes: "boots", choker: true, lashes: true,
};

// leg / arm lengths and half-width profiles (u = 0 at the hip/shoulder, 1 at the ankle/wrist)
const THIGH = 186;
const SHIN = 180;
const ANKLE_LIFT = 25; // boot heels: ankle sits 25 units above the soles (sneakers: 14)
const UPPER = 118;
const FORE = 112;
const LEG_W_MALE: V[] = [[0, 27], [0.3, 25], [0.5, 22], [0.7, 21], [0.86, 20], [1, 19]];
const LEG_W: V[] = [[0, 36], [0.12, 33.5], [0.3, 26], [0.43, 18], [0.5, 13.4], [0.56, 15.4], [0.64, 17.2], [0.7, 17], [0.86, 10], [1, 6.5]];
const ARM_W: V[] = [[0, 13], [0.12, 14.5], [0.3, 13], [0.5, 10.8], [0.62, 11.6], [1, 7.2]];
const prof = (p: V[], u: number) => {
  for (let i = 0; i + 1 < p.length; i++) if (u <= p[i + 1][0]) {
    const t = (u - p[i][0]) / (p[i + 1][0] - p[i][0]);
    return p[i][1] + (p[i + 1][1] - p[i][1]) * t;
  }
  return p[p.length - 1][1];
};

/** spine samples along a two-segment limb */
function spine(a: V, b: V, c: V, n = 12): { pts: V[]; us: number[] } {
  const pts: V[] = [];
  const us: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    us.push(t * 0.5);
  }
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    pts.push([b[0] + (c[0] - b[0]) * t, b[1] + (c[1] - b[1]) * t]);
    us.push(0.5 + t * 0.5);
  }
  return { pts, us };
}
function normals(pts: V[]): V[] {
  return pts.map((_, i) => {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[Math.min(pts.length - 1, i + 1)];
    const tx = p1[0] - p0[0];
    const ty = p1[1] - p0[1];
    const l = Math.hypot(tx, ty) || 1;
    return [-ty / l, tx / l];
  });
}
/** tapered limb outline with round caps */
/** [1,2,1] smoothing passes with fixed endpoints: rounds the knee/elbow corner and the width changes */
function smoothV(a: V[], passes: number): V[] {
  let x = a;
  for (let k = 0; k < passes; k++) x = x.map((p, i) => (i === 0 || i === x.length - 1 ? p : [(x[i - 1][0] + 2 * p[0] + x[i + 1][0]) / 4, (x[i - 1][1] + 2 * p[1] + x[i + 1][1]) / 4]));
  return x;
}
function smoothN(a: number[], passes: number): number[] {
  let x = a;
  for (let k = 0; k < passes; k++) x = x.map((v, i) => (i === 0 || i === x.length - 1 ? v : (x[i - 1] + 2 * v + x[i + 1]) / 4));
  return x;
}
function limbPath(g: Ctx, pts: V[], hw: number[]) {
  const ns = normals(pts);
  const L = pts.map((p, i): V => [p[0] + ns[i][0] * hw[i], p[1] + ns[i][1] * hw[i]]);
  const R = pts.map((p, i): V => [p[0] - ns[i][0] * hw[i], p[1] - ns[i][1] * hw[i]]);
  const last = pts.length - 1;
  const aEnd = Math.atan2(ns[last][1], ns[last][0]);
  const a0 = Math.atan2(ns[0][1], ns[0][0]);
  g.beginPath();
  g.moveTo(...L[0]);
  for (let i = 1; i <= last; i++) g.lineTo(...L[i]);
  g.arc(pts[last][0], pts[last][1], hw[last], aEnd, aEnd - Math.PI, true);
  for (let i = last; i >= 0; i--) g.lineTo(...R[i]);
  g.arc(pts[0][0], pts[0][1], hw[0], a0 + Math.PI, a0, true);
  g.closePath();
  return { L, R, ns };
}
/** Path2D versions of smoothClosed / limbPath (for clip masks built from several shapes) */
function smoothClosed2D(p: V[]): Path2D {
  const P = new Path2D();
  const n = p.length;
  const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  P.moveTo(...mid(p[n - 1], p[0]));
  for (let i = 0; i < n; i++) {
    const m = mid(p[i], p[(i + 1) % n]);
    P.quadraticCurveTo(p[i][0], p[i][1], m[0], m[1]);
  }
  P.closePath();
  return P;
}
function limbPath2D(pts: V[], hw: number[]): Path2D {
  const ns = normals(pts);
  const L = pts.map((p, i): V => [p[0] + ns[i][0] * hw[i], p[1] + ns[i][1] * hw[i]]);
  const R = pts.map((p, i): V => [p[0] - ns[i][0] * hw[i], p[1] - ns[i][1] * hw[i]]);
  const last = pts.length - 1;
  const aEnd = Math.atan2(ns[last][1], ns[last][0]);
  const a0 = Math.atan2(ns[0][1], ns[0][0]);
  const P = new Path2D();
  P.moveTo(...L[0]);
  for (let i = 1; i <= last; i++) P.lineTo(...L[i]);
  P.arc(pts[last][0], pts[last][1], hw[last], aEnd, aEnd - Math.PI, true);
  for (let i = last; i >= 0; i--) P.lineTo(...R[i]);
  P.arc(pts[0][0], pts[0][1], hw[0], a0 + Math.PI, a0, true);
  P.closePath();
  return P;
}
/** closed smooth curve through points (midpoint quadratic smoothing) */
function smoothClosed(g: Ctx, p: V[]) {
  const n = p.length;
  const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  g.beginPath();
  g.moveTo(...mid(p[n - 1], p[0]));
  for (let i = 0; i < n; i++) {
    const m = mid(p[i], p[(i + 1) % n]);
    g.quadraticCurveTo(p[i][0], p[i][1], m[0], m[1]);
  }
  g.closePath();
}
const mirror = (right: V[]): V[] => [...right, ...[...right].reverse().map(([x, y]): V => [-x, y])];

// torso silhouette, right half, top to bottom: [half-width, dy from the hip line]
const TORSO_R: V[] = [
  [12, -226], [32, -218], [50, -212], [56, -200], [51, -186], [50, -176], [56, -171], [61, -163], [63.5, -154], [62, -145], [56.5, -139.5],
  [47, -136.5], [39, -135], [35.5, -125], [34, -114], [35, -104], [38.5, -92], [44, -78], [55, -56], [65, -34], [73, -12], [74, 6], [66, 18],
  [30, 24], [0, 25],
];

const TORSO_SLIM: V[] = [
  [12, -226], [32, -218], [48, -212], [54, -200], [50, -186], [49, -176], [52, -170], [55, -162], [56.5, -154], [55, -145],
  [51, -139], [44, -135], [38, -130], [35, -120], [34.5, -110], [36, -98], [40, -84], [47, -64], [56, -42], [63, -20],
  [66, 0], [62, 14], [30, 22], [0, 24],
];
const TORSO_MALE: V[] = [
  [16, -226], [42, -221], [64, -214], [74, -202], [72, -186], [67, -165], [61, -142], [56, -118], [52, -95], [51, -72],
  [51, -48], [51, -24], [51, -4], [50, 10], [42, 20], [22, 25], [0, 26],
];
// per build: torso, leg spacing, shoulder joint, arm thickness, shorts/jeans waist + hip half-widths
const BUILD = {
  curvy: { torso: TORSO_R, hipX: 37, shX: 47, armK: 1, waist: 56.5, hip: 74.5, leg: LEG_W, legK: 1 },
  slim: { torso: TORSO_SLIM, hipX: 34, shX: 46, armK: 0.95, waist: 50, hip: 66, leg: LEG_W, legK: 0.9 },
  male: { torso: TORSO_MALE, hipX: 26, shX: 63, armK: 1.4, waist: 50, hip: 52, leg: LEG_W_MALE, legK: 1 },
};

/** Front-facing walk (the card always faces the camera): legs stay under the hips and never cross; each foot
 *  lifts in turn (foreshortened leg, knee eases out), hips sway, opposite arm swings, head stays level. */
export function tiffWalkPose(phase: number, base?: Pose): Pose {
  const a = Math.sin(phase * Math.PI * 2);
  const lL = Math.pow(Math.max(0, a), 1.4);
  const lR = Math.pow(Math.max(0, -a), 1.4);
  const sway = a * 1.6;
  return {
    ...(base ?? { armL: [10, 8], armR: [10, 8], legL: [0, 0], legR: [0, 0] }),
    legL: [-1.5 - lL * 3, lL * 7],
    legR: [1.5 + lR * 3, -lR * 7],
    liftL: lL,
    liftR: lR,
    armL: [11 + a * 5, 10 + lR * 12],
    armR: [11 - a * 5, 10 + lL * 12],
    lean: sway,
    head: -sway * 1.2,
    bob: 0,
    crouch: 0,
  };
}

export function drawTiff(g: Ctx, w: number, h: number, spec: StickSpec, pose: Pose, face: Face, o: DrawOpts = {}) {
  const ink = o.ink ?? INK;
  const skin = spec.head ?? TIFF.skin;
  const top = spec.body ?? TIFF.top;
  const denim = spec.legColor ?? TIFF.denim;
  const gold = spec.accent ?? TIFF.gold;
  const shoes = spec.shoes ?? TIFF.boots;
  const hair = spec.hairColor ?? TIFF.hair;
  const look: AnimeLook = { ...TIFF_LOOK, ...(spec.anime ?? {}) };
  const bd = BUILD[look.build];
  const OL = 3.8; // outline width (fine anime line)
  const k = Math.min(w / 600, h / 1000);
  g.save();
  g.clearRect(0, 0, w, h);
  g.translate((w - 600 * k) / 2, h - 1000 * k);
  g.scale(k, k);
  if (o.flip) {
    g.translate(600, 0);
    g.scale(-1, 1);
  }
  g.lineCap = "round";
  g.lineJoin = "round";

  const LEG = THIGH + SHIN + (look.shoes === "boots" ? ANKLE_LIFT : 14);
  const crouch = (pose.crouch ?? 0) * LEG * 0.45;
  const squash = pose.squash ?? 1;
  const hipY = 975 - LEG - (pose.bob ?? 0) + crouch * 1.2;
  const cx = 300;
  const lean = rad(pose.lean ?? 0);
  const rot = (x: number, dy: number): V => {
    const dx = x;
    const yy = dy * squash;
    return [cx + dx * Math.cos(lean) - yy * Math.sin(lean), hipY + dx * Math.sin(lean) + yy * Math.cos(lean)];
  };

  // ---- head transform (needed first: the back hair is the rearmost layer)
  const nb = rot(0, -224);
  const hc: V = [nb[0] + Math.sin(lean) * 87, nb[1] - Math.cos(lean) * 87];
  const headTilt = rad(pose.head ?? 0) + lean * 0.6;
  const inHead = (fn: () => void) => {
    g.save();
    g.translate(hc[0], hc[1]);
    g.rotate(headTilt);
    fn();
    g.restore();
  };
  inHead(() => drawBackHair(g, hair, look, OL, headTilt));

  // ---- legs (bare + boots)
  const legs: Record<"L" | "R", { pts: V[]; L: V[]; R: V[]; us: number[] }> = {} as never;
  const drawLeg = (side: -1 | 1, ang: [number, number]) => {
    const lift = (side < 0 ? pose.liftL : pose.liftR) ?? 0;
    const thighL = THIGH * (1 - 0.11 * lift);
    const shinL = SHIN * (1 - 0.08 * lift);
    const hip: V = [cx + side * bd.hipX, hipY];
    // the stick poses splay the legs (fine for stick figures, too wide for Tiff): damp outward hip swing hard and
    // allow almost no inward swing, so her legs stay together in every pose
    const raw = ang[0];
    const outward = raw * side < 0 ? false : raw * side > 0;
    const a1 = rad(Math.abs(raw) > 45 ? raw : outward ? raw * 0.3 : Math.max(-2, Math.min(2, raw)));
    const kneeIn = -side * 3 * Math.max(0, Math.cos(a1));
    const knee: V = [hip[0] + Math.sin(a1) * thighL + kneeIn, hip[1] + Math.cos(a1) * thighL];
    const a2 = a1 + rad(ang[1]);
    const ankle: V = [knee[0] + Math.sin(a2) * shinL - kneeIn * 1.6, knee[1] + Math.cos(a2) * shinL];
    const sp = spine(hip, knee, ankle, 16);
    const pts = smoothV(sp.pts, 4);
    const us = sp.us;
    const hw = smoothN(us.map((u) => (look.bottom === "jeans" ? Math.max(prof(bd.leg, u) * bd.legK, u > 0.5 ? 15.5 : 0) : prof(bd.leg, u) * bd.legK)), 4);
    const legCol = look.bottom === "jeans" ? denim : skin;
    const sk = g.createLinearGradient(hip[0] - 40, 0, hip[0] + 40, 0);
    sk.addColorStop(0, hexMul(legCol, 0.9));
    sk.addColorStop(0.45, look.bottom === "jeans" ? hexMul(legCol, 1.12) : legCol);
    sk.addColorStop(1, hexMul(legCol, 0.86));
    const { L, R } = limbPath(g, pts, hw);
    g.fillStyle = sk;
    g.fill();
    limbPath(g, pts, hw);
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.8;
    g.stroke();
    // knee: soft kneecap curve + a short crease on the outer edge (bare legs only)
    if (look.bottom !== "jeans" && Math.cos(a1) > 0.5) {
      g.strokeStyle = hexMul(skin, 0.74);
      g.lineWidth = 1.7;
      g.beginPath();
      g.arc(knee[0] - side * 1, knee[1] - 2, 7.5, Math.PI * 0.25, Math.PI * 0.75);
      g.stroke();
      g.beginPath();
      g.moveTo(knee[0] + side * 9, knee[1] - 8);
      g.quadraticCurveTo(knee[0] + side * 6, knee[1] - 1, knee[0] + side * 9, knee[1] + 6);
      g.stroke();
    }
    if (look.shoes === "sneakers") {
      // jeans hem line just above the sneaker
      if (look.bottom === "jeans") {
        const k = us.findIndex((u) => u >= 0.95);
        const n1 = normals(pts)[k];
        g.strokeStyle = hexMul(denim, 0.6);
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(pts[k][0] + n1[0] * hw[k], pts[k][1] + n1[1] * hw[k]);
        g.lineTo(pts[k][0] - n1[0] * hw[k], pts[k][1] - n1[1] * hw[k]);
        g.stroke();
      }
      drawSneaker(g, ankle, shoes, ink, OL, side);
      legs[side < 0 ? "L" : "R"] = { pts, L, R, us };
      return;
    }
    // boot: shaft from mid-calf down + heeled foot
    const i0 = us.findIndex((u) => u >= 0.68);
    const bp = pts.slice(i0);
    const bw = hw.slice(i0).map((x) => x * 1.05 + 2);
    drawBoot(g, ankle, shoes, ink, OL, side);
    limbPath(g, bp, bw);
    const bg = g.createLinearGradient(ankle[0] - 24, 0, ankle[0] + 24, 0);
    bg.addColorStop(0, hexMul(shoes, 0.8));
    bg.addColorStop(0.35, hexMul(shoes, 1.9));
    bg.addColorStop(0.55, shoes);
    bg.addColorStop(1, hexMul(shoes, 0.7));
    g.fillStyle = bg;
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.75;
    g.stroke();
    // cuff line
    const c0 = bp[1];
    const n0 = normals(bp)[1];
    g.strokeStyle = hexMul(shoes, 2.4);
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(c0[0] + n0[0] * bw[1] * 0.9, c0[1] + n0[1] * bw[1] * 0.9);
    g.lineTo(c0[0] - n0[0] * bw[1] * 0.9, c0[1] - n0[1] * bw[1] * 0.9);
    g.stroke();
    legs[side < 0 ? "L" : "R"] = { pts, L, R, us };
  };
  drawLeg(-1, pose.legL);
  drawLeg(1, pose.legR);

  // ---- arms. The whole arm is drawn here, BEHIND the torso: the torso's shoulder/deltoid outline then flows into
  // the arm instead of a separate limb sitting on top of the shoulder. The forearm + hand are drawn again in front
  // after the torso (drawFore), so hands on hips, crossed arms etc. still read.
  const armGeo = (side: -1 | 1, ang: [number, number]) => {
    const sh = rot(side * bd.shX, -203);
    // hanging arms (the stick poses splay them out ~16-30 deg): keep Tiff's close to her body, inner arm behind
    // her hair; raised / bent-in arms (wave, point, hands on hips, crossed...) are left as posed
    const hang = Math.abs(ang[0]) < 40 && ang[1] >= -20;
    const a1 = rad(hang ? ang[0] * 0.45 : ang[0]);
    const el: V = [sh[0] + side * Math.sin(a1) * UPPER, sh[1] + Math.cos(a1) * UPPER];
    const a2 = a1 + rad(hang ? ang[1] * 0.45 : ang[1]);
    const wr: V = [el[0] + side * Math.sin(a2) * FORE, el[1] + Math.cos(a2) * FORE];
    const sa = spine(sh, el, wr, 12);
    const pts = smoothV(sa.pts, 6);
    const hw = smoothN(sa.us.map((u) => prof(ARM_W, u) * bd.armK), 8);
    return { pts, hw, us: sa.us, el, wr };
  };
  const armL = armGeo(-1, pose.armL);
  const armR = armGeo(1, pose.armR);
  for (const arm of [armL, armR]) {
    limbPath(g, arm.pts, arm.hw);
    g.fillStyle = skin;
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.75;
    g.stroke();

  }
  const drawFore = (arm: ReturnType<typeof armGeo>): V => {
    const i0 = Math.max(1, arm.us.findIndex((u) => u >= 0.5));
    const pts = arm.pts.slice(i0);
    const hw = arm.hw.slice(i0);
    const { L, R, ns } = limbPath(g, pts, hw);
    g.fillStyle = skin;
    g.fill();
    // edges + wrist end only: no outline across the elbow, so the arm stays one continuous limb
    const last = pts.length - 1;
    const aEnd = Math.atan2(ns[last][1], ns[last][0]);
    g.beginPath();
    g.moveTo(...L[0]);
    for (let i = 1; i <= last; i++) g.lineTo(...L[i]);
    g.arc(pts[last][0], pts[last][1], hw[last], aEnd, aEnd - Math.PI, true);
    for (let i = last; i >= 0; i--) g.lineTo(...R[i]);
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.75;
    g.stroke();
    // hand: soft mitten along the forearm direction, pink nails
    const { el, wr } = arm;
    const dir = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
    const hd: V = [wr[0] + Math.cos(dir) * 8, wr[1] + Math.sin(dir) * 8];
    g.save();
    g.translate(hd[0], hd[1]);
    g.rotate(dir);
    g.fillStyle = skin;
    g.beginPath();
    g.ellipse(-1, 0, 12, 8.6, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.6;
    g.stroke();
    g.fillStyle = "#f4a3b4";
    g.beginPath();
    g.ellipse(8, 0, 2.2, 3.6, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
    return hd;
  };

  // ---- torso (skin), then the tank top clipped to it
  const torsoPts = mirror(bd.torso).map(([x, dy]) => rot(x, dy));
  const torso = () => smoothClosed(g, torsoPts);
  // with a tee, the shirt shape IS the upper-body silhouette (the skin torso under it would peek out)
  if (look.top !== "tee") {
  torso();
  g.fillStyle = skin;
  g.fill();
  g.save();
  torso();
  g.clip();
  // black tank top: scoop neckline, wide straps
  const tg = g.createLinearGradient(...rot(-70, 0), ...rot(70, 0));
  tg.addColorStop(0, hexMul(top, 0.8));
  tg.addColorStop(0.4, hexMul(top, 1.9));
  tg.addColorStop(1, hexMul(top, 0.75));
  const tankTop = () => {
    g.beginPath();
    g.moveTo(...rot(-90, -184));
    g.lineTo(...rot(-53, -186));
    g.lineTo(...rot(-49, -218));
    g.lineTo(...rot(-33, -220));
    g.quadraticCurveTo(...rot(-30, -176), ...rot(0, -166));
    g.quadraticCurveTo(...rot(30, -176), ...rot(33, -220));
    g.lineTo(...rot(49, -218));
    g.lineTo(...rot(53, -186));
    g.lineTo(...rot(90, -184));
    g.lineTo(...rot(90, 60));
    g.lineTo(...rot(-90, 60));
    g.closePath();
  };
  tankTop();
  g.fillStyle = tg;
  g.fill();
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.6;
  g.beginPath();
  if (look.top === "tank") {
    g.moveTo(...rot(-53, -186));
    g.lineTo(...rot(-49, -218));
    g.moveTo(...rot(-33, -220));
    g.quadraticCurveTo(...rot(-30, -176), ...rot(0, -166));
    g.quadraticCurveTo(...rot(30, -176), ...rot(33, -220));
    g.moveTo(...rot(49, -218));
    g.lineTo(...rot(53, -186));
  }
  g.stroke();
  // form: soft highlights and under-curves (female builds)
  for (const s of look.build === "male" ? [] : [-1, 1]) {
    const c = rot(s * 36, -155);
    const hl = g.createRadialGradient(c[0] - 6, c[1] - 6, 2, c[0], c[1], 30);
    hl.addColorStop(0, "rgba(255,255,255,0.16)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hl;
    g.beginPath();
    g.arc(c[0], c[1], 30, 0, Math.PI * 2);
    g.fill();
    // breast line: from the centre out to the side, under the hair
    g.strokeStyle = look.top === "tank" ? "rgba(0,0,0,0.55)" : hexMul(top, 0.8);
    g.lineWidth = look.top === "tank" ? 2.6 : 1.6;
    g.beginPath();
    if (look.top === "tank") {
      g.moveTo(...rot(s * 8, -143));
      g.quadraticCurveTo(...rot(s * 28, -124), ...rot(s * 46, -136));
      g.stroke();
    }
  }

  // cleavage line + collarbones: only where the neckline shows skin (tank)
  if (look.top === "tank") {
  g.strokeStyle = hexMul(skin, 0.72);
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(...rot(-3, -183));
  g.quadraticCurveTo(...rot(1, -176), ...rot(0, -167.5));
  g.stroke();
  // collarbones
  g.strokeStyle = hexMul(skin, 0.78);
  g.lineWidth = 1.8;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(...rot(s * 8, -206));
    g.quadraticCurveTo(...rot(s * 18, -210), ...rot(s * 26, -207));
    g.stroke();
  }
  }
  g.restore();
  torso();
  g.strokeStyle = ink;
  g.lineWidth = OL;
  g.stroke();
  }
  if (look.top === "tee") {
    // a regular T-shirt: clean straight lines from the shoulder over the chest and straight down to the hem
    // (no waist curve, no folds); men taper slightly (V shape)
    const TEE: Record<AnimeLook["build"], V[]> = {
      // fitted tee on the hourglass build: round bust, nipped waist, out to the waistband (Tiff's figure)
      curvy: [[16, -226], [40, -220], [52, -211], [55, -200], [54, -188], [53.6, -178], [53.6, -168], [53.9, -154.8], [56.0, -150.8], [56.9, -146.5], [56.7, -142.0], [55.4, -137.8], [53.0, -134.1], [49.8, -131.1], [45.8, -129.0], [41.5, -128.1], [37.0, -128.3], [32.8, -129.6], [34.5, -122], [34.5, -114], [35.5, -100], [39.5, -86], [45.5, -72], [52, -59], [56.5, -50], [56.5, -46]],
      // bust stays round under the tee; below it the shirt falls straight to the hem
      slim: [[16, -226], [40, -220], [52, -210], [54, -192], [55, -180], [57, -170], [59, -161], [60, -154], [59.6, -148], [58.4, -142], [56.8, -137], [55.6, -132], [55.2, -125], [55.2, -50], [54.8, -46]],
      male: [[16, -226], [46, -221], [68, -213], [75, -198], [72, -170], [64, -120], [58, -50], [57.5, -46]],
    };
    const half = TEE[look.build];
    const pts = [...half, ...[...half].reverse().map(([x, dy]): V => [-x, dy])].map(([x, dy]) => rot(x, dy));
    // shirt body + short sleeves filled first, then ONE outline around the union (no seam between sleeve and body)
    const teeBody = () => smoothClosed(g, pts);
    const male = look.build === "male";
    const sleeves = [armL, armR].map((arm) => {
      const n = Math.max(2, arm.us.findIndex((u) => u >= (male ? 0.17 : 0.12)));
      return { sp: arm.pts.slice(0, n + 1), sw: arm.hw.slice(0, n + 1).map((x) => x + 0.8) };
    });
    if (male) {
      // Jake's approved tee: sleeves sit behind the body with their own outline
      for (const { sp, sw } of sleeves) {
        limbPath(g, sp, sw);
        g.fillStyle = hexMul(top, 0.95);
        g.fill();
        g.strokeStyle = ink;
        g.lineWidth = OL * 0.7;
        g.stroke();
      }
    }
    teeBody();
    const tg2 = g.createLinearGradient(...rot(-70, 0), ...rot(70, 0));
    tg2.addColorStop(0, hexMul(top, 0.88));
    tg2.addColorStop(0.4, hexMul(top, 1.04));
    tg2.addColorStop(1, hexMul(top, 0.84));
    g.fillStyle = tg2;
    g.fill();
    for (const { sp, sw } of male ? [] : sleeves) {
      limbPath(g, sp, sw);
      g.fillStyle = tg2;
      g.fill();
    }
    if (look.build !== "male") {
      for (const sd of [-1, 1]) {
        const c = rot(sd * 38, -149);
        const hl = g.createRadialGradient(c[0] - 6, c[1] - 6, 2, c[0], c[1], 22);
        hl.addColorStop(0, "rgba(255,255,255,0.22)");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = hl;
        g.beginPath();
        g.arc(c[0], c[1], 28, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = hexMul(top, 0.62);
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(...rot(sd * 12, -137));
        g.quadraticCurveTo(...rot(sd * 25, -125), ...rot(sd * 40, -128.5));
        g.stroke();
      }
    }
    g.strokeStyle = ink;
    const body2 = smoothClosed2D(pts);
    const sleeve2 = male ? [] : sleeves.map(({ sp, sw }) => limbPath2D(sp, sw));
    // body outline, except where a sleeve covers it
    g.save();
    const m1 = new Path2D();
    m1.rect(-2000, -2000, 5000, 5000);
    for (const sl of sleeve2) m1.addPath(sl);
    g.clip(m1, "evenodd");
    g.lineWidth = OL * 0.85;
    g.stroke(body2);
    g.restore();
    // sleeve outlines, except inside the body (and not inside the other sleeve)
    g.save();
    const m2 = new Path2D();
    m2.rect(-2000, -2000, 5000, 5000);
    m2.addPath(body2);
    g.clip(m2, "evenodd");
    g.lineWidth = OL * 0.7;
    for (const sl of sleeve2) g.stroke(sl);
    g.restore();
    // crew neckline
    const nl = rot(-17, -224);
    g.fillStyle = skin;
    g.beginPath();
    g.moveTo(...nl);
    g.quadraticCurveTo(...rot(0, -206), ...rot(17, -224));
    g.lineTo(...rot(14, -228));
    g.lineTo(...rot(-14, -228));
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(...nl);
    g.quadraticCurveTo(...rot(0, -206), ...rot(17, -224));
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.6;
    g.stroke();
  }

  // ---- jean shorts: high waist at the hips, short legs over the thighs, frayed hems
  {
    const at = (leg: { pts: V[]; L: V[]; R: V[]; us: number[] }, u: number, outer: boolean, left: boolean): V => {
      let i = leg.us.findIndex((x) => x >= u);
      if (i < 0) i = leg.us.length - 1;
      const a = leg.L[i];
      const b = leg.R[i];
      const minX = a[0] < b[0] ? a : b;
      const maxX = a[0] < b[0] ? b : a;
      return left === outer ? minX : maxX;
    };
    const HEM = 0.09;
    const lo = at(legs.L, HEM, true, true);
    const spineAt = (leg: { pts: V[]; us: number[] }) => leg.pts[Math.max(0, leg.us.findIndex((x) => x >= HEM))];
    const sL = spineAt(legs.L);
    const sR = spineAt(legs.R);
    const mid = (sL[0] + sR[0]) / 2;
    const li0 = at(legs.L, HEM, false, true);
    const ri0 = at(legs.R, HEM, false, false);
    // touching thighs: keep the two leg openings from overlapping
    const li: V = [Math.min(li0[0], mid - 5), li0[1]];
    const ri: V = [Math.max(ri0[0], mid + 5), ri0[1]];
    const ro = at(legs.R, HEM, true, false);
    const w0 = rot(-bd.waist, -52);
    const w1 = rot(bd.waist, -52);
    const h0 = rot(-bd.hip, -2);
    const h1 = rot(bd.hip, -2);
    const crotch: V = [mid, Math.max(li[1], ri[1]) + 2];
    const crossed = sL[0] > sR[0];
    const shorts = () => {
      g.beginPath();
      g.moveTo(...w0);
      if (look.build === "male") g.lineTo(...lo);
      else {
        g.quadraticCurveTo(...rot(-bd.hip, -30), ...h0);
        g.quadraticCurveTo(h0[0], (h0[1] + lo[1]) / 2, lo[0], lo[1]);
      }
      if (crossed) {
        // legs cross mid-stride: one continuous hem, no crotch notch
        g.quadraticCurveTo((lo[0] + ro[0]) / 2, Math.max(lo[1], ro[1]) + 6, ro[0], ro[1]);
      } else {
        g.quadraticCurveTo((lo[0] + crotch[0]) / 2, lo[1] + 5, crotch[0], crotch[1]);
        g.quadraticCurveTo((crotch[0] + ro[0]) / 2, ro[1] + 5, ro[0], ro[1]);
      }
      if (look.build === "male") g.lineTo(...w1);
      else {
        g.quadraticCurveTo(h1[0], (h1[1] + ro[1]) / 2, h1[0], h1[1]);
        g.quadraticCurveTo(...rot(bd.hip, -30), ...w1);
      }
      g.closePath();
    };
    shorts();
    const jg = g.createLinearGradient(lo[0], 0, ro[0], 0);
    jg.addColorStop(0, hexMul(denim, 0.72));
    jg.addColorStop(0.35, hexMul(denim, 1.2));
    jg.addColorStop(0.65, hexMul(denim, 1.05));
    jg.addColorStop(1, hexMul(denim, 0.68));
    g.fillStyle = jg;
    g.fill();
    g.save();
    shorts();
    g.clip();
    // waistband band
    g.fillStyle = hexMul(denim, 0.9);
    g.beginPath();
    g.moveTo(...rot(-90, -54));
    g.lineTo(...rot(90, -54));
    g.lineTo(...rot(90, -41));
    g.quadraticCurveTo(...rot(0, -37), ...rot(-90, -41));
    g.closePath();
    g.fill();
    g.strokeStyle = hexMul(denim, 0.6);
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(...rot(-90, -41));
    g.quadraticCurveTo(...rot(0, -37), ...rot(90, -41));
    g.stroke();
    // belt loops
    g.fillStyle = hexMul(denim, 0.82);
    for (const x of [-46, -20, 20, 46]) {
      const a0 = rot(x - 2.5, -55);
      g.save();
      g.translate(a0[0], a0[1]);
      g.rotate(lean);
      g.fillRect(0, 0, 5, 15);
      g.strokeRect(0, 0, 5, 15);
      g.restore();
    }
    // front: J-stitched fly, scoop pockets with a coin pocket, whiskers
    g.strokeStyle = hexMul(denim, 0.58);
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(...rot(10, -38));
    g.lineTo(...rot(10, -2));
    g.quadraticCurveTo(...rot(9, 8), ...rot(1, 10));
    g.moveTo(...rot(1, -38));
    g.lineTo(...rot(1, 12));
    for (const sd of [-1, 1]) {
      g.moveTo(...rot(sd * 27, -40));
      g.quadraticCurveTo(...rot(sd * 32, -20), ...rot(sd * 72, -18));
    }
    g.moveTo(...rot(40, -40));
    g.lineTo(...rot(42, -27));
    g.lineTo(...rot(56, -24));
    g.stroke();
    g.strokeStyle = "rgba(240,200,120,0.75)";
    g.lineWidth = 1;
    g.setLineDash([3, 3]);
    g.beginPath();
    g.moveTo(...rot(14, -38));
    g.lineTo(...rot(14, -2));
    g.quadraticCurveTo(...rot(13, 12), ...rot(1, 14));
    for (const sd of [-1, 1]) {
      g.moveTo(...rot(sd * 23, -40));
      g.quadraticCurveTo(...rot(sd * 28, -16), ...rot(sd * 72, -14));
    }
    g.stroke();
    g.setLineDash([]);
    g.strokeStyle = "rgba(255,255,255,0.28)";
    g.lineWidth = 1.6;
    for (const sd of [-1, 1]) {
      for (const [x0, y0, x1, y1] of [[8, 4, 30, -4], [10, 12, 34, 6], [12, 20, 30, 16]]) {
        g.beginPath();
        g.moveTo(...rot(sd * x0, y0));
        g.lineTo(...rot(sd * x1, y1));
        g.stroke();
      }
    }
    g.restore();
    // inseam where the two legs of the shorts meet
    if (!crossed) {
      g.strokeStyle = hexMul(denim, 0.55);
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(crotch[0], crotch[1]);
      g.lineTo(crotch[0], crotch[1] - 16);
      g.stroke();
    }
    if (look.bottom === "jeans") {
      // only the waist + hip sides get an outline; the legs continue in denim below
      g.beginPath();
      g.moveTo(...w0);
      if (look.build === "male") g.lineTo(...lo);
      else {
        g.quadraticCurveTo(...rot(-bd.hip, -30), ...h0);
        g.quadraticCurveTo(h0[0], (h0[1] + lo[1]) / 2, lo[0], lo[1]);
      }
      g.moveTo(...w1);
      if (look.build === "male") g.lineTo(...ro);
      else {
        g.quadraticCurveTo(...rot(bd.hip, -30), ...h1);
        g.quadraticCurveTo(h1[0], (h1[1] + ro[1]) / 2, ro[0], ro[1]);
      }
      g.moveTo(...w0);
      g.lineTo(...w1);
    } else shorts();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.85;
    g.stroke();
    // button
    const b = rot(3, -44);
    g.fillStyle = gold;
    g.beginPath();
    g.arc(b[0], b[1], 4.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 1.4;
    g.stroke();
    // frilly frayed hems: a pale distressed edge with dense, uneven fringe threads
    // pull the fringe in from the side edges so nothing pokes past the outline
    const inset = (p: V, q: V, d: number): V => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      return [p[0] + ((q[0] - p[0]) / l) * d, p[1] + ((q[1] - p[1]) / l) * d];
    };
    const loIn = inset(lo, crossed ? ro : crotch, 7);
    const roIn = inset(ro, crossed ? lo : crotch, 7);
    for (const [a, c] of (look.bottom === "jeans" ? [] : crossed ? [[loIn, roIn]] : [[loIn, crotch], [crotch, roIn]]) as [V, V][]) {
      const n = Math.max(6, Math.round(Math.hypot(c[0] - a[0], c[1] - a[1]) / 2.4));
      g.strokeStyle = hexMul(denim, 1.45);
      g.lineWidth = 4.6;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(c[0], c[1]);
      g.stroke();
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = a[0] + (c[0] - a[0]) * t;
        const y = a[1] + (c[1] - a[1]) * t;
        const len = 4 + ((i * 37) % 9);
        const dx = ((i * 13) % 5) - 2;
        g.strokeStyle = i % 3 === 0 ? hexMul(denim, 1.25) : "#eef3fa";
        g.lineWidth = i % 2 ? 1.3 : 1.7;
        g.beginPath();
        g.moveTo(x, y + 1);
        g.quadraticCurveTo(x + dx * 0.5, y + 1 + len * 0.6, x + dx, y + 1 + len);
        g.stroke();
      }
    }
  }

  // ---- forearms + hands in front (the upper arms were drawn behind the torso, see armGeo above)
  const handL = drawFore(armL);
  const handR = drawFore(armR);
  if (o.item) drawItem(g, o.item, o.item.hand === "L" ? handL : handR, 104, ink, OL);

  // ---- neck (+ choker), head, face, front hair
  {
    const tip: V = [hc[0] - Math.sin(headTilt) * 40, hc[1] + Math.cos(headTilt) * 40];
    const nk = look.build === "male" ? 18 : 13;
    const nk2 = look.build === "male" ? 16 : 11;
    g.fillStyle = skin;
    g.beginPath();
    g.moveTo(nb[0] - nk, nb[1] + 8);
    g.lineTo(tip[0] - nk2, tip[1]);
    g.lineTo(tip[0] + nk2, tip[1]);
    g.lineTo(nb[0] + nk, nb[1] + 8);
    g.closePath();
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.7;
    g.beginPath();
    g.moveTo(nb[0] - nk, nb[1] + 4);
    g.lineTo(tip[0] - nk2, tip[1]);
    g.moveTo(nb[0] + nk, nb[1] + 4);
    g.lineTo(tip[0] + nk2, tip[1]);
    g.stroke();
    // black choker with a small silver ring
    if (look.choker) {
    const cc: V = [nb[0] + (tip[0] - nb[0]) * 0.3, nb[1] + (tip[1] - nb[1]) * 0.3];
    g.save();
    g.translate(cc[0], cc[1]);
    g.rotate(lean);
    g.fillStyle = "#18161c";
    g.beginPath();
    g.roundRect(-13.5, -5, 27, 10, 3);
    g.fill();
    g.strokeStyle = "#cfd3dc";
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(0, 7, 3.4, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    }
  }
  inHead(() => {
    // shadow the hair casts on the neck
    g.fillStyle = hexMul(skin, 0.9);
    g.beginPath();
    g.ellipse(0, 60, 12, 6, 0, 0, Math.PI * 2);
    g.fill();
    // anime face: soft cranium, cheek, small pointed chin
    const fr: V[] = look.build === "male"
      ? [[0, -66], [38, -58], [52, -30], [52, -2], [51, 22], [45, 44], [24, 57], [0, 59]]
      : [[0, -66], [34, -58], [48, -30], [48, -4], [44, 20], [32, 41], [13, 57], [0, 62]];
    const fp: V[] = [...fr, ...[...fr].reverse().slice(1, -1).map(([x, y]): V => [-x, y])];
    smoothClosed(g, fp);
    g.fillStyle = skin;
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.8;
    g.stroke();
    drawTiffFace(g, face, o, ink, look, skin);
  });
  // side locks: the top hangs from the head, the lower part is anchored to the body, so the locks always cover
  // the outer edges of the bust (max half-width ~62) whatever the head tilt or body lean
  const H = (x: number, y: number): V => [hc[0] + x * Math.cos(headTilt) - y * Math.sin(headTilt), hc[1] + x * Math.sin(headTilt) + y * Math.cos(headTilt)];
  const B = (x: number, dy: number): V => rot(x, dy);
  for (const sd of look.hair === "long" ? [-1, 1] : []) {
    g.beginPath();
    g.moveTo(...H(sd * 46, -24));
    g.bezierCurveTo(...H(sd * 58, 12), ...B(sd * 67, -196), ...B(sd * 67, -152));
    g.lineTo(...B(sd * 67, -128));
    g.lineTo(...B(sd * 61, -104));
    g.lineTo(...B(sd * 56, -124));
    g.lineTo(...B(sd * 50, -108));
    g.lineTo(...B(sd * 46, -130));
    g.bezierCurveTo(...B(sd * 43, -175), ...H(sd * 43, 40), ...H(sd * 42, 10));
    g.closePath();
    const top = H(0, -20);
    const bot = B(0, -104);
    const lg = g.createLinearGradient(top[0], top[1], bot[0], bot[1]);
    lg.addColorStop(0, hexMul(hair, 0.78));
    lg.addColorStop(0.3, hair);
    lg.addColorStop(1, hexMul(hair, 0.82));
    g.fillStyle = lg;
    g.fill();
    g.strokeStyle = look.hairLine;
    g.lineWidth = OL * 0.65;
    g.stroke();
    g.strokeStyle = hexMul(hair, 0.7);
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(...H(sd * 50, 30));
    g.quadraticCurveTo(...B(sd * 57, -180), ...B(sd * 57, -130));
    g.stroke();
  }
  inHead(() => drawFrontHair(g, hair, look, OL));
  g.restore();
}

function drawBoot(g: Ctx, a: V, col: string, ink: string, OL: number, side: -1 | 1) {
  // front view: the heel peeks out behind, the rounded toe faces the camera, angled slightly outward
  const [x, y] = a;
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.6;
  g.fillStyle = col;
  g.beginPath();
  g.moveTo(x - 10, y);
  g.quadraticCurveTo(x - 13, y + 12, x - 14 + side * 3, y + 19);
  g.quadraticCurveTo(x + side * 3, y + 31, x + 14 + side * 3, y + 19);
  g.quadraticCurveTo(x + 13, y + 12, x + 10, y);
  g.closePath();
  g.fill();
  g.stroke();
  // toe shine + sole line
  g.fillStyle = hexMul(col, 3.2);
  g.beginPath();
  g.ellipse(x + side * 3 - 3, y + 19, 3.5, 2, -0.3, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = hexMul(col, 2.6);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x - 9 + side * 3, y + 23);
  g.quadraticCurveTo(x + side * 3, y + 27, x + 9 + side * 3, y + 23);
  g.stroke();
}

function drawSneaker(g: Ctx, a: V, col: string, ink: string, OL: number, side: -1 | 1) {
  // front view: white sneaker, coloured side stripe, rubber sole
  const [x, y] = a;
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.6;
  g.fillStyle = "#f5f5f2";
  g.beginPath();
  g.moveTo(x - 15, y - 4);
  g.quadraticCurveTo(x - 21, y + 5, x - 20 + side * 4, y + 10);
  g.quadraticCurveTo(x + side * 4, y + 19, x + 20 + side * 4, y + 10);
  g.quadraticCurveTo(x + 21, y + 5, x + 15, y - 4);
  g.closePath();
  g.fill();
  g.stroke();
  g.strokeStyle = col;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x - 13 * side, y);
  g.quadraticCurveTo(x - 8 * side, y + 6, x - 17 * side, y + 8);
  g.stroke();
  g.strokeStyle = "#c9c4b8";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(x - 18 + side * 4, y + 11);
  g.quadraticCurveTo(x + side * 4, y + 16, x + 18 + side * 4, y + 11);
  g.stroke();
}

const hairShade = (hair: string) => hexMul(hair, 0.78);

function drawBackHair(g: Ctx, hair: string, lk: AnimeLook, OL: number, tilt = 0) {
  if (lk.hair !== "long") {
    // bob: hangs to the jaw; short: just the back of the head
    const r: V[] = lk.hair === "bob"
      ? [[0, -86], [42, -82], [64, -60], [72, -16], [72, 40], [66, 74], [52, 66], [40, 78], [0, 80]]
      : [[0, -88], [44, -84], [62, -62], [64, -22], [58, 8], [0, 14]];
    const pts: V[] = [...r, ...[...r].reverse().slice(1, -1).map(([x, y]): V => [-x, y])];
    smoothClosed(g, pts);
    g.fillStyle = hairShade(hair);
    g.fill();
    g.strokeStyle = lk.hairLine;
    g.lineWidth = OL * 0.7;
    g.stroke();
    return;
  }
  g.save();
  g.translate(0, -60);
  g.rotate(-tilt * 0.8);
  g.translate(0, 60);
  // long straight hair to the hips with pointed strand ends
  const r: V[] = [
    [0, -84], [40, -80], [64, -58], [74, -12], [78, 60], [88, 140], [96, 220], [94, 290], [84, 334],
    [74, 300], [62, 340], [48, 302], [32, 330], [18, 296], [0, 306],
  ];
  const pts: V[] = [...r, ...[...r].reverse().slice(1, -1).map(([x, y]): V => [-x, y])];
  g.beginPath();
  pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
  g.closePath();
  const hg = g.createLinearGradient(0, -80, 0, 330);
  hg.addColorStop(0, hairShade(hair));
  hg.addColorStop(0.35, hair);
  hg.addColorStop(1, hexMul(hair, 0.7));
  g.fillStyle = hg;
  g.fill();
  g.strokeStyle = lk.hairLine;
  g.lineWidth = OL * 0.7;
  g.stroke();
  // strands
  g.strokeStyle = hexMul(hair, 0.66);
  g.lineWidth = 1.6;
  for (const s of [-1, 1]) {
    for (const [x0, x1, y1] of [[60, 80, 300], [44, 54, 290], [70, 92, 250]]) {
      g.beginPath();
      g.moveTo(s * x0, 20);
      g.bezierCurveTo(s * (x0 + 10), 120, s * (x1 - 6), 200, s * x1, y1);
      g.stroke();
    }
  }
  g.restore();
}

function drawFrontHair(g: Ctx, hair: string, lk: AnimeLook, OL: number) {
  const line = lk.hairLine;
  if (lk.hair === "bob") {
    // jaw-length side pieces framing the face
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 50, -24);
      g.bezierCurveTo(s * 60, 10, s * 62, 50, s * 58, 72);
      g.lineTo(s * 50, 60);
      g.lineTo(s * 45, 70);
      g.bezierCurveTo(s * 44, 40, s * 44, 10, s * 42, -10);
      g.closePath();
      g.fillStyle = hair;
      g.fill();
      g.strokeStyle = line;
      g.lineWidth = OL * 0.65;
      g.stroke();
    }
  }
  // crown + bangs (jagged for long/bob, short spiky fringe for short hair)
  const bangs: V[] = lk.hair === "short"
    ? [[54, -6], [50, -10], [42, -28], [34, -18], [24, -34], [14, -22], [4, -36], [-6, -22], [-16, -36], [-26, -22], [-36, -32], [-44, -14], [-52, -10], [-54, -6]]
    : [
      [54, -6], [46, 4], [40, -16], [32, -13], [24, -22], [15, -15], [7, -24], [0, 0], [-7, -24], [-15, -15],
      [-24, -22], [-32, -13], [-40, -16], [-46, 4], [-54, -6],
    ];
  g.beginPath();
  g.moveTo(-55, -6);
  g.bezierCurveTo(-62, -52, -34, -90, 0, -90);
  g.bezierCurveTo(36, -90, 62, -52, 54, -6);
  for (const p of bangs.slice(1)) g.lineTo(...p);
  g.closePath();
  const cg = g.createLinearGradient(0, -90, 0, 12);
  cg.addColorStop(0, hexMul(hair, 1.05));
  cg.addColorStop(0.6, hair);
  cg.addColorStop(1, hairShade(hair));
  g.fillStyle = cg;
  g.fill();
  g.strokeStyle = line;
  g.lineWidth = OL * 0.7;
  g.stroke();
  // strand separations from the crown into the bang points
  g.strokeStyle = hexMul(hair, 0.7);
  g.lineWidth = 1.4;
  for (const [x0, x1, y1] of [[-6, -7, -22], [6, 7, -22], [20, 24, -20], [-20, -24, -20], [34, 40, -15], [-34, -40, -15]]) {
    g.beginPath();
    g.moveTo(x0 * 0.4, -70);
    g.quadraticCurveTo(x0, -40, x1, y1);
    g.stroke();
  }
  // angel-ring highlight
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 3;
  for (const [a0, a1] of [[-2.6, -2.2], [-2.0, -1.55], [-1.35, -0.95], [-0.8, -0.5]]) {
    g.beginPath();
    g.ellipse(0, -44, 44, 30, 0, a0, a1);
    g.stroke();
  }
}

function drawTiffFace(g: Ctx, face: Face, o: DrawOpts, ink: string, lk: AnimeLook, skinCol: string) {
  const look = face.look ?? [0, 0];
  const lx = look[0] * 4;
  const ly = look[1] * 3;
  const blinkOn = (o.blink ?? 0) > 0.5;
  const extras = face.extras ?? [];
  const EX = 21;
  const EY = 8;

  // blush with hatch lines (always for the female looks, only on "blush" for male)
  for (const s of lk.build === "male" && !extras.includes("blush") ? [] : [-1, 1]) {
    g.fillStyle = extras.includes("blush") ? "rgba(255,120,140,0.55)" : "rgba(255,130,150,0.28)";
    g.beginPath();
    g.ellipse(s * 28, 27, 10, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(230,90,110,0.55)";
    g.lineWidth = 1.2;
    for (const d of [-5, 0, 5]) {
      g.beginPath();
      g.moveTo(s * 28 + d + 2, 24);
      g.lineTo(s * 28 + d - 1, 30);
      g.stroke();
    }
  }

  type Lid = { drop: number; aIn: number; aOut: number; big: number };
  const eyeOpen = (s: number, lid: Lid) => {
    const x0 = s * EX;
    const inner: V = [s * 7, EY - 2];
    const outer: V = [s * 36, EY - 5];
    const top = EY - 16 * lid.big;
    const bot = EY + 13 * lid.big;
    const eyeShape = () => {
      g.beginPath();
      g.moveTo(...inner);
      g.quadraticCurveTo(x0, top - 4, ...outer);
      g.quadraticCurveTo(s * 32, bot, x0, bot);
      g.quadraticCurveTo(s * 9, bot - 2, ...inner);
      g.closePath();
    };
    eyeShape();
    g.fillStyle = "#ffffff";
    g.fill();
    g.save();
    eyeShape();
    g.clip();
    // big tall iris with a dark-to-light gradient, pupil, shadow band, two catchlights
    const ix = x0 + lx + s * 1;
    const iy = EY + ly + 2;
    const ir = g.createLinearGradient(0, iy - 12, 0, iy + 12);
    ir.addColorStop(0, lk.iris[0]);
    ir.addColorStop(1, lk.iris[1]);
    g.fillStyle = ir;
    g.beginPath();
    g.ellipse(ix, iy, 10, 13 * lid.big, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = hexMul(lk.iris[0], 0.6);
    g.lineWidth = 1.2;
    g.stroke();
    g.fillStyle = "#14203f";
    g.beginPath();
    g.ellipse(ix, iy - 1, 4.2, 6.5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(10,20,50,0.35)";
    g.fillRect(ix - 12, top - 6, 24, 9);
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.ellipse(ix - s * 3.5, iy - 5, 3.4, 4.4, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(ix + s * 3.5, iy + 6, 1.6, 0, Math.PI * 2);
    g.fill();
    // lid (lidded / angry / sad)
    const pIn: V = [inner[0], inner[1] + lid.aIn];
    const pOut: V = [outer[0], outer[1] + lid.aOut];
    const cY = top - 4 + lid.drop;
    if (lid.drop > 0 || lid.aIn > 0 || lid.aOut > 0) {
      g.fillStyle = hexMul(skinCol, 0.92);
      g.beginPath();
      g.moveTo(...pIn);
      g.quadraticCurveTo(x0, cY, ...pOut);
      g.lineTo(pOut[0], top - 20);
      g.lineTo(pIn[0], top - 20);
      g.closePath();
      g.fill();
    }
    g.restore();
    // thick upper lash line with an outer flick + lashes
    g.strokeStyle = "#1a1220";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(...pIn);
    g.quadraticCurveTo(x0, cY, ...pOut);
    if (lk.lashes) g.lineTo(pOut[0] + s * 4, pOut[1] + 5);
    g.stroke();
    g.lineWidth = 2;
    for (const [dx, dy] of lk.lashes ? [[5, -4], [7, 0]] : []) {
      g.beginPath();
      g.moveTo(pOut[0] - s * 2, pOut[1]);
      g.lineTo(pOut[0] + s * dx, pOut[1] + dy);
      g.stroke();
    }
    // lower lash
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(s * 33, EY + 2);
    g.quadraticCurveTo(s * 30, bot - 1, x0 + s * 2, bot);
    g.stroke();
  };
  const eyeArc = (s: number, up: boolean) => {
    const x0 = s * EX;
    g.strokeStyle = "#1a1220";
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(s * 8, EY + 2);
    g.quadraticCurveTo(x0, EY + (up ? -10 : 9), s * 35, EY);
    g.lineTo(s * 39, EY + (up ? 4 : -2));
    g.stroke();
  };
  const star = (x: number, y: number, r: number, fill: string) => {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      const p: V = [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
      i ? g.lineTo(...p) : g.moveTo(...p);
    }
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 1.2;
    g.stroke();
  };
  const heart = (x: number, y: number, r: number) => {
    g.beginPath();
    g.moveTo(x, y + r * 0.9);
    g.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.4);
    g.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.4, y - r * 0.1, x, y + r * 0.9);
    g.fillStyle = "#ff4f86";
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 1.2;
    g.stroke();
  };
  const N: Lid = lk.build === "male" ? { drop: 4, aIn: 3, aOut: 0, big: 0.68 } : { drop: 0, aIn: 0, aOut: 0, big: 1 };
  const kind = blinkOn && !["x", "spiral", "hearts", "stars", "happy", "closed"].includes(face.eyes) ? "closed" : face.eyes;
  for (const s of [-1, 1]) {
    switch (kind) {
      case "wide":
        eyeOpen(s, { ...N, big: 1.12 });
        break;
      case "lidded":
        eyeOpen(s, { ...N, drop: 11 });
        break;
      case "angry":
        eyeOpen(s, { ...N, drop: 5, aIn: 7 });
        break;
      case "sad":
        eyeOpen(s, { ...N, drop: 4, aOut: 6 });
        break;
      case "tiny":
        eyeOpen(s, { ...N, big: 0.8 });
        break;
      case "happy":
        eyeArc(s, true);
        break;
      case "closed":
        eyeArc(s, false);
        break;
      case "hearts":
        heart(s * EX, EY, 11);
        break;
      case "stars":
        star(s * EX, EY, 12, "#ffd23f");
        break;
      case "x":
        g.strokeStyle = ink;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(s * EX - 8, EY - 8);
        g.lineTo(s * EX + 8, EY + 8);
        g.moveTo(s * EX + 8, EY - 8);
        g.lineTo(s * EX - 8, EY + 8);
        g.stroke();
        break;
      case "spiral": {
        g.strokeStyle = ink;
        g.lineWidth = 2;
        g.beginPath();
        for (let i = 0; i < 44; i++) {
          const a = i * 0.45;
          const r = 1 + i * 0.24;
          const p: V = [s * EX + Math.cos(a) * r, EY + Math.sin(a) * r];
          i ? g.lineTo(...p) : g.moveTo(...p);
        }
        g.stroke();
        break;
      }
      default:
        eyeOpen(s, N);
    }
  }

  // thin high brows (bangs overlap them)
  if (face.brows !== "none") {
    g.strokeStyle = hexMul(lk.hairLine, 0.9);
    g.lineWidth = lk.build === "male" ? 5 : 2;
    for (const s of [-1, 1]) {
      let dIn = lk.build === "male" ? 5 : 0;
      let dOut = 0;
      if (face.brows === "raised") dIn = dOut = -4;
      if (face.brows === "angry") (dIn = 5), (dOut = -2);
      if (face.brows === "sad" || face.brows === "worried") (dIn = -5), (dOut = 2);
      if (face.brows === "oneUp" && s > 0) dIn = dOut = -6;
      g.beginPath();
      g.moveTo(s * 9, -14 + dIn);
      g.quadraticCurveTo(s * 22, -20 + (dIn + dOut) / 2, s * 34, -15 + dOut);
      g.stroke();
    }
  }

  // tiny nose
  g.strokeStyle = hexMul(skinCol, 0.72);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(1, 25);
  g.lineTo(-1, 29);
  g.stroke();

  // small mouth
  const talk = o.talk ?? 0;
  const MY = 42;
  const closedKinds = ["flat", "smile", "smirk", "frown", "wavy", "none"];
  const lineMouth = (cl: number, cr: number, bend: number) => {
    g.strokeStyle = "#7a3040";
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(-6, MY + cl);
    g.quadraticCurveTo(0, MY + bend, 6, MY + cr);
    g.stroke();
  };
  const openMouth = (w: number, hh: number, up: number, teeth: boolean, tongue: boolean) => {
    const shape = () => {
      g.beginPath();
      g.moveTo(-w, MY - up);
      g.quadraticCurveTo(0, MY - up + 1.5, w, MY - up);
      g.quadraticCurveTo(w * 0.8, MY + hh, 0, MY + hh);
      g.quadraticCurveTo(-w * 0.8, MY + hh, -w, MY - up);
      g.closePath();
    };
    shape();
    g.fillStyle = "#a8344a";
    g.fill();
    g.save();
    shape();
    g.clip();
    if (teeth) {
      g.fillStyle = "#ffffff";
      g.fillRect(-w, MY - up - 1, w * 2, Math.min(3.5, hh * 0.35) + 1);
    }
    if (tongue) {
      g.fillStyle = "#f08a9a";
      g.beginPath();
      g.ellipse(0, MY + hh - 1, w * 0.6, hh * 0.45, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    shape();
    g.strokeStyle = "#5a1a28";
    g.lineWidth = 1.4;
    g.stroke();
  };
  if (talk > 0.05 && closedKinds.includes(face.mouth)) {
    openMouth(5.5, 2 + talk * 6, 0, false, talk > 0.5);
  } else {
    switch (face.mouth) {
      case "smile":
        lineMouth(-1.5, -1.5, 2.5);
        break;
      case "smirk":
        lineMouth(0.5, -2.5, 1);
        break;
      case "frown":
        lineMouth(1.5, 1.5, -1.5);
        break;
      case "wavy":
        g.strokeStyle = "#7a3040";
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(-6, MY);
        g.quadraticCurveTo(-3, MY - 2, 0, MY);
        g.quadraticCurveTo(3, MY + 2, 6, MY);
        g.stroke();
        break;
      case "flat":
      case "none":
        lineMouth(0, 0, 0.6);
        break;
      case "o":
        openMouth(3.5, 5, 0, false, false);
        break;
      case "open":
        openMouth(6, 6, 1, false, true);
        break;
      case "grin":
      case "teeth":
        openMouth(8, 5, 2, true, false);
        break;
      case "evil":
        openMouth(8, 4, 3, true, false);
        break;
      case "laugh":
        openMouth(8, 9, 2, true, true);
        break;
      case "scream":
        openMouth(7, 12, -1, true, true);
        break;
      case "tongue":
        openMouth(6, 5, 1, false, true);
        break;
      default:
        lineMouth(0, 0, 0.6);
    }
  }

  // extras
  g.lineWidth = 2;
  g.strokeStyle = ink;
  for (const e of extras) {
    if (e === "sweat") {
      g.fillStyle = "#8fd3ff";
      g.beginPath();
      g.moveTo(56, -40);
      g.quadraticCurveTo(64, -26, 56, -20);
      g.quadraticCurveTo(48, -26, 56, -40);
      g.fill();
      g.stroke();
    } else if (e === "tears") {
      g.fillStyle = "rgba(120,200,255,0.85)";
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * 30, 18);
        g.quadraticCurveTo(s * 36, 34, s * 32, 44);
        g.quadraticCurveTo(s * 26, 34, s * 30, 18);
        g.fill();
      }
    } else if (e === "sparkle") {
      star(-72, -56, 8, "#fff3a0");
      star(74, -30, 6, "#fff3a0");
      star(68, 40, 5, "#fff3a0");
    } else if (e === "anger") {
      g.strokeStyle = "#e02b2b";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(44, -76);
      g.quadraticCurveTo(52, -68, 60, -76);
      g.moveTo(44, -60);
      g.quadraticCurveTo(52, -68, 60, -60);
      g.stroke();
    } else if (e === "shock") {
      g.lineWidth = 3;
      for (const a of [-0.5, 0, 0.5]) {
        g.beginPath();
        g.moveTo(Math.sin(a) * 98, -Math.cos(a) * 98);
        g.lineTo(Math.sin(a) * 116, -Math.cos(a) * 116);
        g.stroke();
      }
    } else if (e === "question" || e === "zzz") {
      g.fillStyle = ink;
      g.font = `900 34px "Montserrat", "Arial Black", sans-serif`;
      g.textAlign = "center";
      g.fillText(e === "question" ? "?" : "z z", 76, -72);
    }
  }
}
