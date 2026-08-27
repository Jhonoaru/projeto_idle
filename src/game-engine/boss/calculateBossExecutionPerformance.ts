import type {
  BossDodgeTradeOffSummary,
  BossExecutionGrade,
  BossExecutionPerformanceSummary,
  BossTelegraphDodgeSummary,
} from "../../shared/types";

export function calculateBossExecutionPerformance(
  dodges: BossTelegraphDodgeSummary[],
  tradeOffs: BossDodgeTradeOffSummary[],
): BossExecutionPerformanceSummary {
  const manualDodges = dodges.filter((entry) => entry.manualReaction);
  const perfectDodges = manualDodges.filter((entry) => entry.manualReactionQuality === "perfect").length;
  const manualHolds = tradeOffs.reduce((sum, entry) => sum + entry.manualHoldCount, 0);
  const perfectHolds = tradeOffs.reduce((sum, entry) => sum + entry.manualHoldQualityCounts.perfect, 0);
  const bestPerfectChain = Math.max(
    0,
    ...manualDodges.map((entry) => entry.perfectChainStreak ?? 0),
    ...tradeOffs.map((entry) => entry.maxPerfectReactionStreak),
  );
  const perfectReactions = perfectDodges + perfectHolds;
  return {
    manualReactions: manualDodges.length + manualHolds,
    perfectReactions,
    perfectDodges,
    perfectHolds,
    bestPerfectChain,
    grade: getBossExecutionGrade(bestPerfectChain, perfectReactions),
  };
}

export function getBossExecutionGrade(bestPerfectChain: number, perfectReactions: number): BossExecutionGrade {
  const chain = normalizeCount(bestPerfectChain);
  const perfect = normalizeCount(perfectReactions);
  if (chain >= 5 && perfect >= 5) return "masterful";
  if (chain >= 3 && perfect >= 3) return "disciplined";
  if (chain >= 1 && perfect >= 1) return "precise";
  return "unranked";
}

export function getBossExecutionGradeLabel(grade: BossExecutionGrade) {
  return grade === "masterful" ? "Masterful" : grade === "disciplined" ? "Disciplined" : grade === "precise" ? "Precise" : "Unranked";
}

function normalizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
