import type { Boss, BossParty, BossSimulationResult, Guild } from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "./normalizeGuildOperationOutcomes";

export function recordBossOperationOutcome(
  guild: Guild,
  boss: Boss,
  result: BossSimulationResult,
  party: BossParty,
  goldLost: number,
  now = new Date(),
) {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const completedAt = now instanceof Date && Number.isFinite(now.getTime())
    ? now.toISOString()
    : new Date().toISOString();
  const participantCharacterIds = [...new Set(party.members
    .map((member) => member.characterId)
    .filter(Boolean))]
    .slice(0, 5);
  if (boss.id !== result.bossId || party.bossId !== boss.id || participantCharacterIds.length === 0) {
    return guild;
  }
  const id = `boss-${boss.id}-${Date.parse(completedAt)}-${participantCharacterIds.join("-")}`;
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
  return {
    ...guild,
    operationOutcomes: normalizeGuildOperationOutcomes({
      bossHistory: [entry, ...outcomes.bossHistory],
      totalBossAttempts: outcomes.totalBossAttempts + 1,
      totalBossDefeats: outcomes.totalBossDefeats + (result.defeated ? 1 : 0),
    }),
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}
