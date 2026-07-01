import { MAX_OFFLINE_AUTO_REPEAT_RUNS } from "./constants";
import type { Character } from "../../shared/types";

export function calculateOfflineAutoRepeatRuns(character: Character, now = new Date()) {
  const action = character.currentAction;
  if (!action?.autoRepeat?.enabled || action.type !== "hunting" || !action.durationMinutes) {
    return { possibleRuns: 0, cappedRuns: 0 };
  }

  const completedAt = action.offlineCompletedAt ? new Date(action.offlineCompletedAt).getTime() : now.getTime();
  const elapsedAfterCompletion = Math.max(0, now.getTime() - completedAt);
  const possibleRuns = Math.floor(elapsedAfterCompletion / Math.max(1, action.durationMinutes * 60_000));

  return {
    possibleRuns,
    cappedRuns: Math.min(possibleRuns, MAX_OFFLINE_AUTO_REPEAT_RUNS),
  };
}

