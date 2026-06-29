import { VOCATION_CONFIGS } from "../../data/vocations";
import type { Character, Skill, SkillName, Vocation } from "../../shared/types";

export function getMainSkillName(vocation: Vocation): SkillName {
  return VOCATION_CONFIGS[vocation].mainSkills[0];
}

export function getMainSkill(
  character: Pick<Character, "vocation" | "skills">,
): Skill {
  const mainSkills = VOCATION_CONFIGS[character.vocation].mainSkills;

  return mainSkills
    .map((skillName) => character.skills[skillName])
    .sort((first, second) => second.level - first.level)[0];
}
