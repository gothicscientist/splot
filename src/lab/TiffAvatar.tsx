// Tiff profile picture: square upper-body portrait (head to waist), circle-safe framing, brand backdrop.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FACES, POSES } from "../styles/stickworld/draw";
import { drawTiff } from "../styles/stickworld/tiff";
import { CAST } from "../styles/stickworld/cast";

// the figure is drawn into a tall 600x1000-design canvas, then shown so that the head-to-waist band fills the square
const SCALE = 3.1; // canvas px per design unit
export const TiffAvatar: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    drawTiff(c.getContext("2d")!, c.width, c.height, CAST.tiff, POSES.relaxed, FACES.happy, { blink: 0 });
  }, [f]);
  // design y 150 (above the hair) .. ~500 (waist) maps onto the 1080 square
  const top = -150 * SCALE + 40;
  const left = (1080 - 600 * SCALE) / 2;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #fbe4ef 0%, #f2c7d3 45%, #a8c6e8 100%)" }}>
      <canvas ref={ref} width={600 * SCALE} height={1000 * SCALE} style={{ position: "absolute", left, top, width: 600 * SCALE, height: 1000 * SCALE }} />
    </AbsoluteFill>
  );
};
