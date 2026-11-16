// Shared Tiff world for the pileGo! reels: her bedroom, the clothes-pile chair, marketplace boards and the pileGo! sign.
// Units are metres (y = 0 floor); the room is open toward +z (camera side).
import React from "react";
import { Room, Desk, Laptop, Plant, Poster, Chair, Box, Board, Lamp, Clock, Cyl, Ball, Window, Ground, Building, Tree, Cloud, Monitor } from "../../styles/stickworld/props";
import { CafeTable, Cup, Awning, LampPost } from "../../styles/stickworld/props2";
import type { Vec3 } from "../../core/types";

export const BRAND = { bg: "#161813", cream: "#f2efe4", sage: "#a8c68a", tag: "#f2c94c" };

// marketplaces pileGo! lists to (names only, plain boards, no logos)
export const APPS: { name: string; color: string }[] = [
  { name: "eBay", color: "#e53238" },
  { name: "Vinted", color: "#09b1ba" },
  { name: "Depop", color: "#ff2300" },
  { name: "Poshmark", color: "#7f0353" },
  { name: "Mercari", color: "#4dc9ff" },
  { name: "Grailed", color: "#111111" },
];

// clothes in the pile, bottom to top: [w, h, d, colour, x, z, rotY]
const PILE: [number, number, number, string, number, number, number][] = [
  [0.62, 0.09, 0.5, "#3f6fb5", 0, 0, 0.1], // jeans
  [0.58, 0.1, 0.48, "#6b7a3a", 0.02, -0.02, -0.25], // olive jacket
  [0.55, 0.08, 0.46, "#e98aa6", -0.03, 0.02, 0.35], // pink sweater
  [0.5, 0.07, 0.44, "#f3f0e8", 0.04, 0, -0.1], // white tee
  [0.6, 0.11, 0.5, "#2c2c34", -0.02, 0.01, 0.2], // black hoodie
  [0.52, 0.08, 0.42, "#e8b04a", 0.03, -0.03, -0.4], // mustard cardigan
  [0.48, 0.09, 0.44, "#7a4fb0", -0.01, 0.02, 0.15], // purple dress
  [0.56, 0.08, 0.46, "#c94a3a", 0.02, 0, -0.2], // red flannel
  [0.46, 0.07, 0.4, "#9ad0e6", 0, 0.01, 0.3], // light blue shirt
];

/** The clothes pile. amount 0..1 = how many layers are still there (shrinks from the top). */
export const ClothesPile: React.FC<{ position?: Vec3; amount?: number; sneakers?: boolean; top?: string }> = ({ position = [0, 0, 0], amount = 1, sneakers = true, top }) => {
  const n = Math.round(PILE.length * Math.max(0, Math.min(1, amount)));
  let y = 0;
  return (
    <group position={position}>
      {PILE.slice(0, n).map(([w, h, d, c, x, z, r], i) => {
        const yy = y + h / 2;
        y += h * 0.86;
        return <Box key={i} size={[w, h, d]} color={c} position={[x, yy, z]} rotation={[0, r, (i % 2 ? 0.04 : -0.04)]} r={0.035} />;
      })}
      {top ? <Box size={[0.6, 0.13, 0.5]} color={top} position={[0, y + 0.07, 0.02]} rotation={[0, -0.15, 0.03]} r={0.05} /> : null}
      {sneakers && !top && n >= PILE.length - 1 ? (
        <group position={[0.12, y + 0.05, 0.05]} rotation={[0, 0.5, 0.15]}>
          <Box size={[0.3, 0.11, 0.12]} color="#f2c94c" r={0.04} />
          <Box size={[0.3, 0.03, 0.13]} color="#ffffff" position={[0, -0.06, 0]} r={0.012} />
        </group>
      ) : null}
    </group>
  );
};

/** The famous chair, with the pile on its seat. */
export const PileChair: React.FC<{ position?: Vec3; amount?: number; top?: string }> = ({ position = [0, 0, 0], amount = 1, top }) => (
  <group position={position}>
    <Chair color="#c98a52" />
    <ClothesPile position={[0, 0.55, 0.02]} amount={amount} top={top} />
  </group>
);

