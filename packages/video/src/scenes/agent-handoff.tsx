import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  BACKGROUND_COLOR,
  DIAGNOSTICS,
  GREEN_COLOR,
  MUTED_COLOR,
  RED_COLOR,
  TEXT_COLOR,
} from "../constants";
import { fontFamily } from "../utils/font";

const HEADER_FADE_FRAMES = 10;
const PROMPT_DELAY_FRAMES = 15;
const PROMPT_FADE_FRAMES = 10;
const ISSUES_APPEAR_FRAME = 28;
const ISSUES_INTERVAL_FRAMES = 3;
const ISSUES_FADE_FRAMES = 6;
const FIX_START_FRAME = 65;
const FIX_INTERVAL_FRAMES = 6;
const FIX_FADE_FRAMES = 8;
const LOGO_FONT_SIZE_PX = 40;
const PROMPT_FONT_SIZE_PX = 44;
const DIAGNOSTIC_FONT_SIZE_PX = 38;
const STATUS_FONT_SIZE_PX = 38;

const CLAUDE_LOGO_ART = ` ▐▛███▜▌`;
const CLAUDE_LOGO_ART_2 = `▝▜█████▛▘`;
const CLAUDE_LOGO_ART_3 = `  ▘▘ ▝▝`;

const SPINNER_CHARS = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_SPEED = 3;

export const AgentHandoff = () => {
  const frame = useCurrentFrame();

  const headerOpacity = interpolate(frame, [0, HEADER_FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const promptOpacity = interpolate(
    frame,
    [PROMPT_DELAY_FRAMES, PROMPT_DELAY_FRAMES + PROMPT_FADE_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const allIssuesShown = frame >= ISSUES_APPEAR_FRAME + DIAGNOSTICS.length * ISSUES_INTERVAL_FRAMES;

  const spinnerChar = SPINNER_CHARS[Math.floor(frame / SPINNER_SPEED) % SPINNER_CHARS.length];

  const fixedCount = Math.max(
    0,
    Math.min(DIAGNOSTICS.length, Math.floor((frame - FIX_START_FRAME) / FIX_INTERVAL_FRAMES) + 1),
  );
  const isFixing = frame >= FIX_START_FRAME;
  const allFixed = fixedCount >= DIAGNOSTICS.length;

  const allFixedFrame = FIX_START_FRAME + DIAGNOSTICS.length * FIX_INTERVAL_FRAMES;

  const doneOpacity = interpolate(frame, [allFixedFrame, allFixedFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKGROUND_COLOR,
        padding: "80px 80px",
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: LOGO_FONT_SIZE_PX,
          lineHeight: 1.4,
          margin: 0,
          opacity: headerOpacity,
          marginBottom: 24,
          whiteSpace: "pre",
        }}
      >
        <div>
          <span style={{ color: "#d77757" }}>{CLAUDE_LOGO_ART}</span>
          <span style={{ color: "white" }}> Claude Code</span>
        </div>
        <div>
          <span style={{ color: "#d77757" }}>{CLAUDE_LOGO_ART_2}</span>
          <span style={{ color: MUTED_COLOR }}> Opus 4.6 · Claude API</span>
        </div>
        <div>
          <span style={{ color: "#d77757" }}>{CLAUDE_LOGO_ART_3}</span>
          <span style={{ color: MUTED_COLOR }}> /Users/you/my-nextjs-app</span>
        </div>
      </div>

      <div
        style={{
          fontFamily,
          fontSize: PROMPT_FONT_SIZE_PX,
          color: TEXT_COLOR,
          opacity: promptOpacity,
          marginBottom: 16,
          borderTop: "1px solid rgba(255,255,255,0.15)",
          padding: "12px 0",
        }}
      >
        <span style={{ color: MUTED_COLOR }}>❯ </span>
        <span style={{ color: "white" }}>Fix these vercel-doctor issues</span>
      </div>

      {allIssuesShown && !allFixed && (
        <div
          style={{
            fontFamily,
            fontSize: STATUS_FONT_SIZE_PX,
            color: MUTED_COLOR,
            marginBottom: 12,
            opacity: 1,
          }}
        >
          <span style={{ color: "#c084fc" }}>{spinnerChar}</span>
          {" Fixing issues..."}
        </div>
      )}

      {allFixed && (
        <div
          style={{
            fontFamily,
            fontSize: STATUS_FONT_SIZE_PX,
            color: GREEN_COLOR,
            marginBottom: 12,
            opacity: doneOpacity,
          }}
        >
          ✓ All issues fixed
        </div>
      )}

      <div>
        {DIAGNOSTICS.map((diagnostic, index) => {
          const appearFrame = ISSUES_APPEAR_FRAME + index * ISSUES_INTERVAL_FRAMES;
          const localFrame = frame - appearFrame;
          const itemOpacity = interpolate(localFrame, [0, ISSUES_FADE_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          const isItemFixed = isFixing && index < fixedCount;
          const fixFrame = FIX_START_FRAME + index * FIX_INTERVAL_FRAMES;
          const fixProgress = interpolate(frame - fixFrame, [0, FIX_FADE_FRAMES], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          return (
            <div
              key={diagnostic.message}
              style={{
                fontFamily,
                fontSize: DIAGNOSTIC_FONT_SIZE_PX,
                lineHeight: 1.7,
                color: isItemFixed && fixProgress > 0.3 ? MUTED_COLOR : TEXT_COLOR,
                opacity: itemOpacity,
                textDecoration: isItemFixed && fixProgress > 0.3 ? "line-through" : "none",
              }}
            >
              <span
                style={{
                  color: isItemFixed && fixProgress > 0.3 ? GREEN_COLOR : RED_COLOR,
                }}
              >
                {isItemFixed && fixProgress > 0.3 ? " ✓" : " ✗"}
              </span>
              {` ${diagnostic.message} `}
              <span style={{ color: MUTED_COLOR }}>({diagnostic.count})</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
