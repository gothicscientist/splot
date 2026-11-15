// StickWorld prop kit. Chunky, slightly rounded toy-like shapes, two-tone lit, ink-outlined automatically by the
// world ink pass. Units are metres; y = 0 is the floor. Everything accepts position / rotation / scale.
import React from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { toon, unlit, glow } from "../../core/three/mats";
import { paint, textBoard } from "../../core/three/tex";
import { font } from "../../core/fonts";
import type { Vec3 } from "../../core/types";

type T = { position?: Vec3; rotation?: Vec3; scale?: number | Vec3 };
const G: React.FC<T & { children: React.ReactNode }> = ({ position, rotation, scale, children }) => (
  <group position={position} rotation={rotation} scale={scale as any}>
    {children}
  </group>
);

export const Box: React.FC<T & { size: Vec3; color: string; r?: number; map?: THREE.Texture }> = ({ size, color, r = 0.03, map, ...t }) => (
  <G {...t}>
    <RoundedBox args={size} radius={Math.min(r, Math.min(...size) / 2.2)} smoothness={3} material={map ? toon(color, { map }) : toon(color)} castShadow receiveShadow />
  </G>
);

export const Cyl: React.FC<T & { r: number; h: number; color: string; seg?: number; rTop?: number }> = ({ r, h, color, seg = 24, rTop, ...t }) => (
  <G {...t}>
    <mesh material={toon(color)} castShadow receiveShadow position={[0, h / 2, 0]}>
      <cylinderGeometry args={[rTop ?? r, r, h, seg]} />
    </mesh>
  </G>
);

export const Ball: React.FC<T & { r: number; color: string }> = ({ r, color, ...t }) => (
  <G {...t}>
    <mesh material={toon(color)} castShadow receiveShadow>
      <sphereGeometry args={[r, 24, 16]} />
    </mesh>
  </G>
);

/** A flat printed face (sign, screen, poster). Unlit so it stays readable under any light. */
export const Board: React.FC<T & { w: number; h: number; text?: string; tex?: THREE.Texture; bg?: string; fg?: string; glowK?: number; fontName?: string; sub?: string; border?: string | null }> = ({
  w,
  h,
  text,
  tex,
  bg = "#ffffff",
  fg = "#1b1b1f",
  glowK = 1,
  fontName = "Montserrat",
  sub,
  border = "#1d1418",
  ...t
}) => {
  const fam = font(fontName);
  const map = tex ?? textBoard(text ?? "", { w: 1024, h: Math.max(64, Math.round((1024 * h) / w)), bg, fg, font: fam, sub, border });
  return (
    <G {...t}>
      <mesh material={unlit("#ffffff", map, glowK)}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ rooms
export type RoomProps = T & {
  w?: number;
  d?: number;
  h?: number;
  wall?: string;
  wall2?: string;
  floor?: "wood" | "tiles" | "carpet" | "concrete" | "checker";
  floorColor?: string;
  wallTex?: "stripes" | "brick" | "plain" | "panels";
  baseboard?: string;
  window?: "night" | "day" | null;
  sides?: boolean;
};
/** Three-sided room (back wall + side walls + floor) open toward +z (the camera side). */
export const Room: React.FC<RoomProps> = ({
  w = 8,
  d = 7,
  h = 3.2,
  wall = "#f2c14e",
  wall2,
  floor = "wood",
  floorColor = "#b9773f",
  wallTex = "stripes",
  baseboard = "#2f8f9d",
  window = null,
  sides = true,
  ...t
}) => {
  const floorMap =
    floor === "wood"
      ? paint.wood(floorColor, 3, [w / 2.2, d / 2.2])
      : floor === "tiles"
        ? paint.tiles("#efe6d4", "#d9cdb5", 8, [w / 4, d / 4])
        : floor === "checker"
          ? paint.checker("#f4efe6", "#2a2a30", 8, [w / 4, d / 4])
          : floor === "carpet"
            ? paint.carpet(floorColor, "#e8b23e", [1, 1])
            : paint.concrete(floorColor, 5, [w / 4, d / 4]);
  const wallMap =
    wallTex === "stripes"
      ? paint.stripes(wall, new THREE.Color(wall).multiplyScalar(0.92).getStyle(), 14, [w / 3, 1])
      : wallTex === "brick"
        ? paint.brick(wall, "#e9c9a0", 2, [w / 2.5, h / 2.5])
        : undefined;
  const wm = wallMap ? toon("#ffffff", { map: wallMap }) : toon(wall);
  const wm2 = wall2 ? toon(wall2) : wm;
  return (
    <G {...t}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={toon("#ffffff", { map: floorMap })}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2]} receiveShadow material={wm}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <Box size={[w, 0.16, 0.06]} color={baseboard} position={[0, 0.08, -d / 2 + 0.03]} r={0.01} />
      <Box size={[w, 0.9, 0.04]} color={baseboard} position={[0, 0.45, -d / 2 + 0.02]} r={0.01} />
      {sides ? (
        <>
          <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={wm2}>
            <planeGeometry args={[d, h]} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={wm2}>
            <planeGeometry args={[d, h]} />
          </mesh>
        </>
      ) : null}
      {window ? <Window position={[w * 0.18, 1.75, -d / 2 + 0.05]} kind={window} /> : null}
    </G>
  );
};

