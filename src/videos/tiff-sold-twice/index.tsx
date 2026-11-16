// scenes: hand-written
// "I sold the same jacket to two people" - StickWorld set x Problem-Solution, starring Tiff, plugging pileGo!.
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, Mark, Bubble, FXLayer, FlashFX } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import { backOut, clamp, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, JacketStand, PileGoBoard, TiffRoom } from "../_tiff/set";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
const BUYER_A = { ...CAST.customerC, seed: 201 };
const BUYER_B = { ...CAST.customerA, seed: 202 };
const DEPOP = APPS[2];
const VINTED = APPS[1];
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
const JACKET = { kind: "sign" as const, text: "OLIVE JACKET", hand: "R" as const, color: "#6b7a3a" };

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const jacket = s.hit("jacket");
  const two = s.hit("two");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.35, 1.4, 1.5], look: [0.15, 1.3, -1.6], fov: 40 },
          { f: two + 3, pos: [0.3, 1.45, 0.7], look: [0.15, 1.35, -1.6], fov: 36, ease: "burst", dur: 9 },
        ]}
        kicks={[two + 2]}
        dof={(f) => (f >= two ? 11 : 7)}
        focus={[0, 1.3, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "holdOne"], [two, "scared"]]} faces={[[0, "nervousSmile"], [two, "shocked"]]} items={[[0, JACKET], [two, null]]} talking={s.speaking(["b01"])} />
      </Stage>
      <FXLayer>
        <Tag at={jacket} out={two} x={360} y={420} text="1 JACKET" bg="#ffffff" fg="#1b1b1f" size={58} rot={-5} />
        <Tag at={two} x={300} y={430} text="SOLD" bg="#ffffff" fg="#ff2300" size={64} rot={-8} />
        <Tag at={two + 4} x={780} y={540} text="SOLD" bg="#ffffff" fg="#09b1ba" size={64} rot={7} />
        <Stamp at={two + 8} x={540} y={300} text="x2" color="#d62f3a" size={140} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 Depop + Vinted, same hour
const S02: React.FC = () => {
  const s = useShot();
  const depop = s.hit("Depop");
  const vinted = s.hit("Vinted");
  const buyers = s.hit("buyers");
  const same = s.hit("same");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.75, 1.2], look: [0.0, 1.85, -3.4], fov: 42 },
          { f: buyers, pos: [0.0, 1.5, 2.3], look: [0.0, 1.45, -2.4], fov: 46, ease: "glide", dur: 20 },
          { f: same, pos: [0.0, 1.7, 1.6], look: [0.0, 1.9, -3.4], fov: 40, ease: "burst", dur: 10 },
        ]}
        kicks={[same + 2]}
        dof={3}
        focus={[0, 1.6, -3]}
        shadow={{ center: [0, 0, -2.2], size: 7 }}
      >
        <TiffRoom chair={false} />
        <group position={[-0.5, 2.25, -4.3]} scale={pop(f, depop)}>
          <AppBoard app={DEPOP} w={0.85} sold={f >= same} />
        </group>
        <group position={[0.5, 2.25, -4.3]} scale={pop(f, vinted)}>
          <AppBoard app={VINTED} w={0.85} sold={f >= same + 4} />
        </group>
        <Stick spec={TIFF} at={[0, 0, -2.2]} poses={[[0, "presentBoth"], [same, "scared"]]} faces={[[0, "happy"], [same, "shocked"]]} talking={s.speaking(["b02", "b03"])} />
        <Stick spec={BUYER_A} at={[-0.62, 0, -2.7]} pop={buyers} scale={0.9} facing="right" poses={[[0, "readPhone"]]} faces={[[0, "happy"]]} items={[[0, { kind: "phone", hand: "R" }]]} />
        <Stick spec={BUYER_B} at={[0.62, 0, -2.7]} pop={buyers + 4} scale={0.9} facing="left" poses={[[0, "readPhone"]]} faces={[[0, "happy"]]} items={[[0, { kind: "phone", hand: "R" }]]} />
      </Stage>
      <FXLayer>
        <Tag at={same} x={540} y={300} text="SAME HOUR" bg="#d62f3a" fg="#ffffff" size={66} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 one jacket, one refund
