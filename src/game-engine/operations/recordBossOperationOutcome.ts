import type { Boss, BossParty, BossSimulationResult, Guild } from "../../shared/types";
import { recordGuildRegionMastery } from "../region-mastery/guildRegionMastery";
import { normalizeGuildOperationOutcomes } from "./normalizeGuildOperationOutcomes";
import { recordBossRaidCodexOutcome } from "../boss/recordBossRaidCodexOutcome";

interface RecordBossOperationOutcomeOptions {
  completedAt?: Date;
  operationStartedAt?: string;
}

export function recordBossOperationOutcome(
  guild: Guild,
  boss: Boss,
  result: BossSimulationResult,
  party: BossParty,
  goldLost: number,
  options: RecordBossOperationOutcomeOptions = {},
) {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const completedAt = options.completedAt instanceof Date && Number.isFinite(options.completedAt.getTime())
    ? options.completedAt.toISOString()
    : new Date().toISOString();
  const participantCharacterIds = [...new Set(party.members
    .map((member) => member.characterId)
    .filter(Boolean))]
    .slice(0, 5);
  if (boss.id !== result.bossId || party.bossId !== boss.id || participantCharacterIds.length === 0) {
    return guild;
  }
  const operationTimestamp = typeof options.operationStartedAt === "string"
    && Number.isFinite(Date.parse(options.operationStartedAt))
    ? Date.parse(options.operationStartedAt)
    : Date.parse(completedAt);
  const id = `boss-${boss.id}-${operationTimestamp}-${[...participantCharacterIds].sort().join("-")}`;
  if (outcomes.bossHistory.some((entry) => entry.id === id)) return guild;
  const entry = {
    id,
    bossId: boss.id,
    completedAt,
    participantCharacterIds,
    defeated: result.defeated,
    entryCost: normalizeInteger(boss.entryCost),
    goldGained: normalizeInteger(result.goldGained),
    goldLost: normalizeInteger(goldLost),
    renownGained: normalizeInteger(result.renownGained),
    experienceGained: normalizeInteger(result.experienceGained),
    loot: result.loot.map((loot) => ({
      itemId: loot.itemId,
      quantity: normalizeInteger(loot.quantity),
    })),
  };
  const guildWithOutcome = {
    ...guild,
    operationOutcomes: normalizeGuildOperationOutcomes({
      bossHistory: [entry, ...outcomes.bossHistory],
      totalBossAttempts: outcomes.totalBossAttempts + 1,
      totalBossDefeats: outcomes.totalBossDefeats + (result.defeated ? 1 : 0),
      regionMastery: outcomes.regionMastery,
      regionalOrders: outcomes.regionalOrders,
      bossExecutionMastery: outcomes.bossExecutionMastery,
      bossRaidCodex: recordBossRaidCodexOutcome(outcomes.bossRaidCodex, entry),
      bossTrophyHall: outcomes.bossTrophyHall,
    }),
  };
  return recordGuildRegionMastery(guildWithOutcome, {
    kind: "boss",
    city: boss.city,
    defeated: result.defeated,
  }).guild;
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}
