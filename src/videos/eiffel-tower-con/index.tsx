// scenes: hand-written
// "The man who sold the Eiffel Tower" - StickWorld (2D cast in a toon 3D world) x Case File.
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Rain, Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Counter, Bubble, Mark, FXLayer, FlashFX, Burst } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { StickSpec } from "../../styles/stickworld/draw";
import { Room, Desk, Lamp, Plant, Bookshelf, Table, Chair, Ground, Tree, Building, Cloud, Board, Box, Window, Clock } from "../../styles/stickworld/props";
import { EiffelTower, Newspaper, Easel, Chandelier, Suitcase, Train, Platform, FileDrawer, Ship, Water, PoliceLight, CafeTable, Cup, Awning, LampPost, Phone } from "../../styles/stickworld/props2";
import { orbit } from "../../core/three/camera";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;

// ------------------------------------------------------------------------------------------------ cast
const LUSTIG: StickSpec = { body: "#2b2f3a", outfit: "suit", accent: "#c0392b", hat: "tophat", hatColor: "#1b1b22", mustache: "#2a1a14", hair: "slick", hairColor: "#2a1a14", seed: 4 };
const POISSON: StickSpec = { body: "#6b5440", outfit: "suit", accent: "#e1b12c", glasses: "round", mustache: "#7a4a2a", hair: "bald", build: "stout", seed: 9 };
const DEALERS: StickSpec[] = [
  { body: "#3f5d7a", outfit: "suit", accent: "#f2c14e", hat: "tophat", hatColor: "#2b2f3a", mustache: "#4a3020", seed: 21 },
  { body: "#7a3f4a", outfit: "suit", accent: "#ffffff", hair: "short", hairColor: "#5a3b2a", glasses: "square", seed: 22 },
  { body: "#4a6b3a", outfit: "jacket", hair: "curly", hairColor: "#2a1a10", beard: "#2a1a10", seed: 23 },
  { body: "#5a4a7a", outfit: "suit", accent: "#e14b4b", hat: "tophat", hatColor: "#3a2a20", seed: 24 },
];
const HISTORIAN: StickSpec = { ...CAST.scientist, outfit: "jacket", body: "#8b6f4e", seed: 41 };
const COP: StickSpec = { ...CAST.cop, seed: 33 };

