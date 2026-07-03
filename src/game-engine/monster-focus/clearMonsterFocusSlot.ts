import type { Character } from "../../shared/types";
import { normalizeMonsterFocusState } from "./normalizeMonsterFocusState";

export function clearMonsterFocusSlot(character: Character, slotIndex: number): Character {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const slot = focus.slots[slotIndex];

  if (!slot || slot.status === "locked") return { ...character, monsterFocus: focus };

  focus.slots[slotIndex] = {
    slotIndex,
    status: "empty",
    expiresAt: null,
    rerollCount: 0,
  };

  return {
    ...character,
    monsterFocus: focus,
  };
}
