import { PERFECT_SCORE } from "@/constants";
import type { DiagnosticInput } from "@/utils/validate-diagnostic";

const ERROR_RULE_PENALTY = 1.5;
const WARNING_RULE_PENALTY = 0.75;

const scoreFromRuleCounts = (errorRuleCount: number, warningRuleCount: number): number => {
  const penalty = errorRuleCount * ERROR_RULE_PENALTY + warningRuleCount * WARNING_RULE_PENALTY;
  return Math.max(0, Math.round(PERFECT_SCORE - penalty));
};

const countUniqueRules = (
  diagnostics: DiagnosticInput[],
): { errorRuleCount: number; warningRuleCount: number } => {
  const errorRules = new Set<string>();
  const warningRules = new Set<string>();

  for (const diagnostic of diagnostics) {
    const ruleKey = `${diagnostic.plugin}/${diagnostic.rule}`;
    if (diagnostic.severity === "error") {
      errorRules.add(ruleKey);
    } else {
      warningRules.add(ruleKey);
    }
  }

  return { errorRuleCount: errorRules.size, warningRuleCount: warningRules.size };
};

const calculateScore = (diagnostics: DiagnosticInput[]): number => {
  if (diagnostics.length === 0) return PERFECT_SCORE;
  const { errorRuleCount, warningRuleCount } = countUniqueRules(diagnostics);
  return scoreFromRuleCounts(errorRuleCount, warningRuleCount);
};

export { calculateScore, countUniqueRules, scoreFromRuleCounts };