export const Window: React.FC<T & { kind?: "night" | "day"; w?: number; h?: number; frame?: string; curtain?: string | null }> = ({
  kind = "day",
  w = 1.6,
  h = 1.5,
  frame = "#ffffff",
  curtain = "#e0483e",
  ...t
}) => {
  const pane = kind === "night" ? glow("#3554a8", 1.15) : unlit("#a9d6ff", null, 1.05);
  return (
    <G {...t}>
      <Box size={[w + 0.16, h + 0.16, 0.1]} color={frame} r={0.02} />
      <mesh position={[0, 0, 0.055]} material={pane}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <Box size={[0.06, h, 0.06]} color={frame} position={[0, 0, 0.08]} r={0.01} />
      <Box size={[w, 0.06, 0.06]} color={frame} position={[0, 0, 0.08]} r={0.01} />
      {kind === "night"
        ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh key={i} position={[-w / 2 + 0.15 + ((i * 0.37) % (w - 0.3)), -h / 2 + 0.2 + ((i * 0.53) % (h * 0.6)), 0.06]} material={glow("#ffe39a", 2.2)}>
              <planeGeometry args={[0.06, 0.08]} />
            </mesh>
          ))
        : null}
      {curtain ? (
        <>
          <Box size={[0.36, h + 0.5, 0.08]} color={curtain} position={[-w / 2 - 0.12, -0.05, 0.12]} r={0.04} />
          <Box size={[0.36, h + 0.5, 0.08]} color={curtain} position={[w / 2 + 0.12, -0.05, 0.12]} r={0.04} />
        </>
      ) : null}
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ furniture
export const Desk: React.FC<T & { w?: number; d?: number; color?: string; drawers?: boolean; panel?: boolean }> = ({ w = 2.2, d = 1.0, color = "#b06a32", drawers = true, panel = true, ...t }) => (
  <G {...t}>
    {panel ? <Box size={[w - 0.1, 0.62, 0.05]} color={new THREE.Color(color).multiplyScalar(0.9).getStyle()} position={[0, 0.47, d / 2 - 0.06]} r={0.02} /> : null}
    <Box size={[w, 0.09, d]} color={color} position={[0, 0.82, 0]} r={0.03} map={paint.wood(color, 9, [1, 1])} />
    {drawers ? (
      <>
        <Box size={[0.75, 0.78, d * 0.92]} color={color} position={[w / 2 - 0.42, 0.39, 0]} r={0.03} />
        {[0.2, 0.42, 0.64].map((y) => (
          <Box key={y} size={[0.36, 0.05, 0.04]} color="#d8dde6" position={[w / 2 - 0.42, y, d * 0.47]} r={0.015} />
        ))}
      </>
    ) : null}
    <Box size={[0.08, 0.78, 0.08]} color={color} position={[-w / 2 + 0.08, 0.39, d / 2 - 0.08]} />
    <Box size={[0.08, 0.78, 0.08]} color={color} position={[-w / 2 + 0.08, 0.39, -d / 2 + 0.08]} />
  </G>
);

