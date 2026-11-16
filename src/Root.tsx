import React from "react";
import { Composition } from "remotion";
import { FontLab } from "./lab/FontLab";
import { GlSmoke } from "./lab/GlSmoke";
import { StickLab } from "./lab/StickLab";
import { CastSheet } from "./lab/CastSheet";
import { TiffSheet } from "./lab/TiffSheet";
import { TiffHero } from "./lab/TiffHero";
import { TiffWalk } from "./lab/TiffWalk";
import { TiffStage } from "./lab/TiffStage";
import { PileGoLab } from "./lab/PileGoLab";
import { SceneCast } from "./lab/SceneCast";
import { UgLab } from "./lab/UgLab";
import { SkyLab } from "./lab/SkyLab";
import { MeasureLab } from "./lab/MeasureLab";
import { BlockLab } from "./lab/BlockLab";
import { VIDEOS } from "./videos/registry";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {VIDEOS.map((v) => (
        <Composition
          key={v.id}
          id={v.id}
          component={v.component}
          durationInFrames={v.timeline.durationInFrames}
          fps={v.timeline.fps}
          width={v.timeline.width}
          height={v.timeline.height}
          defaultProps={{ variant: 0 }}
        />
      ))}
      <Composition id="GlSmoke" component={GlSmoke} durationInFrames={60} fps={30} width={1080} height={1920} defaultProps={{ fx: 0 }} />
      <Composition id="FontLab" component={FontLab} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="BlockLab" component={BlockLab} durationInFrames={30} fps={30} width={1080} height={1920} />
      <Composition id="MeasureLab" component={MeasureLab} durationInFrames={1} fps={30} width={1080} height={1080} />
      <Composition id="SkyLab" component={SkyLab} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ grade: true, ink: true, sky: true }} />
      <Composition id="UgLab" component={UgLab} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="SceneCast" component={SceneCast} durationInFrames={2} fps={30} width={1440} height={1280} />
      <Composition id="PileGoLab" component={PileGoLab} durationInFrames={210} fps={30} width={1080} height={1920} />
      <Composition id="TiffStage" component={TiffStage} durationInFrames={180} fps={30} width={1080} height={1920} />
      <Composition id="TiffWalk" component={TiffWalk} durationInFrames={1} fps={30} width={2400} height={500} />
      <Composition id="TiffHero" component={TiffHero} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="TiffSheet" component={TiffSheet} durationInFrames={1} fps={30} width={1440} height={2560} />
      <Composition id="CastSheet" component={CastSheet} durationInFrames={1} fps={30} width={1440} height={2560} />
      <Composition id="StickLab" component={StickLab} durationInFrames={90} fps={30} width={1080} height={1920} defaultProps={{ look: "interior" as const }} />
    </>
  );
};
