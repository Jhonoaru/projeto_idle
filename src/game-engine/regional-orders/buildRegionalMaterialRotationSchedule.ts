import type { Character, Guild, GuildDepot, Item } from "../../shared/types";
import { buildRegionalAcquisitionForecast } from "./buildRegionalAcquisitionForecast";
import { buildRegionalMaterialAcquisitionPlan } from "./buildRegionalMaterialAcquisitionPlan";

export type RegionalMaterialRotationState = "reachable" | "locked" | "unscheduled";

export interface RegionalMaterialRotationOccurrence {
  id: string;
  dateKey: string;
  daysFromNow: number;
  orderId: string;
  regionName: string;
  regionSigil: string;
  difficultyLabel: string;
  requiredGuildLevel: number;
  unlocked: boolean;
  quantity: number;
}

export interface RegionalMaterialRotationEntry {
  item: Item;
  missing: number;
  state: RegionalMaterialRotationState;
  occurrenceCount: number;
  reachableOccurrenceCount: number;
  totalYield: number;
  usefulYield: number;
  remainingAfterHorizon: number;
  coveragePercent: number;
  reachableYield: number;
  usefulReachableYield: number;
  reachableRemainingAfterHorizon: number;
  reachableCoveragePercent: number;
  firstDateKey: string | null;
  firstDaysFromNow: number | null;
  firstReachableDateKey: string | null;
  firstReachableDaysFromNow: number | null;
  nextUnlockLevel: number | null;
  regionCount: number;
  occurrences: RegionalMaterialRotationOccurrence[];
}

export interface RegionalMaterialRotationSchedule {
  startDateKey: string;
  endDateKey: string;
  horizonDays: number;
  shortageCount: number;
  scheduledMaterialCount: number;
  reachableMaterialCount: number;
  unscheduledMaterialCount: number;
  totalOccurrences: number;
  entries: RegionalMaterialRotationEntry[];
}

export function buildRegionalMaterialRotationSchedule(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
  now = new Date(),
): RegionalMaterialRotationSchedule {
  const forecast = buildRegionalAcquisitionForecast(guild, depot, characters, now);
  const plan = buildRegionalMaterialAcquisitionPlan(guild, depot, characters);
  const occurrencesByItem = new Map<string, RegionalMaterialRotationOccurrence[]>();

  for (const day of forecast.days) {
    for (const match of day.matches) {
      const occurrences = occurrencesByItem.get(match.item.id) ?? [];
      occurrences.push({
        id: `${day.dateKey}-${match.id}`,
        dateKey: day.dateKey,
        daysFromNow: day.daysFromNow,
        orderId: match.orderId,
        regionName: match.regionName,
        regionSigil: match.regionSigil,
        difficultyLabel: match.difficultyLabel,
        requiredGuildLevel: match.requiredGuildLevel,
        unlocked: match.unlocked,
        quantity: match.quantity,
      });
      occurrencesByItem.set(match.item.id, occurrences);
    }
  }

  const entries = plan.entries.map((demand) => {
    const occurrences = occurrencesByItem.get(demand.item.id) ?? [];
    const reachable = occurrences.filter((entry) => entry.unlocked);
    const locked = occurrences.filter((entry) => !entry.unlocked);
    const totalYield = occurrences.reduce((total, entry) => safeAdd(total, entry.quantity), 0);
    const usefulYield = Math.min(demand.missing, totalYield);
    const reachableYield = reachable.reduce((total, entry) => safeAdd(total, entry.quantity), 0);
    const usefulReachableYield = Math.min(demand.missing, reachableYield);
    const state: RegionalMaterialRotationState = reachable.length > 0
      ? "reachable"
      : occurrences.length > 0
        ? "locked"
        : "unscheduled";

    return {
      item: demand.item,
      missing: demand.missing,
      state,
      occurrenceCount: occurrences.length,
      reachableOccurrenceCount: reachable.length,
      totalYield,
      usefulYield,
      remainingAfterHorizon: Math.max(0, demand.missing - totalYield),
      coveragePercent: demand.missing > 0 ? Math.min(100, Math.floor((usefulYield / demand.missing) * 100)) : 0,
      reachableYield,
      usefulReachableYield,
      reachableRemainingAfterHorizon: Math.max(0, demand.missing - reachableYield),
      reachableCoveragePercent: demand.missing > 0
        ? Math.min(100, Math.floor((usefulReachableYield / demand.missing) * 100))
        : 0,
      firstDateKey: occurrences[0]?.dateKey ?? null,
      firstDaysFromNow: occurrences[0]?.daysFromNow ?? null,
      firstReachableDateKey: reachable[0]?.dateKey ?? null,
      firstReachableDaysFromNow: reachable[0]?.daysFromNow ?? null,
      nextUnlockLevel: reachable.length === 0 && locked.length > 0
        ? Math.min(...locked.map((entry) => entry.requiredGuildLevel))
        : null,
      regionCount: new Set(occurrences.map((entry) => entry.regionName)).size,
      occurrences,
    } satisfies RegionalMaterialRotationEntry;
  }).sort(compareEntries);

  return {
    startDateKey: forecast.startDateKey,
    endDateKey: forecast.endDateKey,
    horizonDays: forecast.horizonDays,
    shortageCount: plan.materialCount,
    scheduledMaterialCount: entries.filter((entry) => entry.occurrenceCount > 0).length,
    reachableMaterialCount: entries.filter((entry) => entry.reachableOccurrenceCount > 0).length,
    unscheduledMaterialCount: entries.filter((entry) => entry.occurrenceCount === 0).length,
    totalOccurrences: entries.reduce((total, entry) => safeAdd(total, entry.occurrenceCount), 0),
    entries,
  };
}

function compareEntries(left: RegionalMaterialRotationEntry, right: RegionalMaterialRotationEntry) {
  return stateRank(left.state) - stateRank(right.state)
    || (left.firstReachableDaysFromNow ?? Number.MAX_SAFE_INTEGER) - (right.firstReachableDaysFromNow ?? Number.MAX_SAFE_INTEGER)
    || (left.firstDaysFromNow ?? Number.MAX_SAFE_INTEGER) - (right.firstDaysFromNow ?? Number.MAX_SAFE_INTEGER)
    || (left.nextUnlockLevel ?? Number.MAX_SAFE_INTEGER) - (right.nextUnlockLevel ?? Number.MAX_SAFE_INTEGER)
    || right.reachableCoveragePercent - left.reachableCoveragePercent
    || right.coveragePercent - left.coveragePercent
    || right.missing - left.missing
    || left.item.name.localeCompare(right.item.name);
}

function stateRank(state: RegionalMaterialRotationState) {
  if (state === "reachable") return 0;
  if (state === "locked") return 1;
  return 2;
}

function safeAdd(left: number, right: number) {
  const safeRight = Number.isSafeInteger(right) ? Math.max(0, right) : 0;
  return left > Number.MAX_SAFE_INTEGER - safeRight ? Number.MAX_SAFE_INTEGER : left + safeRight;
}
