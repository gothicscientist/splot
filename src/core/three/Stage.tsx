// <Stage>: one toon-shaded 3D set inside a shot. Lights + sky + fog from a LOOK preset, a keyframed camera rig
// (glides, bursts, creeping holds, impact kicks), and the post chain:
//   RenderPass -> InkPass (world outlines, before the blur) -> lens blur pre + main (thin-lens DOF)
//   -> bloom (HDR emissives only) + Neutral tone map + colour grade.
// The composer is driven from our own priority-1 render callback (the R3F <EffectComposer> wrapper renders blank
// under Remotion with these versions; the raw composer works).
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode, BlendFunction } from "postprocessing";
import { InkPass, NOINK } from "./look/ink";
import { LensBlur } from "./look/lensblur";
import { GradeEffect, GRADES } from "./look/grade";
import { TONE, CHAR, untone } from "./look/shade";
import { LOOKS, LookName } from "./looks";
import { applyPose, CamKey, CamPose, poseAt } from "./camera";
import { useLocalFrame } from "../timeline";
import type { Vec3 } from "../types";

export { NOINK };

export type StageProps = {
  look?: LookName;
  /** camera keys (shot-local frames) or a function of the frame */
  cam: CamKey[] | ((f: number) => CamPose);
  kicks?: number[];
  kickAmp?: number;
  /** lens blur of things at infinity, px at 1080 wide (close-ups 12-16, mediums 10-12, wides 0) */
  dof?: number | ((f: number) => number);
  /** focus point (default: the camera's look target) */
  focus?: Vec3 | ((f: number) => Vec3);
  ink?: boolean;
  bloom?: boolean;
  grade?: boolean;
  sky?: boolean;
  /** override fog [near, far] in metres; null = no fog */
  fog?: [number, number] | null;
  /** shadow-camera box: centre + half size (m) */
  shadow?: { center?: Vec3; size?: number; mapSize?: number };
  /** push-in per frame for function cameras (key cameras set creep per key) */
  creep?: number;
  children?: React.ReactNode;
};

