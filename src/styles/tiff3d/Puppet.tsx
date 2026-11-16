// <TiffPuppet>: brings the single 3D-anime render of Tiff (v5 cut-out) to life with a GPU mesh warp, Live2D-style:
// breathing, a rigid body sway and bounce (the head and neck never deform), hair sway on the long left lock, and blinks (swaps to a
// painted closed-eyes texture). Everything is a pure function of the frame (no deltas, no Date).
//
//   <TiffPuppet h={1500} cx={540} feet={1900} talk={s.speaking(["b01"])} mood="happy" />
//
// Landmarks are in cut-out pixels (593 x 1451): neck pivot (330, 245), chin y ~215, waist y ~480.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { blink as blinkAt } from "../../core/anim";

const W = 593;
const H = 1451;
const fl = (n: number) => n.toFixed(1); // GLSL float literal

const VERT = /* glsl */ `
uniform float uBreath, uSway, uHair, uBob;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec2 p = vec2(uv.x * ${fl(W)}, (1.0 - uv.y) * ${fl(H)});       // image coords, y down
  // breathing: the chest between neck (250) and waist (480) rises a little
  float yb = clamp(p.y, 250.0, 480.0);
  p.y -= (480.0 - yb) * uBreath;
  // hair: the long lock on the left sways, more toward its tips
  float lock = (1.0 - smoothstep(150.0, 215.0, p.x)) * smoothstep(260.0, 980.0, p.y);
  p.x += uHair * lock * (0.4 + 0.6 * smoothstep(400.0, 980.0, p.y));
  // whole-body sway around the feet
  vec2 pf = vec2(${fl(W / 2)}, ${fl(H)});
  vec2 e = p - pf;
  p = pf + vec2(e.x * cos(uSway) - e.y * sin(uSway), e.x * sin(uSway) + e.y * cos(uSway));
  p.y -= uBob;   // rigid bounce (whole figure, nothing stretches)
  vec3 pos = vec3(p.x - ${fl(W / 2)}, ${fl(H)} - p.y, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;
const FRAG = /* glsl */ `
uniform sampler2D uTex, uTexClosed;
uniform float uBlink;
varying vec2 vUv;
void main() {
  vec4 a = texture2D(uTex, vUv);
  vec4 b = texture2D(uTexClosed, vUv);
  vec4 c = mix(a, b, uBlink);
  if (c.a < 0.02) discard;
  gl_FragColor = c;
}`;

/** load both textures once, holding the render until they are ready */
function useTextures() {
  const [tex, setTex] = useState<[THREE.Texture, THREE.Texture] | null>(null);
  const [handle] = useState(() => delayRender("tiff puppet textures"));
  useEffect(() => {
    const L = new THREE.TextureLoader();
    const load = (u: string) => new Promise<THREE.Texture>((res, rej) => L.load(u, res, undefined, rej));
    Promise.all([load(staticFile("img/tiff-love-letter/tiff.png")), load(staticFile("img/tiff-love-letter/tiff-closed.png"))]).then(([a, b]) => {
      for (const t of [a, b]) {
        t.colorSpace = THREE.NoColorSpace; // pass sRGB bytes straight through (raw shader, no output encoding)
        t.anisotropy = 8;
        t.minFilter = THREE.LinearMipmapLinearFilter;
      }
      setTex([a, b]);
      continueRender(handle);
    });
  }, [handle]);
  return tex;
}

export type PuppetMood = "calm" | "happy" | "shocked" | "sad";

export const TiffPuppet: React.FC<{
  /** on-screen height of the figure in px (1080x1920 frame) */
  h: number;
  /** centre x and soles y in frame px */
  cx: number;
  feet: number;
  /** spans (local frames) when she is speaking: livelier head motion */
  talk?: { s: number; e: number }[];
  mood?: PuppetMood;
  /** extra one-off head tilt (radians) and a shake amount, e.g. on a shock */
  tilt?: number;
  shake?: number;
  seed?: number;
}> = ({ h, cx, feet, talk = [], mood = "calm", tilt = 0, shake = 0, seed = 3 }) => {
  const f = useLocalFrame();
  const { width, height, fps } = useVideoConfig();
  const tex = useTextures();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uTexClosed: { value: null },
          uBlink: { value: 0 },
          uBreath: { value: 0 },
          uBob: { value: 0 },
          uSway: { value: 0 },
          uHair: { value: 0 },
        },
      }),
    [],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, 90, 220), []);
  const speaking = talk.some((r) => f >= r.s && f < r.e);
  const t = f / fps;
  const energy = mood === "shocked" ? 1.6 : mood === "happy" ? 1.2 : mood === "sad" ? 0.6 : 1;
  const u = mat.uniforms;
  if (tex) {
    u.uTex.value = tex[0];
    u.uTexClosed.value = tex[1];
  }
  // the head and neck never deform: only rigid whole-body motion + breathing + hair
  u.uBreath.value = 0.006 * (0.5 + 0.5 * Math.sin(t * 2.2));
  u.uSway.value = Math.sin(t * 0.75 + seed * 0.5) * 0.008 * energy + tilt * 0.25;
  u.uBob.value = (speaking ? Math.max(0, Math.sin(t * 5.0)) * 6 : 0) + (shake ? Math.abs(Math.sin(f * 0.9)) * shake * 400 : 0);
  u.uHair.value = Math.sin(t * 1.4 + 0.6) * 7 + Math.sin(t * 2.3) * 2.5;
  const bl = blinkAt(f, seed, fps);
  u.uBlink.value = mood === "shocked" ? 0 : bl > 0.5 ? 1 : 0;

  const k = h / H; // px per texture px
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <ThreeCanvas width={width} height={height} orthographic flat gl={{ antialias: true, alpha: true, premultipliedAlpha: false }} camera={{ left: -width / 2, right: width / 2, top: height / 2, bottom: -height / 2, near: -10, far: 10, position: [0, 0, 5], zoom: 1 }}>
        <mesh geometry={geo} material={mat} position={[cx - width / 2, height / 2 - feet, 0]} scale={[k, k, 1]} />
      </ThreeCanvas>
    </div>
  );
};
