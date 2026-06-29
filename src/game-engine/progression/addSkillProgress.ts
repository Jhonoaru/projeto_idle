import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import type { Character, SkillGainResult, SkillName } from "../../shared/types";

export function addSkillProgress(
  character: Character,
  skillName: SkillName,
  progressAmount: number,
) {
  const skill = character.skills[skillName];
  const oldLevel = skill.level;
  const oldProgressPercent = skill.progressPercent;
  let newLevel = oldLevel;
  let newProgressPercent = oldProgressPercent + Math.max(0, progressAmount);

  while (newProgressPercent >= 100) {
    newLevel += 1;
    newProgressPercent -= 100;
  }

  const updatedCharacterBase: Character = {
    ...character,
    skills: {
      ...character.skills,
      [skillName]: {
        ...skill,
        level: newLevel,
        progressPercent: Number(newProgressPercent.toFixed(2)),
      },
    },
  };
  const attributes = calculateCharacterAttributes(updatedCharacterBase);
  const updatedCharacter: Character = {
    ...updatedCharacterBase,
    attributes,
    capacityMax: attributes.capacity,
  };
  const result: SkillGainResult = {
    skillName,
    oldLevel,
    newLevel,
    oldProgressPercent,
    newProgressPercent: Number(newProgressPercent.toFixed(2)),
    levelsGained: newLevel - oldLevel,
  };

  return { character: updatedCharacter, result };
}
