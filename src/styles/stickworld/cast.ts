// Ready-made StickWorld cast. A channel should keep ONE recurring lead (top channels all have a recurring
// character + a signature device), so copy one of these into the video's channel profile and keep it.
import type { StickSpec } from "./draw";

export const CAST: Record<string, StickSpec> = {
  // Tiff: the recurring lead (23): anime-style curvy figure, silver-lavender hair, black tank, jean shorts, black boots (tiff.ts)
  tiff: { figure: "tiff", body: "#1d1b22", legColor: "#4a78b5", shoes: "#17151a", accent: "#e2b23c", hairColor: "#d9d8ef", head: "#fbe3d6", seed: 23 },
  // Tiff's side cast (same anime figure kit, different build / hair / outfit)
  jake: { figure: "tiff", anime: { build: "male", hair: "short", hairLine: "#0f0c0b", iris: ["#2a1a10", "#7a5232"], top: "tee", bottom: "jeans", shoes: "sneakers", choker: false, lashes: false }, body: "#7a1f24", legColor: "#2f3f5f", shoes: "#1b1b1f", accent: "#c9a46a", hairColor: "#1f1a18", head: "#efc9b0", seed: 31 },
  mia: { figure: "tiff", anime: { build: "curvy", hair: "bob", hairLine: "#4a2a1a", iris: ["#2f6b3a", "#9ad48a"], top: "tee", bottom: "jeans", shoes: "sneakers", choker: false, lashes: true }, body: "#f2c94c", legColor: "#5b7fb8", shoes: "#a8c68a", accent: "#c9a46a", hairColor: "#8a5a3c", head: "#f6d6c4", seed: 47 },
  // one-off side characters for the Tiff reels (same anime kit)
  sasha: { figure: "tiff", anime: { build: "curvy", hair: "long", hairLine: "#1a1010", iris: ["#4a2a18", "#b07a4a"], top: "tank", bottom: "jeans", shoes: "boots", choker: false, lashes: true }, body: "#3f8f5a", legColor: "#26242c", shoes: "#17151a", accent: "#c9a46a", hairColor: "#3a2420", head: "#e9c2a6", seed: 57 },
  leo: { figure: "tiff", anime: { build: "male", hair: "short", hairLine: "#2a1a10", iris: ["#3a4a2a", "#8aa86a"], top: "tee", bottom: "jeans", shoes: "sneakers", choker: false, lashes: false }, body: "#b9a3d9", legColor: "#3a3f4f", shoes: "#f3f0e8", accent: "#c9a46a", hairColor: "#6b4a2e", head: "#f2cdb4", seed: 63 },
  friendA: { figure: "tiff", anime: { build: "curvy", hair: "bob", hairLine: "#5a1e10", iris: ["#2a3f6b", "#8fb4e6"], top: "tee", bottom: "jeans", shoes: "sneakers", choker: false, lashes: true }, body: "#e98aa6", legColor: "#4a6fa5", shoes: "#ffffff", accent: "#c9a46a", hairColor: "#b0442a", head: "#f6d6c4", seed: 71 },
  friendB: { figure: "tiff", anime: { build: "male", hair: "short", hairLine: "#0f0c0b", iris: ["#2a1a10", "#6a4a2a"], top: "tee", bottom: "jeans", shoes: "sneakers", choker: false, lashes: false }, body: "#3f6fb5", legColor: "#2a2f3a", shoes: "#1b1b1f", accent: "#c9a46a", hairColor: "#2a1a10", head: "#c99a78", seed: 73 },
  // the lead: brown side-part hair, round glasses, teal tee (the reference's everyman)
  lead: { body: "#1fa38a", hair: "side", hairColor: "#8a5a32", glasses: "round", seed: 3 },
  leadF: { body: "#e8578c", hair: "bun", hairColor: "#c8502c", seed: 11 },
  recruiter: { body: "#22305a", outfit: "suit", accent: "#d62f3a", hair: "slick", hairColor: "#1d1d22", glasses: "round", mustache: "#2a1a14", nose: "red", seed: 5 },
  boss: { body: "#2f3242", outfit: "suit", accent: "#f2c14e", hair: "short", hairColor: "#3a2a20", build: "stout", seed: 8 },
  suit: { body: "#1f2433", outfit: "suit", accent: "#e1b12c", hair: "slick", hairColor: "#16161a", glasses: "round", seed: 12 },
  hacker: { body: "#24242b", mask: true, hat: "hood", hatColor: "#24242b", outfit: "hoodie", seed: 21 },
  hackerRed: { body: "#8c1f2a", mask: true, hat: "hood", hatColor: "#8c1f2a", outfit: "hoodie", seed: 22 },
  hackerGreen: { body: "#1f5b3a", mask: true, hat: "hood", hatColor: "#1f5b3a", outfit: "hoodie", seed: 23 },
  agent: { body: "#1d2a4a", text: "FBI", textColor: "#ffd23f", hat: "cap", hatColor: "#1d2a4a", hatText: "FBI", hair: "spiky", hairColor: "#2a1a10", seed: 31 },
  cop: { body: "#2b4a8a", outfit: "uniform", accent: "#e8c45a", hat: "police", hatColor: "#1d2a4a", seed: 32 },
  scientist: { body: "#f4f6fb", outfit: "lab", glasses: "square", hair: "curly", hairColor: "#c9c9c9", seed: 41 },
  doctor: { body: "#e9f2f8", outfit: "lab", hair: "short", hairColor: "#3a2a20", seed: 42 },
  worker: { body: "#f08a2c", hat: "hardhat", hatColor: "#ffc21a", seed: 51 },
  chef: { body: "#ffffff", hat: "chef", seed: 52 },
  kid: { body: "#f2c14e", build: "kid", hair: "spiky", hairColor: "#5a3b2a", seed: 61 },
  girl: { body: "#7b5ac9", hair: "ponytail", hairColor: "#3a2416", seed: 62 },
  grandpa: { body: "#8b6f4e", outfit: "jacket", hair: "bald", glasses: "square", mustache: "#e8e8e8", build: "stout", seed: 71 },
  king: { body: "#8c2bd6", outfit: "robe", accent: "#ffcc33", hat: "crown", beard: "#7a4a2a", seed: 81 },
  knight: { body: "#9aa4b0", outfit: "armor", hat: "helmet", hatColor: "#9aa4b0", seed: 82 },
  peasant: { body: "#9c7a4f", hair: "short", hairColor: "#5a3b2a", seed: 83 },
  soldier: { body: "#4f6b3a", outfit: "uniform", accent: "#d9c27a", hat: "helmet", hatColor: "#4f6b3a", seed: 84 },
  cowboy: { body: "#c0563a", hat: "cowboy", mustache: "#4a3020", seed: 85 },
  student: { body: "#3f7ad6", hair: "short", hairColor: "#2a1a10", hat: "none", seed: 91 },
  grad: { body: "#1b1b22", hat: "grad", seed: 92 },
  customerA: { body: "#f2a93b", hair: "bob", hairColor: "#3a2416", seed: 101 },
  customerB: { body: "#e65a8c", hair: "bun", hairColor: "#d9532c", seed: 102 },
  customerC: { body: "#7cc576", hair: "short", hairColor: "#5a3b2a", seed: 103 },
};
