// scenes: hand-written
// "My date showed up wearing my jacket" - story reel starring Tiff; pileGo! appears only as the closing plug (s08).
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Bubble, Burst, Arrow, FXLayer } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { StickSpec } from "../../styles/stickworld/draw";
import { Box } from "../../styles/stickworld/props";
import { backOut, clamp, invLerp } from "../../core/anim";
import type { Timeline, Vec3 } from "../../core/types";
import { APPS, AppBoard, BRAND, CafeSet, PileGoBoard, TiffRoom } from "../_tiff/set";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const DATE: StickSpec = { body: "#6b7a3a", outfit: "jacket", hair: "short", hairColor: "#3a2416", seed: 77 };
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
// cafe blocking: Tiff left of the table, her date right of it
const TIFF_AT: Vec3 = [-0.55, 0, -2.0];
const DATE_AT: Vec3 = [0.6, 0, -2.0];

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const my = s.hit("my");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.25, 1.5, 2.4], look: [0.1, 1.3, -2.1], fov: 42 },
          { f: my + 3, pos: [0.1, 1.45, 1.5], look: [0.05, 1.3, -2.1], fov: 38, ease: "burst", dur: 9 },
        ]}
        kicks={[my + 2]}
        dof={4}
        focus={[0, 1.3, -2.0]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "wave"], [my, "scared"]]} faces={[[0, "happy"], [my, "shocked"]]} talking={s.speaking(["b01"])} />
        <Stick spec={DATE} path={[[0, [2.2, 0, -2.0]], [26, DATE_AT]]} facing="left" poses={[[0, "wave"], [30, "handsHips"]]} faces={[[0, "grin"]]} />
      </Stage>
      <FXLayer>
        <Tag at={my} x={760} y={430} text="MY JACKET?!" bg="#ffffff" fg="#d62f3a" size={60} rot={6} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the coffee stain
const S02: React.FC = () => {
  const s = useShot();
  const mine = s.hit("Mine");
  const coffee = s.hit("coffee");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.2, 1.5, 0.9], look: [0.15, 1.3, -2.1], fov: 38 },
          { f: mine + 3, pos: [0.35, 1.35, 0.1], look: [0.45, 1.15, -2.0], fov: 34, ease: "burst", dur: 9 },
          { f: coffee, pos: [0.55, 1.2, -0.6], look: [0.7, 1.0, -2.0], fov: 32, ease: "glide", dur: 20 },
        ]}
        kicks={[mine + 2]}
        dof={(f) => (f >= coffee ? 12 : 8)}
        focus={(f) => (f >= coffee ? [0.75, 1.0, -1.95] : [0.3, 1.25, -2.0])}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "holdOne"]]} faces={[[0, { eyes: "lidded", mouth: "flat", brows: "angry" }]]} items={[[0, { kind: "magnifier", hand: "R" }]]} talking={s.speaking(["b02"])} />
        <Stick spec={DATE} at={DATE_AT} facing="left" poses={[[0, "handsHips"]]} faces={[[0, "happy"]]} />
        {/* the stain on his sleeve */}
        <Box size={[0.07, 0.09, 0.01]} color="#6b4423" position={[0.86, 1.0, -1.9]} r={0.03} />
      </Stage>
      <FXLayer>
        <Stamp at={mine} out={coffee} x={540} y={380} text="MINE." color="#d62f3a" size={140} />
        <Tag at={coffee} x={760} y={380} text="COFFEE STAIN" bg="#6b4423" fg="#ffffff" size={52} rot={4} />
        <Arrow at={coffee + 4} x={760} y={430} x2={720} y2={700} color="#ffffff" width={12} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 flashback: March
