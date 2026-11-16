// Lighting looks for the toon 3D world. day + golden are the measured presets from look/lights.ts; the others are
// tuned variants (night, interior, alarm, studio, dusk, dawn). The sun is camera-relative: az = degrees from the
// shot's forward axis (0 = backlight, +90 = from screen right, 180 = from behind the camera), el = elevation.
import { LIGHTS, LightPreset } from "./look/lights";

export type LookName = "day" | "golden" | "night" | "interior" | "alarm" | "studio" | "dusk" | "dawn" | "overcast" | "club";

const day = LIGHTS.day;
const golden = LIGHTS.golden;

export const LOOKS: Record<LookName, LightPreset & { skyTop: string; skyHor: string; grade: "day" | "golden" }> = {
  day: { ...day, skyTop: "#3e7fd2", skyHor: "#b8d0ec", grade: "day" },
  golden: { ...golden, skyTop: "#6a4f8c", skyHor: "#ffd08a", grade: "golden" },
  overcast: {
    ...day,
    lit: [1.25, 1.24, 1.22], shade: [0.42, 0.43, 0.5], term: 0.45, lambert: 0.2,
    top: "#7c90a8", hor: "#c9d3de", fog: "#c9d3de", fogNear: 20, fogFar: 220, skyTop: "#7c90a8", skyHor: "#c9d3de", grade: "day",
  },
  dawn: {
    ...golden,
    az: 120, el: 14, lit: [1.45, 1.05, 0.9], shade: [0.26, 0.26, 0.42], charTint: [1.0, 0.9, 0.86],
    fog: "#f3c7b4", skyTop: "#7a8fc7", skyHor: "#f8c9a8", top: "#7a8fc7", hor: "#f8c9a8", grade: "golden",
  },
  dusk: {
    ...golden,
    az: 35, el: 4, lit: [1.2, 0.62, 0.5], shade: [0.14, 0.14, 0.32], lift: [0.05, 0.06, 0.16], charTint: [0.96, 0.82, 0.82],
    fog: "#b98aa0", skyTop: "#2f3a78", skyHor: "#e9927a", top: "#2f3a78", hor: "#e9927a", grade: "golden",
  },
  // moonlit exterior / dark room: cool key, deep blue shade, lamps and windows read as emissive glows
  night: {
    ...day,
    az: 110, el: 35, lit: [0.62, 0.72, 1.05], shade: [0.1, 0.12, 0.26], lift: [0.04, 0.05, 0.14], lambert: 0.3, term: 0.25,
    charTint: [0.78, 0.84, 1.0], charShade: 0.8, charGrad: 0.09, bodyGrad: 0.22, sideTint: [0.8, 0.82, 0.98],
    top: "#0d1433", hor: "#2a3a6e", fog: "#1d2a52", fogNear: 18, fogFar: 160, skyTop: "#0d1433", skyHor: "#2a3a6e",
    sunCol: "#a9c1ff", sunI: 1.6, hemiI: 0.25, grade: "day",
  },
  // warm practical-lit interior (desk lamp / ceiling light), cool fill in shadow
  interior: {
    ...day,
    az: 150, el: 48, lit: [1.55, 1.38, 1.12], shade: [0.42, 0.36, 0.5], lift: [0.05, 0.05, 0.1], lambert: 0.35, term: 0.22,
    charTint: [1.0, 0.95, 0.9], top: "#e9e1d4", hor: "#e9e1d4", fog: "#d8cfc2", fogNear: 30, fogFar: 200, skyTop: "#9fc4ec", skyHor: "#dbe8f5",
    grade: "day",
  },
  // red alarm wash (the "6 billion" punch): saturated red key, magenta-black shade
  alarm: {
    ...day,
    az: 140, el: 40, lit: [1.85, 0.46, 0.36], shade: [0.26, 0.06, 0.12], lift: [0.08, 0.0, 0.04], lambert: 0.4, term: 0.2,
    charTint: [1.0, 0.62, 0.56], charShade: 0.82, top: "#3a0610", hor: "#7a1220", fog: "#5a0c18", fogNear: 15, fogFar: 140,
    skyTop: "#3a0610", skyHor: "#7a1220", grade: "golden",
  },
  // underground show / club: magenta-violet key from the stage, deep indigo shade, hazy purple air; characters stay
  // readable (char tint near white) while the room falls off into colour
  club: {
    ...day,
    az: 35, el: 32, lit: [1.5, 0.92, 1.42], shade: [0.2, 0.12, 0.34], lift: [0.1, 0.05, 0.16], lambert: 0.35, term: 0.25,
    charTint: [1.0, 0.9, 0.98], charShade: 0.84, charGrad: 0.09, bodyGrad: 0.22, sideTint: [0.9, 0.8, 1.0],
    top: "#140a22", hor: "#3d1856", fog: "#2b1242", fogNear: 9, fogFar: 48, skyTop: "#140a22", skyHor: "#3d1856",
    sunCol: "#ffa3dc", sunI: 2.2, hemiI: 0.32, grade: "golden",
  },
  // clean showroom / museum / stage: bright, low contrast shadow
  studio: {
    ...day,
    az: 150, el: 60, lit: [1.45, 1.42, 1.38], shade: [0.5, 0.48, 0.58], lift: [0.06, 0.06, 0.1], term: 0.3, lambert: 0.3,
    top: "#f2efe9", hor: "#f2efe9", fog: "#ece7df", fogNear: 40, fogFar: 260, skyTop: "#f2efe9", skyHor: "#f2efe9", grade: "day",
  },
};
