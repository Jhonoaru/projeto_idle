import { combatSkills } from "../../data/combatSkills";
import type { BossDefensiveResponsePriority, Character } from "../../shared/types";
import { normalizeCombatSkillLoadout } from "./normalizeCombatSkillLoadout";

export function toggleCombatSkill(character: Character, skillId: string): Character {
  const skill = combatSkills.find((entry) => entry.id === skillId);
  if (!skill || skill.vocation !== character.vocation || character.level < skill.levelRequired) return character;

  const loadout = normalizeCombatSkillLoadout(character);
  if (skill.category === "support") {
    return {
      ...character,
      combatSkillLoadout: {
        ...loadout,
        supportSkillId: loadout.supportSkillId === skill.id ? null : skill.id,
        supportDisabled: loadout.supportSkillId === skill.id,
      },
    };
  }

  const selected = loadout.attackSkillIds.includes(skill.id);
  if (!selected && loadout.attackSkillIds.length >= 4) return character;
  const attackSkillIds = selected
    ? loadout.attackSkillIds.at(-1) === skill.id
      ? [skill.id, ...loadout.attackSkillIds.slice(0, -1)]
      : [...loadout.attackSkillIds.filter((id) => id !== skill.id), skill.id]
    : [...loadout.attackSkillIds, skill.id];

  return {
    ...character,
    combatSkillLoadout: {
      ...loadout,
      attackSkillIds,
      customized: true,
    },
  };
}

export function moveCombatSkill(character: Character, skillId: string, direction: -1 | 1): Character {
  const loadout = normalizeCombatSkillLoadout(character);
  const index = loadout.attackSkillIds.indexOf(skillId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= loadout.attackSkillIds.length) return character;

  const attackSkillIds = [...loadout.attackSkillIds];
  [attackSkillIds[index], attackSkillIds[target]] = [attackSkillIds[target], attackSkillIds[index]];
  return { ...character, combatSkillLoadout: { ...loadout, attackSkillIds } };
}

export function setDefensiveResponsePriority(
  character: Character,
  priority: BossDefensiveResponsePriority,
): Character {
  const loadout = normalizeCombatSkillLoadout(character);
  if (loadout.defensiveResponsePriority === priority) return character;
  return {
    ...character,
    combatSkillLoadout: { ...loadout, defensiveResponsePriority: priority },
  };
}
