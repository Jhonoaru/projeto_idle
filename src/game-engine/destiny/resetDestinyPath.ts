import type { Character } from "../../shared/types";
import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { createDefaultDestinyState } from "./createDefaultDestinyState";
import { normalizeDestinyState } from "./normalizeDestinyState";

export function getDestinyResetCost(character: Character) {
  const destiny = normalizeDestinyState(character);
  return destiny.unlockedNodeIds.length * 1000;
}

export function resetDestinyPath(character: Character) {
  const updatedCharacterBase: Character = {
    ...character,
    destiny: createDefaultDestinyState(character),
  };
  const attributes = calculateCharacterAttributes(updatedCharacterBase);

  return {
    ...updatedCharacterBase,
    attributes,
    capacityMax: attributes.capacity,
  };
}
