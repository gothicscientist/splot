# StickWorld kit: 2D cast in a toon 3D world

The MotionLab / viral "stick figures in a colourful 3D world" look: flat 2D cartoon people (big white round heads, dot
eyes, bean-shaped coloured bodies with thick ink outlines, stick limbs) standing in toon-shaded 3D sets with ink
outlines, depth of field, gliding cameras. Look values: `stickworld-bible.md`. Proven example (read it before writing a
new one): `src/videos/eiffel-tower-con/index.tsx`.

## Imports
```tsx
import { Reel } from "../../core/Reel";
import { useShot } from "../../core/timeline";
import { Stage } from "../../core/three/Stage";                       // one 3D set per shot
import { Rain, Burst3D } from "../../core/three/particles";           // bills/coins/confetti/papers/leaves/snow/gems/sparks
import { Stamp, Tag, Counter, Bubble, Mark, Burst, Arrow, FlashFX, FXLayer } from "../../core/fx2d";
import { Stick } from "../../styles/stickworld/Stick";
import { CAST } from "../../styles/stickworld/cast";
import type { StickSpec } from "../../styles/stickworld/draw";
import { Room, Window, Desk, Laptop, Lamp, Plant, Bookshelf, Clock, Poster, Chair, Table, Counter as ShopCounter, Monitor,
         Ground, Road, Building, StreetLamp, Tree, Fence, Cloud, Coin, Bill, Crate, Podium, RopeBarrier, VaultDoor,
         ServerRack, Car, Mountain, Board, Box, Cyl, Ball } from "../../styles/stickworld/props";
import { EiffelTower, Newspaper, Easel, Chandelier, Suitcase, Train, Platform, Phone, FileDrawer, Ship, Water,
         PoliceLight, CafeTable, Cup, Awning, LampPost } from "../../styles/stickworld/props2";
```

## A shot
```tsx
const S03: React.FC = () => {
  const s = useShot();                       // word clock for this shot
  const gov = s.hit("government");           // 2 frames before the word
  return (
    <AbsoluteFill>
      <Stage look="interior"                 // day golden overcast dawn dusk night interior alarm studio
        cam={[                               // keys in shot-local frames; every hold creeps forward
          { f: 0, pos: [1.2, 1.9, 3.4], look: [0, 1.05, 0.2], fov: 36 },
          { f: gov + 8, pos: [0.15, 1.6, 1.25], look: [0, 0.88, 0.42], fov: 32, ease: "burst", dur: 10 },
        ]}
        kicks={[gov + 2]}                    // impact shakes
        dof={(f) => (f >= gov ? 13 : 8)}     // px at 1080: CU 12-16, MS 10-12, wide 0-5
        focus={[0, 0.9, 0.4]}
        shadow={{ center: [0, 0, 0], size: 6 }}>
        <Room w={7} d={6} h={3.4} wall="#2f5d50" wallTex="plain" floor="wood" position={[0, 0, -1]} />
        <Desk position={[0, 0, 0.35]} />
        <Stick spec={CAST.lead} at={[0, 0.1, -0.35]}
          poses={[[0, "typing"], [gov, "handsHips"]]}
          faces={[[0, "determined"], [gov, "smug"]]} />
      </Stage>
      <FXLayer><Stamp at={gov} x={540} y={760} text="OFFICIAL" color="#22305a" /></FXLayer>
    </AbsoluteFill>
  );
};
```

## Characters: `<Stick>`
| prop | meaning |
|---|---|
| `spec` | `StickSpec` (below) or a `CAST.*` preset |
| `at` / `path` | feet position, or `[[frame, [x,y,z]], ...]` keys; moving between keys plays a planted walk (or `run`) |
| `poses` | `[[frame, poseName \| Pose], ...]`; blends over 6 f with a small overshoot |
| `faces` | `[[frame, faceName \| Face], ...]`; switches instantly with a 2-frame squash |
| `items` | `[[frame, { kind, hand?: "L"\|"R", text?, color? } \| null], ...]` hand props |
| `talking` | `s.speaking(["b04"])` lip flap on dialogue lines |
| `facing` | `"left"`, `"right"` or `"auto"` (from movement) |
| `pop` / `gone` | squash-stretch entrance frame / exit frame |
| `height`, `scale`, `lean`, `shadow`, `seed` | card height (default 2.2 m adult = a 1.72 m person; kid 1.55), etc. |

