// Tiff walk strip: 8 phases of one stride of the front-facing walk cycle (look-dev for tiffWalkPose).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FACES } from "../styles/stickworld/draw";
import { drawTiff, tiffWalkPose } from "../styles/stickworld/tiff";
import { CAST } from "../styles/stickworld/cast";

const Cell: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    drawTiff(c.getContext("2d")!, c.width, c.height, CAST.tiff, tiffWalkPose(i / 8), FACES.happy, { blink: 0 });
  }, [f, i]);
  return <canvas ref={ref} width={300} height={500} style={{ width: 300, height: 500, background: i % 2 ? "#cfe6ff" : "#ffe3ea" }} />;
};

export const TiffWalk: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "row" }}>
    {Array.from({ length: 8 }, (_, i) => (
      <Cell key={i} i={i} />
    ))}
  </AbsoluteFill>
);
