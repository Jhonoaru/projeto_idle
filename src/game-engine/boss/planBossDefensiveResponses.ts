import { combatSkills } from "../../data/combatSkills";
import type {
  BossAbilityCastSummary,
  BossDefensiveResponseSummary,
  BossDefensiveResponsePriority,
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
  priority: BossDefensiveResponsePriority;
}

interface ResponseOption {
  candidate: ResponseCandidate;
  responseType: "ward" | "cleanse";
  occurredAtMs: number;
  priorityRank: number;
}

export function planBossDefensiveResponses(
  participants: ResponseParticipant[],
  abilityCasts: BossAbilityCastSummary[],
  durationMs: number,
): BossDefensiveResponseSummary[] {
  const duration = Math.max(0, Number.isFinite(durationMs) ? durationMs : 0);
  const candidates: ResponseCandidate[] = participants.flatMap(({ character, rotation }) => {
    const actionLoadout = character.currentAction?.combatSkillLoadout;
    const priority = normalizePriority(
      actionLoadout
        ? actionLoadout.defensiveResponsePriority
        : character.combatSkillLoadout?.defensiveResponsePriority,
    );
    return rotation.supportEvents.flatMap((event) => {
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
      priority,
    }];
    });
  });
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
    const response = chooseResponse(
      eligible,
      cast.telegraphStartsAtMs,
      cast.resolvesAtMs,
      duration,
      nextAvailableBySkill,
    );
    if (!response) continue;
    const { candidate, responseType, occurredAtMs } = response;
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
      configuredPriority: candidate.priority,
      occurredAtMs: Math.round(occurredAtMs),
      cooldownEndsAtMs: Math.round(Math.min(duration, occurredAtMs + candidate.skill.cooldownSeconds * 1_000)),
      protectionPercent: candidate.protectionPercent,
      cleanseCount: candidate.cleanseCount,
      reservedEventKey: candidate.key,
    });
  }
  return responses;
}

function chooseResponse(
  candidates: ResponseCandidate[],
  telegraphStartsAtMs: number,
  resolvesAtMs: number,
  durationMs: number,
  nextAvailableBySkill: Map<string, number>,
) {
  const cleanseAtMs = Math.min(durationMs, resolvesAtMs + 250);
  const options: ResponseOption[] = candidates.flatMap((candidate) => {
    const skillAvailableAt = nextAvailableBySkill.get(`${candidate.sourceCharacterId}:${candidate.skill.id}`) ?? 0;
    const ward = candidate.protectionPercent > 0
      && candidate.occurredAtMs <= telegraphStartsAtMs
      && telegraphStartsAtMs >= skillAvailableAt
      ? [{ candidate, responseType: "ward" as const, occurredAtMs: telegraphStartsAtMs, priorityRank: responseRank(candidate.priority, "ward") }]
      : [];
    const cleanse = candidate.cleanseCount > 0 && cleanseAtMs >= skillAvailableAt
      ? [{ candidate, responseType: "cleanse" as const, occurredAtMs: cleanseAtMs, priorityRank: responseRank(candidate.priority, "cleanse") }]
      : [];
    return [...ward, ...cleanse];
  });
  return options.sort((left, right) => (
    left.priorityRank - right.priorityRank
    || (right.responseType === "ward" ? right.candidate.protectionPercent : right.candidate.cleanseCount)
      - (left.responseType === "ward" ? left.candidate.protectionPercent : left.candidate.cleanseCount)
    || right.candidate.occurredAtMs - left.candidate.occurredAtMs
    || left.candidate.key.localeCompare(right.candidate.key)
  ))[0];
}

function responseRank(priority: BossDefensiveResponsePriority, responseType: "ward" | "cleanse") {
  if (priority === "prevent") return responseType === "ward" ? 0 : 3;
  if (priority === "recover") return responseType === "cleanse" ? 0 : 3;
  return responseType === "ward" ? 1 : 2;
}

function normalizePriority(value: unknown): BossDefensiveResponsePriority {
  return value === "prevent" || value === "recover" ? value : "automatic";
}

function bounded(value: number | undefined, minimum: number, maximum: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}
