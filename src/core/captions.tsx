// Word-synced captions. Text always comes from the script (never speech-to-text), timing from forced alignment.
// Measured viral spec: 1-3 words (story) / 2-4 (explainer), Montserrat ExtraBold-Black, white, outline ~1/7 of the size,
// one keyword coloured or boxed, hard swap + 1-2 frame pop, centred in the cross-platform safe box (y 288-1248).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { continueRender, delayRender } from "remotion";
import { useTimeline } from "./timeline";
import { font } from "./fonts";
import { backOut, invLerp } from "./anim";
import type { CaptionStyle, TWord } from "./types";

type Preset = {
  font: string;
  weight: number;
  size: number;
  minSize: number;
  maxWidth: number;
  y: number;
  color: string;
  stroke: number; // px of visible outline
  strokeColor: string;
  shadow: "soft" | "hard" | "none";
  keywordColor: string;
  keywordBox: string | null;
  keywordText: string;
  uppercase: boolean;
  mode: "single" | "phrase";
  activeColor: string | null;
  letterSpacing: number;
  stripPunct: boolean;
};

const BASE: Preset = {
  font: "Montserrat",
  weight: 900,
  size: 100,
  minSize: 60,
  maxWidth: 880,
  y: 0.635,
  color: "#FFFFFF",
  stroke: 12,
  strokeColor: "#0B0A0C",
  shadow: "soft",
  keywordColor: "#FFD43B",
  keywordBox: null,
  keywordText: "#141414",
  uppercase: false,
  mode: "single",
  activeColor: null,
  letterSpacing: 0,
  stripPunct: true,
};

export const CAPTION_PRESETS: Record<string, Preset> = {
  // the 2D-in-3D story look: one word at a time, white, dark outline, lower-middle
  "bold-pop": BASE,
  // MotionLab's "word by word, one keyword boxed"
  boxed: { ...BASE, keywordBox: "#FFD43B", keywordText: "#121212" },
  // phrase captions with the spoken word lighting up (explainers / talking formats)
  karaoke: { ...BASE, weight: 800, size: 84, minSize: 56, mode: "phrase", activeColor: "#FFD43B", stroke: 10 },
  // voxel style: pixel font, hard drop shadow, no outline
  pixel: { ...BASE, font: "Pixelify Sans", weight: 700, size: 96, stroke: 0, shadow: "hard", keywordColor: "#FFE14D", letterSpacing: 2 },
  // flat-vector science look: clean geometric sans, soft shadow, phrase chunks
  clean: { ...BASE, font: "Inter", weight: 800, size: 80, minSize: 54, mode: "phrase", stroke: 0, shadow: "soft", keywordColor: "#FFD166" },
  // comic / cartoon look
  comic: { ...BASE, font: "Bangers", weight: 400, size: 112, stroke: 10, letterSpacing: 2, uppercase: true, keywordColor: "#FFDD00" },
  // hand-drawn / doodle look
  marker: { ...BASE, font: "Permanent Marker", weight: 400, size: 92, stroke: 9, keywordColor: "#FF5A5F" },
  // documentary / history look
  serif: { ...BASE, font: "DM Serif Display", weight: 400, size: 92, stroke: 8, keywordColor: "#F4C95D" },
  none: { ...BASE },
};

// ---- font-safe text measurement (never measure with a fallback font: that cached wrong widths before)
const ready = new Set<string>();
/** Real hook: holds the frame (delayRender) until the font is loaded, then re-renders with it. */
function useFontReady(fam: string, weight: number) {
  const key = `${weight} ${fam}`;
  const [ok, setOk] = useState(() => ready.has(key));
  const [handle] = useState(() => (ready.has(key) ? null : delayRender(`caption font ${key}`)));
  useEffect(() => {
    if (ok) return;
    let alive = true;
    const done = () => {
      ready.add(key);
      if (alive) setOk(true);
      if (handle !== null) continueRender(handle);
    };
    document.fonts.load(`${weight} 100px "${fam}"`).then(() => document.fonts.ready).then(done, done);
    return () => {
      alive = false;
    };
  }, [ok, key, fam, weight, handle]);
  return ok;
}
let mctx: CanvasRenderingContext2D | null = null;
function measureText({ text, fontFamily, fontSize, fontWeight, letterSpacing }: { text: string; fontFamily: string; fontSize: number; fontWeight: string; letterSpacing: string }) {
  if (!mctx) mctx = document.createElement("canvas").getContext("2d");
  const g = mctx as CanvasRenderingContext2D;
  g.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  const ls = parseFloat(letterSpacing) || 0;
  return { width: g.measureText(text).width + ls * Math.max(0, text.length - 1) };
}
const spaceWidth = (fam: string, size: number, weight: number) => {
  const a = measureText({ text: "a a", fontFamily: fam, fontSize: size, fontWeight: String(weight), letterSpacing: "0px" }).width;
  const b = measureText({ text: "aa", fontFamily: fam, fontSize: size, fontWeight: String(weight), letterSpacing: "0px" }).width;
  return Math.max(size * 0.22, a - b);
};