const S03: React.FC = () => {
  const s = useShot();
  const jacket = s.hit("jacket");
  const other = s.hit("other");
  const refund = s.hit("refund");
  const star = s.hit("one-star");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [-0.5, 1.45, 1.4], look: [-0.45, 1.3, -2.0], fov: 40 },
          { f: other, pos: [0.5, 1.45, 1.4], look: [0.45, 1.3, -2.0], fov: 40, ease: "glide", dur: 18 },
          { f: star, pos: [0.0, 1.45, 2.2], look: [0.0, 1.3, -2.0], fov: 44, ease: "burst", dur: 10 },
        ]}
        kicks={[star + 2]}
        dof={4}
        focus={[0, 1.3, -2]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={BUYER_A} at={[-0.62, 0, -2.6]} scale={0.9} facing="right" poses={[[0, "holdOne"], [jacket, "cheer"]]} faces={[[0, "happy"], [jacket, "joy"]]} items={[[0, JACKET]]} />
        <Stick spec={TIFF} at={[0, 0, -2.3]} poses={[[0, "relaxed"], [refund, "scared"]]} faces={[[0, "nervousSmile"], [refund, "worried"]]} talking={s.speaking(["b04"])} />
        <Stick spec={BUYER_B} at={[0.62, 0, -2.6]} scale={0.9} facing="left" poses={[[0, "crossArms"], [star, "point"]]} faces={[[0, "unimpressed"], [refund, "angry"], [star, "furious"]]} />
      </Stage>
      <FXLayer>
        <Mark at={jacket} out={star} x={300} y={420} ok size={140} />
        <Tag at={refund} x={800} y={420} text="REFUND" bg="#ffffff" fg="#d62f3a" size={56} rot={6} />
        <Stamp at={star} x={540} y={300} text="1 STAR" color="#d62f3a" size={120} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 delisting is the problem
const S04: React.FC = () => {
  const s = useShot();
  const cross = s.hit("Crosslisting");
  const delist = s.hit("Delisting");
  const racing = s.hit("racing");
  const five = s.hit("five");
  const down = s.hit("down");
  const f = s.f;
  const others = APPS.filter((a) => a.name !== "Depop");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [1.15, 1.6, 0.6], look: [1.25, 1.65, -3.6], fov: 42 },
          { f: racing, pos: [1.05, 1.45, -0.3], look: [1.15, 1.35, -3.0], fov: 38, ease: "glide", dur: 20 },
          { f: down, pos: [1.0, 1.4, -0.9], look: [1.1, 1.35, -2.8], fov: 34, ease: "burst", dur: 9 },
        ]}
        kicks={[delist + 2, down + 2]}
        dof={(f) => (f < racing ? 4 : 9)}
        focus={[1.0, 1.35, -2.6]}
        shadow={{ center: [1.2, 0, -2.6], size: 6 }}
      >
        <TiffRoom chair={false} laptop="DELIST" />
        <Stick
          spec={TIFF}
          at={[1.0, 0, -2.55]}
          poses={[[0, "presentBoth"], [delist, "point"], [racing, "typing"]]}
          faces={[[0, "happy"], [delist, "determined"], [racing, "panic"]]}
          talking={s.speaking(["b05", "b06"])}
        />
        {others.map((app, i) => {
          // racing: boards flash one after another as she takes the listing down on each
          const on = f >= racing && Math.floor((f - racing) / 7) % others.length === i;
          return (
            <group key={app.name} position={[0.35 + (i % 3) * 0.85, 2.85 - Math.floor(i / 3) * 0.6, -4.3]} scale={pop(f, five + i * 3)}>
              <AppBoard app={app} w={0.72} dim={!on && f >= racing} line="REMOVE LISTING?" />
            </group>
          );
        })}
      </Stage>
      <FXLayer>
        <Tag at={cross} out={delist} x={540} y={330} text="CROSSLISTING" bg={BRAND.bg} fg={BRAND.sage} size={60} />
        <Mark at={cross + 6} out={delist} x={540} y={470} ok size={130} />
        <Tag at={delist} out={racing} x={540} y={330} text="DELISTING" bg="#ffffff" fg="#d62f3a" size={66} />
        <Mark at={delist + 6} out={racing} x={540} y={480} ok={false} size={130} />
        <Tag at={five} x={540} y={300} text="x5 EVERY SALE" bg="#d62f3a" fg="#ffffff" size={56} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 guessed prices
const S05: React.FC = () => {
  const s = useShot();
  const prices = s.hit("prices");
  const guess = s.hit("guessing");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.0, 1.5, 0.9], look: [0.0, 1.35, -1.6], fov: 38 },
          { f: guess, pos: [0.0, 1.5, 0.5], look: [0.0, 1.4, -1.6], fov: 36, ease: "burst", dur: 8 },
        ]}
        kicks={[guess + 2]}
        dof={10}
        focus={[0, 1.35, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0, 0, -1.5]} poses={[[0, "think"], [guess, "shrug"]]} faces={[[0, "thinking"], [guess, "confused"]]} talking={s.speaking(["b07"])} />
      </Stage>
      <FXLayer>
        <Bubble at={prices} x={330} y={420} text="$5? $50?" kind="thought" size={56} width={340} />
        <Tag at={guess} x={760} y={560} text="$???" bg={BRAND.tag} fg="#1b1b1f" size={72} rot={8} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 pileGo!
