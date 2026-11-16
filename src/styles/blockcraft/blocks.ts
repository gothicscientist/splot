// Blockcraft blocks: ORIGINAL procedural 16x16 pixel textures (no game assets), packed in one atlas, nearest filtered.
// Each block type has top / side / bottom tiles. Colours are tuned to read like the voxel-game genre without
// copying any specific texture.
import * as THREE from "three";
import { rand } from "../../core/anim";

export type BlockType =
  | "grass" | "dirt" | "stone" | "cobble" | "deepstone" | "bedrock" | "sand" | "sandstone" | "gravel" | "clay"
  | "log" | "planks" | "leaves" | "glass" | "water" | "lava" | "brick" | "obsidian" | "snow" | "ice"
  | "coalOre" | "ironOre" | "goldOre" | "gemOre" | "redOre" | "goldBlock" | "gemBlock" | "ironBlock"
  | "wool_white" | "wool_red" | "wool_blue" | "wool_yellow" | "wool_green" | "wool_black" | "wool_orange" | "wool_purple"
  | "bookshelf" | "glow" | "tnt" | "darkPlanks" | "quartz" | "magma" | "path" | "sea"
  // packed snow: the snow tile on every face (the "snow" block shows dirt on its sides), for snow layers seen
  // edge-on, e.g. the surface strip of a cross-section
  | "snowBlock";

export const TRANSPARENT = new Set<BlockType>(["glass", "water", "leaves", "ice"]);
export const EMISSIVE = new Set<BlockType>(["lava", "glow", "magma"]);

const T = 16;
type Px = (x: number, y: number, r: (k: number) => number) => string;

const hex = (r: number, g: number, b: number) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
const vary = (c: [number, number, number], amt: number, r: number): string => hex(c[0] * (1 - amt + 2 * amt * r), c[1] * (1 - amt + 2 * amt * r), c[2] * (1 - amt + 2 * amt * r));
const noisy = (c: [number, number, number], amt = 0.12): Px => (_x, _y, r) => vary(c, amt, r(0));
const speckle = (base: [number, number, number], spot: [number, number, number], density: number, amt = 0.1): Px => (_x, _y, r) =>
  r(1) < density ? vary(spot, amt, r(2)) : vary(base, amt, r(0));
const ore = (spot: [number, number, number]): Px => (x, y, r) => {
  // clusters of 2x2-ish spots on stone
  const cx = ((x >> 2) * 7 + (y >> 2) * 13) % 5;
  const inSpot = cx === 0 && r(5) > 0.35 && x % 4 !== 3 && y % 4 !== 3;
  return inSpot ? vary(spot, 0.15, r(2)) : vary([125, 125, 125], 0.14, r(0));
};

