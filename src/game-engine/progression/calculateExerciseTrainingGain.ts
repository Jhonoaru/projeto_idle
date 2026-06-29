import { trainingAffinity } from "./calculateOfflineTrainingGain";
import type { Character, TrainingTarget } from "../../shared/types";

export function calculateExerciseTrainingGain(
  character: Character,
  targetSkill: TrainingTarget,
  durationMinutes: number,
) {
  const skillLevel = character.skills[targetSkill].level;
  const difficulty = 1 + skillLevel / 95;

  return Number(
    ((durationMinutes / 60) * 24 * trainingAffinity(character, targetSkill) / difficulty).toFixed(2),
  );
}
