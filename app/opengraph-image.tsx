import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "PhaseRoll — Remember life in phases.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SPECTRUM = [
  "#E4572E",
  "#F2A03D",
  "#F5D03C",
  "#6FBF6B",
  "#4EC3D6",
  "#5B7FD4",
  "#8B6FD1",
];

export default async function OpengraphImage() {
  const assets = join(process.cwd(), "assets");
  const [roman, italic] = await Promise.all([
    readFile(join(assets, "NyghtSerif-Regular.otf")),
    readFile(join(assets, "NyghtSerif-RegularItalic.otf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFFFF",
          color: "#0A0A0A",
          padding: "72px",
          fontFamily: "Nyght Serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34 }}>
          Phase<span style={{ fontStyle: "italic" }}>Roll</span>
        </div>
        <div style={{ display: "flex", fontSize: 104, lineHeight: 1 }}>
          Remember life in&nbsp;
          <span style={{ fontStyle: "italic" }}>phases.</span>
        </div>
        <div style={{ display: "flex", height: 10 }}>
          {SPECTRUM.map((colour) => (
            <div key={colour} style={{ flex: 1, background: colour }} />
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nyght Serif", data: roman, style: "normal", weight: 400 },
        { name: "Nyght Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
