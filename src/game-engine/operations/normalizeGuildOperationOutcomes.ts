import { bosses } from "../../data/bosses";
import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { items } from "../../data/items";
import { getRegionalCampaignOrderVariant, regionalCampaignOrderClaimLedgerLimit } from "../../data/regionalCampaignOrders";
import type {
  GuildBossOutcome,
  GuildBossOutcomeLoot,
  GuildOperationOutcomesState,
  GuildRegionalOrderActive,
  GuildRegionalOrderClaim,
  GuildRegionalOrdersState,
  GuildRegionalOrderObjective,
  GuildRegionMasteryProgress,
} from "../../shared/types";

export function createDefaultGuildOperationOutcomes(): GuildOperationOutcomesState {
  return {
    bossHistory: [],
    totalBossAttempts: 0,
    totalBossDefeats: 0,
    regionMastery: [],
    regionalOrders: createDefaultGuildRegionalOrders(),
  };
}

export function createDefaultGuildRegionalOrders(): GuildRegionalOrdersState {
  return { claimedOrderIds: [], claimHistory: [] };
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
  return {
    bossHistory,
    totalBossAttempts,
    totalBossDefeats,
    regionMastery: normalizeRegionMastery(candidate.regionMastery),
    regionalOrders: normalizeGuildRegionalOrders(candidate.regionalOrders),
  };
}

export function normalizeGuildRegionalOrders(value: unknown): GuildRegionalOrdersState {
  if (!value || typeof value !== "object") return createDefaultGuildRegionalOrders();
  const candidate = value as Partial<GuildRegionalOrdersState>;
  const claimedOrderIds = normalizeRecentRegionalOrderIds(candidate.claimedOrderIds);
  const claimed = new Set(claimedOrderIds);
  const historySeen = new Set<string>();
  const claimHistory = (Array.isArray(candidate.claimHistory) ? candidate.claimHistory : [])
    .map(normalizeRegionalOrderClaim)
    .filter((entry): entry is GuildRegionalOrderClaim => Boolean(entry))
    .filter((entry) => {
      if (historySeen.has(entry.orderId)) return false;
      historySeen.add(entry.orderId);
      claimed.add(entry.orderId);
      return true;
    })
    .sort((left, right) => Date.parse(right.claimedAt) - Date.parse(left.claimedAt))
    .slice(0, 20);
  const activeOrder = normalizeRegionalOrderActive(candidate.activeOrder);
  return {
    activeOrder: activeOrder && !claimed.has(activeOrder.id) ? activeOrder : undefined,
    claimedOrderIds: [...claimed].slice(-regionalCampaignOrderClaimLedgerLimit),
    claimHistory,
  };
}

function normalizeRegionalOrderActive(value: unknown): GuildRegionalOrderActive | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildRegionalOrderActive>;
  const id = normalizeId(candidate.id, 180);
  if (
    !id || !isCycleKey(candidate.cycleKey) || !isRegionId(candidate.regionId)
    || !isRegionalOrderObjective(candidate.objective) || !isValidDate(candidate.acceptedAt)
  ) return undefined;
  const target = normalizeInteger(candidate.target);
  const rewardGold = normalizeInteger(candidate.rewardGold);
  const identity = parseRegionalOrderId(id);
  if (
    !identity || identity.cycleKey !== candidate.cycleKey || identity.regionId !== candidate.regionId
    || identity.objective !== candidate.objective
  ) return undefined;
  const canonical = getRegionalCampaignOrderVariant(identity.objective, identity.variant);
  if (target !== canonical.target || rewardGold !== canonical.rewardGold) return undefined;
  return {
    id,
    cycleKey: candidate.cycleKey,
    regionId: candidate.regionId,
    objective: candidate.objective,
    target,
    baseline: normalizeInteger(candidate.baseline),
    rewardGold,
    acceptedAt: new Date(candidate.acceptedAt).toISOString(),
  };
}