export const Laptop: React.FC<T & { screen?: string; tex?: THREE.Texture; open?: number; color?: string; sticker?: string | null }> = ({
  screen = "",
  tex,
  open = 1,
  color = "#d3d7de",
  sticker = "#ffcc33",
  ...t
}) => {
  const ang = -Math.PI / 2 + open * (Math.PI / 2 + 0.25);
  const map = tex ?? textBoard(screen || " ", { w: 1024, h: 640, bg: "#1f2a44", fg: "#7cf3a6", font: font("JetBrains Mono"), weight: 700, border: null, radius: 0 });
  return (
    <G {...t}>
      <Box size={[0.62, 0.035, 0.42]} color={color} position={[0, 0.018, 0]} r={0.012} />
      <group position={[0, 0.035, -0.2]} rotation={[ang, 0, 0]}>
        <Box size={[0.62, 0.42, 0.025]} color={color} position={[0, 0.21, 0]} r={0.012} />
        <mesh position={[0, 0.21, 0.0135]} material={unlit("#ffffff", map, 1.25)}>
          <planeGeometry args={[0.56, 0.36]} />
        </mesh>
        {sticker ? (
          <mesh position={[0.12, 0.26, -0.0135]} rotation={[0, Math.PI, 0]} material={toon(sticker)}>
            <circleGeometry args={[0.06, 20]} />
          </mesh>
        ) : null}
      </group>
    </G>
  );
};

export const Lamp: React.FC<T & { color?: string; on?: boolean }> = ({ color = "#2ab5b0", on = true, ...t }) => (
  <G {...t}>
    <Cyl r={0.13} h={0.05} color={color} />
    <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.3]} material={toon(color)} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.6, 10]} />
    </mesh>
    <mesh position={[0.18, 0.58, 0]} rotation={[0, 0, -0.9]} material={toon(color)} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.46, 10]} />
    </mesh>
    <mesh position={[0.36, 0.66, 0]} rotation={[0, 0, -2.2]} material={toon(color)} castShadow>
      <coneGeometry args={[0.16, 0.24, 20, 1, true]} />
    </mesh>
    {on ? (
      <mesh position={[0.4, 0.6, 0]} material={glow("#fff2c4", 5)}>
        <sphereGeometry args={[0.05, 12, 8]} />
      </mesh>
    ) : null}
  </G>
);

export const Plant: React.FC<T & { pot?: string; leaf?: string; size?: number }> = ({ pot = "#d9643a", leaf = "#3e9b4f", size = 1, ...t }) => (
  <G {...t} scale={size}>
    <Cyl r={0.2} rTop={0.24} h={0.36} color={pot} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <mesh key={i} position={[Math.cos(i * 0.9) * 0.08, 0.62, Math.sin(i * 0.9) * 0.08]} rotation={[Math.cos(i * 1.7) * 0.6, i * 0.9, Math.sin(i * 1.3) * 0.7]} material={toon(i % 2 ? leaf : new THREE.Color(leaf).multiplyScalar(0.85).getStyle())} castShadow>
        <coneGeometry args={[0.07, 0.6, 6]} />
      </mesh>
    ))}
  </G>
);