const strip = (t: string) => t.replace(/[.,;:]+$/g, "").replace(/^["“(]+|["”)]+$/g, "");

type Placed = { w: TWord; text: string; x: number; width: number; line: number };

function layout(words: TWord[], p: Preset, fam: string, size: number) {
  const space = spaceWidth(fam, size, p.weight) * 1.08;
  const items = words.map((w) => {
    let text = p.stripPunct ? strip(w.text) : w.text;
    if (p.uppercase) text = text.toUpperCase();
    const width = measureText({ text, fontFamily: fam, fontSize: size, fontWeight: String(p.weight), letterSpacing: `${p.letterSpacing}px` }).width;
    return { w, text, width };
  });
  const pad = (x: { w: TWord }) => (x.w.emph && p.keywordBox ? size * 0.36 : 0);
  // greedy wrap into at most 2 balanced lines
  const total = items.reduce((a, x) => a + x.width + pad(x), 0) + space * Math.max(0, items.length - 1);
  let lines: (typeof items)[] = [items];
  if (total > p.maxWidth && items.length > 1) {
    let best = 1;
    let bestDiff = Infinity;
    for (let k = 1; k < items.length; k++) {
      const a = items.slice(0, k).reduce((s, x) => s + x.width + pad(x), 0) + space * (k - 1);
      const b = items.slice(k).reduce((s, x) => s + x.width + pad(x), 0) + space * (items.length - k - 1);
      const d = Math.max(a, b);
      if (d < bestDiff) {
        bestDiff = d;
        best = k;
      }
    }
    lines = [items.slice(0, best), items.slice(best)];
  }
  const placed: Placed[] = [];
  let widest = 0;
  lines.forEach((ln, li) => {
    const lw = ln.reduce((s, x) => s + x.width + pad(x), 0) + space * Math.max(0, ln.length - 1);
    widest = Math.max(widest, lw);
    let x = -lw / 2;
    for (const it of ln) {
      const pd = pad(it);
      placed.push({ w: it.w, text: it.text, x: x + pd / 2, width: it.width, line: li });
      x += it.width + pd + space;
    }
  });
  return { placed, widest, lines: lines.length };
}

