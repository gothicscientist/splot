// Tiff inside StickWorld 3D sets: checks the shaped lead's card lighting, scale, contact shadow, framing rules
// (face above the caption band via frameOn), a two-shot with a stick side character, and the closet kit.
// Frames: 0 wide bedroom, 30 medium, 60 MCU, 75 CU, 90 full, 120 venue two-shot (club look), 150 the chair selling off.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../core/three/Stage";
import { Room, Window, Poster, Lamp, Plant, Desk, Laptop } from "../styles/stickworld/props";
import { Stick } from "../styles/stickworld/Stick";
import { CAST } from "../styles/stickworld/cast";
import { ClothesChair, ClothesHeap, Rack, Mirror, Bed, ShipBox, Venue } from "../styles/stickworld/closet";
import { frameOn } from "../styles/stickworld/frame";
import { SafeZones } from "../core/Reel";
import type { Vec3 } from "../core/types";

const TIFF_AT: Vec3 = [0, 0, -1.0];

const BedroomSet: React.FC = () => (
  <>
    <Room w={7} d={6} h={4.2} wall="#3b3346" wallTex="plain" baseboard="#262030" floor="wood" floorColor="#6b4f3a" position={[0, 0, -1.6]} />
    <Window kind="night" position={[-1.7, 1.7, -4.55]} w={1.3} h={1.1} curtain="#1c1824" />
    <Poster text="NO LOWBALLS" sub="serious buyers only" bg="#141218" fg="#e8e4ec" position={[1.35, 1.95, -4.55]} w={0.7} h={0.95} />
    <Bed position={[2.1, 0, -3.3]} duvet="#c9c2dc" />
    <ClothesChair position={[-1.05, 0, -1.5]} rotation={[0, 0.5, 0]} n={14} sold={[156, 160, 164, 168, 172, 176]} />
    <ClothesHeap position={[-2.2, 0, -2.6]} n={16} radius={0.5} seed={11} />
    <Rack position={[0.2, 0, -4.1]} w={1.7} n={8} />
    <Mirror position={[1.45, 0, -1.9]} rotation={[0, -0.45, 0]} />
    <Desk position={[-2.4, 0, -3.9]} w={1.4} d={0.7} />
    <Laptop position={[-2.4, 0.87, -3.9]} screen="pileGo!" />
    <Lamp position={[-1.9, 0.87, -3.95]} color="#d9b8ff" />
    <Plant position={[2.9, 0, -1.6]} size={0.9} />
    <ShipBox position={[0.95, 0, -0.9]} rotation={[0, 0.3, 0]} />
    <ShipBox kind="mailer" position={[0.6, 0, -0.55]} rotation={[0, -0.4, 0]} />
  </>
);

const hold = (f: number, p: ReturnType<typeof frameOn>, len = 29) => [
  { f, ...p, ease: "cut" as const },
  { f: f + len, ...p, ease: "linear" as const },
];

const Bedroom: React.FC = () => (
  <Stage
    look="interior"
    cam={[
      ...hold(0, frameOn(TIFF_AT, "wide", { dir: [0.05, 1] })),
      ...hold(30, frameOn(TIFF_AT, "medium", { side: -0.15 })),
      ...hold(60, frameOn(TIFF_AT, "mcu"), 14),
      ...hold(75, frameOn(TIFF_AT, "cu", { dir: [0.25, 1] }), 14),
      ...hold(90, frameOn(TIFF_AT, "full", { dir: [-0.2, 1], side: 0.35 })),
      ...hold(150, frameOn([-0.55, 0, -1.2], "medium", { dir: [0.35, 1], side: 0.45, lift: -0.15 })),
    ]}
    dof={(f) => (f >= 60 && f < 90 ? 13 : f >= 30 && f < 60 ? 10 : 4)}
    focus={[0, 1.4, -1.0]}
    shadow={{ center: [0, 0, -1.2], size: 8 }}
  >
    <BedroomSet />
    <Stick
      spec={CAST.tiff}
      at={TIFF_AT}
      poses={[[0, "relaxed"], [30, "handsHips"], [60, "think"], [75, "relaxed"], [90, "crossArms"], [150, "phone"]]}
      faces={[[0, "happy"], [30, "smug"], [60, "thinking"], [75, "unimpressed"], [90, "smug"], [150, "starstruck"]]}
      items={[[150, { kind: "phone", hand: "R" }]]}
    />
  </Stage>
);

const Show: React.FC = () => (
  <Stage
    look="club"
    cam={[...hold(120, { pos: [0, 1.5, 4.6], look: [0, 1.2, 0.2], fov: 40 })]}
    dof={5}
    focus={[0, 1.3, 0.4]}
    shadow={{ center: [0, 0, 0], size: 8 }}
  >
    <group position={[0, 0, -2.4]}>
      <Venue strobe={[128, 140]} />
    </group>
    <Stick spec={CAST.tiff} at={[-0.45, 0, 0.35]} poses={[[0, "crossArms"]]} faces={[[0, "unimpressed"]]} />
    <Stick
      spec={{ body: "#2a2a30", outfit: "leather", hat: "fur", hatColor: "#cbbfae", legColor: "#1e1e24", shoes: "#111114", seed: 41 }}
      at={[0.5, 0, 0.3]}
      poses={[[0, "point"]]}
      faces={[[0, "smug"]]}
      facing="left"
    />
  </Stage>
);

export const TiffStage: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f >= 120 && f < 150 ? <Show /> : <Bedroom />}
      <SafeZones />
    </AbsoluteFill>
  );
};