export const Bookshelf: React.FC<T & { w?: number; h?: number; color?: string }> = ({ w = 1.2, h = 1.8, color = "#7a4a2a", ...t }) => {
  const books = ["#e14b4b", "#3f7ad6", "#f2c14e", "#4cae6a", "#9b59b6", "#e67e22", "#1abc9c", "#ec6fa0"];
  return (
    <G {...t}>
      <Box size={[w, h, 0.38]} color={color} position={[0, h / 2, 0]} r={0.02} />
      {[0, 1, 2, 3].map((r) => (
        <group key={r} position={[0, 0.25 + r * (h / 4.2), 0.06]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Box key={i} size={[0.09, 0.3 + ((i * 7 + r) % 3) * 0.04, 0.26]} color={books[(i + r * 3) % books.length]} position={[-w / 2 + 0.12 + i * 0.11, 0.17, 0]} r={0.01} />
          ))}
        </group>
      ))}
    </G>
  );
};

export const Clock: React.FC<T & { time?: number }> = ({ time = 0.2, ...t }) => {
  const face = textBoard(" ", { w: 256, h: 256, bg: "#ffffff", border: "#1d1418", radius: 128 });
  return (
    <G {...t}>
      <mesh material={unlit("#ffffff", face)}>
        <circleGeometry args={[0.22, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} rotation={[0, 0, -time * Math.PI * 2]} material={unlit("#1d1418")}>
        <planeGeometry args={[0.02, 0.32]} />
      </mesh>
      <mesh position={[0, 0, 0.012]} rotation={[0, 0, -time * Math.PI * 24]} material={unlit("#1d1418")}>
        <planeGeometry args={[0.03, 0.22]} />
      </mesh>
    </G>
  );
};

export const Poster: React.FC<T & { text: string; bg?: string; fg?: string; w?: number; h?: number; sub?: string }> = ({ text, bg = "#1f2233", fg = "#ffcc33", w = 0.7, h = 1.0, sub, ...t }) => (
  <Board w={w} h={h} text={text} bg={bg} fg={fg} sub={sub} {...t} />
);

export const Chair: React.FC<T & { color?: string }> = ({ color = "#2b2f3a", ...t }) => (
  <G {...t}>
    <Box size={[0.5, 0.08, 0.5]} color={color} position={[0, 0.5, 0]} r={0.03} />
    <Box size={[0.5, 0.6, 0.08]} color={color} position={[0, 0.85, -0.22]} r={0.03} />
    <Cyl r={0.03} h={0.46} color="#55595f" position={[0, 0.04, 0]} />
  </G>
);

export const Table: React.FC<T & { w?: number; d?: number; color?: string; h?: number }> = ({ w = 1.6, d = 0.9, h = 0.78, color = "#c98a52", ...t }) => (
  <G {...t}>
    <Box size={[w, 0.07, d]} color={color} position={[0, h, 0]} r={0.02} />
    {[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([x, z], i) => (
      <Box key={i} size={[0.07, h, 0.07]} color={color} position={[(x * (w - 0.12)) / 2, h / 2, (z * (d - 0.12)) / 2]} />
    ))}
  </G>
);

export const Counter: React.FC<T & { w?: number; color?: string; top?: string }> = ({ w = 3, color = "#2bb3c0", top = "#f4efe6", ...t }) => (
  <G {...t}>
    <Box size={[w, 1.0, 0.7]} color={color} position={[0, 0.5, 0]} r={0.04} />
    <Box size={[w + 0.1, 0.06, 0.8]} color={top} position={[0, 1.02, 0]} r={0.02} />
  </G>
);

export const Monitor: React.FC<T & { text?: string; tex?: THREE.Texture; w?: number; h?: number; bg?: string; fg?: string }> = ({ text = "", tex, w = 1.6, h = 0.95, bg = "#14213d", fg = "#ffffff", ...t }) => (
  <G {...t}>
    <Box size={[w + 0.12, h + 0.12, 0.08]} color="#1d1f26" r={0.03} />
    <Board w={w} h={h} text={text} tex={tex} bg={bg} fg={fg} border={null} glowK={1.2} position={[0, 0, 0.045]} />
  </G>
);

// ------------------------------------------------------------------------------------------------ outdoor
export const Ground: React.FC<T & { size?: number; kind?: "grass" | "concrete" | "tiles" | "sand" | "road"; color?: string }> = ({ size = 60, kind = "grass", color, ...t }) => {
  const map =
    kind === "grass"
      ? paint.grass(color ?? "#59b83d", 3, [size / 6, size / 6])
      : kind === "tiles"
        ? paint.tiles("#f3e2b8", "#e8cf98", 8, [size / 4, size / 4])
        : kind === "sand"
          ? paint.concrete(color ?? "#e9c98f", 7, [size / 6, size / 6])
          : paint.concrete(color ?? "#9aa0a8", 5, [size / 6, size / 6]);
  return (
    <G {...t}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={toon("#ffffff", { map })}>
        <planeGeometry args={[size, size]} />
      </mesh>
    </G>
  );
};

export const Road: React.FC<T & { len?: number; w?: number }> = ({ len = 60, w = 6, ...t }) => (
  <G {...t}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow material={toon("#3b4252")}>
      <planeGeometry args={[w, len]} />
    </mesh>
    {Array.from({ length: Math.floor(len / 3) }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -len / 2 + 1.5 + i * 3]} material={toon("#e8e3d6")}>
        <planeGeometry args={[0.18, 1.4]} />
      </mesh>
    ))}
    <Box size={[0.35, 0.18, len]} color="#c9c2b4" position={[-w / 2 - 0.17, 0.09, 0]} r={0.02} />
    <Box size={[0.35, 0.18, len]} color="#c9c2b4" position={[w / 2 + 0.17, 0.09, 0]} r={0.02} />
  </G>
);

