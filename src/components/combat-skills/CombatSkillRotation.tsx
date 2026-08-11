import { combatSkills } from "../../data/combatSkills";
import { simulateCombatSkillRotation } from "../../game-engine/combat-skills/simulateCombatSkillRotation";
import type { Character, PartyRole } from "../../shared/types";
import { CombatSkillIcon } from "./CombatSkillIcon";

interface CombatSkillRotationProps {
  actors: Array<{ character: Character; role?: PartyRole }>;
  elapsedMs?: number;
  resolved?: boolean;
}

export function CombatSkillRotation({ actors, elapsedMs = 0, resolved = false }: CombatSkillRotationProps) {
  return (
    <div className={`combat-skill-rotation ${resolved ? "is-resolved" : ""}`} aria-label="Party skill rotation">
      {actors.slice(0, 5).map(({ character, role }) => {
        const summary = simulateCombatSkillRotation(character, character.currentAction, elapsedMs);
        const skill = combatSkills.find((entry) => entry.id === summary.activeSkillId)
          ?? combatSkills.find((entry) => entry.id === character.currentAction?.combatSkillLoadout?.attackSkillIds[0])
          ?? combatSkills.find((entry) => entry.vocation === character.vocation && entry.category === "attack")!;

        return (
          <div className="combat-skill-rotation-entry" key={character.id} title={`${character.name}: ${skill.name}`}>
            <CombatSkillIcon skill={skill} size="small" />
            <span><strong>{skill.name}</strong><small>{role ?? character.vocation} / {summary.totalCasts} casts</small></span>
            <i />
          </div>
        );
      })}
    </div>
  );
}
