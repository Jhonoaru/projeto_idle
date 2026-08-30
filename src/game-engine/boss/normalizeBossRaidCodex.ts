import { bosses } from "../../data/bosses";
import { items } from "../../data/items";
import type { BossRaidCodexState, BossRaidRecord, GuildBossOutcome, GuildBossOutcomeLoot } from "../../shared/types";

export function createDefaultBossRaidCodexState(): BossRaidCodexState {
  return { records: [] };
}

export function normalizeBossRaidCodex(value: unknown, legacyHistory: GuildBossOutcome[] = []): BossRaidCodexState {
  const candidate = value && typeof value === "object" ? value as Partial<BossRaidCodexState> : undefined;
  const records = (Array.isArray(candidate?.records) ? candidate.records : [])
    .map(normalizeRecord)
    .filter((record): record is BossRaidRecord => Boolean(record));
  if (records.length > 0 || legacyHistory.length === 0) {
    return { records: mergeRecords(records) };
  }
  return { records: rebuildFromHistory(legacyHistory) };
}

function rebuildFromHistory(history: GuildBossOutcome[]) {
  const records = new Map<string, BossRaidRecord>();
  for (const outcome of [...history].reverse()) {
    const previous = records.get(outcome.bossId);
    records.set(outcome.bossId, addOutcome(previous, outcome));
  }
  return [...records.values()].sort((left, right) => left.bossId.localeCompare(right.bossId));
}

function normalizeRecord(value: unknown): BossRaidRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<BossRaidRecord>;
  if (typeof candidate.bossId !== "string" || !bosses.some((boss) => boss.id === candidate.bossId) || !validDate(candidate.lastAttemptAt)) return undefined;
  const attempts = normalizeInteger(candidate.attempts);
  const defeats = Math.min(attempts, normalizeInteger(candidate.defeats));
  const lastDefeatedAt = defeats > 0 && validDate(candidate.lastDefeatedAt)
    ? new Date(candidate.lastDefeatedAt).toISOString()
    : undefined;
  return {
    bossId: candidate.bossId,
    attempts,
    defeats,
    totalEntryCost: normalizeInteger(candidate.totalEntryCost),
    totalGoldGained: normalizeInteger(candidate.totalGoldGained),
    totalGoldLost: normalizeInteger(candidate.totalGoldLost),
    totalRenownGained: normalizeInteger(candidate.totalRenownGained),
    totalExperienceGained: normalizeInteger(candidate.totalExperienceGained),
    lootTotals: normalizeLoot(candidate.lootTotals),
    lastAttemptAt: new Date(candidate.lastAttemptAt).toISOString(),
    ...(lastDefeatedAt ? { lastDefeatedAt } : {}),
  };
}

function mergeRecords(records: BossRaidRecord[]) {
  const merged = new Map<string, BossRaidRecord>();
  for (const record of records) {
    const previous = merged.get(record.bossId);
    if (!previous) {
      merged.set(record.bossId, record);
      continue;
    }
    merged.set(record.bossId, {
      bossId: record.bossId,
      attempts: safeAdd(previous.attempts, record.attempts),
      defeats: safeAdd(previous.defeats, record.defeats),
      totalEntryCost: safeAdd(previous.totalEntryCost, record.totalEntryCost),
      totalGoldGained: safeAdd(previous.totalGoldGained, record.totalGoldGained),
      totalGoldLost: safeAdd(previous.totalGoldLost, record.totalGoldLost),
      totalRenownGained: safeAdd(previous.totalRenownGained, record.totalRenownGained),
      totalExperienceGained: safeAdd(previous.totalExperienceGained, record.totalExperienceGained),
      lootTotals: mergeLoot(previous.lootTotals, record.lootTotals),
      lastAttemptAt: newestDate(previous.lastAttemptAt, record.lastAttemptAt),
      ...(previous.lastDefeatedAt || record.lastDefeatedAt
        ? { lastDefeatedAt: newestDate(previous.lastDefeatedAt, record.lastDefeatedAt) }
        : {}),
    });
  }
  return [...merged.values()].map((record) => ({ ...record, defeats: Math.min(record.attempts, record.defeats) }))
    .sort((left, right) => left.bossId.localeCompare(right.bossId));
}

function addOutcome(previous: BossRaidRecord | undefined, outcome: GuildBossOutcome): BossRaidRecord {
  return {
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
}

function normalizeLoot(value: unknown): GuildBossOutcomeLoot[] {
  if (!Array.isArray(value)) return [];
  return mergeLoot([], value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Partial<GuildBossOutcomeLoot>;
    if (typeof candidate.itemId !== "string" || !items[candidate.itemId]) return [];
    const quantity = normalizeInteger(candidate.quantity);
    return quantity > 0 ? [{ itemId: candidate.itemId, quantity }] : [];
  }));
}

function mergeLoot(left: GuildBossOutcomeLoot[], right: GuildBossOutcomeLoot[]) {
  const totals = new Map<string, number>();
  for (const entry of [...left, ...right]) {
    if (!items[entry.itemId]) continue;
    totals.set(entry.itemId, safeAdd(totals.get(entry.itemId) ?? 0, entry.quantity));
  }
  return [...totals].sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
    .slice(0, 24)
    .map(([itemId, quantity]) => ({ itemId, quantity }));
}

function newestDate(left: string | undefined, right: string | undefined) {
  if (!left) return right ?? new Date(0).toISOString();
  if (!right) return left;
  return Date.parse(right) > Date.parse(left) ? right : left;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, normalizeInteger(left) + normalizeInteger(right));
}
