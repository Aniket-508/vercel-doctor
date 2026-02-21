import { SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from "@/components/landing/constants";

const getScoreHexColor = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "#4ade80";
  if (score >= SCORE_OK_THRESHOLD) return "#eab308";
  return "#f87171";
};

export default getScoreHexColor;
