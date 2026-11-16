// scenes: hand-written
// "He quizzed me in a jacket I sold him" - Tiff x pileGo! ep. 1 (StickWorld x tiff mode, F4 gatekeeper-quiz flip).
// Every move is keyed to its word through useShot(); Tiff is framed only with frameOn() (face in the upper third,
// never body-focused); pileGo! UI appears from b12 on (the plug starts at ~80 % of the words).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import type { CamKey } from "../../core/three/camera";
import { screenAt } from "../../core/three/screen";
import { Tag, Bubble, FXLayer, FlashFX } from "../../core/fx2d";
import { backOut, clamp, easeOut, invLerp } from "../../core/anim";
import { font } from "../../core/fonts";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST, SCENE_CAST } from "../../styles/stickworld/cast";
import type { Item } from "../../styles/stickworld/draw";
import { Room, Window, Poster, Lamp, Plant, Desk, Laptop } from "../../styles/stickworld/props";
import { ClothesChair, ClothesHeap, Rack, Mirror, Bed, ShipBox, Venue, Garment, Cutout } from "../../styles/stickworld/closet";
import { frameOn } from "../../styles/stickworld/frame";
import { PileGoPhone, ListingCard, DMThread, RelistSnap, EndCard } from "../../brands/pilego";
import type { Timeline, Vec3 } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
type Poses = [number, string][];
const K = (f: number, p: { pos: Vec3; look: Vec3; fov: number }, o: Partial<CamKey> = {}): CamKey => ({ f, ...p, ...o });

// ------------------------------------------------------------------------------------------------ cast + places
const TIFF = CAST.tiff;
const GK = SCENE_CAST.gatekeeper;
// the show: the gatekeeper stands nearer the lens (left), Tiff behind him (right): a 9:16 two-shot
const T_AT: Vec3 = [0.38, 0, -0.1];
const G_AT: Vec3 = [-0.32, 0, 1.15];
const JACKET: Vec3 = [G_AT[0], 0.87, G_AT[2] + 0.08];
// her bedroom
const CHAIR_AT: Vec3 = [-0.85, 0, -1.3];
const T_ROOM: Vec3 = [0.55, 0, -0.9];
const LEATHER = "#262329";

const TWO_SHOT = { pos: [0.12, 1.42, 3.95] as Vec3, look: [0.05, 1.2, 0.3] as Vec3, fov: 40 };

/** lowercase text hook in the top band (from frame 0) */
const HookText: React.FC<{ text: string; out?: number }> = ({ text, out }) => {
  const s = useShot();
  const o = out !== undefined ? 1 - clamp(invLerp(out, out + 6, s.f)) : 1;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 300, left: 90, right: 90, textAlign: "center", fontFamily: font("Inter"), fontWeight: 900, fontSize: 96, lineHeight: 1.02, letterSpacing: "-0.01em", color: "#ffffff", WebkitTextStroke: "12px #0b0a0c", paintOrder: "stroke fill", opacity: o }}>
      {text}
    </div>
  );
};

const ShowSet: React.FC<{ strobe?: number[]; react?: number }> = ({ strobe = [], react }) => {
  const r = react ?? 99999;
  return (
    <>
      <group position={[0, 0, -2.6]}>
        <Venue strobe={strobe} bpm={146} />
      </group>
      <Stick spec={SCENE_CAST.newgen} at={[0.98, 0, -1.25]} poses={[[0, "cheer"], [r, "scared"]]} faces={[[0, "joy"], [r, "shocked"]]} seed={5} />
      <Stick spec={SCENE_CAST.archiveBro} at={[-0.95, 0, -1.45]} poses={[[0, "crossArms"], [r, "scared"]]} faces={[[0, "unimpressed"], [r, "shocked"]]} seed={8} />
    </>
  );
};

