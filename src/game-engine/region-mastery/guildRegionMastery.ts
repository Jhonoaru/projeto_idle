import {
  getGuildCampaignRegionByCity,
  getGuildCampaignRegionByContract,
  guildCampaignRegions,
  type GuildCampaignRegionDefinition,
} from "../../data/guildCampaignRegions";
import type {
  Guild,
  GuildOperationOutcomesState,
  GuildRegionMasteryProgress,
} from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";

export const guildRegionMasteryRanks = [
  { rank: 0, name: "Uncharted", requiredPoints: 0 },
  { rank: 1, name: "Surveyed", requiredPoints: 10 },
  { rank: 2, name: "Established", requiredPoints: 30 },
  { rank: 3, name: "Veteran", requiredPoints: 70 },
  { rank: 4, name: "Mastered", requiredPoints: 140 },
] as const;

export interface GuildRegionMasteryStatus {
  definition: GuildCampaignRegionDefinition;
  progress: GuildRegionMasteryProgress;
  points: number;
  rank: number;
  rankName: string;
  nextRankName?: string;
  nextRankPoints?: number;
  progressPercent: number;
  huntXpBonusPercent: number;
  huntGoldBonusPercent: number;
}

type RegionMasteryOperation =
  | { kind: "hunt"; city: string; durationMinutes: number; succeeded: boolean }
  | { kind: "boss"; city: string; defeated: boolean }
  | { kind: "contract"; contractId: string; succeeded: boolean };

export function buildGuildRegionMastery(guild: Guild): GuildRegionMasteryStatus[] {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const progressByRegion = new Map((outcomes.regionMastery ?? []).map((entry) => [entry.regionId, entry]));
  return guildCampaignRegions.map((definition) =>
    buildStatus(definition, progressByRegion.get(definition.id) ?? createProgress(definition.id)),
  );
}

export function getGuildRegionMasteryBonuses(guild: Guild, city: string) {
  const definition = getGuildCampaignRegionByCity(city);
  const status = definition
    ? buildGuildRegionMastery(guild).find((entry) => entry.definition.id === definition.id)
    : undefined;
  return {
    regionId: definition?.id,
    regionName: definition?.name,
    rank: status?.rank ?? 0,
    huntXpBonusPercent: status?.huntXpBonusPercent ?? 0,
    huntGoldBonusPercent: status?.huntGoldBonusPercent ?? 0,
  };
}

export function recordGuildRegionMastery(guild: Guild, operation: RegionMasteryOperation) {
  if (!isRegionMasteryOperation(operation)) {
    const operationOutcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
    return { guild: { ...guild, operationOutcomes }, pointsGained: 0, rankedUp: false, status: undefined };
  }
  const definition = operation.kind === "contract"
    ? getGuildCampaignRegionByContract(operation.contractId)
    : getGuildCampaignRegionByCity(operation.city);
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  if (
    !definition ||
    (operation.kind === "hunt" && (operation.succeeded !== true || normalizeDuration(operation.durationMinutes) <= 0))
  ) {
    return { guild: { ...guild, operationOutcomes: outcomes }, pointsGained: 0, rankedUp: false, status: undefined };
  }

  const entries = outcomes.regionMastery ?? [];
  const previous = entries.find((entry) => entry.regionId === definition.id) ?? createProgress(definition.id);
  const previousStatus = buildStatus(definition, previous);
  const updated = incrementProgress(previous, operation);
  const status = buildStatus(definition, updated);
  const regionMastery = [
    ...entries.filter((entry) => entry.regionId !== definition.id),
    updated,
  ].sort((left, right) => left.regionId.localeCompare(right.regionId));
  const operationOutcomes: GuildOperationOutcomesState = { ...outcomes, regionMastery };

  return {
    guild: { ...guild, operationOutcomes },
    pointsGained: Math.max(0, status.points - previousStatus.points),
    rankedUp: status.rank > previousStatus.rank,
    status,
  };
}

export function getGuildRegionMasteryPoints(progress: GuildRegionMasteryProgress) {
  return safeAdd(
    Math.floor(safeInteger(progress.successfulHuntMinutes) / 15),
    safeInteger(progress.bossAttempts),
    safeInteger(progress.bossDefeats) * 4,
    safeInteger(progress.contractsCompleted),
    safeInteger(progress.contractsSucceeded) * 3,
  );
}

function buildStatus(
  definition: GuildCampaignRegionDefinition,
  progress: GuildRegionMasteryProgress,
): GuildRegionMasteryStatus {
  const points = getGuildRegionMasteryPoints(progress);
  const current = [...guildRegionMasteryRanks].reverse().find((entry) => points >= entry.requiredPoints)
    ?? guildRegionMasteryRanks[0];
  const next = guildRegionMasteryRanks.find((entry) => entry.rank === current.rank + 1);
  const rankFloor = current.requiredPoints;
  const rankRange = next ? next.requiredPoints - rankFloor : 1;
  const progressPercent = next
    ? Math.min(100, Math.max(0, Math.round(((points - rankFloor) / rankRange) * 100)))
    : 100;

  return {
    definition,
    progress,
    points,
    rank: current.rank,
    rankName: current.name,
    nextRankName: next?.name,
    nextRankPoints: next?.requiredPoints,
    progressPercent,
    huntXpBonusPercent: current.rank,
    huntGoldBonusPercent: current.rank,
  };
}

function incrementProgress(progress: GuildRegionMasteryProgress, operation: RegionMasteryOperation) {
  if (operation.kind === "hunt") {
    return {
      ...progress,
      successfulHunts: safeIncrement(progress.successfulHunts),
      successfulHuntMinutes: safeAdd(progress.successfulHuntMinutes, normalizeDuration(operation.durationMinutes)),
    };
  }
  if (operation.kind === "boss") {
    return {
      ...progress,
      bossAttempts: safeIncrement(progress.bossAttempts),
      bossDefeats: safeAdd(progress.bossDefeats, operation.defeated === true ? 1 : 0),
    };
  }
  return {
    ...progress,
    contractsCompleted: safeIncrement(progress.contractsCompleted),
    contractsSucceeded: safeAdd(progress.contractsSucceeded, operation.succeeded === true ? 1 : 0),
  };
}

function createProgress(regionId: string): GuildRegionMasteryProgress {
  return {
    regionId,
    successfulHunts: 0,
    successfulHuntMinutes: 0,
    bossAttempts: 0,
    bossDefeats: 0,
    contractsCompleted: 0,
    contractsSucceeded: 0,
  };
}

function normalizeDuration(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(24 * 60, Math.floor(parsed))
    : 0;
}

function isRegionMasteryOperation(value: unknown): value is RegionMasteryOperation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RegionMasteryOperation>;
  if (candidate.kind === "hunt" || candidate.kind === "boss") {
    return typeof candidate.city === "string" && candidate.city.length > 0;
  }
  return candidate.kind === "contract"
    && typeof candidate.contractId === "string"
    && candidate.contractId.length > 0;
}

function safeIncrement(value: unknown) {
  return safeAdd(value, 1);
}

function safeAdd(...values: unknown[]) {
  return values.reduce<number>(
    (total, value) => Math.min(Number.MAX_SAFE_INTEGER, total + safeInteger(value)),
    0,
  );
}

function safeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}