const S03: React.FC = () => {
  const s = useShot();
  const sold = s.hit("sold");
  const march = s.hit("March");
  const chair = s.hit("chair");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.15, 1.4, 2.4], look: [-0.2, 1.15, -1.45], fov: 40 },
          { f: chair, pos: [-0.35, 1.25, 1.4], look: [-0.5, 1.0, -1.6], fov: 38, ease: "glide", dur: 14 },
        ]}
        dof={5}
        focus={[-0.2, 1.1, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom />
        <Box size={[0.5, 0.32, 0.4]} color="#c99a5b" position={[0.75, 0.16, -1.0]} r={0.02} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} poses={[[0, "holdOne"], [march, "carry"]]} faces={[[0, "happy"], [march, "grin"]]} items={[[0, { kind: "sign", text: "OLIVE JACKET", hand: "R", color: "#6b7a3a" }], [march, null]]} talking={s.speaking(["b03"])} />
      </Stage>
      <FXLayer>
        <Tag at={0} x={540} y={300} text="MARCH" bg={BRAND.bg} fg={BRAND.cream} size={60} />
        <Tag at={sold} x={300} y={450} text="SOLD ONLINE" bg="#ffffff" fg="#1f7a3a" size={50} rot={-5} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 his favorite thing
const S04: React.FC = () => {
  const s = useShot();
  const fav = s.hit("favorite");
  const found = s.hit("found");
  const fit = s.hit("fit");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.0, 1.5, 2.2], look: [0.0, 1.3, -2.1], fov: 42 },
          { f: fav, pos: [0.35, 1.45, 1.2], look: [0.4, 1.35, -2.0], fov: 38, ease: "glide", dur: 18 },
          { f: found, pos: [0.0, 1.5, 2.0], look: [0.0, 1.3, -2.1], fov: 42, ease: "glide", dur: 22 },
        ]}
        kicks={[fit + 2]}
        dof={4}
        focus={[0.2, 1.3, -2.0]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "holdFront"], [fit, "crossArms"]]} faces={[[0, "nervousSmile"], [fit, { eyes: "dot", mouth: "teeth", brows: "worried", extras: ["sweat"] }]]} talking={s.speaking(["b04", "b05"])} />
        <Stick spec={DATE} at={DATE_AT} facing="left" poses={[[0, "presentBoth"], [fav, "think"], [fit, "victory"]]} faces={[[0, "happy"], [fav, "love"], [fit, "joy"]]} />
        <Burst3D kind="confetti" at={fit} origin={[0.6, 1.8, -2.0]} count={50} power={3} />
      </Stage>
      <FXLayer>
        <Bubble at={fav} out={found} x={780} y={360} text="My favorite thing!" kind="speech" tail="down" size={46} width={360} />
        <Tag at={found} x={540} y={330} text="FOUND IT SECONDHAND" bg="#ffffff" fg="#1b1b1f" size={48} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 do I tell him?
const S05: React.FC = () => {
  const s = useShot();
  const tell = s.hit("tell");
  const first = s.hit("first");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.5, 1.6, -0.3], look: [-0.55, 1.45, -2.0], fov: 36 },
          { f: first, pos: [-0.55, 1.6, -0.75], look: [-0.55, 1.5, -2.0], fov: 32, ease: "burst", dur: 9 },
        ]}
        kicks={[first + 2]}
        dof={12}
        focus={[-0.55, 1.45, -2.0]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "think"]]} faces={[[0, "thinking"], [first, "worried"]]} talking={s.speaking(["b06"])} />
      </Stage>
      <FXLayer>
        <Bubble at={tell} x={760} y={380} text="Tell him??" kind="thought" size={52} width={300} />
        <Tag at={first} x={300} y={420} text="FIRST DATE" bg="#d62f3a" fg="#ffffff" size={54} rot={-6} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 the spill
const S06: React.FC = () => {
  const s = useShot();
  const spills = s.hit("spills");
  const same = s.hit("same");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.2, 1.45, 1.6], look: [0.15, 1.25, -2.1], fov: 42 },
          { f: spills + 3, pos: [0.45, 1.3, 0.6], look: [0.55, 1.1, -2.0], fov: 36, ease: "burst", dur: 9 },
          { f: same, pos: [0.65, 1.15, -0.4], look: [0.75, 1.0, -2.0], fov: 32, ease: "burst", dur: 9 },
        ]}
        kicks={[spills + 2, same + 2]}
        dof={(f) => (f >= same ? 12 : 6)}
        focus={(f) => (f >= same ? [0.8, 1.0, -1.95] : [0.3, 1.2, -2.0])}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet cups={false} />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "relaxed"], [spills, "facepalm"]]} faces={[[0, "happy"], [spills, "shocked"]]} talking={s.speaking(["b07"])} />
        <Stick spec={DATE} at={DATE_AT} facing="left" poses={[[0, "holdOne"], [spills, "scared"]]} faces={[[0, "happy"], [spills, "panic"]]} items={[[0, { kind: "cup", hand: "R" }], [spills, null]]} />
        <Box size={[0.12, 0.16, 0.01]} color="#6b4423" position={[0.86, 1.0, -1.9]} r={0.05} scale={f2(s.f, spills)} />
      </Stage>
      <FXLayer>
        <Burst at={spills} out={same} x={760} y={560} text="SPLASH!" color="#c98a52" size={300} />
        <Tag at={same} x={540} y={340} text="SAME SLEEVE" bg="#6b4423" fg="#ffffff" size={60} rot={-4} />
      </FXLayer>
    </AbsoluteFill>
  );
};
/** stain grows in after the spill */
const f2 = (f: number, at: number) => (f < at ? 0.001 : clamp(invLerp(at, at + 6, f)));

