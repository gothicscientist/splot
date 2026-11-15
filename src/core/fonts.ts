// Google Fonts, loaded on first use (each loader holds the render until its files are in).
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

type Loader = () => string;
const L = (fn: (...a: any[]) => { fontFamily: string }, weights?: string[], style = "normal"): Loader => () =>
  fn(style as any, { subsets: ["latin"], ...(weights ? { weights } : {}) } as any).fontFamily;

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
};

const loaded = new Map<string, string>();
/** CSS font-family for a Google font (loads it the first time). Unknown names fall back to Montserrat. */
export function font(name: string): string {
  const key = LOADERS[name] ? name : "Montserrat";
  let fam = loaded.get(key);
  if (!fam) {
    fam = LOADERS[key]();
    loaded.set(key, fam);
  }
  return fam;
}
export const FONT_NAMES = Object.keys(LOADERS);
