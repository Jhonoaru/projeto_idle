import { combatSkills } from "../../data/combatSkills";
import type {
  BossIncomingPressureSegment,
  Character,
  CombatConditionDefinition,
  CombatConditionType,
  BossAbilityCastSummary,
  BossDefensiveResponseSummary,
  CombatPartyConditionSupportContribution,
  CombatSkillRotationSummary,
  CombatSkillTarget,
  IncomingCombatConditionSummary,
} from "../../shared/types";
import { calculateIncomingAttackCount } from "./calculateIncomingAttackCount";
import { planBossDefensiveResponses } from "../boss/planBossDefensiveResponses";

const MAX_PROTECTION_PERCENT = 35;
const MAX_RISK_REDUCTION_PERCENT = 3;
const MAX_DURATION_MS = 8 * 60 * 60_000;

interface SupportEvent {
  key: string;
  skillId: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  occurredAtMs: number;
  cleanseCount: number;
  protectionPercent: number;
  protectionDurationMs: number;
  scope: "self" | "party";
}

interface DefenseParticipant {
  character: Character;
  rotation: CombatSkillRotationSummary;
  targets: CombatSkillTarget[];
  incomingAttackCount?: number;
  incomingDamageMultiplier?: number;
  conditionChanceMultiplier?: number;
  pressureSegments?: BossIncomingPressureSegment[];
}

