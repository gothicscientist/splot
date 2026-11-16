// Tiff model sheet: the lead in 16 pose/face combos (look-dev for tiff.ts; walk frames show the cycle).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FACES, POSES, Item, Pose } from "../styles/stickworld/draw";
import { drawTiff, tiffWalkPose } from "../styles/stickworld/tiff";
import { CAST } from "../styles/stickworld/cast";
import { font } from "../core/fonts";

const ENTRIES: [string, string, string | Pose, Item?, boolean?][] = [
  ["hero", "happy", "idle"],
  ["smug", "smug", "handsHips"],
  ["wave", "grin", "wave"],
  ["joy", "joy", "armsUp"],
  ["thinking", "thinking", "think"],
  ["shocked", "shocked", "scared"],
  ["love", "love", "presentBoth"],
  ["unimpressed", "unimpressed", "crossArms"],
  ["walk 0.25", "happy", tiffWalkPose(0.25)],
  ["walk 0.75", "happy", tiffWalkPose(0.75)],
  ["phone", "happy", "readPhone", { kind: "phone" }],
  ["point (flip)", "determined", "point", undefined, true],
  ["laugh", "joy", "shrug"],
  ["starstruck", "starstruck", "cheer"],
  ["crying", "crying", "facepalm"],
  ["evil", "evil", "handsHips", undefined, true],
];

const Cell: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [label, face, pose, item, flip] = ENTRIES[i];
  useEffect(() => {
    const c = ref.current!;
    const p = typeof pose === "string" ? POSES[pose] : pose;
    drawTiff(c.getContext("2d")!, c.width, c.height, CAST.tiff, p, FACES[face], { item: item ?? null, blink: 0, flip, talk: label === "laugh" ? 0.7 : 0 });
  }, [f, face, pose, item, flip, label]);
  return (
    <div style={{ width: 360, height: 640, position: "relative", background: i % 2 ? "#cfe6ff" : "#ffe3ea" }}>
      <canvas ref={ref} width={360} height={600} style={{ position: "absolute", left: 0, top: 10 }} />
      <div style={{ position: "absolute", bottom: 6, width: "100%", textAlign: "center", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 22 }}>
        {label}
      </div>
    </div>
  );
};

export const TiffSheet: React.FC = () => {
  font("Montserrat");
  return (
    <AbsoluteFill style={{ background: "#333", display: "flex", flexWrap: "wrap" }}>
      {ENTRIES.map((_, i) => (
        <Cell key={i} i={i} />
      ))}
    </AbsoluteFill>
  );
};
