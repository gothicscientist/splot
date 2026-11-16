// Tiff hero still: one large standing pose for quick approval of the character design.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FACES, POSES } from "../styles/stickworld/draw";
import { drawTiff } from "../styles/stickworld/tiff";
import { CAST } from "../styles/stickworld/cast";

export const TiffHero: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  useEffect(() => {
    const c = ref.current!;
    drawTiff(c.getContext("2d")!, c.width, c.height, CAST.tiff, POSES.relaxed, FACES.happy, { blink: 0 });
  }, [f]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#bfe3ff, #fbe4ef)" }}>
      <canvas ref={ref} width={1250} height={2083} style={{ position: "absolute", left: -85, top: -250, width: 1250, height: 2083 }} />
    </AbsoluteFill>
  );
};
