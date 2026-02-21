import { PERFECT_SCORE, SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from "@/constants/score";

const BADGE_HEIGHT_PX = 20;
const LABEL_TEXT = "vercel doctor";
const LABEL_RECT_WIDTH_PX = 97;
const LABEL_TEXT_CENTER_10X = 575;
const LABEL_TEXT_LENGTH_10X = 670;
const SECTION_PADDING_PX = 11;
const DIGIT_WIDTH_10X = 65;
const SLASH_WIDTH_10X = 38;
const FONT_SIZE_10X = 110;
const TEXT_Y_10X = 140;
const SHADOW_Y_10X = 150;
const CACHE_MAX_AGE_SECONDS = 86400;

const LOGO_SIZE_PX = 14;
const LOGO_X_PX = 6;
const LOGO_Y_PX = 3;

const WHITE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 6L36 34H4L20 6Z" fill="#fff"/><path d="M20 17V25M16 21H24" stroke="#555" stroke-width="2.5" stroke-linecap="round"/></svg>`;

const LOGO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(WHITE_LOGO_SVG)}`;

const getBadgeScoreColor = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "#2ea043";
  if (score >= SCORE_OK_THRESHOLD) return "#d29922";
  return "#cf222e";
};

const computeScoreTextLength = (scoreText: string): number =>
  scoreText.split("").reduce((totalWidth, character) => {
    if (character === "/") return totalWidth + SLASH_WIDTH_10X;
    return totalWidth + DIGIT_WIDTH_10X;
  }, 0);

export const GET = (request: Request): Response => {
  const { searchParams } = new URL(request.url);
  const score = Math.max(0, Math.min(PERFECT_SCORE, Number(searchParams.get("s")) || 0));

  const scoreText = `${score}/${PERFECT_SCORE}`;
  const scoreColor = getBadgeScoreColor(score);
  const scoreTextLength = computeScoreTextLength(scoreText);
  const valueRectWidth = Math.round(scoreTextLength / 10) + SECTION_PADDING_PX * 2;
  const totalWidth = LABEL_RECT_WIDTH_PX + valueRectWidth;

  const valueCenterX = (LABEL_RECT_WIDTH_PX + valueRectWidth / 2) * 10;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${BADGE_HEIGHT_PX}" role="img" aria-label="${LABEL_TEXT}: ${scoreText}">
  <title>${LABEL_TEXT}: ${scoreText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${BADGE_HEIGHT_PX}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${LABEL_RECT_WIDTH_PX}" height="${BADGE_HEIGHT_PX}" fill="#555"/>
    <rect x="${LABEL_RECT_WIDTH_PX}" width="${valueRectWidth}" height="${BADGE_HEIGHT_PX}" fill="${scoreColor}"/>
    <rect width="${totalWidth}" height="${BADGE_HEIGHT_PX}" fill="url(#s)"/>
  </g>
  <image x="${LOGO_X_PX}" y="${LOGO_Y_PX}" width="${LOGO_SIZE_PX}" height="${LOGO_SIZE_PX}" href="${LOGO_DATA_URI}"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="${FONT_SIZE_10X}">
    <text aria-hidden="true" x="${LABEL_TEXT_CENTER_10X}" y="${SHADOW_Y_10X}" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${LABEL_TEXT_LENGTH_10X}">${LABEL_TEXT}</text>
    <text x="${LABEL_TEXT_CENTER_10X}" y="${TEXT_Y_10X}" transform="scale(.1)" fill="#fff" textLength="${LABEL_TEXT_LENGTH_10X}">${LABEL_TEXT}</text>
    <text aria-hidden="true" x="${valueCenterX}" y="${SHADOW_Y_10X}" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${scoreTextLength}">${scoreText}</text>
    <text x="${valueCenterX}" y="${TEXT_Y_10X}" transform="scale(.1)" fill="#fff" textLength="${scoreTextLength}">${scoreText}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${CACHE_MAX_AGE_SECONDS}, s-maxage=${CACHE_MAX_AGE_SECONDS}`,
    },
  });
};
