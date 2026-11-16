// Tiff's world side cast: frame 0 = 2D sheet (every SCENE_CAST preset with an expression), frame 1 = 3D lineup at a
// show (club look) with Tiff, to check that the stick cast and the shaped lead read together.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { drawStick, FACES, POSES } from "../styles/stickworld/draw";
import { drawTiff } from "../styles/stickworld/tiff";
import { CAST, SCENE_CAST } from "../styles/stickworld/cast";
import { Stage } from "../core/three/Stage";
import { Stick } from "../styles/stickworld/Stick";
import { Venue } from "../styles/stickworld/closet";
import { font } from "../core/fonts";

const ENTRIES: [string, string, string, any?][] = [
  ["tiff", "smug", "handsHips"],
  ["gatekeeper", "smug", "point"],
  ["lowballer", "grin", "phone", { kind: "phone" }],
  ["archiveBro", "unimpressed", "crossArms"],
  ["bestie", "joy", "wave"],
  ["newgen", "starstruck", "cheer"],
  ["rapper", "determined", "point", { kind: "mic" }],
  ["security", "unimpressed", "crossArms"],
];

const Cell: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [who, face, pose, item] = ENTRIES[i];
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext("2d")!;
    if (who === "tiff") drawTiff(g, c.width, c.height, CAST.tiff, POSES[pose], FACES[face], { item: item ?? null, blink: 0 });
    else drawStick(g, c.width, c.height, SCENE_CAST[who], POSES[pose], FACES[face], { item: item ?? null, blink: 0 });
  }, [f, who, face, pose, item]);
  return (
    <div style={{ width: 360, height: 640, position: "relative", background: i % 2 ? "#d9d2ea" : "#efe7d8" }}>
      <canvas ref={ref} width={360} height={600} style={{ position: "absolute", left: 0, top: 10 }} />
      <div style={{ position: "absolute", bottom: 6, width: "100%", textAlign: "center", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 22 }}>{who}</div>
    </div>
  );
};

const Lineup: React.FC = () => (
  <Stage look="club" cam={[{ f: 0, pos: [0, 1.55, 6.2], look: [0, 1.15, 0], fov: 42, creep: 0 }]} dof={3} focus={[0, 1.2, 0.4]} shadow={{ center: [0, 0, 0], size: 9 }}>
    <group position={[0, 0, -2.6]}>
      <Venue strobe={[]} />
    </group>
    <Stick spec={SCENE_CAST.rapper} at={[0, 0.6, -3.1]} poses={[[0, "point"]]} faces={[[0, "determined"]]} items={[[0, { kind: "mic", hand: "R" }]]} />
    <Stick spec={SCENE_CAST.gatekeeper} at={[-1.25, 0, 0.2]} poses={[[0, "point"]]} faces={[[0, "smug"]]} facing="right" />
    <Stick spec={CAST.tiff} at={[0, 0, 0.5]} poses={[[0, "crossArms"]]} faces={[[0, "unimpressed"]]} />
    <Stick spec={SCENE_CAST.bestie} at={[1.15, 0, 0.25]} poses={[[0, "cheer"]]} faces={[[0, "joy"]]} />
    <Stick spec={SCENE_CAST.newgen} at={[2.1, 0, -0.6]} poses={[[0, "armsUp"]]} faces={[[0, "starstruck"]]} />
    <Stick spec={SCENE_CAST.archiveBro} at={[-2.2, 0, -0.7]} poses={[[0, "crossArms"]]} faces={[[0, "unimpressed"]]} />
  </Stage>
);

export const SceneCast: React.FC = () => {
  font("Montserrat");
  const f = useCurrentFrame();
  if (f >= 1) return <AbsoluteFill><Lineup /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{ background: "#333", display: "flex", flexWrap: "wrap" }}>
      {ENTRIES.map((_, i) => (
        <Cell key={i} i={i} />
      ))}
    </AbsoluteFill>
  );
};
