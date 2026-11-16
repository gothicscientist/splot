// scenes: hand-written
// "My ex said he was doing No Nut November" - gossip/drama story reel starring Tiff (with Jake and Mia); pileGo!
// appears only as the closing plug (s08). Every visual beat is keyed to its spoken word through useShot().
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Bubble, Burst, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { Face, StickSpec } from "../../styles/stickworld/draw";
import { backOut, clamp, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, ExRoom, PileGoBoard, TiffRoom } from "../_tiff/set";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const JAKE = CAST.jake;
const MIA = CAST.mia;
const MIA_IN_HOODIE: StickSpec = { ...CAST.mia, body: "#9aa0a8" };
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
const INNOCENT: Face = { eyes: "dot", mouth: "smile", brows: "raised", extras: ["sparkle"] };
const SMIRK: Face = { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] };

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const nnn = s.hit("No");
  const day = s.hit("Day");
  const failing = s.hit("failing");
  const best = s.hit("best");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.45, 2.3], look: [0.0, 1.3, -1.8], fov: 44 },
          { f: day, pos: [0.15, 1.45, 2.6], look: [0.2, 1.3, -1.8], fov: 46, ease: "glide", dur: 20 },
          { f: best + 3, pos: [0.15, 1.45, 2.3], look: [0.15, 1.35, -1.9], fov: 44, ease: "burst", dur: 9 },
        ]}
        kicks={[nnn + 2, best + 2]}
        dof={4}
        focus={[0, 1.3, -1.8]}
        shadow={{ center: [0, 0, -1.8], size: 7 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[-0.6, 0, -1.8]} poses={[[0, "crossArms"], [best, "scared"]]} faces={[[0, "unimpressed"], [failing, "worried"], [best, "shocked"]]} talking={s.speaking(["b01", "b02"])} />
        <Stick spec={JAKE} at={[0.25, 0, -1.95]} facing="left" poses={[[0, "relaxed"], [best, "crossArms"]]} faces={[[0, INNOCENT], [best, "smug"]]} />
        <Stick spec={MIA} at={[0.85, 0, -2.15]} pop={best - 2} facing="left" poses={[[0, "wave"]]} faces={[[0, "love"]]} />
      </Stage>
      <FXLayer>
        <Tag at={nnn} out={day} x={540} y={300} text="NO NUT NOVEMBER" bg="#1b1b1f" fg="#ffffff" size={64} rot={-3} />
        <Tag at={day} x={300} y={300} text="DAY 3" bg="#d62f3a" fg="#ffffff" size={66} rot={-6} />
        <Stamp at={best} x={720} y={440} text="FAILED" color="#d62f3a" size={110} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 why would I deceive you?
const S02: React.FC = () => {
  const s = useShot();
  const asked = s.hit("asked");
  const why = s.hit("why");
  const dec = s.hit("deceive");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.5, 1.4], look: [0.0, 1.4, -1.6], fov: 40 },
          { f: why, pos: [0.0, 1.52, 0.9], look: [0.0, 1.45, -1.6], fov: 38, ease: "glide", dur: 16 },
          { f: dec + 2, pos: [0.0, 1.55, 0.6], look: [0.0, 1.48, -1.6], fov: 36, ease: "burst", dur: 8 },
        ]}
        kicks={[dec + 2]}
        dof={11}
        focus={[0, 1.45, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={JAKE} at={[0, 0, -1.6]} poses={[[0, "shrug"], [why, "present"]]} faces={[[0, "neutral"], [why, INNOCENT]]} />
      </Stage>
      <FXLayer>
        <Bubble at={asked} out={why} x={540} y={330} text="Are you cheating?" kind="speech" tail="down" size={50} width={400} />
        <Bubble at={why} x={540} y={330} text="why would I deceive you? 🙂" kind="speech" tail="down" size={46} width={440} />
        <Stamp at={dec + 4} x={780} y={990} text="LIAR" color="#d62f3a" size={110} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 Mia's story: his hoodie, his bed
const S03: React.FC = () => {
  const s = useShot();
  const story = s.hit("story");
  const hoodie = s.hit("hoodie");
  const bed = s.hit("bed");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [11.0, 1.5, 0.2], look: [11.0, 1.45, -2.4], fov: 36 },
          { f: bed, pos: [11.1, 1.5, 1.5], look: [10.75, 1.0, -2.6], fov: 46, ease: "glide", dur: 16 },
        ]}
        kicks={[bed + 2]}
        dof={(f) => (f < bed ? 9 : 3)}
        focus={[11, 1.3, -2.4]}
        shadow={{ center: [11, 0, -2.4], size: 7 }}
      >
        <ExRoom />
        <Stick spec={MIA_IN_HOODIE} at={[11.15, 0, -2.3]} poses={[[0, "phone"], [hoodie, "victory"]]} faces={[[0, SMIRK], [hoodie, "love"]]} items={[[0, { kind: "phone", hand: "R" }], [hoodie, null]]} />
      </Stage>
      <FXLayer>
        <Tag at={story} x={540} y={240} text="@mia · story" bg="#ffffff" fg="#1b1b1f" size={46} />
        <Tag at={hoodie} x={790} y={430} text="HIS HOODIE" bg="#9aa0a8" fg="#1b1b1f" size={52} rot={6} />
        <Stamp at={bed} x={330} y={860} text="HIS BED" color="#d62f3a" size={100} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 crying into the pile
