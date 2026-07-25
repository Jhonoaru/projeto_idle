import type { Character, Guild } from "../../shared/types";
import {
  buildOperationOutcomeLedger,
  type OperationOutcomeKind,
  type OperationOutcomeLedgerEntry,
} from "./buildOperationOutcomeLedger";

export interface OperationPerformanceSummary {
  operations: number;
  successes: number;
  failures: number;
  successRate: number;
  grossGold: number;
  costs: number;
  netGold: number;
  averageNetGold: number;
  renown: number;
  lootItems: number;
  experience: number;
  profitableOperations: number;
}

export interface OperationTargetPerformance extends OperationPerformanceSummary {
  id: string;
  kind: OperationOutcomeKind;
  targetId: string;
  targetName: string;
  region: string;
  lastCompletedAt: string;
}

export function buildOperationPerformanceAnalytics(guild: Guild, characters: Character[]) {
  const ledger = buildOperationOutcomeLedger(guild, characters);
  const targets = buildTargets(ledger.entries);
  const recentEntries = ledger.entries.slice(0, 5);
  const recent = summarize(recentEntries);
  const previous = summarize(ledger.entries.slice(5, 10));
  return {
    windowSize: ledger.entries.length,
    overall: summarize(ledger.entries),
    bosses: summarize(ledger.entries.filter((entry) => entry.kind === "boss")),
    contracts: summarize(ledger.entries.filter((entry) => entry.kind === "contract")),
    recent,
    previous,
    recentDirection: getRecentDirection(recent, previous),
    targets,
    highlights: {
      mostProfitable: [...targets].sort(compareMostProfitable)[0],
      mostReliable: [...targets].sort(compareMostReliable)[0],
      mostActive: [...targets].sort(compareMostActive)[0],
    },
  };
}

export type OperationPerformanceAnalytics = ReturnType<typeof buildOperationPerformanceAnalytics>;

function buildTargets(entries: OperationOutcomeLedgerEntry[]) {
  const grouped = new Map<string, OperationOutcomeLedgerEntry[]>();
  for (const entry of entries) {
    const id = `${entry.kind}:${entry.targetId}`;
    const group = grouped.get(id);
    if (group) group.push(entry);
    else grouped.set(id, [entry]);
  }
  return [...grouped.entries()].map(([id, group]): OperationTargetPerformance => {
    const latest = group[0];
    return {
      id,
      kind: latest.kind,
      targetId: latest.targetId,
      targetName: latest.targetName,
      region: latest.region,
      lastCompletedAt: latest.completedAt,
      ...summarize(group),
    };
  }).sort(compareMostProfitable);
}

function summarize(entries: OperationOutcomeLedgerEntry[]): OperationPerformanceSummary {
  const successes = entries.filter((entry) => entry.success).length;
  const netGold = entries.reduce((total, entry) => addSafe(total, entry.netGold), 0);
  return {
    operations: entries.length,
    successes,
    failures: entries.length - successes,
    successRate: entries.length > 0 ? Math.round((successes / entries.length) * 100) : 0,
    grossGold: entries.reduce((total, entry) => addSafe(total, entry.goldGained), 0),
    costs: entries.reduce((total, entry) => addSafe(total, entry.cost), 0),
    netGold,
    averageNetGold: entries.length > 0 ? Math.round(netGold / entries.length) : 0,
    renown: entries.reduce((total, entry) => addSafe(total, entry.renownGained), 0),
    lootItems: entries.reduce((total, entry) => addSafe(total, entry.itemCount), 0),
    experience: entries.reduce((total, entry) => addSafe(total, entry.experienceGained), 0),
    profitableOperations: entries.filter((entry) => entry.netGold > 0).length,
  };
}

function getRecentDirection(recent: OperationPerformanceSummary, previous: OperationPerformanceSummary) {
  if (recent.operations === 0) return "empty" as const;
  if (previous.operations === 0) return recent.netGold >= 0 ? "positive" as const : "negative" as const;
  const netDelta = recent.averageNetGold - previous.averageNetGold;
  const successDelta = recent.successRate - previous.successRate;
  if (netDelta > 0 && successDelta >= 0) return "improving" as const;
  if (netDelta < 0 && successDelta <= 0) return "declining" as const;
  return recent.netGold >= 0 ? "positive" as const : "negative" as const;
}

function compareMostProfitable(left: OperationTargetPerformance, right: OperationTargetPerformance) {
  return right.netGold - left.netGold
    || right.averageNetGold - left.averageNetGold
    || right.operations - left.operations
    || left.targetName.localeCompare(right.targetName);
}

function compareMostReliable(left: OperationTargetPerformance, right: OperationTargetPerformance) {
  return right.successRate - left.successRate
    || right.operations - left.operations
    || right.netGold - left.netGold
    || left.targetName.localeCompare(right.targetName);
}

function compareMostActive(left: OperationTargetPerformance, right: OperationTargetPerformance) {
  return right.operations - left.operations
    || right.successes - left.successes
    || right.netGold - left.netGold
    || left.targetName.localeCompare(right.targetName);
}

function addSafe(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, left + right));
}
