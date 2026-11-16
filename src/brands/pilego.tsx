// pileGo! brand kit (the owner's app, pilego.app): the tag mark and wordmark, the real palette and type, and the
// in-video plug devices. Every device shows only what the app actually does: snap the pile -> real cutouts ->
// drafts -> live everywhere you sell -> one sells -> it comes down everywhere else; the pile gets smaller.
// Brand facts + voice: skills/reel/references/brands/pilego.md. Platform names are plain text chips (no logos).
// Coordinates are px at 1080x1920 (scaled to the output), like core/fx2d. Everything is a function of the frame.
//
//   <PileGoPhone at={s.hit("snap")} x={540} y={760} steps={{ cut: s.hit("snap") + 8, list: s.hit("drafts"), live: s.hit("everywhere"), sold: s.hit("sold") }} />
//   <SoldStack pings={[{ at: s.hit("sold"), title: "Sold on Depop", body: "Washed black zip hoodie · $45" }]} />
//   <EndCard at={s.hit("pile")} />
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useLocalFrame } from "../core/timeline";
import { backOut, clamp, easeIn, easeOut, invLerp } from "../core/anim";
import { font } from "../core/fonts";
import { Pos, useLife } from "../core/fx2d";

/** Tokens copied from pilego.app (light + dark themes). */
export const PG = {
  paper: "#f4f0e6",
  paper2: "#e8e2d2",
  card: "#fffdf6",
  ink: "#22241e",
  ink2: "#4b4e44",
  muted: "#77786c",
  line: "#dcd4c0",
  accent: "#56703f",
  accentDeep: "#3e5430",
  olive: "#78836e",
  kraft: "#d9c49c",
  kraftDeep: "#b39a6d",
  kraftInk: "#3a3125",
  butter: "#f2cd5c",
  tomato: "#e0533a",
  lilac: "#cdb6ea",
  pink: "#eeb2c6",
  sky: "#9ccbe8",
  dark: "#161813",
  darkInk: "#f2efe4",
  darkInk2: "#cbc8b9",
  darkGreen: "#a8c68a",
  tomatoDark: "#ff7b5e",
};
export const PLATFORMS = ["eBay", "Vinted", "Depop", "Poshmark", "Mercari"];
const UI = () => font("Libre Franklin");
const WORD = () => font("Libre Franklin Italic");