const S04: React.FC = () => {
  const s = useShot();
  const cried = s.hit("cried");
  const two = s.hit("two");
  const hugged = s.hit("hugged");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.1, 1.35, 2.2], look: [-0.25, 1.1, -1.5], fov: 40 },
          { f: hugged, pos: [-0.15, 1.3, 1.1], look: [-0.3, 1.15, -1.5], fov: 36, ease: "glide", dur: 30 },
        ]}
        dof={(f) => (f >= hugged ? 10 : 6)}
        focus={[-0.2, 1.1, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom night />
        <Stick spec={TIFF} at={[-0.05, 0, -1.35]} facing="left" poses={[[0, "facepalm"], [hugged, "holdFront"]]} faces={[[0, "crying"], [hugged, { eyes: "sad", mouth: "frown", brows: "sad", extras: ["tears"] }]]} talking={s.speaking(["b05"])} lean={-4} />
      </Stage>
      <FXLayer>
        <Tag at={two} x={540} y={300} text="2 DAYS" bg={BRAND.bg} fg={BRAND.cream} size={62} />
        <Tag at={hugged} x={300} y={460} text="(it hugged back)" bg="#ffffff" fg="#1b1b1f" size={40} rot={-4} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 his text + the group chat
const S05: React.FC = () => {
  const s = useShot();
  const texts = s.hit("texts");
  const effort = s.hit("effort");
  const laughed = s.hit("laughed");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.0, 1.5, 1.0], look: [0.0, 1.4, -1.5], fov: 38 },
          { f: effort + 2, pos: [0.0, 1.55, 0.35], look: [0.0, 1.5, -1.5], fov: 34, ease: "burst", dur: 9 },
        ]}
        kicks={[effort + 2, laughed + 2]}
        dof={11}
        focus={[0, 1.45, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom night chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "readPhone"], [effort, "scared"]]} faces={[[0, "sad"], [effort, "crying"]]} items={[[0, { kind: "phone", hand: "R" }], [effort, null]]} talking={s.speaking(["b06"])} />
      </Stage>
      <FXLayer>
        <FlashFX at={effort} dur={6} max={0.25} color="#d62f3a" />
        <Bubble at={texts} out={laughed} x={540} y={320} text="you were never worth the effort" kind="speech" tail="down" size={44} width={460} />
        <Tag at={laughed} x={250} y={320} text="LMAOOO" bg="#ffffff" fg="#1b1b1f" size={52} rot={-8} />
        <Tag at={laughed + 4} x={800} y={420} text="HAHAHA" bg="#ffffff" fg="#1b1b1f" size={52} rot={7} />
        <Tag at={laughed + 8} x={420} y={560} text="dead 💀" bg="#ffffff" fg="#1b1b1f" size={46} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 sell everything he gave me
