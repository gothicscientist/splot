// scenes: hand-written
// "My situationship sold the sweater I knitted him" - Tiff petty-revenge reel (Leo). pileGo! prices the relist in s06;
// the brand end card (pilego.app) holds over the voice tail in s07.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Bubble, Counter, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { Face } from "../../styles/stickworld/draw";
import { backOut, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, CafeSet, CouchRoom, PileGoBoard, TiffRoom } from "../_tiff/set";
import { ChatThread, EndCard } from "../_tiff/ui";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const LEO = CAST.leo;
const LILAC = "#b9a3d9";
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
const SMIRK: Face = { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] };
const CHILL: Face = { eyes: "lidded", mouth: "smile", brows: "neutral" };

// ------------------------------------------------------------------------------------------------ s01 hook: no labels
const S01: React.FC = () => {
  const s = useShot();
  const said = s.hit("said");
  const labels = s.hit("labels");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.05, 1.45, 0.9], look: [0.05, 1.32, -2.6], fov: 40 },
          { f: labels + 2, pos: [0.05, 1.47, 0.35], look: [0.05, 1.36, -2.6], fov: 38, ease: "burst", dur: 8 },
        ]}
        kicks={[labels + 2]}
        dof={6}
        focus={[0.1, 1.3, -2.6]}
        shadow={{ center: [0, 0, -2.6], size: 7 }}
      >
        <CouchRoom />
        <Stick spec={TIFF} at={[-0.38, 0, -2.6]} facing="right" poses={[[0, "holdFront"], [labels, "crossArms"]]} faces={[[0, "love"], [said, "worried"], [labels, "unimpressed"]]} />
        <Stick spec={LEO} at={[0.45, 0, -2.65]} facing="left" poses={[[0, "relaxed"], [said, "shrug"]]} faces={[[0, CHILL], [said, "smug"]]} talking={s.speaking(["b01"])} />
      </Stage>
      <FXLayer>
        <Tag at={0} x={540} y={260} text="“I DON'T DO LABELS”" bg="#1b1b1f" fg="#ffffff" size={60} rot={-2} />
        <Tag at={0} out={labels} x={760} y={410} text="🏷️ boyfriend?" bg="#ffffff" fg="#1b1b1f" size={46} rot={5} />
        <Stamp at={labels} x={540} y={430} text="SITUATIONSHIP" color="#d62f3a" size={78} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 six months, the sweater everywhere
const S02: React.FC = () => {
  const s = useShot();
  const six = s.hit("Six");
  const title = s.hit("title");
  const wore = s.hit("wore");
  const knit = s.hit("knitted");
  const every = s.hit("everywhere");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.6, 1.5, 1.2], look: [0.2, 1.3, -2.3], fov: 40 },
          { f: knit, pos: [0.3, 1.5, 0.0], look: [0.4, 1.4, -2.3], fov: 36, ease: "glide", dur: 16 },
          { f: every, pos: [0.9, 1.6, 1.6], look: [0.3, 1.2, -2.3], fov: 44, ease: "glide", dur: 20 },
        ]}
        kicks={[knit + 2]}
        dof={5}
        focus={[0.4, 1.3, -2.3]}
        shadow={{ center: [0, 0, -2.3], size: 8 }}
      >
        <CafeSet />
        <Stick spec={LEO} at={[0.4, 0, -2.6]} facing="left" poses={[[0, "relaxed"], [wore, "present"], [every, "victory"]]} faces={[[0, CHILL], [wore, "happy"], [every, "joy"]]} items={[[0, { kind: "cup", hand: "R", color: "#ffffff" }], [every, null]]} />
      </Stage>
      <FXLayer>
        <Tag at={six} x={300} y={300} text="6 MONTHS" bg="#ffffff" fg="#1b1b1f" size={56} rot={-4} />
        <Tag at={title} x={760} y={300} text="0 TITLES" bg="#d62f3a" fg="#ffffff" size={56} rot={4} />
        <Tag at={knit} x={540} y={450} text="🧶 KNITTED BY ME" bg={LILAC} fg="#1b1b1f" size={54} rot={-2} />
        <Tag at={every} x={250} y={960} text="café ✔" bg="#ffffff" fg="#1b1b1f" size={44} rot={-5} />
        <Tag at={every + 4} x={540} y={1010} text="parties ✔" bg="#ffffff" fg="#1b1b1f" size={44} rot={3} />
        <Tag at={every + 8} x={830} y={960} text="his mom's ✔" bg="#ffffff" fg="#1b1b1f" size={44} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 the listing: $8
