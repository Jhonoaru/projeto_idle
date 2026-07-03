import { monsters } from "../../data/monsters";
import type { Character } from "../../shared/types";
import { calculateMonsterFocusBonuses } from "./calculateMonsterFocusBonuses";
import { normalizeMonsterFocusState } from "./normalizeMonsterFocusState";
import type { HuntArea, HuntSimulationResult } from "../../shared/types";

export function consumeMonsterFocusCharge(
  character: Character,
  hunt: HuntArea,
  result: HuntSimulationResult,
) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const bonuses = calculateMonsterFocusBonuses(character, hunt, result);
  const logs: string[] = [];

  for (const bonus of bonuses.applied) {
    const slot = focus.slots[bonus.slotIndex];
    if (!slot || slot.status !== "active") continue;

    const remainingHunts = Math.max(0, (slot.remainingHunts ?? 0) - 1);
    focus.slots[bonus.slotIndex] = {
      ...slot,
      remainingHunts,
      status: remainingHunts <= 0 ? "expired" : "active",
      expiresAt: remainingHunts <= 0 ? new Date().toISOString() : slot.expiresAt ?? null,
    };

    logs.push(
      `Monster Focus: ${bonus.monsterName} remaining hunts ${remainingHunts}/10.`,
    );

    if (remainingHunts <= 0) {
      logs.push(
        `${getMonsterName(bonus.monsterId, bonus.monsterName)} Monster Focus expired.`,
      );
    }
  }

  return {
    character: {
      ...character,
      monsterFocus: focus,
    },
    logs,
  };
}

function getMonsterName(monsterId: string, fallback: string) {
  return Object.values(monsters).find((monster) => monster.id === monsterId)?.name ?? fallback;
}