Heads sit at ~1.43 m (adult), ~1.0 m (kid). Aim close-ups at y 1.4-1.5 from 1.3-2 m; two-shots need >= 4 m.

`StickSpec`: `body` (torso colour), `outfit` tee|hoodie|suit|dress|lab|uniform|jacket|robe|armor, `accent` (tie/trim),
`text` (chest print, e.g. "FBI"), `hair` none|short|side|spiky|curly|bun|long|mohawk|bob|ponytail|slick|bald, `hairColor`,
`hat` none|cap|beanie|hood|tophat|helmet|crown|chef|cowboy|hardhat|police|grad|headband, `hatColor`, `hatText`,
`glasses` none|round|square|shades, `mustache`, `beard`, `nose` none|dot|big|red, `mask` (hooded villain), `build`
adult|kid|tall|stout, `legColor`, `shoes`, `seed`.

CAST presets: lead, leadF, recruiter, boss, suit, hacker, hackerRed, hackerGreen, agent, cop, scientist, doctor, worker,
chef, kid, girl, grandpa, king, knight, peasant, soldier, cowboy, student, grad, customerA/B/C.
**Keep one recurring lead per channel** (top channels all have one) - copy its spec into the video and reuse it.

Poses: idle relaxed handsHips wave waveB point pointUp pointDown pointAcross present presentBoth shrug armsUp cheer
facepalm think headScratch typing holdFront holdOne carry scared crossArms salute sneak sit fall dance1 dance2 bow
victory phone readPhone (+ automatic walk/run cycles). Arm angles: 0 = down, 90 = straight out, 180 = up.

Faces: neutral happy grin joy smug shocked scared panic sad crying angry furious worried thinking confused sleepy
determined evil love starstruck dead dizzy unimpressed nervousSmile, or a custom
`{ eyes, mouth, brows, extras: ["sweat","blush","tears","anger","sparkle","shock","question","zzz"] }`.

Items: cup phone magnifier bag sign briefcase laptop pen pointer flag trophy money coin book sword torch wrench mic.

## Sets and props
Units are metres, y = 0 floor. Rooms are three-sided and open toward +z (put the camera at +z).
`Board` / `Poster` / `Monitor` / `Newspaper` / `Easel` print text (unlit, always readable); signs in the world beat
2D overlays for anything the characters "own" (shop signs, screens, price boards).
Re-use one `ParisSet`-style function per location so continuous shots share a world; to "cut" between two places
inside one shot, build both sets side by side (x 0 and x 12) and whip the camera across (see S08 of the example).

## Screen FX (`core/fx2d`, px at 1080x1920)
Stamp (slam + kick), Tag (pill label), Counter (spins up: `from`, `to`, `prefix`, `suffix`, `label`), Bubble
(speech/thought), Mark (check/cross), Burst (comic POW), Arrow (draw-on), FlashFX (colour flash). All take `at`
(and `out`). Keep them in y 300-1000 (captions own y 1100-1350; TikTok's right rail is x > 900, y > 840).

## Particles (3D)
`<Rain kind="bills" at={s.hit("money")} count={160} center={[0,0,0]} half={[3,2]} height={6} />` piles up on the floor;
`<Burst3D kind="confetti" at={...} origin={[0,1,0]} />` pops out of a point. Kinds: bills coins confetti papers leaves
snow gems sparks.

## Readability traps (fix on sight)
- A face in the caption band or cut by the frame edge; a foreground prop closer than ~2 m to the lens (huge blob).
- A character smaller than ~1/5 of the frame height in a shot about that character.
- Background busier than the subject; a sign lit from the side (use Board, it is unlit).
- Lattice / fence / railing crossing a face (move the lens up or the prop away).
- Two characters in a two-shot closer than 4 m to the camera (they won't both fit in 9:16).