export const Captions: React.FC<{ override?: CaptionStyle }> = ({ override }) => {
  const tl = useTimeline();
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cs = { ...tl.captionStyle, ...(override ?? {}) };
  const hidden = cs.hidden || cs.preset === "none";
  const base = CAPTION_PRESETS[cs.preset ?? "bold-pop"] ?? BASE;
  const p: Preset = {
    ...base,
    ...(cs.font ? { font: cs.font } : {}),
    ...(cs.size ? { size: cs.size } : {}),
    ...(cs.y ? { y: cs.y } : {}),
    ...(cs.color ? { color: cs.color } : {}),
    ...(cs.keywordColor ? { keywordColor: cs.keywordColor } : {}),
    ...(cs.keywordBox !== undefined ? { keywordBox: cs.keywordBox } : {}),
    ...(cs.keywordText ? { keywordText: cs.keywordText } : {}),
    ...(cs.stroke !== undefined ? { stroke: cs.stroke } : {}),
    ...(cs.uppercase !== undefined ? { uppercase: cs.uppercase } : {}),
    ...(cs.mode ? { mode: cs.mode } : {}),
  };
  const fontOk = useFontReady(font(p.font), p.weight);
  const cap = tl.captions.find((c) => f >= c.s && f < c.e);
  if (hidden || !cap || !fontOk) return null;
  const fam = font(p.font);
  const words = cap.words.map((i) => tl.words[i]).filter(Boolean);
  const k = W / 1080;
  // size: estimate the width from the font's average glyph width (the real layout is the browser's own)
  const AVG: Record<string, number> = { Montserrat: 0.68, Inter: 0.6, Poppins: 0.68, "Pixelify Sans": 0.62, Bangers: 0.5, "Permanent Marker": 0.64, "DM Serif Display": 0.5, Anton: 0.46, "Luckiest Guy": 0.62, "Lilita One": 0.55, Fredoka: 0.58, Nunito: 0.6, "Baloo 2": 0.58 };
  const avg = AVG[p.font] ?? 0.62;
  const texts = words.map((w) => {
    let t = p.stripPunct ? strip(w.text) : w.text;
    if (p.uppercase) t = t.toUpperCase();
    return t;
  });
  const est = (sz: number) => texts.reduce((a, t) => a + t.length * avg * sz, 0) + Math.max(0, texts.length - 1) * 0.3 * sz + (words.some((w) => w.emph) && p.keywordBox ? 0.4 * sz : 0);
  let size = p.size * k;
  const maxW = p.maxWidth * k;
  if (p.mode === "single") while (est(size) * 1.06 > maxW && size > p.minSize * k) size *= 0.95;
  else while (est(size) * 1.06 > maxW * 1.9 && size > p.minSize * k) size *= 0.95;
  const lf = f - cap.s;
  const sc = 0.84 + 0.16 * backOut(invLerp(0, 4, lf), 2.0);
  const strokePx = p.stroke * k * (size / (p.size * k));
  const shadow =
    p.shadow === "soft" ? `0 ${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.45)` : p.shadow === "hard" ? `${size * 0.07}px ${size * 0.07}px 0 rgba(20,20,20,0.95)` : "none";
  // group consecutive starred words into one boxed run
  type Run = { boxed: boolean; idx: number[] };
  const runs: Run[] = [];
  words.forEach((w, i) => {
    const boxed = !!(w.emph && p.keywordBox);
    const last = runs[runs.length - 1];
    if (boxed && last && last.boxed) last.idx.push(i);
    else runs.push({ boxed, idx: [i] });
  });
  const wordStyle = (i: number): React.CSSProperties => {
    const w = words[i];
    const nextStart = words[i + 1]?.s ?? cap.e;
    const active = p.mode === "phrase" && p.activeColor && f >= w.s && f < nextStart;
    const spoken = p.mode !== "phrase" || f >= w.s - 1;
    return {
      color: w.emph && !p.keywordBox ? p.keywordColor : active ? (p.activeColor as string) : p.color,
      opacity: spoken ? 1 : 0.55,
    };
  };
  const stroked: React.CSSProperties =
    p.stroke > 0 ? { WebkitTextStroke: `${strokePx * 2}px ${p.strokeColor}`, paintOrder: "stroke fill" } : {};
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: (W - maxW) / 2,
          width: maxW,
          top: p.y * H,
          transform: `translateY(-50%) scale(${sc})`,
          transformOrigin: "50% 50%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: `${size * 0.26}px`,
          rowGap: `${size * 0.04}px`,
          fontFamily: fam,
          fontWeight: p.weight,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: p.letterSpacing,
          textAlign: "center",
          whiteSpace: p.mode === "single" ? "nowrap" : "normal",
          filter: shadow === "none" ? undefined : `drop-shadow(${shadow})`,
        }}
      >
        {runs.map((r, ri) =>
          r.boxed ? (
            <span
              key={`${cap.s}-r${ri}`}
              style={{
                display: "inline-block",
                background: p.keywordBox as string,
                color: p.keywordText,
                padding: `${size * 0.02}px ${size * 0.18}px ${size * 0.06}px`,
                borderRadius: size * 0.16,
                border: `${Math.max(3, strokePx * 0.6)}px solid ${p.strokeColor}`,
                transform: "rotate(-2deg)",
                whiteSpace: "nowrap",
              }}
            >
              {r.idx.map((i) => texts[i]).join(" ")}
            </span>
          ) : (
            r.idx.map((i) => (
              <span key={`${cap.s}-${i}`} style={{ ...stroked, ...wordStyle(i), display: "inline-block", whiteSpace: "nowrap" }}>
                {texts[i]}
              </span>
            ))
          ),
        )}
      </div>
    </AbsoluteFill>
  );
};
