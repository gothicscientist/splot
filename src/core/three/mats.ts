// Material factory for the toon world. Every world surface is a two-tone lit Lambert (look/shade.ts) so the whole
// set obeys one light look; signs/screens are unlit (a lit sign face goes grey-blue and unreadable); glows are HDR
// basic colours (> 1) so only they bloom.
import * as THREE from "three";
import { twoTone } from "./look/shade";

const cache = new Map<string, THREE.Material>();

export type ToonOpts = {
  map?: THREE.Texture | null;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  /** 0..1 how much of the shade-lift the material gets (1 = default) */
  lift?: number;
  flatShading?: boolean;
  key?: string;
};

/** Two-tone toon surface (the default for everything in the world). */
export function toon(color: THREE.ColorRepresentation, o: ToonOpts = {}): THREE.MeshLambertMaterial {
  const key = o.map ? null : `toon|${String(color)}|${o.side ?? 0}|${o.transparent ? 1 : 0}|${o.opacity ?? 1}|${o.lift ?? 1}|${o.flatShading ? 1 : 0}`;
  if (key && cache.has(key)) return cache.get(key) as THREE.MeshLambertMaterial;
  const m = twoTone(
    new THREE.MeshLambertMaterial({
      color,
      map: o.map ?? null,
      side: o.side ?? THREE.FrontSide,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      flatShading: o.flatShading ?? false,
    }),
    o.lift ?? 1,
  );
  if (key) cache.set(key, m);
  return m;
}

/** Unlit surface (signs, screens, printed labels). `boost` > 1 makes it glow (bloom threshold is 1.0). */
export function unlit(color: THREE.ColorRepresentation = "#ffffff", map: THREE.Texture | null = null, boost = 1, transparent = false): THREE.MeshBasicMaterial {
  const key = map ? null : `unlit|${String(color)}|${boost}|${transparent}`;
  if (key && cache.has(key)) return cache.get(key) as THREE.MeshBasicMaterial;
  const c = new THREE.Color(color).multiplyScalar(boost);
  const m = new THREE.MeshBasicMaterial({ color: c, map, transparent, toneMapped: true, alphaTest: transparent ? 0.02 : 0 });
  if (key) cache.set(key, m);
  return m;
}

/** HDR glow (lamps, neon, screens at night): intensity 2-6 blooms. */
export const glow = (color: THREE.ColorRepresentation, intensity = 3) => unlit(color, null, intensity);
