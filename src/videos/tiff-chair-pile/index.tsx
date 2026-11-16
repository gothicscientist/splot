// scenes: hand-written
// "My chair hasn't been a chair since March" - StickWorld set x Problem-Solution, starring Tiff, plugging pileGo!.
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";
import { Burst3D } from "../../core/three/particles";
import { Stamp, Tag, FXLayer, FlashFX, Burst } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import { backOut, clamp, invLerp } from "../../core/anim";
import type { Timeline } from "../../core/types";
import { APPS, AppBoard, BRAND, JacketStand, PileGoBoard, TiffRoom } from "../_tiff/set";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const TIFF = CAST.tiff;
/** 0 -> 1 pop with overshoot starting at frame `at` */
const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const chair = s.hit("chair");
  const march = s.hit("March");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.15, 1.35, 2.5], look: [-0.2, 1.12, -1.45], fov: 40 },
          { f: chair + 4, pos: [-0.2, 1.3, 2.05], look: [-0.2, 1.12, -1.45], fov: 40, ease: "burst", dur: 10 },
        ]}
        kicks={[chair + 2, march + 2]}
        dof={6}
        focus={[-0.2, 1.0, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "relaxed"], [chair - 4, "present"]]} faces={[[0, "neutral"], [chair, "unimpressed"]]} talking={s.speaking(["b01"])} />
      </Stage>
      <FXLayer>
        <Tag at={chair} x={360} y={560} text="MY CHAIR" bg="#ffffff" fg="#1b1b1f" size={56} rot={-6} />
        <Stamp at={march} x={560} y={400} text="SINCE MARCH" color={BRAND.bg} size={92} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 the pile
const S02: React.FC = () => {
  const s = useShot();
  const sell = s.hit("sell");
  const but = s.hit("But");
  const never = s.hit("never");
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [-0.35, 1.25, 0.25], look: [-0.6, 0.95, -1.6], fov: 34 },
          { f: but, pos: [0.25, 1.35, 2.0], look: [0.1, 1.2, -1.45], fov: 40, ease: "glide", dur: 24 },
        ]}
        kicks={[sell + 2]}
        dof={(f) => (f < but ? 11 : 6)}
        focus={(f) => (f < but ? [-0.6, 0.95, -1.6] : [0.2, 1.2, -1.3])}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom />
        <Stick
          spec={TIFF}
          at={[0.05, 0, -1.25]}
          poses={[[0, "think"], [sell, "pointAcross"], [but, "holdOne"]]}
          faces={[[0, "thinking"], [sell, "grin"], [but, "unimpressed"]]}
          items={[[but, { kind: "sign", text: "1 JACKET", hand: "R", color: "#6b7a3a" }]]}
          talking={s.speaking(["b02", "b03"])}
        />
      </Stage>
      <FXLayer>
        <Tag at={sell} out={but} x={300} y={520} text="$ $ $" bg={BRAND.tag} fg="#1b1b1f" size={64} rot={-8} />
        <Tag at={never} x={600} y={430} text="= 6 APPS" bg={BRAND.bg} fg={BRAND.cream} size={60} rot={5} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 every app wants everything
const S03: React.FC = () => {
  const s = useShot();
  const photos = s.hit("photos");
  const form = s.hit("form");
  const every = s.hit("everything");
  const list = s.hit("list");
  const sits = s.hit("sits");
  const f = s.f;
  const at = [photos, form, every, every + 3, every + 6, every + 9];
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [1.25, 1.55, 0.9], look: [1.4, 1.5, -3.0], fov: 40 },
          { f: every + 4, pos: [1.3, 1.6, 1.35], look: [1.45, 1.55, -3.2], fov: 42, ease: "burst", dur: 10 },
          { f: list, pos: [1.0, 1.45, -0.2], look: [1.25, 1.25, -2.9], fov: 36, ease: "glide", dur: 22 },
        ]}
        kicks={[every + 2]}
        dof={(f) => (f < list ? 4 : 9)}
        focus={[1.05, 1.3, -2.6]}
        shadow={{ center: [1.2, 0, -2.6], size: 6 }}
      >
        <TiffRoom laptop="SELL FORM" />
        <Stick
          spec={TIFF}
          at={[1.0, 0, -2.55]}
          poses={[[0, "typing"], [every, "armsUp"], [list, "holdOne"], [sits, "facepalm"]]}
          faces={[[0, "determined"], [every, "furious"], [list, "neutral"], [sits, "sleepy"]]}
          items={[[list, { kind: "phone", hand: "R" }]]}
          talking={s.speaking(["b04", "b05"])}
        />
        {APPS.map((app, i) => {
          const k = pop(f, at[i]);
          const x = 0.15 + (i % 3) * 1.0;
          const y = 2.75 - Math.floor(i / 3) * 0.72;
          return (
            <group key={app.name} position={[x, y, -4.3]} scale={k}>
              <AppBoard app={app} w={0.82} line={["PHOTOS x8", "SIZE CHART", "TAGS x5", "SHIPPING?", "CONDITION", "BRAND?"][i]} dim={f >= list && i !== 2} />
            </group>
          );
        })}
      </Stage>
      <FXLayer>
        <Tag at={sits} x={360} y={430} text="0 VIEWS" bg="#ffffff" fg="#d62f3a" size={64} rot={-5} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 crosslisting

