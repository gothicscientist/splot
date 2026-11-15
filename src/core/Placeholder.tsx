// Timing preview scene: shows the shot's lines on a card so a voice + timeline can be checked before art exists.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useShot } from "./timeline";
import { font } from "./fonts";

export const Placeholder: React.FC = () => {
  const s = useShot();
  const fam = font("Montserrat");
  const hue = (s.shot.id.charCodeAt(s.shot.id.length - 1) * 47) % 360;
  return (
    <AbsoluteFill style={{ background: `hsl(${hue} 45% 22%)`, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <div style={{ fontFamily: fam, fontWeight: 800, color: "#fff", fontSize: 46, lineHeight: 1.25, textAlign: "center", transform: `scale(${1 + s.f * 0.0015})` }}>
        <div style={{ fontSize: 30, opacity: 0.6, marginBottom: 24 }}>shot {s.shot.id}</div>
        {s.beats.map((b) => (
          <div key={b.id} style={{ marginBottom: 18 }}>
            {b.text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