export const Building: React.FC<T & { w?: number; h?: number; d?: number; color?: string; roof?: string; windows?: boolean; lit?: boolean; sign?: string; signBg?: string; signFg?: string }> = ({
  w = 5,
  h = 7,
  d = 4,
  color = "#e9a66a",
  roof = "#8a3b2e",
  windows = true,
  lit = false,
  sign,
  signBg = "#1b1b22",
  signFg = "#ffcc33",
  ...t
}) => {
  const cols = Math.max(1, Math.floor(w / 1.3));
  const rows = Math.max(1, Math.floor((h - 1.2) / 1.6));
  return (
    <G {...t}>
      <Box size={[w, h, d]} color={color} position={[0, h / 2, 0]} r={0.06} />
      <Box size={[w + 0.3, 0.3, d + 0.3]} color={roof} position={[0, h + 0.15, 0]} r={0.05} />
      {windows
        ? Array.from({ length: rows * cols }).map((_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const on = lit && (i * 7) % 3 !== 0;
            return (
              <mesh key={i} position={[-w / 2 + (w / cols) * (c + 0.5), 1.6 + r * 1.6, d / 2 + 0.01]} material={on ? glow("#ffd98a", 1.8) : unlit("#86b7e8", null, 0.95)}>
                <planeGeometry args={[0.7, 0.9]} />
              </mesh>
            );
          })
        : null}
      {sign ? <Board w={Math.min(w * 0.9, 4.4)} h={0.9} text={sign} bg={signBg} fg={signFg} position={[0, h - 0.8, d / 2 + 0.06]} /> : null}
    </G>
  );
};

export const StreetLamp: React.FC<T & { on?: boolean; h?: number }> = ({ on = true, h = 4.2, ...t }) => (
  <G {...t}>
    <Cyl r={0.07} h={h} color="#2b2f3a" />
    <Box size={[0.7, 0.08, 0.08]} color="#2b2f3a" position={[0.3, h, 0]} />
    <mesh position={[0.6, h - 0.12, 0]} material={on ? glow("#ffe7a8", 4.5) : toon("#dddddd")}>
      <sphereGeometry args={[0.14, 14, 10]} />
    </mesh>
  </G>
);