interface ConditionAttempt {
  character: Character;
  target: CombatSkillTarget;
  attackIndex: number;
  occurredAtMs: number;
  threat: NonNullable<CombatSkillTarget["conditionAttacks"]>[number];
  sourceKey: string;
  incomingDamageMultiplier: number;
  conditionChanceMultiplier: number;
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

export interface PartyIncomingConditionDefenseResult {
  profilesByCharacterId: Record<string, IncomingConditionDefenseProfile>;
  contributions: CombatPartyConditionSupportContribution[];
  cleansedBySourceSkillKey: Record<string, number>;
  protectionUptimeSecondsBySourceSkillKey: Record<string, number>;
  responses: BossDefensiveResponseSummary[];
}

export function calculateIncomingConditionDefense(
  character: Character,
  rotation: CombatSkillRotationSummary,
  durationMs: number,
  targets: CombatSkillTarget[],
  pressure?: { incomingDamageMultiplier?: number; conditionChanceMultiplier?: number },
): IncomingConditionDefenseProfile {
  return calculateConditionDefenseProfiles(
    [{ character, rotation, targets, ...pressure }],
    durationMs,
  ).profilesByCharacterId[character.id] ?? createEmptyProfile([], normalizeDuration(durationMs), character.id);
}

export function calculatePartyIncomingConditionDefense(
  participants: DefenseParticipant[],
  durationMs: number,
  abilityCasts: BossAbilityCastSummary[] = [],
): PartyIncomingConditionDefenseResult {
  return calculateConditionDefenseProfiles(participants, durationMs, abilityCasts);
}

function calculateConditionDefenseProfiles(
  participants: DefenseParticipant[],
  durationMs: number,
  abilityCasts: BossAbilityCastSummary[] = [],
): PartyIncomingConditionDefenseResult {
  const normalizedDurationMs = normalizeDuration(durationMs);
  const baseSupportEvents = participants
    .flatMap(({ character, rotation }) => getSupportEvents(character, rotation))
    .sort(compareSupportEvents);
  const responses = planBossDefensiveResponses(participants, abilityCasts, normalizedDurationMs);
  const supportEvents = applyDefensiveResponses(baseSupportEvents, responses).sort(compareSupportEvents);
  const profileStates = new Map(participants.map(({ character }) => [character.id, {
    byType: new Map<CombatConditionType, IncomingCombatConditionSummary>(),
    cleansedBySkillId: {} as Record<string, number>,
  }]));
  const cleanseCapacity = new Map(supportEvents.map((event) => [event.key, event.cleanseCount]));
  const cleansedBySourceSkillKey: Record<string, number> = {};
  const attempts = buildAttempts(participants, normalizedDurationMs);

  for (const attempt of attempts) {
    const state = profileStates.get(attempt.character.id);
    if (!state) continue;
    const { threat } = attempt;
    const summary = state.byType.get(threat.type) ?? incomingSummary(threat.type);
    summary.attempts += 1;
    const eligibleSupport = supportEvents.filter((event) => canSupport(event, attempt.character.id));
    const protectionPercent = getProtectionAt(eligibleSupport, attempt.occurredAtMs);
    const baseChance = Math.min(100, bounded(threat.applicationChancePercent, 0, 100, 0) * attempt.conditionChanceMultiplier);
    const effectiveChance = baseChance * (1 - protectionPercent / 100);
    const roll = deterministicPercent(`${attempt.character.id}:${attempt.target.id}:${attempt.attackIndex}:${attempt.sourceKey}:${threat.type}:incoming-condition`);
    if (roll >= effectiveChance) {
      if (roll < baseChance) summary.prevented += 1;
      state.byType.set(threat.type, summary);
      continue;
    }

    summary.applications += 1;
    const naturalDurationMs = bounded(threat.durationSeconds, 0, 60, 0) * 1_000;
    const naturalEndMs = Math.min(normalizedDurationMs, attempt.occurredAtMs + naturalDurationMs);
    const cleanseEvent = findNextCleanse(
      eligibleSupport,
      cleanseCapacity,
      attempt.occurredAtMs,
      naturalEndMs,
    );
    const resolvedEndMs = cleanseEvent?.occurredAtMs ?? naturalEndMs;
    const activeDurationMs = Math.max(0, resolvedEndMs - attempt.occurredAtMs);
    if (cleanseEvent) {
      summary.cleansed += 1;
      cleanseCapacity.set(cleanseEvent.key, (cleanseCapacity.get(cleanseEvent.key) ?? 0) - 1);
      state.cleansedBySkillId[cleanseEvent.skillId] = (state.cleansedBySkillId[cleanseEvent.skillId] ?? 0) + 1;
      const sourceSkillKey = getSourceSkillKey(cleanseEvent.sourceCharacterId, cleanseEvent.skillId);
      cleansedBySourceSkillKey[sourceSkillKey] = (cleansedBySourceSkillKey[sourceSkillKey] ?? 0) + 1;
    }
    if (threat.type === "slow") {
      summary.uptimePercent += activeDurationMs / normalizedDurationMs * 100;
    } else {
      const intervalMs = bounded(threat.tickIntervalSeconds, 0.5, 30, 1) * 1_000;
      const ticks = Math.max(0, Math.floor(activeDurationMs / intervalMs));
      summary.ticks += ticks;
      const rawDamage = Math.round(getIncomingDamage(attempt.character.id, attempt.target, attempt.attackIndex) * attempt.incomingDamageMultiplier);
      summary.damage += Math.round(rawDamage * bounded(threat.damagePercentPerTick, 0, 10, 0) / 100) * ticks;
    }
    state.byType.set(threat.type, summary);
  }

  const protectionUptimeSecondsBySourceSkillKey: Record<string, number> = {};
  const profilesByCharacterId = Object.fromEntries(participants.map(({ character }) => {
    const eligibleSupport = supportEvents.filter((event) => canSupport(event, character.id));
    const state = profileStates.get(character.id)!;
    const profile = finalizeProfile(state.byType, state.cleansedBySkillId, eligibleSupport, normalizedDurationMs);
    for (const event of new Set(eligibleSupport.map((entry) => getSourceSkillKey(entry.sourceCharacterId, entry.skillId)))) {
      const [sourceCharacterId, skillId] = splitSourceSkillKey(event);
      const seconds = calculateSkillCoverage(eligibleSupport, normalizedDurationMs, sourceCharacterId, skillId);
      protectionUptimeSecondsBySourceSkillKey[event] = rounded((protectionUptimeSecondsBySourceSkillKey[event] ?? 0) + seconds);
    }
    return [character.id, profile];
  }));

  const contributions = participants.map(({ character }) => {
    const sourcePrefix = `${character.id}::`;
    return {
      characterId: character.id,
      characterName: character.name,
      cleansed: sumRecordByPrefix(cleansedBySourceSkillKey, sourcePrefix),
      protectionUptimeSeconds: rounded(sumRecordByPrefix(protectionUptimeSecondsBySourceSkillKey, sourcePrefix)),
      telegraphResponses: responses.filter((response) => response.sourceCharacterId === character.id).length,
    };
  });

  return {
    profilesByCharacterId,
    contributions,
    cleansedBySourceSkillKey,
    protectionUptimeSecondsBySourceSkillKey,
    responses,
  };
}

function applyDefensiveResponses(events: SupportEvent[], responses: BossDefensiveResponseSummary[]) {
  const byReservedKey = new Map(responses.map((response) => [response.reservedEventKey, response]));
  return events.flatMap((event) => {
    const response = byReservedKey.get(event.key);
    if (response) return [{ ...event, occurredAtMs: response.occurredAtMs }];
    const suppressed = responses.some((entry) => (
      entry.sourceCharacterId === event.sourceCharacterId
      && entry.skillId === event.skillId
      && event.occurredAtMs > entry.occurredAtMs
      && event.occurredAtMs < entry.cooldownEndsAtMs
    ));
    return suppressed ? [] : [event];
  });
}

function buildAttempts(participants: DefenseParticipant[], durationMs: number): ConditionAttempt[] {
  if (durationMs <= 0) return [];
  return participants.flatMap(({ character, targets, incomingAttackCount, incomingDamageMultiplier, conditionChanceMultiplier, pressureSegments }) => {
    const hasPhaseConditions = pressureSegments?.some((segment) => segment.phaseConditionCasts?.length);
    const eligibleTargets = hasPhaseConditions ? targets : targets.filter((target) => target.conditionAttacks?.length);
    if (eligibleTargets.length === 0) return [];
    const incomingAttacks = Number.isFinite(incomingAttackCount)
      ? Math.max(0, Math.floor(incomingAttackCount ?? 0))
      : calculateIncomingAttackCount(durationMs, eligibleTargets);
    const segments = normalizePressureSegments(pressureSegments, incomingAttacks, durationMs, incomingDamageMultiplier, conditionChanceMultiplier);
    const attempts: ConditionAttempt[] = [];
    let globalAttackIndex = 0;
    let globalCastIndex = 0;
    for (const segment of segments) {
      const phaseStartMs = durationMs * segment.startPercent / 100;
      const phaseDurationMs = durationMs * Math.max(0, segment.endPercent - segment.startPercent) / 100;
      for (let localIndex = 0; localIndex < segment.incomingAttacks; localIndex += 1) {
        globalAttackIndex += 1;
        const target = eligibleTargets[stableHash(`${character.id}:${globalAttackIndex}:incoming-target`) % eligibleTargets.length];
        const occurredAtMs = Math.round(phaseStartMs + localIndex * phaseDurationMs / Math.max(1, segment.incomingAttacks));
        for (const [index, threat] of (target.conditionAttacks ?? []).entries()) {
          attempts.push({
            character,
            target,
            attackIndex: globalAttackIndex,
            occurredAtMs,
            threat,
            sourceKey: `base:${index}`,
            incomingDamageMultiplier: segment.incomingDamageMultiplier,
            conditionChanceMultiplier: segment.conditionChanceMultiplier,
          });
        }
      }
      for (const cast of segment.phaseConditionCasts ?? []) {
        globalCastIndex += 1;
        const target = eligibleTargets[stableHash(`${character.id}:${cast.castId}:incoming-cast-target`) % eligibleTargets.length];
        attempts.push({
          character,
          target,
          attackIndex: incomingAttacks + globalCastIndex,
          occurredAtMs: cast.occurredAtMs,
          threat: cast.conditionAttack,
          sourceKey: `cast:${cast.castId}`,
          incomingDamageMultiplier: segment.incomingDamageMultiplier,
          conditionChanceMultiplier: segment.conditionChanceMultiplier,
        });
      }
    }
    return attempts;
  }).sort((left, right) => (
    left.occurredAtMs - right.occurredAtMs
    || left.character.id.localeCompare(right.character.id)
    || left.attackIndex - right.attackIndex
    || left.threat.type.localeCompare(right.threat.type)
  ));
}

function normalizePressureSegments(
  segments: BossIncomingPressureSegment[] | undefined,
  incomingAttacks: number,
  durationMs: number,
  incomingDamageMultiplier?: number,
  conditionChanceMultiplier?: number,
): BossIncomingPressureSegment[] {
  const valid = (segments ?? []).filter((segment) => (
    Number.isFinite(segment.incomingAttacks)
    && segment.incomingAttacks >= 0
    && Number.isFinite(segment.startPercent)
    && Number.isFinite(segment.endPercent)
    && segment.endPercent >= segment.startPercent
  ));
  if (valid.length > 0 && valid.reduce((sum, segment) => sum + Math.floor(segment.incomingAttacks), 0) === incomingAttacks) {
    return valid.map((segment) => ({
      ...segment,
      incomingAttacks: Math.floor(segment.incomingAttacks),
      startPercent: bounded(segment.startPercent, 0, 100, 0),
      endPercent: bounded(segment.endPercent, 0, 100, 100),
      incomingDamageMultiplier: bounded(segment.incomingDamageMultiplier, 0.75, 1.5, 1),
      conditionChanceMultiplier: bounded(segment.conditionChanceMultiplier, 0.5, 1.5, 1),
      phaseConditionCasts: normalizePhaseConditionCasts(segment.phaseConditionCasts, durationMs),
    }));
  }
  return [{
    phaseId: "encounter",
    startPercent: 0,
    endPercent: 100,
    incomingAttacks,
    incomingDamageMultiplier: bounded(incomingDamageMultiplier, 0.75, 1.5, 1),
    conditionChanceMultiplier: bounded(conditionChanceMultiplier, 0.5, 1.5, 1),
  }];
}

function normalizePhaseConditionCasts(
  casts: BossIncomingPressureSegment["phaseConditionCasts"],
  durationMs: number,
): NonNullable<BossIncomingPressureSegment["phaseConditionCasts"]> {
  const normalized: NonNullable<BossIncomingPressureSegment["phaseConditionCasts"]> = [];
  const castIds = new Set<string>();
  for (const cast of casts ?? []) {
    if (!cast
      || typeof cast.castId !== "string"
      || !cast.castId
      || castIds.has(cast.castId)
      || typeof cast.abilityId !== "string"
      || !cast.abilityId
      || typeof cast.abilityName !== "string"
      || !cast.abilityName
      || !Number.isFinite(cast.telegraphStartsAtMs)
      || typeof cast.targetCharacterId !== "string"
      || !cast.targetCharacterId
      || typeof cast.targetCharacterName !== "string"
      || !cast.targetCharacterName
      || !Number.isFinite(cast.occurredAtMs)
    ) continue;
    const condition = cast.conditionAttack;
    if (!condition || !["burn", "poison", "slow"].includes(condition.type)) continue;
    castIds.add(cast.castId);
    const durationSeconds = bounded(condition.durationSeconds, 0.5, 30, 1);
    if (condition.type === "slow") {
      normalized.push({
        castId: cast.castId,
        abilityId: cast.abilityId,
        abilityName: cast.abilityName,
        telegraphStartsAtMs: bounded(cast.telegraphStartsAtMs, 0, durationMs, 0),
        occurredAtMs: bounded(cast.occurredAtMs, 0, durationMs, 0),
        targetCharacterId: cast.targetCharacterId,
        targetCharacterName: cast.targetCharacterName,
        conditionAttack: {
          type: condition.type,
          applicationChancePercent: bounded(condition.applicationChancePercent, 0, 60, 0),
          durationSeconds,
          potencyPercent: bounded(condition.potencyPercent, 0, 40, 0),
        },
      });
      continue;
    }
    normalized.push({
      castId: cast.castId,
      abilityId: cast.abilityId,
      abilityName: cast.abilityName,
      telegraphStartsAtMs: bounded(cast.telegraphStartsAtMs, 0, durationMs, 0),
      occurredAtMs: bounded(cast.occurredAtMs, 0, durationMs, 0),
      targetCharacterId: cast.targetCharacterId,
      targetCharacterName: cast.targetCharacterName,
      conditionAttack: {
        type: condition.type,
        applicationChancePercent: bounded(condition.applicationChancePercent, 0, 60, 0),
        durationSeconds,
        tickIntervalSeconds: bounded(condition.tickIntervalSeconds, 0.5, 30, 1),
        damagePercentPerTick: bounded(condition.damagePercentPerTick, 0, 8, 0),
      },
    });
  }
  return normalized;
}

function finalizeProfile(
  byType: Map<CombatConditionType, IncomingCombatConditionSummary>,
  cleansedBySkillId: Record<string, number>,
  supportEvents: SupportEvent[],
  durationMs: number,
): IncomingConditionDefenseProfile {
  const conditions = [...byType.values()].map((entry) => ({
    ...entry,
    uptimePercent: rounded(Math.min(100, entry.uptimePercent)),
  }));
  const attempts = sumConditions(conditions, "attempts");
  const applications = sumConditions(conditions, "applications");
  const prevented = sumConditions(conditions, "prevented");
  const cleansed = sumConditions(conditions, "cleansed");
  const coverage = calculateProtectionCoverage(supportEvents, durationMs);
  const preventionRate = attempts > 0 ? prevented / attempts * 100 : 0;
  const cleanseRate = applications > 0 ? cleansed / applications * 100 : 0;
  return {
    attempts,
    applications,
    prevented,
    cleansed,
    ticks: sumConditions(conditions, "ticks"),
    damage: sumConditions(conditions, "damage"),
    slowUptimePercent: rounded(Math.min(100, conditions.find((entry) => entry.type === "slow")?.uptimePercent ?? 0)),
    protectionUptimePercent: coverage.uptimePercent,
    averageProtectionPercent: coverage.averagePercent,
    riskReductionPercent: rounded(Math.min(MAX_RISK_REDUCTION_PERCENT, preventionRate * 0.025 + cleanseRate * 0.01)),
    conditions,
    cleansedBySkillId,
    protectionUptimeSecondsBySkillId: coverage.uptimeSecondsBySkillId,
  };
}

function getSupportEvents(character: Character, rotation: CombatSkillRotationSummary): SupportEvent[] {
  return rotation.supportEvents.flatMap((event) => {
    const definition = combatSkills.find((skill) => skill.id === event.skillId && skill.category === "support");
    if (!definition) return [];
    const support = definition.effect.conditionSupport;
    const cleanseCount = Math.floor(bounded(support.cleanseCount, 0, 3, 0));
    const protectionPercent = bounded(support.protectionPercent, 0, MAX_PROTECTION_PERCENT, 0);
    const protectionDurationMs = bounded(support.protectionDurationSeconds, 0, 30, 0) * 1_000;
    if (cleanseCount <= 0 && (protectionPercent <= 0 || protectionDurationMs <= 0)) return [];
    return [{
      key: `${character.id}:${event.sequence}`,
      skillId: event.skillId,
      sourceCharacterId: character.id,
      sourceCharacterName: character.name,
      occurredAtMs: event.occurredAtMs,
      cleanseCount,
      protectionPercent,
      protectionDurationMs,
      scope: support.scope === "party" ? "party" as const : "self" as const,
    }];
  });
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
  const uptimeSecondsBySkillId = Object.fromEntries([...new Set(protective.map((event) => event.skillId))].map((skillId) => [
    skillId,
    rounded(mergedDuration(protective.filter((event) => event.skillId === skillId).map((event) => [
      event.occurredAtMs,
      Math.min(durationMs, event.occurredAtMs + event.protectionDurationMs),
    ] as const)) / 1_000),
  ]));
  return {
    uptimePercent: durationMs > 0 ? rounded(Math.min(100, protectedMs / durationMs * 100)) : 0,
    averagePercent: protectedMs > 0 ? rounded(weightedPercentMs / protectedMs) : 0,
    uptimeSecondsBySkillId,
  };
}

function calculateSkillCoverage(events: SupportEvent[], durationMs: number, sourceCharacterId: string, skillId: string) {
  return mergedDuration(events.filter((event) => (
    event.sourceCharacterId === sourceCharacterId
    && event.skillId === skillId
    && event.protectionPercent > 0
    && event.protectionDurationMs > 0
  )).map((event) => [event.occurredAtMs, Math.min(durationMs, event.occurredAtMs + event.protectionDurationMs)] as const)) / 1_000;
}

function createEmptyProfile(events: SupportEvent[], durationMs: number, characterId: string): IncomingConditionDefenseProfile {
  return finalizeProfile(new Map(), {}, events.filter((event) => canSupport(event, characterId)), durationMs);
}

function incomingSummary(type: CombatConditionType): IncomingCombatConditionSummary {
  return { type, attempts: 0, applications: 0, prevented: 0, cleansed: 0, ticks: 0, damage: 0, uptimePercent: 0 };
}

function canSupport(event: SupportEvent, characterId: string) {
  return event.scope === "party" || event.sourceCharacterId === characterId;
}

function getProtectionAt(events: SupportEvent[], occurredAtMs: number) {
  let highest = 0;
  for (let index = lowerBoundAfter(events, occurredAtMs) - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.occurredAtMs < occurredAtMs - 30_000) break;
    if (occurredAtMs < event.occurredAtMs + event.protectionDurationMs) highest = Math.max(highest, event.protectionPercent);
  }
  return highest;
}

