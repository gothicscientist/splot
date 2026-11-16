// scenes: hand-written
// "I almost sold a love letter for 12 dollars" - Tiff (3D anime v5 cut-out) composited over generated 3D-anime
// backgrounds, all motion in code (camera push/parallax, pops, punch-ins). pileGo! appears only in the last line.
// Every visual beat is keyed to its spoken word through useShot(): s.hit("word") lands 2 frames before the word.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stamp, Tag, Counter, FXLayer, FlashFX } from "../../core/fx2d";
import { backOut, clamp, easeOut, invLerp, smootherstep } from "../../core/anim";
import { font } from "../../core/fonts";
import type { Timeline } from "../../core/types";
import timelineJson from "./timeline.json";

const timeline = timelineJson as unknown as Timeline;
const IMG = (f: string) => staticFile(`img/tiff-love-letter/${f}`);
const BRAND = { bg: "#161813", cream: "#f2efe4", sage: "#a8c68a" };
const TIFF_AR = 593 / 1451; // cut-out aspect (w / h)

const pop = (f: number, at: number, dur = 9) => (f < at ? 0 : backOut(invLerp(at, at + dur, f), 2.2));
/** slow camera creep on a still: 0..1 over the shot */
const creep = (f: number, len: number) => smootherstep(clamp(f / Math.max(1, len)));

