import { springTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  SCENE_AGENT_HANDOFF_DURATION_FRAMES,
  SCENE_DIAGNOSTICS_DURATION_FRAMES,
  SCENE_FILE_SCAN_DURATION_FRAMES,
  SCENE_SCORE_REVEAL_DURATION_FRAMES,
  SCENE_TYPING_DURATION_FRAMES,
  TRANSITION_DURATION_FRAMES,
} from "../constants";
import { AgentHandoff } from "../scenes/agent-handoff";
import { Diagnostics } from "../scenes/diagnostics";
import { FileScan } from "../scenes/file-scan";
import { ScoreReveal } from "../scenes/score-reveal";
import { TerminalTyping } from "../scenes/terminal-typing";

export const Main = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE_TYPING_DURATION_FRAMES}>
        <TerminalTyping />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION_DURATION_FRAMES,
        })}
      />

      <TransitionSeries.Sequence durationInFrames={SCENE_FILE_SCAN_DURATION_FRAMES}>
        <FileScan />
      </TransitionSeries.Sequence>

      <TransitionSeries.Sequence durationInFrames={SCENE_DIAGNOSTICS_DURATION_FRAMES}>
        <Diagnostics />
      </TransitionSeries.Sequence>

      <TransitionSeries.Sequence durationInFrames={SCENE_AGENT_HANDOFF_DURATION_FRAMES}>
        <AgentHandoff />
      </TransitionSeries.Sequence>

      <TransitionSeries.Sequence durationInFrames={SCENE_SCORE_REVEAL_DURATION_FRAMES}>
        <ScoreReveal />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
