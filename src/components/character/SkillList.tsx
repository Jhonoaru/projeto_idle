import { SKILL_LABELS } from "../../shared/constants";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import type { Skill, SkillSet } from "../../shared/types";
import type { Character } from "../../shared/types";

interface SkillListProps {
  skills: SkillSet;
  character?: Character;
}

export function SkillList({ skills, character }: SkillListProps) {
  const skillEntries = Object.values(skills) as Skill[];
  const mainSkillName = character ? getMainSkill(character).name : undefined;

  return (
    <div className="skill-list" aria-label="Character skills">
      {skillEntries.map((skill) => (
        <div
          className={`skill-row ${skill.name === mainSkillName ? "is-main-skill" : ""}`.trim()}
          key={skill.name}
        >
          <div className="skill-row-header">
            <span>{SKILL_LABELS[skill.name]}</span>
            <strong>{skill.level}</strong>
          </div>
          <div className="skill-progress" aria-hidden="true">
            <span style={{ width: `${skill.progressPercent}%` }} />
          </div>
          <small>{skill.progressPercent}%</small>
        </div>
      ))}
    </div>
  );
}