export const Tree: React.FC<T & { leaf?: string; trunk?: string; size?: number }> = ({ leaf = "#3f9e4a", trunk = "#7a4a2a", size = 1, ...t }) => (
  <G {...t} scale={size}>
    <Cyl r={0.16} rTop={0.11} h={1.6} color={trunk} />
    <Ball r={0.95} color={leaf} position={[0, 2.2, 0]} />
    <Ball r={0.7} color={new THREE.Color(leaf).multiplyScalar(1.08).getStyle()} position={[0.55, 1.95, 0.2]} />
    <Ball r={0.65} color={new THREE.Color(leaf).multiplyScalar(0.92).getStyle()} position={[-0.55, 2.0, -0.1]} />
  </G>
);

export const Fence: React.FC<T & { len?: number; color?: string }> = ({ len = 6, color = "#f4efe6", ...t }) => (
  <G {...t}>
    {Array.from({ length: Math.floor(len / 0.5) + 1 }).map((_, i) => (
      <Box key={i} size={[0.1, 0.9, 0.06]} color={color} position={[-len / 2 + i * 0.5, 0.45, 0]} r={0.02} />
    ))}
    <Box size={[len, 0.08, 0.05]} color={color} position={[0, 0.65, 0.04]} />
    <Box size={[len, 0.08, 0.05]} color={color} position={[0, 0.3, 0.04]} />
  </G>
);

/** Flat cartoon cloud card (never inked: put on the far background). */
export const Cloud: React.FC<T & { w?: number }> = ({ w = 6, ...t }) => {
  const map = React.useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ffffff";
    for (const [x, y, r] of [
      [140, 160, 80],
      [240, 120, 100],
      [350, 150, 85],
      [420, 175, 60],
      [90, 185, 50],
    ])
      g.beginPath(), g.arc(x, y, r, 0, Math.PI * 2), g.fill();
    g.fillRect(90, 160, 340, 75);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <G {...t}>
      <mesh layers={3} material={new THREE.MeshBasicMaterial({ map, transparent: true, fog: false, depthWrite: false, color: new THREE.Color(1.05, 1.05, 1.08) })}>
        <planeGeometry args={[w, w / 2]} />
      </mesh>
    </G>
  );
};

// ------------------------------------------------------------------------------------------------ money & loot
export const Coin: React.FC<T & { color?: string }> = ({ color = "#ffbf2e", ...t }) => (
  <G {...t}>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={toon(color)} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.03, 20]} />
    </mesh>
  </G>
);

export const Bill: React.FC<T> = (t) => (
  <G {...t}>
    <Box size={[0.32, 0.012, 0.15]} color="#6fbf5b" r={0.004} />
  </G>
);

export const Crate: React.FC<T & { size?: number; color?: string; label?: string }> = ({ size = 0.8, color = "#c88b4a", label, ...t }) => (
  <G {...t}>
    <Box size={[size, size, size]} color={color} position={[0, size / 2, 0]} r={0.04} map={paint.wood(color, 21, [1, 1])} />
    {label ? <Board w={size * 0.8} h={size * 0.35} text={label} bg="#f4efe6" fg="#1b1b1f" position={[0, size / 2, size / 2 + 0.01]} /> : null}
  </G>
);

export const Podium: React.FC<T & { place?: 1 | 2 | 3; color?: string }> = ({ place = 1, color = "#ffcc33", ...t }) => {
  const h = place === 1 ? 1.0 : place === 2 ? 0.7 : 0.5;
  return (
    <G {...t}>
      <Box size={[1.2, h, 1.0]} color={color} position={[0, h / 2, 0]} r={0.05} />
      <Board w={0.5} h={0.5} text={String(place)} bg={color} fg="#1b1b1f" border={null} position={[0, h * 0.55, 0.51]} />
    </G>
  );
};

