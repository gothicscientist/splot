// Sample: Live2D-style mesh-warp puppet of 3D-anime Tiff (v5) over the bedroom plate, with a moving 2.5D camera.
// 0-3 s idle (breath, blink, hair) + slow push; 3-5 s talking; 5-6 s shock punch-in; 6-8 s smug tilt.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { TiffPuppet } from "../styles/tiff3d/Puppet";
import { clamp, easeOut, invLerp, smootherstep } from "../core/anim";

export const TiffPuppetSample: React.FC = () => {
  const f = useCurrentFrame();
  const push = smootherstep(clamp(f / 240));
  const punch = easeOut(clamp(invLerp(150, 160, f))) * (1 - smootherstep(clamp(invLerp(185, 215, f))));
  const camScale = 1 + 0.08 * push + 0.35 * punch;
  const camX = -30 * push + Math.sin(f * 0.02) * 12;
  const mood = f >= 150 && f < 185 ? "shocked" : f >= 90 ? "happy" : "calm";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {/* background moves less than the character: depth parallax */}
      <AbsoluteFill style={{ transform: `translateX(${camX * 0.4}px) scale(${1.1 + 0.04 * push + 0.12 * punch})`, transformOrigin: "50% 40%" }}>
        <Img src={staticFile("img/tiff-love-letter/bedroom.jpg")} style={{ position: "absolute", width: 1280, height: 1920, left: -100, top: 0, filter: "blur(3px)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${camX}px) scale(${camScale})`, transformOrigin: "52% 22%" }}>
        <TiffPuppet h={1560} cx={540} feet={1930} mood={mood} talk={[{ s: 90, e: 150 }, { s: 195, e: 235 }]} tilt={f >= 185 ? 0.06 : 0} shake={f >= 150 && f < 160 ? 0.03 : 0} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
