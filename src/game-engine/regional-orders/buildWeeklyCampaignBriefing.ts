import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import type { Guild, GuildRegionalOrderObjective } from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { buildRegionalCampaignOffers, getLocalCampaignCycleKey } from "./regionalCampaignOrders";

export type WeeklyCampaignBriefingTone = "opening" | "active" | "complete";
export type WeeklyCampaignGoalId = "orders" | "regions" | "objectives";

export interface WeeklyCampaignGoal {
  id: WeeklyCampaignGoalId;
  label: string;
  description: string;
  progress: number;
  target: number;
  progressPercent: number;
  complete: boolean;
}

export interface WeeklyCampaignCoverage {
  id: string;
  label: string;
  sigil: string;
  completed: number;
  covered: boolean;
  available: boolean;
}

export interface WeeklyCampaignClaim {
  id: string;
  cycleKey: string;
  regionId: string;
  regionName: string;
  regionSigil: string;
  objective: GuildRegionalOrderObjective;
  objectiveLabel: string;
  rewardGold: number;
}

export interface WeeklyCampaignBriefing {
  weekStartKey: string;
  weekEndKey: string;
  rangeLabel: string;
  daysRemaining: number;
  tone: WeeklyCampaignBriefingTone;
  title: string;
  description: string;
  completedOrders: number;
  regionsCovered: number;
  objectivesCovered: number;
  objectivesAvailable: number;
  earnedGold: number;
  goals: WeeklyCampaignGoal[];
  regionCoverage: WeeklyCampaignCoverage[];
  objectiveCoverage: WeeklyCampaignCoverage[];
  recentClaims: WeeklyCampaignClaim[];
}

const objectiveDefinitions: Array<{ id: GuildRegionalOrderObjective; label: string; sigil: string }> = [
  { id: "hunt_minutes", label: "Hunt duty", sigil: "H" },
  { id: "boss_defeats", label: "Boss response", sigil: "B" },
  { id: "contract_successes", label: "Contract support", sigil: "C" },
];

export function buildWeeklyCampaignBriefing(guild: Guild, now = new Date()): WeeklyCampaignBriefing {
  const current = safeLocalDate(now);
  const weekStart = startOfLocalWeek(current);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartKey = getLocalCampaignCycleKey(weekStart);
  const weekEndKey = getLocalCampaignCycleKey(weekEnd);
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const availableObjectives = new Set(
    getWeeklyOffers(guild.id, weekStart).map((offer) => offer.objective),
  );
  const claims = (outcomes.regionalOrders?.claimedOrderIds ?? [])
    .map((id) => getCanonicalWeeklyClaim(guild.id, id, weekStartKey, weekEndKey))
    .filter((claim): claim is WeeklyCampaignClaim => Boolean(claim))
    .sort((left, right) => right.cycleKey.localeCompare(left.cycleKey) || left.regionName.localeCompare(right.regionName));
  const regionCounts = countBy(claims.map((claim) => claim.regionId));
  const objectiveCounts = countBy(claims.map((claim) => claim.objective));
  const completedOrders = claims.length;
  const regionsCovered = regionCounts.size;
  const objectivesCovered = objectiveCounts.size;
  const goals = [
    buildGoal("orders", "Field cadence", "Complete five Regional Campaign Orders this week.", completedOrders, 5),
    buildGoal("regions", "Regional coverage", "Complete an order in each campaign region.", regionsCovered, guildCampaignRegions.length),
    buildGoal("objectives", "Command diversity", "Complete every objective family offered this week.", objectivesCovered, availableObjectives.size),
  ];
  const tone: WeeklyCampaignBriefingTone = goals.every((goal) => goal.complete)
    ? "complete"
    : completedOrders > 0 ? "active" : "opening";

  return {
    weekStartKey,
    weekEndKey,
    rangeLabel: formatWeekRange(weekStart, weekEnd),
    daysRemaining: Math.max(1, Math.min(7, localDayNumber(weekEnd) - localDayNumber(current) + 1)),
    tone,
    title: tone === "complete" ? "Weekly campaign secured" : tone === "active" ? "Weekly campaign in progress" : "Establish this week's campaign",
    description: tone === "complete"
      ? "All command goals are complete. Daily Regional Orders remain available for normal guild gold rewards."
      : tone === "active"
        ? `${goals.filter((goal) => goal.complete).length}/3 command goals complete. Continue with daily orders to broaden the campaign record.`
        : "Complete daily Regional Orders across different regions and operation types to establish a balanced command record.",
    completedOrders,
    regionsCovered,
    objectivesCovered,
    objectivesAvailable: availableObjectives.size,
    earnedGold: claims.reduce((total, claim) => Math.min(Number.MAX_SAFE_INTEGER, total + claim.rewardGold), 0),
    goals,
    regionCoverage: guildCampaignRegions.map((region) => ({
      id: region.id,
      label: region.name,
      sigil: region.sigil,
      completed: regionCounts.get(region.id) ?? 0,
      covered: regionCounts.has(region.id),
      available: true,
    })),
    objectiveCoverage: objectiveDefinitions.map((objective) => ({
      id: objective.id,
      label: objective.label,
      sigil: objective.sigil,
      completed: objectiveCounts.get(objective.id) ?? 0,
      covered: objectiveCounts.has(objective.id),
      available: availableObjectives.has(objective.id),
    })),
    recentClaims: claims.slice(0, 5),
  };
}

