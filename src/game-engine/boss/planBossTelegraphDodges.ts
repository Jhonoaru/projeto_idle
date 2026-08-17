import type { BossAbilityCastSummary, BossTelegraphDodgeSummary, Character } from "../../shared/types";
import { normalizeBossDodgeBehavior } from "../combat-skills/normalizeCombatSkillLoadout";

const MAX_DURATION_MS = 8 * 60 * 60_000;

export function planBossTelegraphDodges(
  characters: Character[],
  abilityCasts: BossAbilityCastSummary[],
  durationMs: number,
): BossTelegraphDodgeSummary[] {
  const duration = normalizeDuration(durationMs);
  const charactersById = new Map(characters.map((character) => [character.id, character]));

  return [...abilityCasts]
    .filter((cast) => (
      Boolean(cast.targetCharacterId)
      && Number.isFinite(cast.telegraphStartsAtMs)
      && Number.isFinite(cast.resolvesAtMs)
      && cast.telegraphStartsAtMs >= 0
      && cast.resolvesAtMs > cast.telegraphStartsAtMs
      && cast.resolvesAtMs <= duration
    ))
    .sort((left, right) => left.telegraphStartsAtMs - right.telegraphStartsAtMs || left.castId.localeCompare(right.castId))
    .flatMap((cast) => {
      const character = charactersById.get(cast.targetCharacterId!);
      if (!character) return [];
      const actionLoadout = character.currentAction?.combatSkillLoadout;
      const dodgeBehavior = normalizeBossDodgeBehavior(
        actionLoadout ? actionLoadout.bossDodgeBehavior : character.combatSkillLoadout?.bossDodgeBehavior,
      );
      const telegraphProfile = normalizeProfile(cast.telegraphProfile);
      if (dodgeBehavior === "hold_position" || dodgeBehavior === "safe_windows" && telegraphProfile === "quick") return [];
      const dodgePercent = bounded(character.attributes?.dodgePercent, 0, 30, 0);
      const difficultyPercent = bounded(cast.dodgeDifficultyPercent, 0, 90, 30);
      const reactionWindowSeconds = rounded((cast.resolvesAtMs - cast.telegraphStartsAtMs) / 1_000);
      const profileModifierPercent = telegraphProfile === "quick" ? -8 : telegraphProfile === "heavy" ? 8 : 0;
      const successChancePercent = bounded(
        rounded(dodgePercent * 4 + reactionWindowSeconds * 4 - difficultyPercent * 0.35 + profileModifierPercent),
        3,
        75,
        3,
      );
      const rollPercent = deterministicPercent(`${cast.castId}:${character.id}:telegraph-dodge`);
      return [{
        castId: cast.castId,
        abilityId: cast.abilityId,
        abilityName: cast.abilityName,
        targetCharacterId: character.id,
        targetCharacterName: character.name,
        occurredAtMs: Math.max(cast.telegraphStartsAtMs, cast.resolvesAtMs - 250),
        dodgePercent,
        difficultyPercent,
        reactionWindowSeconds,
        dodgeBehavior,
        telegraphProfile,
        profileModifierPercent,
        successChancePercent,
        rollPercent,
        dodged: rollPercent < successChancePercent,
      }];
    });
}

function normalizeDuration(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(MAX_DURATION_MS, value)) : 0;
}

function bounded(value: number | undefined, minimum: number, maximum: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function deterministicPercent(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 10_000 / 100;
}

function rounded(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeProfile(value: unknown) {
  return value === "quick" || value === "heavy" ? value : "focused";
}
