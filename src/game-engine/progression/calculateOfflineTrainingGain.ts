import type { Character, TrainingTarget } from "../../shared/types";

export function calculateOfflineTrainingGain(
  character: Character,
  targetSkill: TrainingTarget,
  durationMinutes: number,
) {
  const skillLevel = character.skills[targetSkill].level;
  const vocationMultiplier = trainingAffinity(character, targetSkill);
  const difficulty = 1 + skillLevel / 85;

  return Number(
    ((durationMinutes / 60) * 7.5 * vocationMultiplier / difficulty).toFixed(2),
  );
}

export function trainingAffinity(character: Character, targetSkill: TrainingTarget) {
  const vocation = character.vocation;

  if (vocation === "Guardian") {
    if (["sword", "axe", "club", "shielding"].includes(targetSkill)) return 1.25;
    if (targetSkill === "magic") return 0.25;
    return 0.55;
  }

  if (vocation === "Ranger") {
    if (targetSkill === "distance") return 1.35;
    if (targetSkill === "magic") return 0.75;
    if (targetSkill === "shielding") return 0.7;
    return 0.4;
  }

  if (vocation === "Arcanist") {
    if (targetSkill === "magic") return 1.55;
    return 0.22;
  }

  if (vocation === "Warden") {
    if (targetSkill === "magic") return 1.45;
    if (targetSkill === "shielding") return 0.6;
    return 0.3;
  }

  if (targetSkill === "fist") return 1.5;
  if (targetSkill === "shielding" || targetSkill === "magic") return 0.85;
  return 0.45;
}
