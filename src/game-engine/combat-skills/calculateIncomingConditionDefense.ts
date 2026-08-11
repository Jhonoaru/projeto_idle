import { combatSkills } from "../../data/combatSkills";
import type {
  Character,
  CombatConditionType,
  CombatSkillRotationSummary,
  CombatSkillTarget,
  IncomingCombatConditionSummary,
} from "../../shared/types";

const MAX_PROTECTION_PERCENT = 35;
const MAX_RISK_REDUCTION_PERCENT = 3;

interface SupportEvent {
  sequence: number;
  skillId: string;
  occurredAtMs: number;
  cleanseCount: number;
  protectionPercent: number;
  protectionDurationMs: number;
}

export interface IncomingConditionDefenseProfile {
  attempts: number;
  applications: number;
  prevented: number;
  cleansed: number;
  ticks: number;
  damage: number;
  slowUptimePercent: number;
  protectionUptimePercent: number;
  averageProtectionPercent: number;
  riskReductionPercent: number;
  conditions: IncomingCombatConditionSummary[];
  cleansedBySkillId: Record<string, number>;
  protectionUptimeSecondsBySkillId: Record<string, number>;
}

export function calculateIncomingConditionDefense(
  character: Character,
  rotation: CombatSkillRotationSummary,
  durationMs: number,
  targets: CombatSkillTarget[],
): IncomingConditionDefenseProfile {
  const normalizedDurationMs = Math.max(0, Math.min(8 * 60 * 60_000, Number.isFinite(durationMs) ? durationMs : 0));
  const eligibleTargets = targets.filter((target) => Array.isArray(target.conditionAttacks) && target.conditionAttacks.length > 0);
  const supportEvents = getSupportEvents(rotation);
  const empty = createEmptyProfile(supportEvents, normalizedDurationMs);
  if (normalizedDurationMs <= 0 || eligibleTargets.length === 0) return empty;

  const averageLevel = targets.reduce((sum, target) => sum + bounded(target.level, 1, 500, 1), 0) / Math.max(1, targets.length);
  const attacksPerMinute = Math.min(15, Math.max(6, 8 + averageLevel * 0.03));
  const incomingAttacks = Math.min(20_000, Math.max(1, Math.round(normalizedDurationMs / 60_000 * attacksPerMinute)));
  const cleanseCapacity = new Map(supportEvents.map((event) => [event.sequence, event.cleanseCount]));
  const byType = new Map<CombatConditionType, IncomingCombatConditionSummary>();
  const cleansedBySkillId: Record<string, number> = {};

  for (let attackIndex = 1; attackIndex <= incomingAttacks; attackIndex += 1) {
    const target = targets[stableHash(`${character.id}:${attackIndex}:incoming-target`) % targets.length];
    if (!target.conditionAttacks?.length) continue;
    const occurredAtMs = Math.round((attackIndex - 1) * normalizedDurationMs / incomingAttacks);
    const rawDamage = getIncomingDamage(character.id, target, attackIndex);
    const protectionPercent = getProtectionAt(supportEvents, occurredAtMs);

    for (const threat of target.conditionAttacks) {
      const summary = byType.get(threat.type) ?? incomingSummary(threat.type);
      summary.attempts += 1;
      const baseChance = bounded(threat.applicationChancePercent, 0, 100, 0);
      const effectiveChance = baseChance * (1 - protectionPercent / 100);
      const roll = deterministicPercent(`${character.id}:${target.id}:${attackIndex}:${threat.type}:incoming-condition`);
      if (roll >= effectiveChance) {
        if (roll < baseChance) summary.prevented += 1;
        byType.set(threat.type, summary);
        continue;
      }

      summary.applications += 1;
      const naturalDurationMs = bounded(threat.durationSeconds, 0, 60, 0) * 1_000;
      const naturalEndMs = Math.min(normalizedDurationMs, occurredAtMs + naturalDurationMs);
      const cleanseEvent = findNextCleanse(supportEvents, cleanseCapacity, occurredAtMs, naturalEndMs);
      const resolvedEndMs = cleanseEvent?.occurredAtMs ?? naturalEndMs;
      const activeDurationMs = Math.max(0, resolvedEndMs - occurredAtMs);
      if (cleanseEvent) {
        summary.cleansed += 1;
        cleanseCapacity.set(cleanseEvent.sequence, (cleanseCapacity.get(cleanseEvent.sequence) ?? 0) - 1);
        cleansedBySkillId[cleanseEvent.skillId] = (cleansedBySkillId[cleanseEvent.skillId] ?? 0) + 1;
      }
      if (threat.type === "slow") {
        summary.uptimePercent += activeDurationMs / normalizedDurationMs * 100;
      } else {
        const intervalMs = bounded(threat.tickIntervalSeconds, 0.5, 30, 1) * 1_000;
        const ticks = Math.max(0, Math.floor(activeDurationMs / intervalMs));
        summary.ticks += ticks;
        summary.damage += Math.round(rawDamage * bounded(threat.damagePercentPerTick, 0, 10, 0) / 100) * ticks;
      }
      byType.set(threat.type, summary);
    }
  }

  const conditions = [...byType.values()].map((entry) => ({
    ...entry,
    uptimePercent: rounded(Math.min(100, entry.uptimePercent)),
  }));
  const attempts = conditions.reduce((sum, entry) => sum + entry.attempts, 0);
  const applications = conditions.reduce((sum, entry) => sum + entry.applications, 0);
  const prevented = conditions.reduce((sum, entry) => sum + entry.prevented, 0);
  const cleansed = conditions.reduce((sum, entry) => sum + entry.cleansed, 0);
  const coverage = calculateProtectionCoverage(supportEvents, normalizedDurationMs);
  const preventionRate = attempts > 0 ? prevented / attempts * 100 : 0;
  const cleanseRate = applications > 0 ? cleansed / applications * 100 : 0;

  return {
    attempts,
    applications,
    prevented,
    cleansed,
    ticks: conditions.reduce((sum, entry) => sum + entry.ticks, 0),
    damage: conditions.reduce((sum, entry) => sum + entry.damage, 0),
    slowUptimePercent: rounded(Math.min(100, conditions.find((entry) => entry.type === "slow")?.uptimePercent ?? 0)),
    protectionUptimePercent: coverage.uptimePercent,
    averageProtectionPercent: coverage.averagePercent,
    riskReductionPercent: rounded(Math.min(MAX_RISK_REDUCTION_PERCENT, preventionRate * 0.025 + cleanseRate * 0.01)),
    conditions,
    cleansedBySkillId,
    protectionUptimeSecondsBySkillId: coverage.uptimeSecondsBySkillId,
  };
}

