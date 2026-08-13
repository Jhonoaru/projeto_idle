import { combatSkills } from "../../data/combatSkills";
import type {
  BossAbilityCastSummary,
  BossInterruptSummary,
  Character,
  CombatSkillRotationSummary,
} from "../../shared/types";

interface InterruptParticipant {
  character: Character;
  rotation: CombatSkillRotationSummary;
}

interface InterruptCandidate {
  key: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  occurredAtMs: number;
  skill: (typeof combatSkills)[number];
  interruptPowerPercent: number;
}

export function planBossInterrupts(
  participants: InterruptParticipant[],
  abilityCasts: BossAbilityCastSummary[],
  durationMs: number,
): BossInterruptSummary[] {
  const duration = normalizeDuration(durationMs);
  const candidates = participants.flatMap(({ character, rotation }) => rotation.attackEvents.flatMap((event) => {
    const skill = combatSkills.find((entry) => entry.id === event.skillId && entry.category === "attack");
    const interruptPowerPercent = bounded(skill?.effect.interruptPowerPercent, 0, 100, 0);
    if (!skill || interruptPowerPercent <= 0) return [];
    return [{
      key: `${character.id}:${event.sequence}`,
      sourceCharacterId: character.id,
      sourceCharacterName: character.name,
      occurredAtMs: event.occurredAtMs,
      skill,
      interruptPowerPercent,
    }];
  }));
  const reserved = new Set<string>();
  const results: BossInterruptSummary[] = [];

  for (const cast of [...abilityCasts].filter((entry) => (
    Number.isFinite(entry.telegraphStartsAtMs)
    && Number.isFinite(entry.resolvesAtMs)
    && entry.telegraphStartsAtMs >= 0
    && entry.resolvesAtMs > entry.telegraphStartsAtMs
    && entry.resolvesAtMs <= duration
  )).sort((left, right) => left.telegraphStartsAtMs - right.telegraphStartsAtMs || left.castId.localeCompare(right.castId))) {
    const candidate = candidates
      .filter((entry) => (
        !reserved.has(entry.key)
        && entry.occurredAtMs >= cast.telegraphStartsAtMs
        && entry.occurredAtMs < cast.resolvesAtMs
      ))
      .sort((left, right) => (
        right.interruptPowerPercent - left.interruptPowerPercent
        || right.occurredAtMs - left.occurredAtMs
        || left.key.localeCompare(right.key)
      ))[0];
    if (!candidate) continue;
    reserved.add(candidate.key);
    const resistancePercent = bounded(cast.interruptResistancePercent, 0, 90, 35);
    const successChancePercent = bounded(50 + candidate.interruptPowerPercent - resistancePercent, 10, 90, 50);
    const rollPercent = deterministicPercent(`${cast.castId}:${candidate.sourceCharacterId}:${candidate.skill.id}:interrupt`);
    results.push({
      castId: cast.castId,
      abilityId: cast.abilityId,
      abilityName: cast.abilityName,
      sourceCharacterId: candidate.sourceCharacterId,
      sourceCharacterName: candidate.sourceCharacterName,
      skillId: candidate.skill.id,
      skillName: candidate.skill.name,
      occurredAtMs: Math.round(candidate.occurredAtMs),
      interruptPowerPercent: candidate.interruptPowerPercent,
      resistancePercent,
      successChancePercent,
      rollPercent,
      interrupted: rollPercent < successChancePercent,
      reservedEventKey: candidate.key,
    });
  }
  return results;
}

function normalizeDuration(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(8 * 60 * 60_000, value)) : 0;
}

function bounded(value: number | undefined, minimum: number, maximum: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
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
