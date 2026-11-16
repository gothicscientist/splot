// Tiff + side cast sheet: each character standing and in one expressive pose (look-dev for the anime figure kit).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FACES, POSES } from "../styles/stickworld/draw";
import { drawTiff } from "../styles/stickworld/tiff";
import { CAST } from "../styles/stickworld/cast";
import { font } from "../core/fonts";

const ENTRIES: [string, string, string, string][] = [
  ["tiff", "Tiff", "happy", "relaxed"],
  ["jake", "Jake (the ex)", "happy", "relaxed"],
  ["mia", "Mia (best friend)", "happy", "relaxed"],
  ["tiff", "Tiff", "smug", "handsHips"],
  ["jake", "Jake", "smug", "crossArms"],
  ["mia", "Mia", "evil", "crossArms"],
];

const Cell: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [who, label, face, pose] = ENTRIES[i];
  useEffect(() => {
    const c = ref.current!;
    drawTiff(c.getContext("2d")!, c.width, c.height, CAST[who], POSES[pose], FACES[face], { blink: 0 });
  }, [f, who, face, pose]);
  return (
    <div style={{ width: 480, height: 900, position: "relative", background: i % 2 ? "#cfe6ff" : "#ffe3ea" }}>
      <canvas ref={ref} width={480} height={800} style={{ position: "absolute", left: 0, top: 30 }} />
      <div style={{ position: "absolute", bottom: 10, width: "100%", textAlign: "center", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 30 }}>{label}</div>
    </div>
  );
};

export const TiffCast: React.FC = () => {
  font("Montserrat");
  return (
    <AbsoluteFill style={{ background: "#333", display: "flex", flexWrap: "wrap" }}>
      {ENTRIES.map((_, i) => (
        <Cell key={i} i={i} />
      ))}
    </AbsoluteFill>
  );
};
