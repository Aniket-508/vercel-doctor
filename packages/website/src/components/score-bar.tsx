import { PERFECT_SCORE } from "@/components/landing/constants";
import getScoreColorClass from "@/utils/get-score-color-class";

interface ScoreBarProps {
  score: number;
  barWidth: number;
  emptyColorClass?: string;
}

const ScoreBar = ({ score, barWidth, emptyColorClass = "text-neutral-600" }: ScoreBarProps) => {
  const filledCount = Math.round((score / PERFECT_SCORE) * barWidth);
  const emptyCount = barWidth - filledCount;
  const colorClass = getScoreColorClass(score);

  return (
    <>
      <span className={colorClass}>{"█".repeat(filledCount)}</span>
      <span className={emptyColorClass}>{"░".repeat(emptyCount)}</span>
    </>
  );
};

export default ScoreBar;