function getSupportEvents(rotation: CombatSkillRotationSummary): SupportEvent[] {
  return rotation.supportEvents.flatMap((event) => {
    const definition = combatSkills.find((skill) => skill.id === event.skillId && skill.category === "support");
    if (!definition) return [];
    const support = definition.effect.conditionSupport;
    const cleanseCount = Math.floor(bounded(support.cleanseCount, 0, 3, 0));
    const protectionPercent = bounded(support.protectionPercent, 0, MAX_PROTECTION_PERCENT, 0);
    const protectionDurationMs = bounded(support.protectionDurationSeconds, 0, 30, 0) * 1_000;
    if (cleanseCount <= 0 && (protectionPercent <= 0 || protectionDurationMs <= 0)) return [];
    return [{ sequence: event.sequence, skillId: event.skillId, occurredAtMs: event.occurredAtMs, cleanseCount, protectionPercent, protectionDurationMs }];
  }).sort((left, right) => left.occurredAtMs - right.occurredAtMs || left.sequence - right.sequence);
}

function calculateProtectionCoverage(events: SupportEvent[], durationMs: number) {
  const protective = events.filter((event) => event.protectionPercent > 0 && event.protectionDurationMs > 0);
  const boundaries = [...new Set([0, durationMs, ...protective.flatMap((event) => [event.occurredAtMs, Math.min(durationMs, event.occurredAtMs + event.protectionDurationMs)])])].sort((a, b) => a - b);
  let protectedMs = 0;
  let weightedPercentMs = 0;
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const start = boundaries[index];
    const end = boundaries[index + 1];
    const percent = getProtectionAt(protective, start);
    if (percent <= 0) continue;
    protectedMs += end - start;
    weightedPercentMs += (end - start) * percent;
  }
  const uptimeSecondsBySkillId: Record<string, number> = {};
  for (const skillId of new Set(protective.map((event) => event.skillId))) {
    const intervals = protective.filter((event) => event.skillId === skillId).map((event) => [event.occurredAtMs, Math.min(durationMs, event.occurredAtMs + event.protectionDurationMs)] as const);
    uptimeSecondsBySkillId[skillId] = rounded(mergedDuration(intervals) / 1_000);
  }
  return {
    uptimePercent: durationMs > 0 ? rounded(Math.min(100, protectedMs / durationMs * 100)) : 0,
    averagePercent: protectedMs > 0 ? rounded(weightedPercentMs / protectedMs) : 0,
    uptimeSecondsBySkillId,
  };
}

