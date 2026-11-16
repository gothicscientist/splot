// Sample: anime.js (github.com/juliangarnier/anime, MIT) driving v5 Tiff in Remotion. One paused anime.js timeline
// animates plain JS objects; every frame we seek() it to frame/fps, so the render stays deterministic.
// Beats: elastic entrance -> staggered title letters -> squash-and-stretch hop -> camera punch-in -> sticker pops.
import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { createTimeline, stagger } from "animejs";
import { TiffPuppet } from "../styles/tiff3d/Puppet";
import { font } from "../core/fonts";

const TITLE = "hi, I'm Tiff!".split("");
const STICKERS = [
  { text: "SOLD ✓", x: 150, y: 520, bg: "#1f7a3a", rot: -8 },
  { text: "+$50", x: 800, y: 640, bg: "#d62f3a", rot: 7 },
  { text: "pileGo!", x: 250, y: 900, bg: "#161813", rot: 4 },
];

function build() {
  const body = { y: 1400, sx: 1, sy: 1, rot: 0 };
  const cam = { z: 1, x: 0 };
  const letters = TITLE.map(() => ({ y: 80, o: 0, r: -20 }));
  const stickers = STICKERS.map(() => ({ s: 0, r: -40 }));
  const tl = createTimeline({ autoplay: false });
  // elastic entrance from below, with a landing squash
  tl.add(body, { y: 0, duration: 1100, ease: "outElastic(1, .7)" }, 0)
    .add(body, { sy: [{ to: 0.94, duration: 120, ease: "outQuad" }, { to: 1, duration: 500, ease: "outElastic(1, .5)" }], sx: [{ to: 1.05, duration: 120, ease: "outQuad" }, { to: 1, duration: 500, ease: "outElastic(1, .5)" }] }, 350)
    // title letters, staggered
    .add(letters, { y: 0, o: 1, r: 0, duration: 500, ease: "outBack(2.5)", delay: stagger(45) }, 900)
    // anticipation squash -> hop -> bouncy landing
    .add(body, { sy: [{ to: 0.9, duration: 160, ease: "outQuad" }, { to: 1.06, duration: 180, ease: "outQuad" }, { to: 1, duration: 500, ease: "outElastic(1, .5)" }], sx: [{ to: 1.07, duration: 160, ease: "outQuad" }, { to: 0.96, duration: 180, ease: "outQuad" }, { to: 1, duration: 500, ease: "outElastic(1, .5)" }] }, 2600)
    .add(body, { y: [{ to: -110, duration: 260, ease: "outQuad" }, { to: 0, duration: 520, ease: "outBounce" }] }, 2760)
    // letters wave out
    .add(letters, { y: -60, o: 0, duration: 300, ease: "inBack(2)", delay: stagger(30) }, 3600)
    // camera punch-in and settle, with a little body tilt
    .add(cam, { z: [{ to: 1.45, duration: 350, ease: "outExpo" }, { to: 1.12, duration: 900, ease: "inOutSine" }], x: [{ to: -40, duration: 350, ease: "outExpo" }, { to: 0, duration: 900, ease: "inOutSine" }] }, 4200)
    .add(body, { rot: [{ to: 3, duration: 300, ease: "outBack(3)" }, { to: 0, duration: 800, ease: "outElastic(1, .5)" }] }, 4200)
    // stickers pop, staggered
    .add(stickers, { s: 1, r: 0, duration: 600, ease: "outElastic(1, .6)", delay: stagger(180) }, 5600);
  return { tl, body, cam, letters, stickers };
}

export const TiffAnimeSample: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const A = useMemo(build, []);
  A.tl.seek((f / fps) * 1000);
  const { body, cam, letters, stickers } = A;
  const fam = font("Montserrat");
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${cam.x * 0.4}px) scale(${1.1 + (cam.z - 1) * 0.35})`, transformOrigin: "50% 40%" }}>
        <Img src={staticFile("img/tiff-love-letter/bedroom.jpg")} style={{ position: "absolute", width: 1280, height: 1920, left: -100, top: 0, filter: "blur(3px)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${cam.x}px) scale(${cam.z})`, transformOrigin: "52% 22%" }}>
        <AbsoluteFill style={{ transform: `translateY(${body.y}px) rotate(${body.rot}deg) scale(${body.sx}, ${body.sy})`, transformOrigin: "50% 100%" }}>
          <TiffPuppet h={1560} cx={540} feet={1930} mood="happy" />
        </AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", fontFamily: fam, fontWeight: 900, fontSize: 110, color: "#fff", WebkitTextStroke: "10px #1b1b1f", paintOrder: "stroke fill" }}>
        {TITLE.map((ch, i) => (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${letters[i].y}px) rotate(${letters[i].r}deg)`, opacity: letters[i].o }}>
            {ch}
          </span>
        ))}
      </div>
      {STICKERS.map((st, i) => (
        <div key={i} style={{ position: "absolute", left: st.x, top: st.y, transform: `scale(${stickers[i].s}) rotate(${st.rot + stickers[i].r}deg)`, background: st.bg, color: "#fff", fontFamily: fam, fontWeight: 900, fontSize: 64, padding: "14px 30px", borderRadius: 22, border: "6px solid #fff", boxShadow: "0 12px 24px rgba(0,0,0,0.35)" }}>
          {st.text}
        </div>
      ))}
    </AbsoluteFill>
  );
};
