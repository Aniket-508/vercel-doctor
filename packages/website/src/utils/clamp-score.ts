import { PERFECT_SCORE } from "@/components/landing/constants";

const clampScore = (value: number): number => Math.max(0, Math.min(PERFECT_SCORE, value));

export default clampScore;
