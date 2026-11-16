// World -> screen: where a 3D point lands (px at 1080x1920) for a shot's camera keys at a shot-local frame. Use it to
// pin 2D overlays (tags, bubbles, arrows) to characters and props so they follow the camera move.
//   const [x, y] = screenAt(cams, s.f, [0.5, 1.8, 0.3]);   <Bubble at={...} x={x} y={y - 120} ... />
import * as THREE from "three";
import { applyPose, poseAt } from "./camera";
import type { CamKey } from "./camera";
import type { Vec3 } from "../types";

const _cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 900);
const _v = new THREE.Vector3();

export function screenAt(keys: CamKey[], f: number, p: Vec3, kicks: number[] = []): [number, number] {
  const pose = poseAt(keys, f, kicks);
  _cam.fov = pose.fov;
  _cam.aspect = 1080 / 1920;
  _cam.updateProjectionMatrix();
  applyPose(_cam, pose);
  _v.set(p[0], p[1], p[2]).project(_cam);
  return [((_v.x + 1) / 2) * 1080, ((1 - _v.y) / 2) * 1920];
}