// ------------------------------------------------------------------------------------------------ Paris set
const ParisSet: React.FC<{ towerZ?: number }> = ({ towerZ = -26 }) => (
  <>
    <Ground size={140} kind="tiles" />
    <EiffelTower position={[0, 0, towerZ]} H={32} />
    {[-14, -8, 8, 14].map((x, i) => (
      <Tree key={x} position={[x, 0, towerZ + 9 + (i % 2) * 3]} size={1.3} leaf={i % 2 ? "#4aa356" : "#3f9e4a"} />
    ))}
    <Building position={[-17, 0, -8]} w={6} h={10} d={6} color="#efe1c6" roof="#6f7f99" />
    <Building position={[-17, 0, -15]} w={6} h={12} d={6} color="#f2e6cf" roof="#6f7f99" />
    <Building position={[17, 0, -9]} w={6} h={11} d={6} color="#ead8b8" roof="#6f7f99" />
    <Building position={[17, 0, -16]} w={6} h={9} d={6} color="#efe1c6" roof="#6f7f99" />
    {[-5, 5].map((x) => (
      <LampPost key={x} position={[x, 0, -3]} />
    ))}
    <Cloud position={[-22, 26, -70]} w={22} />
    <Cloud position={[24, 30, -80]} w={26} />
    <Cloud position={[2, 36, -95]} w={20} />
  </>
);

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const s = useShot();
  const eiffel = s.hit("Eiffel");
  const scrap = s.hit("scrap");
  const v = variant % 3;
  const cam =
    v === 0
      ? [
          { f: 0, pos: [1.6, 1.42, 3.4] as [number, number, number], look: [0.8, 1.16, 0.3] as [number, number, number], fov: 36, creep: 0.004 },
          { f: eiffel + 14, pos: [1.7, 1.45, 8.6] as [number, number, number], look: [0.4, 9.6, -26] as [number, number, number], fov: 52, ease: "burst" as const, dur: 16, creep: 0.003 },
        ]
      : v === 1
        ? [
            { f: 0, pos: [3.6, 2.6, -16.5] as [number, number, number], look: [5.2, 2.4, -20] as [number, number, number], fov: 34, creep: 0.004 },
            { f: eiffel + 16, pos: [1.8, 1.2, 7] as [number, number, number], look: [0, 9, -26] as [number, number, number], fov: 46, ease: "glide" as const, dur: 22, creep: 0.003 },
          ]
        : [
            { f: 0, pos: [1.35, 1.25, 1.7] as [number, number, number], look: [1.2, 1.05, 0.3] as [number, number, number], fov: 32, creep: 0.004 },
            { f: eiffel + 14, pos: [1.7, 1.45, 8.6] as [number, number, number], look: [0.4, 9.6, -26] as [number, number, number], fov: 52, ease: "burst" as const, dur: 16, creep: 0.003 },
          ];
  const dof = (f: number) => (f < eiffel ? 12 : 0);
  return (
    <AbsoluteFill>
      <Stage look="day" cam={cam} kicks={[scrap + 2]} dof={dof} focus={(f) => (f < eiffel ? [0, 1.5, 0] : [0, 8, -26])} shadow={{ center: [0, 0, -2], size: 12 }}>
        <ParisSet />
        {v === 1 ? <Board w={2.4} h={1.2} text="FOR SALE" bg="#fff6dd" fg="#d62f3a" position={[5.2, 2.4, -19.8]} rotation={[0, -0.6, 0.05]} /> : null}
        <Stick
          spec={LUSTIG}
          at={[0.9, 0, 0.3]}
          facing="right"
          poses={[
            [0, v === 2 ? "holdFront" : "pointUp"],
            [s.hit("sold"), v === 1 ? "victory" : "pointUp"],
            [scrap, "presentBoth"],
          ]}
          faces={[
            [0, "smug"],
            [s.hit("sold"), "grin"],
            [scrap, "evil"],
          ]}
          items={v === 2 ? [[0, { kind: "money" }], [eiffel, null]] : []}
        />
      </Stage>
      <FXLayer>
        <Stamp at={scrap} x={560} y={560} text="SOLD" size={190} rot={-13} />
        <Tag at={s.hit("metal")} x={560} y={790} text="FOR SCRAP METAL" bg="#ffffff" fg="#d62f3a" size={52} rot={-4} />
        <FlashFX at={scrap} dur={5} max={0.35} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 cafe + newspaper
const S02: React.FC = () => {
  const s = useShot();
  const paper = s.hit("paper");
  const tiny = s.hit("tiny");
  const rust = s.hit("rusting");
  const fortune = s.hit("fortune");
  const b3 = s.beat("b03");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [3.6, 2.0, 5.6], look: [0, 1.1, 0], fov: 38, creep: 0.004 },
          { f: s.hit("Lustig") + 6, pos: [2.2, 1.75, 3.6], look: [0, 1.15, 0], fov: 36, ease: "glide", dur: 18, creep: 0.004 },
          { f: paper + 10, pos: [0.9, 1.5, 1.9], look: [0, 1.05, 0], fov: 34, ease: "glide", dur: 18, creep: 0.004 },
          { f: tiny + 14, pos: [0.1, 1.2, 1.55], look: [0, 1.08, 0.45], fov: 34, ease: "burst", dur: 12, creep: 0.005 },
          { f: b3.speechEnd - 10, pos: [0.4, 1.5, 2.4], look: [0, 1.18, 0], fov: 32, ease: "glide", dur: 16, creep: 0.004 },
        ]}
        dof={(f) => (f > tiny && f < b3.speechEnd - 14 ? 14 : 9)}
        focus={(f) => (f > tiny && f < b3.speechEnd - 14 ? [0, 1.08, 0.48] : [0, 1.3, 0])}
        shadow={{ center: [0, 0, 0], size: 8 }}
      >
        <Ground size={80} kind="tiles" />
        <Building position={[0, 0, -7]} w={14} h={9} d={4} color="#efe1c6" roof="#6f7f99" />
        <Awning position={[0, 3.2, -4.6]} w={7} text="CAFÉ DE LA PAIX" />
        <EiffelTower position={[-10, 0, -60]} H={34} />
        <CafeTable position={[0, 0, 0.55]} />
        <Cup position={[0.28, 0.81, 0.62]} />
        <Chair position={[0, 0, -0.35]} />
        <CafeTable position={[2.6, 0, -1.6]} cloth="#3f7ad6" />
        <Chair position={[2.6, 0, -2.4]} />
        <Plant position={[-2.4, 0, -1.8]} size={1.1} />
        <Stick spec={LUSTIG} at={[0, 0.18, -0.25]} poses={[[0, "holdFront"], [b3.speechEnd - 12, "relaxed"]]} faces={[[0, "neutral"], [tiny, "thinking"], [b3.speechEnd - 10, "smug"]]} />
        <Newspaper position={[0, 1.08, 0.45]} rotation={[-0.25, 0, 0]} w={0.62} headline="TOWER NEEDS COSTLY REPAIRS" sub="LA TOUR ROUILLE" />
      </Stage>
      <FXLayer>
        <Tag at={s.hit("Paris")} out={paper - 6} x={540} y={420} text="PARIS · 1925" bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" size={62} />
        <Tag at={rust} out={fortune + 8} x={300} y={420} text="RUSTING" bg="#c0611f" fg="#ffffff" size={56} rot={-6} />
        <Tag at={fortune} out={b3.speechEnd - 12} x={720} y={520} text="$$$ A FORTUNE" bg="#FFD43B" size={62} rot={5} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 forgery at night