const S06: React.FC = () => {
  const s = useShot();
  const snap = s.hit("snap");
  const pg = s.hit("pileGo");
  const six = s.hit("six");
  const prices = s.hit("Prices");
  const actually = s.hit("actually");
  const sells = s.hit("sells");
  const down = s.hit("down");
  const f = s.f;
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.05, 1.45, 1.2], look: [0.05, 1.3, -2.4], fov: 40 },
          { f: pg, pos: [-0.05, 1.7, 1.9], look: [-0.05, 1.85, -3.2], fov: 46, ease: "glide", dur: 18 },
          { f: prices, pos: [0.45, 1.2, -0.9], look: [0.5, 1.0, -2.6], fov: 34, ease: "glide", dur: 20 },
          { f: sells, pos: [-0.05, 1.7, 1.9], look: [-0.05, 1.85, -3.2], fov: 46, ease: "glide", dur: 20 },
        ]}
        kicks={[pg + 2, actually + 2]}
        dof={(f) => (f >= prices && f < sells ? 10 : 3)}
        focus={(f) => (f >= prices && f < sells ? [0.5, 1.0, -2.55] : [0, 1.4, -2.4])}
        shadow={{ center: [0, 0, -2.2], size: 7 }}
      >
        <TiffRoom chair={false} />
        <JacketStand position={[0.5, 0, -2.6]} />
        <Stick
          spec={TIFF}
          at={[-0.4, 0, -2.2]}
          poses={[[0, "holdOne"], [pg, "presentBoth"], [prices, "point"], [down, "victory"]]}
          faces={[[0, "determined"], [pg, "starstruck"], [prices, "smug"], [down, "joy"]]}
          items={[[0, { kind: "phone", hand: "R" }], [pg, null]]}
          talking={s.speaking(["b08", "b09", "b10"])}
        />
        <group position={[-0.05, 3.0, -4.25]} scale={pop(f, pg, 11)}>
          <PileGoBoard w={1.3} />
        </group>
        {APPS.map((app, i) => {
          const isSold = i === 1;
          const drop = !isSold && f >= down ? clamp(invLerp(down + i * 2, down + i * 2 + 12, f)) : 0;
          return (
            <group key={app.name} position={[-0.75 + (i % 3) * 0.7, 2.25 - Math.floor(i / 3) * 0.52 - drop * 2.2, -4.25]} scale={pop(f, six - 6 + i * 3) * (1 - drop * 0.6)}>
              <AppBoard app={app} w={0.58} sold={isSold && f >= sells} />
            </group>
          );
        })}
        <Burst3D kind="sparks" at={pg} origin={[-0.05, 3.0, -4.0]} count={60} power={3} />
      </Stage>
      <FXLayer>
        <FlashFX at={snap} dur={6} max={0.5} />
        <Tag at={six} out={prices} x={540} y={1020} text="LISTED ON 6 APPS" bg={BRAND.bg} fg={BRAND.sage} size={58} />
        <Tag at={actually} out={sells} x={540} y={330} text="PRICED FROM REAL eBay SALES" bg="#ffffff" fg="#1b1b1f" size={46} />
        <Tag at={down} x={540} y={1020} text="GONE EVERYWHERE ELSE" bg="#ffffff" fg="#1f7a3a" size={54} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 one buyer, zero apologies
const S07: React.FC = () => {
  const s = useShot();
  const one = s.hit("One");
  const zero = s.hit("Zero");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.3, 1.45, 1.6], look: [-0.3, 1.3, -2.0], fov: 42 },
          { f: zero, pos: [-0.3, 1.45, 1.2], look: [-0.3, 1.35, -2.0], fov: 40, ease: "burst", dur: 10 },
        ]}
        kicks={[zero + 2]}
        dof={5}
        focus={[-0.3, 1.3, -2]}
        shadow={{ center: [0, 0, -2], size: 6 }}
      >
        <TiffRoom chair={false} />
        <Stick spec={TIFF} at={[0.1, 0, -2.1]} poses={[[0, "holdOne"], [one, "pointAcross"], [zero, "handsHips"]]} faces={[[0, "happy"], [zero, { eyes: "lidded", mouth: "smirk", brows: "oneUp", extras: ["sparkle"] }]]} items={[[0, { ...JACKET, hand: "R" }], [one, null]]} talking={s.speaking(["b11"])} />
        <Stick spec={BUYER_A} at={[-0.7, 0, -2.0]} facing="right" poses={[[0, "idle"], [one, "holdOne"]]} faces={[[0, "happy"], [one, "joy"]]} items={[[one, JACKET]]} />
        <Burst3D kind="confetti" at={zero} origin={[-0.3, 1.8, -2.0]} count={80} power={4} />
      </Stage>
      <FXLayer>
        <Tag at={one} out={zero} x={540} y={330} text="1 BUYER" bg="#ffffff" fg="#1f7a3a" size={62} />
        <Tag at={zero} x={540} y={330} text="pileGo!" bg={BRAND.bg} fg={BRAND.cream} size={84} fontName="Poppins" />
        <Tag at={zero + 6} x={540} y={450} text="pilego.app" bg={BRAND.sage} fg={BRAND.bg} size={50} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#f2c7d3" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
