// scenes: hand-written
// "My ex bought his own hoodie back from me" - story reel starring Tiff; pileGo! appears only as the closing plug (s07).
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Bubble, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { StickSpec } from "../../styles/stickworld/draw";
import { backOut, clamp, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, ExRoom, PileGoBoard, TiffRoom } from "../_tiff/set";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const GREY = "#9aa0a8";
const EX: StickSpec = CAST.jake;
const BESTIE: StickSpec = CAST.mia;
const HOODIE = { kind: "sign" as const, text: "HIS HOODIE", hand: "R" as const, color: GREY };
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const hoodie = s.hit("hoodie");
  const me = s.hit("me");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.3, 1.45, 1.4], look: [0.15, 1.3, -1.6], fov: 40 },
          { f: me + 3, pos: [0.2, 1.5, 0.6], look: [0.1, 1.4, -1.6], fov: 36, ease: "burst", dur: 9 },
        ]}
        kicks={[me + 2]}
        dof={(f) => (f >= me ? 11 : 7)}
        focus={[0, 1.35, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "holdOne"], [me, "handsHips"]]} faces={[[0, "happy"], [me, { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] }]]} items={[[0, HOODIE], [me, null]]} talking={s.speaking(["b01"])} />
      </Stage>
      <FXLayer>
        <Tag at={hoodie} out={me} x={300} y={420} text="HIS HOODIE" bg="#ffffff" fg="#1b1b1f" size={56} rot={-5} />
        <Stamp at={me} x={540} y={380} text="SOLD TO HIM" color="#d62f3a" size={110} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 three months on the chair
const S02: React.FC = () => {
  const s = useShot();
  const broke = s.hit("broke");
  const three = s.hit("three");
  const chair = s.hit("chair");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.15, 1.35, 2.4], look: [-0.2, 1.12, -1.45], fov: 40 },
          { f: three, pos: [-0.4, 1.3, 0.6], look: [-0.6, 1.05, -1.6], fov: 36, ease: "glide", dur: 24 },
        ]}
        kicks={[chair + 2]}
        dof={(f) => (f >= three ? 10 : 5)}
        focus={(f) => (f >= three ? [-0.6, 1.0, -1.6] : [-0.2, 1.1, -1.5])}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom pile={0.45 + 0.55 * clamp(invLerp(three, chair + 10, f))} top={GREY} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "relaxed"], [broke, "crossArms"]]} faces={[[0, "neutral"], [broke, "sad"]]} talking={s.speaking(["b02", "b03"])} />
      </Stage>
      <FXLayer>
        <Tag at={three} x={540} y={330} text="3 MONTHS" bg={BRAND.bg} fg={BRAND.cream} size={66} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 burn it / it's a nice hoodie
const S03: React.FC = () => {
  const s = useShot();
  const burn = s.hit("burn");
  const said = s.hit("said", 2);
  const nice = s.hit("nice");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.05, 1.45, 2.6], look: [0.05, 1.3, -1.9], fov: 46 },
          { f: said, pos: [0.0, 1.45, 2.2], look: [0.0, 1.32, -1.9], fov: 46, ease: "glide", dur: 18 },
        ]}
        kicks={[burn + 2]}
        dof={5}
        focus={[0, 1.3, -1.9]}
        shadow={{ center: [0, 0, -1.9], size: 7 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[-0.4, 0, -1.9]} poses={[[0, "holdFront"], [nice, "holdOne"]]} faces={[[0, "worried"], [said, "determined"], [nice, "love"]]} items={[[0, HOODIE]]} talking={s.speaking(["b04"])} />
        <Stick spec={BESTIE} at={[0.45, 0, -1.9]} facing="left" poses={[[0, "holdOne"], [nice, "facepalm"]]} faces={[[0, "evil"], [nice, "unimpressed"]]} items={[[0, { kind: "torch", hand: "R" }]]} />
        <Burst3D kind="sparks" at={burn} origin={[0.7, 1.45, -1.85]} count={40} power={2} />
      </Stage>
      <FXLayer>
        <Bubble at={burn} out={said} x={720} y={360} text="Burn it." kind="speech" tail="down" size={52} width={280} />
        <Bubble at={said} x={330} y={360} text="It's a NICE hoodie!" kind="speech" tail="down" size={44} width={360} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 listing it
const S04: React.FC = () => {
  const s = useShot();
  const listed = s.hit("listed");
  const size = s.hit("Size");
  const smells = s.hit("Smells");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.1, 1.5, 1.5], look: [0.0, 1.55, -3.0], fov: 42 },
          { f: size, pos: [0.0, 1.7, 1.0], look: [0.0, 1.95, -4.2], fov: 40, ease: "glide", dur: 16 },
        ]}
        kicks={[listed + 2]}
        dof={4}
        focus={[0, 1.4, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0.3, 0, -1.6]} poses={[[0, "holdOne"], [smells, "facepalm"]]} faces={[[0, "determined"], [smells, "unimpressed"]]} items={[[0, { kind: "phone", hand: "R" }]]} talking={s.speaking(["b05"])} />
        <group position={[-0.25, 2.2, -4.3]} scale={pop(f, listed + 4, 10)}>
          <AppBoard app={APPS[2]} w={1.0} line="Grey hoodie  L" />
        </group>
      </Stage>
      <FXLayer>
        <FlashFX at={listed} dur={5} max={0.45} />
        <Tag at={size} x={760} y={560} text="SIZE L" bg="#ffffff" fg="#1b1b1f" size={56} rot={6} />
        <Tag at={smells} x={540} y={300} text="SMELLS LIKE REGRET" bg={GREY} fg="#1b1b1f" size={52} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 sold... to a familiar name
