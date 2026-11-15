// Canvas textures: hand-painted surfaces (wood, brick, tiles, wallpaper, grass, carpet, concrete, metal) and
// text boards (signs, screens, labels, counters). Deterministic (seeded), cached, sRGB, mipmapped.
import * as THREE from "three";
import { rand } from "../anim";

const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
  const k = `${key}|${w}x${h}|${repeat?.join("x") ?? ""}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  cache.set(k, t);
  return t;
}

const shadeHex = (hex: string, k: number) => {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
};

/** Painted surfaces. `seed` varies the pattern; `repeat` tiles it. */
export const paint = {
  wood: (base = "#b9773f", seed = 1, repeat: [number, number] = [1, 1]) =>
    canvasTex(`wood${base}${seed}`, 512, 512, (g, w, h) => {
      const planks = 6;
      for (let i = 0; i < planks; i++) {
        const k = 0.9 + rand(seed, i) * 0.18;
        g.fillStyle = shadeHex(base, k);
        g.fillRect(0, (i * h) / planks, w, h / planks);
        g.strokeStyle = shadeHex(base, 0.55);
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(0, (i * h) / planks);
        g.lineTo(w, (i * h) / planks);
        g.stroke();
        const off = rand(seed, i + 40) * w;
        g.beginPath();
        g.moveTo(off, (i * h) / planks);
        g.lineTo(off, ((i + 1) * h) / planks);
        g.stroke();
        g.strokeStyle = shadeHex(base, 0.82);
        g.lineWidth = 2;
        for (let s = 0; s < 3; s++) {
          const y = (i * h) / planks + (h / planks) * (0.25 + 0.25 * s) + rand(seed, i * 7 + s) * 6;
          g.beginPath();
          g.moveTo(0, y);
          g.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2);
          g.stroke();
        }
      }
    }, repeat),
  brick: (base = "#d9884a", mortar = "#e9c9a0", seed = 2, repeat: [number, number] = [1, 1]) =>
    canvasTex(`brick${base}${mortar}${seed}`, 512, 512, (g, w, h) => {
      g.fillStyle = mortar;
      g.fillRect(0, 0, w, h);
      const rows = 10;
      const bh = h / rows;
      const bw = w / 4;
      for (let r = 0; r < rows; r++) {
        for (let c = -1; c < 5; c++) {
          const x = c * bw + (r % 2 ? bw / 2 : 0);
          g.fillStyle = shadeHex(base, 0.88 + rand(seed, r * 9 + c) * 0.2);
          g.beginPath();
          g.roundRect(x + 4, r * bh + 4, bw - 8, bh - 8, 5);
          g.fill();
        }
      }
    }, repeat),
  tiles: (a = "#efe6d4", b = "#d9cdb5", n = 8, repeat: [number, number] = [1, 1]) =>
    canvasTex(`tiles${a}${b}${n}`, 512, 512, (g, w, h) => {
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          g.fillStyle = (i + j) % 2 ? a : b;
          g.fillRect((i * w) / n, (j * h) / n, w / n, h / n);
        }
      g.strokeStyle = shadeHex(b, 0.8);
      g.lineWidth = 3;
      for (let i = 0; i <= n; i++) {
        g.beginPath();
        g.moveTo((i * w) / n, 0);
        g.lineTo((i * w) / n, h);
        g.moveTo(0, (i * h) / n);
        g.lineTo(w, (i * h) / n);
        g.stroke();
      }
    }, repeat),
  stripes: (a = "#f2c14e", b = "#e8b23e", n = 10, repeat: [number, number] = [1, 1]) =>
    canvasTex(`stripes${a}${b}${n}`, 512, 512, (g, w, h) => {
      for (let i = 0; i < n; i++) {
        g.fillStyle = i % 2 ? a : b;
        g.fillRect((i * w) / n, 0, w / n, h);
      }
    }, repeat),
  grass: (base = "#5cbf3f", seed = 3, repeat: [number, number] = [1, 1]) =>
    canvasTex(`grass${base}${seed}`, 512, 512, (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 520; i++) {
        const x = rand(seed, i) * w;
        const y = rand(seed, i + 999) * h;
        g.strokeStyle = shadeHex(base, rand(seed, i + 77) > 0.5 ? 1.15 : 0.82);
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (rand(seed, i + 3) - 0.5) * 8, y - 10 - rand(seed, i + 5) * 10);
        g.stroke();
      }
    }, repeat),
  carpet: (base = "#c0392b", trim = "#e8b23e", repeat: [number, number] = [1, 1]) =>
    canvasTex(`carpet${base}${trim}`, 512, 512, (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      g.fillStyle = trim;
      g.fillRect(0, 0, w * 0.08, h);
      g.fillRect(w * 0.92, 0, w * 0.08, h);
    }, repeat),
  concrete: (base = "#b9bcc2", seed = 5, repeat: [number, number] = [1, 1]) =>
    canvasTex(`concrete${base}${seed}`, 512, 512, (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = shadeHex(base, 0.9 + rand(seed, i) * 0.2);
        g.fillRect(rand(seed, i + 1) * w, rand(seed, i + 2) * h, 3, 3);
      }
    }, repeat),
  checker: (a = "#ffffff", b = "#202024", n = 8, repeat: [number, number] = [1, 1]) => paint.tiles(a, b, n, repeat),
};

export type TextBoardOpts = {
  w?: number;
  h?: number;
  bg?: string;
  fg?: string;
  font?: string; // CSS family (use font() from core/fonts so it's loaded)
  weight?: number;
  size?: number; // px on the canvas
  border?: string | null;
  borderW?: number;
  radius?: number;
  align?: CanvasTextAlign;
  lines?: string[];
  sub?: string;
  subColor?: string;
  pad?: number;
};

/** A sign / screen / label face as a texture (multi-line, auto-shrinks to fit). */
export function textBoard(text: string, o: TextBoardOpts = {}) {
  const { w = 1024, h = 512, bg = "#ffffff", fg = "#1b1b1f", font = "Montserrat", weight = 900, border = "#1d1418", borderW = 18, radius = 36, align = "center", sub, subColor = "#666666", pad = 48 } = o;
  const lines = o.lines ?? text.split("\n");
  return canvasTex(`tb|${text}|${JSON.stringify(o)}`, w, h, (g) => {
    g.fillStyle = bg;
    g.beginPath();
    g.roundRect(0, 0, w, h, radius);
    g.fill();
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = borderW;
      g.beginPath();
      g.roundRect(borderW / 2, borderW / 2, w - borderW, h - borderW, radius);
      g.stroke();
    }
    const avail = w - pad * 2;
    const subH = sub ? h * 0.16 : 0;
    let size = o.size ?? Math.floor((h - pad * 2 - subH) / (lines.length * 1.12));
    g.textAlign = align;
    g.textBaseline = "middle";
    const fit = () => {
      g.font = `${weight} ${size}px "${font}", "Arial Black", sans-serif`;
      return Math.max(...lines.map((l) => g.measureText(l).width));
    };
    while (fit() > avail && size > 10) size -= 2;
    g.fillStyle = fg;
    const total = lines.length * size * 1.12;
    const top = (h - subH) / 2 - total / 2 + size * 0.56;
    const x = align === "center" ? w / 2 : align === "left" ? pad : w - pad;
    lines.forEach((l, i) => g.fillText(l, x, top + i * size * 1.12));
    if (sub) {
      g.fillStyle = subColor;
      g.font = `700 ${Math.floor(subH * 0.62)}px "${font}", sans-serif`;
      g.fillText(sub, x, h - pad - subH * 0.4);
    }
  });
}
