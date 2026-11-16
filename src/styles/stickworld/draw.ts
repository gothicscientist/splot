// StickWorld characters: flat 2D cartoon people drawn with Canvas2D (crisp at any size), shown as lit cards in the
// 3D toon world. Look (measured from the reference shorts): big white round heads (~1/3 of the height), tiny dot
// eyes, optional round glasses, bean-shaped coloured torsos with a thick ink outline, single-stroke stick limbs with
// ink-dot hands, small oval shoes. Ink is a warm near-black; no blush or catchlights unless the face asks for it.
//
// Design space: 600 x 1000 units, soles at y = 975, head centre x = 300. drawStick() scales it to any canvas size.

/** "hime" = long straight hair with blunt bangs and face-framing side locks (falls behind the shoulders);
 *  "wolf" = shaggy layered cut with choppy bangs */
/** "anime" = long glossy hair: pointed swept bangs, long side locks over the shoulders, an ahoge, waist-length back
 *  hair with pointed ends; "twintails" = the same bangs + two high tails */
export type HairStyle = "none" | "short" | "side" | "spiky" | "curly" | "bun" | "long" | "mohawk" | "bob" | "ponytail" | "slick" | "bald" | "hime" | "wolf" | "anime" | "twintails";
/** "fur" = fluffy faux-fur trapper hat with ear flaps */
export type HatStyle = "none" | "cap" | "beanie" | "hood" | "tophat" | "helmet" | "crown" | "chef" | "cowboy" | "hardhat" | "police" | "grad" | "headband" | "fur";
/** "crop" = cropped top with a skin band at the midriff; "fur" = faux-fur coat (fluffy trim); "leather" = leather
 *  jacket (shine + zip); "tank" = strappy tank top; "zip" = zip-up hoodie */
export type OutfitKind = "tee" | "hoodie" | "suit" | "dress" | "lab" | "uniform" | "jacket" | "robe" | "armor" | "crop" | "fur" | "leather" | "tank" | "zip";
/** "femme" = slimmer frame, slightly smaller head, longer legs, hourglass torso */
export type Build = "adult" | "kid" | "tall" | "stout" | "femme";

export type StickSpec = {
  /** "tiff" draws the shaped lead figure (tiff.ts) instead of a stick figure */
  figure?: "stick" | "tiff";
  /** torso colour (the bean) */
  body: string;
  head?: string;
  outfit?: OutfitKind;
  accent?: string; // tie / trim / lapels
  text?: string; // printed on the chest ("FBI")
  textColor?: string;
  hair?: HairStyle;
  hairColor?: string;
  hat?: HatStyle;
  hatColor?: string;
  hatText?: string;
  glasses?: "none" | "round" | "square" | "shades";
  mustache?: string | null;
  beard?: string | null;
  nose?: "none" | "dot" | "big" | "red";
  mask?: boolean; // the hooded-villain look: dark hood framing a white face
  build?: Build;
  legColor?: string;
  shoes?: string;
  seed?: number;
  /** pinned name badge on the left chest ("DEPUTY DIRECTOR"); `scale` 0..1+ pops it in */
  badge?: { text: string; bg?: string; fg?: string; border?: string; scale?: number };
  // ---- feminine features and fashion (all optional; see the fashion presets and SCENE_CAST in cast.ts)
  /** lash flicks + a small wing at the outer corner of every eye shape */
  lashes?: boolean;
  /** lip colour: line mouths are drawn in it over a thin ink edge */
  lips?: string;
  /** soft permanent blush (makeup) */
  blush?: boolean;
  earrings?: "hoops" | "studs" | "drops" | null;
  earringColor?: string;
  /** worn just below the head: "pearls" (a beaded strand), "chain" (with a small star), "choker" (a dark band) */
  necklace?: "pearls" | "chain" | "choker" | null;
  piercings?: ("nose" | "lip" | "brow")[];
  /** small original chest print (no logos) */
  print?: "heart" | "star" | "skull" | "flames" | "angel" | null;
  printColor?: string;
  /** sleeve colour drawn over the stick arms ("long" to the wrist, default; "short" to the elbow) */
  sleeves?: string;
  sleeveLen?: "short" | "long";
  armWarmers?: string;
  /** garment over the stick legs */
  pants?: { kind: "baggy" | "flare" | "straight" | "skirt" | "shorts"; color: string; accent?: string };
  boots?: "platform" | "tall" | "pointy" | "chunky" | null;
  legWarmers?: string;
  /** crossbody bag colour: strap over the torso, small bag at the hip */
  crossbody?: string;
  /** skin-coloured outlined arms / legs instead of ink sticks (dark tops swallow ink arms) */
  bareArms?: boolean;
  bareLegs?: boolean;
  /** big glossy anime eyes (iris gradient, two catchlights, a winged lash line) for the open eye shapes */
  animeEyes?: boolean;
  iris?: string;
  /** eye size multiplier (default 1) and white catchlights on dot-type eyes */
  eyeScale?: number;
  catchlights?: boolean;
  /** torso shape; "hourglass" pinches the waist (the default for build "femme") */
  shape?: "bean" | "hourglass";
};

/** "dollar" = green $ eyes (greed), "wink" = one eye lidded, the other closed */
export type Eyes = "dot" | "wide" | "happy" | "closed" | "angry" | "sad" | "lidded" | "x" | "spiral" | "hearts" | "stars" | "side" | "tiny" | "dollar" | "wink";
export type Mouth = "smile" | "grin" | "teeth" | "open" | "o" | "flat" | "frown" | "wavy" | "smirk" | "laugh" | "scream" | "tongue" | "evil" | "none";
export type Brows = "none" | "neutral" | "raised" | "angry" | "sad" | "worried" | "oneUp";
export type Extra = "sweat" | "blush" | "tears" | "anger" | "sparkle" | "shock" | "question" | "zzz";
export type Face = { eyes: Eyes; mouth: Mouth; brows: Brows; extras?: Extra[]; look?: [number, number] };

export const FACES: Record<string, Face> = {
  neutral: { eyes: "dot", mouth: "flat", brows: "neutral" },
  happy: { eyes: "dot", mouth: "smile", brows: "raised" },
  grin: { eyes: "happy", mouth: "teeth", brows: "raised" },
  joy: { eyes: "happy", mouth: "laugh", brows: "raised", extras: ["blush"] },
  smug: { eyes: "lidded", mouth: "smirk", brows: "oneUp" },
  shocked: { eyes: "wide", mouth: "o", brows: "raised", extras: ["shock"] },
  scared: { eyes: "wide", mouth: "wavy", brows: "worried", extras: ["sweat"] },
  panic: { eyes: "wide", mouth: "scream", brows: "worried", extras: ["sweat", "shock"] },
  sad: { eyes: "sad", mouth: "frown", brows: "sad" },
  crying: { eyes: "closed", mouth: "frown", brows: "sad", extras: ["tears"] },
  angry: { eyes: "angry", mouth: "teeth", brows: "angry", extras: ["anger"] },
  furious: { eyes: "angry", mouth: "scream", brows: "angry", extras: ["anger"] },
  worried: { eyes: "dot", mouth: "wavy", brows: "worried", extras: ["sweat"] },
  thinking: { eyes: "side", mouth: "flat", brows: "oneUp", look: [0.6, -0.4] },
  confused: { eyes: "dot", mouth: "wavy", brows: "oneUp", extras: ["question"] },
  sleepy: { eyes: "closed", mouth: "flat", brows: "none", extras: ["zzz"] },
  determined: { eyes: "lidded", mouth: "flat", brows: "angry" },
  evil: { eyes: "lidded", mouth: "evil", brows: "angry" },
  love: { eyes: "hearts", mouth: "smile", brows: "raised", extras: ["blush"] },
  starstruck: { eyes: "stars", mouth: "open", brows: "raised", extras: ["sparkle"] },
  dead: { eyes: "x", mouth: "tongue", brows: "none" },
  dizzy: { eyes: "spiral", mouth: "wavy", brows: "none" },
  unimpressed: { eyes: "lidded", mouth: "flat", brows: "neutral" },
  nervousSmile: { eyes: "dot", mouth: "teeth", brows: "worried", extras: ["sweat"] },
};

/** Joint angles in degrees (0 = limb hanging straight down; + = forward/up for arms, + = forward for legs). */
export type Pose = {
  lean?: number; // whole body tilt (deg, + = leaning right on screen)
  head?: number; // head tilt (deg)
  armL: [number, number]; // [shoulder, elbow]
  armR: [number, number];
  legL: [number, number]; // [hip, knee]
  legR: [number, number];
  bob?: number; // vertical offset in units (+ = up)
  squash?: number; // 1 = normal, <1 squashed, >1 stretched
  crouch?: number; // 0..1 lowers the body by bending knees
  /** front-view leg lift 0..1 (foreshortens the leg so the foot rises); used by the shaped Tiff figure */
  liftL?: number;
  liftR?: number;
  /** arms drawn OVER the head (hands on the cheeks, a hand cupped at the mouth); default: behind the head */
  front?: "L" | "R" | "both";
  /** right-hand gesture drawn at the hand dot */
  handR?: "peace" | "point";
};

const P = (armL: [number, number], armR: [number, number], legL: [number, number] = [0, 0], legR: [number, number] = [0, 0], extra: Partial<Pose> = {}): Pose => ({
  armL,
  armR,
  legL,
  legR,
  ...extra,
});

/** Arm convention (both arms): 0 = hanging down, +90 = straight OUT to that side, 180 = straight up,
 *  negative = swinging in across the body. Elbow angle is added to the upper-arm direction. */
export const POSES: Record<string, Pose> = {
  idle: P([10, 5], [10, 5]),
  relaxed: P([16, 14], [14, 12], [3, 0], [-3, 0]),
  handsHips: P([42, -100], [42, -100]),
  wave: P([10, 5], [150, 28], [0, 0], [0, 0], { head: 4 }),
  waveB: P([10, 5], [150, -18], [0, 0], [0, 0], { head: 4 }),
  point: P([10, 5], [90, 2], [0, 0], [0, 0], { lean: 2 }),
  pointUp: P([10, 5], [165, 4], [0, 0], [0, 0], { head: -4 }),
  pointDown: P([10, 5], [42, 0]),
  pointAcross: P([10, 5], [-70, -10], [0, 0], [0, 0], { head: -6 }),
  present: P([10, 5], [72, 32], [0, 0], [0, 0], { head: 6 }),
  shrug: P([55, 112], [55, 112], [0, 0], [0, 0], { head: 8, bob: 6 }),
  armsUp: P([160, 14], [160, 14], [0, 0], [0, 0], { bob: 10, head: -4 }),
  cheer: P([170, 10], [122, 48], [-6, 10], [8, -4], { bob: 16 }),
  facepalm: P([10, 5], [35, -178], [0, 0], [0, 0], { head: 14, lean: 3 }),
  think: P([35, -100], [30, -165], [0, 0], [0, 0], { head: 9 }),
  headScratch: P([10, 5], [128, 82], [0, 0], [0, 0], { head: 10 }),
  typing: P([58, -72], [58, -72], [0, 0], [0, 0], { head: 6 }),
  holdFront: P([55, -78], [55, -78]),
  holdOne: P([10, 5], [52, -62]),
  carry: P([70, -88], [70, -88], [0, 0], [0, 0], { lean: -2 }),
  scared: P([78, -142], [78, -142], [-6, 8], [6, -8], { head: -6, crouch: 0.15 }),
  crossArms: P([34, -122], [34, -122]),
  salute: P([10, 5], [96, 114], [0, 0], [0, 0], { head: -3 }),
  sneak: P([40, -60], [30, -50], [18, 40], [-10, 30], { lean: 10, crouch: 0.35 }),
  sit: P([42, -40], [42, -40], [90, -90], [90, -90], { crouch: 0.45 }),
  fall: P([150, 40], [140, 30], [40, 20], [-30, 30], { lean: -30 }),
  dance1: P([150, -40], [40, -100], [20, 30], [-10, 0], { lean: 8, bob: 8 }),
  dance2: P([40, -100], [150, -40], [-10, 0], [20, 30], { lean: -8, bob: 8 }),
  bow: P([20, 10], [20, 10], [0, 0], [0, 0], { head: 30 }),
  victory: P([10, 5], [165, 0], [0, 0], [0, 0], { bob: 6 }),
  presentBoth: P([68, 30], [68, 30], [0, 0], [0, 0], { head: 4 }),
  phone: P([10, 5], [32, -150], [0, 0], [0, 0], { head: 8 }),
  readPhone: P([10, 5], [44, -96], [0, 0], [0, 0], { head: 16 }),
  // weight on one leg, hand on the hip, head tilted: the fit-check stance
  handOnHip: P([12, 8], [42, -100], [6, 0], [-10, 8], { lean: -3, head: 7 }),
  bothHips: P([42, -100], [42, -100], [6, 0], [-10, 8], { lean: -2, head: -5 }),
  // hand up by the ear tucking the hair, other arm relaxed
  hairTuck: P([12, 8], [128, 118], [5, 0], [-6, 6], { head: 10, lean: -2, front: "R" }),
  // V sign by the cheek
  peace: P([12, 8], [150, 26], [4, 0], [-6, 4], { head: -8, handR: "peace", front: "R" }),
  // phone held up and out for a mirror-style selfie
  selfie: P([12, 8], [150, -20], [5, 0], [-8, 6], { head: 9, lean: -2 }),
  // standing with one leg crossed in front of the other
  crossLegs: P([14, 10], [14, 10], [-12, 0], [14, 0], { head: 5 }),
  // shy: hands together in front, head tilted
  shy: P([30, -60], [30, -60], [-6, 0], [8, 0], { head: 12 }),
  // arms folded, weight shifted: unimpressed
  crossArmsHip: P([34, -122], [34, -122], [6, 0], [-10, 8], { lean: -3, head: -6 }),
};