const S03: React.FC = () => {
  const s = useShot();
  const forges = s.hit("forges");
  const gov = s.hit("government");
  const becomes = s.hit("becomes");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [1.2, 1.9, 3.4], look: [0, 1.05, 0.2], fov: 36, creep: 0.003 },
          { f: gov + 8, pos: [0.15, 1.6, 1.25], look: [0, 0.88, 0.42], fov: 32, ease: "burst", dur: 10, creep: 0.003 },
          { f: becomes + 12, pos: [0.6, 1.6, 2.9], look: [0, 1.3, -0.2], fov: 34, ease: "glide", dur: 14, creep: 0.004 },
        ]}
        dof={(f) => (f >= gov && f < becomes ? 13 : 8)}
        focus={(f) => (f >= gov && f < becomes ? [0, 0.88, 0.42] : [0, 1.3, -0.2])}
        shadow={{ center: [0, 0, 0], size: 6 }}
      >
        <Room w={7} d={6} h={3.4} wall="#2f5d50" wallTex="plain" baseboard="#1f3b33" floor="wood" floorColor="#8a5a32" position={[0, 0, -1]} />
        <Window kind="night" position={[1.6, 1.9, -3.93]} curtain="#8c1f2a" />
        <Bookshelf position={[-2.3, 0, -3.7]} />
        <Clock position={[-0.4, 2.7, -3.93]} time={0.95} />
        <Desk position={[0, 0, 0.35]} color="#7a4a2a" />
        <Lamp position={[-0.75, 0.865, 0.2]} rotation={[0, 0.4, 0]} color="#c9a227" />
        <Board w={0.42} h={0.56} text={"MINISTÈRE DES POSTES\nET TÉLÉGRAPHES"} bg="#fbf7ee" fg="#22305a" fontName="DM Serif Display" position={[0, 0.875, 0.42]} rotation={[-Math.PI / 2, 0, 0]} />
        <Box size={[0.1, 0.12, 0.1]} color="#8c1f2a" position={[0.4, 0.93, 0.45]} r={0.02} />
        <Stick spec={LUSTIG} at={[0, 0.1, -0.35]} poses={[[0, "typing"], [becomes, "handsHips"]]} faces={[[0, "determined"], [becomes, "smug"]]} />
      </Stage>
      <FXLayer>
        <Stamp at={gov + 4} out={becomes - 2} x={540} y={760} text="OFFICIAL" size={120} color="#22305a" rot={-9} />
        <Tag at={becomes} x={540} y={560} text="DEPUTY DIRECTOR" bg="#22305a" fg="#ffffff" border="#FFD43B" size={60} />
        <Tag at={s.hit("Ministry")} x={540} y={900} text="Ministry of Posts" bg="#ffffff" size={46} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 hotel suite pitch
