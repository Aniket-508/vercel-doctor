"use client";

import { useEffect, useState } from "react";
import { PERFECT_SCORE } from "@/constants/score";
import getScoreColorClass from "@/utils/get-score-color-class";
import getScoreLabel from "@/utils/get-score-label";
import easeOutCubic from "@/utils/ease-out-cubic";
import ScoreBar from "@/components/score-bar";

const SCORE_BAR_WIDTH = 30;
const SCORE_FRAME_COUNT = 20;
const SCORE_FRAME_DELAY_MS = 30;

const AnimatedScore = ({ targetScore }: { targetScore: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const animate = () => {
      if (cancelled || frame > SCORE_FRAME_COUNT) return;
      setAnimatedScore(Math.round(easeOutCubic(frame / SCORE_FRAME_COUNT) * targetScore));
      frame++;
      setTimeout(animate, SCORE_FRAME_DELAY_MS);
    };

    animate();
    return () => {
      cancelled = true;
    };
  }, [targetScore]);

  const colorClass = getScoreColorClass(animatedScore);

  return (
    <>
      <div className="mb-2 font-mono">
        <span className={colorClass}>{animatedScore}</span>
        {` / ${PERFECT_SCORE}  `}
        <span className={colorClass}>{getScoreLabel(animatedScore)}</span>
      </div>
      <div className="mb-4">
        <ScoreBar score={animatedScore} barWidth={SCORE_BAR_WIDTH} />
      </div>
    </>
  );
};

export default AnimatedScore;
