import type { WeeklyCampaignArchive, WeeklyCampaignArchiveEntry } from "./buildWeeklyCampaignArchive";

export type WeeklyCampaignRecordId = "orders" | "gold" | "regions" | "objectives";

export interface WeeklyCampaignRecord {
  id: WeeklyCampaignRecordId;
  label: string;
  sigil: string;
  valueLabel: string;
  weekLabel: string;
  weekStartKey: string | null;
  tiedWeeks: number;
}

export interface WeeklyCampaignRecords {
  hasRecordedHistory: boolean;
  recordedWeeks: number;
  records: WeeklyCampaignRecord[];
  bestSecuredStreak: number;
  bestSecuredStreakLabel: string;
}

interface RecordDefinition {
  id: WeeklyCampaignRecordId;
  label: string;
  sigil: string;
  score: (entry: WeeklyCampaignArchiveEntry) => number;
  valueLabel: (entry: WeeklyCampaignArchiveEntry) => string;
}

const recordDefinitions: RecordDefinition[] = [
  { id: "orders", label: "Most orders", sigil: "O", score: (entry) => safeBoundedCount(entry.completedOrders, 21), valueLabel: (entry) => `${safeBoundedCount(entry.completedOrders, 21)} completed` },
  { id: "gold", label: "Highest gold", sigil: "G", score: (entry) => safeCount(entry.earnedGold), valueLabel: (entry) => `${safeCount(entry.earnedGold).toLocaleString("en-US")}g` },
  { id: "regions", label: "Widest reach", sigil: "R", score: (entry) => safeBoundedCount(entry.regionsCovered, 3), valueLabel: (entry) => `${safeBoundedCount(entry.regionsCovered, 3)}/3 regions` },
  { id: "objectives", label: "Best diversity", sigil: "F", score: objectivePercent, valueLabel: objectiveLabel },
];

export function buildWeeklyCampaignRecords(archive: WeeklyCampaignArchive): WeeklyCampaignRecords {
  const recorded = Array.isArray(archive.entries) ? archive.entries.filter(isRecordedEntry) : [];
  const streak = getBestSecuredStreak(Array.isArray(archive.entries) ? archive.entries : []);
  return {
    hasRecordedHistory: recorded.length > 0,
    recordedWeeks: recorded.length,
    records: recordDefinitions.map((definition) => buildRecord(definition, recorded)),
    bestSecuredStreak: streak.length,
    bestSecuredStreakLabel: streak.label,
  };
}

function buildRecord(definition: RecordDefinition, entries: WeeklyCampaignArchiveEntry[]): WeeklyCampaignRecord {
  if (entries.length === 0) {
    return { id: definition.id, label: definition.label, sigil: definition.sigil, valueLabel: "No record", weekLabel: "Awaiting a completed week", weekStartKey: null, tiedWeeks: 0 };
  }
  const bestScore = Math.max(...entries.map(definition.score));
  const winners = entries.filter((entry) => definition.score(entry) === bestScore);
  const winner = winners[0];
  return {
    id: definition.id,
    label: definition.label,
    sigil: definition.sigil,
    valueLabel: definition.valueLabel(winner),
    weekLabel: winner.rangeLabel,
    weekStartKey: winner.weekStartKey,
    tiedWeeks: winners.length,
  };
}

function getBestSecuredStreak(entries: WeeklyCampaignArchiveEntry[]) {
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;
  entries.forEach((entry, index) => {
    if (entry?.status === "secured") {
      if (currentLength === 0) currentStart = index;
      currentLength += 1;
      if (currentLength > bestLength) {
        bestStart = currentStart;
        bestLength = currentLength;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
  });
  if (bestStart < 0 || bestLength === 0) return { length: 0, label: "No secured run yet" };
  const newest = entries[bestStart];
  const oldest = entries[bestStart + bestLength - 1];
  return {
    length: bestLength,
    label: bestLength === 1 ? newest.rangeLabel : `${oldest.weekStartKey} - ${newest.weekEndKey}`,
  };
}

function isRecordedEntry(entry: WeeklyCampaignArchiveEntry) {
  return entry?.status === "recorded" || entry?.status === "secured";
}

function objectivePercent(entry: WeeklyCampaignArchiveEntry) {
  const available = safeObjectiveTarget(entry.objectivesAvailable);
  return Math.round((safeBoundedCount(entry.objectivesCovered, available) / available) * 100);
}

function objectiveLabel(entry: WeeklyCampaignArchiveEntry) {
  const available = safeObjectiveTarget(entry.objectivesAvailable);
  return `${safeBoundedCount(entry.objectivesCovered, available)}/${available} families`;
}

function safeObjectiveTarget(value: unknown) {
  return Math.max(1, safeBoundedCount(value, 3));
}

function safeBoundedCount(value: unknown, maximum: number) {
  return Math.min(maximum, safeCount(value));
}

function safeCount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
