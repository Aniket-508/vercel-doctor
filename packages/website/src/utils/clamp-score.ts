import { PERFECT_SCORE } from "@/constants/score";

const clampScore = (value: number): number => Math.max(0, Math.min(PERFECT_SCORE, value));

export default clampScore;
