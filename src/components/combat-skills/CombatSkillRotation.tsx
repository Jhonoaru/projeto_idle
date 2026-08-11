import { getCombatSkills, getPrimaryCombatSkill } from "../../data/combatSkills";
import type { Character, PartyRole } from "../../shared/types";
import { CombatSkillIcon } from "./CombatSkillIcon";

interface CombatSkillRotationProps {
  actors: Array<{ character: Character; role?: PartyRole }>;
  resolved?: boolean;
}

export function CombatSkillRotation({ actors, resolved = false }: CombatSkillRotationProps) {
  return (
    <div className={`combat-skill-rotation ${resolved ? "is-resolved" : ""}`} aria-label="Party skill rotation">
      {actors.slice(0, 5).map(({ character, role }) => {
        const skill = getPrimaryCombatSkill(character.vocation, character.level, "attack");
        const unlocked = getCombatSkills(character.vocation, "attack").filter(
          (entry) => character.level >= entry.levelRequired,
        ).length;

        return (
          <div className="combat-skill-rotation-entry" key={character.id} title={`${character.name}: ${skill.name}`}>
            <CombatSkillIcon skill={skill} size="small" />
            <span><strong>{skill.name}</strong><small>{role ?? character.vocation} · {unlocked}/4</small></span>
            <i />
          </div>
        );
      })}
    </div>
  );
}