// ------------------------------------------------------------------------------------------------ marks
/** The hang-tag mark (as on pilego.app), tilted -10 deg. */
export const PileGoMark: React.FC<{ size?: number; rot?: number; dark?: boolean }> = ({ size = 64, rot = -10, dark = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${rot}deg)`, display: "block" }}>
    <path d="M16 2.5 C 10 2.5, 9 9, 13.5 10.5" fill="none" stroke={dark ? PG.darkInk2 : PG.ink2} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M11 8 H21 L26 13 V28 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 V13 Z" fill={PG.kraft} />
    <circle cx="16" cy="12.5" r="2" fill={dark ? PG.dark : PG.paper} />
    <path d="M10.5 19.5 H21.5 M10.5 24 H18" stroke={PG.kraftInk} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" />
  </svg>
);

/** "pileGo!" wordmark: Libre Franklin 900 italic, tight tracking, tomato "!". */
export const PileGoWord: React.FC<{ size?: number; dark?: boolean }> = ({ size = 80, dark = false }) => (
  <span style={{ fontFamily: WORD(), fontWeight: 900, fontStyle: "italic", fontSize: size, letterSpacing: "-0.055em", lineHeight: 1, color: dark ? PG.darkInk : PG.ink, whiteSpace: "nowrap" }}>
    pileGo<span style={{ color: dark ? PG.tomatoDark : PG.tomato, display: "inline-block" }}>!</span>
  </span>
);

export const PileGoLogo: React.FC<{ size?: number; dark?: boolean }> = ({ size = 80, dark = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.16 }}>
    <PileGoMark size={size * 0.92} dark={dark} />
    <PileGoWord size={size} dark={dark} />
  </div>
);

/** Small corner badge for the plug shot (keep it top-left: the right rail is the platform's). */
export const PileGoBug: React.FC<{ at: number; out?: number; x?: number; y?: number; dark?: boolean }> = ({ at, out, x = 250, y = 300, dark = true }) => {
  const L = useLife(at, out, 8);
  if (!L.visible || L.s <= 0) return null;
  return (
    <Pos x={x} y={y} scale={L.s}>
      <div style={{ padding: "14px 26px", borderRadius: 999, background: dark ? "rgba(22,24,19,0.86)" : "rgba(244,240,230,0.94)", boxShadow: "0 10px 30px rgba(0,0,0,0.28)" }}>
        <PileGoLogo size={46} dark={dark} />
      </div>
    </Pos>
  );
};

// ------------------------------------------------------------------------------------------------ garments (2D)
export type GarmentIconKind = "tee" | "hoodie" | "jeans" | "knit" | "jacket" | "boots" | "skirt";
/** Flat garment drawings for app screens and listing photos. */
export const GarmentIcon: React.FC<{ kind?: GarmentIconKind; color?: string; size?: number; rot?: number }> = ({ kind = "tee", color = "#1c1b20", size = 200, rot = 0 }) => {
  const st = { stroke: "#1d1418", strokeWidth: 3.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const lite = "rgba(255,255,255,0.16)";
  const dark = "rgba(0,0,0,0.18)";
  let body: React.ReactNode;
  switch (kind) {
    case "hoodie":
      body = (
        <>
          <path d="M30 40 L50 26 Q60 34 70 26 L90 40 L100 78 L86 82 L82 64 L82 108 L38 108 L38 64 L34 82 L20 78 Z" fill={color} {...st} />
          <path d="M48 27 Q60 50 72 27 Q66 14 60 13 Q54 14 48 27 Z" fill={color} {...st} />
          <path d="M46 84 L74 84 L70 98 L50 98 Z" fill={dark} />
          <path d="M55 40 L54 58 M65 40 L66 58" stroke={lite} strokeWidth={3} strokeLinecap="round" />
        </>
      );
      break;
    case "jeans":
      body = (
        <>
          <path d="M36 16 L84 16 L90 110 L66 110 L60 46 L54 110 L30 110 Z" fill={color} {...st} />
          <path d="M36 24 L84 24" stroke={dark} strokeWidth={4} />
          <path d="M44 30 Q48 40 56 38 M76 30 Q72 40 64 38" stroke={lite} strokeWidth={3} fill="none" />
        </>
      );
      break;
    case "jacket":
      body = (
        <>
          <path d="M30 34 L50 22 L60 30 L70 22 L90 34 L102 86 L88 90 L84 66 L84 108 L36 108 L36 66 L32 90 L18 86 Z" fill={color} {...st} />
          <path d="M60 30 L60 108" stroke={dark} strokeWidth={4} />
          <path d="M50 22 L56 46 L60 30 L64 46 L70 22" fill={dark} {...st} strokeWidth={2.4} />
        </>
      );
      break;
    case "knit":
      body = (
        <>
          <path d="M30 34 L48 24 Q60 32 72 24 L90 34 L102 80 L88 84 L84 62 L84 106 L36 106 L36 62 L32 84 L18 80 Z" fill={color} {...st} />
          {[44, 54, 64, 74].map((x) => (
            <path key={x} d={`M${x} 40 L${x} 102`} stroke={dark} strokeWidth={2.4} />
          ))}
          <path d="M36 100 L84 100" stroke={lite} strokeWidth={5} />
          <path d="M70 52 L76 58 M44 76 L50 70" stroke={lite} strokeWidth={2.6} />
        </>
      );
      break;
    case "boots":
      body = (
        <>
          {[0, 44].map((dx) => (
            <path key={dx} d={`M${22 + dx} 24 L${46 + dx} 24 L${46 + dx} 84 L${60 + dx} 92 L${60 + dx} 106 L${22 + dx} 106 Z`} fill={color} {...st} />
          ))}
          <path d="M22 98 L60 98 M66 98 L104 98" stroke={lite} strokeWidth={3} />
        </>
      );
      break;
    case "skirt":
      body = <path d="M40 30 L80 30 L98 104 L22 104 Z" fill={color} {...st} />;
      break;
    default:
      body = (
        <>
          <path d="M30 34 L48 24 Q60 32 72 24 L90 34 L102 66 L86 72 L82 58 L82 106 L38 106 L38 58 L34 72 L18 66 Z" fill={color} {...st} />
          <path d="M50 26 Q60 34 70 26" stroke={lite} strokeWidth={3} fill="none" />
        </>
      );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block", transform: `rotate(${rot}deg)` }}>
      {body}
    </svg>
  );
};

export type PileItem = { name: string; price: string; kind: GarmentIconKind; color: string };
export const DEFAULT_ITEMS: PileItem[] = [
  { name: "Washed black zip hoodie, heavy fleece", price: "$45", kind: "hoodie", color: "#2b2a31" },
  { name: "Distressed knit, 2000s Japanese label", price: "$62", kind: "knit", color: "#b9a7d9" },
  { name: "Baggy raw denim, 32 x 32", price: "$38", kind: "jeans", color: "#2c3c5e" },
];

// ------------------------------------------------------------------------------------------------ the app insert
export type PhoneSteps = { cut?: number; list?: number; live?: number; sold?: number; delist?: number };

/** The phone running pileGo!: viewfinder on the pile -> cutouts -> drafts -> live on every platform -> SOLD -> it
 *  comes down everywhere else. Slides up from below at `at`. Each step is a frame; leave one out to skip it. */
export const PileGoPhone: React.FC<{
  at: number;
  out?: number;
  x?: number;
  y?: number;
  scale?: number;
  steps?: PhoneSteps;
  items?: PileItem[];
  platforms?: string[];
  soldOn?: string;
  /** pile count shown on the sold screen: [before, after] */
  pile?: [number, number];
  rot?: number;
}> = ({ at, out, x = 540, y = 820, scale = 1, steps = {}, items = DEFAULT_ITEMS, platforms = PLATFORMS, soldOn = "Depop", pile, rot = -3 }) => {
  const f = useLocalFrame();
  const { width } = useVideoConfig();
  if (f < at || (out !== undefined && f > out + 10)) return null;
  const k = width / 1080;
  const tin = easeOut(invLerp(at, at + 12, f));
  const tout = out !== undefined ? easeIn(invLerp(out, out + 10, f)) : 0;
  const dy = (1 - tin) * 1500 + tout * 1500;
  const W = 600;
  const H = 1180;
  const S = steps;
  const phase = S.sold !== undefined && f >= S.sold ? "sold" : S.live !== undefined && f >= S.live ? "live" : S.list !== undefined && f >= S.list ? "list" : "snap";
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k + dy * k, transform: `translate(-50%, -50%) rotate(${rot * (1 - tout)}deg) scale(${scale * k})` }}>
      <div style={{ width: W, height: H, borderRadius: 92, background: "#0e0f0c", padding: 16, boxShadow: "0 40px 90px rgba(0,0,0,0.45), 0 0 0 3px #2b2c28 inset" }}>
        <div style={{ position: "relative", width: W - 32, height: H - 32, borderRadius: 78, overflow: "hidden", background: phase === "snap" ? "#121410" : PG.paper }}>
          {phase === "snap" ? <SnapScreen f={f} cut={S.cut} items={items} /> : null}
          {phase === "list" ? <ListScreen f={f} t0={S.list!} items={items} /> : null}
          {phase === "live" || phase === "sold" ? <LiveScreen f={f} live={S.live ?? S.sold!} sold={phase === "sold" ? S.sold : undefined} delist={S.delist ?? (S.sold !== undefined ? S.sold + 12 : undefined)} items={items} platforms={platforms} soldOn={soldOn} pile={pile} /> : null}
          {/* status bar + dynamic island */}
          <div style={{ position: "absolute", top: 18, left: "50%", width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: "#000" }} />
        </div>
      </div>
    </div>
  );
};

const SnapScreen: React.FC<{ f: number; cut?: number; items: PileItem[] }> = ({ f, cut, items }) => {
  const flash = cut !== undefined && f >= cut ? 1 - clamp(invLerp(cut, cut + 6, f)) : 0;
  const shown = cut !== undefined && f >= cut;
  const spots: [number, number, number][] = [
    [150, 470, -8],
    [330, 430, 6],
    [240, 640, -3],
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 86, width: "100%", textAlign: "center", fontFamily: UI(), fontWeight: 800, fontSize: 34, color: PG.darkInk }}>Snap the pile</div>
      {/* the chair pile in the viewfinder */}
      <div style={{ position: "absolute", left: 40, top: 300, width: 488, height: 560, borderRadius: 40, background: "radial-gradient(circle at 50% 40%, #3a3a33, #1b1c18)" }} />
      {spots.map(([sx, sy, r], i) => {
        const it = items[i % items.length];
        const pop = shown ? backOut(invLerp(cut! + 2 + i * 3, cut! + 9 + i * 3, f), 2) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: sx - 110, top: sy - 110 }}>
            <GarmentIcon kind={it.kind} color={it.color} size={220} rot={r} />
            {pop > 0 ? (
              <div style={{ position: "absolute", left: 6, top: 6, width: 208, height: 208, borderRadius: 34, border: `5px dashed ${PG.tomatoDark}`, transform: `scale(${0.7 + 0.3 * pop})`, opacity: clamp(pop) }} />
            ) : null}
          </div>
        );
      })}
      {shown ? (
        <div style={{ position: "absolute", top: 900, width: "100%", textAlign: "center" }}>
          <span style={{ fontFamily: UI(), fontWeight: 800, fontSize: 32, color: PG.dark, background: PG.butter, padding: "10px 24px", borderRadius: 999 }}>{items.length} pieces, real cutouts</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", bottom: 70, left: "50%", width: 120, height: 120, marginLeft: -60, borderRadius: 60, border: "8px solid #f2efe4", background: shown ? PG.tomatoDark : "transparent" }} />
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
    </AbsoluteFill>
  );
};

const AppHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ position: "absolute", top: 80, left: 44, right: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <PileGoLogo size={44} />
    <span style={{ fontFamily: UI(), fontWeight: 700, fontSize: 28, color: PG.muted }}>{title}</span>
  </div>
);

const ListScreen: React.FC<{ f: number; t0: number; items: PileItem[] }> = ({ f, t0, items }) => (
  <AbsoluteFill>
    <AppHeader title="Drafts" />
    {items.slice(0, 3).map((it, i) => {
      const a = t0 + i * 4;
      const p = backOut(invLerp(a, a + 8, f), 1.6);
      if (f < a) return null;
      const chars = Math.floor(clamp(invLerp(a + 3, a + 15, f)) * it.name.length);
      return (
        <div key={i} style={{ position: "absolute", left: 36, right: 36, top: 190 + i * 250, height: 220, borderRadius: 34, background: PG.card, border: `3px solid ${PG.line}`, display: "flex", alignItems: "center", gap: 20, padding: 18, transform: `translateY(${(1 - p) * 120}px)`, opacity: clamp(p * 1.4) }}>
          <div style={{ width: 170, height: 170, borderRadius: 24, background: PG.paper2, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <GarmentIcon kind={it.kind} color={it.color} size={150} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div style={{ fontFamily: UI(), fontWeight: 700, fontSize: 29, lineHeight: 1.18, color: PG.ink, height: 70, overflow: "hidden" }}>{it.name.slice(0, chars)}</div>
            <span style={{ alignSelf: "flex-start", fontFamily: UI(), fontWeight: 900, fontSize: 32, color: PG.ink, background: PG.butter, padding: "6px 18px", borderRadius: 999 }}>{it.price}</span>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);

const LiveScreen: React.FC<{ f: number; live: number; sold?: number; delist?: number; items: PileItem[]; platforms: string[]; soldOn: string; pile?: [number, number] }> = ({ f, live, sold, delist, items, platforms, soldOn, pile }) => {
  const lit = (i: number) => f >= live + 3 + i * 3;
  const nLit = platforms.filter((_, i) => lit(i)).length;
  const soldP = sold !== undefined ? backOut(invLerp(sold, sold + 8, f), 2.2) : 0;
  const del = delist !== undefined && f >= delist;
  const it = items[0];
  return (
    <AbsoluteFill>
      <AppHeader title={sold !== undefined ? "Sold" : "Live"} />
      <div style={{ position: "absolute", top: 190, left: 36, right: 36, height: 330, borderRadius: 34, background: PG.card, border: `3px solid ${PG.line}`, display: "flex", alignItems: "center", gap: 24, padding: 22 }}>
        <div style={{ width: 280, height: 280, borderRadius: 26, background: PG.paper2, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <GarmentIcon kind={it.kind} color={it.color} size={250} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: UI(), fontWeight: 700, fontSize: 28, lineHeight: 1.2, color: PG.ink }}>{it.name}</div>
          <span style={{ alignSelf: "flex-start", fontFamily: UI(), fontWeight: 900, fontSize: 34, color: PG.ink, background: PG.butter, padding: "6px 18px", borderRadius: 999 }}>{it.price}</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 556, width: "100%", textAlign: "center", fontFamily: UI(), fontWeight: 900, fontSize: del ? 42 : 52, color: PG.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        {del ? "Down everywhere else" : `Live on ${Math.max(1, nLit)}`}
      </div>
      <div style={{ position: "absolute", top: 646, left: 30, right: 30, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {platforms.map((p, i) => {
          const isSold = sold !== undefined && p === soldOn && f >= sold;
          const on = lit(i);
          const gone = del && !isSold;
          const bg = isSold ? PG.tomato : gone ? PG.paper2 : on ? PG.accent : PG.card;
          const fg = isSold || (on && !gone) ? "#fffdf6" : PG.muted;
          return (
            <span key={p} style={{ position: "relative", fontFamily: UI(), fontWeight: 800, fontSize: 27, color: fg, background: bg, border: `3px solid ${on || isSold ? "transparent" : PG.line}`, padding: "10px 20px", borderRadius: 999, transform: `scale(${on && f < live + 9 + i * 3 ? 1.08 : 1})`, textDecoration: gone ? "line-through" : "none" }}>
              {isSold ? `${p} · sold` : on && !gone ? `✓ ${p}` : p}
            </span>
          );
        })}
      </div>
      {sold !== undefined && soldP > 0 ? (
        <div style={{ position: "absolute", top: 862, left: 40, right: 40, borderRadius: 30, background: PG.dark, color: PG.darkInk, padding: "26px 30px", fontFamily: UI(), transform: `scale(${soldP})`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, fontSize: 40 }}>
            SOLD <span style={{ color: PG.darkGreen }}>{it.price}</span>
          </span>
          <span style={{ fontWeight: 700, fontSize: 28, color: PG.darkInk2 }}>{pile ? `pile ${pile[0]} → ${pile[1]}` : `on ${soldOn}`}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ notifications
export type Ping = { at: number; title: string; body: string; out?: number };
/** Lock-screen style notification from pileGo! (slides down from the top). */
export const SoldPing: React.FC<Ping & { y?: number; x?: number }> = ({ at, out, title, body, x = 520, y = 230 }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const t = backOut(invLerp(at, at + 9, f), 1.5);
  const o = out !== undefined ? 1 - easeIn(invLerp(out, out + 8, f)) : 1;
  return (
    <Pos x={x} y={y + (1 - t) * -260} scale={1}>
      <div style={{ width: 900, display: "flex", gap: 24, alignItems: "center", padding: "24px 30px", borderRadius: 40, background: "rgba(252,250,244,0.97)", boxShadow: "0 18px 50px rgba(0,0,0,0.35)", opacity: o }}>
        <div style={{ width: 92, height: 92, borderRadius: 24, background: PG.dark, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <PileGoMark size={70} dark />
        </div>
        <div style={{ flex: 1, minWidth: 0, fontFamily: UI() }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 27, fontWeight: 700, color: PG.muted }}>
            <span>pileGo!</span>
            <span>now</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: PG.ink, marginTop: 4 }}>{title}</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: PG.ink2, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{body}</div>
        </div>
      </div>
    </Pos>
  );
};

/** A run of sale notifications stacking down the screen (the payoff montage). */
export const SoldStack: React.FC<{ pings: Ping[]; y?: number; gap?: number }> = ({ pings, y = 230, gap = 175 }) => (
  <>
    {pings.map((p, i) => (
      <SoldPing key={i} {...p} y={y + i * gap} />
    ))}
  </>
);

// ------------------------------------------------------------------------------------------------ social devices
export type DM = { at: number; from: "them" | "me"; text: string };
/** A DM thread (lowballers, "is this still available?"): generic messenger look, typing dots before their lines. */
export const DMThread: React.FC<{ at: number; out?: number; x?: number; y?: number; handle: string; msgs: DM[]; width?: number }> = ({ at, out, x = 480, y = 640, handle, msgs, width = 800 }) => {
  const L = useLife(at, out, 8);
  const f = L.f;
  if (!L.visible || L.s <= 0) return null;
  const shown = msgs.filter((m) => f >= m.at);
  const next = msgs.find((m) => f < m.at && m.from === "them" && f >= m.at - 14);
  return (
    <Pos x={x} y={y} scale={L.s}>
      <div style={{ width, borderRadius: 44, background: "#fbfaf7", boxShadow: "0 24px 60px rgba(0,0,0,0.35)", padding: "26px 28px 30px", fontFamily: UI() }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 18, borderBottom: `3px solid ${PG.line}` }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: "#c9c4b6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 34, color: PG.ink }}>{handle.replace("@", "").slice(0, 1).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 34, color: PG.ink }}>{handle}</div>
            <div style={{ fontWeight: 600, fontSize: 24, color: PG.muted }}>Active now</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 20 }}>
          {shown.map((m, i) => {
            const p = backOut(invLerp(m.at, m.at + 6, f), 2);
            const me = m.from === "me";
            return (
              <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "78%", background: me ? PG.ink : "#e9e6dd", color: me ? PG.darkInk : PG.ink, fontWeight: 700, fontSize: 36, lineHeight: 1.2, padding: "16px 24px", borderRadius: 30, borderBottomRightRadius: me ? 8 : 30, borderBottomLeftRadius: me ? 30 : 8, transform: `scale(${p})`, transformOrigin: me ? "right bottom" : "left bottom" }}>
                {m.text}
              </div>
            );
          })}
          {next ? (
            <div style={{ alignSelf: "flex-start", background: "#e9e6dd", padding: "18px 24px", borderRadius: 30, display: "flex", gap: 10 }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 16, height: 16, borderRadius: 8, background: PG.muted, transform: `translateY(${-Math.max(0, Math.sin((f + d * 4) * 0.45)) * 8}px)` }} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Pos>
  );
};

/** "Replying to @user" comment sticker (reply-to-comment episodes). Generic card, top-left by default. */
export const CommentReply: React.FC<{ at: number; out?: number; x?: number; y?: number; user: string; text: string; width?: number }> = ({ at, out, x = 400, y = 380, user, text, width = 660 }) => {
  const L = useLife(at, out, 8);
  if (!L.visible || L.s <= 0) return null;
  return (
    <Pos x={x} y={y} scale={L.s} rot={-1.5}>
      <div style={{ width, borderRadius: 30, background: "#ffffff", boxShadow: "0 14px 40px rgba(0,0,0,0.3)", padding: "20px 26px 24px", fontFamily: UI(), display: "flex", gap: 18 }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: PG.lilac, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, color: PG.ink }}>{user.replace("@", "").slice(0, 1).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 25, color: PG.muted }}>Reply to {user}'s comment</div>
          <div style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.18, color: PG.ink, marginTop: 6 }}>{text}</div>
        </div>
      </div>
    </Pos>
  );
};

/** A marketplace listing tile (keyword-stuffed titles, lowball bait). `sold` stamps it; `gone` crosses it out. */
export const ListingCard: React.FC<{ at: number; out?: number; x: number; y: number; title: string; price: string; kind?: GarmentIconKind; color?: string; likes?: number; sold?: number; gone?: number; rot?: number; scale?: number }> = ({
  at,
  out,
  x,
  y,
  title,
  price,
  kind = "hoodie",
  color = "#2b2a31",
  likes = 12,
  sold,
  gone,
  rot = 0,
  scale = 1,
}) => {
  const L = useLife(at, out, 8);
  if (!L.visible || L.s <= 0) return null;
  const f = L.f;
  const st = sold !== undefined && f >= sold ? backOut(invLerp(sold, sold + 6, f), 2.4) : 0;
  const g = gone !== undefined && f >= gone ? clamp(invLerp(gone, gone + 6, f)) : 0;
  return (
    <Pos x={x} y={y} scale={L.s * scale} rot={rot}>
      <div style={{ position: "relative", width: 440, borderRadius: 30, background: PG.card, boxShadow: "0 16px 44px rgba(0,0,0,0.3)", padding: 16, fontFamily: UI(), opacity: 1 - g * 0.45 }}>
        <div style={{ height: 400, borderRadius: 22, background: PG.paper2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GarmentIcon kind={kind} color={color} size={330} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.16, color: PG.ink, marginTop: 14, height: 70, overflow: "hidden" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 40, color: PG.ink }}>{price}</span>
          <span style={{ fontWeight: 700, fontSize: 28, color: PG.muted }}>♡ {likes}</span>
        </div>
        {st > 0 ? (
          <div style={{ position: "absolute", left: 60, top: 150, transform: `rotate(-14deg) scale(${st})`, border: `10px solid ${PG.tomato}`, color: PG.tomato, fontWeight: 900, fontSize: 96, padding: "4px 30px", borderRadius: 18, background: "rgba(255,253,246,0.85)" }}>SOLD</div>
        ) : null}
        {g > 0 ? <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 10, background: PG.ink, transform: `scaleX(${g}) rotate(-8deg)`, borderRadius: 5 }} /> : null}
      </div>
    </Pos>
  );
};

// ------------------------------------------------------------------------------------------------ the relist snap
/** Tiff's repeatable bit (every episode, ~1 s): viewfinder corners close on the pile, a shutter flash, then a deadpan
 *  lowercase "listed." stamp. Cue the same sounds every time: `shutter` on the snap word, `ding` on "listed". */
export const RelistSnap: React.FC<{ at: number; out?: number; x?: number; y?: number; w?: number; h?: number; label?: string; stampAt?: number }> = ({ at, out, x = 540, y = 760, w = 720, h = 620, label = "listed.", stampAt }) => {
  const f = useLocalFrame();
  if (f < at || (out !== undefined && f > out + 6)) return null;
  const close = easeOut(invLerp(at, at + 6, f));
  const flash = f >= at + 6 ? 1 - clamp(invLerp(at + 6, at + 11, f)) : 0;
  const sAt = stampAt ?? at + 10;
  const st = f >= sAt ? backOut(invLerp(sAt, sAt + 7, f), 2.4) : 0;
  const o = out !== undefined && f >= out ? 1 - clamp(invLerp(out, out + 6, f)) : 1;
  const k = 1.25 - 0.25 * close;
  const L = 90;
  const corner = (sx: number, sy: number) => (
    <div style={{ position: "absolute", left: sx < 0 ? 0 : undefined, right: sx > 0 ? 0 : undefined, top: sy < 0 ? 0 : undefined, bottom: sy > 0 ? 0 : undefined, width: L, height: L, borderLeft: sx < 0 ? "10px solid #fffdf6" : undefined, borderRight: sx > 0 ? "10px solid #fffdf6" : undefined, borderTop: sy < 0 ? "10px solid #fffdf6" : undefined, borderBottom: sy > 0 ? "10px solid #fffdf6" : undefined, borderRadius: 14 }} />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <Pos x={x} y={y} scale={k}>
        <div style={{ position: "relative", width: w, height: h, opacity: close }}>
          {corner(-1, -1)}
          {corner(1, -1)}
          {corner(-1, 1)}
          {corner(1, 1)}
        </div>
      </Pos>
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash * 0.85 }} /> : null}
      {st > 0 ? (
        <Pos x={x} y={y + h * 0.18} scale={st} rot={-6}>
          <div style={{ fontFamily: WORD(), fontStyle: "italic", fontWeight: 900, fontSize: 150, letterSpacing: "-0.05em", color: PG.darkInk, background: PG.dark, padding: "6px 44px 16px", borderRadius: 28, boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
            {label}
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ end card
/** Full-frame brand end card (about 1.2-1.6 s, after the story's last laugh). */
export const EndCard: React.FC<{ at: number; dark?: boolean; url?: string; sub?: string }> = ({ at, dark = true, url = "pilego.app", sub = "free and open source" }) => {
  const f = useLocalFrame();
  if (f < at) return null;
  const bg = clamp(invLerp(at, at + 5, f));
  const logo = backOut(invLerp(at + 2, at + 11, f), 2);
  const t1 = easeOut(invLerp(at + 6, at + 14, f));
  const t2 = easeOut(invLerp(at + 9, at + 17, f));
  const t3 = easeOut(invLerp(at + 13, at + 21, f));
  const ink = dark ? PG.darkInk : PG.ink;
  const green = dark ? PG.darkGreen : PG.accent;
  return (
    <AbsoluteFill style={{ background: dark ? PG.dark : PG.paper, opacity: bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${logo}) translateY(-120px)` }}>
        <PileGoLogo size={150} dark={dark} />
      </div>
      <div style={{ position: "absolute", top: 930, width: "100%", textAlign: "center", fontFamily: font("Libre Franklin"), fontWeight: 800, fontSize: 84, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
        <div style={{ color: ink, opacity: t1, transform: `translateY(${(1 - t1) * 40}px)` }}>Clear the pile.</div>
        <div style={{ color: green, fontStyle: "italic", fontFamily: WORD(), opacity: t2, transform: `translateY(${(1 - t2) * 40}px)` }}>Keep the cash.</div>
      </div>
      <div style={{ position: "absolute", top: 1180, width: "100%", textAlign: "center", fontFamily: font("Libre Franklin"), opacity: t3 }}>
        <div style={{ fontWeight: 800, fontSize: 50, color: ink }}>{url}</div>
        <div style={{ fontWeight: 600, fontSize: 32, color: dark ? PG.darkInk2 : PG.muted, marginTop: 8 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};
