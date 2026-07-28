import { regionalCampaignOrderClaimLedgerLimit } from "../../data/regionalCampaignOrders";
import type { Guild } from "../../shared/types";
import { buildWeeklyCampaignBriefing, getLocalCampaignWeekKeys } from "./buildWeeklyCampaignBriefing";

export type WeeklyCampaignArchiveStatus = "secured" | "recorded" | "empty";

export interface WeeklyCampaignArchiveEntry {
  weekStartKey: string;
  weekEndKey: string;
  rangeLabel: string;
  status: WeeklyCampaignArchiveStatus;
  statusLabel: string;
  completedOrders: number;
  regionsCovered: number;
  objectivesCovered: number;
  objectivesAvailable: number;
  earnedGold: number;
  goalsCompleted: number;
}

export interface WeeklyCampaignArchive {
  guildId: string;
  currentWeekStartKey: string;
  entries: WeeklyCampaignArchiveEntry[];
  securedWeeks: number;
  recordedWeeks: number;
  completedOrders: number;
  earnedGold: number;
  ledgerLimit: number;
}

export const weeklyCampaignArchiveLimit = 8;

export function buildWeeklyCampaignArchive(guild: Guild, now = new Date(), requestedWeeks = weeklyCampaignArchiveLimit): WeeklyCampaignArchive {
  const current = safeLocalDate(now);
  const currentWeekStartKey = getLocalCampaignWeekKeys(current).startKey;
  const weeks = Math.max(1, Math.min(weeklyCampaignArchiveLimit, safeInteger(requestedWeeks, weeklyCampaignArchiveLimit)));
  const entries = Array.from({ length: weeks }, (_, index) => {
    const archiveDate = new Date(current);
    archiveDate.setDate(archiveDate.getDate() - ((index + 1) * 7));
    const briefing = buildWeeklyCampaignBriefing(guild, archiveDate);
    const goalsCompleted = briefing.goals.filter((goal) => goal.complete).length;
    const status: WeeklyCampaignArchiveStatus = goalsCompleted === briefing.goals.length
      ? "secured"
      : briefing.completedOrders > 0 ? "recorded" : "empty";
    return {
      weekStartKey: briefing.weekStartKey,
      weekEndKey: briefing.weekEndKey,
      rangeLabel: briefing.rangeLabel,
      status,
      statusLabel: status === "secured" ? "Campaign secured" : status === "recorded" ? "Campaign recorded" : "No retained record",
      completedOrders: briefing.completedOrders,
      regionsCovered: briefing.regionsCovered,
      objectivesCovered: briefing.objectivesCovered,
      objectivesAvailable: briefing.objectivesAvailable,
      earnedGold: briefing.earnedGold,
      goalsCompleted,
    };
  });

  return {
    guildId: guild.id,
    currentWeekStartKey,
    entries,
    securedWeeks: entries.filter((entry) => entry.status === "secured").length,
    recordedWeeks: entries.filter((entry) => entry.status !== "empty").length,
    completedOrders: entries.reduce((total, entry) => total + entry.completedOrders, 0),
    earnedGold: entries.reduce((total, entry) => Math.min(Number.MAX_SAFE_INTEGER, total + entry.earnedGold), 0),
    ledgerLimit: regionalCampaignOrderClaimLedgerLimit,
  };
}

function safeLocalDate(value: Date) {
  const valid = Number.isFinite(value.getTime()) ? value : new Date();
  return new Date(valid.getFullYear(), valid.getMonth(), valid.getDate(), 12);
}

function safeInteger(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}
