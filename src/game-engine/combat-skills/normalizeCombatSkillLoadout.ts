import { getUnlockedCombatSkills } from "../../data/combatSkills";
import type { BossDefensiveResponsePriority, BossDodgeBehavior, Character, CombatSkillLoadout, Vocation } from "../../shared/types";

interface CombatSkillOwner {
  vocation: Vocation;
  level: number;
  combatSkillLoadout?: CombatSkillLoadout;
}

export function normalizeCombatSkillLoadout(owner: CombatSkillOwner): CombatSkillLoadout {
  const attacks = getUnlockedCombatSkills(owner.vocation, normalizeLevel(owner.level), "attack");
  const supports = getUnlockedCombatSkills(owner.vocation, normalizeLevel(owner.level), "support");
  const attackIds = new Set(attacks.map((skill) => skill.id));
  const supportIds = new Set(supports.map((skill) => skill.id));
  const candidate = owner.combatSkillLoadout;
  const configuredAttacks = Array.isArray(candidate?.attackSkillIds)
    ? [...new Set(candidate.attackSkillIds)].filter((id) => attackIds.has(id)).slice(0, 4)
    : [];
  const customized = candidate?.customized === true;
  const attackSkillIds = customized && configuredAttacks.length > 0
    ? configuredAttacks
    : attacks.slice(0, 4).map((skill) => skill.id);
  const supportDisabled = candidate?.supportDisabled === true;
  const supportSkillId = supportDisabled
    ? null
    : candidate?.supportSkillId && supportIds.has(candidate.supportSkillId)
      ? candidate.supportSkillId
      : supports.at(-1)?.id ?? null;
  const defensiveResponsePriority = normalizeDefensiveResponsePriority(candidate?.defensiveResponsePriority);
  const bossDodgeBehavior = normalizeBossDodgeBehavior(candidate?.bossDodgeBehavior);

  return { attackSkillIds, supportSkillId, customized, supportDisabled, defensiveResponsePriority, bossDodgeBehavior };
}

export function withNormalizedCombatSkillLoadout(character: Character): Character {
  return { ...character, combatSkillLoadout: normalizeCombatSkillLoadout(character) };
}

function normalizeLevel(value: number) {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function normalizeDefensiveResponsePriority(value: unknown): BossDefensiveResponsePriority {
  return value === "prevent" || value === "recover" ? value : "automatic";
}

export function normalizeBossDodgeBehavior(value: unknown): BossDodgeBehavior {
  return value === "safe_windows" || value === "hold_position" ? value : "automatic";
}
