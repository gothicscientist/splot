import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../core/three/Stage";
import { Ground, Tree } from "../styles/stickworld/props";
import { EiffelTower } from "../styles/stickworld/props2";
import { Stick } from "../styles/stickworld/Stick";
import { CAST } from "../styles/stickworld/cast";

export const SkyLab: React.FC<{ grade?: boolean; ink?: boolean; sky?: boolean }> = ({ grade = true, ink = true, sky = true }) => (
  <AbsoluteFill style={{ background: "#ff00ff" }}>
    <Stage look="day" grade={grade} ink={ink} sky={sky} cam={[{ f: 0, pos: [2.5, 1.6, 7], look: [0, 6, -26], fov: 46, creep: 0 }]} shadow={{ center: [0, 0, -2], size: 12 }}>
      <Ground size={140} kind="tiles" />
      <EiffelTower position={[0, 0, -26]} H={32} />
      <Tree position={[-8, 0, -15]} size={1.3} />
      <Stick spec={CAST.lead} at={[0.5, 0, 0]} />
    </Stage>
  </AbsoluteFill>
);
