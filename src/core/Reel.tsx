// <Reel>: lays the shots of a timeline out in time, joins them with motivated transitions (zero hard cuts by default),
// and puts captions, global overlays and the mixed soundtrack on top.
//
//   export const Video = (p: { variant?: number }) => (
//     <Reel timeline={timeline} scenes={{ s01: Hook, s02: Recruiters, s03: Vault }} variant={p.variant} />
//   );
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ShotProvider, TimelineProvider } from "./timeline";
import { Captions } from "./captions";
import { clamp, easeInOut, easeOut, invLerp, smootherstep } from "./anim";
import type { CaptionStyle, Timeline, TransitionKind, TShot } from "./types";

export type SceneComponent = React.FC<{ variant?: number }>;
export type Scenes = Record<string, SceneComponent>;

const DUR: Record<TransitionKind, number> = {
  cut: 0,
  dissolve: 8,
  whip: 8,
  "whip-left": 8,
  "whip-right": 8,
  "whip-up": 8,
  "whip-down": 8,
  push: 10,
  "zoom-out": 10,
  flash: 4,
  dip: 12,
  iris: 12,
  "slide-up": 9,
};
const kindOf = (t: string | null): TransitionKind => {
  if (!t) return "cut";
  if (t === "whip") return "whip-left";
  return (t in DUR ? t : "dissolve") as TransitionKind;
};

type Look = { opacity: number; transform: string; filterPx: number; dir: "h" | "v"; clip?: string };
const NONE: Look = { opacity: 1, transform: "none", filterPx: 0, dir: "h" };

/** How a shot looks while it enters (`incoming`) or leaves (`outgoing`) at a seam `kind`, u in [0,1] across the seam. */
function seamLook(kind: TransitionKind, u: number, incoming: boolean, W: number, H: number): Look {
  const e = easeInOut(u);
  const speed = Math.sin(Math.PI * clamp(u)); // 0 at the ends, 1 mid-whip: drives motion blur
  switch (kind) {
    case "dissolve":
      return incoming ? { ...NONE, opacity: smootherstep(u) } : NONE;
    case "whip-left":
    case "whip-right": {
      const sgn = kind === "whip-left" ? -1 : 1;
      const x = incoming ? (1 - e) * -sgn * W : e * sgn * W;
      return { opacity: 1, transform: `translateX(${x}px)`, filterPx: 55 * speed, dir: "h" };
    }
    case "whip-up":
    case "whip-down":
    case "slide-up": {
      const sgn = kind === "whip-down" ? 1 : -1;
      const y = incoming ? (1 - e) * -sgn * H : e * sgn * H;
      return { opacity: 1, transform: `translateY(${y}px)`, filterPx: kind === "slide-up" ? 14 * speed : 60 * speed, dir: "v" };
    }
    case "push":
      return incoming
        ? { opacity: smootherstep(invLerp(0.3, 0.75, u)), transform: `scale(${0.86 + 0.14 * easeOut(u)})`, filterPx: 0, dir: "h" }
        : { opacity: 1 - smootherstep(invLerp(0.35, 0.8, u)), transform: `scale(${1 + 0.45 * easeInOut(u)})`, filterPx: 0, dir: "h" };
    case "zoom-out":
      return incoming
        ? { opacity: smootherstep(invLerp(0.3, 0.75, u)), transform: `scale(${1.3 - 0.3 * easeOut(u)})`, filterPx: 0, dir: "h" }
        : { opacity: 1 - smootherstep(invLerp(0.35, 0.8, u)), transform: `scale(${1 - 0.18 * easeInOut(u)})`, filterPx: 0, dir: "h" };
    case "iris": {
      if (!incoming) return NONE;
      const r = Math.hypot(W, H) * 0.6 * easeInOut(u);
      return { ...NONE, clip: `circle(${r}px at 50% 46%)` };
    }
    default:
      return NONE; // cut, flash, dip: hard switch at the seam (flash/dip draw an overlay)
  }
}

