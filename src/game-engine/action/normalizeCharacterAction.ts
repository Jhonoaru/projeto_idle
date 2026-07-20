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
  const targetSkill = action.targetSkill && trainingTargets.includes(action.targetSkill)
    ? action.targetSkill
    : inferTrainingTarget(action, skills);

  return {
    ...action,
    targetSkill,
    durationMinutes: normalizeTrainingDuration(action.durationMinutes),
    trainingType: normalizeTrainingType(action.trainingType),
    expectedGainPercent: normalizeExpectedGain(action.expectedGainPercent),
  };
}

function inferTrainingTarget(action: CharacterAction, skills: SkillSet) {
  const searchableText = `${action.label ?? ""} ${action.targetName ?? ""}`.toLowerCase();
  return trainingTargets.find((target) =>
    trainingTargetAliases[target].some((alias) => searchableText.includes(alias)),
  ) ?? getHighestSkill(skills);
}

function normalizeTrainingDuration(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(480, Math.max(1, Math.floor(value)))
    : undefined;
}

function normalizeTrainingType(value: unknown) {
  return value === "offline" || value === "dummy" || value === "exercise" ? value : undefined;
}

function normalizeExpectedGain(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000
    ? value
    : undefined;
}

function getHighestSkill(skills: SkillSet): TrainingTarget {
  return trainingTargets.reduce((highest, target) => {
    const highestLevel = Number.isFinite(skills[highest]?.level) ? skills[highest].level : 0;
    const targetLevel = Number.isFinite(skills[target]?.level) ? skills[target].level : 0;
    return targetLevel > highestLevel ? target : highest;
  }, "sword");
}
