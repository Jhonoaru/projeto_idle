import {
  monsterFocusBonusTypes,
  monsterFocusConfig,
} from "../../data/monsterFocus";
import type {
  Character,
  GuildBestiaryState,
  MonsterFocusBonusType,
} from "../../shared/types";
import { isKnownFocusMonster } from "./getAvailableFocusMonsters";
import { normalizeMonsterFocusState } from "./normalizeMonsterFocusState";

export function activateMonsterFocus(
  character: Character,
  bestiary: GuildBestiaryState | undefined,
  options: {
    slotIndex: number;
    monsterId: string;
    bonusType: MonsterFocusBonusType;
  },
) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const slot = focus.slots[options.slotIndex];

  if (!slot) throw new Error("Monster Focus slot invalido.");
  if (slot.status === "locked") throw new Error("Monster Focus slot bloqueado.");
  if (slot.status === "active") throw new Error("Limpe o slot ativo antes de ativar outro Monster Focus.");
  if (!monsterFocusBonusTypes.includes(options.bonusType)) {
    throw new Error("Bonus de Monster Focus invalido.");
  }
  if (!isKnownFocusMonster(options.monsterId, bestiary)) {
    throw new Error("Criatura ainda nao conhecida no Bestiary.");
  }
  if (
    focus.slots.some(
      (candidate) =>
        candidate.status === "active" &&
        candidate.slotIndex !== options.slotIndex &&
        candidate.monsterId === options.monsterId,
    )
  ) {
    throw new Error("Esta criatura ja esta em outro Monster Focus ativo.");
  }

  const now = new Date().toISOString();
  focus.slots[options.slotIndex] = {
    slotIndex: options.slotIndex,
    status: "active",
    monsterId: options.monsterId,
    bonusType: options.bonusType,
    bonusPercent: monsterFocusConfig.bonusPercentByType[options.bonusType],
    remainingHunts: monsterFocusConfig.defaultRemainingHunts,
    createdAt: now,
    expiresAt: null,
    rerollCount: 0,
  };

  return {
    ...character,
    monsterFocus: focus,
  };
}