/** Tiff's bedroom. Chair at x -0.6, desk + laptop at x 1.7, bed at x -2.4. */
export const TiffRoom: React.FC<{ pile?: number; night?: boolean; laptop?: string; chair?: boolean; top?: string }> = ({ pile = 1, night = false, laptop = "", chair = true, top }) => (
  <>
    <Room w={8} d={6.5} h={3.3} wall={night ? "#8f86b8" : "#f2c7d3"} wallTex="plain" baseboard="#ffffff" floor="wood" floorColor="#c9925c" window={null} position={[0, 0, -1.2]} />
    <Window kind={night ? "night" : "day"} w={1.3} h={1.4} curtain="#a8c68a" position={[-2.3, 1.75, -4.4]} />
    {/* bed */}
    <Box size={[1.6, 0.42, 2.1]} color="#ffffff" position={[-2.7, 0.21, -2.5]} r={0.08} />
    <Box size={[1.62, 0.12, 1.4]} color="#a8c68a" position={[-2.7, 0.48, -2.1]} r={0.05} />
    <Box size={[0.7, 0.16, 0.42]} color="#fff6f0" position={[-2.7, 0.52, -3.25]} r={0.07} />
    {chair ? <PileChair position={[-0.6, 0, -1.6]} amount={pile} top={top} /> : null}
    <Desk position={[1.8, 0, -3.2]} w={1.8} d={0.8} color="#f3efe6" drawers={false} />
    <Laptop position={[1.8, 0.87, -3.25]} screen={laptop} />
    <Lamp position={[2.45, 0.87, -3.35]} color="#a8c68a" />
    <Plant position={[3.3, 0, -3.5]} size={1.1} />
    <Poster text="SELL IT" sub="(someday)" bg="#161813" fg="#f2efe4" w={0.6} h={0.78} position={[3.2, 1.9, -4.42]} />
    <Clock position={[-1.2, 2.45, -4.42]} time={night ? 0.0 : 0.4} />
  </>
);

/** A marketplace listing board: name strip + the listing line (e.g. "Olive jacket  $45"). */
export const AppBoard: React.FC<{ app: { name: string; color: string }; line?: string; position?: Vec3; w?: number; sold?: boolean; dim?: boolean; rotation?: Vec3 }> = ({
  app,
  line = "Olive jacket  $45",
  position = [0, 0, 0],
  w = 0.9,
  sold = false,
  dim = false,
  rotation,
}) => (
  <group position={position} rotation={rotation}>
    <Box size={[w + 0.08, w * 0.62 + 0.08, 0.05]} color={sold ? "#2f8f4f" : dim ? "#8a8a8a" : app.color} position={[0, 0, -0.04]} r={0.04} />
    <Board w={w} h={w * 0.2} text={app.name} bg={app.color} fg="#ffffff" border={null} position={[0, w * 0.21, 0]} />
    <Board w={w} h={w * 0.4} text={sold ? "SOLD" : line} bg={sold ? "#e9f7ec" : "#ffffff"} fg={sold ? "#1f7a3a" : "#1b1b1f"} border={null} position={[0, -w * 0.1, 0]} />
  </group>
);

/** The pileGo! sign (brand colours). */
export const PileGoBoard: React.FC<{ position?: Vec3; w?: number; sub?: string }> = ({ position = [0, 0, 0], w = 1.6, sub = "Clear the pile. Keep the cash." }) => (
  <group position={position}>
    <Box size={[w + 0.1, w * 0.42 + 0.1, 0.06]} color={BRAND.sage} position={[0, 0, -0.05]} r={0.05} />
    <Board w={w} h={w * 0.42} text="pileGo!" sub={sub} bg={BRAND.bg} fg={BRAND.cream} fontName="Poppins" border={null} glowK={1.15} />
  </group>
);

