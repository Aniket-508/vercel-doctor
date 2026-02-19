import {
  GREEN_COLOR,
  RED_COLOR,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  YELLOW_COLOR,
} from "../constants";

export const getScoreColor = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return GREEN_COLOR;
  if (score >= SCORE_OK_THRESHOLD) return YELLOW_COLOR;
  return RED_COLOR;
};

export const getScoreLabel = (score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return "Great";
  if (score >= SCORE_OK_THRESHOLD) return "Needs work";
  return "Critical";
};

export const getDoctorFace = (score: number): [string, string] => {
  if (score >= SCORE_GOOD_THRESHOLD) return ["◠ ◠", " ▽ "];
  if (score >= SCORE_OK_THRESHOLD) return ["• •", " ─ "];
  return ["x x", " ▽ "];
};