export function getLocalCampaignWeekKeys(now = new Date()) {
  const start = startOfLocalWeek(safeLocalDate(now));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { startKey: getLocalCampaignCycleKey(start), endKey: getLocalCampaignCycleKey(end) };
}

function getCanonicalWeeklyClaim(guildId: string, orderId: string, weekStartKey: string, weekEndKey: string) {
  const match = /^regional-order:(\d{4}-\d{2}-\d{2}):([^:]+):(hunt_minutes|boss_defeats|contract_successes):([0-2])$/.exec(orderId);
  if (!match || match[1] < weekStartKey || match[1] > weekEndKey) return undefined;
  const cycleDate = parseLocalCycleKey(match[1]);
  if (!cycleDate) return undefined;
  const offer = buildRegionalCampaignOffers(guildId, cycleDate).find((candidate) => candidate.id === orderId);
  if (!offer) return undefined;
  return {
    id: offer.id,
    cycleKey: offer.cycleKey,
    regionId: offer.regionId,
    regionName: offer.regionName,
    regionSigil: offer.regionSigil,
    objective: offer.objective,
    objectiveLabel: objectiveDefinitions.find((entry) => entry.id === offer.objective)?.label ?? "Regional order",
    rewardGold: offer.rewardGold,
  };
}

function getWeeklyOffers(guildId: string, weekStart: Date) {
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + offset);
    return buildRegionalCampaignOffers(guildId, day);
  }).flat();
}

function buildGoal(id: WeeklyCampaignGoalId, label: string, description: string, progress: number, target: number): WeeklyCampaignGoal {
  const safeTarget = Math.max(1, Math.floor(target));
  const current = Math.min(safeTarget, Math.max(0, Math.floor(progress)));
  return { id, label, description, progress: current, target: safeTarget, progressPercent: Math.round((current / safeTarget) * 100), complete: current >= safeTarget };
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return counts;
}

function safeLocalDate(value: Date) {
  const valid = Number.isFinite(value.getTime()) ? value : new Date();
  return new Date(valid.getFullYear(), valid.getMonth(), valid.getDate());
}

function localDayNumber(value: Date) {
  return Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86_400_000);
}

function startOfLocalWeek(value: Date) {
  const start = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function parseLocalCycleKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}

function formatWeekRange(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} - ${endLabel}`;
}