const S03: React.FC = () => {
  const s = useShot();
  const found = s.hit("found");
  const hand = s.hit("Hand-knit");
  const listed = s.hit("Listed");
  const eight2 = s.hit("eight", 2);
  const three = s.hit("three");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [1.4, 1.45, -0.6], look: [1.75, 1.15, -3.2], fov: 42 },
          { f: listed, pos: [1.1, 1.5, 0.2], look: [1.35, 1.3, -2.6], fov: 44, ease: "glide", dur: 14 },
          { f: eight2 + 2, pos: [1.2, 1.52, -0.5], look: [1.35, 1.4, -2.6], fov: 38, ease: "burst", dur: 8 },
        ]}
        kicks={[listed + 2, eight2 + 2]}
        dof={5}
        focus={[1.4, 1.3, -2.6]}
        shadow={{ center: [1.4, 0, -2.6], size: 6 }}
      >
        <TiffRoom night chair={false} laptop={s.f >= found ? "Hand-knit sweater  $8" : "scrolling…"} />
        <Stick spec={TIFF} at={[1.2, 0, -2.45]} facing="right" poses={[[0, "typing"], [listed, "scared"], [three, "facepalm"]]} faces={[[0, "neutral"], [found, "shocked"], [listed, "angry"], [three, "crying"]]} talking={s.speaking(["b03", "b04"])} />
      </Stage>
      <FXLayer>
        <Tag at={found} out={listed} x={540} y={300} text="FOR SALE: lilac sweater" bg="#ffffff" fg="#1b1b1f" size={50} rot={-2} />
        <Tag at={hand} out={listed} x={540} y={430} text="“hand-knit, barely worn”" bg={LILAC} fg="#1b1b1f" size={46} rot={2} />
        <Stamp at={listed} x={540} y={330} text="$8" color="#d62f3a" size={150} />
        <Tag at={three} x={540} y={540} text="🧶 3 WEEKS OF MY LIFE" bg="#1b1b1f" fg="#ffffff" size={50} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 "no attachment" + buy it back
const S04: React.FC = () => {
  const s = useShot();
  const desc = s.hit("description");
  const att = s.hit("attachment");
  const bought = s.hit("bought");
  const anon = s.hit("Anonymously");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [1.2, 1.5, -0.2], look: [1.3, 1.4, -2.6], fov: 38 },
          { f: att + 2, pos: [1.25, 1.52, -0.8], look: [1.3, 1.45, -2.6], fov: 34, ease: "burst", dur: 8 },
          { f: bought, pos: [1.0, 1.48, 0.5], look: [1.3, 1.3, -2.6], fov: 44, ease: "glide", dur: 14 },
        ]}
        kicks={[att + 2]}
        dof={8}
        focus={[1.3, 1.35, -2.6]}
        shadow={{ center: [1.3, 0, -2.6], size: 6 }}
      >
        <TiffRoom night chair={false} laptop={s.f >= bought ? "BOUGHT  $8" : "no attachment."} />
        <Stick spec={TIFF} at={[1.2, 0, -2.45]} facing="right" poses={[[0, "crossArms"], [bought, "typing"], [anon, "handsHips"]]} faces={[[0, "unimpressed"], [att, "furious"], [bought, "determined"], [anon, "evil"]]} />
      </Stage>
      <FXLayer>
        <Bubble at={desc} out={bought} x={540} y={330} text="“no attachment.”" kind="speech" tail="down" size={56} width={480} />
        <FlashFX at={att} dur={5} max={0.3} color="#d62f3a" />
        <Tag at={bought} x={540} y={300} text="BUY IT BACK: $8" bg="#e9f7ec" fg="#1f7a3a" size={56} rot={-3} />
        <Tag at={anon} x={540} y={430} text="🕶️ buyer: anon_4821" bg="#1b1b1f" fg="#ffffff" size={48} rot={3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 the new description
const S05: React.FC = () => {
  const s = useShot();
  const rel = s.hit("relisted");
  const nw = s.hit("new");
  const hand = s.hit("Hand-knit");
  const comm = s.hit("committed");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [1.5, 1.45, -1.2], look: [1.75, 1.1, -3.2], fov: 42 },
          { f: hand, pos: [1.0, 1.5, 0.4], look: [1.3, 1.3, -2.6], fov: 44, ease: "glide", dur: 14 },
        ]}
        kicks={[comm + 2]}
        dof={5}
        focus={[1.4, 1.2, -2.8]}
        shadow={{ center: [1.4, 0, -2.6], size: 6 }}
      >
        <TiffRoom night chair={false} laptop={s.f >= nw ? "NEW LISTING ✍" : "Relist"} />
        <Stick spec={TIFF} at={[1.2, 0, -2.45]} facing="right" poses={[[0, "typing"], [comm, "handsHips"]]} faces={[[0, "determined"], [comm, SMIRK]]} talking={s.speaking(["b07", "b08"])} />
      </Stage>
      <FXLayer>
        <Tag at={rel} out={hand} x={540} y={300} text="RELISTED 🔁" bg={LILAC} fg="#1b1b1f" size={58} rot={-3} />
        <ChatThread at={hand} x={540} y={420} w={640} title="✏️ new description" msgs={[{ at: hand + 3, text: "Hand-knit by someone who actually committed. 🧶", me: true }]} />
        <Stamp at={comm} x={760} y={980} text="PETTY" color="#7a4fb0" size={96} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 pileGo price + sold in 9 minutes