const GIFTS = ["His hoodie", "His jacket", "His cap", "His jersey", "His watch", "His cologne"];
const S06: React.FC = () => {
  const s = useShot();
  const sold = s.hit("sold");
  const every = s.hit("everything");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.05, 1.4, 1.9], look: [-0.2, 1.3, -1.6], fov: 42 },
          { f: every, pos: [-0.15, 1.65, 2.3], look: [-0.15, 1.8, -3.2], fov: 46, ease: "burst", dur: 10 },
        ]}
        kicks={[every + 2]}
        dof={3}
        focus={[0, 1.4, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom top="#9aa0a8" />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "holdOne"], [every, "pointAcross"]]} faces={[[0, "determined"], [every, SMIRK]]} items={[[0, { kind: "phone", hand: "R" }]]} talking={s.speaking(["b07"])} />
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.6 - Math.floor(k / 3) * 0.52, -4.25]} scale={pop(f, every + k * 3)}>
            <AppBoard app={app} w={0.58} line={GIFTS[k]} />
          </group>
        ))}
      </Stage>
      <FXLayer>
        <FlashFX at={sold} dur={5} max={0.45} />
        <Tag at={every} x={540} y={1020} text="EVERYTHING HE GAVE ME" bg="#d62f3a" fg="#ffffff" size={52} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 the buyer is Mia
const S07: React.FC = () => {
  const s = useShot();
  const sold = s.hit("sold");
  const buyer = s.hit("buyer");
  const mia = s.hit("Mia");
  const she = s.hit("She");
  const left = s.hit("left");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.0, 1.5, 1.2], look: [0.0, 1.4, -1.6], fov: 38 },
          { f: mia + 2, pos: [0.0, 1.55, 0.35], look: [0.0, 1.5, -1.6], fov: 33, ease: "burst", dur: 8 },
          { f: she + 6, pos: [0.0, 1.5, 1.6], look: [0.0, 1.35, -1.6], fov: 42, ease: "glide", dur: 24 },
        ]}
        kicks={[mia + 2]}
        dof={(f) => (f >= mia && f < she ? 11 : 6)}
        focus={[0, 1.45, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.6]} poses={[[0, "readPhone"], [mia, "scared"], [she, "handsHips"]]} faces={[[0, "neutral"], [sold, "happy"], [mia, "shocked"], [she, SMIRK]]} items={[[0, { kind: "phone", hand: "R" }], [mia, null]]} talking={s.speaking(["b08", "b09"])} />
        <Burst3D kind="sparks" at={left} origin={[0, 1.9, -1.5]} count={50} power={2.5} />
      </Stage>
      <FXLayer>
        <Tag at={sold} out={buyer} x={540} y={300} text="SOLD IN 10 MIN" bg="#ffffff" fg="#1f7a3a" size={60} rot={-3} />
        <Tag at={buyer} x={540} y={250} text="BUYER: mia.xo" bg="#ffffff" fg="#1b1b1f" size={54} />
        <Stamp at={mia} out={she} x={780} y={560} text="MIA?!" color="#d62f3a" size={110} />
        <Tag at={left} x={540} y={400} text="HE LEFT HER TOO" bg="#1b1b1f" fg="#ffffff" size={56} rot={3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s08 quick plug
const S08: React.FC = () => {
  const s = useShot();
  const gone = s.hit("Gone");
  const back = s.hit("Back");
  const listed = s.hit("Listed");
  const pg = s.hit("pileGo");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.0, 1.35, 1.9], look: [-0.2, 1.15, -1.45], fov: 40 },
          { f: listed, pos: [-0.15, 1.6, 2.3], look: [-0.15, 1.75, -3.0], fov: 46, ease: "glide", dur: 14 },
        ]}
        kicks={[back + 2]}
        dof={3}
        focus={[0, 1.3, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom pile={1 - clamp(invLerp(gone, back, f))} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "present"], [back, "victory"]]} faces={[[0, SMIRK], [back, "joy"]]} talking={s.speaking(["b10"])} />
        <Burst3D kind="confetti" at={back} origin={[-0.6, 1.2, -1.6]} count={70} power={3.5} />
        <group position={[-0.15, 2.95, -4.25]} scale={pop(f, pg, 10)}>
          <PileGoBoard w={1.3} />
        </group>
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.2 - Math.floor(k / 3) * 0.52, -4.25]} scale={pop(f, listed + k * 2)}>
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
  <Reel timeline={timeline} variant={variant} background="#f2c7d3" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08 }} />
);
