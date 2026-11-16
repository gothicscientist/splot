// scenes: hand-written
// "My ex gave me and my best friend the same Christmas gift" - Tiff Friendsgiving reel (Mia, Jake off-screen).
// pileGo! is the punchline in s06; the brand end card (pilego.app) holds over the voice tail in s07.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { Face } from "../../styles/stickworld/draw";
import { backOut, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, DinnerSet, JacketStand, PileGoBoard, TiffRoom } from "../_tiff/set";
import { ChatThread, EndCard } from "../_tiff/ui";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const MIA = CAST.mia;
const FA = CAST.friendA;
const FB = CAST.friendB;
const LEATHER = { color: "#1f1d22", shade: "#141217" };
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
const SMIRK: Face = { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] };
const COLD: Face = { eyes: "lidded", mouth: "flat", brows: "angry" };

// the dinner party layout (DinnerSet: table centre z -2.0, door at x 3.1)
const Party: React.FC<{ mia?: number; tiffFaces?: [number, string | Face][]; friendsFaces?: [number, string | Face][] }> = ({ mia, tiffFaces = [[0, "happy"]], friendsFaces = [[0, "happy"]] }) => (
  <>
    <DinnerSet />
    <Stick spec={FA} at={[-0.55, 0, -2.8]} poses={[[0, "relaxed"]]} faces={friendsFaces} />
    <Stick spec={FB} at={[0.55, 0, -2.85]} poses={[[0, "relaxed"]]} faces={friendsFaces} />
    <Stick spec={TIFF} at={[-1.75, 0, -2.25]} facing="right" poses={[[0, "holdOne"]]} faces={tiffFaces} items={[[0, { kind: "cup", hand: "R", color: "#c94a3a" }]]} />
    {mia !== undefined ? <Stick spec={MIA} at={[2.45, 0, -3.5]} pop={mia} facing="left" poses={[[0, "crossArms"]]} faces={[[0, COLD]]} /> : null}
  </>
);

// ------------------------------------------------------------------------------------------------ s01 hook: she showed up
const S01: React.FC = () => {
  const s = useShot();
  const showed = s.hit("showed");
  const fg = s.hit("Friendsgiving");
  const un = s.hit("uninvited");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [1.6, 1.5, 0.8], look: [2.2, 1.35, -3.5], fov: 40 },
          { f: un + 2, pos: [1.9, 1.5, -0.4], look: [2.4, 1.4, -3.5], fov: 36, ease: "burst", dur: 9 },
        ]}
        kicks={[fg + 2, un + 2]}
        dof={6}
        focus={[2.4, 1.3, -3.5]}
        shadow={{ center: [0.5, 0, -2.6], size: 9 }}
      >
        <Party mia={0} friendsFaces={[[0, "happy"], [fg, "shocked"]]} />
      </Stage>
      <FXLayer>
        <Tag at={0} x={540} y={260} text="SHE SHOWED UP." bg="#1b1b1f" fg="#ffffff" size={64} rot={-2} />
        <Tag at={showed} x={300} y={420} text="🦃 FRIENDSGIVING" bg="#d98b3a" fg="#1b1b1f" size={50} rot={-4} />
        <Stamp at={un} x={700} y={980} text="UNINVITED" color="#d62f3a" size={96} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 who she is, the silence
const S02: React.FC = () => {
  const s = useShot();
  const mia = s.hit("Mia");
  const ex = s.hit("ex");
  const quiet = s.hit("quiet");
  const turkey = s.hit("turkey");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [-1.6, 1.48, -0.5], look: [-1.75, 1.36, -2.25], fov: 38 },
          { f: quiet, pos: [0.0, 1.6, 1.4], look: [0.0, 1.15, -2.5], fov: 46, ease: "glide", dur: 10 },
          { f: turkey + 2, pos: [0.0, 1.35, 0.1], look: [0.0, 1.05, -2.0], fov: 36, ease: "burst", dur: 9 },
        ]}
        kicks={[ex + 2]}
        dof={(f) => (f < quiet ? 9 : 4)}
        focus={[-1.75, 1.3, -2.25]}
        shadow={{ center: [0, 0, -2.4], size: 9 }}
      >
        <Party mia={-30} tiffFaces={[[0, "unimpressed"], [ex, "angry"]]} friendsFaces={[[0, "worried"], [quiet, "scared"]]} />
      </Stage>
      <FXLayer>
        <Tag at={mia} out={quiet} x={540} y={300} text="MIA." bg="#f2c94c" fg="#1b1b1f" size={70} rot={-3} />
        <Tag at={ex} out={quiet} x={540} y={430} text="(hooked up with my ex)" bg="#ffffff" fg="#1b1b1f" size={46} rot={2} />
        <Tag at={quiet} x={540} y={300} text="…" bg="#ffffff" fg="#1b1b1f" size={70} />
        <Tag at={turkey} x={540} y={430} text="even the turkey 👀" bg="#d98b3a" fg="#1b1b1f" size={50} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 "I'm here about the jacket"
