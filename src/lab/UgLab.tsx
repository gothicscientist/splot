// ug-rap channel devices (look-dev): title card, year stamp, alias stack, track card with plays counting up.
// Stills: 12 title, 40 year stamp, 70 aliases, 110 track card mid-count, 140 track card done.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TitleCard, YearStamp, AliasStack, TrackCard, UG } from "../channels/ug";
import { SafeZones } from "../core/Reel";

export const UgLab: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, #2a1840, ${UG.bg})` }}>
      {f < 30 ? <TitleCard at={0} kicker="the rise of" title="a bedroom producer" /> : null}
      {f >= 30 && f < 60 ? <YearStamp at={32} text="2019" /> : null}
      {f >= 60 && f < 90 ? <AliasStack at={60} names={["first alias", "second alias", "the name that stuck"]} /> : null}
      {f >= 90 ? <TrackCard at={90} title="demo (untitled)" artist="stand-in alias" plays={[1200, 2400000]} countFrom={98} countDur={30} /> : null}
      <SafeZones />
    </AbsoluteFill>
  );
};