export const RopeBarrier: React.FC<T & { len?: number; rope?: string }> = ({ len = 2.4, rope = "#c0392b", ...t }) => {
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-len / 2, 0.85, 0), new THREE.Vector3(0, 0.55, 0), new THREE.Vector3(len / 2, 0.85, 0));
  return (
    <G {...t}>
      {[-len / 2, len / 2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Cyl r={0.16} h={0.06} color="#d4a017" />
          <Cyl r={0.04} h={0.9} color="#d4a017" />
          <Ball r={0.07} color="#d4a017" position={[0, 0.94, 0]} />
        </group>
      ))}
      <mesh material={toon(rope)} castShadow>
        <tubeGeometry args={[curve, 24, 0.035, 8, false]} />
      </mesh>
    </G>
  );
};

export const VaultDoor: React.FC<T & { open?: number }> = ({ open = 0, ...t }) => (
  <G {...t}>
    <mesh material={toon("#8e959e")} castShadow receiveShadow>
      <torusGeometry args={[1.5, 0.25, 16, 48]} />
    </mesh>
    <group position={[1.5, 0, 0.1]} rotation={[0, -open * 1.9, 0]}>
      <mesh position={[-1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon("#c9ced6")} castShadow>
        <cylinderGeometry args={[1.38, 1.38, 0.35, 40]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[-1.5 + Math.cos(i) * 0.5, Math.sin(i) * 0.5, 0.2]} rotation={[0, 0, i]} material={toon("#6b737d")}>
          <boxGeometry args={[0.7, 0.08, 0.08]} />
        </mesh>
      ))}
    </group>
  </G>
);

export const ServerRack: React.FC<T & { lights?: number }> = ({ lights = 0.5, ...t }) => (
  <G {...t}>
    <Box size={[0.8, 2.0, 0.7]} color="#2b2f3a" position={[0, 1, 0]} r={0.03} />
    {Array.from({ length: 8 }).map((_, i) => (
      <group key={i} position={[0, 0.3 + i * 0.22, 0.36]}>
        <Box size={[0.7, 0.16, 0.02]} color="#3c4250" r={0.01} />
        <mesh position={[0.26, 0, 0.02]} material={glow(i % 3 === 0 ? "#ff5a5a" : "#4dff9a", 1 + lights * 3)}>
          <circleGeometry args={[0.025, 10]} />
        </mesh>
      </group>
    ))}
  </G>
);

export const Car: React.FC<T & { color?: string }> = ({ color = "#e14b4b", ...t }) => (
  <G {...t}>
    <Box size={[2.2, 0.55, 1.1]} color={color} position={[0, 0.5, 0]} r={0.15} />
    <Box size={[1.2, 0.45, 1.0]} color={color} position={[-0.1, 0.95, 0]} r={0.12} />
    <mesh position={[-0.1, 0.97, 0.505]} material={unlit("#a9d6ff", null, 1)}>
      <planeGeometry args={[1.0, 0.32]} />
    </mesh>
    {[
      [-0.7, -0.56],
      [0.7, -0.56],
      [-0.7, 0.56],
      [0.7, 0.56],
    ].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.24, z]} rotation={[Math.PI / 2, 0, 0]} material={toon("#25262b")} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.18, 18]} />
      </mesh>
    ))}
  </G>
);

export const Mountain: React.FC<T & { color?: string; snow?: boolean; h?: number }> = ({ color = "#8aa0c8", snow = true, h = 8, ...t }) => (
  <G {...t}>
    <mesh position={[0, h / 2, 0]} material={toon(color)}>
      <coneGeometry args={[h * 0.9, h, 6]} />
    </mesh>
    {snow ? (
      <mesh position={[0, h * 0.86, 0]} material={toon("#f4f6fb")}>
        <coneGeometry args={[h * 0.25, h * 0.28, 6]} />
      </mesh>
    ) : null}
  </G>
);
