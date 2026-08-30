import type { Boss, Guild } from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { normalizeBossExecutionMastery } from "./normalizeBossExecutionMastery";

export type BossRaidCodexStatus = "untested" | "encountered" | "conquered" | "mastered" | "flawless";

export interface BossRaidCodexEntry {
  boss: Boss;
  status: BossRaidCodexStatus;
  attempts: number;
  defeats: number;
  winRatePercent: number;
  totalEntryCost: number;
  totalGoldGained: number;
  totalGoldLost: number;
  netGold: number;
  totalRenownGained: number;
  totalExperienceGained: number;
  lootTotals: Array<{ itemId: string; quantity: number }>;
  lastAttemptAt?: string;
  lastDefeatedAt?: string;
  qualifiedVictories: number;
  totalPerfectReactions: number;
  perfectDodges: number;
  perfectHolds: number;
  bestPerfectChain: number;
  recentOutcomes: ReturnType<typeof normalizeGuildOperationOutcomes>["bossHistory"];
}

export function buildBossRaidCodex(guild: Guild, definitions: Boss[]) {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const execution = normalizeBossExecutionMastery(outcomes.bossExecutionMastery);
  const entries: BossRaidCodexEntry[] = definitions.map((boss) => {
    const record = outcomes.bossRaidCodex?.records.find((entry) => entry.bossId === boss.id);
    const mastery = execution.records.find((entry) => entry.bossId === boss.id);
    const attempts = record?.attempts ?? 0;
    const defeats = record?.defeats ?? 0;
    const totalPerfectReactions = mastery?.totalPerfectReactions ?? 0;
    const bestPerfectChain = mastery?.bestPerfectChain ?? 0;
    return {
      boss,
      status: getStatus(attempts, defeats, bestPerfectChain, totalPerfectReactions),
      attempts,
      defeats,
      winRatePercent: attempts > 0 ? Math.round((defeats / attempts) * 100) : 0,
      totalEntryCost: record?.totalEntryCost ?? 0,
      totalGoldGained: record?.totalGoldGained ?? 0,
      totalGoldLost: record?.totalGoldLost ?? 0,
      netGold: (record?.totalGoldGained ?? 0) - (record?.totalGoldLost ?? 0) - (record?.totalEntryCost ?? 0),
      totalRenownGained: record?.totalRenownGained ?? 0,
      totalExperienceGained: record?.totalExperienceGained ?? 0,
      lootTotals: record?.lootTotals ?? [],
      lastAttemptAt: record?.lastAttemptAt,
      lastDefeatedAt: record?.lastDefeatedAt,
      qualifiedVictories: mastery?.victoriesWithPerfectReactions ?? 0,
      totalPerfectReactions,
      perfectDodges: mastery?.perfectDodges ?? 0,
      perfectHolds: mastery?.perfectHolds ?? 0,
      bestPerfectChain,
      recentOutcomes: outcomes.bossHistory.filter((entry) => entry.bossId === boss.id).slice(0, 5),
    };
  });
  const trackedAttempts = entries.reduce((sum, entry) => sum + entry.attempts, 0);
  const trackedDefeats = entries.reduce((sum, entry) => sum + entry.defeats, 0);
  return {
    entries,
    summary: {
      encountered: entries.filter((entry) => entry.attempts > 0).length,
      conquered: entries.filter((entry) => entry.defeats > 0).length,
      mastered: entries.filter((entry) => entry.status === "mastered" || entry.status === "flawless").length,
      flawless: entries.filter((entry) => entry.status === "flawless").length,
      trackedAttempts,
      trackedDefeats,
      winRatePercent: trackedAttempts > 0 ? Math.round((trackedDefeats / trackedAttempts) * 100) : 0,
    },
  };
}

export function getBossRaidCodexStatusLabel(status: BossRaidCodexStatus) {
  if (status === "flawless") return "Flawless";
  if (status === "mastered") return "Mastered";
  if (status === "conquered") return "Conquered";
  if (status === "encountered") return "Encountered";
  return "Untested";
}

function getStatus(attempts: number, defeats: number, bestPerfectChain: number, totalPerfectReactions: number): BossRaidCodexStatus {
  if (bestPerfectChain >= 6 && totalPerfectReactions >= 30) return "flawless";
  if (bestPerfectChain >= 4 && totalPerfectReactions >= 12) return "mastered";
  if (defeats > 0) return "conquered";
  if (attempts > 0) return "encountered";
  return "untested";
}
