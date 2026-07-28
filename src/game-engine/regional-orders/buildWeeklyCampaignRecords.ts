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

interface NormalizedArchiveEntry extends WeeklyCampaignArchiveEntry {
  weekStartTime: number;
}

const dayMilliseconds = 24 * 60 * 60 * 1000;
const weekMilliseconds = 7 * dayMilliseconds;

const recordDefinitions: RecordDefinition[] = [
  { id: "orders", label: "Most orders", sigil: "O", score: (entry) => safeBoundedCount(entry.completedOrders, 21), valueLabel: (entry) => `${safeBoundedCount(entry.completedOrders, 21)} completed` },
  { id: "gold", label: "Highest gold", sigil: "G", score: (entry) => safeCount(entry.earnedGold), valueLabel: (entry) => `${safeCount(entry.earnedGold).toLocaleString("en-US")}g` },
  { id: "regions", label: "Widest reach", sigil: "R", score: (entry) => safeBoundedCount(entry.regionsCovered, 3), valueLabel: (entry) => `${safeBoundedCount(entry.regionsCovered, 3)}/3 regions` },
  { id: "objectives", label: "Best diversity", sigil: "F", score: objectivePercent, valueLabel: objectiveLabel },
];

export function buildWeeklyCampaignRecords(archive: WeeklyCampaignArchive | null | undefined): WeeklyCampaignRecords {
  const entries = normalizeArchiveEntries(archive);
  const recorded = entries.filter(isRecordedEntry);
  const streak = getBestSecuredStreak(entries);
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

function getBestSecuredStreak(entries: NormalizedArchiveEntry[]) {
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;
  let previousStartTime: number | null = null;
  entries.forEach((entry, index) => {
    if (entry?.status === "secured") {
      const followsPreviousWeek = previousStartTime !== null && previousStartTime - entry.weekStartTime === weekMilliseconds;
      if (currentLength === 0 || !followsPreviousWeek) {
        currentStart = index;
        currentLength = 1;
      } else {
        currentLength += 1;
      }
      if (currentLength > bestLength) {
        bestStart = currentStart;
        bestLength = currentLength;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
    previousStartTime = entry.weekStartTime;
  });
  if (bestStart < 0 || bestLength === 0) return { length: 0, label: "No secured run yet" };
  const newest = entries[bestStart];
  const oldest = entries[bestStart + bestLength - 1];
  return {
    length: bestLength,
    label: bestLength === 1 ? newest.rangeLabel : `${oldest.weekStartKey} - ${newest.weekEndKey}`,
  };
}

function normalizeArchiveEntries(archive: WeeklyCampaignArchive | null | undefined): NormalizedArchiveEntry[] {
  const source = archive && Array.isArray(archive.entries) ? archive.entries : [];
  const normalized = source.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const weekStartTime = parseLocalDateKey(entry.weekStartKey);
    const weekEndTime = parseLocalDateKey(entry.weekEndKey);
    if (weekStartTime === null || weekEndTime === null || weekEndTime - weekStartTime !== 6 * dayMilliseconds) return [];
    if (new Date(weekStartTime).getUTCDay() !== 1 || new Date(weekEndTime).getUTCDay() !== 0) return [];
    if (entry.status !== "empty" && entry.status !== "recorded" && entry.status !== "secured") return [];
    return [{
      ...entry,
      weekStartKey: formatUtcDateKey(weekStartTime),
      weekEndKey: formatUtcDateKey(weekEndTime),
      rangeLabel: typeof entry.rangeLabel === "string" && entry.rangeLabel.trim() ? entry.rangeLabel.trim() : `${formatUtcDateKey(weekStartTime)} / ${formatUtcDateKey(weekEndTime)}`,
      weekStartTime,
    }];
  }).sort((left, right) => right.weekStartTime - left.weekStartTime);
  const unique = new Map<string, NormalizedArchiveEntry>();
  normalized.forEach((entry) => {
    if (!unique.has(entry.weekStartKey)) unique.set(entry.weekStartKey, entry);
  });
  return [...unique.values()].slice(0, 8);
}

function parseLocalDateKey(value: unknown) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const parsed = new Date(time);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? time : null;
}

function formatUtcDateKey(time: number) {
  const date = new Date(time);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
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