function createEmptyProfile(events: SupportEvent[], durationMs: number): IncomingConditionDefenseProfile {
  const coverage = calculateProtectionCoverage(events, durationMs);
  return { attempts: 0, applications: 0, prevented: 0, cleansed: 0, ticks: 0, damage: 0, slowUptimePercent: 0, protectionUptimePercent: coverage.uptimePercent, averageProtectionPercent: coverage.averagePercent, riskReductionPercent: 0, conditions: [], cleansedBySkillId: {}, protectionUptimeSecondsBySkillId: coverage.uptimeSecondsBySkillId };
}

function incomingSummary(type: CombatConditionType): IncomingCombatConditionSummary {
  return { type, attempts: 0, applications: 0, prevented: 0, cleansed: 0, ticks: 0, damage: 0, uptimePercent: 0 };
}

function getProtectionAt(events: SupportEvent[], occurredAtMs: number) {
  let highest = 0;
  for (let index = lowerBoundAfter(events, occurredAtMs) - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.occurredAtMs < occurredAtMs - 30_000) break;
    if (occurredAtMs < event.occurredAtMs + event.protectionDurationMs) {
      highest = Math.max(highest, event.protectionPercent);
    }
  }
  return highest;
}

function findNextCleanse(
  events: SupportEvent[],
  capacity: Map<number, number>,
  occurredAtMs: number,
  naturalEndMs: number,
) {
  for (let index = lowerBoundAfter(events, occurredAtMs); index < events.length; index += 1) {
    const event = events[index];
    if (event.occurredAtMs >= naturalEndMs) return undefined;
    if ((capacity.get(event.sequence) ?? 0) > 0) return event;
  }
  return undefined;
}

function lowerBoundAfter(events: SupportEvent[], occurredAtMs: number) {
  let low = 0;
  let high = events.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (events[middle].occurredAtMs <= occurredAtMs) low = middle + 1;
    else high = middle;
  }
  return low;
}

function getIncomingDamage(characterId: string, target: CombatSkillTarget, attackIndex: number) {
  const level = bounded(target.level, 1, 500, 1);
  const minimum = bounded(target.minDamage, 0, 1_000_000, level * 2);
  const maximum = Math.max(minimum, bounded(target.maxDamage, 0, 1_000_000, level * 4));
  return Math.round(minimum + (maximum - minimum) * deterministicPercent(`${characterId}:${target.id}:${attackIndex}:incoming-damage`) / 100);
}

function mergedDuration(intervals: ReadonlyArray<readonly [number, number]>) {
  let total = 0;
  let start = -1;
  let end = -1;
  for (const [nextStart, nextEnd] of [...intervals].sort((left, right) => left[0] - right[0])) {
    if (nextStart > end) {
      if (end > start) total += end - start;
      start = nextStart;
      end = nextEnd;
    } else {
      end = Math.max(end, nextEnd);
    }
  }
  return total + (end > start ? end - start : 0);
}

function deterministicPercent(value: string) {
  return stableHash(value) % 10_000 / 100;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function bounded(value: unknown, minimum: number, maximum: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
