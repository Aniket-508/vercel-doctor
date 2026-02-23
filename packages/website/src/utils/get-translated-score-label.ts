import { SCORE_GOOD_THRESHOLD, SCORE_OK_THRESHOLD } from "@/constants/score";
import type { Translation } from "@/translations";

const getTranslatedScoreLabel = (score: number, translation: Translation): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return translation.score.great;
  if (score >= SCORE_OK_THRESHOLD) return translation.score.needsWork;
  return translation.score.critical;
};

export default getTranslatedScoreLabel;
