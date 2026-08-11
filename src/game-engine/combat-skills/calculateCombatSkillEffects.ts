import { combatSkills } from "../../data/combatSkills";
import type {
  Character,
  CharacterAction,
  CombatSkillEffectSummary,
  CombatSkillPartyEffectSummary,
} from "../../shared/types";
import { simulateCombatSkillRotation } from "./simulateCombatSkillRotation";

const MAX_ATTACK_BONUS_PERCENT = 8;
const MAX_DEATH_RISK_REDUCTION_PERCENT = 10;
const MAX_SUPPLY_REDUCTION_PERCENT = 8;

export function calculateCombatSkillEffects(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
): CombatSkillEffectSummary {
  const durationMinutes = normalizeDurationMinutes(elapsedMs);
  const rotation = simulateCombatSkillRotation(character, action, elapsedMs);
  const entries = rotation.casts.flatMap((cast) => {
    const definition = combatSkills.find((skill) => skill.id === cast.skillId);
    if (!definition || cast.casts <= 0) return [];

    return [{
      skillId: definition.id,
      skillName: definition.name,
      casts: cast.casts,
      attackImpact: cast.casts * definition.effect.attack,
      survivalImpact: cast.casts * definition.effect.survival,
      supplyImpact: cast.casts * definition.effect.supply,
    }];
  });
  const total = entries.reduce(
    (sum, entry) => ({
      attack: sum.attack + entry.attackImpact,
      survival: sum.survival + entry.survivalImpact,
      supply: sum.supply + entry.supplyImpact,
    }),
    { attack: 0, survival: 0, supply: 0 },
  );

  return {
    totalCasts: rotation.totalCasts,
    manaSpent: rotation.manaSpent,
    attackBonusPercent: boundedPercent(total.attack * 0.35 / durationMinutes, MAX_ATTACK_BONUS_PERCENT),
    deathRiskReductionPercent: boundedPercent(total.survival * 0.9 / durationMinutes, MAX_DEATH_RISK_REDUCTION_PERCENT),
    supplyReductionPercent: boundedPercent(total.supply * 0.7 / durationMinutes, MAX_SUPPLY_REDUCTION_PERCENT),
    entries,
  };
}

export function calculatePartyCombatSkillEffects(
  characters: Character[],
  elapsedMs: number,
): CombatSkillPartyEffectSummary {
  const members = characters.map((character) => ({
    characterId: character.id,
    characterName: character.name,
    effects: calculateCombatSkillEffects(character, character.currentAction, elapsedMs),
  }));
  const divisor = Math.max(1, members.length);

  return {
    attackBonusPercent: rounded(members.reduce((sum, member) => sum + member.effects.attackBonusPercent, 0) / divisor),
    deathRiskReductionPercent: rounded(members.reduce((sum, member) => sum + member.effects.deathRiskReductionPercent, 0) / divisor),
    totalCasts: members.reduce((sum, member) => sum + member.effects.totalCasts, 0),
    manaSpent: members.reduce((sum, member) => sum + member.effects.manaSpent, 0),
    members,
  };
}

export function formatCombatSkillEffectLog(effects: CombatSkillEffectSummary) {
  return `Skill effects: +${effects.attackBonusPercent}% clear speed, -${effects.deathRiskReductionPercent}% death risk, -${effects.supplyReductionPercent}% supplies.`;
}

function normalizeDurationMinutes(elapsedMs: number) {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 1;
  return Math.max(1, elapsedMs / 60_000);
}

function boundedPercent(value: number, maximum: number) {
  return rounded(Math.min(maximum, Math.max(0, Number.isFinite(value) ? value : 0)));
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
