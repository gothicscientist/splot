import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../core/three/Stage";
import { VoxelWorld, Block } from "../styles/blockcraft/VoxelWorld";
import { Blocky, BCAST } from "../styles/blockcraft/Blocky";
import { SquareSun, CloudLayer, PixelToast } from "../styles/blockcraft/Sky";

export const BlockLab: React.FC = () => (
  <AbsoluteFill>
    <Stage look="day" ink={false} sky dof={6} focus={[0, 1.2, 0]} cam={[{ f: 0, pos: [4.5, 3.2, 8.5], look: [0, 1.2, 0], fov: 46 }]}>
      <VoxelWorld
        build={(v) => {
          v.terrain({ x0: -24, x1: 24, z0: -30, z1: 12, base: -1, amp: 1.6, seed: 3 });
          v.tree(-6, 0, -5, 5).tree(7, 0, -9, 6).tree(-12, 0, -14, 5);
          v.house(2, 0, -8, 7, 6, 4);
          v.shaft(-2, 2, 0, -8, 0);
          v.box(-14, -1, 2, -10, -1, 6, "water");
          v.set(-3, 0, 3, "tnt").set(4, 0, 2, "goldBlock").set(5, 0, 2, "gemBlock").set(-5, 0, 0, "glow");
        }}
      />
      <SquareSun position={[30, 60, -90]} size={14} />
      <CloudLayer y={34} />
      <Block type="cobble" at={[1, 0, 1]} pop={0} />
      <Blocky spec={BCAST.hero} at={[0, 0, 2]} poses={[[0, "wave"]]} faces={[[0, "happy"]]} item={[[0, "pickaxe"]]} />
      <Blocky spec={BCAST.miner} at={[-1.6, 0, 1.2]} yaw={30} poses={[[0, "hold"]]} faces={[[0, "shocked"]]} />
      <Blocky spec={BCAST.scientist} at={[1.6, 0, 1.0]} yaw={-25} poses={[[0, "point"]]} faces={[[0, "smug"]]} item={[[0, "gem"]]} />
    </Stage>
    <PixelToast at={0} title="Goal reached!" sub="Dig to the bottom" icon="⛏" />
  </AbsoluteFill>
);
