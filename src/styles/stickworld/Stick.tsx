// <Stick>: a StickWorld character standing in the 3D world as a camera-facing, scene-lit card.
//
//   <Stick spec={CAST.dev} at={[0, 0, 0]}
//          poses={[[0, "typing"], [s.hit("billion"), "scared"]]}
//          faces={[[0, "neutral"], [s.hit("billion"), "panic"]]}
//          path={[[s.at("walks"), [-3, 0, 0]], [s.at("door"), [1, 0, 0]]]}   // walks between keys
//          talking={s.speaking(["b04"])} />
//
// Pose keys blend over `blend` frames with a slight overshoot; face keys switch instantly (2D cartoon convention)
// with a 2-frame squash. Moving between path keys plays a planted walk cycle automatically.
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { backOut, blink, clamp, invLerp, smootherstep, talk as talkAmt } from "../../core/anim";
import { cardShade, blobMaterial, CARD_K } from "../../core/three/look/cardshade";
import { NOINK } from "../../core/three/look/ink";
import type { Vec3 } from "../../core/types";
import { drawStick, FACES, POSES, Face, Item, Pose, StickSpec, mixPose, walkPose, runPose } from "./draw";

export type StickProps = {
  spec: StickSpec;
  at?: Vec3;
  path?: [number, Vec3][];
  poses?: [number, string | Pose][];
  faces?: [number, string | Face][];
  items?: [number, Item | null][];
  height?: number;
  facing?: "left" | "right" | "auto";
  talking?: { s: number; e: number }[];
  seed?: number;
  blend?: number;
  /** pop in at this frame (squash-stretch entrance); hidden before */
  pop?: number;
  /** disappear at this frame */
  gone?: number;
  shadow?: boolean;
  run?: boolean;
  /** tilt/lean added on top of the pose (deg) */
  lean?: number;
  /** extra uniform scale */
  scale?: number;
};

const resolvePose = (p: string | Pose): Pose => (typeof p === "string" ? POSES[p] ?? POSES.idle : p);
const resolveFace = (p: string | Face): Face => (typeof p === "string" ? FACES[p] ?? FACES.neutral : p);

function poseAtFrame(keys: [number, string | Pose][], f: number, blend: number): Pose {
  if (!keys.length) return POSES.idle;
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  let i = 0;
  while (i + 1 < ks.length && f >= ks[i + 1][0]) i++;
  const cur = resolvePose(ks[i][1]);
  if (i === 0 && f < ks[0][0]) return cur;
  const prev = i > 0 ? resolvePose(ks[i - 1][1]) : cur;
  const t = invLerp(ks[i][0], ks[i][0] + blend, f);
  if (t >= 1 || i === 0) return i === 0 ? cur : t >= 1 ? cur : mixPose(prev, cur, backOut(t, 1.4));
  return mixPose(prev, cur, backOut(t, 1.4));
}
function lastKey<T>(keys: [number, T][], f: number, dflt: T): { v: T; since: number } {
  let v = dflt;
  let since = -999;
  for (const [k, x] of [...keys].sort((a, b) => a[0] - b[0])) if (f >= k) {
    v = x;
    since = f - k;
  }
  return { v, since };
}
const L3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** position + walk phase + heading from path keys (walks at ~1.4 m/s between keys) */
function pathAt(path: [number, Vec3][], f: number, fps: number) {
  const ks = [...path].sort((a, b) => a[0] - b[0]);
  if (!ks.length) return null;
  if (f <= ks[0][0]) return { pos: ks[0][1], moving: false, dist: 0, dir: 0 };
  let dist = 0;
  for (let i = 0; i + 1 < ks.length; i++) {
    const [fa, pa] = ks[i];
    const [fb, pb] = ks[i + 1];
    const seg = Math.hypot(pb[0] - pa[0], pb[2] - pa[2]);
    const travel = Math.max(1, Math.min(fb - fa, Math.round((seg / 1.4) * fps)));
    const start = fb - travel;
    if (f < fb) {
      if (f < start) return { pos: pa, moving: false, dist, dir: Math.sign(pb[0] - pa[0]) };
      const t = smootherstep(invLerp(start, fb, f));
      return { pos: L3(pa, pb, t), moving: true, dist: dist + seg * t, dir: Math.sign(pb[0] - pa[0]) };
    }
    dist += seg;
  }
  return { pos: ks[ks.length - 1][1], moving: false, dist, dir: 0 };
}

let blobTex: THREE.Texture | null = null;
const getBlobTex = () => {
  if (blobTex) return blobTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, "rgb(120,110,125)");
  grd.addColorStop(0.55, "rgb(175,168,180)");
  grd.addColorStop(1, "rgb(255,255,255)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  blobTex.colorSpace = THREE.SRGBColorSpace;
  return blobTex;
};