const S05: React.FC = () => {
  const s = useShot();
  const week = s.hit("week");
  const sells = s.hit("sells");
  const name = s.hit("name");
  const fam = s.hit("familiar");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.5, 1.0], look: [0.0, 1.4, -1.6], fov: 38 },
          { f: name, pos: [0.0, 1.55, 0.2], look: [0.0, 1.5, -1.6], fov: 34, ease: "glide", dur: 16 },
          { f: fam + 2, pos: [0.0, 1.55, 0.05], look: [0.0, 1.5, -1.6], fov: 34, ease: "burst", dur: 8 },
        ]}
        kicks={[fam + 2]}
        dof={11}
        focus={[0, 1.45, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "readPhone"], [sells, "victory"], [name, "readPhone"]]} faces={[[0, "neutral"], [sells, "joy"], [name, "thinking"], [fam, "shocked"]]} items={[[0, { kind: "phone", hand: "R" }], [sells, null], [name, { kind: "phone", hand: "R" }]]} talking={s.speaking(["b06"])} />
      </Stage>
      <FXLayer>
        <Tag at={week} out={sells} x={540} y={300} text="1 WEEK LATER" bg={BRAND.bg} fg={BRAND.cream} size={54} />
        <Tag at={sells} out={name} x={540} y={380} text="SOLD!" bg="#ffffff" fg="#1f7a3a" size={80} rot={-4} />
        <Tag at={name} x={540} y={250} text="BUYER: jake_m" bg="#ffffff" fg="#1b1b1f" size={56} />
        <Stamp at={fam} x={800} y={560} text="JAKE?!" color="#d62f3a" size={100} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 "is this mine?" / "not anymore"
const S06: React.FC = () => {
  const s = useShot();
  const hey = s.hit("hey");
  const i = s.end("mine") + 1; // whip back to Tiff right after his line
  const not = s.hit("not");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [12.1, 1.5, 1.6], look: [12.0, 1.35, -1.8], fov: 40 },
          { f: i, pos: [12.05, 1.5, 1.2], look: [12.0, 1.38, -1.8], fov: 38, ease: "glide", dur: i },
          { f: i + 9, pos: [0.1, 1.5, 1.0], look: [0.0, 1.4, -1.6], fov: 38, ease: "burst", dur: 9 },
          { f: not + 2, pos: [0.05, 1.55, 0.4], look: [0.0, 1.5, -1.6], fov: 34, ease: "burst", dur: 9 },
        ]}
        kicks={[not + 2]}
        dof={8}
        focus={(f) => (f < i + 5 ? [12, 1.35, -1.8] : [0, 1.4, -1.5])}
        shadow={{ center: [0, 0, -1.6], size: 6 }}
      >
        <TiffRoom chair={false} />
        <ExRoom />
        <Stick spec={EX} at={[12, 0, -1.8]} poses={[[0, "readPhone"], [hey, "headScratch"]]} faces={[[0, "unimpressed"], [hey, "confused"]]} items={[[0, { kind: "phone", hand: "R" }]]} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "readPhone"], [not, "handsHips"]]} faces={[[0, "smug"], [not, { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] }]]} items={[[0, { kind: "phone", hand: "R" }], [not, null]]} talking={s.speaking(["b07", "b08"])} />
      </Stage>
      <FXLayer>
        <Bubble at={hey} out={i} x={540} y={380} text="hey... is this mine?" kind="speech" tail="down" size={46} width={420} />
        <Bubble at={not} x={540} y={360} text="not anymore." kind="speech" tail="down" size={52} width={380} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 quick plug
const S07: React.FC = () => {
  const s = useShot();
  const listed = s.hit("Listed");
  const pg = s.hit("pileGo");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.35, 1.8], look: [-0.2, 1.15, -1.45], fov: 40 },
          { f: listed, pos: [-0.15, 1.6, 2.3], look: [-0.15, 1.75, -3.0], fov: 46, ease: "glide", dur: 16 },
        ]}
        kicks={[pg + 2]}
        dof={3}
        focus={[0, 1.3, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom pile={1 - 0.6 * clamp(invLerp(listed, pg + 20, f))} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "present"], [pg, "victory"]]} faces={[[0, "happy"], [pg, "joy"]]} talking={s.speaking(["b09"])} />
        <group position={[-0.15, 2.95, -4.25]} scale={pop(f, pg, 10)}>
          <PileGoBoard w={1.3} />
        </group>
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.2 - Math.floor(k / 3) * 0.52, -4.25]} scale={pop(f, listed + k * 3)}>
            <AppBoard app={app} w={0.58} line="Listed" />
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
  <Reel timeline={timeline} variant={variant} background="#f2c7d3" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