const S04: React.FC = () => {
  const s = useShot();
  const cross = s.hit("crosslisting");
  const once = s.hit("once");
  const more = s.hit("More");
  const f = s.f;
  // six boards around the jacket, lighting up one after another
  const ring = APPS.map((app, i) => ({ app, x: -0.62 + (i % 3) * 0.62, y: 2.42 - Math.floor(i / 3) * 0.48 }));
  return (
    <AbsoluteFill>
      <Stage
        look="interior"
        cam={[
          { f: 0, pos: [0.15, 1.5, 2.1], look: [0.0, 1.45, -2.6], fov: 46 },
          { f: once, pos: [-0.05, 1.5, 1.8], look: [-0.05, 1.45, -2.6], fov: 46, ease: "glide", dur: 30 },
          { f: more, pos: [-0.2, 1.45, 1.4], look: [-0.2, 1.35, -2.4], fov: 44, ease: "glide", dur: 26 },
        ]}
        kicks={[cross + 2]}
        dof={3}
        focus={[0.3, 1.3, -2.2]}
        shadow={{ center: [0, 0, -2], size: 7 }}
      >
        <TiffRoom chair={false} />
        <JacketStand position={[0.4, 0, -2.6]} />
        {ring.map(({ app, x, y }, i) => (
          <group key={app.name} position={[x, y, -2.95]} scale={pop(f, cross + 6 + i * 7)}>
            <AppBoard app={app} w={0.5} />
          </group>
        ))}
        <Stick
          spec={TIFF}
          at={[-0.4, 0, -2.2]}
          poses={[[0, "point"], [more, "cheer"]]}
          faces={[[0, "smug"], [more, "joy"]]}
          talking={s.speaking(["b06", "b07"])}
        />
        <Burst3D kind="confetti" at={more} origin={[0.0, 2.2, -2.6]} count={70} power={3.5} />
      </Stage>
      <FXLayer>
        <Tag at={cross} out={more} x={540} y={250} text="CROSSLISTING" bg={BRAND.bg} fg={BRAND.sage} size={66} />
        <Tag at={more} x={540} y={250} text="MORE APPS = MORE EYES" bg="#ffffff" fg="#1b1b1f" size={54} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 sold twice, midnight refund
const S05: React.FC = () => {
  const s = useShot();
  const sells = s.hit("sells");
  const again = s.hit("again");
  const now = s.hit("Now");
  const midnight = s.hit("midnight");
  return (
    <AbsoluteFill>
      <Stage
        look="night"
        cam={[
          { f: 0, pos: [0.2, 1.55, 0.6], look: [0.0, 1.35, -1.8], fov: 36 },
          { f: again + 3, pos: [0.1, 1.5, -0.1], look: [0.0, 1.4, -1.8], fov: 32, ease: "burst", dur: 9 },
          { f: now, pos: [1.0, 1.5, 0.3], look: [1.2, 1.25, -2.8], fov: 38, ease: "glide", dur: 20 },
        ]}
        kicks={[again + 2, midnight + 2]}
        dof={(f) => (f < now ? 11 : 7)}
        focus={(f) => (f < now ? [0, 1.35, -1.75] : [1.0, 1.2, -2.55])}
        shadow={{ center: [0.5, 0, -2], size: 6 }}
      >
        <TiffRoom night laptop="REFUND" />
        <Stick
          spec={TIFF}
          at={(s.f < now ? [0, 0, -1.8] : [1.0, 0, -2.55]) as [number, number, number]}
          poses={[[0, "holdOne"], [again, "scared"], [now, "typing"]]}
          faces={[[0, "happy"], [again, "panic"], [now, "crying"]]}
          items={[[0, { kind: "phone", hand: "R" }], [now, null]]}
          talking={s.speaking(["b08", "b09"])}
        />
      </Stage>
      <FXLayer>
        <Tag at={sells} out={now} x={330} y={470} text="SOLD on Depop" bg="#ffffff" fg="#ff2300" size={50} rot={-6} />
        <Tag at={again} out={now} x={720} y={600} text="SOLD on Vinted" bg="#ffffff" fg="#09b1ba" size={50} rot={6} />
        <Burst at={again} out={now} x={270} y={330} text="UH OH" size={240} />
        <Stamp at={midnight} x={540} y={430} text="REFUND" color="#d62f3a" size={120} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 pileGo!
const S06: React.FC = () => {
  const s = useShot();
  const snap = s.hit("snap");
  const pg = s.hit("pileGo");
  const sells = s.hit("sells");
  const down = s.hit("down");
  const f = s.f;
  const pile = 1 - 0.6 * clamp(invLerp(down, down + 30, f));
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [-0.05, 1.35, 1.6], look: [-0.2, 1.15, -1.45], fov: 40 },
          { f: pg, pos: [-0.15, 1.6, 2.2], look: [-0.15, 1.75, -3.0], fov: 46, ease: "glide", dur: 18 },
          { f: down + 20, pos: [-0.2, 1.45, 2.1], look: [-0.2, 1.35, -2.0], fov: 44, ease: "glide", dur: 24 },
        ]}
        kicks={[pg + 2]}
        dof={3}
        focus={[0, 1.3, -1.7]}
        shadow={{ center: [0, 0, -1.6], size: 7 }}
      >
        <TiffRoom pile={pile} />
        <Stick
          spec={TIFF}
          at={[0.2, 0, -1.25]}
          facing="left"
          poses={[[0, "holdOne"], [pg, "presentBoth"], [down, "victory"]]}
          faces={[[0, "determined"], [pg, "starstruck"], [down, "joy"]]}
          items={[[0, { kind: "phone", hand: "R" }], [pg, null]]}
          talking={s.speaking(["b10", "b11"])}
        />
        <group position={[-0.15, 2.95, -4.25]} scale={pop(f, pg, 11)}>
          <PileGoBoard w={1.3} />
        </group>
        {APPS.map((app, i) => {
          const x = -0.85 + (i % 3) * 0.7;
          const row = Math.floor(i / 3);
          const isSold = i === 1;
          const drop = !isSold && f >= down ? clamp(invLerp(down + i * 2, down + i * 2 + 12, f)) : 0;
          return (
            <group key={app.name} position={[x, 2.2 - row * 0.52 - drop * 2.2, -4.25]} scale={pop(f, pg + 8 + i * 3) * (1 - drop * 0.6)}>
              <AppBoard app={app} w={0.58} sold={isSold && f >= sells} />
            </group>
          );
        })}
        <Burst3D kind="sparks" at={pg} origin={[-0.15, 2.95, -4.0]} count={60} power={3} />
      </Stage>
      <FXLayer>
        <FlashFX at={snap} dur={6} max={0.5} />
        <Tag at={pg} out={sells} x={540} y={1020} text="LISTED ON 6 APPS" bg={BRAND.bg} fg={BRAND.sage} size={58} />
        <Tag at={down} x={540} y={1020} text="DELISTED EVERYWHERE ELSE" bg="#ffffff" fg="#1f7a3a" size={50} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s07 I have a chair again
const S07: React.FC = () => {
  const s = useShot();
  const free = s.hit("free");
  const open = s.hit("open");
  const chair = s.hit("chair");
  return (
    <AbsoluteFill>
      <Stage
        look="day"
        cam={[
          { f: 0, pos: [0.2, 1.4, 2.6], look: [-0.2, 1.12, -1.45], fov: 40 },
          { f: chair, pos: [-0.2, 1.3, 2.05], look: [-0.2, 1.12, -1.45], fov: 40, ease: "burst", dur: 10 },
        ]}
        kicks={[chair + 2]}
        dof={6}
        focus={[-0.2, 1.0, -1.5]}
        shadow={{ center: [0, 0, -1.5], size: 6 }}
      >
        <TiffRoom pile={0} />
        <Stick spec={TIFF} at={[0.2, 0, -1.25]} facing="left" poses={[[0, "handsHips"], [chair - 4, "present"]]} faces={[[0, "happy"], [chair, "joy"]]} talking={s.speaking(["b12"])} />
        <Burst3D kind="confetti" at={chair} origin={[-0.6, 1.2, -1.6]} count={80} power={4} />
      </Stage>
      <FXLayer>
        <Tag at={free} out={chair} x={540} y={330} text="FREE" bg={BRAND.sage} fg={BRAND.bg} size={70} rot={-4} />
        <Tag at={open} out={chair} x={540} y={450} text="OPEN SOURCE" bg={BRAND.bg} fg={BRAND.cream} size={56} rot={3} />
        <Tag at={chair} x={540} y={330} text="pileGo!" bg={BRAND.bg} fg={BRAND.cream} size={84} fontName="Poppins" />
        <Tag at={chair + 6} x={540} y={450} text="pilego.app" bg={BRAND.sage} fg={BRAND.bg} size={50} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#f2c7d3" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06, s07: S07 }} />
);