// ------------------------------------------------------------------------------------------------ building blocks
/** Full-bleed background still with a slow push + drift (never frozen). */
const Plate: React.FC<{ src: string; f: number; len: number; z0?: number; z1?: number; x?: number; y?: number; blur?: number; dim?: number }> = ({ src, f, len, z0 = 1.05, z1 = 1.14, x = 0, y = 0, blur = 0, dim = 0 }) => {
  const t = creep(f, len);
  const z = z0 + (z1 - z0) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={src} style={{ position: "absolute", width: 1280, height: 1920, left: -100, top: 0, transform: `translate(${x * t}px, ${y * t}px) scale(${z})`, filter: blur ? `blur(${blur}px)` : undefined }} />
      {dim ? <AbsoluteFill style={{ background: `rgba(10,8,20,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

/** Tiff cut-out. h = on-screen height (px); cx = centre x; feet = y of her soles. Breathes and sways a little. */
const Tiff: React.FC<{ f: number; h: number; cx: number; feet: number; enter?: number; tilt?: number; flip?: boolean; shake?: number; bob?: number }> = ({ f, h, cx, feet, enter, tilt = 0, flip = false, shake = 0, bob = 1 }) => {
  const w = h * TIFF_AR;
  const breathe = 1 + Math.sin(f * 0.11) * 0.006 * bob;
  const sway = Math.sin(f * 0.05) * 0.8 * bob;
  const inK = enter === undefined ? 1 : f < enter ? 0 : backOut(invLerp(enter, enter + 10, f), 1.8);
  const sx = shake ? Math.sin(f * 2.3) * shake : 0;
  return (
    <div style={{ position: "absolute", left: cx - w / 2 + sx + (1 - inK) * 600, top: feet - h, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${sway + tilt}deg) scaleY(${breathe}) ${flip ? "scaleX(-1)" : ""}`, opacity: inK > 0 ? 1 : 0, filter: "drop-shadow(0 18px 24px rgba(30,10,40,0.35))" }}>
      <Img src={IMG("tiff.png")} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

/** Aged envelope (code-drawn). */
const Envelope: React.FC<{ x: number; y: number; w: number; rot?: number; k?: number }> = ({ x, y, w, rot = -6, k = 1 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.32, width: w, height: w * 0.64, transform: `rotate(${rot}deg) scale(${k})`, background: "linear-gradient(135deg,#f3e2b8,#d9bf8a)", borderRadius: 10, boxShadow: "0 16px 30px rgba(0,0,0,0.35)", border: "3px solid #b8955a" }}>
    <svg viewBox="0 0 100 64" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <path d="M2 2 L50 36 L98 2" fill="none" stroke="#b8955a" strokeWidth="1.6" />
      <circle cx="50" cy="38" r="6" fill="#a8344a" />
    </svg>
  </div>
);

/** Handwritten letter sheet; lines write on over time (0..1 each). */
const Letter: React.FC<{ lines: { text: string; t: number; size?: number; color?: string }[]; k?: number; f?: number }> = ({ lines, k = 1, f = 0 }) => {
  const hand = font("Caveat");
  return (
    <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 860, transform: `translateY(${Math.sin(f * 0.07) * 14}px) scale(${k * (1 + 0.0025 * f)}) rotate(${-1.5 + Math.sin(f * 0.05) * 1.2}deg)`, transformOrigin: "50% 50%", background: "linear-gradient(180deg,#f8edd2,#ead6a6)", borderRadius: 14, boxShadow: "0 30px 60px rgba(0,0,0,0.45)", padding: "70px 80px", boxSizing: "border-box" }}>
      {Array.from({ length: 11 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 60, right: 60, top: 150 + i * 62, height: 2, background: "rgba(120,90,50,0.18)" }} />
      ))}
      {lines.map((l, i) => {
        const n = Math.round(l.text.length * clamp(l.t));
        return (
          <div key={i} style={{ fontFamily: hand, fontWeight: 700, fontSize: l.size ?? 76, color: l.color ?? "#2a2a5a", lineHeight: 1.2, marginBottom: 18, whiteSpace: "pre-wrap" }}>
            {l.text.slice(0, n)}
            {n < l.text.length && l.t > 0 ? <span style={{ opacity: 0.6 }}>|</span> : null}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------------------------------------ s01 hook
const S01: React.FC = () => {
  const s = useShot();
  const love = s.hit("love");
  const twelve = s.hit("twelve");
  const late = s.hit("late");
  const len = s.end("late") + 10;
  const zoomIn = easeOut(clamp(invLerp(late - 4, late + 10, s.f)));
  return (
    <AbsoluteFill>
      <Plate src={IMG("bedroom.jpg")} f={s.f} len={len} z0={1.12} z1={1.2} x={-30} blur={4} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.18 * zoomIn})`, transformOrigin: "50% 38%" }}>
        <Tiff f={s.f} h={1500} cx={560} feet={1900} />
        <div style={{ position: "absolute", inset: 0 }}>
          <Envelope x={420} y={760} w={300 * (0.6 + 0.4 * pop(s.f, love))} rot={-10} />
        </div>
      </div>
      <FXLayer>
        <Stamp at={twelve} x={700} y={420} text="$12" color="#d62f3a" size={170} />
        <Tag at={late} x={540} y={250} text="37 YEARS LATE" bg="#1b1b1f" fg="#ffffff" size={64} rot={-3} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s02 clearing the chair, the jacket
const S02: React.FC = () => {
  const s = useShot();
  const clearing = s.hit("clearing");
  const snap = s.hit("snapping");
  const snapped = s.hit("snapped");
  const jacket = s.hit("jacket");
  const crinkled = s.hit("crinkled");
  const len = s.end("pocket") + 8;
  const f = s.f;
  // part 1: room + Tiff; part 2 (from "jacket"): jacket close-up pushing into the pocket
  const jk = clamp(invLerp(jacket - 4, jacket + 8, f));
  const pocketPush = easeOut(clamp(invLerp(crinkled, crinkled + 22, f)));
  return (
    <AbsoluteFill>
      <Plate src={IMG("bedroom.jpg")} f={f} len={len} z0={1.0} z1={1.1} x={40} />
      <Tiff f={f} h={1250} cx={720} feet={1820} enter={clearing - 6} />
      {/* phone flashes on each snap */}
      <FlashFX at={snap + 2} dur={5} max={0.55} />
      <FlashFX at={snapped + 2} dur={5} max={0.55} />
      {/* jacket close-up card */}
      <AbsoluteFill style={{ opacity: jk, background: `rgba(250,240,245,${0.92 * jk})` }}>
        <div style={{ position: "absolute", left: 60, top: 420, width: 960, height: 911, transformOrigin: "62% 26%", transform: `scale(${(0.85 + 0.15 * jk) * (1 + 1.6 * pocketPush) * (1 + 0.004 * Math.max(0, f - jacket))}) rotate(${Math.sin(f * 0.08) * 1.5}deg)` }}>
          <Img src={IMG("jacket.png")} style={{ width: "100%", height: "100%" }} />
        </div>
      </AbsoluteFill>
      <FXLayer>
        <Tag at={clearing} out={jacket - 6} x={540} y={260} text="THE CLOTHES CHAIR" bg="#ffffff" fg="#1b1b1f" size={58} rot={-3} />
        <Tag at={jacket} out={crinkled} x={540} y={300} text="THRIFTED JACKET" bg="#6b4423" fg="#ffffff" size={58} />
        <Tag at={crinkled} x={540} y={300} text="*crinkle*" bg="#f3e2b8" fg="#6b4423" size={64} rot={4} fontName="Caveat" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s03 the letter
const S03: React.FC = () => {
  const s = useShot();
  const dated = s.hit("1987");
  const never = s.hit("Never");
  const june = s.hit("June");
  const stay = s.end("stay");
  const signed = s.hit("Signed");
  const robert = s.hit("Robert");
  const f = s.f;
  const env = 1 - clamp(invLerp(june - 14, june - 4, f)); // envelope gives way to the open letter
  const lk = pop(f, june - 10, 12);
  return (
    <AbsoluteFill>
      <Plate src={IMG("bedroom.jpg")} f={f} len={240} z0={1.2} z1={1.3} blur={10} dim={0.35} />
      <div style={{ opacity: env }}>
        <Envelope x={540} y={760 + Math.sin(f * 0.09) * 16} w={760 * pop(f, 0, 10) * (1 + 0.003 * f)} rot={-4 + Math.sin(f * 0.06) * 2.5} />
      </div>
      {f >= june - 10 ? (
        <Letter
          f={f}
          k={lk}
          lines={[
            { text: "June,", t: invLerp(june, june + 12, f) },
            { text: "I should have asked you to stay.", t: invLerp(june + 12, stay, f) },
            { text: "— R.", t: invLerp(robert - 2, robert + 12, f), size: 92, color: "#7a2a2a" },
          ]}
        />
      ) : null}
      <FXLayer>
        <Stamp at={dated} out={june - 12} x={720} y={470} text="1987" color="#7a2a2a" size={150} />
        <Tag at={never} out={june - 12} x={540} y={1020} text="NEVER SENT" bg="#1b1b1f" fg="#ffffff" size={60} />
        <Tag at={signed} x={760} y={1040} text="ROBERT" bg="#7a2a2a" fg="#ffffff" size={56} rot={-4} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s04 the twist
const S04: React.FC = () => {
  const s = useShot();
  const g = s.hit("grandma's");
  const f = s.f;
  const push = easeOut(clamp(invLerp(g - 2, g + 10, f)));
  return (
    <AbsoluteFill>
      <Plate src={IMG("bedroom.jpg")} f={f} len={60} z0={1.25} z1={1.32} blur={12} dim={0.15} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1.55 + 0.35 * push})`, transformOrigin: "52% 16%" }}>
        <Tiff f={f} h={1500} cx={540} feet={1950} shake={f >= g && f < g + 8 ? 6 : 0} bob={0.2} />
      </div>
      <FXLayer>
        <FlashFX at={g} dur={5} max={0.5} />
        <Tag at={s.hit("June")} out={g} x={540} y={240} text="JUNE..." bg="#ffffff" fg="#2a2a5a" size={70} fontName="Caveat" />
        <Stamp at={g} x={540} y={330} text="GRANDMA?!" color="#d62f3a" size={120} />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s05 grandma
const S05: React.FC = () => {
  const s = useShot();
  const showed = s.hit("showed");
  const quiet = s.hit("quiet");
  const wore = s.hit("wore");
  const every = s.hit("every");
  const waited = s.hit("waited");
  const sentence = s.hit("sentence");
  const len = 230;
  const f = s.f;
  const close = easeOut(clamp(invLerp(waited - 4, waited + 30, f)));
  return (
    <AbsoluteFill>
      <Plate src={IMG("grandma-room.jpg")} f={f} len={len} z0={1.04} z1={1.16} x={-40} y={-20} />
      <Tiff f={f} h={1180} cx={760} feet={1830} enter={showed - 6} bob={0.6} />
      {/* the letter, held up in the sunbeam, grows as the line lands */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.5 * close})`, transformOrigin: "35% 45%" }}>
        <div style={{ position: "absolute", left: 230, top: 760 + Math.sin(f * 0.08) * 10, width: 300, height: 300, borderRadius: 150, background: "radial-gradient(circle, rgba(255,236,180,0.85) 0%, rgba(255,236,180,0) 70%)", opacity: pop(f, showed + 4) }} />
        <Envelope x={380} y={880 + Math.sin(f * 0.08) * 10} w={260 * pop(f, showed + 4)} rot={8} />
      </div>
      <FXLayer>
        <Tag at={quiet} out={wore} x={540} y={260} text="*silence*" bg="#ffffff" fg="#6b6b80" size={56} fontName="Caveat" />
        <Tag at={wore} out={waited} x={540} y={300} text={'"he wore that jacket every day"'} bg="#f8edd2" fg="#2a2a5a" size={50} fontName="Caveat" />
        <Stamp at={every} out={waited} x={760} y={520} text="EVERY DAY" color="#7a2a2a" size={90} />
        <Tag at={waited} x={540} y={300} text="37 YEARS" bg="#1b1b1f" fg="#ffffff" size={72} />
        <Tag at={sentence} x={540} y={430} text="for one sentence" bg="#ffffff" fg="#2a2a5a" size={54} fontName="Caveat" />
      </FXLayer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ s06 the ending: both up $50
const S06: React.FC = () => {
  const s = useShot();
  const now = s.hit("Now");
  const fifty = s.hit("fifty");
  const pg = s.hit("pileGo");
  const f = s.f;
  const sold = f >= now + 8;
  return (
    <AbsoluteFill>
      <Plate src={IMG("bedroom.jpg")} f={f} len={130} z0={1.02} z1={1.1} x={30} />
      <Tiff f={f} h={1250} cx={330} feet={1840} />
      {/* the jacket listing card, SOLD */}
      <div style={{ position: "absolute", left: 610, top: 330, width: 390, transform: `scale(${pop(f, now)}) rotate(4deg)`, transformOrigin: "50% 50%", background: "#ffffff", borderRadius: 26, boxShadow: "0 24px 50px rgba(0,0,0,0.35)", padding: 18, boxSizing: "border-box" }}>
        <Img src={IMG("jacket.png")} style={{ width: "100%", height: 340, objectFit: "contain" }} />
        <div style={{ fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 30, color: "#1b1b1f", marginTop: 6 }}>Vintage suede jacket</div>
        <div style={{ fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 40, color: sold ? "#1f7a3a" : "#1b1b1f" }}>{sold ? "SOLD · $50" : "$50"}</div>
      </div>
      <FXLayer>
        <Counter at={fifty} x={330} y={470} from={0} to={50} prefix="+$" label="ME" />
        <Counter at={fifty + 6} x={800} y={930} from={0} to={50} prefix="+$" label="GRANDMA" />
        <Tag at={pg} x={540} y={200} text="pileGo!" bg={BRAND.bg} fg={BRAND.cream} size={84} fontName="Poppins" />
        <Tag at={pg + 6} x={360} y={330} text="pilego.app" bg={BRAND.sage} fg={BRAND.bg} size={50} />
      </FXLayer>
    </AbsoluteFill>
  );
};

export const Video: React.FC<{ variant?: number }> = ({ variant = 0 }) => (
  <Reel timeline={timeline} variant={variant} background="#f2c7d3" scenes={{ s01: S01, s02: S02, s03: S03, s04: S04, s05: S05, s06: S06 }} />
);
