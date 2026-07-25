import { bosses } from "../../data/bosses";
import { items } from "../../data/items";
import type {
  GuildBossOutcome,
  GuildBossOutcomeLoot,
  GuildOperationOutcomesState,
} from "../../shared/types";

export function createDefaultGuildOperationOutcomes(): GuildOperationOutcomesState {
  return { bossHistory: [], totalBossAttempts: 0, totalBossDefeats: 0 };
}

export function normalizeGuildOperationOutcomes(value: unknown): GuildOperationOutcomesState {
  if (!value || typeof value !== "object") return createDefaultGuildOperationOutcomes();
  const candidate = value as Partial<GuildOperationOutcomesState>;
  const seen = new Set<string>();
  const bossHistory = (Array.isArray(candidate.bossHistory) ? candidate.bossHistory : [])
    .map(normalizeBossOutcome)
    .filter((entry): entry is GuildBossOutcome => Boolean(entry))
    .filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))
    .slice(0, 20);
  const totalBossAttempts = Math.max(normalizeInteger(candidate.totalBossAttempts), bossHistory.length);
  const totalBossDefeats = Math.min(
    totalBossAttempts,
    Math.max(normalizeInteger(candidate.totalBossDefeats), bossHistory.filter((entry) => entry.defeated).length),
  );
  return { bossHistory, totalBossAttempts, totalBossDefeats };
}

function normalizeBossOutcome(value: unknown): GuildBossOutcome | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildBossOutcome>;
  const boss = bosses.find((entry) => entry.id === candidate.bossId);
  if (!boss || !isValidDate(candidate.completedAt)) return undefined;
  const completedAt = new Date(candidate.completedAt).toISOString();
  const participantCharacterIds = normalizeIds(candidate.participantCharacterIds, 5);
  if (participantCharacterIds.length === 0) return undefined;
  const fallbackId = `boss-${boss.id}-${Date.parse(completedAt)}-${participantCharacterIds.join("-")}`;
  return {
    id: normalizeId(candidate.id, 160) ?? fallbackId,
    bossId: boss.id,
    completedAt,
    participantCharacterIds,
    defeated: candidate.defeated === true,
    entryCost: normalizeInteger(candidate.entryCost),
    goldGained: normalizeInteger(candidate.goldGained),
    goldLost: normalizeInteger(candidate.goldLost),
    renownGained: normalizeInteger(candidate.renownGained),
    experienceGained: normalizeInteger(candidate.experienceGained),
    loot: normalizeLoot(candidate.loot),
  };
}

function normalizeLoot(value: unknown): GuildBossOutcomeLoot[] {
  if (!Array.isArray(value)) return [];
  const quantities = new Map<string, number>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<GuildBossOutcomeLoot>;
    if (typeof candidate.itemId !== "string" || !items[candidate.itemId]) continue;
    const quantity = normalizeInteger(candidate.quantity);
    if (quantity <= 0) continue;
    quantities.set(candidate.itemId, Math.min(
      Number.MAX_SAFE_INTEGER,
      (quantities.get(candidate.itemId) ?? 0) + quantity,
    ));
  }
  return [...quantities].slice(0, 12).map(([itemId, quantity]) => ({ itemId, quantity }));
}

function normalizeIds(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean))]
    .slice(0, limit);
}

function normalizeId(value: unknown, limit: number) {
  if (typeof value !== "string") return undefined;
  const id = value.trim().slice(0, limit);
  return id || undefined;
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
