// Look-dev scene for StickWorld: the night office from the reference look, a slow push-in, a red alarm hit.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../core/three/Stage";
import { Stick } from "../styles/stickworld/Stick";
import { CAST } from "../styles/stickworld/cast";
import { Room, Desk, Laptop, Lamp, Plant, Bookshelf, Clock, Poster, Window, Chair } from "../styles/stickworld/props";

export const StickLab: React.FC<{ look?: "interior" | "alarm" | "night" | "day" }> = ({ look = "interior" }) => {
  const f = useCurrentFrame();
  const hit = 45;
  return (
    <AbsoluteFill>
      <Stage
        look={f >= hit ? "alarm" : look}
        cam={[
          { f: 0, pos: [0.5, 2.15, 4.4], look: [0, 1.2, -0.2], fov: 36, creep: 0.0025 },
          { f: hit + 6, pos: [0.3, 1.95, 2.9], look: [0, 1.35, -0.2], fov: 34, ease: "burst", dur: 8, creep: 0.004 },
        ]}
        kicks={[hit]}
        dof={f >= hit ? 13 : 9}
        focus={[0, 1.4, 0.2]}
        shadow={{ center: [0, 0, 0], size: 6 }}
      >
        <Room w={7} d={6} h={3.4} wall="#f2c14e" floor="wood" position={[0, 0, -1]} />
        <Bookshelf position={[-2.4, 0, -3.7]} />
        <Window kind="night" position={[1.5, 1.9, -3.93]} />
        <Poster text={"HODL"} sub="TO THE MOON" position={[-0.9, 2.2, -3.93]} />
        <Clock position={[-0.3, 2.75, -3.93]} time={0.35} />
        <Plant position={[-1.6, 0.86, -0.15]} size={0.7} />
        <Desk position={[0, 0, 0.35]} />
        <Laptop position={[-0.05, 0.865, 0.62]} rotation={[0, Math.PI, 0]} scale={0.78} screen={"wallet: 0x3f..."} />
        <Lamp position={[0.82, 0.865, 0.2]} rotation={[0, Math.PI * 0.85, 0]} />
        <Chair position={[0, 0, -0.55]} rotation={[0, 0, 0]} />
        <Stick
          spec={CAST.lead}
          at={[0, 0.12, -0.3]}
          poses={[
            [0, "typing"],
            [hit - 1, "typing"],
            [hit, "scared"],
          ]}
          faces={[
            [0, "neutral"],
            [hit, "panic"],
          ]}
        />
      </Stage>
    </AbsoluteFill>
  );
};