// ------------------------------------------------------------------------------------------------ s07 he laughed, date #2
const S07: React.FC = () => {
  const s = useShot();
  const told = s.hit("told");
  const laughed = s.hit("laughed");
  const second = s.hit("Second");
  const again = s.hit("again");
  return (
    <AbsoluteFill>
      <Stage
        look="golden"
        cam={[
          { f: 0, pos: [0.0, 1.5, 2.2], look: [0.0, 1.3, -2.1], fov: 42 },
          { f: second, pos: [0.0, 1.5, 2.6], look: [0.1, 1.3, -2.1], fov: 44, ease: "glide", dur: 24 },
        ]}
        kicks={[laughed + 2]}
        dof={4}
        focus={[0, 1.3, -2.0]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <CafeSet />
        <Stick spec={TIFF} at={TIFF_AT} poses={[[0, "shrug"], [laughed, "cheer"], [second, "wave"]]} faces={[[0, "nervousSmile"], [laughed, "joy"], [second, "love"]]} talking={s.speaking(["b08", "b09"])} />
        <Stick
          spec={DATE}
          path={[[0, DATE_AT], [second + 6, DATE_AT], [again + 6, [1.7, 0, -2.3]]]}
          facing="left"
          poses={[[0, "think"], [told, "headScratch"], [laughed, "armsUp"], [second, "wave"]]}
          faces={[[0, "confused"], [laughed, { eyes: "closed", mouth: "laugh", brows: "raised", extras: ["tears"] }], [second, "grin"]]}
        />
      </Stage>
      <FXLayer>
        <Burst at={laughed} out={second} x={540} y={380} text="HAHAHA" size={300} />
        <Tag at={second} x={540} y={330} text="DATE #2: FRIDAY" bg="#ffffff" fg="#e8336b" size={58} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s08 quick plug
const S08: React.FC = () => {
  const s = useShot();
  const list = s.hit("list");
  const pg = s.hit("pileGo");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.35, 1.8], look: [-0.2, 1.15, -1.45], fov: 40 },
          { f: list, pos: [-0.15, 1.6, 2.3], look: [-0.15, 1.75, -3.0], fov: 46, ease: "glide", dur: 16 },
        ]}
        kicks={[pg + 2]}
        dof={3}
        focus={[0, 1.3, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom pile={1 - 0.5 * clamp(invLerp(pg, pg + 25, f))} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} poses={[[0, "pointAcross"], [pg, "victory"]]} faces={[[0, "smug"], [pg, "joy"]]} items={[[0, { kind: "phone", hand: "R" }], [pg, null]]} talking={s.speaking(["b10"])} />
        <group position={[-0.15, 2.95, -4.25]} scale={pop(f, pg, 10)}>
          <PileGoBoard w={1.3} />
        </group>
        {APPS.map((app, i) => (
          <group key={app.name} position={[-0.85 + (i % 3) * 0.7, 2.2 - Math.floor(i / 3) * 0.52, -4.25]} scale={pop(f, list + i * 3)}>
            <AppBoard app={app} w={0.58} />
          </group>
        ))}
      </Stage>
      <FXLayer>
        <Tag at={pg + 6} x={540} y={1020} text="pilego.app" bg={BRAND.sage} fg={BRAND.bg} size={56} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#9cc8f0" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08 }} />
);
