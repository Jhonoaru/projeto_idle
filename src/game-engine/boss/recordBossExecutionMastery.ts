import { bossExecutionMasteryMilestones } from "../../data/bossExecutionMastery";
import type { Boss, BossParty, BossSimulationResult, Guild } from "../../shared/types";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { calculateBossExecutionPerformance } from "./calculateBossExecutionPerformance";
import { normalizeBossExecutionMastery } from "./normalizeBossExecutionMastery";

interface RecordBossExecutionMasteryOptions {
  operationStartedAt?: string;
  recordedAt?: Date;
}

export function recordBossExecutionMastery(
  guild: Guild,
  boss: Boss,
  party: BossParty,
  result: BossSimulationResult,
  options: RecordBossExecutionMasteryOptions = {},
) {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const mastery = normalizeBossExecutionMastery(outcomes.bossExecutionMastery);
  const performance = result.executionPerformance ?? (result.combatSkillEffects
    ? calculateBossExecutionPerformance(result.combatSkillEffects.bossTelegraphDodges, result.combatSkillEffects.bossDodgeTradeOffs)
    : emptyPerformance());
  const recordedAt = options.recordedAt instanceof Date && Number.isFinite(options.recordedAt.getTime())
    ? options.recordedAt
    : new Date();
  const participantIds = [...new Set(party.members.map((member) => member.characterId).filter(Boolean))].sort();
  const startedAtMs = typeof options.operationStartedAt === "string" && Number.isFinite(Date.parse(options.operationStartedAt))
    ? Date.parse(options.operationStartedAt)
    : recordedAt.getTime();
  const operationId = `boss-execution:${boss.id}:${startedAtMs}:${participantIds.join("-")}`;
  if (
    boss.id !== result.bossId || party.bossId !== boss.id || participantIds.length === 0
    || mastery.recordedOperationIds.includes(operationId) || !result.defeated || performance.perfectReactions <= 0
  ) {
    return { guild: { ...guild, operationOutcomes: outcomes }, performance, recorded: false, achievedMilestoneIds: [] as string[], unlockedCollectionItemIds: [] as string[], logs: [] as string[] };
  }

  const previous = mastery.records.find((record) => record.bossId === boss.id);
  const record = {
    bossId: boss.id,
    victoriesWithPerfectReactions: (previous?.victoriesWithPerfectReactions ?? 0) + 1,
    totalPerfectReactions: (previous?.totalPerfectReactions ?? 0) + performance.perfectReactions,
    perfectDodges: (previous?.perfectDodges ?? 0) + performance.perfectDodges,
    perfectHolds: (previous?.perfectHolds ?? 0) + performance.perfectHolds,
    bestPerfectChain: Math.max(previous?.bestPerfectChain ?? 0, performance.bestPerfectChain),
    lastRecordedAt: recordedAt.toISOString(),
  };
  let updatedMastery = normalizeBossExecutionMastery({
    ...mastery,
    records: [...mastery.records.filter((entry) => entry.bossId !== boss.id), record],
    recordedOperationIds: [...mastery.recordedOperationIds, operationId],
  });
  const totalPerfectReactions = updatedMastery.records.reduce((sum, entry) => sum + entry.totalPerfectReactions, 0);
  const bestPerfectChain = updatedMastery.records.reduce((best, entry) => Math.max(best, entry.bestPerfectChain), 0);
  const achieved = bossExecutionMasteryMilestones.filter((milestone) => (
    !updatedMastery.claimedMilestoneIds.includes(milestone.id)
    && bestPerfectChain >= milestone.requiredBestPerfectChain
    && totalPerfectReactions >= milestone.requiredTotalPerfectReactions
  ));
  updatedMastery = normalizeBossExecutionMastery({
    ...updatedMastery,
    claimedMilestoneIds: [...updatedMastery.claimedMilestoneIds, ...achieved.map((milestone) => milestone.id)],
  });

  let nextGuild: Guild = {
    ...guild,
    operationOutcomes: normalizeGuildOperationOutcomes({ ...outcomes, bossExecutionMastery: updatedMastery }),
  };
  const unlockedCollectionItemIds: string[] = [];
  const logs = [
    `${boss.name} execution: ${performance.perfectReactions} Perfect reactions, best chain x${performance.bestPerfectChain}.`,
  ];
  for (const milestone of achieved) {
    const unlock = unlockCollectionItem(nextGuild, milestone.collectionItemId);
    nextGuild = unlock.guild;
    if (unlock.unlocked) unlockedCollectionItemIds.push(milestone.collectionItemId);
    logs.push(`Execution mastery achieved: ${milestone.label}.`, ...unlock.logs);
  }
  return {
    guild: nextGuild,
    performance,
    recorded: true,
    achievedMilestoneIds: achieved.map((milestone) => milestone.id),
    unlockedCollectionItemIds,
    logs,
  };
}

function emptyPerformance() {
  return {
    manualReactions: 0,
    perfectReactions: 0,
    perfectDodges: 0,
    perfectHolds: 0,
    bestPerfectChain: 0,
    grade: "unranked" as const,
  };
}