/** Walk cycle (phase in cycles): planted 0.8 m stride, bob 3-7 %, arms counter-swing. */
/** `sway` adds a hip sway (body lean swinging with the steps), e.g. 1 for a strut. */
export function walkPose(phase: number, speed = 1, base: Pose = POSES.idle, sway = 0): Pose {
  const a = Math.sin(phase * Math.PI * 2);
  const b = Math.sin(phase * Math.PI * 2 + Math.PI);
  const sw = 26 * speed;
  const knee = (x: number) => Math.max(0, x) * 32 * speed;
  return {
    ...base,
    legL: [a * sw, -knee(-a)],
    legR: [b * sw, -knee(-b)],
    armL: [8 + a * 14 * speed, 10],
    armR: [8 + b * 14 * speed, 10],
    bob: Math.abs(Math.cos(phase * Math.PI * 2)) * 10 * speed,
    lean: 3 * speed + sway * 4 * Math.sin(phase * Math.PI * 2),
    head: (base.head ?? 0) - sway * 3 * Math.sin(phase * Math.PI * 2),
  };
}
export function runPose(phase: number): Pose {
  const a = Math.sin(phase * Math.PI * 2);
  const b = -a;
  return {
    armL: [30 + a * 30, -70],
    armR: [30 + b * 30, -70],
    legL: [a * 48, -Math.max(0, -a) * 70 - 15],
    legR: [b * 48, -Math.max(0, -b) * 70 - 15],
    bob: Math.abs(Math.cos(phase * Math.PI * 2)) * 22,
    lean: 10,
    head: -4,
  };
}

export function mixPose(a: Pose, b: Pose, t: number): Pose {
  const L = (x = 0, y = 0) => x + (y - x) * t;
  const L2 = (x: [number, number], y: [number, number]): [number, number] => [L(x[0], y[0]), L(x[1], y[1])];
  return {
    lean: L(a.lean, b.lean),
    head: L(a.head, b.head),
    armL: L2(a.armL, b.armL),
    armR: L2(a.armR, b.armR),
    legL: L2(a.legL, b.legL),
    legR: L2(a.legR, b.legR),
    bob: L(a.bob, b.bob),
    squash: L(a.squash ?? 1, b.squash ?? 1),
    crouch: L(a.crouch, b.crouch),
    front: t < 0.5 ? a.front : b.front,
    handR: t < 0.5 ? a.handR : b.handR,
  };
}

// ------------------------------------------------------------------------------------------------ drawing
export const INK = "#1d1418";
const rad = (d: number) => (d * Math.PI) / 180;

