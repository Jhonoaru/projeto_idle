import { monsterFocusConfig } from "../../data/monsterFocus";
import type { MonsterFocusState } from "../../shared/types";

export function createDefaultMonsterFocusState(): MonsterFocusState {
  return {
    slots: Array.from({ length: monsterFocusConfig.maxSlots }, (_, index) => ({
      slotIndex: index,
      status: index < monsterFocusConfig.unlockedSlotsDefault ? "empty" : "locked",
      expiresAt: null,
      rerollCount: 0,
    })),
    lastFreeRerollAt: null,
  };
}
