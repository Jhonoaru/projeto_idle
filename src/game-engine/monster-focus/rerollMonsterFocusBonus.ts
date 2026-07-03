import {
  monsterFocusBonusTypes,
  monsterFocusConfig,
} from "../../data/monsterFocus";
import type { Character, MonsterFocusBonusType } from "../../shared/types";
import { normalizeMonsterFocusState } from "./normalizeMonsterFocusState";

export function getMonsterFocusRerollCost(character: Character, slotIndex: number) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const slot = focus.slots[slotIndex];

  if (!slot || slot.status !== "active") return 0;

  return monsterFocusConfig.rerollGoldCostBase * ((slot.rerollCount ?? 0) + 1);
}

export function rerollMonsterFocusBonus(
  character: Character,
  slotIndex: number,
): { character: Character; cost: number; oldBonusType?: MonsterFocusBonusType; newBonusType?: MonsterFocusBonusType } {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const slot = focus.slots[slotIndex];

  if (!slot || slot.status !== "active" || !slot.bonusType) {
    throw new Error("Monster Focus ativo nao encontrado para reroll.");
  }

  const alternatives = monsterFocusBonusTypes.filter((type) => type !== slot.bonusType);
  const rerollCount = slot.rerollCount ?? 0;
  const newBonusType = alternatives[rerollCount % alternatives.length];
  const cost = getMonsterFocusRerollCost(character, slotIndex);

  focus.slots[slotIndex] = {
    ...slot,
    bonusType: newBonusType,
    bonusPercent: monsterFocusConfig.bonusPercentByType[newBonusType],
    rerollCount: rerollCount + 1,
  };

  return {
    character: {
      ...character,
      monsterFocus: focus,
    },
    cost,
    oldBonusType: slot.bonusType,
    newBonusType,
  };
}