function hexMul(c: string, k: number) {
  const n = parseInt(c.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

type Ctx = CanvasRenderingContext2D;
type V = [number, number];

const DIMS: Record<Build, { headR: number; bodyW: number; bodyH: number; legL: number; armL: number }> = {
  adult: { headR: 134, bodyW: 218, bodyH: 272, legL: 236, armL: 200 },
  tall: { headR: 126, bodyW: 200, bodyH: 300, legL: 272, armL: 220 },
  stout: { headR: 136, bodyW: 256, bodyH: 262, legL: 214, armL: 196 },
  kid: { headR: 138, bodyW: 182, bodyH: 196, legL: 160, armL: 156 },
  // adult woman: head ~1/5.5 of the height (the default cast is ~1/3), long legs, hourglass torso
  femme: { headR: 112, bodyW: 178, bodyH: 270, legL: 302, armL: 216 },
};

/** "stamp" = rubber stamp held from above, "handset" = 1920s telephone handset held at the ear (use a hand-at-ear
 *  pose), "letter" = a sheet of letterhead with a red seal */
export type ItemKind = "cup" | "phone" | "magnifier" | "bag" | "sign" | "briefcase" | "laptop" | "pen" | "flag" | "trophy" | "money" | "coin" | "book" | "sword" | "torch" | "wrench" | "mic" | "pointer" | "stamp" | "handset" | "letter";
/** `front`: draw the item over the head (a handset at the ear reads only when it is not hidden by the head) */
export type Item = { kind: ItemKind; hand?: "L" | "R"; text?: string; color?: string; front?: boolean };
export type DrawOpts = { talk?: number; blink?: number; flip?: boolean; time?: number; ink?: string; item?: Item | null };

/** Draw a character into ctx scaled so the 600x1000 design fills (w, h). */
export function drawStick(g: Ctx, w: number, h: number, spec: StickSpec, pose: Pose, face: Face, o: DrawOpts = {}) {
  const ink = o.ink ?? INK;
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
  const D = DIMS[spec.build ?? "adult"];
  const OL = D.headR * 0.075; // outline width
  const LIMB = D.headR * 0.07;
  const crouch = (pose.crouch ?? 0) * D.legL * 0.45;
  const bob = (pose.bob ?? 0) - crouch;
  const squash = pose.squash ?? 1;
  const hipY = 975 - D.legL - bob + crouch * 0.2;
  const bodyTop = hipY - D.bodyH * squash;
  const cx = 300;
  const lean = rad(pose.lean ?? 0);
  // rotate the upper body around the hips
  const rot = (p: V): V => {
    const dx = p[0] - cx;
    const dy = p[1] - hipY;
    return [cx + dx * Math.cos(lean) - dy * Math.sin(lean), hipY + dx * Math.sin(lean) + dy * Math.cos(lean)];
  };

  // ---- contact shadow is drawn in 3D (blob); here only the figure
  // ---- legs
  const legX = D.bodyW * 0.22;
  // point on the leg's quadratic (hip -> knee control -> foot) at t
  const qp = (a: V, c: V, b: V, t: number): V => [
    (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
  ];
  // a garment segment from a to b, wa / wb wide at each end, filled and inked
  const segPoly = (a: V, b: V, wa: number, wb: number, fill: string) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L;
    const ny = dx / L;
    g.fillStyle = fill;
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.7;
    g.beginPath();
    g.moveTo(a[0] + (nx * wa) / 2, a[1] + (ny * wa) / 2);
    g.lineTo(b[0] + (nx * wb) / 2, b[1] + (ny * wb) / 2);
    g.lineTo(b[0] - (nx * wb) / 2, b[1] - (ny * wb) / 2);
    g.lineTo(a[0] - (nx * wa) / 2, a[1] - (ny * wa) / 2);
    g.closePath();
    g.fill();
    g.stroke();
  };
  const drawShoe = (foot: V, shin: [V, V]) => {
    const col = spec.shoes ?? ink;
    g.fillStyle = col;
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.7;
    const kind = spec.boots ?? null;
    if (kind === "tall") segPoly(shin[0], shin[1], 36, 40, col);
    g.beginPath();
    if (kind === "platform" || kind === "tall" || kind === "chunky") {
      // chunky boot with a thick platform sole
      g.roundRect(foot[0] - 22, foot[1] - 30, 70, 36, 14);
      g.fill();
      g.stroke();
      g.fillStyle = hexMul(col === ink ? "#3a3a44" : col, 0.55);
      g.beginPath();
      g.roundRect(foot[0] - 24, foot[1] - 2, 74, kind === "chunky" ? 12 : 18, 6);
      g.fill();
      g.stroke();
    } else if (kind === "pointy") {
      g.moveTo(foot[0] - 16, foot[1] - 18);
      g.quadraticCurveTo(foot[0] + 20, foot[1] - 22, foot[0] + 56, foot[1] + 2);
      g.quadraticCurveTo(foot[0] + 14, foot[1] + 8, foot[0] - 16, foot[1] + 4);
      g.closePath();
      g.fill();
      g.stroke();
    } else {
      // shoe: small oval pointing forward (+x)
      g.ellipse(foot[0] + 14, foot[1] - 4, 26, 14, 0, 0, Math.PI * 2);
      g.fill();
      if (spec.shoes) g.stroke();
    }
  };
  const drawLeg = (side: -1 | 1, ang: [number, number]) => {
    const hip: V = [cx + side * legX, hipY - 8];
    const a1 = rad(ang[0]);
    const thigh = D.legL * 0.52;
    const knee: V = [hip[0] + Math.sin(a1) * thigh, hip[1] + Math.cos(a1) * thigh];
    const a2 = a1 + rad(ang[1]);
    const shin = D.legL * 0.5;
    const foot: V = [knee[0] + Math.sin(a2) * shin, knee[1] + Math.cos(a2) * shin];
    if (spec.bareLegs) {
      // a tapered leg: full at the thigh, slim at the ankle
      const N = 14;
      const L: V[] = [];
      const Rr: V[] = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const q = qp(hip, knee, foot, t);
        const q2 = qp(hip, knee, foot, Math.min(1, t + 0.02));
        const q1 = qp(hip, knee, foot, Math.max(0, t - 0.02));
        const dx = q2[0] - q1[0];
        const dy = q2[1] - q1[1];
        const len = Math.hypot(dx, dy) || 1;
        const w = (LIMB * (3.4 - 1.5 * t) + (t < 0.15 ? LIMB * 0.6 * (1 - t / 0.15) : 0)) / 2;
        L.push([q[0] - (dy / len) * w, q[1] + (dx / len) * w]);
        Rr.push([q[0] + (dy / len) * w, q[1] - (dx / len) * w]);
      }
      g.fillStyle = spec.head ?? "#ffffff";
      g.strokeStyle = ink;
      g.lineWidth = OL * 0.6;
      g.beginPath();
      [...L, ...Rr.reverse()].forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q)));
      g.closePath();
      g.fill();
      g.stroke();
    } else {
      g.strokeStyle = spec.legColor ?? ink;
      g.lineWidth = LIMB;
      g.beginPath();
      g.moveTo(...hip);
      g.quadraticCurveTo(knee[0], knee[1], foot[0], foot[1]);
      g.stroke();
    }
    const mid = qp(hip, knee, foot, 0.5);
    const pk = spec.pants?.kind;
    if (spec.legWarmers) {
      const a = qp(hip, knee, foot, 0.68);
      const b = qp(hip, knee, foot, 0.97);
      segPoly(a, b, 42, 48, spec.legWarmers);
      g.strokeStyle = hexMul(spec.legWarmers, 0.72);
      g.lineWidth = OL * 0.45;
      for (const t of [0.75, 0.83, 0.91]) {
        const q = qp(hip, knee, foot, t);
        g.beginPath();
        g.moveTo(q[0] - 19, q[1]);
        g.quadraticCurveTo(q[0], q[1] + 5, q[0] + 19, q[1]);
        g.stroke();
      }
    }
    const full = spec.pants && (pk === "baggy" || pk === "flare" || pk === "straight");
    if (!full) drawShoe(foot, [qp(hip, knee, foot, 0.55), foot]);
    if (spec.pants && pk !== "skirt") {
      const c = spec.pants.color;
      if (pk === "shorts") segPoly(hip, qp(hip, knee, foot, 0.36), 60, 58, c);
      else {
        const wTop = pk === "baggy" ? 66 : pk === "flare" ? 50 : 46;
        const wKnee = pk === "baggy" ? 68 : pk === "flare" ? 46 : 44;
        const wHem = pk === "baggy" ? 72 : pk === "flare" ? 86 : 46;
        drawShoe(foot, [qp(hip, knee, foot, 0.55), foot]);
        // hem breaks over the shoe
        const hem: V = [foot[0] + 4, foot[1] - 8];
        segPoly(hip, mid, wTop, wKnee, c);
        segPoly(mid, hem, wKnee, wHem, c);
        // seam / crease
        g.strokeStyle = hexMul(c, 0.7);
        g.lineWidth = OL * 0.35;
        g.beginPath();
        g.moveTo(...qp(hip, knee, foot, 0.12));
        g.quadraticCurveTo(knee[0], knee[1], hem[0], hem[1] - 6);
        g.stroke();
        if (spec.pants.accent) {
          g.strokeStyle = spec.pants.accent;
          g.lineWidth = OL * 0.5;
          g.beginPath();
          g.moveTo(...qp(hip, knee, foot, 0.2));
          g.lineTo(...qp(hip, knee, foot, 0.4));
          g.stroke();
        }
      }
    }
  };
  drawLeg(-1, pose.legL);
  drawLeg(1, pose.legR);
  if (spec.pants?.kind === "skirt") {
    const c = spec.pants.color;
    const top = hipY - 30;
    const bot = hipY + 118;
    g.fillStyle = c;
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.7;
    g.beginPath();
    g.moveTo(cx - D.bodyW * 0.42, top);
    g.lineTo(cx + D.bodyW * 0.42, top);
    g.lineTo(cx + D.bodyW * 0.6, bot);
    g.quadraticCurveTo(cx, bot + 14, cx - D.bodyW * 0.6, bot);
    g.closePath();
    g.fill();
    g.stroke();
    g.strokeStyle = hexMul(c, 0.7);
    g.lineWidth = OL * 0.4;
    g.beginPath();
    for (const k of [-0.3, 0, 0.3]) {
      g.moveTo(cx + D.bodyW * k * 0.9, top + 30);
      g.lineTo(cx + D.bodyW * k * 1.25, bot - 4);
    }
    g.stroke();
  }
  // long hair that falls behind the shoulders is drawn before the body
  if (spec.hair === "hime" || spec.hair === "wolf" || spec.hair === "anime" || spec.hair === "twintails") {
    const tiltB = rad(pose.head ?? 0) + lean * 0.6;
    const neckB = rot([cx, bodyTop + 6]);
    g.save();
    g.translate(neckB[0] + Math.sin(lean) * D.headR * 0.9, neckB[1] - D.headR * 0.92);
    g.rotate(tiltB);
    drawBackHair(g, D.headR, spec, ink, D.headR * 0.075);
    g.restore();
  }

  // ---- body (bean)
  const bw = D.bodyW;
  const bh = D.bodyH * squash;
  const hour = (spec.shape ?? (spec.build === "femme" ? "hourglass" : "bean")) === "hourglass";
  const bodyPath = () => {
    const t = bodyTop;
    const b = hipY + 18;
    const l = cx - bw / 2;
    const r = cx + bw / 2;
    const pts: V[] = [];
    // bean: narrower shoulders, round bottom
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * Math.PI * 2;
      const sx = Math.sin(u);
      const cy = Math.cos(u);
      const yy = t + (1 - cy) * 0.5 * (b - t);
      const v = (1 - cy) * 0.5; // 0 at the shoulders .. 1 at the bottom
      // bean: wider toward the bottom. hourglass: soft bust line, narrow waist, fuller hips
      const bump = (c: number, w: number) => Math.exp(-((v - c) ** 2) / (2 * w * w));
      const widen = hour ? 0.84 + 0.19 * bump(0.27, 0.075) - 0.2 * bump(0.58, 0.07) + 0.3 * Math.min(1, Math.max(0, (v - 0.62) / 0.26)) ** 1.5 : 0.86 + 0.14 * v;
      const xx = cx + sx * (bw / 2) * widen * Math.pow(Math.abs(Math.sin(u)), 0.06) * (yy < t + 40 ? 0.92 : 1);
      pts.push(rot([xx, yy]));
    }
    g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
    g.closePath();
    void l;
    void r;
  };
  // arms behind the body for some poses? keep in front for readability (reference draws them in front)
  const shoulderY = bodyTop + 62;
  const drawArm = (side: -1 | 1, ang: [number, number]) => {
    const sh = rot([cx + side * (bw / 2 - 18), shoulderY]);
    const a1 = rad(ang[0]) * side * -1 + lean; // + angle = forward/up on the character's side
    const upper = D.armL * 0.5;
    const elbow: V = [sh[0] - Math.sin(a1) * upper * side * -1 * -1, sh[1] + Math.cos(a1) * upper];
    // compute with explicit side: arm rotates outward for +angles on the left (side -1) to the left
    const a1b = rad(ang[0]);
    const ex = sh[0] + side * Math.sin(a1b) * upper;
    const ey = sh[1] + Math.cos(a1b) * upper;
    const a2 = a1b + rad(ang[1]) * 1;
    const fore = D.armL * 0.5;
    const hx = ex + side * Math.sin(a2) * fore;
    const hy = ey + Math.cos(a2) * fore;
    void elbow;
    const aq = (t: number): V => [(1 - t) * (1 - t) * sh[0] + 2 * (1 - t) * t * ex + t * t * hx, (1 - t) * (1 - t) * sh[1] + 2 * (1 - t) * t * ey + t * t * hy];
    const tube = (t0: number, t1: number, w: number, col: string) => {
      g.lineCap = "round";
      for (const [lw, c] of [
        [w + OL * 1.3, ink],
        [w, col],
      ] as [number, string][]) {
        g.strokeStyle = c;
        g.lineWidth = lw;
        g.beginPath();
        for (let i = 0; i <= 10; i++) {
          const q = aq(t0 + ((t1 - t0) * i) / 10);
          if (i) g.lineTo(...q);
          else g.moveTo(...q);
        }
        g.stroke();
      }
    };
    if (spec.bareArms) tube(0.02, 0.97, LIMB * 2.2, spec.head ?? "#ffffff"); // skin under sleeves / warmers
    if (spec.sleeves) tube(0.02, spec.sleeveLen === "short" ? 0.45 : 0.9, LIMB * 3.1, spec.sleeves);
    if (spec.armWarmers) {
      tube(0.6, 0.92, LIMB * 3.4, spec.armWarmers);
      g.strokeStyle = hexMul(spec.armWarmers, 0.7);
      g.lineWidth = OL * 0.4;
      for (const t of [0.68, 0.76, 0.84]) {
        const q = aq(t);
        g.beginPath();
        g.arc(q[0], q[1], LIMB * 1.4, 0, Math.PI);
        g.stroke();
      }
    }
    if (spec.bareArms) {
      const skinC = spec.head ?? "#ffffff";
      g.fillStyle = skinC;
      g.strokeStyle = ink;
      g.lineWidth = OL * 0.6;
      g.beginPath();
      g.arc(hx, hy, LIMB * 1.5, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    } else {
      g.strokeStyle = ink;
      g.lineWidth = LIMB;
      g.beginPath();
      g.moveTo(...sh);
      g.quadraticCurveTo(ex, ey, hx, hy);
      g.stroke();
      g.fillStyle = ink;
      g.beginPath();
      g.arc(hx, hy, LIMB * 1.15, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = ink;
    g.fillStyle = ink;
    if (side === 1 && pose.handR === "peace") {
      // two fingers in a V above the hand dot
      g.lineWidth = LIMB * 0.7;
      g.beginPath();
      g.moveTo(hx - 3, hy - 6);
      g.lineTo(hx - 15, hy - 40);
      g.moveTo(hx + 3, hy - 6);
      g.lineTo(hx + 15, hy - 40);
      g.stroke();
    } else if (side === 1 && pose.handR === "point") {
      g.lineWidth = LIMB * 0.7;
      g.beginPath();
      g.moveTo(hx, hy - 4);
      g.lineTo(hx, hy - 36);
      g.stroke();
    }
    return [hx, hy] as V;
  };

  // body fill with a soft form gradient (light from the upper left)
  const outfit = spec.outfit ?? "tee";
  const bodyCol = spec.body;
  bodyPath();
  const grd = g.createLinearGradient(cx - bw / 2, bodyTop, cx + bw / 2, hipY);
  grd.addColorStop(0, hexMul(bodyCol, 1.08));
  grd.addColorStop(0.55, bodyCol);
  grd.addColorStop(1, hexMul(bodyCol, 0.8));
  g.fillStyle = grd;
  g.fill();
  // outfit details (clipped to the body)
  g.save();
  bodyPath();
  g.clip();
  if (outfit === "suit" || outfit === "lab" || outfit === "jacket") {
    const shirt = outfit === "lab" ? "#ffffff" : "#ffffff";
    g.fillStyle = outfit === "lab" ? hexMul(bodyCol, 0.96) : bodyCol;
    // V of the shirt
    g.fillStyle = shirt;
    g.beginPath();
    g.moveTo(...rot([cx - 34, bodyTop - 4]));
    g.lineTo(...rot([cx, bodyTop + 120]));
    g.lineTo(...rot([cx + 34, bodyTop - 4]));
    g.closePath();
    g.fill();
    if (outfit === "suit") {
      g.fillStyle = spec.accent ?? "#d62f3a";
      g.beginPath();
      g.moveTo(...rot([cx - 9, bodyTop + 8]));
      g.lineTo(...rot([cx + 9, bodyTop + 8]));
      g.lineTo(...rot([cx + 14, bodyTop + 110]));
      g.lineTo(...rot([cx, bodyTop + 132]));
      g.lineTo(...rot([cx - 14, bodyTop + 110]));
      g.closePath();
      g.fill();
    }
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.55;
    g.beginPath();
    g.moveTo(...rot([cx - 36, bodyTop - 4]));
    g.lineTo(...rot([cx - 2, bodyTop + 150]));
    g.moveTo(...rot([cx + 36, bodyTop - 4]));
    g.lineTo(...rot([cx + 2, bodyTop + 150]));
    g.stroke();
  } else if (outfit === "hoodie") {
    g.strokeStyle = hexMul(bodyCol, 0.7);
    g.lineWidth = OL * 0.5;
    g.beginPath();
    const p1 = rot([cx - 60, hipY - 70]);
    const p2 = rot([cx + 60, hipY - 70]);
    g.moveTo(...p1);
    g.lineTo(...p2);
    g.stroke();
    g.beginPath();
    g.moveTo(...rot([cx - 18, bodyTop + 10]));
    g.lineTo(...rot([cx - 22, bodyTop + 70]));
    g.moveTo(...rot([cx + 18, bodyTop + 10]));
    g.lineTo(...rot([cx + 22, bodyTop + 70]));
    g.stroke();
  } else if (outfit === "dress") {
    g.fillStyle = hexMul(bodyCol, 0.9);
    g.fillRect(cx - bw, hipY - 60, bw * 2, 120);
  } else if (outfit === "uniform") {
    g.fillStyle = spec.accent ?? "#e8c45a";
    for (let i = 0; i < 4; i++) {
      const p = rot([cx, bodyTop + 60 + i * 52]);
      g.beginPath();
      g.arc(p[0], p[1], 7, 0, Math.PI * 2);
      g.fill();
    }
  } else if (outfit === "robe") {
    g.fillStyle = spec.accent ?? hexMul(bodyCol, 0.75);
    g.fillRect(cx - 10, bodyTop, 20, bh + 30);
  } else if (outfit === "armor") {
    g.strokeStyle = hexMul(bodyCol, 0.65);
    g.lineWidth = OL * 0.5;
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(...rot([cx - bw, bodyTop + (bh * i) / 4]));
      g.lineTo(...rot([cx + bw, bodyTop + (bh * i) / 4]));
      g.stroke();
    }
  }
  const skin = spec.head ?? "#ffffff";
  if (outfit === "crop") {
    // cropped top: bare midriff band between the hem and the waistband
    g.fillStyle = hexMul(skin, 0.97);
    g.beginPath();
    g.moveTo(...rot([cx - bw, hipY - 58]));
    g.lineTo(...rot([cx + bw, hipY - 58]));
    g.lineTo(...rot([cx + bw, hipY + 40]));
    g.lineTo(...rot([cx - bw, hipY + 40]));
    g.closePath();
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.6;
    g.beginPath();
    g.moveTo(...rot([cx - bw, hipY - 58]));
    g.quadraticCurveTo(...rot([cx, hipY - 50]), ...rot([cx + bw, hipY - 58]));
    g.stroke();
    if (spec.pants && spec.pants.kind !== "skirt") {
      // low-rise waistband + belt line
      g.fillStyle = spec.pants.color;
      g.beginPath();
      g.moveTo(...rot([cx - bw, hipY - 4]));
      g.quadraticCurveTo(...rot([cx, hipY + 6]), ...rot([cx + bw, hipY - 4]));
      g.lineTo(...rot([cx + bw, hipY + 60]));
      g.lineTo(...rot([cx - bw, hipY + 60]));
      g.closePath();
      g.fill();
      g.strokeStyle = ink;
      g.lineWidth = OL * 0.55;
      g.beginPath();
      g.moveTo(...rot([cx - bw, hipY - 4]));
      g.quadraticCurveTo(...rot([cx, hipY + 6]), ...rot([cx + bw, hipY - 4]));
      g.stroke();
    }
  } else if (outfit === "tank") {
    // tank top: bare shoulders above the neckline, two thin straps
    g.fillStyle = hexMul(skin, 0.97);
    g.beginPath();
    g.moveTo(...rot([cx - bw, bodyTop - 20]));
    g.lineTo(...rot([cx + bw, bodyTop - 20]));
    g.lineTo(...rot([cx + bw, bodyTop + 52]));
    g.quadraticCurveTo(...rot([cx, bodyTop + 92]), ...rot([cx - bw, bodyTop + 52]));
    g.closePath();
    g.fill();
    g.strokeStyle = bodyCol;
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(...rot([cx - bw * 0.27, bodyTop + 60]));
    g.lineTo(...rot([cx - bw * 0.3, bodyTop - 10]));
    g.moveTo(...rot([cx + bw * 0.27, bodyTop + 60]));
    g.lineTo(...rot([cx + bw * 0.3, bodyTop - 10]));
    g.stroke();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.55;
    g.beginPath();
    g.moveTo(...rot([cx - bw * 0.42, bodyTop + 56]));
    g.quadraticCurveTo(...rot([cx, bodyTop + 96]), ...rot([cx + bw * 0.42, bodyTop + 56]));
    g.stroke();
  } else if (outfit === "fur") {
    // faux-fur coat: fluffy collar + hem + centre opening
    g.fillStyle = spec.accent ?? hexMul(bodyCol, 0.86);
    for (let i = 0; i < 9; i++) {
      const a = rot([cx - bw * 0.44 + (i * bw * 0.88) / 8, bodyTop + 14 + Math.sin(i * 1.3) * 6]);
      g.beginPath();
      g.arc(a[0], a[1], 24, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 9; i++) {
      const a = rot([cx - bw * 0.52 + (i * bw * 1.04) / 8, hipY + 6 + Math.cos(i * 1.7) * 5]);
      g.beginPath();
      g.arc(a[0], a[1], 20, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = hexMul(bodyCol, 0.62);
    g.lineWidth = OL * 0.45;
    g.beginPath();
    g.moveTo(...rot([cx + 4, bodyTop + 36]));
    g.lineTo(...rot([cx + 10, hipY]));
    for (let i = 0; i < 6; i++) {
      const a = rot([cx - bw * 0.3 + (i % 3) * 40, bodyTop + 80 + Math.floor(i / 3) * 70]);
      g.moveTo(a[0], a[1]);
      g.lineTo(a[0] + 6, a[1] + 14);
    }
    g.stroke();
  } else if (outfit === "leather") {
    // leather jacket: collar wedges, an off-centre zip, a hard shine
    g.fillStyle = hexMul(bodyCol, 0.75);
    g.beginPath();
    g.moveTo(...rot([cx - 40, bodyTop - 4]));
    g.lineTo(...rot([cx - 6, bodyTop + 70]));
    g.lineTo(...rot([cx - 54, bodyTop + 48]));
    g.closePath();
    g.moveTo(...rot([cx + 40, bodyTop - 4]));
    g.lineTo(...rot([cx + 6, bodyTop + 70]));
    g.lineTo(...rot([cx + 54, bodyTop + 48]));
    g.closePath();
    g.fill();
    g.strokeStyle = "#c9ced6";
    g.lineWidth = OL * 0.5;
    g.beginPath();
    g.moveTo(...rot([cx + 16, bodyTop + 60]));
    g.lineTo(...rot([cx + 26, hipY + 10]));
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(...rot([cx - bw * 0.34, bodyTop + 70]));
    g.quadraticCurveTo(...rot([cx - bw * 0.4, bodyTop + bh * 0.5]), ...rot([cx - bw * 0.3, hipY - 30]));
    g.stroke();
  } else if (outfit === "zip") {
    // zip-up hoodie: centre zip, pull, drawstrings
    g.strokeStyle = hexMul(bodyCol, 0.6);
    g.lineWidth = OL * 0.55;
    g.beginPath();
    g.moveTo(...rot([cx, bodyTop + 4]));
    g.lineTo(...rot([cx, hipY + 16]));
    g.stroke();
    g.strokeStyle = hexMul(bodyCol, 1.25);
    g.lineWidth = OL * 0.4;
    g.beginPath();
    g.moveTo(...rot([cx - 16, bodyTop + 10]));
    g.lineTo(...rot([cx - 20, bodyTop + 76]));
    g.moveTo(...rot([cx + 16, bodyTop + 10]));
    g.lineTo(...rot([cx + 20, bodyTop + 76]));
    g.stroke();
    const pull = rot([cx + 4, bodyTop + 40]);
    g.fillStyle = "#c9ced6";
    g.fillRect(pull[0] - 4, pull[1], 8, 18);
  }
  if (spec.print) {
    const pc = rot([cx + 4, bodyTop + bh * 0.4]);
    g.save();
    g.translate(pc[0], pc[1]);
    g.rotate(lean);
    g.fillStyle = spec.printColor ?? "#ffffff";
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.4;
    const S = 34;
    g.beginPath();
    if (spec.print === "heart") {
      g.moveTo(0, S * 0.9);
      g.bezierCurveTo(-S * 1.6, -S * 0.2, -S * 0.6, -S * 1.3, 0, -S * 0.4);
      g.bezierCurveTo(S * 0.6, -S * 1.3, S * 1.6, -S * 0.2, 0, S * 0.9);
    } else if (spec.print === "star") {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? S * 0.45 : S * 1.1;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
    } else if (spec.print === "skull") {
      g.ellipse(0, -S * 0.2, S * 0.85, S * 0.75, 0, 0, Math.PI * 2);
      g.rect(-S * 0.45, S * 0.3, S * 0.9, S * 0.45);
    } else if (spec.print === "flames") {
      g.moveTo(-S * 1.2, S * 0.8);
      for (let i = 0; i <= 4; i++) g.quadraticCurveTo(-S * 1.2 + i * S * 0.6, -S * (i % 2 ? 1.4 : 0.6), -S * 0.9 + i * S * 0.6, S * 0.2);
      g.lineTo(S * 1.2, S * 0.8);
      g.closePath();
    } else {
      // angel: a small winged heart
      g.ellipse(-S * 0.9, -S * 0.1, S * 0.7, S * 0.35, -0.4, 0, Math.PI * 2);
      g.ellipse(S * 0.9, -S * 0.1, S * 0.7, S * 0.35, 0.4, 0, Math.PI * 2);
      g.moveTo(0, S * 0.7);
      g.arc(0, 0, S * 0.45, 0, Math.PI * 2);
    }
    g.fill();
    g.stroke();
    if (spec.print === "skull") {
      g.fillStyle = ink;
      g.beginPath();
      g.arc(-S * 0.32, -S * 0.25, S * 0.2, 0, Math.PI * 2);
      g.arc(S * 0.32, -S * 0.25, S * 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }
  if (spec.text) {
    const c = rot([cx + 6, bodyTop + bh * 0.42]);
    g.save();
    g.translate(c[0], c[1]);
    g.rotate(lean);
    g.fillStyle = spec.textColor ?? "#ffd23f";
    g.font = `900 ${Math.min(64, 220 / Math.max(2, spec.text.length))}px "Montserrat", "Arial Black", sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(spec.text, 0, 0);
    g.restore();
  }
  g.restore();
  bodyPath();
  g.strokeStyle = ink;
  g.lineWidth = OL;
  g.stroke();
  if (spec.badge && (spec.badge.scale ?? 1) > 0.02) drawBadge(g, spec.badge, rot([cx + bw * 0.2, bodyTop + bh * 0.33]), lean, ink, OL);
  if (spec.necklace) {
    const n0 = rot([cx, bodyTop + 16]);
    if (spec.necklace === "choker") {
      g.strokeStyle = "#141018";
      g.lineWidth = 11;
      g.beginPath();
      g.moveTo(...rot([cx - 40, bodyTop + 14]));
      g.quadraticCurveTo(n0[0], n0[1] + 14, ...rot([cx + 40, bodyTop + 14]));
      g.stroke();
    } else {
      const beads = spec.necklace === "pearls";
      g.strokeStyle = beads ? "#d8d4cc" : "#c9ced6";
      g.lineWidth = beads ? 2 : 4;
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const q = rot([cx - 46 + t * 92, bodyTop + 14 + Math.sin(t * Math.PI) * 38]);
        if (i) g.lineTo(...q);
        else g.moveTo(...q);
      }
      g.stroke();
      if (beads)
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const q = rot([cx - 46 + t * 92, bodyTop + 14 + Math.sin(t * Math.PI) * 38]);
          g.fillStyle = "#f6f2ea";
          g.strokeStyle = "#9a958c";
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(q[0], q[1], 7, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
      else {
        const q = rot([cx, bodyTop + 58]);
        g.fillStyle = "#c9ced6";
        g.strokeStyle = ink;
        g.lineWidth = 2;
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const rr = i % 2 ? 5 : 13;
          g.lineTo(q[0] + Math.cos(a) * rr, q[1] + Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
        g.stroke();
      }
    }
  }
  if (spec.crossbody) {
    const s0 = rot([cx + bw * 0.32, bodyTop + 22]);
    const s1 = rot([cx - bw * 0.46, hipY - 34]);
    g.strokeStyle = hexMul(spec.crossbody, 0.6);
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(...s0);
    g.lineTo(...s1);
    g.stroke();
    g.fillStyle = spec.crossbody;
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.6;
    g.beginPath();
    g.roundRect(s1[0] - 44, s1[1] - 8, 76, 58, 14);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(s1[0] - 44, s1[1] + 14);
    g.quadraticCurveTo(s1[0] - 6, s1[1] + 30, s1[0] + 32, s1[1] + 14);
    g.stroke();
  }

  // ---- arms (in front of the body)
  const handL = drawArm(-1, pose.armL);
  const handR = drawArm(1, pose.armR);
  if (o.item && !o.item.front) drawItem(g, o.item, o.item.hand === "L" ? handL : handR, D.headR, ink, OL);

  // ---- head
  const headR = D.headR;
  const headTilt = rad(pose.head ?? 0) + lean * 0.6;
  const neck = rot([cx, bodyTop + 6]);
  const hc: V = [neck[0] + Math.sin(lean) * headR * 0.9, neck[1] - headR * 0.92];
  g.save();
  g.translate(hc[0], hc[1]);
  g.rotate(headTilt);
  const R = headR;
  // hood behind the head
  if (spec.mask || spec.hat === "hood") {
    g.fillStyle = spec.hatColor ?? "#26262c";
    g.beginPath();
    g.ellipse(0, 6, R * 1.2, R * 1.17, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL;
    g.stroke();
  }
  // long hair behind
  if (spec.hair === "long" || spec.hair === "ponytail" || spec.hair === "bob") {
    g.fillStyle = spec.hairColor ?? "#6b4226";
    g.beginPath();
    if (spec.hair === "long") g.ellipse(0, R * 0.35, R * 1.08, R * 1.25, 0, 0, Math.PI * 2);
    else if (spec.hair === "bob") g.ellipse(0, R * 0.12, R * 1.12, R * 1.06, 0, 0, Math.PI * 2);
    else g.ellipse(R * 0.95, R * 0.1, R * 0.32, R * 0.6, -0.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL;
    g.stroke();
  }
  // head disc (slightly bean shaped: h/w 0.94)
  const headCol = spec.head ?? "#ffffff";
  const hg = g.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.15, 0, 0, R * 1.05);
  hg.addColorStop(0, hexMul(headCol, 1.02));
  hg.addColorStop(0.7, headCol);
  hg.addColorStop(1, hexMul(headCol, 0.88));
  g.fillStyle = hg;
  g.beginPath();
  g.ellipse(0, 0, R, R * (spec.mask ? 0.98 : 0.95), 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = ink;
  g.lineWidth = OL;
  g.stroke();

  // ---- face
  drawFace(g, R, face, spec, o, ink, OL);

  // ---- hair / hats on top
  drawHairHat(g, R, spec, ink, OL);
  if (spec.earrings && spec.hat !== "fur") {
    const ec = spec.earringColor ?? "#c9ced6";
    for (const sx of [-1, 1]) {
      const x = sx * R * 1.02;
      const y = R * 0.36;
      g.strokeStyle = ec;
      g.fillStyle = ec;
      g.lineWidth = OL * 0.55;
      g.beginPath();
      if (spec.earrings === "hoops") {
        g.arc(x, y + R * 0.1, R * 0.11, 0, Math.PI * 2);
        g.stroke();
      } else if (spec.earrings === "drops") {
        g.moveTo(x, y);
        g.lineTo(x, y + R * 0.2);
        g.stroke();
        g.beginPath();
        g.arc(x, y + R * 0.26, R * 0.055, 0, Math.PI * 2);
        g.fill();
      } else {
        g.arc(x, y, R * 0.04, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  g.restore();
  // ---- arms / item that sit in front of the face (opt-in)
  if (pose.front === "L" || pose.front === "both") drawArm(-1, pose.armL);
  if (pose.front === "R" || pose.front === "both") drawArm(1, pose.armR);
  if (o.item?.front) drawItem(g, o.item, o.item.hand === "L" ? handL : handR, D.headR, ink, OL);
  g.restore();
}

function drawFace(g: Ctx, R: number, face: Face, spec: StickSpec, o: DrawOpts, ink: string, OL: number) {
  const look = face.look ?? [0, 0];
  const ex = R * (spec.animeEyes ? 0.33 : 0.3);
  const ey = spec.animeEyes ? R * 0.06 : -R * 0.02;
  const er = R * 0.075 * (spec.eyeScale ?? 1);
  const lx = look[0] * R * 0.06;
  const ly = look[1] * R * 0.06;
  const blink = o.blink ?? 0;
  const eyeY = ey;
  g.fillStyle = ink;
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.62;
  const eye = (sx: number) => {
    const x = sx * ex + lx;
    const y = eyeY + ly;
    const base: Eyes = face.eyes === "wink" ? (sx < 0 ? "lidded" : "happy") : face.eyes;
    const kind = blink > 0.5 && face.eyes !== "wink" && !["x", "spiral", "hearts", "stars", "happy", "closed", "dollar"].includes(base) ? "closed" : base;
    if (spec.animeEyes && ["dot", "side", "lidded", "sad", "angry", "wide", "tiny"].includes(kind)) {
      animeEye(g, kind, x, y, sx, er, R, spec.iris ?? "#3a2a55", spec.head ?? "#ffffff", ink, OL);
      return;
    }
    g.beginPath();
    switch (kind) {
      case "dollar": {
        g.save();
        g.font = `900 ${er * 5.4}px "Montserrat", "Arial Black", sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.lineJoin = "round";
        g.lineWidth = OL * 0.5;
        g.strokeStyle = ink;
        g.fillStyle = "#22a352";
        g.strokeText("$", x - lx, y - ly + er * 0.4);
        g.fillText("$", x - lx, y - ly + er * 0.4);
        g.restore();
        break;
      }
      case "dot":
      case "side":
        g.ellipse(x, y, er, er * 1.15, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case "tiny":
        g.arc(x, y, er * 0.6, 0, Math.PI * 2);
        g.fill();
        break;
      case "wide":
        g.fillStyle = "#ffffff";
        g.ellipse(x, y, er * 2.1, er * 2.4, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = ink;
        g.beginPath();
        g.arc(x + lx * 0.5, y + ly * 0.5, er * 0.9, 0, Math.PI * 2);
        g.fill();
        break;
      case "happy":
        g.arc(x, y + er * 0.8, er * 1.5, Math.PI * 1.1, Math.PI * 1.9);
        g.stroke();
        break;
      case "closed":
        g.moveTo(x - er * 1.4, y);
        g.quadraticCurveTo(x, y + er * 1.1, x + er * 1.4, y);
        g.stroke();
        break;
      case "angry":
        g.ellipse(x, y + er * 0.3, er, er * 0.95, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case "sad":
        g.ellipse(x, y + er * 0.2, er * 0.9, er * 1.1, 0, 0, Math.PI * 2);
        g.fill();
        break;
      case "lidded":
        g.ellipse(x, y + er * 0.35, er * 1.05, er * 0.7, 0, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.moveTo(x - er * 1.6, y - er * 0.25);
        g.lineTo(x + er * 1.6, y - er * 0.25);
        g.stroke();
        break;
      case "x":
        g.moveTo(x - er * 1.3, y - er * 1.3);
        g.lineTo(x + er * 1.3, y + er * 1.3);
        g.moveTo(x + er * 1.3, y - er * 1.3);
        g.lineTo(x - er * 1.3, y + er * 1.3);
        g.stroke();
        break;
      case "spiral": {
        for (let t = 0; t < 12; t += 0.2) {
          const rr = er * 0.12 * t;
          const px = x + Math.cos(t * 1.4) * rr;
          const py = y + Math.sin(t * 1.4) * rr;
          if (t === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.stroke();
        break;
      }
      case "hearts": {
        g.fillStyle = "#ff3d6e";
        const s = er * 1.6;
        g.moveTo(x, y + s * 0.7);
        g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.5, y - s * 1.2, x, y - s * 0.4);
        g.bezierCurveTo(x + s * 0.5, y - s * 1.2, x + s * 1.4, y - s * 0.2, x, y + s * 0.7);
        g.fill();
        g.fillStyle = ink;
        break;
      }
      case "stars": {
        g.fillStyle = "#ffd23f";
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const rr = i % 2 ? er * 0.8 : er * 2;
          const px = x + Math.cos(a) * rr;
          const py = y + Math.sin(a) * rr;
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.fill();
        g.stroke();
        g.fillStyle = ink;
        break;
      }
    }
    if (spec.catchlights && ["dot", "side", "angry", "sad", "lidded"].includes(kind)) {
      g.save();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(x - er * 0.35, y - er * (kind === "lidded" ? 0.05 : 0.4), er * 0.32, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    if (spec.lashes && !["x", "spiral", "hearts", "stars", "dollar"].includes(kind)) {
      // two flicks + a wing sweeping up and out from the outer top corner of the eye
      const top = kind === "wide" ? y - er * 2.3 : kind === "happy" ? y - er * 0.55 : kind === "closed" ? y + er * 0.15 : kind === "lidded" ? y - er * 0.2 : y - er * 0.95;
      const ox = x + sx * (kind === "wide" ? er * 1.8 : kind === "happy" || kind === "closed" ? er * 1.35 : er * 0.92);
      g.save();
      g.strokeStyle = ink;
      g.lineCap = "round";
      g.lineWidth = OL * 0.5;
      g.beginPath();
      g.moveTo(ox - sx * er * 0.2, top + er * 0.45);
      g.quadraticCurveTo(ox + sx * er * 0.9, top + er * 0.05, ox + sx * er * 1.6, top - er * 0.75);
      g.moveTo(ox - sx * er * 0.7, top + er * 0.1);
      g.quadraticCurveTo(ox, top - er * 0.45, ox + sx * er * 0.45, top - er * 1.25);
      g.stroke();
      g.restore();
    }
  };
  eye(-1);
  eye(1);
  if (spec.blush) {
    g.fillStyle = "rgba(255,128,150,0.32)";
    g.beginPath();
    const bly = R * (spec.animeEyes ? 0.33 : 0.2);
    const blx = R * (spec.animeEyes ? 0.52 : 0.46);
    g.ellipse(-blx, bly, R * 0.13, R * 0.075, 0, 0, Math.PI * 2);
    g.ellipse(blx, bly, R * 0.13, R * 0.075, 0, 0, Math.PI * 2);
    g.fill();
  }
  // glasses
  if (spec.glasses && spec.glasses !== "none") {
    g.lineWidth = OL * 0.55;
    g.strokeStyle = ink;
    const gr = R * 0.2;
    if (spec.glasses === "shades") {
      g.fillStyle = "#141418";
      g.beginPath();
      g.roundRect(-ex - gr * 1.2, eyeY - gr * 0.7, gr * 2.4, gr * 1.4, gr * 0.5);
      g.roundRect(ex - gr * 1.2, eyeY - gr * 0.7, gr * 2.4, gr * 1.4, gr * 0.5);
      g.fill();
      g.stroke();
    } else {
      g.beginPath();
      if (spec.glasses === "round") {
        g.arc(-ex, eyeY, gr, 0, Math.PI * 2);
        g.moveTo(ex + gr, eyeY);
        g.arc(ex, eyeY, gr, 0, Math.PI * 2);
      } else {
        g.rect(-ex - gr, eyeY - gr * 0.78, gr * 2, gr * 1.56);
        g.rect(ex - gr, eyeY - gr * 0.78, gr * 2, gr * 1.56);
      }
      g.stroke();
    }
    g.beginPath();
    g.moveTo(-ex + gr, eyeY - gr * 0.1);
    g.quadraticCurveTo(0, eyeY - gr * 0.45, ex - gr, eyeY - gr * 0.1);
    g.moveTo(-ex - gr, eyeY - gr * 0.1);
    g.lineTo(-R * 0.92, eyeY - gr * 0.3);
    g.moveTo(ex + gr, eyeY - gr * 0.1);
    g.lineTo(R * 0.92, eyeY - gr * 0.3);
    g.stroke();
  }
  // brows
  g.lineWidth = OL * 0.6;
  g.strokeStyle = ink;
  const by = eyeY - R * (spec.glasses && spec.glasses !== "none" ? 0.3 : 0.22);
  const brow = (sx: number) => {
    const x = sx * ex;
    g.beginPath();
    switch (face.brows) {
      case "neutral":
        g.moveTo(x - R * 0.1, by);
        g.lineTo(x + R * 0.1, by);
        break;
      case "raised":
        g.moveTo(x - R * 0.11, by - R * 0.03);
        g.quadraticCurveTo(x, by - R * 0.1, x + R * 0.11, by - R * 0.03);
        break;
      case "angry": // inner ends low: \ /
        g.moveTo(x - sx * R * 0.13, by + R * 0.05);
        g.lineTo(x + sx * R * 0.09, by - R * 0.05);
        break;
      case "sad":
      case "worried": // inner ends high
        g.moveTo(x - sx * R * 0.12, by - R * 0.06);
        g.lineTo(x + sx * R * 0.1, by + R * 0.04);
        break;
      case "oneUp":
        if (sx > 0) {
          g.moveTo(x - R * 0.11, by - R * 0.06);
          g.quadraticCurveTo(x, by - R * 0.13, x + R * 0.11, by - R * 0.05);
        } else {
          g.moveTo(x - R * 0.1, by + R * 0.02);
          g.lineTo(x + R * 0.1, by + R * 0.02);
        }
        break;
      default:
        return;
    }
    g.stroke();
  };
  brow(-1);
  brow(1);
  // nose
  if (spec.nose === "red" || spec.nose === "big") {
    g.fillStyle = spec.nose === "red" ? "#f07b8c" : "#f3ddd0";
    g.beginPath();
    g.ellipse(0, R * 0.16, R * 0.11, R * 0.09, 0, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = OL * 0.5;
    g.stroke();
  } else if (spec.nose === "dot") {
    g.fillStyle = ink;
    g.beginPath();
    g.arc(0, R * 0.14, R * 0.025, 0, Math.PI * 2);
    g.fill();
  }
  // mustache / beard
  if (spec.beard) {
    g.fillStyle = spec.beard;
    g.beginPath();
    g.ellipse(0, R * 0.62, R * 0.62, R * 0.36, 0, 0, Math.PI);
    g.fill();
    g.lineWidth = OL * 0.6;
    g.stroke();
  }
  // mouth (talk overrides closed mouths)
  const talk = o.talk ?? 0;
  const my = R * 0.4;
  let mouth = face.mouth;
  if (talk > 0.05 && ["flat", "smile", "smirk", "frown", "wavy", "none"].includes(mouth)) mouth = talk > 0.55 ? "open" : "o";
  g.lineWidth = OL * 0.62;
  g.strokeStyle = ink;
  const mouthW = R * 0.22;
  g.beginPath();
  switch (mouth) {
    case "smile":
      g.moveTo(-mouthW, my - R * 0.04);
      g.quadraticCurveTo(0, my + R * 0.14, mouthW, my - R * 0.04);
      g.stroke();
      break;
    case "flat":
      g.moveTo(-mouthW * 0.6, my);
      g.lineTo(mouthW * 0.6, my);
      g.stroke();
      break;
    case "frown":
      g.moveTo(-mouthW * 0.8, my + R * 0.06);
      g.quadraticCurveTo(0, my - R * 0.08, mouthW * 0.8, my + R * 0.06);
      g.stroke();
      break;
    case "smirk":
      g.moveTo(-mouthW * 0.6, my + R * 0.02);
      g.quadraticCurveTo(mouthW * 0.2, my + R * 0.06, mouthW * 0.9, my - R * 0.08);
      g.stroke();
      break;
    case "wavy":
      g.moveTo(-mouthW, my);
      for (let i = 1; i <= 6; i++) g.lineTo(-mouthW + (i * mouthW * 2) / 6, my + (i % 2 ? -R * 0.04 : R * 0.04));
      g.stroke();
      break;
    case "o": {
      const a = 0.35 + talk * 0.4;
      g.fillStyle = "#5a1e28";
      g.ellipse(0, my + R * 0.02, R * 0.07, R * 0.07 * (1 + a), 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      break;
    }
    case "scream": {
      g.fillStyle = "#5a1e28";
      g.ellipse(0, my + R * 0.06, R * 0.13, R * 0.2, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = "#e86e78";
      g.beginPath();
      g.ellipse(0, my + R * 0.18, R * 0.08, R * 0.06, 0, 0, Math.PI * 2);
      g.fill();
      break;
    }
    case "open":
    case "laugh": {
      const hgt = mouth === "laugh" ? R * 0.22 : R * (0.1 + talk * 0.12);
      const wdt = R * 0.2;
      g.fillStyle = "#5a1e28";
      g.moveTo(-wdt, my - R * 0.03);
      g.quadraticCurveTo(0, my + hgt * 1.6, wdt, my - R * 0.03);
      g.closePath();
      g.fill();
      g.stroke();
      if (mouth === "laugh" || talk > 0.6) {
        g.fillStyle = "#e86e78";
        g.beginPath();
        g.ellipse(0, my + hgt * 0.6, wdt * 0.45, hgt * 0.25, 0, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case "teeth":
    case "grin":
    case "evil": {
      const wdt = mouth === "evil" ? R * 0.42 : R * 0.3;
      const hgt = R * 0.18;
      g.fillStyle = "#ffffff";
      g.moveTo(-wdt, my - hgt * 0.4);
      g.quadraticCurveTo(0, my - hgt * (mouth === "evil" ? 0.1 : 0.7), wdt, my - hgt * 0.4);
      g.quadraticCurveTo(0, my + hgt * 1.5, -wdt, my - hgt * 0.4);
      g.closePath();
      g.fill();
      g.stroke();
      g.lineWidth = OL * 0.35;
      g.beginPath();
      for (let i = -2; i <= 2; i++) {
        g.moveTo((i * wdt) / 3, my - hgt * 0.35);
        g.lineTo((i * wdt) / 3.2, my + hgt * 0.55);
      }
      g.moveTo(-wdt * 0.92, my + hgt * 0.1);
      g.quadraticCurveTo(0, my + hgt * 0.45, wdt * 0.92, my + hgt * 0.1);
      g.stroke();
      break;
    }
    case "tongue":
      g.moveTo(-mouthW * 0.7, my);
      g.lineTo(mouthW * 0.7, my);
      g.stroke();
      g.fillStyle = "#e86e78";
      g.beginPath();
      g.ellipse(mouthW * 0.2, my + R * 0.08, R * 0.08, R * 0.1, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      break;
    default:
      break;
  }
  if (spec.lips && ["smile", "flat", "frown", "smirk", "wavy"].includes(mouth)) {
    // re-stroke the same mouth path: a thin ink edge with the lip colour inside
    g.lineWidth = OL * 0.62;
    g.strokeStyle = spec.lips;
    g.lineWidth = OL * 0.42;
    g.stroke();
  }
  for (const pc of spec.piercings ?? []) {
    g.fillStyle = "#c9ced6";
    g.strokeStyle = "#c9ced6";
    g.lineWidth = OL * 0.4;
    g.beginPath();
    if (pc === "nose") g.arc(R * 0.06, R * 0.17, R * 0.022, 0, Math.PI * 2);
    else if (pc === "lip") {
      g.arc(R * 0.1, my + R * 0.06, R * 0.045, 0, Math.PI);
      g.stroke();
      continue;
    } else g.arc(ex + R * 0.12, by - R * 0.02, R * 0.02, 0, Math.PI * 2);
    g.fill();
  }
  if (spec.mustache) {
    g.fillStyle = spec.mustache;
    g.beginPath();
    g.ellipse(-R * 0.14, my - R * 0.13, R * 0.16, R * 0.07, 0.25, 0, Math.PI * 2);
    g.ellipse(R * 0.14, my - R * 0.13, R * 0.16, R * 0.07, -0.25, 0, Math.PI * 2);
    g.fill();
  }
  // extras
  for (const x of face.extras ?? []) {
    if (x === "sweat") {
      g.fillStyle = "#7cc8ff";
      g.strokeStyle = "#2b6fb0";
      g.lineWidth = OL * 0.4;
      g.beginPath();
      const sx = R * 0.72;
      const sy = -R * 0.55;
      g.moveTo(sx, sy - R * 0.2);
      g.quadraticCurveTo(sx + R * 0.14, sy + R * 0.02, sx, sy + R * 0.08);
      g.quadraticCurveTo(sx - R * 0.14, sy + R * 0.02, sx, sy - R * 0.2);
      g.fill();
      g.stroke();
    } else if (x === "blush") {
      g.fillStyle = "rgba(255,120,140,0.45)";
      g.beginPath();
      g.ellipse(-R * 0.5, R * 0.22, R * 0.14, R * 0.08, 0, 0, Math.PI * 2);
      g.ellipse(R * 0.5, R * 0.22, R * 0.14, R * 0.08, 0, 0, Math.PI * 2);
      g.fill();
    } else if (x === "tears") {
      g.fillStyle = "#7cc8ff";
      g.beginPath();
      g.ellipse(-ex, eyeY + R * 0.25, R * 0.05, R * 0.14, 0, 0, Math.PI * 2);
      g.ellipse(ex, eyeY + R * 0.25, R * 0.05, R * 0.14, 0, 0, Math.PI * 2);
      g.fill();
    } else if (x === "anger") {
      g.strokeStyle = "#e0303a";
      g.lineWidth = OL * 0.6;
      const ax = R * 0.62;
      const ay = -R * 0.62;
      g.beginPath();
      for (const [dx, dy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        g.moveTo(ax + dx * R * 0.04, ay + dy * R * 0.04);
        g.quadraticCurveTo(ax + dx * R * 0.06, ay + dy * R * 0.06, ax + dx * R * 0.12, ay + dy * R * 0.02);
      }
      g.stroke();
    } else if (x === "shock") {
      g.strokeStyle = ink;
      g.lineWidth = OL * 0.5;
      g.beginPath();
      for (let i = -2; i <= 2; i++) {
        const a = -Math.PI / 2 + i * 0.32;
        g.moveTo(Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12);
        g.lineTo(Math.cos(a) * R * 1.34, Math.sin(a) * R * 1.34);
      }
      g.stroke();
    } else if (x === "question") {
      g.fillStyle = ink;
      g.font = `900 ${R * 0.7}px "Montserrat", "Arial Black", sans-serif`;
      g.textAlign = "center";
      g.fillText("?", R * 0.95, -R * 0.85);
    } else if (x === "zzz") {
      g.fillStyle = ink;
      g.font = `900 ${R * 0.36}px "Montserrat", "Arial Black", sans-serif`;
      g.fillText("z", R * 0.8, -R * 0.75);
      g.fillText("Z", R * 1.05, -R * 1.05);
    } else if (x === "sparkle") {
      g.fillStyle = "#ffd23f";
      for (const [sx, sy, s] of [
        [-R * 1.0, -R * 0.7, 1],
        [R * 1.05, -R * 0.4, 0.7],
      ]) {
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const rr = (i % 2 ? R * 0.05 : R * 0.16) * s;
          g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      }
    }
  }
}

function drawHairHat(g: Ctx, R: number, spec: StickSpec, ink: string, OL: number) {
  const hc = spec.hairColor ?? "#7a4a2a";
  g.strokeStyle = ink;
  g.lineWidth = OL;
  const fillStroke = () => {
    g.fill();
    g.stroke();
  };
  if (!spec.mask) {
    switch (spec.hair ?? "none") {
      case "short":
      case "side":
      case "slick":
      case "bob":
      case "long":
      case "ponytail": {
        g.fillStyle = hc;
        g.beginPath();
        // cap of hair over the crown with a side part
        g.moveTo(-R * 0.98, -R * 0.12);
        g.quadraticCurveTo(-R * 1.02, -R * 1.02, 0, -R * 1.02);
        g.quadraticCurveTo(R * 1.04, -R * 1.0, R * 0.98, -R * 0.1);
        if (spec.hair === "side" || spec.hair === "slick") {
          g.quadraticCurveTo(R * 0.6, -R * 0.62, -R * 0.15, -R * 0.5);
          g.quadraticCurveTo(-R * 0.6, -R * 0.45, -R * 0.98, -R * 0.12);
        } else {
          g.quadraticCurveTo(R * 0.45, -R * 0.5, 0, -R * 0.58);
          g.quadraticCurveTo(-R * 0.55, -R * 0.52, -R * 0.98, -R * 0.12);
        }
        g.closePath();
        fillStroke();
        if (spec.hair === "short" || spec.hair === "side") {
          // the little cowlick of the reference's lead
          g.beginPath();
          g.moveTo(-R * 0.2, -R * 1.0);
          g.quadraticCurveTo(-R * 0.35, -R * 1.32, -R * 0.08, -R * 1.42);
          g.stroke();
        }
        break;
      }
      case "spiky": {
        g.fillStyle = hc;
        g.beginPath();
        g.moveTo(-R * 0.98, -R * 0.2);
        for (let i = 0; i <= 8; i++) {
          const a = Math.PI + (i / 8) * Math.PI;
          const rr = i % 2 ? R * 1.32 : R * 1.0;
          g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr - R * 0.05);
        }
        g.quadraticCurveTo(0, -R * 0.55, -R * 0.98, -R * 0.2);
        g.closePath();
        fillStroke();
        break;
      }
      case "curly": {
        g.fillStyle = hc;
        for (let i = 0; i < 9; i++) {
          const a = Math.PI * 1.05 + (i / 8) * Math.PI * 0.9;
          g.beginPath();
          g.arc(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92, R * 0.28, 0, Math.PI * 2);
          fillStroke();
        }
        break;
      }
      case "bun": {
        g.fillStyle = hc;
        g.beginPath();
        g.arc(0, -R * 1.12, R * 0.34, 0, Math.PI * 2);
        fillStroke();
        g.beginPath();
        g.moveTo(-R * 0.98, -R * 0.15);
        g.quadraticCurveTo(-R * 1.0, -R * 1.0, 0, -R * 1.0);
        g.quadraticCurveTo(R * 1.0, -R * 1.0, R * 0.98, -R * 0.15);
        g.quadraticCurveTo(0, -R * 0.62, -R * 0.98, -R * 0.15);
        g.closePath();
        fillStroke();
        break;
      }
      case "hime": {
        // crown + blunt fringe + straight side locks to the jaw
        g.fillStyle = hc;
        g.beginPath();
        g.moveTo(-R * 1.03, R * 0.8);
        g.lineTo(-R * 1.04, -R * 0.1);
        g.quadraticCurveTo(-R * 1.07, -R * 1.07, 0, -R * 1.07);
        g.quadraticCurveTo(R * 1.07, -R * 1.07, R * 1.04, -R * 0.1);
        g.lineTo(R * 1.03, R * 0.8);
        g.lineTo(R * 0.76, R * 0.8);
        g.lineTo(R * 0.74, -R * 0.28);
        g.lineTo(R * 0.64, -R * 0.36);
        g.lineTo(-R * 0.64, -R * 0.36);
        g.lineTo(-R * 0.74, -R * 0.28);
        g.lineTo(-R * 0.76, R * 0.8);
        g.closePath();
        fillStroke();
        hairShine(g, R, hc, OL);
        // fringe strands
        g.strokeStyle = hexMul(hc === "#141018" ? "#3a3550" : hc, 1.35);
        g.lineWidth = OL * 0.35;
        g.beginPath();
        for (const x of [-0.36, -0.08, 0.2, 0.46]) {
          g.moveTo(R * x, -R * 0.66);
          g.lineTo(R * (x + 0.02), -R * 0.4);
        }
        g.stroke();
        g.strokeStyle = ink;
        break;
      }
      case "anime":
      case "twintails": {
        g.fillStyle = hc;
        // crown
        g.beginPath();
        g.moveTo(-R * 1.06, R * 0.1);
        g.quadraticCurveTo(-R * 1.12, -R * 1.12, 0, -R * 1.12);
        g.quadraticCurveTo(R * 1.12, -R * 1.12, R * 1.06, R * 0.1);
        g.lineTo(R * 0.86, -R * 0.5);
        // pointed bangs, swept a little to the right (tip x, tip y) pairs between valleys
        const tips: [number, number][] = [
          [0.74, -0.34],
          [0.5, -0.29],
          [0.24, -0.37],
          [-0.04, -0.27],
          [-0.32, -0.33],
          [-0.58, -0.26],
          [-0.8, -0.38],
        ];
        const valleys = [0.62, 0.38, 0.1, -0.18, -0.46, -0.7, -0.88];
        tips.forEach(([tx, ty], i) => {
          g.quadraticCurveTo(R * (tx + 0.06), R * (ty - 0.2), R * tx, R * ty);
          g.quadraticCurveTo(R * (tx - 0.04), R * (ty - 0.22), R * valleys[i], -R * 0.56);
        });
        g.closePath();
        fillStroke();
        // long side locks over the shoulders, pointed tips, a slight outward curve
        for (const sx of [-1, 1]) {
          g.beginPath();
          g.moveTo(sx * R * 1.06, -R * 0.2);
          g.quadraticCurveTo(sx * R * 1.18, R * 0.7, sx * R * 1.02, R * 1.55);
          g.lineTo(sx * R * 0.9, R * 1.85);
          g.quadraticCurveTo(sx * R * 0.86, R * 1.2, sx * R * 0.74, R * 0.55);
          g.quadraticCurveTo(sx * R * 0.7, R * 0.1, sx * R * 0.8, -R * 0.3);
          g.closePath();
          fillStroke();
        }
        // ahoge: one springy strand on the crown
        g.beginPath();
        g.moveTo(R * 0.05, -R * 1.08);
        g.quadraticCurveTo(R * 0.12, -R * 1.5, R * 0.42, -R * 1.42);
        g.quadraticCurveTo(R * 0.16, -R * 1.34, R * 0.16, -R * 1.08);
        g.closePath();
        fillStroke();
        // glossy "angel ring" band across the crown + strand lines in the bangs
        g.save();
        g.strokeStyle = hc === "#141018" ? "rgba(150,165,225,0.5)" : "rgba(255,255,255,0.4)";
        g.lineCap = "round";
        g.lineWidth = OL * 0.85;
        for (const [a0, a1] of [
          [1.26, 1.38],
          [1.44, 1.56],
          [1.62, 1.72],
        ]) {
          g.beginPath();
          g.arc(0, -R * 0.3, R * 0.64, Math.PI * a0, Math.PI * a1);
          g.stroke();
        }
        g.lineWidth = OL * 0.35;
        g.strokeStyle = hexMul(hc === "#141018" ? "#3a3550" : hc, 1.4);
        g.beginPath();
        for (const x of [-0.5, -0.2, 0.12, 0.42]) {
          g.moveTo(R * x, -R * 0.72);
          g.quadraticCurveTo(R * (x + 0.04), -R * 0.5, R * (x + 0.02), -R * 0.3);
        }
        g.stroke();
        g.restore();
        if (spec.hair === "twintails") {
          // hair ties at the top of each tail
          for (const sx of [-1, 1]) {
            g.fillStyle = spec.accent ?? "#d8d4dc";
            g.beginPath();
            g.arc(sx * R * 0.92, -R * 0.72, R * 0.12, 0, Math.PI * 2);
            g.fill();
            g.stroke();
          }
        }
        g.strokeStyle = ink;
        break;
      }
      case "wolf": {
        // shaggy layered cap with choppy bangs and flicked sides
        g.fillStyle = hc;
        g.beginPath();
        g.moveTo(-R * 1.08, R * 0.42);
        g.lineTo(-R * 1.05, -R * 0.12);
        g.quadraticCurveTo(-R * 1.1, -R * 1.12, 0, -R * 1.1);
        g.quadraticCurveTo(R * 1.1, -R * 1.12, R * 1.05, -R * 0.12);
        g.lineTo(R * 1.08, R * 0.42);
        g.lineTo(R * 0.9, R * 0.2);
        g.lineTo(R * 0.84, R * 0.42);
        g.lineTo(R * 0.74, -R * 0.2);
        const xs = [0.62, 0.42, 0.22, 0, -0.22, -0.42, -0.62];
        xs.forEach((x, i) => g.lineTo(R * x, -R * (i % 2 ? 0.44 : 0.3)));
        g.lineTo(-R * 0.74, -R * 0.2);
        g.lineTo(-R * 0.84, R * 0.42);
        g.lineTo(-R * 0.9, R * 0.2);
        g.closePath();
        fillStroke();
        hairShine(g, R, hc, OL);
        g.strokeStyle = ink;
        break;
      }
      case "mohawk": {
        g.fillStyle = hc;
        g.beginPath();
        g.moveTo(-R * 0.22, -R * 0.9);
        for (let i = 0; i <= 6; i++) g.lineTo(-R * 0.22 + (i * R * 0.44) / 6, -R * (i % 2 ? 1.45 : 1.15));
        g.lineTo(R * 0.22, -R * 0.9);
        g.closePath();
        fillStroke();
        break;
      }
      default:
        break;
    }
  }
  const hatC = spec.hatColor ?? "#2b3a67";
  switch (spec.hat ?? "none") {
    case "cap":
    case "police": {
      g.fillStyle = hatC;
      g.beginPath();
      g.moveTo(-R * 0.98, -R * 0.3);
      g.quadraticCurveTo(-R * 0.95, -R * 1.12, 0, -R * 1.1);
      g.quadraticCurveTo(R * 0.95, -R * 1.12, R * 0.98, -R * 0.3);
      g.closePath();
      fillStroke();
      g.beginPath();
      g.moveTo(R * 0.4, -R * 0.36);
      g.quadraticCurveTo(R * 1.35, -R * 0.42, R * 1.45, -R * 0.22);
      g.quadraticCurveTo(R * 1.0, -R * 0.12, R * 0.4, -R * 0.24);
      g.closePath();
      fillStroke();
      if (spec.hatText) {
        g.fillStyle = "#ffd23f";
        g.font = `900 ${R * 0.36}px "Montserrat", "Arial Black", sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(spec.hatText, 0, -R * 0.72);
      }
      break;
    }
    case "beanie": {
      g.fillStyle = hatC;
      g.beginPath();
      g.moveTo(-R * 1.0, -R * 0.35);
      g.quadraticCurveTo(-R * 0.95, -R * 1.2, 0, -R * 1.18);
      g.quadraticCurveTo(R * 0.95, -R * 1.2, R * 1.0, -R * 0.35);
      g.closePath();
      fillStroke();
      g.beginPath();
      g.roundRect(-R * 1.04, -R * 0.5, R * 2.08, R * 0.26, R * 0.1);
      fillStroke();
      break;
    }
    case "tophat": {
      g.fillStyle = hatC;
      g.beginPath();
      g.roundRect(-R * 0.58, -R * 1.85, R * 1.16, R * 1.05, R * 0.06);
      fillStroke();
      g.beginPath();
      g.ellipse(0, -R * 0.82, R * 1.0, R * 0.16, 0, 0, Math.PI * 2);
      fillStroke();
      break;
    }
    case "hardhat":
    case "helmet": {
      g.fillStyle = spec.hat === "hardhat" ? spec.hatColor ?? "#ffc21a" : hatC;
      g.beginPath();
      g.moveTo(-R * 1.1, -R * 0.34);
      g.quadraticCurveTo(-R * 1.0, -R * 1.25, 0, -R * 1.22);
      g.quadraticCurveTo(R * 1.0, -R * 1.25, R * 1.1, -R * 0.34);
      g.closePath();
      fillStroke();
      break;
    }
    case "crown": {
      g.fillStyle = spec.hatColor ?? "#ffcc33";
      g.beginPath();
      g.moveTo(-R * 0.62, -R * 0.82);
      g.lineTo(-R * 0.7, -R * 1.42);
      g.lineTo(-R * 0.32, -R * 1.12);
      g.lineTo(0, -R * 1.5);
      g.lineTo(R * 0.32, -R * 1.12);
      g.lineTo(R * 0.7, -R * 1.42);
      g.lineTo(R * 0.62, -R * 0.82);
      g.closePath();
      fillStroke();
      break;
    }
    case "chef": {
      g.fillStyle = "#ffffff";
      for (const [x, y, r] of [
        [-R * 0.45, -R * 1.25, R * 0.42],
        [R * 0.45, -R * 1.25, R * 0.42],
        [0, -R * 1.45, R * 0.48],
      ]) {
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        fillStroke();
      }
      g.beginPath();
      g.roundRect(-R * 0.75, -R * 1.15, R * 1.5, R * 0.42, R * 0.1);
      fillStroke();
      break;
    }
    case "cowboy": {
      g.fillStyle = spec.hatColor ?? "#8b5a2b";
      g.beginPath();
      g.ellipse(0, -R * 0.74, R * 1.45, R * 0.2, 0, 0, Math.PI * 2);
      fillStroke();
      g.beginPath();
      g.roundRect(-R * 0.6, -R * 1.4, R * 1.2, R * 0.7, R * 0.25);
      fillStroke();
      break;
    }
    case "grad": {
      g.fillStyle = "#1b1b22";
      g.beginPath();
      g.moveTo(-R * 1.25, -R * 1.0);
      g.lineTo(0, -R * 1.35);
      g.lineTo(R * 1.25, -R * 1.0);
      g.lineTo(0, -R * 0.68);
      g.closePath();
      fillStroke();
      break;
    }
    case "fur": {
      // faux-fur trapper: fluffy dome + ear flaps (scalloped edges)
      const fc = hatC;
      const fluff = (x: number, y: number, rx: number, ry: number) => {
        g.beginPath();
        g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        g.fill();
      };
      g.fillStyle = hexMul(fc, 0.82);
      fluff(-R * 0.98, R * 0.12, R * 0.3, R * 0.5);
      fluff(R * 0.98, R * 0.12, R * 0.3, R * 0.5);
      g.fillStyle = fc;
      g.beginPath();
      g.ellipse(0, -R * 0.62, R * 1.12, R * 0.62, 0, Math.PI, 0);
      g.lineTo(R * 1.12, -R * 0.5);
      g.lineTo(-R * 1.12, -R * 0.5);
      g.closePath();
      g.fill();
      for (let i = 0; i < 11; i++) {
        const a = Math.PI + (i / 10) * Math.PI;
        fluff(Math.cos(a) * R * 1.1, -R * 0.62 + Math.sin(a) * R * 0.6, R * 0.14, R * 0.12);
      }
      g.fillStyle = hexMul(fc, 1.12);
      for (let i = 0; i < 9; i++) fluff(-R * 1.05 + (i * R * 2.1) / 8, -R * 0.5 + Math.sin(i * 2.1) * R * 0.03, R * 0.16, R * 0.12);
      g.strokeStyle = hexMul(fc, 0.6);
      g.lineWidth = OL * 0.35;
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const x = -R * 0.7 + i * R * 0.28;
        g.moveTo(x, -R * 0.95);
        g.lineTo(x + R * 0.05, -R * 0.75);
      }
      g.stroke();
      break;
    }
    case "headband": {
      g.fillStyle = hatC;
      g.beginPath();
      g.roundRect(-R * 1.0, -R * 0.62, R * 2.0, R * 0.2, R * 0.08);
      fillStroke();
      break;
    }
    default:
      break;
  }
}


/** Hand-held props drawn in the same ink style (anchored at the hand dot). */
export function drawItem(g: Ctx, it: Item, at: V, R: number, ink: string, OL: number) {
  const [x, y] = at;
  const c = it.color;
  g.save();
  g.translate(x, y);
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.7;
  g.lineJoin = "round";
  const box = (bx: number, by: number, w: number, h: number, fill: string, r = 6) => {
    g.fillStyle = fill;
    g.beginPath();
    g.roundRect(bx, by, w, h, r);
    g.fill();
    g.stroke();
  };
  switch (it.kind) {
    case "cup":
      box(-22, -58, 44, 58, c ?? "#ffffff", 6);
      g.fillStyle = "#2b2b2b";
      g.fillRect(-22, -42, 44, 10);
      break;
    case "phone":
      box(-20, -70, 40, 74, c ?? "#26262c", 8);
      g.fillStyle = "#7fd3ff";
      g.fillRect(-14, -62, 28, 54);
      break;
    case "magnifier":
      g.lineWidth = OL * 1.2;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-36, -36);
      g.stroke();
      g.fillStyle = "rgba(190,230,255,0.75)";
      g.lineWidth = OL * 0.9;
      g.beginPath();
      g.arc(-60, -60, 34, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      break;
    case "bag":
      g.fillStyle = c ?? "#c98a3d";
      g.beginPath();
      g.ellipse(0, 46, 52, 56, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(-14, -4);
      g.lineTo(14, -4);
      g.stroke();
      g.fillStyle = ink;
      g.font = `900 46px "Montserrat", "Arial Black", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(it.text ?? "$", 0, 50);
      break;
    case "sign": {
      g.lineWidth = OL * 1.0;
      g.beginPath();
      g.moveTo(0, 30);
      g.lineTo(0, -150);
      g.stroke();
      box(-105, -250, 210, 110, c ?? "#ffffff", 10);
      if (it.text) {
        g.fillStyle = "#d8303a";
        g.font = `900 ${Math.min(46, 330 / Math.max(4, it.text.length))}px "Montserrat", "Arial Black", sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(it.text, 0, -195);
      }
      break;
    }
    case "briefcase":
      box(-60, -10, 120, 86, c ?? "#5b3a24", 8);
      g.beginPath();
      g.moveTo(-20, -10);
      g.lineTo(-20, -24);
      g.lineTo(20, -24);
      g.lineTo(20, -10);
      g.stroke();
      break;
    case "laptop":
      box(-80, -70, 160, 100, c ?? "#c9ced6", 8);
      g.fillStyle = "#2b3550";
      g.fillRect(-68, -60, 136, 76);
      break;
    case "pen":
    case "pointer":
      g.lineWidth = OL * 0.9;
      g.strokeStyle = c ?? ink;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(it.kind === "pointer" ? -120 : -40, it.kind === "pointer" ? -120 : -46);
      g.stroke();
      break;
    case "flag":
      g.lineWidth = OL;
      g.beginPath();
      g.moveTo(0, 30);
      g.lineTo(0, -250);
      g.stroke();
      box(0, -250, 150, 96, c ?? "#e23d3d", 4);
      break;
    case "trophy":
      g.fillStyle = c ?? "#ffcc33";
      g.beginPath();
      g.moveTo(-38, -110);
      g.lineTo(38, -110);
      g.quadraticCurveTo(36, -40, 0, -36);
      g.quadraticCurveTo(-36, -40, -38, -110);
      g.closePath();
      g.fill();
      g.stroke();
      box(-26, -36, 52, 30, c ?? "#ffcc33", 4);
      break;
    case "money":
      for (let i = 0; i < 3; i++) box(-56 + i * 6, -40 - i * 10, 112, 56, "#7cc576", 6);
      g.fillStyle = "#2f6b2a";
      g.font = `900 34px "Montserrat", "Arial Black", sans-serif`;
      g.textAlign = "center";
      g.fillText("$", -44 + 12, -10 - 20);
      break;
    case "coin":
      g.fillStyle = "#ffcc33";
      g.beginPath();
      g.arc(0, -30, 34, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      break;
    case "book":
      box(-56, -76, 112, 84, c ?? "#3d6fd6", 6);
      break;
    case "sword":
      g.lineWidth = OL * 0.8;
      g.fillStyle = "#dfe6ee";
      g.beginPath();
      g.moveTo(-10, -20);
      g.lineTo(-10, -260);
      g.lineTo(0, -290);
      g.lineTo(10, -260);
      g.lineTo(10, -20);
      g.closePath();
      g.fill();
      g.stroke();
      box(-36, -26, 72, 16, c ?? "#8b5a2b", 4);
      break;
    case "torch":
      box(-10, -120, 20, 130, "#8b5a2b", 4);
      g.fillStyle = "#ffb02e";
      g.beginPath();
      g.moveTo(0, -200);
      g.quadraticCurveTo(36, -150, 0, -118);
      g.quadraticCurveTo(-36, -150, 0, -200);
      g.fill();
      break;
    case "wrench":
      g.lineWidth = OL * 1.4;
      g.strokeStyle = "#9aa4b0";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-70, -70);
      g.stroke();
      g.lineWidth = OL * 0.7;
      g.strokeStyle = ink;
      g.beginPath();
      g.arc(-80, -80, 22, 0, Math.PI * 2);
      g.stroke();
      break;
    case "mic":
      box(-14, -40, 28, 60, "#2b2b2b", 8);
      g.fillStyle = "#9aa4b0";
      g.beginPath();
      g.arc(0, -56, 26, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      break;
    case "stamp":
      // rubber stamp gripped by its knob: wooden neck, block, red rubber face (~86 units below the hand)
      box(-10, 2, 20, 44, "#a06a35", 5);
      box(-46, 42, 92, 30, c ?? "#5b3a24", 7);
      box(-42, 70, 84, 14, "#d0312d", 3);
      g.fillStyle = "#8b5a2b";
      g.beginPath();
      g.arc(0, 2, 18, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      // the gripping hand sits on top of the knob
      g.fillStyle = ink;
      g.beginPath();
      g.arc(0, -6, R * 0.088, 0, Math.PI * 2);
      g.fill();
      break;
    case "handset": {
      // 1920s handset: the hand at the ear holds the handle, earpiece toward the head, mouthpiece by the mouth
      const sx = it.hand === "L" ? -1 : 1;
      g.lineWidth = OL * 1.6;
      g.beginPath();
      g.moveTo(sx * -8, -22);
      g.quadraticCurveTo(sx * -16, 34, sx * -58, 86);
      g.stroke();
      g.fillStyle = c ?? "#26262c";
      g.lineWidth = OL * 0.7;
      g.beginPath();
      g.ellipse(sx * -14, -36, 22, 27, sx * 0.35, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.beginPath();
      g.ellipse(sx * -64, 92, 22, 16, sx * -0.6, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.lineWidth = OL * 0.45;
      g.beginPath();
      g.moveTo(sx * -60, 106);
      for (let i = 0; i < 7; i++) g.quadraticCurveTo(sx * (-46 + (i % 2 ? -24 : 24)), 116 + i * 18, sx * -50, 124 + i * 18);
      g.stroke();
      break;
    }
    case "letter":
      // a sheet of letterhead held up by its corner: crest band, text lines, red wax seal
      box(-10, -170, 150, 196, c ?? "#fbf7ee", 4);
      g.fillStyle = "#22305a";
      g.fillRect(4, -152, 122, 14);
      g.fillStyle = "#9aa0aa";
      for (let i = 0; i < 6; i++) g.fillRect(8, -122 + i * 18, i === 5 ? 70 : 114, 6);
      g.fillStyle = "#c0262f";
      g.beginPath();
      g.arc(98, -6, 17, 0, Math.PI * 2);
      g.fill();
      break;
  }
  g.restore();
}

/** Pinned chest badge: rounded card, coloured rim, ink outline, 1-2 lines of bold text (auto-fit). */
function drawBadge(g: Ctx, b: NonNullable<StickSpec["badge"]>, p: V, lean: number, ink: string, OL: number) {
  const s = b.scale ?? 1;
  const words = b.text.split(/\s+/);
  const lines = words.length >= 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [b.text];
  const w = 150;
  const lh = 30;
  const h = lines.length * lh + 22;
  g.save();
  g.translate(p[0], p[1]);
  g.rotate(lean - 0.07);
  g.scale(s, s);
  g.fillStyle = b.bg ?? "#22305a";
  g.beginPath();
  g.roundRect(-w / 2, -h / 2, w, h, 12);
  g.fill();
  g.strokeStyle = b.border ?? "#FFD43B";
  g.lineWidth = 6;
  g.beginPath();
  g.roundRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 8);
  g.stroke();
  g.strokeStyle = ink;
  g.lineWidth = OL * 0.55;
  g.beginPath();
  g.roundRect(-w / 2, -h / 2, w, h, 12);
  g.stroke();
  g.fillStyle = b.fg ?? "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 27;
  const fit = () => {
    g.font = `900 ${size}px "Montserrat", "Arial Black", sans-serif`;
    return Math.max(...lines.map((l) => g.measureText(l).width));
  };
  while (fit() > w - 22 && size > 12) size -= 1;
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + 1));
  g.restore();
}

/** Long hair falling behind the shoulders (head frame; drawn before the body so the torso and arms sit in front). */
function drawBackHair(g: Ctx, R: number, spec: StickSpec, ink: string, OL: number) {
  const hc = spec.hairColor ?? "#141018";
  g.fillStyle = hc;
  g.strokeStyle = ink;
  g.lineWidth = OL;
  g.beginPath();
  if (spec.hair === "anime") {
    // waist-length, a little volume at the sides, three pointed ends
    g.moveTo(-R * 1.06, -R * 0.2);
    g.quadraticCurveTo(-R * 1.1, -R * 1.1, 0, -R * 1.1);
    g.quadraticCurveTo(R * 1.1, -R * 1.1, R * 1.06, -R * 0.2);
    g.quadraticCurveTo(R * 1.28, R * 1.2, R * 1.12, R * 2.55);
    g.lineTo(R * 0.78, R * 2.25);
    g.lineTo(R * 0.4, R * 2.75);
    g.lineTo(R * 0.06, R * 2.3);
    g.lineTo(-R * 0.3, R * 2.8);
    g.lineTo(-R * 0.66, R * 2.3);
    g.lineTo(-R * 1.12, R * 2.6);
    g.quadraticCurveTo(-R * 1.28, R * 1.2, -R * 1.06, -R * 0.2);
  } else if (spec.hair === "twintails") {
    // the back of the head + two high tails falling past the shoulders
    g.ellipse(0, -R * 0.1, R * 1.08, R * 1.02, 0, 0, Math.PI * 2);
    for (const sx of [-1, 1]) {
      g.moveTo(sx * R * 0.9, -R * 0.75);
      g.quadraticCurveTo(sx * R * 1.9, -R * 0.3, sx * R * 1.55, R * 1.6);
      g.lineTo(sx * R * 1.3, R * 2.1);
      g.quadraticCurveTo(sx * R * 1.36, R * 0.9, sx * R * 0.95, -R * 0.25);
      g.closePath();
    }
  } else if (spec.hair === "hime") {
    // straight, blunt-cut at mid-back
    g.moveTo(-R * 1.03, -R * 0.2);
    g.quadraticCurveTo(-R * 1.05, -R * 1.05, 0, -R * 1.05);
    g.quadraticCurveTo(R * 1.05, -R * 1.05, R * 1.03, -R * 0.2);
    g.quadraticCurveTo(R * 0.98, R * 1.3, R * 0.84, R * 2.0);
    g.lineTo(R * 0.6, R * 2.08);
    g.lineTo(R * 0.3, R * 1.98);
    g.lineTo(-R * 0.3, R * 1.98);
    g.lineTo(-R * 0.6, R * 2.08);
    g.lineTo(-R * 0.84, R * 2.0);
    g.quadraticCurveTo(-R * 0.98, R * 1.3, -R * 1.03, -R * 0.2);
  } else {
    // wolf: shoulder length, choppy ends
    g.moveTo(-R * 1.06, -R * 0.2);
    g.quadraticCurveTo(-R * 1.08, -R * 1.08, 0, -R * 1.08);
    g.quadraticCurveTo(R * 1.08, -R * 1.08, R * 1.06, -R * 0.2);
    g.lineTo(R * 1.08, R * 1.3);
    for (let i = 1; i <= 6; i++) g.lineTo(R * (1.08 - (i * 2.16) / 6), R * (i % 2 ? 1.12 : 1.36));
  }
  g.closePath();
  g.fill();
  g.stroke();
  // a few long strand lines for texture
  g.strokeStyle = hexMul(hc === "#141018" ? "#3a3550" : hc, 1.25);
  g.lineWidth = OL * 0.35;
  g.beginPath();
  const bottom = spec.hair === "hime" ? R * 1.9 : spec.hair === "anime" ? R * 2.3 : spec.hair === "twintails" ? R * 1.6 : R * 1.15;
  if (spec.hair === "twintails") {
    g.strokeStyle = hexMul(hc === "#141018" ? "#3a3550" : hc, 1.25);
    g.lineWidth = OL * 0.35;
    g.beginPath();
    for (const sx of [-1, 1]) {
      g.moveTo(sx * R * 1.25, -R * 0.2);
      g.quadraticCurveTo(sx * R * 1.5, R * 0.6, sx * R * 1.42, bottom);
    }
    g.stroke();
    return;
  }
  for (const x of [-0.78, -0.5, 0.5, 0.78]) {
    g.moveTo(R * x, R * 0.6);
    g.lineTo(R * x * 0.96, bottom);
  }
  g.stroke();
}

/** A cool highlight arc on the crown (reads as glossy hair, especially on black). */
function hairShine(g: Ctx, R: number, hc: string, OL: number) {
  g.save();
  g.strokeStyle = hc === "#141018" ? "rgba(150,165,215,0.55)" : "rgba(255,255,255,0.35)";
  g.lineWidth = OL * 0.9;
  g.lineCap = "round";
  g.beginPath();
  g.arc(0, -R * 0.1, R * 0.82, Math.PI * 1.2, Math.PI * 1.45);
  g.stroke();
  g.lineWidth = OL * 0.5;
  g.beginPath();
  g.arc(0, -R * 0.1, R * 0.82, Math.PI * 1.52, Math.PI * 1.6);
  g.stroke();
  g.restore();
}

/** Big glossy anime eye: dark iris with a lighter lower glow, two catchlights, a thick winged upper lash line. */
function animeEye(g: Ctx, kind: string, x: number, y: number, sx: number, er: number, R: number, iris: string, skin: string, ink: string, OL: number) {
  const w = er * (kind === "wide" ? 2.3 : 1.75);
  const h = er * (kind === "wide" ? 2.9 : kind === "tiny" ? 1.6 : 2.5);
  const cy = y + er * 0.2;
  g.save();
  // white of the eye only for "wide" (shock); otherwise the iris fills the almond
  if (kind === "wide") {
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.ellipse(x, cy, w * 1.15, h * 0.95, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = OL * 0.4;
    g.stroke();
  }
  const ir = kind === "wide" ? 0.62 : 1;
  const grd = g.createLinearGradient(x, cy - h, x, cy + h);
  grd.addColorStop(0, ink);
  grd.addColorStop(0.55, iris);
  grd.addColorStop(1, hexMul(iris, 1.9));
  g.fillStyle = grd;
  g.beginPath();
  g.ellipse(x, cy, w * ir, h * ir * (kind === "lidded" ? 0.92 : 1), 0, 0, Math.PI * 2);
  g.fill();
  // pupil
  g.fillStyle = ink;
  g.beginPath();
  g.ellipse(x, cy - h * 0.08 * ir, w * 0.42 * ir, h * 0.46 * ir, 0, 0, Math.PI * 2);
  g.fill();
  // catchlights
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.ellipse(x - w * 0.32 * ir, cy - h * 0.38 * ir, w * 0.34 * ir, h * 0.26 * ir, -0.3, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(x + w * 0.38 * ir, cy + h * 0.42 * ir, w * 0.14 * ir, 0, Math.PI * 2);
  g.fill();
  // lids: "lidded" (smug, unimpressed) covers the top third with a straight-ish lid; "sad" droops the outer end
  const top = cy - h * ir;
  g.fillStyle = "rgba(0,0,0,0)";
  g.strokeStyle = ink;
  g.lineCap = "round";
  g.lineWidth = OL * 0.85;
  g.beginPath();
  if (kind === "lidded") {
    const ly = cy - h * 0.25;
    g.fillStyle = skin;
    g.moveTo(x - w * 1.2, ly);
    g.lineTo(x + w * 1.2, ly - sx * er * 0.1);
    g.lineTo(x + w * 1.2, top - er);
    g.lineTo(x - w * 1.2, top - er);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(x - w * 1.15, ly);
    g.quadraticCurveTo(x, ly - er * 0.3, x + w * 1.15, ly - sx * er * 0.1);
    g.lineTo(x + sx * w * 1.7, ly - er * 0.55);
  } else {
    const droop = kind === "sad" ? er * 0.35 : 0;
    g.moveTo(x - sx * w * 1.05, top + h * 0.35 + (sx < 0 ? 0 : 0));
    g.quadraticCurveTo(x, top - er * 0.35, x + sx * w * 1.1, top + h * 0.25 + droop);
    // the wing
    g.lineTo(x + sx * w * 1.75, top - er * 0.05 + droop);
  }
  g.stroke();
  // two lower lash marks
  g.lineWidth = OL * 0.35;
  g.beginPath();
  g.moveTo(x + sx * w * 0.6, cy + h * 0.95 * ir);
  g.lineTo(x + sx * w * 0.85, cy + h * 1.12 * ir);
  g.stroke();
  g.restore();
}
