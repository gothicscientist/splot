// scenes: hand-written
// "My ex soft-launched his new girlfriend in my dress" - Tiff gossip reel (Jake + Sasha). pileGo! is the punchline in
// s06, then the brand end card (pilego.app) holds over the voice tail. Every move is keyed to a spoken word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Bubble, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { Face } from "../../styles/stickworld/draw";
import { backOut, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, ExRoom, PileGoBoard, TiffRoom } from "../_tiff/set";
import { ChatThread, EndCard, PhonePost } from "../_tiff/ui";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const JAKE = CAST.jake;
const SASHA = CAST.sasha;
const GREEN = "#3f8f5a";
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
const SMIRK: Face = { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] };

// ------------------------------------------------------------------------------------------------ s01 hook: the soft launch
const S01: React.FC = () => {
  const s = useShot();
  const gf = s.hit("girlfriend");
  const dress = s.hit("dress");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [-0.35, 1.42, 1.2], look: [-0.35, 1.3, -1.6], fov: 40 },
          { f: dress + 2, pos: [-0.4, 1.45, 0.55], look: [-0.4, 1.38, -1.6], fov: 36, ease: "burst", dur: 8 },
        ]}
        kicks={[dress + 2]}
        dof={8}
        focus={[-0.4, 1.35, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 6 }}
      >
        <TiffRoom night chair={false} />
        <Stick spec={TIFF} at={[-0.4, 0, -1.6]} facing="right" poses={[[0, "readPhone"], [dress, "scared"]]} faces={[[0, "unimpressed"], [gf, "worried"], [dress, "shocked"]]} items={[[0, { kind: "phone", hand: "R" }], [dress, null]]} talking={s.speaking(["b01"])} />
      </Stage>
      <FXLayer>
        <Tag at={0} x={540} y={250} text="HE SOFT-LAUNCHED HER" bg="#1b1b1f" fg="#ffffff" size={60} rot={-2} />
        <PhonePost at={0} x={820} y={600} w={380} rot={5} handle="@jake.r" tint={GREEN} />
        <Stamp at={dress} x={760} y={980} text="MY DRESS" color="#d62f3a" size={96} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the green one, the burn mark
const S02: React.FC = () => {
  const s = useShot();
  const green = s.hit("green");
  const sold = s.hit("sold");
  const chair = s.hit("chair");
  const slit = s.hit("slit");
  const burn = s.hit("burn");
  const bday = s.hit("birthday");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.1, 1.4, 2.5], look: [-0.15, 1.2, -1.5], fov: 44 },
          { f: slit, pos: [0.15, 1.42, 1.6], look: [0.25, 1.25, -1.4], fov: 40, ease: "glide", dur: 30 },
        ]}
        kicks={[sold + 2]}
        dof={4}
        focus={[-0.3, 1.2, -1.6]}
        shadow={{ center: [-0.3, 0, -1.6], size: 7 }}
      >
        <TiffRoom top={s.f < sold ? GREEN : undefined} />
        <Stick spec={TIFF} at={[0.3, 0, -1.3]} facing="left" poses={[[0, "holdOne"], [sold, "phone"], [slit, "crossArms"]]} faces={[[0, "neutral"], [sold, "happy"], [slit, "unimpressed"], [bday, "angry"]]} items={[[0, { kind: "phone", hand: "R" }], [slit, null]]} talking={s.speaking(["b02", "b03"])} />
      </Stage>
      <FXLayer>
        <Tag at={green} out={slit} x={300} y={300} text="THE GREEN ONE" bg={GREEN} fg="#ffffff" size={58} rot={-4} />
        <Tag at={sold} out={slit} x={740} y={420} text="SOLD · $38" bg="#ffffff" fg="#1f7a3a" size={56} rot={4} />
        <Tag at={chair} out={slit} x={360} y={540} text="(chair cleared)" bg="#ffffff" fg="#1b1b1f" size={40} rot={-3} />
        <PhonePost at={slit} x={540} y={620} w={520} rot={-3} handle="@jake.r" tint={GREEN} burnAt={burn} />
        <Tag at={bday} x={540} y={1010} text="MY 23RD 🎂" bg="#ffd43b" fg="#1b1b1f" size={54} rot={3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 caption + comments
const S03: React.FC = () => {
  const s = useShot();
  const cap = s.hit("captioned");
  const taste = s.hit("taste");
  const com = s.hit("comments");
  const sides = s.hit("sides");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [12.0, 1.48, 1.0], look: [12.0, 1.38, -1.8], fov: 40 },
          { f: taste + 2, pos: [12.0, 1.5, 0.5], look: [12.0, 1.42, -1.8], fov: 36, ease: "burst", dur: 9 },
          { f: com, pos: [12.2, 1.5, 1.6], look: [12.1, 1.3, -1.8], fov: 44, ease: "glide", dur: 30 },
        ]}
        kicks={[taste + 2]}
        dof={(f) => (f < com ? 10 : 5)}
        focus={[12, 1.4, -1.8]}
        shadow={{ center: [12, 0, -1.8], size: 7 }}
      >
        <ExRoom />
        <Stick spec={JAKE} at={[12, 0, -1.8]} poses={[[0, "phone"], [taste, "crossArms"]]} faces={[[0, SMIRK], [taste, "smug"]]} items={[[0, { kind: "phone", hand: "R" }], [taste, null]]} />
      </Stage>
      <FXLayer>
        <Bubble at={cap} out={com} x={540} y={330} text="finally, someone with taste 💚" kind="speech" tail="down" size={44} width={480} />
        <Tag at={com} x={300} y={300} text="who is she 👀" bg="#ffffff" fg="#1b1b1f" size={44} rot={-6} />
        <Tag at={com + 5} x={780} y={390} text="the dress tho 😮‍💨" bg="#ffffff" fg="#1b1b1f" size={42} rot={5} />
        <Tag at={com + 10} x={330} y={500} text="tiff who? 💀" bg="#ffffff" fg="#1b1b1f" size={44} rot={-3} />
        <Tag at={sides} x={300} y={980} text="TEAM TIFF" bg="#b9a3e6" fg="#1b1b1f" size={54} rot={-5} />
        <Tag at={sides + 3} x={780} y={980} text="TEAM HER" bg={GREEN} fg="#ffffff" size={54} rot={5} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 the buyer is Sasha
