import { getActiveBlessings, getBlessingById } from "../../data/blessings";
import type { Character } from "../../shared/types";

export function getActiveBlessing(character: Character) {
  return getBlessingById(character.blessings?.[0]);
}

export function getCharacterActiveBlessings(character: Character) {
  return getActiveBlessings(character.blessings);
}
