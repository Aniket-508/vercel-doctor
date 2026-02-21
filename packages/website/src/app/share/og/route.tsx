/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { PERFECT_SCORE } from "@/constants/score";
import getScoreLabel from "@/utils/get-score-label";
import getScoreHexColor from "@/utils/get-score-hex-color";

const IMAGE_WIDTH_PX = 1200;
const IMAGE_HEIGHT_PX = 630;
const OG_ICON_SIZE_PX = 48;
const OG_LOGO_PATH = "/icon-light.svg";

export const GET = (request: Request): ImageResponse => {
  const { searchParams } = new URL(request.url);

  const projectName = searchParams.get("p") ?? null;
  const score = Math.max(0, Math.min(PERFECT_SCORE, Number(searchParams.get("s")) || 0));
  const errorCount = Math.max(0, Number(searchParams.get("e")) || 0);
  const warningCount = Math.max(0, Number(searchParams.get("w")) || 0);
  const fileCount = Math.max(0, Number(searchParams.get("f")) || 0);
  const scoreColor = getScoreHexColor(score);
  const logoUrl = new URL(OG_LOGO_PATH, request.url).toString();
  const scoreBarPercent = (score / PERFECT_SCORE) * 100;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        fontFamily: "monospace",
        padding: "60px 80px",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logoUrl} width={OG_ICON_SIZE_PX} height={OG_ICON_SIZE_PX} alt="" />
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#fafafa",
            }}
          >
            Vercel Doctor
          </span>
        </div>
        {projectName && (
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: "36px",
              color: "#a3a3a3",
            }}
          >
            {projectName}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "16px",
          marginTop: "48px",
        }}
      >
        <span
          style={{
            fontSize: "120px",
            color: scoreColor,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: "40px", color: "#525252", lineHeight: 1 }}>/ {PERFECT_SCORE}</span>
        <span
          style={{
            fontSize: "40px",
            color: scoreColor,
            lineHeight: 1,
            marginLeft: "8px",
          }}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "16px",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          marginTop: "32px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${scoreBarPercent}%`,
            height: "100%",
            backgroundColor: scoreColor,
            borderRadius: "8px",
          }}
        />
      </div>

      {(errorCount > 0 || warningCount > 0 || fileCount > 0) && (
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "36px",
            fontSize: "24px",
          }}
        >
          {errorCount > 0 && (
            <span style={{ color: "#f87171" }}>
              {errorCount} error{errorCount === 1 ? "" : "s"}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ color: "#eab308" }}>
              {warningCount} warning{warningCount === 1 ? "" : "s"}
            </span>
          )}
          {fileCount > 0 && (
            <span style={{ color: "#737373" }}>
              across {fileCount} file{fileCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
    </div>,
    { width: IMAGE_WIDTH_PX, height: IMAGE_HEIGHT_PX },
  );
};