const S04: React.FC = () => {
  const s = useShot();
  const checked = s.hit("checked");
  const sasha = s.hit("Sasha");
  const two = s.hit("Two");
  const msg = s.hit("messaged");
  const his = s.hit("his");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [1.4, 1.45, -0.6], look: [1.75, 1.15, -3.2], fov: 42 },
          { f: sasha + 2, pos: [1.55, 1.42, -1.45], look: [1.8, 1.05, -3.25], fov: 38, ease: "burst", dur: 9 },
          { f: msg, pos: [1.1, 1.5, 0.2], look: [1.4, 1.3, -2.6], fov: 44, ease: "glide", dur: 20 },
          { f: his + 2, pos: [1.2, 1.52, -0.4], look: [1.4, 1.38, -2.6], fov: 38, ease: "burst", dur: 8 },
        ]}
        kicks={[sasha + 2, his + 2]}
        dof={5}
        focus={[1.5, 1.2, -2.6]}
        shadow={{ center: [1.5, 0, -2.6], size: 6 }}
      >
        <TiffRoom night chair={false} laptop={s.f >= sasha ? "SOLD to sasha.b" : "Orders"} />
        <Stick spec={TIFF} at={[1.2, 0, -2.45]} facing="right" poses={[[0, "typing"], [msg, "readPhone"], [his, "scared"]]} faces={[[0, "thinking"], [sasha, "shocked"], [two, "angry"], [msg, "neutral"], [his, "shocked"]]} items={[[msg, { kind: "phone", hand: "R" }], [his, null]]} talking={s.speaking(["b06", "b07"])} />
      </Stage>
      <FXLayer>
        <Tag at={checked} out={sasha} x={540} y={300} text="ORDER HISTORY…" bg="#ffffff" fg="#1b1b1f" size={50} />
        <Tag at={sasha} out={msg} x={540} y={300} text="BUYER: sasha.b" bg={GREEN} fg="#ffffff" size={58} rot={-3} />
        <Tag at={two} out={msg} x={540} y={440} text="2 DAYS BEFORE THEIR 1ST DATE" bg="#1b1b1f" fg="#ffffff" size={44} rot={2} />
        <ChatThread at={msg} x={540} y={470} w={620} title="sasha.b" msgs={[{ at: msg + 4, text: "wait… are you HIS tiff??" }]} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 one screenshot, twelve back
