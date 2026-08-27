import { bossExecutionMasteryMilestones } from "../../data/bossExecutionMastery";
import { bosses } from "../../data/bosses";
import type { BossExecutionMasteryRecord, BossExecutionMasteryState } from "../../shared/types";

export function createDefaultBossExecutionMasteryState(): BossExecutionMasteryState {
  return { records: [], claimedMilestoneIds: [], recordedOperationIds: [] };
}

export function normalizeBossExecutionMastery(value: unknown): BossExecutionMasteryState {
  if (!value || typeof value !== "object") return createDefaultBossExecutionMasteryState();
  const candidate = value as Partial<BossExecutionMasteryState>;
  const validBossIds = new Set(bosses.map((boss) => boss.id));
  const recordsByBossId = new Map<string, BossExecutionMasteryRecord>();
  for (const entry of Array.isArray(candidate.records) ? candidate.records : []) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Partial<BossExecutionMasteryRecord>;
    if (typeof record.bossId !== "string" || !validBossIds.has(record.bossId)) continue;
    const totalPerfectReactions = normalizeCount(record.totalPerfectReactions);
    const perfectDodges = Math.min(totalPerfectReactions, normalizeCount(record.perfectDodges));
    const perfectHolds = Math.min(totalPerfectReactions - perfectDodges, normalizeCount(record.perfectHolds));
    recordsByBossId.set(record.bossId, {
      bossId: record.bossId,
      victoriesWithPerfectReactions: normalizeCount(record.victoriesWithPerfectReactions),
      totalPerfectReactions,
      perfectDodges,
      perfectHolds,
      bestPerfectChain: Math.min(totalPerfectReactions, normalizeCount(record.bestPerfectChain)),
      lastRecordedAt: validDate(record.lastRecordedAt) ? new Date(record.lastRecordedAt).toISOString() : new Date(0).toISOString(),
    });
  }
  const validMilestoneIds = new Set(bossExecutionMasteryMilestones.map((milestone) => milestone.id));
  return {
    records: [...recordsByBossId.values()].sort((left, right) => left.bossId.localeCompare(right.bossId)),
    claimedMilestoneIds: uniqueStrings(candidate.claimedMilestoneIds, 200).filter((id) => validMilestoneIds.has(id)),
    recordedOperationIds: uniqueStrings(candidate.recordedOperationIds, 500).slice(-40),
  };
}

function uniqueStrings(value: unknown, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim().slice(0, maxLength))
    .filter(Boolean))];
}

function normalizeCount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