function normalizeRegionalOrderClaim(value: unknown): GuildRegionalOrderClaim | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildRegionalOrderClaim>;
  const orderId = normalizeId(candidate.orderId, 180);
  if (
    !orderId || !isRegionId(candidate.regionId) || !isRegionalOrderObjective(candidate.objective)
    || !isValidDate(candidate.claimedAt)
  ) return undefined;
  const rewardGold = normalizeInteger(candidate.rewardGold);
  const identity = parseRegionalOrderId(orderId);
  if (
    !identity || identity.regionId !== candidate.regionId || identity.objective !== candidate.objective
    || rewardGold !== getRegionalCampaignOrderVariant(identity.objective, identity.variant).rewardGold
  ) return undefined;
  return {
    orderId,
    regionId: candidate.regionId,
    objective: candidate.objective,
    rewardGold,
    claimedAt: new Date(candidate.claimedAt).toISOString(),
  };
}

function isRegionalOrderObjective(value: unknown): value is GuildRegionalOrderObjective {
  return value === "hunt_minutes" || value === "boss_defeats" || value === "contract_successes";
}

function isRegionId(value: unknown): value is string {
  return typeof value === "string" && guildCampaignRegions.some((region) => region.id === value);
}

function isCycleKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function parseRegionalOrderId(value: string) {
  const match = /^regional-order:(\d{4}-\d{2}-\d{2}):([^:]+):(hunt_minutes|boss_defeats|contract_successes):([0-2])$/.exec(value);
  if (!match || !isCycleKey(match[1]) || !isRegionId(match[2]) || !isRegionalOrderObjective(match[3])) return undefined;
  return {
    cycleKey: match[1],
    regionId: match[2],
    objective: match[3],
    variant: Number(match[4]),
  };
}

function normalizeRegionMastery(value: unknown): GuildRegionMasteryProgress[] {
  if (!Array.isArray(value)) return [];
  const validRegionIds = new Set(guildCampaignRegions.map((region) => region.id));
  const progressByRegion = new Map<string, GuildRegionMasteryProgress>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<GuildRegionMasteryProgress>;
    if (typeof candidate.regionId !== "string" || !validRegionIds.has(candidate.regionId)) continue;
    const current = progressByRegion.get(candidate.regionId);
    const bossAttempts = normalizeInteger(candidate.bossAttempts);
    const contractsCompleted = normalizeInteger(candidate.contractsCompleted);
    const normalized = {
      regionId: candidate.regionId,
      successfulHunts: normalizeInteger(candidate.successfulHunts),
      successfulHuntMinutes: normalizeInteger(candidate.successfulHuntMinutes),
      bossAttempts,
      bossDefeats: Math.min(bossAttempts, normalizeInteger(candidate.bossDefeats)),
      contractsCompleted,
      contractsSucceeded: Math.min(contractsCompleted, normalizeInteger(candidate.contractsSucceeded)),
    };
    progressByRegion.set(candidate.regionId, current ? mergeRegionProgress(current, normalized) : normalized);
  }
  return guildCampaignRegions.flatMap((region) => progressByRegion.get(region.id) ?? []);
}

function mergeRegionProgress(
  left: GuildRegionMasteryProgress,
  right: GuildRegionMasteryProgress,
): GuildRegionMasteryProgress {
  const bossAttempts = Math.max(left.bossAttempts, right.bossAttempts);
  const contractsCompleted = Math.max(left.contractsCompleted, right.contractsCompleted);
  return {
    regionId: left.regionId,
    successfulHunts: Math.max(left.successfulHunts, right.successfulHunts),
    successfulHuntMinutes: Math.max(left.successfulHuntMinutes, right.successfulHuntMinutes),
    bossAttempts,
    bossDefeats: Math.min(bossAttempts, Math.max(left.bossDefeats, right.bossDefeats)),
    contractsCompleted,
    contractsSucceeded: Math.min(contractsCompleted, Math.max(left.contractsSucceeded, right.contractsSucceeded)),
  };
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

function normalizeRecentRegionalOrderIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const newest: string[] = [];
  for (let index = value.length - 1; index >= 0 && newest.length < regionalCampaignOrderClaimLedgerLimit; index -= 1) {
    if (typeof value[index] !== "string") continue;
    const id = value[index].trim().slice(0, 180);
    if (!id || seen.has(id) || !parseRegionalOrderId(id)) continue;
    seen.add(id);
    newest.push(id);
  }
  return newest.reverse();
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