const SHOTS = Array.from({ length: 12 }, (_, i) => i);
const S05: React.FC = () => {
  const s = useShot();
  const one = s.hit("one");
  const twelve = s.hit("twelve");
  const turns = s.hit("Turns");
  const same = s.hit("same");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0, 1.45, 2.4], look: [0, 1.3, -1.7], fov: 44 },
          { f: same + 2, pos: [0, 1.48, 1.7], look: [0, 1.35, -1.7], fov: 40, ease: "burst", dur: 9 },
        ]}
        kicks={[twelve + 2, same + 2]}
        dof={4}
        focus={[0, 1.3, -1.7]}
        shadow={{ center: [0, 0, -1.7], size: 7 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[-0.62, 0, -1.7]} facing="right" poses={[[0, "readPhone"], [twelve, "scared"], [same, "crossArms"]]} faces={[[0, "determined"], [twelve, "shocked"], [same, "angry"]]} items={[[0, { kind: "phone", hand: "R" }], [twelve, null]]} talking={s.speaking(["b08", "b09"])} />
        <Stick spec={SASHA} at={[0.62, 0, -1.7]} facing="left" poses={[[0, "readPhone"], [same, "crossArms"]]} faces={[[0, "worried"], [twelve, "determined"], [same, "angry"]]} items={[[0, { kind: "phone", hand: "R" }], [same, null]]} />
      </Stage>
      <FXLayer>
        <Tag at={one} out={turns} x={300} y={330} text="📸 x1" bg="#b9a3e6" fg="#1b1b1f" size={58} rot={-4} />
        {SHOTS.map((i) => (
          <Tag key={i} at={twelve + i} out={turns} x={640 + (i % 4) * 95} y={280 + Math.floor(i / 4) * 95} text="📸" bg="#ffffff" fg="#1b1b1f" size={44} rot={(i % 3) * 5 - 5} />
        ))}
        <Bubble at={turns} x={290} y={420} text="you're not like other girls" kind="speech" tail="down" size={36} width={380} />
        <Bubble at={turns + 4} x={790} y={420} text="you're not like other girls" kind="speech" tail="down" size={36} width={380} />
        <Stamp at={same} x={540} y={270} text="SAME LINES" color="#d62f3a" size={100} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 plug + group chat + end card
const S06: React.FC = () => {
  const s = useShot();
  const kept = s.hit("kept");
  const listed = s.hit("listed");
  const pg = s.hit("pileGo");
  const group = s.hit("group");
  const not = s.hit("not");
  const end = s.end("it");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.05, 1.4, 1.9], look: [-0.2, 1.3, -1.6], fov: 42 },
          { f: listed, pos: [-0.15, 1.65, 2.3], look: [-0.15, 1.85, -3.2], fov: 46, ease: "burst", dur: 10 },
          { f: group, pos: [0.1, 1.45, 1.3], look: [0.15, 1.35, -1.4], fov: 40, ease: "glide", dur: 14 },
        ]}
        kicks={[listed + 2, not + 2]}
        dof={3}
        focus={[0, 1.4, -1.6]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom top="#9aa0a8" pile={f < listed ? 1 : 0.4} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "holdOne"], [listed, "pointAcross"], [group, "readPhone"], [not, "victory"]]} faces={[[0, "determined"], [listed, SMIRK], [group, "happy"], [not, "joy"]]} items={[[0, { kind: "phone", hand: "R" }], [not, null]]} talking={s.speaking(["b10", "b11"])} />
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.2 - Math.floor(k / 3) * 0.52, -4.25]} scale={f < group ? pop(f, listed + k * 3) : 0}>
            <AppBoard app={app} w={0.58} line={["His hoodie", "His cap", "His mug", "His jersey", "His cologne", "His speaker"][k]} />
          </group>
        ))}
        <group position={[-0.15, 2.95, -4.25]} scale={f < group ? pop(f, pg, 10) : 0}>
          <PileGoBoard w={1.3} />
        </group>
        <Burst3D kind="confetti" at={not} origin={[0.2, 1.6, -1.3]} count={60} power={3} />
      </Stage>
      <FXLayer>
        <Tag at={kept} out={listed} x={540} y={300} text="SHE KEPT THE DRESS 💚" bg={GREEN} fg="#ffffff" size={52} rot={-3} />
        <ChatThread
          at={group}
          x={540}
          y={480}
          w={600}
          title="EX FILES 💅 (2)"
          msgs={[
            { at: group + 4, text: "he just texted me 'u up' 💀" },
            { at: group + 14, text: "screenshot it 📸", me: true },
          ]}
        />
        <Stamp at={not} x={540} y={980} text="JAKE NOT INCLUDED" color="#d62f3a" size={74} />
        <FlashFX at={not} dur={5} max={0.3} />
        <EndCard at={end + 8} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background={BRAND.bg} scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06 }} />
);
