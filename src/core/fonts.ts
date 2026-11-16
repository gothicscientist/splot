// Google Fonts, loaded on first use (each loader holds the render until its files are in).
// Canvas text (signs, papers, stickers, character cards) is drawn once and cached, and a canvas never swaps a
// fallback font for the real one later. So <Reel> mounts no scene until EVERY registered font is drawable
// (useAllFontsReady): stills and multi-tab renders then draw identical text.
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as poppins } from "@remotion/google-fonts/Poppins";
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as bangers } from "@remotion/google-fonts/Bangers";
import { loadFont as luckiest } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as lilita } from "@remotion/google-fonts/LilitaOne";
import { loadFont as fredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as pixelify } from "@remotion/google-fonts/PixelifySans";
import { loadFont as pressStart } from "@remotion/google-fonts/PressStart2P";
import { loadFont as vt323 } from "@remotion/google-fonts/VT323";
import { loadFont as silkscreen } from "@remotion/google-fonts/Silkscreen";
import { loadFont as patrick } from "@remotion/google-fonts/PatrickHand";
import { loadFont as marker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as bebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as grotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as nunito } from "@remotion/google-fonts/Nunito";
import { loadFont as baloo } from "@remotion/google-fonts/Baloo2";
import { loadFont as dmserif } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as cinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as mono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as oswald } from "@remotion/google-fonts/Oswald";
import { loadFont as franklin } from "@remotion/google-fonts/LibreFranklin";
import { loadFont as grenze } from "@remotion/google-fonts/GrenzeGotisch";

type LoadedFont = { fontFamily: string; waitUntilDone?: () => Promise<unknown> };
type Loader = () => LoadedFont;
const L = (fn: (...a: any[]) => LoadedFont, weights?: string[], style = "normal"): Loader => () =>
  fn(style as any, { subsets: ["latin"], ...(weights ? { weights } : {}) } as any);

const LOADERS: Record<string, Loader> = {
  Montserrat: L(montserrat, ["700", "800", "900"]),
  Poppins: L(poppins, ["600", "700", "800", "900"]),
  Anton: L(anton, ["400"]),
  Inter: L(inter, ["500", "600", "700", "800", "900"]),
  Bangers: L(bangers, ["400"]),
  "Luckiest Guy": L(luckiest, ["400"]),
  "Lilita One": L(lilita, ["400"]),
  Fredoka: L(fredoka, ["500", "600", "700"]),
  "Pixelify Sans": L(pixelify, ["400", "500", "600", "700"]),
  "Press Start 2P": L(pressStart, ["400"]),
  VT323: L(vt323, ["400"]),
  Silkscreen: L(silkscreen, ["400", "700"]),
  "Patrick Hand": L(patrick, ["400"]),
  "Permanent Marker": L(marker, ["400"]),
  Caveat: L(caveat, ["500", "600", "700"]),
  "Bebas Neue": L(bebas, ["400"]),
  "Space Grotesk": L(grotesk, ["500", "600", "700"]),
  Nunito: L(nunito, ["700", "800", "900"]),
  "Baloo 2": L(baloo, ["600", "700", "800"]),
  "DM Serif Display": L(dmserif, ["400"]),
  Cinzel: L(cinzel, ["600", "700", "800", "900"]),
  "JetBrains Mono": L(mono, ["500", "700"]),
  Oswald: L(oswald, ["500", "600", "700"]),
  // pileGo! brand face (wordmark = 900 italic, tracking -0.055em); the italic is registered as its own loader
  "Libre Franklin": L(franklin, ["400", "500", "600", "700", "800", "900"]),
  "Libre Franklin Italic": L(franklin, ["700", "800", "900"], "italic"),
  // blackletter for ug-rap channel title cards (readable gothic, not a tattoo script)
  "Grenze Gotisch": L(grenze, ["500", "700", "900"]),
};

const loaded = new Map<string, LoadedFont>();
function ensure(name: string): LoadedFont {
  const key = LOADERS[name] ? name : "Montserrat";
  let f = loaded.get(key);
  if (!f) {
    f = LOADERS[key]();
    loaded.set(key, f);
  }
  return f;
}
/** CSS font-family for a Google font (loads it the first time). Unknown names fall back to Montserrat. */
export function font(name: string): string {
  return ensure(name).fontFamily;
}

let allFonts: Promise<void> | null = null;
let allFontsDone = false;
/** Load every registered font (all weights) and resolve once the browser can draw each one. */
export function loadAllFonts(): Promise<void> {
  if (!allFonts) {
    allFonts = Promise.all(Object.keys(LOADERS).map((n) => ensure(n).waitUntilDone?.() ?? Promise.resolve()))
      .then(() => document.fonts.ready)
      .then(() => {
        allFontsDone = true;
      });
  }
  return allFonts;
}
/** Holds the frame (delayRender) and returns false until every registered font is drawable. */
export function useAllFontsReady(): boolean {
  const [ok, setOk] = useState(allFontsDone);
  const [handle] = useState(() => (allFontsDone ? null : delayRender("all fonts (canvas text)", { timeoutInMilliseconds: 90000 })));
  useEffect(() => {
    if (ok) return;
    let alive = true;
    const done = () => {
      if (alive) setOk(true);
      if (handle !== null) continueRender(handle);
    };
    // a failed font must not hang the render: the loaders already report their own errors
    loadAllFonts().then(done, done);
    return () => {
      alive = false;
    };
  }, [ok, handle]);
  return ok;
}
export const FONT_NAMES = Object.keys(LOADERS);
