// Look-dev: pixel-font legibility (capital C vs O, degree sign) at caption and tag sizes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { font } from "../core/fonts";

const ROWS: [string, number][] = [
  ["Pixelify Sans", 400],
  ["Pixelify Sans", 500],
  ["Pixelify Sans", 600],
  ["Pixelify Sans", 700],
  ["Silkscreen", 400],
  ["Silkscreen", 700],
  ["Press Start 2P", 400],
  ["VT323", 400],
];
export const FontLab: React.FC = () => (
  <AbsoluteFill style={{ background: "#3a2420", padding: 30, gap: 14, display: "flex", flexDirection: "column" }}>
    {ROWS.map(([fam, w]) => (
      <div key={fam + w} style={{ background: "rgba(20,18,26,0.85)", border: "6px solid #f2f2f2", padding: "8px 18px", color: "#ffb04a" }}>
        <div style={{ fontFamily: "monospace", fontSize: 22, color: "#aaa" }}>{fam} {w}</div>
        <div style={{ fontFamily: font(fam), fontWeight: w, fontSize: 70, whiteSpace: "nowrap", letterSpacing: 2 }}>STUCK CO 180°C</div>
        <div style={{ fontFamily: font(fam), fontWeight: w, fontSize: 70, whiteSpace: "nowrap", color: "#fff" }}>Celsius OC plastic</div>
      </div>
    ))}
  </AbsoluteFill>
);