const TILES: Record<string, Px> = {
  grass_top: noisy([95, 160, 62], 0.16),
  grass_side: (x, y, r) => (y < 3 + (r(3) > 0.5 ? 1 : 0) ? vary([95, 160, 62], 0.14, r(0)) : vary([134, 96, 67], 0.14, r(0))),
  dirt: speckle([134, 96, 67], [100, 72, 50], 0.18),
  stone: speckle([125, 125, 125], [104, 104, 104], 0.25, 0.08),
  cobble: (x, y, r) => {
    const cell = ((x >> 2) + (y >> 2) * 3) % 4;
    const edge = x % 4 === 0 || y % 4 === 0;
    return edge ? vary([84, 84, 84], 0.1, r(1)) : vary([128 + cell * 6, 128 + cell * 6, 128 + cell * 6], 0.1, r(0));
  },
  deepstone: (x, y, r) => (r(1) < 0.3 ? vary([54, 52, 60], 0.12, r(2)) : (x + y * 5) % 9 === 0 ? vary([118, 114, 120], 0.08, r(2)) : vary([88, 86, 94], 0.1, r(0))),
  bedrock: speckle([86, 86, 86], [40, 40, 40], 0.45, 0.2),
  sand: speckle([219, 207, 163], [200, 186, 140], 0.25, 0.05),
  sandstone_side: (x, y, r) => vary(y < 4 ? [226, 214, 170] : [216, 202, 156], 0.06, r(0)),
  sandstone_top: noisy([226, 214, 170], 0.05),
  gravel: speckle([136, 126, 126], [96, 88, 88], 0.4, 0.15),
  clay: noisy([160, 166, 179], 0.06),
  log_side: (x, _y, r) => vary(x % 4 === 0 ? [80, 60, 36] : [104, 82, 50], 0.1, r(0)),
  log_top: (x, y, r) => {
    const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
    return d > 6.5 ? vary([104, 82, 50], 0.08, r(0)) : vary(Math.floor(d) % 2 ? [182, 146, 94] : [160, 126, 80], 0.06, r(0));
  },
  planks: (x, y, r) => (y % 4 === 3 || (x === ((y >> 2) * 5) % 16 && y % 4 !== 3) ? vary([110, 84, 52], 0.06, r(1)) : vary([162, 130, 80], 0.08, r(0))),
  darkPlanks: (x, y, r) => (y % 4 === 3 ? vary([50, 34, 20], 0.06, r(1)) : vary([76, 52, 30], 0.08, r(0))),
  leaves: (x, y, r) => (r(4) < 0.18 ? "rgba(0,0,0,0)" : vary([62, 130, 46], 0.2, r(0))),
  glass: (x, y) => (x === 0 || y === 0 || x === 15 || y === 15 ? "rgb(210,236,244)" : (x === y || x === y + 1) && x > 3 && x < 8 ? "rgba(255,255,255,0.75)" : "rgba(190,225,240,0.12)"),
  water: (x, y, r) => `rgba(${52 + r(0) * 10},${96 + r(0) * 20},${214},0.72)`,
  lava: (x, y, r) => vary(r(1) > 0.7 ? [255, 210, 60] : [230, 100, 20], 0.12, r(0)),
  magma: (x, y, r) => ((x + y * 3) % 7 === 0 ? vary([255, 140, 30], 0.1, r(0)) : vary([90, 30, 20], 0.15, r(0))),
  brick: (x, y, r) => {
    const row = y >> 2;
    const off = row % 2 ? 4 : 0;
    const mortar = y % 4 === 3 || (x + off) % 8 === 7;
    return mortar ? vary([196, 186, 176], 0.05, r(1)) : vary([150, 74, 58], 0.12, r(0));
  },
  obsidian: speckle([22, 16, 36], [60, 40, 90], 0.12, 0.2),
  snow: noisy([244, 248, 252], 0.03),
  snow_side: (x, y, r) => (y < 4 ? vary([244, 248, 252], 0.03, r(0)) : vary([134, 96, 67], 0.14, r(0))),
  ice: (x, y, r) => `rgba(${150 + r(0) * 30},${190 + r(0) * 30},255,0.7)`,
  coalOre: ore([30, 30, 30]),
  ironOre: ore([216, 175, 147]),
  goldOre: ore([250, 214, 60]),
  gemOre: ore([90, 230, 225]),
  redOre: ore([220, 30, 30]),
  goldBlock: (x, y, r) => (x === 0 || y === 0 ? vary([255, 245, 140], 0.04, r(0)) : x === 15 || y === 15 ? vary([196, 140, 20], 0.05, r(0)) : vary([248, 210, 60], 0.06, r(0))),
  gemBlock: (x, y, r) => (x === 0 || y === 0 ? vary([190, 255, 250], 0.04, r(0)) : x === 15 || y === 15 ? vary([30, 160, 160], 0.05, r(0)) : vary([96, 230, 222], 0.06, r(0))),
  ironBlock: (x, y, r) => (y % 8 === 0 ? vary([170, 170, 170], 0.04, r(0)) : vary([222, 222, 222], 0.04, r(0))),
  bookshelf: (x, y, r) => {
    if (y < 2 || y > 13 || y === 7 || y === 8) return vary([162, 130, 80], 0.08, r(0));
    const book = x >> 1;
    const cols: [number, number, number][] = [[140, 40, 40], [40, 70, 140], [60, 120, 50], [150, 120, 40], [90, 50, 120]];
    return x % 2 === 1 && r(3) > 0.5 ? vary([60, 40, 24], 0.1, r(0)) : vary(cols[(book + (y > 8 ? 2 : 0)) % 5], 0.1, r(0));
  },
  glow: (x, y, r) => vary(r(1) > 0.6 ? [255, 236, 160] : [214, 170, 80], 0.1, r(0)),
  tnt_side: (x, y, r) => (y > 5 && y < 10 ? (x % 3 === 0 && y === 7 ? "rgb(20,20,20)" : vary([235, 235, 225], 0.04, r(0))) : vary([200, 40, 30], 0.08, r(0))),
  tnt_top: (x, y, r) => (Math.abs(x - 7.5) < 1.5 && Math.abs(y - 7.5) < 1.5 ? "rgb(30,30,30)" : vary([200, 40, 30], 0.08, r(0))),
  quartz: noisy([236, 230, 222], 0.03),
  path: speckle([150, 122, 66], [128, 100, 52], 0.25, 0.06),
};
const WOOL: Record<string, [number, number, number]> = {
  wool_white: [234, 236, 237], wool_red: [160, 39, 34], wool_blue: [53, 57, 157], wool_yellow: [248, 198, 39],
  wool_green: [84, 109, 27], wool_black: [20, 21, 25], wool_orange: [240, 118, 19], wool_purple: [121, 42, 172],
};
for (const [k, c] of Object.entries(WOOL)) TILES[k] = (x, y, r) => vary(c, 0.06 + ((x + y) % 3 === 0 ? 0.04 : 0), r(0));
// opaque sea (added after the wool so every older tile keeps its atlas index and noise): a clean blue with short
// light wave dashes. `water` is translucent and turns purple over emissive rock (a cut-open planet's mantle).
TILES.sea = (x, y, r) => (y % 5 === 1 && (x + y * 3) % 8 < 3 ? vary([150, 202, 250], 0.04, r(0)) : vary([50, 110, 212], 0.06, r(0)));