const S04: React.FC = () => {
  const s = useShot();
  const books = s.hit("books");
  const invites = s.hit("invites");
  const five = s.hit("five");
  const pitch = s.hit("pitch");
  const tearing = s.hit("tearing");
  const seven = s.hit("Seven");
  const b6 = s.beat("b06");
  const seats: [number, number][] = [
    [-1.4, -0.7],
    [-0.45, -0.7],
    [0.5, -0.7],
    [-0.95, 0.75],
    [0.05, 0.75],
  ];
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={[
          { f: 0, pos: [4.6, 3.3, 5.0], look: [-0.3, 0.9, 0], fov: 40, creep: 0.004 },
          { f: five + 6, pos: [3.2, 3.0, 4.2], look: [-0.4, 0.95, 0], fov: 40, ease: "glide", dur: 20, creep: 0.004 },
          { f: pitch + 12, pos: [-0.6, 1.7, 3.6], look: [1.8, 1.45, -0.3], fov: 36, ease: "burst", dur: 12, creep: 0.003 },
          { f: seven + 8, pos: [1.4, 1.65, 1.8], look: [2.15, 1.5, -0.6], fov: 32, ease: "burst", dur: 9, creep: 0.006 },
          { f: b6.speechEnd - 6, pos: [2.4, 2.1, 3.4], look: [0, 1.15, 0], fov: 38, ease: "glide", dur: 14, creep: 0.003 },
        ]}
        kicks={[seven + 1]}
        dof={(f) => (f >= seven && f < b6.speechEnd - 8 ? 12 : 7)}
        focus={(f) => (f >= pitch && f < b6.speechEnd - 8 ? [2.15, 1.5, -0.6] : [0, 1.1, 0])}
        shadow={{ center: [0.5, 0, 0], size: 7 }}
      >
        <Room w={9} d={7} h={3.8} wall="#8c1f2a" wallTex="stripes" baseboard="#d4a017" floor="carpet" floorColor="#6e1f2a" position={[0, 0, -1]} />
        <Chandelier position={[0, 3.3, 0]} />
        <Table w={3.6} d={1.5} color="#7a4a2a" position={[-0.45, 0, 0]} />
        {seats.map(([x, z], i) => (
          <React.Fragment key={i}>
            <Chair position={[x, 0, z + (z < 0 ? -0.35 : 0.35)]} rotation={[0, z < 0 ? 0 : Math.PI, 0]} color="#d4a017" />
            <Stick
              spec={i < 4 ? DEALERS[i] : POISSON}
              at={[x, 0.15, z + (z < 0 ? -0.45 : 0.45)]}
              pop={invites + 4 + i * 4}
              poses={[[0, "holdFront"], [seven, i % 2 ? "shrug" : "armsUp"], [b6.speechEnd - 10, "holdFront"]]}
              faces={[[0, "neutral"], [pitch, "thinking"], [seven, i % 2 ? "starstruck" : "grin"]]}
            />
          </React.Fragment>
        ))}
        <Easel position={[2.15, 0, -0.6]} rotation={[0, -0.5, 0]} text={"LA TOUR\nEIFFEL"} />
        <Stick spec={LUSTIG} at={[1.35, 0, -0.2]} facing="right" poses={[[0, "present"], [pitch, "point"], [tearing, "pointAcross"], [seven, "presentBoth"]]} faces={[[0, "smug"], [pitch, "determined"], [seven, "evil"]]} />
      </Stage>
      <FXLayer>
        <Tag at={books} out={invites + 2} x={540} y={400} text="HÔTEL DE CRILLON" bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" size={56} />
        <Tag at={five} out={pitch} x={540} y={520} text="5 SCRAP DEALERS" bg="#ffffff" size={56} rot={-3} />
        <Stamp at={tearing} out={seven - 2} x={760} y={640} text="DEMOLITION" size={96} rot={-10} />
        <Counter at={seven} x={560} y={560} from={0} to={7000} dur={18} suffix=" TONS" label="IRON" size={120} fg="#FFD43B" />
        <Stamp at={s.hit("iron") + 14} x={540} y={860} text="TOP SECRET" size={88} rot={8} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 Poisson + the confession
const S05: React.FC = () => {
  const s = useShot();
  const badly = s.hit("badly");
  const off = s.hit("off");
  const confession = s.hit("confession");
  const corrupt = s.hit("corrupt");
  const bribe = s.hit("bribe");
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={[
          { f: 0, pos: [-0.3, 1.45, 2.4], look: [-0.15, 1.2, 0], fov: 34, creep: 0.004 },
          { f: off + 6, pos: [-0.22, 1.42, 2.05], look: [-0.15, 1.22, 0], fov: 33, ease: "burst", dur: 8, creep: 0.005 },
          { f: confession + 10, pos: [0.25, 1.65, 4.3], look: [0.2, 1.4, 0], fov: 36, ease: "glide", dur: 14, creep: 0.004 },
        ]}
        dof={11}
        focus={(f) => (f < confession ? [-0.15, 1.45, 0] : [0.25, 1.45, 0])}
        shadow={{ center: [0, 0, 0], size: 5 }}
      >
        <Room w={8} d={6} h={3.8} wall="#8c1f2a" wallTex="stripes" baseboard="#d4a017" floor="carpet" floorColor="#6e1f2a" position={[0, 0, -2]} />
        <Chandelier position={[1.5, 3.3, -2]} />
        <Stick spec={POISSON} at={[-0.15, 0, 0]} facing="right" poses={[[0, "holdFront"], [off, "crossArms"], [bribe, "relaxed"]]} faces={[[0, "grin"], [badly, "starstruck"], [off, "unimpressed"], [corrupt, "thinking"], [bribe + 6, "happy"]]} />
        <Stick spec={LUSTIG} path={[[confession - 14, [1.9, 0, -0.2]], [confession + 4, [0.6, 0, 0.05]]]} facing="left" poses={[[0, "idle"], [confession + 4, "phone"]]} faces={[[0, "neutral"], [confession, "smug"], [bribe, "evil"]]} />
      </Stage>
      <FXLayer>
        <Tag at={s.hit("André")} out={off - 4} x={540} y={420} text="ANDRÉ POISSON" bg="#ffffff" size={54} />
        <Mark at={off} out={confession} x={790} y={520} ok={false} size={170} />
        <Bubble at={corrupt} out={bribe - 2} x={600} y={480} text="Psst... I'm a corrupt official." width={560} size={48} />
        <Burst at={bribe} x={560} y={500} text="BRIBE?" size={440} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 pivot + the payment
const S06: React.FC = () => {
  const s = useShot();
  const see = s.at("You");
  const proof = s.hit("proof");
  const real = s.hit("real");
  const pays = s.hit("pays");
  const plus = s.hit("plus");
  const win = s.hit("win");
  return (
    <AbsoluteFill>
      <Stage
        look="studio"
        cam={[
          { f: 0, pos: [0.2, 1.7, 4.0], look: [0, 1.35, 0], fov: 36, creep: 0.003 },
          { f: pays + 10, pos: [0.1, 1.55, 3.4], look: [0.05, 1.25, 0], fov: 36, ease: "burst", dur: 10, creep: 0.004 },
          { f: win + 8, pos: [0.3, 1.8, 4.4], look: [0, 1.3, 0], fov: 38, ease: "glide", dur: 14, creep: 0.004 },
        ]}
        kicks={[pays + 2]}
        dof={(f) => (f >= pays ? 12 : 9)}
        focus={[0, 1.35, 0]}
        shadow={{ center: [0, 0, 0], size: 5 }}
      >
        <Room w={8} d={6} h={3.8} wall="#8c1f2a" wallTex="stripes" baseboard="#d4a017" floor="carpet" floorColor="#6e1f2a" position={[0, 0, -2]} />
        <Chandelier position={[0, 3.3, -1.2]} />
        <Burst3D kind="bills" at={pays + 2} origin={[0.05, 1.05, 0.25]} count={90} power={4.5} life={60} />
        <Rain kind="bills" at={plus} spread={30} count={90} center={[0, 0, 0]} half={[1.6, 1.0]} height={3.2} />
        <Stick spec={POISSON} at={[-0.36, 0, 0]} facing="right" poses={[[0, "think"], [pays - 6, "holdOne"], [win, "relaxed"]]} faces={[[0, "thinking"], [proof, "happy"], [pays, "grin"]]} items={[[pays - 6, { kind: "briefcase", hand: "R" }], [pays + 2, null]]} />
        <Stick spec={LUSTIG} at={[0.42, 0, 0]} facing="left" poses={[[0, "handsHips"], [pays, "armsUp"]]} faces={[[0, "smug"], [pays, "joy"]]} items={[[pays + 2, { kind: "briefcase", hand: "R" }]]} />
      </Stage>
      <FXLayer>
        <Tag at={see} out={proof - 2} x={540} y={420} text="YOU SEE..." bg="#1b1b22" fg="#FFD43B" size={58} />
        <Bubble at={proof} out={pays - 4} kind="thought" x={330} y={470} text="A bribe? He must be REAL." width={500} size={46} />
        <Mark at={real} out={pays - 4} x={760} y={470} ok size={170} />
        <Counter at={pays + 4} out={win + 30} x={540} y={600} from={0} to={20000} dur={14} prefix="$" label="CASH" size={118} />
        <Counter at={plus + 2} x={540} y={600} from={20000} to={70000} dur={22} prefix="$" label="+ THE BRIBE" size={128} fg="#FFD43B" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 train to Vienna
const S07: React.FC = () => {
  const s = useShot();
  const train = s.hit("train");
  const vienna = s.hit("Vienna");
  const tx = s.f * 0.012 + Math.max(0, s.f - train) ** 1.6 * 0.004;
  return (
    <AbsoluteFill>
      <Stage
        look="golden"
        cam={(f) => {
          const k = f * 0.012 + Math.max(0, f - train) ** 1.6 * 0.004;
          return { pos: [3.4 - k * 0.85, 1.5, 9.8], look: [2.0 - k * 0.95, 1.55, 0], fov: 42, roll: 0 };
        }}
        dof={5}
        shadow={{ center: [0, 0, 0], size: 10 }}
      >
        <Ground size={120} kind="concrete" color="#b9ac96" />
        <Platform position={[0, -0.6, -3.4]} len={40} />
        <group position={[-tx, 0, 0]}>
          <Train position={[3, 0, -0.4]} carriages={2} sign="PARIS → VIENNA" smoke={s.f + 30} />
          <Stick spec={LUSTIG} at={[2.15, 0.35, 0.95]} poses={[[0, "wave"], [vienna, "waveB"]]} faces={[[0, "joy"]]} items={[[0, { kind: "bag", text: "$", hand: "L" }]]} />
        </group>
        <Building position={[-6, 0, -9]} w={10} h={8} d={4} color="#d9b98a" roof="#8a3b2e" />
        <Building position={[8, 0, -10]} w={8} h={10} d={4} color="#c9a37a" roof="#8a3b2e" />
        <Cloud position={[-8, 16, -60]} w={18} />
      </Stage>
      <FXLayer>
        <Tag at={vienna} x={540} y={430} text="NEXT STOP: VIENNA" bg="#FFD43B" size={58} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s08 waiting / Poisson embarrassed (one world, whip between two rooms)
const S08: React.FC = () => {
  const s = useShot();
  const nothing = s.hit("Nothing");
  const poisson = s.hit("Poisson");
  const emb = s.hit("embarrassed");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.6, 1.8, 3.0], look: [0, 1.2, 0], fov: 36, creep: 0.003 },
          { f: nothing + 6, pos: [0.3, 1.6, 2.2], look: [0, 1.15, 0.2], fov: 33, ease: "burst", dur: 8, creep: 0.005 },
          { f: poisson + 6, pos: [12.4, 1.7, 2.6], look: [12, 1.45, 0], fov: 34, ease: "burst", dur: 9, creep: 0.005 },
        ]}
        dof={10}
        focus={(f) => (f < poisson ? [0, 1.2, 0] : [12, 1.45, 0])}
        shadow={{ center: [6, 0, 0], size: 14 }}
      >
        <Room w={7} d={6} h={3.4} wall="#3a4a7a" wallTex="plain" baseboard="#1f2a44" floor="wood" floorColor="#6b4f3a" position={[0, 0, -1.5]} />
        <Window kind="night" position={[1.4, 1.9, -4.43]} curtain="#5a3b6e" />
        <Table w={1.4} d={0.8} position={[0, 0, 0.4]} color="#6b4f3a" />
        <Newspaper position={[-0.2, 0.83, 0.45]} rotation={[-Math.PI / 2, 0, 0.2]} headline="NOTHING TO REPORT" w={0.5} />
        <Newspaper position={[0.25, 0.835, 0.4]} rotation={[-Math.PI / 2, 0, -0.3]} headline="WEATHER: RAIN" w={0.5} />
        <Stick spec={LUSTIG} at={[0, 0.1, -0.3]} poses={[[0, "readPhone"], [nothing, "shrug"]]} faces={[[0, "thinking"], [nothing, "confused"]]} />
        {/* Poisson's office across town, in the same world (the camera whips over) */}
        <Room w={7} d={6} h={3.4} wall="#d8c39a" wallTex="stripes" baseboard="#7a4a2a" floor="wood" position={[12, 0, -1.5]} />
        <Lamp position={[13.1, 0.865, 0.25]} color="#2ab5b0" />
        <Desk position={[12, 0, 0.45]} color="#7a4a2a" />
        <Stick spec={POISSON} at={[12, 0.1, -0.2]} poses={[[0, "facepalm"]]} faces={[[0, "nervousSmile"], [emb, { eyes: "closed", mouth: "wavy", brows: "worried", extras: ["blush", "sweat"] }]]} />
      </Stage>
      <FXLayer>
        <Mark at={nothing} out={poisson - 2} x={760} y={520} ok={false} size={170} />
        <Tag at={emb} x={540} y={470} text="TOO EMBARRASSED" bg="#ff8fab" size={58} rot={-4} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s09 again + police + escape
const S09: React.FC = () => {
  const s = useShot();
  const again = s.hit("again");
  const calls = s.hit("calls");
  const police = s.hit("police");
  const escapes = s.hit("escapes");
  const america = s.hit("America");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [3.4, 1.9, 5.4], look: [0, 1.3, 0], fov: 40, creep: 0.003 },
          { f: again + 6, pos: [2.4, 1.6, 3.8], look: [0, 1.3, 0], fov: 37, ease: "burst", dur: 8, creep: 0.004 },
          { f: calls + 6, pos: [-1.5, 1.5, 2.7], look: [-1.9, 1.18, 0], fov: 34, ease: "burst", dur: 10, creep: 0.004 },
          { f: escapes + 10, pos: [3.6, 2.2, 6.0], look: [5.6, 1.3, -4.6], fov: 42, ease: "glide", dur: 16, creep: 0.003 },
        ]}
        kicks={[again + 1, police + 1]}
        dof={(f) => (f >= calls && f < escapes ? 10 : 5)}
        shadow={{ center: [2, 0, -2], size: 14 }}
      >
        <ParisSet towerZ={-30} />
        <Water position={[9, -0.05, -9]} size={20} />
        <Ship position={[8.5, 0, -7.5]} rotation={[0, -0.5, 0]} sign="TO AMERICA" />
        {[0, 1, 2].map((i) => (
          <Stick key={i} spec={DEALERS[(i + 1) % 4]} at={[-1.9 + i * 0.85 * (i === 0 ? 0 : 1), 0, 0.3 - i * 0.1]} poses={[[0, "holdFront"], ...(i === 0 ? ([[calls, "phone"]] as [number, string][]) : [])]} faces={[[0, "happy"], [calls, i === 0 ? "determined" : "shocked"]]} items={i === 0 ? [[calls, { kind: "phone", hand: "R" }]] : []} />
        ))}
        <Stick
          spec={LUSTIG}
          path={[[escapes, [1.0, 0, 0]], [escapes + 34, [5.4, 0, -4.2]]]}
          run
          poses={[[0, "present"], [again, "presentBoth"]]}
          faces={[[0, "smug"], [police, "panic"]]}
          items={[[0, { kind: "sign", text: "FOR SALE", hand: "R" }], [police, null]]}
        />
        <PoliceLight position={[-3.2, 2.2, 0.5]} t={Math.max(0, s.f - police)} />
        {s.f >= police ? <Stick spec={COP} at={[-3.4, 0, 0.6]} pop={police} poses={[[0, "point"]]} faces={[[0, "angry"]]} /> : null}
      </Stage>
      <FXLayer>
        <Stamp at={again} out={calls - 2} x={540} y={520} text="AGAIN?!" size={140} rot={-8} />
        <FlashFX at={police} dur={10} color="#ff2a2a" max={0.28} blend="screen" />
        <Tag at={america} x={540} y={440} text="→ TO AMERICA" bg="#ffffff" fg="#22305a" size={60} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s10 archive, empty drawer, the wink
const S10: React.FC = () => {
  const s = useShot();
  const single = s.hit("single");
  const report = s.hit("report");
  const proof = s.hit("proof");
  const word = s.hit("word");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [1.9, 1.85, 4.2], look: [0.45, 1.05, -0.2], fov: 38, creep: 0.004 },
          { f: report + 6, pos: [0.9, 1.6, 2.6], look: [0.3, 0.95, -0.1], fov: 36, ease: "burst", dur: 9, creep: 0.004 },
          { f: proof + 12, pos: [-0.6, 1.95, 1.6], look: [-1.2, 1.9, -2.9], fov: 34, ease: "glide", dur: 16, creep: 0.005 },
        ]}
        dof={(f) => (f >= report && f < proof ? 12 : 8)}
        focus={(f) => (f < proof ? [0, 0.9, 0.3] : [-1.2, 1.9, -2.9])}
        shadow={{ center: [0, 0, -1], size: 7 }}
      >
        <Room w={8} d={6} h={3.6} wall="#c9b48a" wallTex="plain" baseboard="#6b4f3a" floor="wood" floorColor="#7a5a3a" position={[0, 0, -0.1]} />
        {[-2.6, -1.6, 1.4, 2.4].map((x) => (
          <FileDrawer key={x} position={[x, 0, -2.6]} label="1924" />
        ))}
        <FileDrawer position={[0, 0, -0.35]} label="POLICE 1925" open={Math.min(1, Math.max(0, (s.f - single) / 10))} empty />
        <Stick spec={HISTORIAN} at={[0.85, 0, 0.25]} facing="left" poses={[[0, "holdOne"], [report, "shrug"]]} faces={[[0, "thinking"], [report, "confused"]]} items={[[0, { kind: "magnifier", hand: "R" }]]} />
        {/* the portrait on the wall winks at the end */}
        <Box size={[1.25, 1.55, 0.08]} color="#c9a227" position={[-1.2, 1.95, -2.96]} r={0.03} />
        <Box size={[1.05, 1.35, 0.02]} color="#f4efe2" position={[-1.2, 1.95, -2.9]} r={0.01} />
        <Stick spec={LUSTIG} at={[-1.2, 1.1, -2.87]} height={1.25} shadow={false} poses={[[0, "idle"], [word, "salute"]]} faces={[[0, "smug"], [word, { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] }]]} />
      </Stage>
      <FXLayer>
        <Tag at={single} out={report + 20} x={540} y={430} text="POLICE REPORTS: 0" bg="#ffffff" fg="#d62f3a" size={56} />
        <Mark at={report} out={proof} x={790} y={560} ok={false} size={160} />
        <Tag at={word} x={540} y={470} text="V. LUSTIG" bg="#1b1b22" fg="#FFD43B" fontName="DM Serif Display" size={58} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#9cc8f0" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, s10: S10 }} />
);
