// Timeline context and the word-sync API every scene uses.
//
//   const s = useShot();
//   const hit = s.hit("billion");          // 2 frames before "billion" is spoken (reactions land 0-3 f early)
//   const scale = s.pop("cost");           // pop-in curve keyed to a word
//   const t = s.p(s.at("months"), s.end("engineers")); // 0..1 across a phrase
//
// Word lookups are scoped to the shot's own beats and THROW with the list of available words when a word is
// missing, so a typo in a scene fails the still render loudly instead of silently animating at frame 0.
import React, { createContext, useContext, useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { TBeat, TShot, TWord, Timeline } from "./types";
import { invLerp, popScale, smootherstep, springAt } from "./anim";
import type { SpringConfig } from "remotion";

const TimelineCtx = createContext<Timeline | null>(null);
export const TimelineProvider: React.FC<{ value: Timeline; children: React.ReactNode }> = ({ value, children }) => (
  <TimelineCtx.Provider value={value}>{children}</TimelineCtx.Provider>
);
export const useTimeline = () => {
  const t = useContext(TimelineCtx);
  if (!t) throw new Error("useTimeline() must be used inside <Reel>");
  return t;
};

type ShotState = { shot: TShot; offset: number };
const ShotCtx = createContext<ShotState | null>(null);
export const ShotProvider: React.FC<{ shot: TShot; offset: number; children: React.ReactNode }> = ({ shot, offset, children }) => {
  const v = useMemo(() => ({ shot, offset }), [shot, offset]);
  return <ShotCtx.Provider value={v}>{children}</ShotCtx.Provider>;
};

export const normWord = (w: string) => w.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "");

export type ShotApi = {
  /** local frame: 0 = the first frame of this shot (negative during the incoming transition) */
  f: number;
  /** absolute frame in the whole video */
  abs: number;
  /** shot length in frames */
  dur: number;
  fps: number;
  shot: TShot;
  beats: TBeat[];
  words: TWord[];
  /** local frame where `phrase` starts being spoken (nth occurrence inside this shot) */
  at: (phrase: string, nth?: number) => number;
  /** local frame where `phrase` has finished */
  end: (phrase: string, nth?: number) => number;
  /** reaction frame: 2 frames before the phrase (visual beats land 0-3 frames before their word) */
  hit: (phrase: string, nth?: number) => number;
  has: (phrase: string) => boolean;
  /** local frames of a beat of this shot, by id or index */
  beat: (idOrIndex: string | number) => { s: number; e: number; speechEnd: number };
  /** 0..1 between two local frames (smootherstep by default) */
  p: (a: number, b: number, ease?: (t: number) => number) => number;
  spring: (a: number, cfg?: Partial<SpringConfig>) => number;
  pop: (phraseOrFrame: string | number, dur?: number) => number;
  /** words of this shot that are being spoken at the current frame (for lip flap) */
  speaking: (beatIds?: string[]) => { s: number; e: number }[];
};

function findPhrase(words: TWord[], phrase: string, nth: number): [TWord, TWord] | null {
  const toks = phrase.split(/\s+/).map(normWord).filter(Boolean);
  if (!toks.length) return null;
  let count = 0;
  for (let i = 0; i + toks.length <= words.length; i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) {
      const w = normWord(words[i + k].text);
      if (w !== toks[k] && !(k === toks.length - 1 && w.startsWith(toks[k]) && toks[k].length >= 3)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      count++;
      if (count === nth) return [words[i], words[i + toks.length - 1]];
    }
  }
  return null;
}

export function useShot(): ShotApi {
  const tl = useTimeline();
  const st = useContext(ShotCtx);
  if (!st) throw new Error("useShot() must be used inside a shot rendered by <Reel>");
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame() - st.offset;
  const { shot } = st;
  return useMemo(() => {
    const beats = tl.beats.filter((b) => shot.beats.includes(b.id));
    const words = tl.words.filter((w) => shot.beats.includes(w.beat));
    const L = (abs: number) => abs - shot.s;
    const need = (phrase: string, nth = 1) => {
      const r = findPhrase(words, phrase, nth);
      if (!r)
        throw new Error(
          `[shot ${shot.id}] "${phrase}"${nth > 1 ? ` (#${nth})` : ""} is not spoken in this shot. Words: ${words.map((w) => w.text).join(" ")}`,
        );
      return r;
    };
    const api: Omit<ShotApi, "f" | "abs"> = {
      dur: shot.e - shot.s,
      fps,
      shot,
      beats,
      words,
      at: (p, n = 1) => L(need(p, n)[0].s),
      end: (p, n = 1) => L(need(p, n)[1].e),
      hit: (p, n = 1) => L(need(p, n)[0].s) - 2,
      has: (p) => findPhrase(words, p, 1) !== null,
      beat: (k) => {
        const b = typeof k === "number" ? beats[k] : beats.find((x) => x.id === k);
        if (!b) throw new Error(`[shot ${shot.id}] no beat ${k}; beats: ${beats.map((x) => x.id).join(", ")}`);
        return { s: L(b.s), e: L(b.e), speechEnd: L(b.speechEnd) };
      },
      p: (a, b, ease = smootherstep) => ease(invLerp(a, b, frame)),
      spring: (a, cfg) => springAt(frame, a, fps, cfg),
      pop: (x, dur = 9) => popScale(frame, typeof x === "number" ? x : L(need(x)[0].s) - 2, dur),
      speaking: (ids) =>
        words.filter((w) => !ids || ids.includes(w.beat)).map((w) => ({ s: L(w.s), e: L(w.e) })),
    };
    return { ...api, f: frame, abs: frame + shot.s } as ShotApi;
  }, [tl, shot, frame, fps]);
}

/** Shot-local frame inside a shot (0 = shot start), otherwise the composition frame. Safe anywhere. */
export function useLocalFrame(): number {
  const st = useContext(ShotCtx);
  const f = useCurrentFrame();
  return st ? f - st.offset : f;
}

/** Current caption-free helpers outside a shot (overlays): absolute frame + word lookups across the whole video. */
export function useGlobalWords() {
  const tl = useTimeline();
  const frame = useCurrentFrame();
  return {
    frame,
    at: (phrase: string, nth = 1) => {
      const r = findPhrase(tl.words, phrase, nth);
      if (!r) throw new Error(`"${phrase}" is not spoken anywhere in this video`);
      return r[0].s;
    },
  };
}