// block -> [top, side, bottom]
const FACES: Record<BlockType, [string, string, string]> = {
  grass: ["grass_top", "grass_side", "dirt"], dirt: ["dirt", "dirt", "dirt"], stone: ["stone", "stone", "stone"],
  cobble: ["cobble", "cobble", "cobble"], deepstone: ["deepstone", "deepstone", "deepstone"], bedrock: ["bedrock", "bedrock", "bedrock"],
  sand: ["sand", "sand", "sand"], sandstone: ["sandstone_top", "sandstone_side", "sandstone_top"], gravel: ["gravel", "gravel", "gravel"],
  clay: ["clay", "clay", "clay"], log: ["log_top", "log_side", "log_top"], planks: ["planks", "planks", "planks"],
  darkPlanks: ["darkPlanks", "darkPlanks", "darkPlanks"], leaves: ["leaves", "leaves", "leaves"], glass: ["glass", "glass", "glass"],
  water: ["water", "water", "water"], lava: ["lava", "lava", "lava"], magma: ["magma", "magma", "magma"], brick: ["brick", "brick", "brick"],
  obsidian: ["obsidian", "obsidian", "obsidian"], snow: ["snow", "snow_side", "dirt"], ice: ["ice", "ice", "ice"],
  coalOre: ["coalOre", "coalOre", "coalOre"], ironOre: ["ironOre", "ironOre", "ironOre"], goldOre: ["goldOre", "goldOre", "goldOre"],
  gemOre: ["gemOre", "gemOre", "gemOre"], redOre: ["redOre", "redOre", "redOre"], goldBlock: ["goldBlock", "goldBlock", "goldBlock"],
  gemBlock: ["gemBlock", "gemBlock", "gemBlock"], ironBlock: ["ironBlock", "ironBlock", "ironBlock"],
  wool_white: ["wool_white", "wool_white", "wool_white"], wool_red: ["wool_red", "wool_red", "wool_red"], wool_blue: ["wool_blue", "wool_blue", "wool_blue"],
  wool_yellow: ["wool_yellow", "wool_yellow", "wool_yellow"], wool_green: ["wool_green", "wool_green", "wool_green"], wool_black: ["wool_black", "wool_black", "wool_black"],
  wool_orange: ["wool_orange", "wool_orange", "wool_orange"], wool_purple: ["wool_purple", "wool_purple", "wool_purple"],
  bookshelf: ["planks", "bookshelf", "planks"], glow: ["glow", "glow", "glow"], tnt: ["tnt_top", "tnt_side", "tnt_top"],
  quartz: ["quartz", "quartz", "quartz"], path: ["path", "dirt", "dirt"], sea: ["sea", "sea", "sea"],
  snowBlock: ["snow", "snow", "snow"],
};

