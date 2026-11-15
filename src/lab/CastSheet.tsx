// 2D cast sheet: every preset character with a different face/pose (fast look-dev for the character art).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { drawStick, FACES, POSES } from "../styles/stickworld/draw";
import { CAST } from "../styles/stickworld/cast";
import { font } from "../core/fonts";

const ENTRIES: [string, string, string, any?][] = [
  ["lead", "panic", "scared"],
  ["recruiter", "grin", "point", { kind: "sign", text: "WE'RE HIRING!" }],
  ["hacker", "evil", "handsHips"],
  ["agent", "worried", "holdOne", { kind: "magnifier" }],
  ["leadF", "joy", "armsUp"],
  ["suit", "smug", "crossArms"],
  ["scientist", "thinking", "think"],
  ["king", "angry", "point"],
  ["kid", "starstruck", "cheer"],
  ["grandpa", "sleepy", "relaxed", { kind: "cup" }],
  ["worker", "determined", "carry", { kind: "wrench" }],
  ["customerB", "love", "wave"],
];

const Cell: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [who, face, pose, item] = ENTRIES[i];
  useEffect(() => {
    const c = ref.current!;
    drawStick(c.getContext("2d")!, c.width, c.height, CAST[who], POSES[pose], FACES[face], { item: item ?? null, blink: 0 });
  }, [f, who, face, pose, item]);
  return (
    <div style={{ width: 360, height: 640, position: "relative", background: i % 2 ? "#cfe6ff" : "#ffe9c7" }}>
      <canvas ref={ref} width={360} height={600} style={{ position: "absolute", left: 0, top: 10 }} />
      <div style={{ position: "absolute", bottom: 6, width: "100%", textAlign: "center", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 22 }}>
        {who} · {face} · {pose}
      </div>
    </div>
  );
};

export const CastSheet: React.FC = () => {
  font("Montserrat");
  return (
    <AbsoluteFill style={{ background: "#333", display: "flex", flexWrap: "wrap" }}>
      {ENTRIES.map((_, i) => (
        <Cell key={i} i={i} />
      ))}
    </AbsoluteFill>
  );
};