// ---------------------------------------------------------------- sky dome (vertical gradient, never inked)
const SkyDome: React.FC<{ top: string; hor: string }> = ({ top, hor }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { cTop: { value: new THREE.Color() }, cHor: { value: new THREE.Color() } },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }`,
        fragmentShader: `uniform vec3 cTop; uniform vec3 cHor; varying vec3 vDir;
          void main(){ float h = clamp(vDir.y, -0.2, 1.0); float t = smoothstep(-0.02, 0.55, h);
            vec3 c = mix(cHor, cTop, t); gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  // set synchronously: an effect would run after R3F already drew the first frame (white sky)
  untone(top, mat.uniforms.cTop.value);
  untone(hor, mat.uniforms.cHor.value);
  return (
    <mesh scale={450} layers={NOINK} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

// ---------------------------------------------------------------- lights + tone uniforms
const LookRig: React.FC<{ look: LookName; cam0: CamPose; shadow?: StageProps["shadow"]; fog?: [number, number] | null; sky: boolean }> = ({
  look,
  cam0,
  shadow,
  fog,
  sky,
}) => {
  const L = LOOKS[look];
  const { scene } = useThree();
  const sun = useMemo(() => new THREE.DirectionalLight("#ffffff", 1), []);
  const target = useMemo(() => new THREE.Object3D(), []);
  const center = shadow?.center ?? [0, 0, 0];
  const size = shadow?.size ?? 14;
  const mapSize = shadow?.mapSize ?? 2048;
  // camera-relative sun, frozen for the shot (from the first camera key)
  const fwd = new THREE.Vector3(cam0.look[0] - cam0.pos[0], 0, cam0.look[2] - cam0.pos[2]).normalize();
  if (!isFinite(fwd.x) || fwd.lengthSq() < 0.5) fwd.set(0, 0, -1);
  const az = (L.az * Math.PI) / 180;
  const el = (L.el * Math.PI) / 180;
  // az 0 = sun ahead of the camera (backlight): direction TOWARDS the sun
  const dirH = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -az);
  const toSun = new THREE.Vector3(dirH.x * Math.cos(el), Math.sin(el), dirH.z * Math.cos(el)).normalize();
  sun.position.set(center[0] + toSun.x * 60, center[1] + toSun.y * 60, center[2] + toSun.z * 60);
  target.position.set(...center);
  sun.target = target;
  sun.color.set(L.sunCol);
  sun.intensity = L.sunI;
  sun.castShadow = true;
  sun.shadow.mapSize.set(mapSize, mapSize);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -size;
  sc.right = size;
  sc.top = size;
  sc.bottom = -size;
  sc.near = 1;
  sc.far = 140;
  sc.updateProjectionMatrix();
  sun.shadow.bias = L.bias;
  sun.shadow.normalBias = L.normalBias;
  // tone uniforms (shared by every twoTone material and every character card)
  TONE.uLitCol.value.set(...L.lit);
  TONE.uShadeCol.value.set(...L.shade);
  TONE.uShadeLift.value.set(...L.lift);
  TONE.uLambert.value = L.lambert;
  TONE.uSideK.value = L.sideK;
  TONE.uTerm.value = L.term;
  TONE.uSat.value = look === "golden" || look === "dusk" ? 1.1 : 1.08;
  CHAR.uCharTint.value.set(...L.charTint);
  CHAR.uCharShade.value = L.charShade;
  CHAR.uGrad.value = L.charGrad;
  CHAR.uBodyGrad.value = L.bodyGrad;
  CHAR.uSideTint.value.set(...L.sideTint);
  const fogObj = useMemo(() => new THREE.Fog("#ffffff", 30, 300), []);
  if (fog === null) scene.fog = null;
  else {
    untone(L.fog, fogObj.color);
    fogObj.near = fog?.[0] ?? L.fogNear;
    fogObj.far = fog?.[1] ?? L.fogFar;
    scene.fog = fogObj;
  }
  scene.background = null;
  return (
    <>
      <primitive object={sun} />
      <primitive object={target} />
      <hemisphereLight args={[L.sky, L.ground, L.hemiI]} />
      {sky ? <SkyDome top={L.skyTop} hor={L.skyHor} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- camera + post
const fwdV = new THREE.Vector3();
const fpt = new THREE.Vector3();

const Rig: React.FC<{
  pose: CamPose;
  focus: Vec3 | null;
  dof: number;
  look: LookName;
  ink: boolean;
  bloom: boolean;
  grade: boolean;
}> = ({ pose, focus, dof, look, ink, bloom, grade }) => {
  const { gl, scene, camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.layers.enable(NOINK);
  applyPose(cam, pose);
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, cam));
    const inkPass = new InkPass(scene, cam);
    if (ink) composer.addPass(inkPass);
    const lens = new LensBlur({ maxCoC: 24, nearScale: 1.2 });
    composer.addPass(new EffectPass(cam, lens.pre));
    composer.addPass(new EffectPass(cam, lens.main));
    const effects: any[] = [];
    if (bloom) effects.push(new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 }));
    effects.push(new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }));
    const gradeFx = new GradeEffect(GRADES[LOOKS[look].grade], 1);
    if (grade) effects.push(gradeFx);
    composer.addPass(new EffectPass(cam, ...effects));
    return { composer, inkPass, lens, gradeFx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, cam, ink, bloom, grade]);
  useEffect(() => {
    fx.composer.setSize(size.width, size.height);
  }, [fx, size]);
  useEffect(() => () => {
    fx.composer.dispose();
    fx.inkPass.dispose();
  }, [fx]);
  // thin-lens focus: distance along the view axis to the focus point
  cam.getWorldDirection(fwdV);
  fpt.set(...(focus ?? pose.look));
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwdV));
  fx.lens.cInf = dof;
  useFrame(() => {
    applyPose(cam, pose);
    fx.composer.render(1 / 30);
  }, 1);
  return null;
};

export const Stage: React.FC<StageProps> = ({
  look = "day",
  cam,
  kicks = [],
  kickAmp,
  dof = 0,
  focus,
  ink = true,
  bloom = true,
  grade = true,
  sky = true,
  fog,
  shadow,
  creep = 0.0018,
  children,
}) => {
  const f = useLocalFrame();
  const { width, height } = useVideoConfig();
  let pose = typeof cam === "function" ? cam(f) : poseAt(cam, f, kicks, kickAmp);
  if (typeof cam === "function" && creep > 0) {
    const k = Math.min(0.16, Math.max(0, f) * creep);
    pose = { ...pose, pos: [pose.pos[0] + (pose.look[0] - pose.pos[0]) * k, pose.pos[1] + (pose.look[1] - pose.pos[1]) * k, pose.pos[2] + (pose.look[2] - pose.pos[2]) * k] };
  }
  const cam0 = typeof cam === "function" ? cam(0) : poseAt(cam, 0);
  const d = typeof dof === "function" ? dof(f) : dof;
  const fp = focus ? (typeof focus === "function" ? focus(f) : focus) : null;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      flat
      shadows
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: pose.fov, near: 0.1, far: 900, position: pose.pos }}
    >
      <LookRig look={look} cam0={cam0} shadow={shadow} fog={fog} sky={sky} />
      {children}
      <Rig pose={pose} focus={fp} dof={d} look={look} ink={ink} bloom={bloom} grade={grade} />
    </ThreeCanvas>
  );
};