const S03: React.FC = () => {
  const s = useShot();
  const apol = s.hit("apologize");
  const jacket = s.hit("jacket");
  const leather = s.hit("leather");
  const xmas = s.hit("Christmas");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [2.25, 1.5, -1.6], look: [2.45, 1.4, -3.5], fov: 38 },
          { f: jacket + 2, pos: [2.3, 1.52, -2.1], look: [2.45, 1.45, -3.5], fov: 34, ease: "burst", dur: 8 },
          { f: leather, pos: [-1.4, 1.45, -0.3], look: [-1.95, 1.25, -2.4], fov: 40, ease: "glide", dur: 12 },
        ]}
        kicks={[jacket + 2]}
        dof={8}
        focus={[2.45, 1.4, -3.5]}
        shadow={{ center: [0, 0, -2.6], size: 10 }}
      >
        <Party mia={-30} tiffFaces={[[0, "angry"], [jacket, "confused"], [leather, "worried"]]} friendsFaces={[[0, "scared"]]} />
        <JacketStand position={[-2.45, 0, -2.75]} {...LEATHER} tag={false} />
      </Stage>
      <FXLayer>
        <Tag at={apol} out={jacket} x={540} y={300} text="NOT SORRY." bg="#1b1b1f" fg="#ffffff" size={60} rot={-3} />
        <Tag at={jacket} out={leather} x={540} y={300} text="…THE JACKET?" bg="#f2c94c" fg="#1b1b1f" size={62} rot={2} />
        <Tag at={xmas} x={540} y={300} text="🎁 FROM JAKE · XMAS" bg="#7a1f24" fg="#ffffff" size={54} rot={-2} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 the exact same jacket
const S04: React.FC = () => {
  const s = useShot();
  const pulled = s.hit("pulled");
  const same = s.hit("exact");
  const size = s.hit("size");
  const note = s.hit("note");
  const xmas = s.hit("Christmas");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.05, 1.5, 1.5], look: [0.05, 1.2, -2.9], fov: 44 },
          { f: same + 2, pos: [0.05, 1.5, 0.7], look: [0.05, 1.25, -2.9], fov: 42, ease: "burst", dur: 9 },
          { f: size, pos: [0.15, 1.5, 1.3], look: [0.05, 1.2, -2.9], fov: 44, ease: "glide", dur: 40 },
        ]}
        kicks={[same + 2]}
        dof={4}
        focus={[0.35, 1.2, -2.9]}
        shadow={{ center: [0.3, 0, -2.9], size: 6 }}
      >
        <DiningNoTable />
        <Stick spec={TIFF} at={[-0.35, 0, -2.85]} facing="right" poses={[[0, "crossArms"], [same, "scared"]]} faces={[[0, COLD], [same, "shocked"], [note, "worried"]]} />
        <Stick spec={MIA} at={[0.45, 0, -2.85]} facing="left" poses={[[0, "holdOne"], [same, "present"]]} faces={[[0, COLD], [same, "determined"]]} items={[[0, { kind: "bag", hand: "R", color: "#7a1f24" }], [same, null]]} />
        <JacketStand position={[-0.85, 0, -3.25]} {...LEATHER} tag={false} />
        <group position={[0.95, 0, -3.25]} scale={pop(f, same, 8)}>
          <JacketStand position={[0, 0, 0]} {...LEATHER} tag={false} />
        </group>
      </Stage>
      <FXLayer>
        <FlashFX at={same} dur={5} max={0.5} />
        <Stamp at={same} x={540} y={300} text="SAME JACKET" color="#d62f3a" size={96} />
        <Tag at={size} x={260} y={980} text="SAME SIZE" bg="#ffffff" fg="#1b1b1f" size={46} rot={-5} />
        <Tag at={note} x={540} y={470} text="“for my favorite girl” x2" bg="#ffffff" fg="#7a1f24" size={44} rot={2} />
        <Tag at={xmas} x={820} y={980} text="SAME XMAS 🎄" bg="#2f5d50" fg="#ffffff" size={46} rot={5} />
      </FXLayer>
    </AbsoluteFill>
  );
};
// the dining room without the table, so the two jacket stands and both women read clearly
const DiningNoTable: React.FC = () => <DinnerSet table={false} door={false} />;

