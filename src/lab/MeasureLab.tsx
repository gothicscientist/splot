import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { font } from "../core/fonts";

export const MeasureLab: React.FC = () => {
  const fam = font("Montserrat");
  const [info, setInfo] = useState("...");
  const [h] = useState(() => delayRender("measure"));
  useEffect(() => {
    document.fonts.load(`900 100px "${fam}"`).then(() => document.fonts.ready).then(() => {
      const g = document.createElement("canvas").getContext("2d")!;
      g.font = `900 100px "${fam}"`;
      const a = g.measureText("a a").width, b = g.measureText("aa").width, sp = g.measureText(" ").width, w = g.measureText("scrap").width;
      const loaded = document.fonts.check(`900 100px "${fam}"`);
      const faces: string[] = [];
      document.fonts.forEach((ff) => faces.push(`${ff.family}|${ff.weight}|${ff.status}`));
      setInfo(`fam=${fam} check=${loaded} a_a=${a.toFixed(1)} aa=${b.toFixed(1)} space=${sp.toFixed(1)} scrap=${w.toFixed(1)} font=${g.font} faces=${faces.slice(0, 6).join(", ")}`);
      continueRender(h);
    });
  }, [fam, h]);
  return (
    <AbsoluteFill style={{ background: "#fff", padding: 40, fontSize: 30, fontFamily: "Arial" }}>
      <div style={{ wordBreak: "break-all" }}>{info}</div>
      <div style={{ fontFamily: fam, fontWeight: 900, fontSize: 100 }}>for scrap</div>
    </AbsoluteFill>
  );
};
