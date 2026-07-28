import type { Guild } from "../../shared/types";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { buildWeeklyCampaignArchive, type WeeklyCampaignArchive } from "./buildWeeklyCampaignArchive";
import { buildWeeklyCampaignBriefing, type WeeklyCampaignBriefing } from "./buildWeeklyCampaignBriefing";
import { getLocalCampaignCycleKey } from "./regionalCampaignOrders";

export type WeeklyCampaignTrendTone = "ahead" | "steady" | "behind" | "opening";
export type WeeklyCampaignTrendMetricId = "orders" | "regions" | "objectives" | "gold";

export interface WeeklyCampaignTrendMetric {
  id: WeeklyCampaignTrendMetricId;
  label: string;
  currentLabel: string;
  previousLabel: string;
  deltaLabel: string;
  tone: Exclude<WeeklyCampaignTrendTone, "opening">;
}

export interface WeeklyCampaignTrend {
  tone: WeeklyCampaignTrendTone;
  title: string;
  description: string;
  checkpointDay: number;
  checkpointLabel: string;
  currentCheckpointKey: string;
  previousCheckpointKey: string;
  metrics: WeeklyCampaignTrendMetric[];
  projectedOrders: number;
  previousFinalOrders: number;
  previousFinalGold: number;
  baselineWeeks: number;
  averageOrders: number;
  averageGold: number;
  securedRate: number;
}

export function buildWeeklyCampaignTrend(guild: Guild, now = new Date(), suppliedArchive?: WeeklyCampaignArchive): WeeklyCampaignTrend {
  const currentDate = safeLocalDate(now);
  const previousDate = new Date(currentDate);
  previousDate.setDate(previousDate.getDate() - 7);
  const currentCheckpointKey = getLocalCampaignCycleKey(currentDate);
  const previousCheckpointKey = getLocalCampaignCycleKey(previousDate);
  const current = buildCheckpointBriefing(guild, currentDate, currentCheckpointKey);
  const previous = buildCheckpointBriefing(guild, previousDate, previousCheckpointKey);
  const archive = suppliedArchive ?? buildWeeklyCampaignArchive(guild, currentDate);
  const previousFinal = archive.entries[0];
  const recorded = archive.entries.filter((entry) => entry.status !== "empty");
  const checkpointDay = ((currentDate.getDay() + 6) % 7) + 1;
  const metrics = buildMetrics(current, previous);
  const ahead = metrics.filter((metric) => metric.tone === "ahead").length;
  const behind = metrics.filter((metric) => metric.tone === "behind").length;
  const noActivity = current.completedOrders === 0 && previous.completedOrders === 0;
  const tone: WeeklyCampaignTrendTone = noActivity ? "opening" : ahead > behind ? "ahead" : behind > ahead ? "behind" : "steady";

  return {
    tone,
    title: tone === "ahead" ? "Campaign pace is ahead" : tone === "behind" ? "Campaign pace is behind" : tone === "steady" ? "Campaign pace is steady" : "No checkpoint activity yet",
    description: tone === "opening"
      ? "Neither campaign has a canonical order recorded by this local checkpoint."
      : `Current progress is compared with the previous campaign through the same ${weekdayLabel(currentDate)} checkpoint.`,
    checkpointDay,
    checkpointLabel: `Day ${checkpointDay} / ${weekdayLabel(currentDate)}`,
    currentCheckpointKey,
    previousCheckpointKey,
    metrics,
    projectedOrders: Math.min(21, Math.round((current.completedOrders / checkpointDay) * 7)),
    previousFinalOrders: previousFinal?.completedOrders ?? 0,
    previousFinalGold: previousFinal?.earnedGold ?? 0,
    baselineWeeks: recorded.length,
    averageOrders: average(recorded.map((entry) => entry.completedOrders)),
    averageGold: average(recorded.map((entry) => entry.earnedGold)),
    securedRate: recorded.length > 0 ? Math.round((recorded.filter((entry) => entry.status === "secured").length / recorded.length) * 100) : 0,
  };
}

function buildCheckpointBriefing(guild: Guild, date: Date, checkpointKey: string) {
  const outcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const regionalOrders = outcomes.regionalOrders ?? { claimedOrderIds: [], claimHistory: [] };
  const claimedOrderIds = regionalOrders.claimedOrderIds.filter((id) => {
    const cycleKey = /^regional-order:(\d{4}-\d{2}-\d{2}):/.exec(id)?.[1];
    return Boolean(cycleKey && cycleKey <= checkpointKey);
  });
  return buildWeeklyCampaignBriefing({
    ...guild,
    operationOutcomes: { ...outcomes, regionalOrders: { ...regionalOrders, claimedOrderIds } },
  }, date);
}

function buildMetrics(current: WeeklyCampaignBriefing, previous: WeeklyCampaignBriefing): WeeklyCampaignTrendMetric[] {
  const currentObjectivePercent = percent(current.objectivesCovered, current.objectivesAvailable);
  const previousObjectivePercent = percent(previous.objectivesCovered, previous.objectivesAvailable);
  return [
    metric("orders", "Orders completed", current.completedOrders, previous.completedOrders, String(current.completedOrders), String(previous.completedOrders), ""),
    metric("regions", "Regions covered", current.regionsCovered, previous.regionsCovered, `${current.regionsCovered}/3`, `${previous.regionsCovered}/3`, ""),
    metric("objectives", "Family coverage", currentObjectivePercent, previousObjectivePercent, `${current.objectivesCovered}/${current.objectivesAvailable}`, `${previous.objectivesCovered}/${previous.objectivesAvailable}`, " pp"),
    metric("gold", "Daily gold earned", current.earnedGold, previous.earnedGold, `${current.earnedGold.toLocaleString("en-US")}g`, `${previous.earnedGold.toLocaleString("en-US")}g`, "g"),
  ];
}

function metric(id: WeeklyCampaignTrendMetricId, label: string, current: number, previous: number, currentLabel: string, previousLabel: string, suffix: string): WeeklyCampaignTrendMetric {
  const delta = current - previous;
  return {
    id,
    label,
    currentLabel,
    previousLabel,
    deltaLabel: `${delta > 0 ? "+" : ""}${delta.toLocaleString("en-US")}${suffix}`,
    tone: delta > 0 ? "ahead" : delta < 0 ? "behind" : "steady",
  };
}

function percent(value: number, target: number) {
  return Math.round((Math.max(0, value) / Math.max(1, target)) * 100);
}

function average(values: number[]) {
  return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function weekdayLabel(value: Date) {
  return value.toLocaleDateString("en-US", { weekday: "long" });
}

function safeLocalDate(value: Date) {
  const valid = Number.isFinite(value.getTime()) ? value : new Date();
  return new Date(valid.getFullYear(), valid.getMonth(), valid.getDate(), 12);
}