// ------------------------------------------------------------------------------------------------ atlas
// Each 16x16 tile sits in a 32x32 cell whose 8-texel gutter repeats the tile's edge texels. Under MSAA the fragment
// shader runs at the pixel centre even when only a sample is covered, so UVs extrapolate past a face's edge: without
// the gutter that sampled the NEIGHBOURING tile and drew thin seams of another block's colour along block edges
// (orange lines in stone from the lava tile below it, most visible in wide shots). The tiles and their noise are
// unchanged; only their place in the atlas moved.
const tileNames = Object.keys(TILES);
const COLS = 16;
const ROWS = Math.ceil(tileNames.length / COLS);
const PAD = 8;
const CELL = T + 2 * PAD;
let atlas: THREE.CanvasTexture | null = null;
const tileIndex = new Map<string, number>();
tileNames.forEach((n, i) => tileIndex.set(n, i));

export function getAtlas() {
  if (atlas) return atlas;
  const c = document.createElement("canvas");
  c.width = COLS * CELL;
  c.height = ROWS * CELL;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  tileNames.forEach((name, i) => {
    const ox = (i % COLS) * CELL + PAD;
    const oy = Math.floor(i / COLS) * CELL + PAD;
    const fn = TILES[name];
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) {
        const seed = i * 997 + y * 31 + x;
        const col = fn(x, y, (k) => rand(seed, k));
        g.fillStyle = col;
        // the texel itself, plus its copies in the gutter when it sits on the tile's edge (corners fill the corners)
        const x0 = x === 0 ? -PAD : x;
        const x1 = x === T - 1 ? T + PAD : x + 1;
        const y0 = y === 0 ? -PAD : y;
        const y1 = y === T - 1 ? T + PAD : y + 1;
        g.clearRect(ox + x0, oy + y0, x1 - x0, y1 - y0);
        g.fillRect(ox + x0, oy + y0, x1 - x0, y1 - y0);
      }
  });
  atlas = new THREE.CanvasTexture(c);
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.magFilter = THREE.NearestFilter;
  atlas.minFilter = THREE.NearestFilter;
  atlas.generateMipmaps = false;
  return atlas;
}

/** UV rect [u0, v0, u1, v1] of a block face: face 0 = top, 1 = side, 2 = bottom. Half-texel inset avoids bleeding. */
export function faceUV(type: BlockType, face: 0 | 1 | 2): [number, number, number, number] {
  const name = FACES[type][face];
  const i = tileIndex.get(name) ?? 0;
  const W = COLS * CELL;
  const H = ROWS * CELL;
  const x0 = (i % COLS) * CELL + PAD;
  const y0 = Math.floor(i / COLS) * CELL + PAD;
  const e = 0.02;
  return [(x0 + e) / W, 1 - (y0 + T - e) / H, (x0 + T - e) / W, 1 - (y0 + e) / H];
}

/** A single tile as its own texture (for item sprites, UI, particles). */
export function tileTexture(name: string) {
  const c = document.createElement("canvas");
  c.width = c.height = T;
  const g = c.getContext("2d")!;
  const i = tileIndex.get(name) ?? 0;
  const fn = TILES[name] ?? TILES.stone;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      g.fillStyle = fn(x, y, (k) => rand(i * 997 + y * 31 + x, k));
      g.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
export const BLOCK_TYPES = Object.keys(FACES) as BlockType[];