/** A jacket on a hanger stand, with a price tag (default: the olive one, $45). */
export const JacketStand: React.FC<{ position: Vec3; color?: string; shade?: string; price?: string; tag?: boolean }> = ({ position, color = "#6b7a3a", shade = "#5d6a32", price = "$45", tag = true }) => (
  <group position={position}>
    <Cyl r={0.22} h={0.04} color="#3a3a42" />
    <Cyl r={0.025} h={1.62} color="#3a3a42" />
    <Box size={[0.5, 0.03, 0.03]} color="#c9a46a" position={[0, 1.55, 0.02]} rotation={[0, 0, 0]} r={0.01} />
    <Box size={[0.46, 0.62, 0.14]} color={color} position={[0, 1.22, 0.04]} r={0.05} />
    <Box size={[0.12, 0.56, 0.12]} color={shade} position={[-0.29, 1.2, 0.04]} rotation={[0, 0, 0.1]} r={0.05} />
    <Box size={[0.12, 0.56, 0.12]} color={shade} position={[0.29, 1.2, 0.04]} rotation={[0, 0, -0.1]} r={0.05} />
    <Box size={[0.14, 0.2, 0.02]} color="#f3f0e8" position={[0, 1.44, 0.115]} rotation={[0, 0, Math.PI / 4]} r={0.005} />
    <Box size={[0.02, 0.5, 0.02]} color={shade} position={[0, 1.18, 0.115]} r={0.005} />
    {tag ? <Board w={0.16} h={0.1} text={price} bg="#f2c94c" fg="#1b1b1f" position={[0.16, 0.95, 0.125]} rotation={[0, 0, -0.2]} /> : null}
  </group>
);

/** Cafe terrace for the date story: table at (0, 0, -2.2), cafe front behind. */
export const CafeSet: React.FC<{ cups?: boolean }> = ({ cups = true }) => (
  <>
    <Ground size={80} kind="tiles" />
    <Building position={[0, 0, -7.5]} w={9} h={6} d={4} color="#f3e3c7" roof="#6f7f99" sign="CAFE" signBg="#2f5d50" signFg="#f4efe6" />
    <Awning position={[0, 2.7, -5.3]} w={6} a="#2f5d50" b="#f4efe6" />
    <Building position={[-8.5, 0, -8]} w={7} h={8} d={5} color="#e9cfd6" roof="#6f7f99" />
    <Building position={[8.5, 0, -8]} w={7} h={7} d={5} color="#d9e4c8" roof="#6f7f99" />
    <Tree position={[-3.8, 0, -4.6]} size={1.1} />
    <Tree position={[3.9, 0, -4.8]} size={1.0} leaf="#4aa356" />
    <LampPost position={[2.6, 0, -3.6]} />
    <CafeTable position={[0, 0, -2.2]} cloth="#a8c68a" />
    {cups ? (
      <>
        <Cup position={[-0.18, 0.77, -2.15]} color="#ffffff" />
        <Cup position={[0.2, 0.77, -2.25]} color="#f2c94c" />
      </>
    ) : null}
    <Cloud position={[-14, 18, -50]} w={16} />
    <Cloud position={[12, 22, -60]} w={20} />
  </>
);

/** The ex's apartment (placed at x = 12 so a whip can cut between the two rooms in one shot). */
export const ExRoom: React.FC<{ position?: Vec3 }> = ({ position = [12, 0, 0] }) => (
  <group position={position}>
    <Room w={8} d={6.5} h={3.3} wall="#7f93a8" wallTex="plain" baseboard="#ffffff" floor="concrete" window={null} position={[0, 0, -1.2]} />
    <Desk position={[0.9, 0, -3.2]} w={1.8} d={0.8} color="#3a3a42" drawers={false} />
    <Monitor position={[0.9, 1.35, -3.4]} w={0.9} h={0.55} text="GAME" bg="#14213d" fg="#ffffff" />
    <Poster text="GYM" bg="#d62f3a" fg="#ffffff" w={0.6} h={0.8} position={[2.6, 2.0, -4.42]} />
    {/* his bed */}
    <Box size={[1.7, 0.42, 2.1]} color="#3a3a42" position={[-1.6, 0.21, -2.9]} r={0.08} />
    <Box size={[1.72, 0.12, 1.5]} color="#5b6b8a" position={[-1.6, 0.48, -2.5]} r={0.05} />
    <Box size={[0.7, 0.16, 0.42]} color="#e8e8ee" position={[-1.6, 0.52, -3.6]} r={0.07} />
  </group>
);

/** Friendsgiving: a warm dining room with a standing-height harvest table (centre z -2.0), turkey, pie, candles and
 *  string lights. Everyone stands behind the table (the anime kit has no seated pose). */
