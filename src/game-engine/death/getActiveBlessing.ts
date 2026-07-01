import { getBlessingById } from "../../data/blessings";
import type { Character } from "../../shared/types";

export function getActiveBlessing(character: Character) {
  return getBlessingById(character.blessings?.[0]);
}
