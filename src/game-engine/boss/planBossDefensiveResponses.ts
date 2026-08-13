import { combatSkills } from "../../data/combatSkills";
import type {
  BossAbilityCastSummary,
  BossDefensiveResponseSummary,
  Character,
  CombatSkillRotationSummary,
} from "../../shared/types";

interface ResponseParticipant {
  character: Character;
  rotation: CombatSkillRotationSummary;
}

interface ResponseCandidate {
  key: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  occurredAtMs: number;
  skill: (typeof combatSkills)[number];
  protectionPercent: number;
  cleanseCount: number;
  scope: "self" | "party";
}

export function planBossDefensiveResponses(
  participants: ResponseParticipant[],
  abilityCasts: BossAbilityCastSummary[],
  durationMs: number,
): BossDefensiveResponseSummary[] {
  const duration = Math.max(0, Number.isFinite(durationMs) ? durationMs : 0);
  const candidates: ResponseCandidate[] = participants.flatMap(({ character, rotation }) => rotation.supportEvents.flatMap((event) => {
    const skill = combatSkills.find((entry) => entry.id === event.skillId && entry.category === "support");
    if (!skill) return [];
    const support = skill.effect.conditionSupport;
    const protectionPercent = bounded(support.protectionPercent, 0, 35, 0);
    const cleanseCount = Math.floor(bounded(support.cleanseCount, 0, 3, 0));
    if (protectionPercent <= 0 && cleanseCount <= 0) return [];
    return [{
      key: `${character.id}:${event.sequence}`,
      sourceCharacterId: character.id,
      sourceCharacterName: character.name,
      occurredAtMs: event.occurredAtMs,
      skill,
      protectionPercent,
      cleanseCount,
      scope: support.scope === "party" ? "party" as const : "self" as const,
    }];
  }));
  const reserved = new Set<string>();
  const nextAvailableBySkill = new Map<string, number>();
  const responses: BossDefensiveResponseSummary[] = [];

  for (const cast of [...abilityCasts].filter((entry) => (
    entry.conditionType
    && Number.isFinite(entry.telegraphStartsAtMs)
    && Number.isFinite(entry.resolvesAtMs)
    && entry.telegraphStartsAtMs >= 0
    && entry.resolvesAtMs >= entry.telegraphStartsAtMs
    && entry.resolvesAtMs <= duration
  )).sort((left, right) => left.telegraphStartsAtMs - right.telegraphStartsAtMs)) {
    if (!cast.targetCharacterId || !cast.targetCharacterName) continue;
    const eligible = candidates.filter((candidate) => (
      !reserved.has(candidate.key)
      && candidate.occurredAtMs <= cast.resolvesAtMs
      && (candidate.scope === "party" || candidate.sourceCharacterId === cast.targetCharacterId)
    ));
    const ward = chooseCandidate(
      eligible.filter((candidate) => candidate.protectionPercent > 0 && candidate.occurredAtMs <= cast.telegraphStartsAtMs),
      cast.telegraphStartsAtMs,
      nextAvailableBySkill,
    );
    const candidate = ward ?? chooseCandidate(eligible.filter((entry) => entry.cleanseCount > 0), cast.resolvesAtMs + 250, nextAvailableBySkill);
    if (!candidate) continue;
    const responseType = candidate.protectionPercent > 0 ? "ward" as const : "cleanse" as const;
    const occurredAtMs = Math.min(duration, Math.max(0, responseType === "ward" ? cast.telegraphStartsAtMs : cast.resolvesAtMs + 250));
    const skillKey = `${candidate.sourceCharacterId}:${candidate.skill.id}`;
    reserved.add(candidate.key);
    nextAvailableBySkill.set(skillKey, occurredAtMs + candidate.skill.cooldownSeconds * 1_000);
    responses.push({
      castId: cast.castId,
      abilityId: cast.abilityId,
      abilityName: cast.abilityName,
      targetCharacterId: cast.targetCharacterId,
      targetCharacterName: cast.targetCharacterName,
      sourceCharacterId: candidate.sourceCharacterId,
      sourceCharacterName: candidate.sourceCharacterName,
      skillId: candidate.skill.id,
      skillName: candidate.skill.name,
      responseType,
      occurredAtMs: Math.round(occurredAtMs),
      cooldownEndsAtMs: Math.round(Math.min(duration, occurredAtMs + candidate.skill.cooldownSeconds * 1_000)),
      protectionPercent: candidate.protectionPercent,
      cleanseCount: candidate.cleanseCount,
      reservedEventKey: candidate.key,
    });
  }
  return responses;
}

function chooseCandidate(
  candidates: ResponseCandidate[],
  responseAtMs: number,
  nextAvailableBySkill: Map<string, number>,
) {
  return candidates
    .filter((candidate) => responseAtMs >= (nextAvailableBySkill.get(`${candidate.sourceCharacterId}:${candidate.skill.id}`) ?? 0))
    .sort((left, right) => (
      right.protectionPercent - left.protectionPercent
      || right.cleanseCount - left.cleanseCount
      || right.occurredAtMs - left.occurredAtMs
      || left.key.localeCompare(right.key)
    ))[0];
}

function bounded(value: number | undefined, minimum: number, maximum: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}