function findNextCleanse(events: SupportEvent[], capacity: Map<string, number>, occurredAtMs: number, naturalEndMs: number) {
  for (let index = lowerBoundAfter(events, occurredAtMs); index < events.length; index += 1) {
    const event = events[index];
    if (event.occurredAtMs >= naturalEndMs) return undefined;
    if ((capacity.get(event.key) ?? 0) > 0) return event;
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

function compareSupportEvents(left: SupportEvent, right: SupportEvent) {
  return left.occurredAtMs - right.occurredAtMs || left.key.localeCompare(right.key);
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

function sumConditions(conditions: IncomingCombatConditionSummary[], key: "attempts" | "applications" | "prevented" | "cleansed" | "ticks" | "damage") {
  return conditions.reduce((sum, condition) => sum + condition[key], 0);
}

function getSourceSkillKey(characterId: string, skillId: string) {
  return `${characterId}::${skillId}`;
}

function splitSourceSkillKey(key: string) {
  const separator = key.indexOf("::");
  return [key.slice(0, separator), key.slice(separator + 2)] as const;
}

function sumRecordByPrefix(record: Record<string, number>, prefix: string) {
  return Object.entries(record).reduce((sum, [key, value]) => sum + (key.startsWith(prefix) ? value : 0), 0);
}

function normalizeDuration(durationMs: number) {
  return Math.max(0, Math.min(MAX_DURATION_MS, Number.isFinite(durationMs) ? durationMs : 0));
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
