import type { BossRaidCodexState, BossRaidRecord, GuildBossOutcome } from "../../shared/types";
import { normalizeBossRaidCodex } from "./normalizeBossRaidCodex";

export function recordBossRaidCodexOutcome(state: BossRaidCodexState | undefined, outcome: GuildBossOutcome) {
  const normalized = normalizeBossRaidCodex(state);
  const previous = normalized.records.find((record) => record.bossId === outcome.bossId);
  const next: BossRaidRecord = {
    bossId: outcome.bossId,
    attempts: safeAdd(previous?.attempts ?? 0, 1),
    defeats: safeAdd(previous?.defeats ?? 0, outcome.defeated ? 1 : 0),
    totalEntryCost: safeAdd(previous?.totalEntryCost ?? 0, outcome.entryCost),
    totalGoldGained: safeAdd(previous?.totalGoldGained ?? 0, outcome.goldGained),
    totalGoldLost: safeAdd(previous?.totalGoldLost ?? 0, outcome.goldLost),
    totalRenownGained: safeAdd(previous?.totalRenownGained ?? 0, outcome.renownGained),
    totalExperienceGained: safeAdd(previous?.totalExperienceGained ?? 0, outcome.experienceGained),
    lootTotals: mergeLoot(previous?.lootTotals ?? [], outcome.loot),
    lastAttemptAt: newestDate(previous?.lastAttemptAt, outcome.completedAt),
    ...(outcome.defeated || previous?.lastDefeatedAt
      ? { lastDefeatedAt: outcome.defeated ? newestDate(previous?.lastDefeatedAt, outcome.completedAt) : previous?.lastDefeatedAt }
      : {}),
  };
  return normalizeBossRaidCodex({ records: [...normalized.records.filter((record) => record.bossId !== outcome.bossId), next] });
}

function mergeLoot(left: GuildBossOutcome["loot"], right: GuildBossOutcome["loot"]) {
  const totals = new Map<string, number>();
  for (const entry of [...left, ...right]) totals.set(entry.itemId, safeAdd(totals.get(entry.itemId) ?? 0, entry.quantity));
  return [...totals].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function newestDate(left: string | undefined, right: string) {
  return left && Date.parse(left) > Date.parse(right) ? left : right;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(left)) + Math.max(0, Math.floor(right)));
}