const S06: React.FC = () => {
  const s = useShot();
  const priced = s.hit("priced");
  const pg = s.hit("pileGo");
  const sold = s.hit("sold", 2);
  const nine = s.hit("nine");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.15, 1.65, 2.3], look: [-0.15, 1.85, -3.2], fov: 46 },
          { f: sold, pos: [0.0, 1.42, 1.5], look: [0.1, 1.3, -1.4], fov: 42, ease: "burst", dur: 10 },
        ]}
        kicks={[sold + 2]}
        dof={(f) => (f < sold ? 3 : 6)}
        focus={[0.1, 1.35, -1.4]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom top={LILAC} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "phone"], [sold, "victory"]]} faces={[[0, "determined"], [sold, "joy"]]} items={[[0, { kind: "phone", hand: "R" }], [sold, null]]} talking={s.speaking(["b09", "b10"])} />
        <group position={[-0.15, 2.85, -4.25]} scale={pop(f, pg, 10)}>
          <PileGoBoard w={1.3} sub="Priced from real sold listings" />
        </group>
        {APPS.map((app, k) => (
          <group key={app.name} position={[-0.85 + (k % 3) * 0.7, 2.1 - Math.floor(k / 3) * 0.52, -4.25]} scale={pop(f, priced + k * 3)}>
            <AppBoard app={app} w={0.58} line="Hand-knit sweater  $65" sold={f >= sold && k === 2} />
          </group>
        ))}
        <Burst3D kind="confetti" at={sold} origin={[0.2, 1.7, -1.25]} count={60} power={3} />
      </Stage>
      <FXLayer>
        <Counter at={pg} out={sold} from={8} to={65} dur={14} prefix="$" label="real sold price" x={300} y={640} size={72} bg="#e9f7ec" fg="#1f7a3a" />
        <Stamp at={sold} x={540} y={600} text="SOLD" color="#1f7a3a" size={120} />
        <Tag at={nine} x={540} y={980} text="⏱ 9 MINUTES" bg="#1b1b1f" fg="#ffffff" size={58} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 kicker + end card
const S07: React.FC = () => {
  const s = useShot();
  const label = s.hit("label");
  const end = s.end("label");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.2, 1.4, 0.85], look: [0.2, 1.3, -1.4], fov: 43 },
          { f: label, pos: [0.2, 1.4, 1.0], look: [0.2, 1.25, -1.4], fov: 44, ease: "glide", dur: 20 },
        ]}
        kicks={[label + 2]}
        dof={8}
        focus={[0.2, 1.35, -1.4]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom pile={0.6} />
        <Stick spec={TIFF} at={[0.2, 0, -1.4]} poses={[[0, "holdOne"]]} faces={[[0, SMIRK], [label, "grin"]]} items={[[0, { kind: "sign", hand: "R", text: "TO: LEO" }]]} talking={s.speaking(["b11"])} />
      </Stage>
      <FXLayer>
        <Stamp at={label} x={540} y={300} text="LABEL ✔" color="#7a4fb0" size={110} />
        <EndCard at={end + 8} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background={BRAND.bg} scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
