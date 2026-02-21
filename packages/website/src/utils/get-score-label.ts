import { SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from "@/components/landing/constants";

const getScoreLabel = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "Great";
  if (score >= SCORE_OK_THRESHOLD) return "Needs work";
  return "Critical";
};

export default getScoreLabel;