export const Stick: React.FC<StickProps> = ({
  spec,
  at = [0, 0, 0],
  path,
  poses = [[0, "idle"]],
  faces = [[0, "neutral"]],
  items = [],
  height,
  facing = "auto",
  talking = [],
  seed = spec.seed ?? 7,
  blend = 6,
  pop,
  gone,
  shadow = true,
  run = false,
  lean = 0,
  scale = 1,
}) => {
  const f = useLocalFrame();
  const { fps } = useVideoConfig();
  const { camera, size } = useThree();
  // card height: the figure fills ~78% of the card (headroom for hats), so a 2.2 m card = a ~1.72 m person
  const H = (height ?? (spec.build === "kid" ? 1.55 : spec.build === "tall" ? 2.35 : spec.build === "stout" ? 2.12 : 2.2)) * scale;
  const W = H * 0.6;
  const mesh = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const res = useRef({ k: 0 });
  const { canvas, tex, mat, geo, blobMat } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 1000;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    const mat = cardShade(new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    mat.alphaToCoverage = true;
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    const blobMat = blobMaterial(getBlobTex());
    return { canvas, tex, mat, geo, blobMat };
  }, []);

  // ---- state for this frame
  const visible = (pop === undefined || f >= pop) && (gone === undefined || f < gone);
  const pa = path ? pathAt(path, f, fps) : null;
  const pos: Vec3 = pa ? pa.pos : at;
  let pose = poseAtFrame(poses, f, blend);
  if (pa?.moving) {
    const phase = pa.dist / (run ? 1.6 : 0.8);
    pose = run ? runPose(phase) : walkPose(phase, 1, pose);
  }
  // idle breathing so a held pose is never frozen
  pose = { ...pose, bob: (pose.bob ?? 0) + Math.sin((f + seed * 13) * 0.18) * 2.2, lean: (pose.lean ?? 0) + lean };
  const fk = lastKey(faces, f, faces[0]?.[1] ?? "neutral");
  const face = resolveFace(fk.v);
  const faceSquash = fk.since >= 0 && fk.since < 3 ? [1.06, 0.97, 1.0][fk.since] : 1;
  const item = lastKey(items, f, null as Item | null).v;
  const tk = talkAmt(f, talking, fps);
  const bl = blink(f, seed, fps);
  const dir = facing === "auto" ? (pa?.dir ?? 0) : facing === "left" ? -1 : 1;
  const flip = dir < 0;
  const popS = pop !== undefined ? backOut(invLerp(pop, pop + 8, f), 2.4) : 1;

  useFrame(() => {
    const m = mesh.current;
    const gr = group.current;
    if (!m || !gr) return;
    // adaptive canvas resolution from the projected size of the card (keeps close-ups crisp)
    const cam = camera as THREE.PerspectiveCamera;
    const wp = new THREE.Vector3(pos[0], pos[1] + H * 0.5, pos[2]);
    const dist = Math.max(0.3, wp.distanceTo(cam.position));
    const px = (H / (2 * dist * Math.tan(((cam.fov ?? 40) * Math.PI) / 360))) * size.height;
    const want = px > 1500 ? 2.4 : px > 1000 ? 1.8 : px > 650 ? 1.25 : px > 380 ? 0.85 : 0.6;
    if (want !== res.current.k) {
      res.current.k = want;
      canvas.width = Math.round(600 * want);
      canvas.height = Math.round(1000 * want);
      tex.dispose();
      tex.image = canvas;
    }
    const g = canvas.getContext("2d")!;
    drawStick(g, canvas.width, canvas.height, spec, { ...pose, squash: (pose.squash ?? 1) * faceSquash }, face, { talk: tk, blink: bl, flip, item });
    tex.needsUpdate = true;
    CARD_K.uPx.value = size.height / 1920;
    // face the camera around the vertical axis only (cards stay upright)
    gr.position.set(...pos);
    const yaw = Math.atan2(cam.position.x - pos[0], cam.position.z - pos[2]);
    m.rotation.set(0, yaw, 0);
    m.scale.set(W * popS, H * (pop !== undefined ? clamp(0.6 + 0.4 * popS, 0, 1.2) : 1), 1);
  });

  return (
    <group ref={group} visible={visible}>
      <mesh ref={mesh} geometry={geo} material={mat} layers={NOINK} />
      {shadow ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={blobMat} layers={NOINK} renderOrder={1}>
          <planeGeometry args={[H * 0.3, H * 0.13]} />
        </mesh>
      ) : null}
    </group>
  );
};
