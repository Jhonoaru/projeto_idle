import type { Character, CharacterDestinyState } from "../../shared/types";
import { calculateDestinyPoints } from "./calculateDestinyPoints";

export function createDefaultDestinyState(
  character: Pick<Character, "level">,
): CharacterDestinyState {
  const totalEarnedPoints = calculateDestinyPoints(character.level);

  return {
    unlockedNodeIds: [],
    spentPoints: 0,
    availablePoints: totalEarnedPoints,
    totalEarnedPoints,
    lastCalculatedLevel: Number.isFinite(character.level) ? Math.max(1, Math.floor(character.level)) : 1,
  };
}
