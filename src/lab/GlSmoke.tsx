import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { EffectComposer, DepthOfField, Bloom, Vignette } from "@react-three/postprocessing";
import { PostTest } from "./PostTest";
import { PostRaw } from "./PostRaw";

const Box: React.FC<{ p: [number, number, number]; c: string; s?: number }> = ({ p, c, s = 1 }) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={[s, s, s]} />
    <meshToonMaterial color={c} />
  </mesh>
);

export const GlSmoke: React.FC<{fx?: number}> = ({fx = 0}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 1024;
    const g = c.getContext("2d")!;
    g.lineCap = "round"; g.lineJoin = "round";
    g.fillStyle = "#1fa38a"; g.strokeStyle = "#111"; g.lineWidth = 14;
    g.beginPath(); g.ellipse(256, 560, 120, 190, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    const grd = g.createRadialGradient(220, 230, 20, 256, 270, 190);
    grd.addColorStop(0, "#ffffff"); grd.addColorStop(1, "#e7e2da");
    g.fillStyle = grd; g.beginPath(); g.arc(256, 270, 170, 0, Math.PI * 2); g.fill(); g.stroke();
    g.lineWidth = 10; g.beginPath(); g.moveTo(200, 730); g.lineTo(190, 960); g.moveTo(312, 730); g.lineTo(322, 960); g.stroke();
    g.fillStyle = "#111"; g.beginPath(); g.arc(205, 270, 14, 0, 7); g.arc(305, 270, 14, 0, 7); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
  const camZ = interpolate(frame, [0, 59], [9, 6.5]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#87c5ff" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ position: [0, 2.2, camZ], fov: 40 }} gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }}>
        <color attach="background" args={["#9fd3ff"]} />
        <fog attach="fog" args={["#9fd3ff", 12, 30]} />
        <hemisphereLight args={["#ffffff", "#c9a27a", 0.9]} />
        <directionalLight position={[4, 8, 5]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshToonMaterial color="#e8b26a" />
        </mesh>
        <Box p={[-1.6, 0.5, -1]} c="#e3533c" />
        <Box p={[1.8, 0.75, -2.5]} c="#3d7be0" s={1.5} />
        <Box p={[0.4, 0.4, -6]} c="#ffd23f" s={0.8} />
        <mesh position={[0, 1.3, 0]}>
          <planeGeometry args={[1.3, 2.6]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
        {fx === 4 && <PostTest />}
        {fx === 5 && <PostRaw />}
        {fx === 1 && (<EffectComposer><Vignette offset={0.3} darkness={0.5} /></EffectComposer>)}
        {fx === 2 && (<EffectComposer multisampling={0}><DepthOfField focusDistance={0.012} focalLength={0.03} bokehScale={4} /></EffectComposer>)}
        {fx === 3 && (<EffectComposer multisampling={0}><Bloom intensity={0.4} luminanceThreshold={0.85} /><Vignette offset={0.3} darkness={0.5} /></EffectComposer>)}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
