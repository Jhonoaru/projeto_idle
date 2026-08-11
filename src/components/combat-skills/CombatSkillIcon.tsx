import type { CSSProperties } from "react";
import { getCombatEffectProfile } from "../../data/combatEffectProfiles";
import type { CombatSkillDefinition } from "../../data/combatSkills";

interface CombatSkillIconProps {
  skill: CombatSkillDefinition;
  locked?: boolean;
  size?: "small" | "medium" | "large";
}

export function CombatSkillIcon({ skill, locked = false, size = "medium" }: CombatSkillIconProps) {
  const profile = getCombatEffectProfile(skill.vocation);
  const style = {
    "--skill-accent": profile.accent,
    "--skill-secondary": profile.secondary,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={`combat-skill-icon visual-${skill.visual} size-${size} ${locked ? "is-locked" : ""}`.trim()}
      style={style}
    >
      <i /><b />
      <em>{skill.code}</em>
    </span>
  );
}
