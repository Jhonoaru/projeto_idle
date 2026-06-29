import { calculateExerciseTrainingGain } from "./calculateExerciseTrainingGain";
import { calculateOfflineTrainingGain } from "./calculateOfflineTrainingGain";
import type { Character, TrainingTarget, TrainingType } from "../../shared/types";

export function calculateTrainingGain(
  character: Character,
  targetSkill: TrainingTarget,
  durationMinutes: number,
  type: TrainingType,
) {
  if (type === "exercise") {
    return calculateExerciseTrainingGain(character, targetSkill, durationMinutes);
  }

  if (type === "dummy") {
    return Number(
      (calculateExerciseTrainingGain(character, targetSkill, durationMinutes) * 0.72).toFixed(2),
    );
  }

  return calculateOfflineTrainingGain(character, targetSkill, durationMinutes);
}