const RoomSet: React.FC<{ sold?: number[]; night?: boolean }> = ({ sold = [], night = false }) => (
  <>
    <Room w={7} d={6} h={4.2} wall="#3b3346" wallTex="plain" baseboard="#262030" floor="wood" floorColor="#6b4f3a" position={[0, 0, -1.6]} />
    <Window kind={night ? "night" : "day"} position={[-1.7, 1.75, -4.55]} w={1.3} h={1.1} curtain="#1c1824" />
    <Poster text="NO LOWBALLS" sub="serious buyers only" bg="#141218" fg="#e8e4ec" position={[1.45, 1.95, -4.55]} w={0.7} h={0.95} />
    <Bed position={[2.1, 0, -3.3]} duvet="#c9c2dc" />
    <ClothesChair position={CHAIR_AT} rotation={[0, 0.45, 0]} n={14} sold={sold} />
    <ClothesHeap position={[-2.3, 0, -2.7]} n={14} radius={0.48} seed={11} />
    <Rack position={[0.25, 0, -4.1]} w={1.7} n={8} />
    <Mirror position={[1.55, 0, -1.95]} rotation={[0, -0.45, 0]} />
    <Desk position={[-2.45, 0, -3.95]} w={1.4} d={0.7} />
    <Laptop position={[-2.45, 0.87, -3.95]} screen="" />
    <Lamp position={[-1.95, 0.87, -4.0]} color="#d9b8ff" />
    <Plant position={[2.95, 0, -1.6]} size={0.9} />
    <ShipBox position={[1.0, 0, -0.55]} rotation={[0, 0.3, 0]} />
    <ShipBox kind="mailer" position={[0.6, 0, -0.25]} rotation={[0, -0.4, 0]} />
  </>
);

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const v = variant % 3;
  const jacket = s.hit("jacket");
  const cams: CamKey[] =
    v === 1
      ? [K(0, { pos: [-0.2, 0.98, 2.55], look: [-0.32, 0.9, 1.15], fov: 34 }), K(jacket + 4, TWO_SHOT, { ease: "glide", dur: 22 })]
      : v === 2
        ? [K(0, frameOn(T_AT, "cu", { side: 0.15 })), K(jacket, TWO_SHOT, { ease: "burst", dur: 9 })]
        : [K(0, { ...TWO_SHOT, pos: [0.14, 1.42, 4.2] }), K(s.dur, TWO_SHOT, { ease: "linear" })];
  return (
    <AbsoluteFill>
      <Stage look="club" cam={cams} dof={v === 1 ? (f) => (f < jacket ? 12 : 4) : 4} focus={v === 1 ? [-0.32, 0.9, 1.2] : [0.38, 1.5, -0.1]} shadow={{ center: [0, 0, 0.4], size: 8 }} kicks={[jacket + 2]}>
        <ShowSet />
        <Stick spec={TIFF} at={T_AT} poses={[[0, "crossArms"]]} faces={[[0, "unimpressed"], [s.hit("sold"), "smug"]]} facing="left" talking={s.speaking(["b01"])} />
        <Stick spec={GK} at={G_AT} poses={[[0, "point"]]} faces={[[0, "smug"]]} facing="right" />
        <Cutout position={JACKET} w={0.62} h={0.66} at={0} />
      </Stage>
      <FXLayer>
        <HookText text="he's wearing my jacket" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the quiz
const S02: React.FC = () => {
  const s = useShot();
  const b3 = s.beat("b03").s;
  const four = s.hit("four");
  const blinks = s.hit("blinks");
  const gkCU = frameOn(G_AT, "mcu", { who: "stick", dir: [-0.15, 1] });
  const cams: CamKey[] = [
    K(0, gkCU, { creep: 0.003 }),
    K(b3, frameOn(T_AT, "medium", { dir: [0.2, 1], side: 0.45 }), { ease: "cut" }),
    K(blinks, frameOn(G_AT, "cu", { who: "stick", dir: [-0.15, 1] }), { ease: "cut" }),
  ];
  const head = screenAt(cams, Math.min(s.f, b3 - 1), [G_AT[0], 1.85, G_AT[2]]);
  const tags: [string, number, number][] = [
    ["leak · 03.14", 225, 400],
    ["snippet · 05.02", 240, 530],
    ["demo · 06.30", 220, 660],
    ["deleted · 08.09", 235, 790],
  ];
  return (
    <AbsoluteFill>
      <Stage look="club" cam={cams} dof={12} focus={(f) => (f >= b3 && f < blinks ? [T_AT[0], 1.6, T_AT[2]] : [G_AT[0], 1.4, G_AT[2]])} shadow={{ center: [0, 0, 0.4], size: 8 }} kicks={[blinks + 1]}>
        <ShowSet />
        <Stick spec={TIFF} at={T_AT} poses={[[0, "crossArms"], [b3, "relaxed"]]} faces={[[0, "unimpressed"], [four, "smug"]]} facing="left" talking={s.speaking(["b03"])} />
        <Stick spec={GK} at={G_AT} poses={[[0, "pointUp"], [blinks, "scared"]]} faces={[[0, "smug"], [blinks, "shocked"]]} facing="right" talking={s.speaking(["b02"])} />
      </Stage>
      <FXLayer>
        {s.f < b3 ? <Bubble at={s.hit("unreleased")} out={b3 - 2} x={Math.min(760, Math.max(330, head[0] + 120))} y={Math.max(380, head[1] - 60)} text="name 3 unreleased" size={50} width={470} tail="left" /> : null}
        {tags.map(([t, x, y], i) => (
          <Tag key={t} at={four + i * 5} out={blinks - 1} x={x} y={y} text={t} size={42} bg={i % 2 ? "#cdb6ea" : "#fffdf6"} fg="#17151a" rot={i % 2 ? 4 : -4} />
        ))}
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 reps / archive
const Receipt: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const s = useShot();
  if (s.f < at) return null;
  const t = easeOut(invLerp(at, at + 14, s.f));
  const lines = ["1x scoop tank", "1x jean shorts", "1x block-heel boots", "1x choker", "retail ✓"];
  return (
    <div style={{ position: "absolute", left: x - 150, top: y, width: 300, height: 120 + 380 * t, overflow: "hidden", background: "#fbfaf4", boxShadow: "0 14px 40px rgba(0,0,0,0.35)", borderRadius: 6, transform: "rotate(-5deg)", padding: "22px 24px", fontFamily: font("JetBrains Mono"), fontWeight: 700, fontSize: 25, color: "#22241e", lineHeight: 1.9 }}>
      {lines.map((l, i) => (
        <div key={l} style={{ opacity: clamp((t * lines.length - i) * 1.5), color: i === lines.length - 1 ? "#56703f" : "#22241e" }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const S03: React.FC = () => {
  const s = useShot();
  const b5 = s.beat("b05").s;
  const b6 = s.beat("b06").s;
  const reps = s.hit("reps");
  const arch = s.hit("archive");
  const full = { pos: [0.2, 1.45, 4.6] as Vec3, look: [0.0, 1.05, 0.4] as Vec3, fov: 42 };
  const cams: CamKey[] = [
    K(0, full, { creep: 0.003 }),
    K(b5, frameOn(T_AT, "medium", { dir: [0.25, 1], side: 0.45 }), { ease: "cut" }),
    K(b6, frameOn(G_AT, "medium", { who: "stick", dir: [-0.25, 1] }), { ease: "cut" }),
    K(arch + 8, frameOn(G_AT, "mcu", { who: "stick", dir: [-0.25, 1] }), { ease: "burst", dur: 10 }),
  ];
  const lc = screenAt(cams, Math.min(s.f, b5 - 1), [T_AT[0], 2.0, T_AT[2]]);
  const jk = screenAt(cams, s.f, [JACKET[0] + 0.05, JACKET[1] + 0.1, JACKET[2]]);
  const items: [number, Item | null][] = [[0, { kind: "magnifier", hand: "R" }], [b6, null]];
  return (
    <AbsoluteFill>
      <Stage look="club" cam={cams} dof={(f) => (f < b5 ? 4 : 12)} focus={(f) => (f >= b5 && f < b6 ? [T_AT[0], 1.6, T_AT[2]] : [G_AT[0], 1.3, G_AT[2]])} shadow={{ center: [0, 0, 0.4], size: 8 }} kicks={[arch + 2]}>
        <ShowSet />
        <Stick spec={TIFF} at={T_AT} poses={[[0, "relaxed"], [b5, "handsHips"]]} faces={[[0, "unimpressed"], [b5, "smug"]]} facing="left" talking={s.speaking(["b05"])} />
        <Stick spec={GK} at={G_AT} poses={[[0, "holdOne"], [b6, "handsHips"]]} faces={[[0, "thinking"], [b6, "smug"]]} items={items} facing="right" talking={s.speaking(["b04", "b06"])} />
      </Stage>
      <FXLayer>
        {s.f < b5 ? <Tag at={reps} out={b5 - 2} x={Math.min(760, lc[0])} y={Math.max(340, lc[1] - 40)} text="LC?" size={64} bg="#e0533a" fg="#fffdf6" rot={6} /> : null}
        {s.f >= b5 && s.f < b6 ? <Receipt at={s.hit("receipts")} x={225} y={330} /> : null}
        {s.f >= b5 && s.f < b6 ? <Tag at={s.hit("retail")} out={b6 - 2} x={230} y={900} text="retail ✓" size={52} bg="#56703f" fg="#fffdf6" rot={-5} /> : null}
        {s.f >= b6 ? <Tag at={arch} x={Math.min(800, Math.max(280, jk[0]))} y={Math.max(380, Math.min(1000, jk[1]))} text="ARCHIVE" size={64} bg="#e2b23c" fg="#17151a" rot={-6} /> : null}
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 the turn
const S04: React.FC = () => {
  const s = useShot();
  const know = s.hit("know");
  const chair = s.hit("chair");
  const cams: CamKey[] = [
    K(0, frameOn(G_AT, "mcu", { who: "stick", dir: [-0.2, 1] })),
    K(know + 18, { pos: [JACKET[0] + 0.12, 1.0, JACKET[2] + 1.75], look: [JACKET[0], 0.9, JACKET[2]], fov: 34 }, { ease: "glide", dur: 26 }),
  ];
  return (
    <AbsoluteFill>
      <Stage look="club" cam={cams} dof={14} focus={JACKET} shadow={{ center: [0, 0, 0.4], size: 8 }} kicks={[chair + 1]}>
        <ShowSet />
        <Stick spec={TIFF} at={T_AT} poses={[[0, "handsHips"]]} faces={[[0, "smug"]]} facing="left" />
        <Stick spec={GK} at={G_AT} poses={[[0, "handsHips"]]} faces={[[0, "smug"], [chair, "nervousSmile"]]} facing="right" />
        <Cutout position={JACKET} w={0.62} h={0.66} at={know} lock={chair} />
      </Stage>
      <FXLayer>
        <FlashFX at={chair + 2} dur={6} max={0.9} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 flashback: the listing
const S05: React.FC = () => {
  const s = useShot();
  const listed = s.hit("listed");
  const b9 = s.beat("b09").s;
  const sold = s.hit("full");
  const chairView = { pos: [0.1, 1.75, 1.75] as Vec3, look: [-0.9, 0.95, -1.3] as Vec3, fov: 40 };
  const cams: CamKey[] = [K(0, chairView, { creep: 0.0028 }), K(b9, { pos: [0.35, 1.8, 2.05], look: [-0.75, 1.0, -1.3], fov: 40 }, { ease: "glide", dur: 24 })];
  const top: Vec3 = [CHAIR_AT[0], 1.38, CHAIR_AT[2]];
  return (
    <AbsoluteFill>
      <Stage look="interior" cam={cams} dof={6} focus={[-0.8, 0.9, -1.3]} shadow={{ center: [0, 0, -1.2], size: 8 }}>
        <RoomSet />
        {/* the jacket on top of the chair pile, outlined (it lived here) */}
        <Garment kind="jacket" color={LEATHER} accent="#3a363e" position={top} rotation={[0.45, 0.35, 0.05]} scale={1.4} />
        <Cutout position={[top[0], top[1] + 0.16, top[2] + 0.2]} w={0.9} h={0.62} at={0} lock={0} />
      </Stage>
      <FXLayer>
        <ListingCard at={listed} x={770} y={530} title="faux leather jacket · mall brand · worn twice" price="$40" kind="jacket" color={LEATHER} likes={2} sold={sold} rot={3} scale={0.78} />
        <DMThread
          at={b9}
          x={420}
          y={900}
          width={600}
          handle="@realarchive.only"
          msgs={[
            { at: s.hit("4"), from: "them", text: "would u do $4" },
            { at: s.hit("4") + 9, from: "me", text: "no" },
            { at: s.hit("40", 2), from: "them", text: "ok fine $40" },
          ]}
        />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 the reveal + the boots
const S06: React.FC = () => {
  const s = useShot();
  const chair = s.hit("chair");
  const b11 = s.beat("b11").s;
  const thirty = s.hit("30");
  const cams: CamKey[] = [
    K(0, frameOn(T_AT, "cu", { dir: [0.2, 1], side: -0.1 }), { creep: 0.004 }),
    K(chair, TWO_SHOT, { ease: "cut" }),
    K(b11, frameOn(G_AT, "mcu", { who: "stick", dir: [-0.2, 1] }), { ease: "cut" }),
  ];
  const head = screenAt(cams, s.f, [G_AT[0], 1.85, G_AT[2]]);
  return (
    <AbsoluteFill>
      <Stage look="club" cam={cams} dof={(f) => (f >= chair && f < b11 ? 4 : 12)} focus={(f) => (f < chair ? [T_AT[0], 1.6, T_AT[2]] : [G_AT[0], 1.4, G_AT[2]])} shadow={{ center: [0, 0, 0.4], size: 8 }} kicks={[chair + 2]}>
        <ShowSet strobe={[chair + 1]} react={chair} />
        <Stick spec={TIFF} at={T_AT} poses={[[0, "point"], [chair, "crossArms"]]} faces={[[0, "unimpressed"], [chair, "smug"]]} facing="left" talking={s.speaking(["b10"])} />
        <Stick
          spec={GK}
          at={G_AT}
          poses={[[0, "handsHips"], [chair, "scared"], [b11, "phone"]] as Poses}
          faces={[[0, "smug"], [chair, "shocked"], [b11, "nervousSmile"]]}
          items={[[b11, { kind: "phone", hand: "R" }]]}
          facing="right"
          talking={s.speaking(["b11"])}
        />
      </Stage>
      <FXLayer>
        <FlashFX at={chair + 1} dur={5} max={0.55} color="#ffd6f2" />
        {s.f >= b11 ? <Bubble at={thirty} x={Math.min(740, Math.max(340, head[0] + 150))} y={Math.max(380, head[1] - 70)} text="$30 for the boots?" size={50} width={480} tail="left" /> : null}
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 the relist snap + pileGo!
const S07: React.FC = () => {
  const s = useShot();
  const snap = s.hit("snap");
  const listed = s.hit("listed");
  const b13 = s.beat("b13").s;
  const five = s.hit("five");
  const live = s.hit("live");
  const sells = [live + 4, live + 9, five, five + 5, five + 10, five + 15];
  const cams: CamKey[] = [
    K(0, frameOn(T_ROOM, "medium", { dir: [-0.35, 1], side: 0.35 }), { creep: 0.003 }),
    K(snap + 10, { pos: [0.05, 1.3, 1.55], look: [-0.8, 0.85, -1.3], fov: 40 }, { ease: "burst", dur: 10 }),
  ];
  const chairPx = screenAt(cams, s.f, [CHAIR_AT[0], 0.85, CHAIR_AT[2]]);
  return (
    <AbsoluteFill>
      <Stage look="interior" cam={cams} dof={5} focus={[-0.6, 1.0, -1.1]} shadow={{ center: [0, 0, -1.2], size: 8 }}>
        <RoomSet night sold={sells} />
        <Lamp position={[0.0, 0, -1.9]} color="#ffcf8a" />
        <Stick spec={TIFF} at={T_ROOM} poses={[[0, "phone"]]} faces={[[0, "unimpressed"], [listed, "smug"]]} items={[[0, { kind: "phone", hand: "R" }]]} facing="left" talking={s.speaking(["b12", "b13"])} />
      </Stage>
      <FXLayer>
        <RelistSnap at={snap - 6} out={b13 + 2} x={Math.min(700, Math.max(380, chairPx[0]))} y={Math.max(560, Math.min(900, chairPx[1]))} w={560} h={560} stampAt={listed} />
        <PileGoPhone at={b13 - 4} x={330} y={690} scale={0.72} steps={{ cut: b13 - 4, list: s.hit("puts"), live, sold: five, delist: s.hit("apps") + 2 }} pile={[14, 8]} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s08 kicker + end card
const S08: React.FC = () => {
  const s = useShot();
  const bEnd = s.beat("b14").speechEnd;
  const choices: [string, string, number][] = [
    ["accept", "#fffdf6", 560],
    ["counter", "#cdb6ea", 680],
    ["block", "#e0533a", 800],
  ];
  return (
    <AbsoluteFill>
      <Stage look="interior" cam={[K(0, frameOn(T_ROOM, "medium", { dir: [-0.2, 1], side: 0.45 }), { creep: 0.0035 })]} dof={13} focus={[T_ROOM[0], 1.6, T_ROOM[2]]} shadow={{ center: [0, 0, -1.2], size: 8 }}>
        <RoomSet night sold={[0, 0, 0, 0, 0, 0]} />
        <Stick spec={TIFF} at={T_ROOM} poses={[[0, "phone"]]} faces={[[0, "unimpressed"], [s.hit("block"), "smug"]]} items={[[0, { kind: "phone", hand: "R" }]]} talking={s.speaking(["b14"])} />
      </Stage>
      <FXLayer>
        {/* the phone carries over the cut from s07, already "down everywhere else", then slides away */}
        <PileGoPhone at={-40} out={s.hit("30") - 4} x={330} y={690} scale={0.72} steps={{ cut: -40, list: -40, live: -40, sold: -40, delist: -40 }} pile={[14, 8]} />
        <Tag at={s.hit("30")} out={bEnd + 2} x={245} y={420} text="$30 for the boots?" size={40} bg="#17151a" fg="#f2efe4" rot={-3} />
        {choices.map(([w, bg, x], i) => (
          <Tag key={w} at={s.hit(w)} out={bEnd + 2} x={215 + (i % 2) * 30} y={x} text={w} size={50} bg={bg} fg={w === "block" ? "#fffdf6" : "#17151a"} rot={i % 2 ? 3 : -3} />
        ))}
      </FXLayer>
      <EndCard at={bEnd + 4} />
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#140a22" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08 }} />
);