// ------------------------------------------------------------------------------------------------ s05 one present, two girls
const S05: React.FC = () => {
  const s = useShot();
  const one = s.hit("one");
  const both = s.hit("both");
  const stared = s.hit("stared");
  const minute = s.hit("minute");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.05, 1.48, 0.5], look: [0.05, 1.36, -2.85], fov: 40 },
          { f: stared, pos: [0.05, 1.47, -0.1], look: [0.05, 1.38, -2.85], fov: 38, ease: "glide", dur: 120 },
        ]}
        kicks={[both + 2]}
        dof={6}
        focus={[0.05, 1.38, -2.85]}
        shadow={{ center: [0.3, 0, -2.9], size: 6 }}
      >
        <DiningNoTable />
        <Stick spec={TIFF} at={[-0.3, 0, -2.85]} facing="right" poses={[[0, "crossArms"], [both, "scared"], [stared, "relaxed"]]} faces={[[0, "angry"], [both, "shocked"], [stared, "unimpressed"]]} talking={s.speaking(["b08", "b09"])} />
        <Stick spec={MIA} at={[0.4, 0, -2.85]} facing="left" poses={[[0, "crossArms"], [both, "scared"], [stared, "relaxed"]]} faces={[[0, "determined"], [both, "shocked"], [stared, "unimpressed"]]} />
      </Stage>
      <FXLayer>
        <Tag at={one} out={both} x={540} y={300} text="1 PRESENT 🎁" bg="#ffffff" fg="#1b1b1f" size={58} rot={-3} />
        <Stamp at={both} out={stared} x={540} y={300} text="2 GIRLS" color="#d62f3a" size={100} />
        <Tag at={minute} x={540} y={300} text="⏱ 1:00" bg="#1b1b1f" fg="#ffffff" size={64} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 list both: real vs knockoff
const S06: React.FC = () => {
  const s = useShot();
  const listed = s.hit("listed");
  const pg = s.hit("pileGo");
  const mine = s.hit("Mine");
  const hers = s.hit("Hers");
  const knock = s.hit("knockoff");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.1, 1.5, 2.2], look: [0.0, 1.6, -3.0], fov: 46 },
          { f: mine, pos: [0.1, 1.45, 1.2], look: [0.1, 1.3, -1.6], fov: 42, ease: "glide", dur: 12 },
          { f: knock + 2, pos: [0.4, 1.47, 0.6], look: [0.45, 1.35, -1.6], fov: 36, ease: "burst", dur: 8 },
        ]}
        kicks={[knock + 2]}
        dof={(f) => (f < mine ? 3 : 7)}
        focus={[0.1, 1.35, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom night chair={false} />
        <Stick spec={TIFF} at={[-0.35, 0, -1.6]} facing="right" poses={[[0, "phone"], [mine, "victory"]]} faces={[[0, "determined"], [mine, "joy"], [knock, SMIRK]]} items={[[0, { kind: "phone", hand: "R" }], [mine, null]]} talking={s.speaking(["b10", "b11"])} />
        <Stick spec={MIA} at={[0.55, 0, -1.6]} facing="left" poses={[[0, "phone"], [knock, "facepalm"]]} faces={[[0, "determined"], [knock, "furious"]]} items={[[0, { kind: "phone", hand: "R" }], [knock, null]]} />
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.1 - Math.floor(k / 3) * 0.52, -4.25]} scale={pop(f, listed + k * 3)}>
            <AppBoard app={app} w={0.58} line="Leather jacket x2" />
          </group>
        ))}
        <group position={[-0.15, 2.85, -4.25]} scale={pop(f, pg, 10)}>
          <PileGoBoard w={1.3} />
        </group>
        <Burst3D kind="confetti" at={mine} origin={[-0.35, 1.7, -1.6]} count={50} power={3} />
      </Stage>
      <FXLayer>
        <Tag at={mine} x={300} y={330} text="TIFF'S: SOLD $200" bg="#e9f7ec" fg="#1f7a3a" size={48} rot={-4} />
        <Tag at={hers} x={780} y={450} text="MIA'S: …" bg="#ffffff" fg="#1b1b1f" size={48} rot={4} />
        <Stamp at={knock} x={760} y={600} text="FAKE" color="#d62f3a" size={120} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 kicker + end card
const S07: React.FC = () => {
  const s = useShot();
  const funny = s.hit("Funny");
  const mad = s.hit("mad");
  const right = s.hit("right");
  const end = s.end("person");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.1, 1.48, 1.6], look: [0.1, 1.35, -1.6], fov: 42 },
          { f: right, pos: [0.3, 1.5, 0.9], look: [0.3, 1.38, -1.6], fov: 38, ease: "glide", dur: 20 },
        ]}
        kicks={[mad + 2]}
        dof={6}
        focus={[0.1, 1.35, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom night chair={false} />
        <Stick spec={TIFF} at={[-0.4, 0, -1.6]} facing="right" poses={[[0, "holdOne"]]} faces={[[0, SMIRK]]} items={[[0, { kind: "cup", hand: "R", color: "#f3efe6" }]]} talking={s.speaking(["b12"])} />
        <Stick spec={MIA} at={[0.6, 0, -1.6]} facing="left" poses={[[0, "readPhone"], [mad, "phone"]]} faces={[[0, "angry"], [mad, "furious"]]} items={[[0, { kind: "phone", hand: "R" }]]} />
      </Stage>
      <FXLayer>
        <Tag at={funny} out={mad} x={300} y={300} text="sip ☕" bg="#ffffff" fg="#1b1b1f" size={48} rot={-5} />
        <ChatThread
          at={mad}
          x={620}
          y={420}
          w={560}
          rot={3}
          title="jake 🐍"
          msgs={[
            { at: mad + 3, text: "A KNOCKOFF??", me: true },
            { at: mad + 12, text: "you're dead to me", me: true },
          ]}
        />
        <EndCard at={end + 8} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background={BRAND.bg} scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
