// Shot framing for card characters: one call gives a camera pose that puts the FACE in the upper third of the 9:16
// frame (always above the caption band, y 1100-1350 px) for a named shot size. Use it for every Tiff shot: her
// figure is long and anime-proportioned (eyes at ~1.60 m, small head), so a camera aimed the way a stick adult is
// aimed (~1.2 m) frames her torso, which reads as body-focused framing (bad for the brand and for recommendation
// eligibility). Stick adults (eyes ~1.43 m) and kids (~1.0 m) scale from the same table.
//
//   cam={[{ f: 0, ...frameOn([0, 0, -1], "mcu") }, { f: s.hit("sold"), ...frameOn([0, 0, -1], "cu", { side: 0.3 }), ease: "burst", dur: 10 }]}
import type { Vec3 } from "../../core/types";

export type ShotSize = "wide" | "full" | "medium" | "mcu" | "cu";

/** Eye heights (m) of the card characters (2.2 m adult card). */
export const EYE = { tiff: 1.6, adult: 1.43, kid: 1.0 } as const;

// for an eye height of 1.60 m (measured on TiffStage stills): frame centre (m), vertical half-extent (m), default fov (deg)
const TABLE: Record<ShotSize, [number, number, number]> = {
  wide: [1.1, 1.7, 42], //     whole body + set
  full: [1.005, 1.12, 40], //  whole body, feet in frame (eyes ~ y 450 px, feet ~ y 1820 px)
  medium: [1.377, 0.58, 38], // waist up (eyes ~ y 590 px)
  mcu: [1.45, 0.36, 36], //    face + shoulders (eyes ~ y 560 px, chin ~ y 850 px)
  cu: [1.502, 0.293, 34], //   face (eyes ~ y 640 px, chin ~ y 1000 px; the hair top may crop)
};

// stick cast (eyes 1.43 m, a head ~1/3 of the figure, chin at ~1.14 m): the head needs more room, so their close-up
// keeps the whole head with the chin above the caption band
const STICK: Record<ShotSize, [number, number, number]> = {
  wide: [1.1, 1.7, 42],
  full: [0.95, 1.05, 40],
  medium: [1.12, 0.72, 38], // head + torso (eyes ~ y 625 px)
  mcu: [1.2, 0.56, 36], //    head + chest (eyes ~ y 575 px, chin ~ y 1070 px)
  cu: [1.22, 0.52, 34], //    the head fills the frame (chin ~ y 1110 px: keep captions short)
};

export type FrameOpts = {
  /** whose proportions: Tiff (default), a stick adult, or a stick kid */
  who?: "tiff" | "stick" | "kid";
  /** eye height of the subject (m); default from `who` */
  eye?: number;
  /** vertical fov (deg); distance adapts so the framing holds */
  fov?: number;
  /** camera direction from the subject in the floor plane, e.g. [0.3, 1] = slightly from screen right; default [0, 1] (+z) */
  dir?: [number, number];
  /** camera height above the look point (m): + = looking slightly down (flattering), default 0.06 */
  high?: number;
  /** place the subject off-centre: -1..1 of the half-width (+ = subject sits right of centre) */
  side?: number;
  /** move the look point up (+) or down (-) in metres, e.g. to include a held phone */
  lift?: number;
};

/** Camera pose ({ pos, look, fov }) framing a character whose FEET are at `at`. */
function table(o: FrameOpts): [Record<ShotSize, [number, number, number]>, number, number] {
  if (o.who === "stick") return [STICK, o.eye ?? EYE.adult, EYE.adult];
  if (o.who === "kid") return [STICK, o.eye ?? EYE.kid, EYE.adult];
  return [TABLE, o.eye ?? EYE.tiff, EYE.tiff];
}

export function frameOn(at: Vec3, size: ShotSize, o: FrameOpts = {}): { pos: Vec3; look: Vec3; fov: number } {
  const [T, eye, base] = table(o);
  const k = eye / base;
  const [c0, h0, fov0] = T[size];
  const fov = o.fov ?? fov0;
  const half = h0 * k;
  const centre = c0 * k + (o.lift ?? 0);
  const dist = half / Math.tan(((fov / 2) * Math.PI) / 180);
  const [dx, dz] = o.dir ?? [0, 1];
  const n = Math.hypot(dx, dz) || 1;
  const ux = dx / n;
  const uz = dz / n;
  // sideways shift: the look point moves opposite to where the subject should sit
  const halfW = half * (9 / 16);
  const sx = -(o.side ?? 0) * halfW * 0.9;
  const lookX = at[0] + sx * uz;
  const lookZ = at[2] - sx * ux;
  const look: Vec3 = [lookX, at[1] + centre, lookZ];
  const pos: Vec3 = [lookX + ux * dist, at[1] + centre + (o.high ?? 0.06), lookZ + uz * dist];
  return { pos, look, fov };
}

/** Where the subject's eyes land on screen (px from the top of a 1920 frame) for a framing; used by checks. */
export function eyeY(size: ShotSize, o: FrameOpts = {}): number {
  const [T, eye, base] = table(o);
  const k = eye / base;
  const [c0, h0] = T[size];
  const centre = c0 * k + (o.lift ?? 0);
  return 960 - ((eye - centre) / (h0 * k)) * 960;
}
