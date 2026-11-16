// Screen-space phone UI for the Tiff reels: a social post card and a chat thread. Coordinates are px at 1080x1920;
// everything pops on its frame like the fx2d elements (see src/core/fx2d.tsx). Keep these out of the caption band
// (y 1100-1350).
import React from "react";
import { useVideoConfig } from "remotion";
import { useLocalFrame } from "../../core/timeline";
import { backOut, easeIn, invLerp } from "../../core/anim";
import { font } from "../../core/fonts";

function life(f: number, at: number, out?: number) {
  if (f < at) return 0;
  const sIn = backOut(invLerp(at, at + 8, f), 2.0);
  const sOut = out !== undefined && f >= out ? 1 - easeIn(invLerp(out, out + 6, f)) : 1;
  return Math.max(0, sIn * sOut);
}

const Place: React.FC<{ x: number; y: number; s: number; rot?: number; children: React.ReactNode }> = ({ x, y, s, rot = 0, children }) => {
  const { width } = useVideoConfig();
  const k = width / 1080;
  return (
    <div style={{ position: "absolute", left: x * k, top: y * k, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s * k})`, transformOrigin: "center" }}>{children}</div>
  );
};

/** A story/post card: handle row, a picture (a shoulder in a dress of `tint`, with an optional burn mark), caption. */
export const PhonePost: React.FC<{
  at: number;
  out?: number;
  x: number;
  y: number;
  handle: string;
  caption?: string;
  captionAt?: number;
  tint?: string;
  burnAt?: number;
  rot?: number;
  w?: number;
}> = ({ at, out, x, y, handle, caption, captionAt, tint = "#3f8f5a", burnAt, rot = 0, w = 560 }) => {
  const f = useLocalFrame();
  const s = life(f, at, out);
  if (s <= 0) return null;
  const h = w * 1.25;
  const burn = burnAt !== undefined && f >= burnAt ? backOut(invLerp(burnAt, burnAt + 8, f), 2.4) : 0;
  const capS = caption && (captionAt === undefined || f >= captionAt) ? backOut(invLerp(captionAt ?? at, (captionAt ?? at) + 8, f), 2) : 0;
  return (
    <Place x={x} y={y} s={s} rot={rot}>
      <div style={{ width: w, background: "#ffffff", borderRadius: 38, border: "6px solid #141414", boxShadow: "0 16px 0 rgba(0,0,0,0.25)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", fontFamily: font("Montserrat"), fontWeight: 900, fontSize: 34, color: "#141414" }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)", border: "4px solid #fff", outline: "3px solid #dd2a7b" }} />
          {handle}
        </div>
        <div style={{ position: "relative", height: h * 0.62, background: "linear-gradient(180deg,#f6d9c6,#e9b99c)", overflow: "hidden" }}>
          {/* shoulder + upper arm, skin */}
          <div style={{ position: "absolute", left: w * 0.18, top: h * 0.12, width: w * 0.9, height: h * 0.9, borderRadius: "48% 40% 0 0", background: "#f8dcc8", border: "5px solid #2a1c1a" }} />
          {/* dress strap + bodice */}
          <div style={{ position: "absolute", left: w * 0.42, top: h * 0.1, width: w * 0.09, height: h * 0.3, background: tint, border: "5px solid #2a1c1a", borderRadius: 10, transform: "rotate(12deg)" }} />
          <div style={{ position: "absolute", left: w * 0.24, top: h * 0.36, width: w * 0.9, height: h * 0.4, background: tint, border: "5px solid #2a1c1a", borderRadius: "30% 20% 0 0" }} />
          {burn > 0 ? (
            <div style={{ position: "absolute", left: w * 0.5, top: h * 0.46, width: 34, height: 34, borderRadius: 17, background: "#3a2414", transform: `scale(${burn})` }}>
              <div style={{ position: "absolute", left: -26, top: -26, width: 86, height: 86, borderRadius: 43, border: "7px solid #ffd43b", boxShadow: "0 0 24px #ffd43b" }} />
            </div>
          ) : null}
          <div style={{ position: "absolute", right: 22, bottom: 18, fontFamily: font("Montserrat"), fontWeight: 900, fontSize: 30, color: "#ffffff", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}>♡ 2,481</div>
        </div>
        {capS > 0 ? (
          <div style={{ padding: "18px 26px 24px", fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 32, color: "#141414", transform: `scale(${capS})`, transformOrigin: "left center" }}>
            <b>{handle}</b> {caption}
          </div>
        ) : (
          <div style={{ height: 30 }} />
        )}
      </div>
    </Place>
  );
};

export type Msg = { at: number; text: string; me?: boolean };

/** A chat thread on a phone: bubbles pop in on their own frames (me = right, lilac; them = left, grey). */
export const ChatThread: React.FC<{ at: number; out?: number; x: number; y: number; title: string; msgs: Msg[]; w?: number; rot?: number }> = ({ at, out, x, y, title, msgs, w = 600, rot = 0 }) => {
  const f = useLocalFrame();
  const s = life(f, at, out);
  if (s <= 0) return null;
  return (
    <Place x={x} y={y} s={s} rot={rot}>
      <div style={{ width: w, background: "#ffffff", borderRadius: 38, border: "6px solid #141414", boxShadow: "0 16px 0 rgba(0,0,0,0.25)", overflow: "hidden", fontFamily: font("Montserrat") }}>
        <div style={{ padding: "18px 26px", fontWeight: 900, fontSize: 34, color: "#141414", borderBottom: "3px solid #ececec", textAlign: "center" }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "22px 22px 28px", minHeight: 120 }}>
          {msgs.map((m, i) => {
            const k = f < m.at ? 0 : backOut(invLerp(m.at, m.at + 7, f), 2.4);
            if (k <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  alignSelf: m.me ? "flex-end" : "flex-start",
                  maxWidth: w * 0.78,
                  background: m.me ? "#b9a3e6" : "#ececf0",
                  color: "#141414",
                  fontWeight: 800,
                  fontSize: 34,
                  lineHeight: 1.18,
                  padding: "14px 22px",
                  borderRadius: 28,
                  transform: `scale(${k})`,
                  transformOrigin: m.me ? "right center" : "left center",
                }}
              >
                {m.text}
              </div>
            );
          })}
        </div>
      </div>
    </Place>
  );
};

/** The closing brand card: dark panel fades in over the last frames with the pileGo! wordmark and pilego.app. */
export const EndCard: React.FC<{ at: number; line?: string }> = ({ at, line = "snap once. list everywhere." }) => {
  const f = useLocalFrame();
  const { width } = useVideoConfig();
  if (f < at) return null;
  const o = Math.min(1, invLerp(at, at + 8, f));
  const s = backOut(invLerp(at + 3, at + 14, f), 2.2);
  const u = backOut(invLerp(at + 10, at + 20, f), 2.2);
  const k = width / 1080;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(22,24,19,${0.94 * o})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 * k, transform: `scale(${1 + 0.004 * Math.max(0, f - at)}) rotate(${0.03 * Math.max(0, f - at)}deg)` }}>
      <div style={{ transform: `scale(${s})`, fontFamily: font("Poppins"), fontWeight: 900, fontSize: 190 * k, color: "#f2efe4", letterSpacing: -4 * k }}>
        pile<span style={{ color: "#a8c68a" }}>Go!</span>
      </div>
      <div style={{ transform: `scale(${u})`, fontFamily: font("Montserrat"), fontWeight: 900, fontSize: 70 * k, color: "#161813", background: "#a8c68a", padding: `${12 * k}px ${42 * k}px`, borderRadius: 40 * k }}>
        pilego.app
      </div>
      <div style={{ opacity: u, fontFamily: font("Montserrat"), fontWeight: 800, fontSize: 40 * k, color: "#f2efe4" }}>{line}</div>
    </div>
  );
};
