import { monsters } from "../../data/monsters";
import { monsterFocusBonusLabels } from "../../data/monsterFocus";
import type { Character, HuntArea, HuntSimulationResult } from "../../shared/types";
import { getMonsterFocusMatchRatio } from "./getMonsterFocusMatchRatio";
import { normalizeMonsterFocusState } from "./normalizeMonsterFocusState";

export interface MonsterFocusAppliedBonus {
  slotIndex: number;
  monsterId: string;
  monsterName: string;
  bonusType: string;
  bonusLabel: string;
  bonusPercent: number;
  matchRatio: number;
  effectivePercent: number;
  remainingHunts: number;
}

export function calculateMonsterFocusBonuses(
  character: Character,
  hunt: HuntArea,
  result?: HuntSimulationResult,
) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const applied: MonsterFocusAppliedBonus[] = [];

  for (const slot of focus.slots) {
    if (
      slot.status !== "active" ||
      !slot.monsterId ||
      !slot.bonusType ||
      !slot.bonusPercent ||
      (slot.remainingHunts ?? 0) <= 0
    ) {
      continue;
    }

    const matchRatio = getMonsterFocusMatchRatio(hunt, slot.monsterId, result);
    if (matchRatio <= 0) continue;

    applied.push({
      slotIndex: slot.slotIndex,
      monsterId: slot.monsterId,
      monsterName: getMonsterName(slot.monsterId),
      bonusType: slot.bonusType,
      bonusLabel: monsterFocusBonusLabels[slot.bonusType],
      bonusPercent: slot.bonusPercent,
      matchRatio,
      effectivePercent: Number((slot.bonusPercent * matchRatio).toFixed(2)),
      remainingHunts: slot.remainingHunts ?? 0,
    });
  }

  return {
    applied,
    experienceMultiplier: multiplierFor(applied, "experience"),
    lootMultiplier: multiplierFor(applied, "loot"),
    goldMultiplier: multiplierFor(applied, "gold"),
    supplyMultiplier: Math.max(0, 1 - percentFor(applied, "supplies") / 100),
    deathRiskMultiplier: Math.max(0, 1 - percentFor(applied, "risk") / 100),
    logs: applied.map(
      (bonus) =>
        `Monster Focus: ${bonus.monsterName} ${bonus.bonusLabel} applied (${bonus.effectivePercent}% effective).`,
    ),
  };
}

function getMonsterName(monsterId: string) {
  return Object.values(monsters).find((monster) => monster.id === monsterId)?.name ?? monsterId;
}

function percentFor(applied: MonsterFocusAppliedBonus[], type: string) {
  return applied
    .filter((bonus) => bonus.bonusType === type)
    .reduce((sum, bonus) => sum + bonus.effectivePercent, 0);
}

function multiplierFor(applied: MonsterFocusAppliedBonus[], type: string) {
  return 1 + percentFor(applied, type) / 100;
}
