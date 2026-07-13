import { SKILL_LABELS } from "../../shared/constants";
import type { CharacterAction, SkillSet, TrainingTarget } from "../../shared/types";

const trainingTargets = Object.keys(SKILL_LABELS) as TrainingTarget[];

const trainingTargetAliases: Record<TrainingTarget, string[]> = {
  sword: ["sword"],
  axe: ["axe"],
  club: ["club"],
  distance: ["distance", "ranged", "archery"],
  fist: ["fist", "unarmed"],
  shielding: ["shielding", "shield"],
  magic: ["magic", "spell"],
};

export function normalizeCharacterAction(
  action: CharacterAction | undefined,
  skills: SkillSet,
): CharacterAction | undefined {
  if (!action || action.type !== "training") return action;
  if (action.targetSkill && trainingTargets.includes(action.targetSkill)) return action;

  const searchableText = `${action.label ?? ""} ${action.targetName ?? ""}`.toLowerCase();
  const inferredFromText = trainingTargets.find((target) =>
    trainingTargetAliases[target].some((alias) => searchableText.includes(alias)),
  );
  const targetSkill = inferredFromText ?? getHighestSkill(skills);

  return {
    ...action,
    targetSkill,
  };
}

function getHighestSkill(skills: SkillSet): TrainingTarget {
  return trainingTargets.reduce((highest, target) => {
    const highestLevel = Number.isFinite(skills[highest]?.level) ? skills[highest].level : 0;
    const targetLevel = Number.isFinite(skills[target]?.level) ? skills[target].level : 0;
    return targetLevel > highestLevel ? target : highest;
  }, "sword");
}
