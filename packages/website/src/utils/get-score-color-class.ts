import { SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from "@/constants/score";

const getScoreColorClass = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "text-green-400";
  if (score >= SCORE_OK_THRESHOLD) return "text-yellow-500";
  return "text-red-400";
};

export default getScoreColorClass;