export const DinnerSet: React.FC<{ turkey?: boolean; door?: boolean; table?: boolean }> = ({ turkey = true, door = true, table = true }) => (
  <>
    <Room w={9} d={6.5} h={3.3} wall="#e8b98a" wallTex="plain" baseboard="#ffffff" floor="wood" floorColor="#8f5a36" window={null} position={[0, 0, -1.2]} />
    <Window kind="night" w={1.2} h={1.3} curtain="#c94a3a" position={[-2.6, 1.8, -4.4]} />
    {door ? (
      <group position={[3.1, 0, -4.38]}>
        <Box size={[1.0, 2.15, 0.06]} color="#7a4a2a" position={[0, 1.075, 0]} r={0.02} />
        <Ball r={0.04} color="#e2b23c" position={[0.36, 1.05, 0.05]} />
      </group>
    ) : null}
    {/* string lights */}
    {Array.from({ length: 13 }, (_, i) => (
      <Ball key={i} r={0.045} color={i % 3 === 0 ? "#ffd27a" : i % 3 === 1 ? "#ff9f6a" : "#fff1c2"} position={[-3.6 + i * 0.6, 2.95 - Math.sin((i / 12) * Math.PI) * 0.25, -4.3]} />
    ))}
    {table ? (
      <>
    <Box size={[2.6, 0.08, 1.1]} color="#f4ead8" position={[0, 0.94, -2.0]} r={0.02} />
    <Box size={[2.5, 0.9, 1.0]} color="#7a4a2a" position={[0, 0.45, -2.0]} r={0.03} />
    {turkey && table ? (
      <group position={[0, 0.98, -2.0]}>
        <Cyl r={0.36} h={0.03} color="#ffffff" />
        <Ball r={0.2} color="#b5652e" position={[0, 0.14, 0]} />
        <Ball r={0.06} color="#f3e3c7" position={[-0.2, 0.2, 0.05]} />
        <Ball r={0.06} color="#f3e3c7" position={[0.2, 0.2, 0.05]} />
      </group>
    ) : null}
    <Cyl r={0.17} h={0.06} color="#d98b3a" position={[-0.8, 1.0, -1.85]} />
    <Cyl r={0.12} h={0.09} color="#6b8f3a" position={[0.82, 1.0, -1.9]} />
    <Cyl r={0.03} h={0.26} color="#fff6e6" position={[-0.45, 1.11, -2.25]} />
    <Cyl r={0.03} h={0.26} color="#fff6e6" position={[0.45, 1.11, -2.25]} />
      </>
    ) : null}
    <Poster text="THANKFUL" sub="(mostly)" bg="#7a1f24" fg="#f2efe4" w={0.9} h={0.6} position={[-0.6, 2.1, -4.42]} />
    <Plant position={[-3.6, 0, -3.6]} size={1.0} />
  </>
);

/** Leo's living room: grey couch against the back wall, rug, floor lamp, record poster. */
export const CouchRoom: React.FC<{ position?: Vec3 }> = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    <Room w={8} d={6.5} h={3.3} wall="#b8c4b0" wallTex="plain" baseboard="#ffffff" floor="wood" floorColor="#a87a52" window={null} position={[0, 0, -1.2]} />
    <Box size={[2.6, 0.45, 0.9]} color="#6f7480" position={[0, 0.3, -3.6]} r={0.08} />
    <Box size={[2.6, 0.7, 0.25]} color="#646974" position={[0, 0.75, -3.95]} r={0.08} />
    <Box size={[0.28, 0.6, 0.9]} color="#646974" position={[-1.3, 0.45, -3.6]} r={0.08} />
    <Box size={[0.28, 0.6, 0.9]} color="#646974" position={[1.3, 0.45, -3.6]} r={0.08} />
    <Box size={[3.0, 0.02, 2.0]} color="#d9c9a8" position={[0, 0.01, -2.4]} r={0.01} />
    <Lamp position={[-2.2, 0, -3.8]} color="#e2b23c" />
    <Poster text="VINYL" sub="NIGHT" bg="#1b1b1f" fg="#e2b23c" w={0.62} h={0.82} position={[2.3, 1.95, -4.42]} />
    <Plant position={[2.9, 0, -3.6]} size={0.9} />
  </group>
);
