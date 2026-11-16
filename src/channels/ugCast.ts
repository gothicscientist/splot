// Real underground artists for ug-rap bio / scene episodes, drawn as themselves (owner decision 2026-11-16).
// Every entry comes from the "## Look sheet" in that episode's videos/<slug>/research.md (traits seen in dated public
// photos of the era) and is checked against those photos before scenes are written (skills/reel/references/modes/
// ug-rap.md, "Drawing the real artist"). StickWorld cartoon only: no photo textures, no logos or printed artwork on
// their clothes, never in a pileGo! plug shot, never voiced. Scenario episodes use SCENE_CAST, never these.
import type { StickSpec } from "../styles/stickworld/draw";

/** fakemink (look sheet: videos/ug-01-fakemink/research.md) */
const fakeminkStage: StickSpec = {
  // skullet (cropped top, faded sides, longer back), thin moustache + goatee,
  // tan padded gilet with a thick cream fur collar over a white shirt, dark baggy jeans
  body: "#b39a74",
  outfit: "gilet",
  accent: "#efe6d4",
  hair: "skullet",
  hairColor: "#221a16",
  goatee: "#2a211c",
  sleeves: "#f4f4f0",
  pants: { kind: "baggy", color: "#2a2e3a" },
  boots: "chunky",
  shoes: "#141418",
  seed: 61,
};

export const UG_CAST = {
  fakemink: {
    /** the 2025-26 on-stage / press look (the fur-collar gilet photo) */
    stage: fakeminkStage,
    /** the lookbook fit change: same person, a dark denim jacket */
    lookbook: { ...fakeminkStage, outfit: "jacket", body: "#2f3f63", sleeves: "#2f3f63", pants: { kind: "baggy", color: "#d9d3c6" } } as StickSpec,
  },
} satisfies Record<string, Record<string, StickSpec>>;