const ShotLayer: React.FC<{
  shot: TShot;
  next: TShot | null;
  Comp: SceneComponent;
  variant?: number;
  W: number;
  H: number;
}> = ({ shot, next, Comp, variant, W, H }) => {
  const f = useCurrentFrame(); // absolute (this component sits outside the Sequence)
  const kin = kindOf(shot.transitionIn);
  const kout = next ? kindOf(next.transitionIn) : "cut";
  const hin = Math.ceil(DUR[kin] / 2);
  const hout = Math.ceil(DUR[kout] / 2);
  const hardIn = kin === "cut" || kin === "flash" || kin === "dip";
  const hardOut = kout === "cut" || kout === "flash" || kout === "dip";
  const from = shot.s - (hardIn ? 0 : hin);
  const to = (next ? next.s : shot.e) + (hardOut ? 0 : hout);
  let look = NONE;
  if (!hardIn && f < shot.s + hin) look = seamLook(kin, invLerp(shot.s - hin, shot.s + hin, f), true, W, H);
  if (next && !hardOut && f >= next.s - hout) {
    const out = seamLook(kout, invLerp(next.s - hout, next.s + hout, f), false, W, H);
    look = { ...out, opacity: out.opacity * look.opacity };
  }
  const blurId = `seam-${shot.id}`;
  const blur = look.filterPx > 0.5;
  return (
    <Sequence from={from} durationInFrames={Math.max(1, to - from)} layout="none" name={`shot ${shot.id}`}>
      {blur ? (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <filter id={blurId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={look.dir === "h" ? `${look.filterPx} 0` : `0 ${look.filterPx}`} />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          opacity: look.opacity,
          transform: look.transform,
          filter: blur ? `url(#${blurId})` : undefined,
          clipPath: look.clip,
          overflow: "hidden",
        }}
      >
        <ShotProvider shot={shot} offset={shot.s - from}>
          <Comp variant={variant} />
        </ShotProvider>
      </AbsoluteFill>
    </Sequence>
  );
};

const SeamOverlays: React.FC<{ shots: TShot[] }> = ({ shots }) => {
  const f = useCurrentFrame();
  let white = 0;
  let black = 0;
  for (const s of shots) {
    const k = kindOf(s.transitionIn);
    if (k === "flash" && f >= s.s && f < s.s + 4) white = Math.max(white, [1, 0.75, 0.45, 0.2][f - s.s]);
    if (k === "dip") {
      const h = DUR.dip / 2;
      if (f >= s.s - h && f < s.s + h) black = Math.max(black, 1 - Math.abs(f - s.s) / h);
    }
  }
  return (
    <>
      {white > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: white }} /> : null}
      {black > 0 ? <AbsoluteFill style={{ background: "#000000", opacity: black }} /> : null}
    </>
  );
};

/** Debug overlay of the cross-platform safe box (x 65-888, y 288-1248) and the TikTok right rail. */
export const SafeZones: React.FC = () => {
  const { width: W, height: H } = useVideoConfig();
  const k = W / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 65 * k, top: 288 * (H / 1920), width: (888 - 65) * k, height: (1248 - 288) * (H / 1920), border: "4px dashed rgba(0,255,140,.85)" }} />
      <div style={{ position: "absolute", right: 0, top: 840 * (H / 1920), width: 180 * k, bottom: 0, background: "rgba(255,0,80,.18)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 480 * (H / 1920), background: "rgba(255,0,80,.12)" }} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{
  timeline: Timeline;
  scenes: Scenes;
  variant?: number;
  background?: string;
  overlay?: React.ReactNode;
  captions?: CaptionStyle;
  safeGuide?: boolean;
  muted?: boolean;
}> = ({ timeline, scenes, variant, background = "#101014", overlay, captions, safeGuide, muted }) => {
  const { width: W, height: H } = useVideoConfig();
  const missing = timeline.shots.filter((s) => !scenes[s.id]).map((s) => s.id);
  if (missing.length) throw new Error(`<Reel>: no scene component for shot(s) ${missing.join(", ")}`);
  const audio = timeline.audio.hasMix ? timeline.audio.mix : timeline.audio.voice;
  return (
    <TimelineProvider value={timeline}>
      <AbsoluteFill style={{ background }}>
        {timeline.shots.map((s, k) => (
          <ShotLayer
            key={s.id}
            shot={s}
            next={timeline.shots[k + 1] ?? null}
            Comp={scenes[s.id]}
            variant={k === 0 ? variant : undefined}
            W={W}
            H={H}
          />
        ))}
        <SeamOverlays shots={timeline.shots} />
        {overlay}
        <Captions override={captions} />
        {safeGuide ? <SafeZones /> : null}
        {!muted && audio ? <Audio src={staticFile(audio)} /> : null}
      </AbsoluteFill>
    </TimelineProvider>
  );
};
