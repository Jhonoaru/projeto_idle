import { calculateCapacityUsed } from "./calculateCapacityUsed";
import type { Character, HuntLootResult } from "../../shared/types";

export function canCarryLoot(character: Character, lootItems: HuntLootResult[]) {
  const currentCapacity = calculateCapacityUsed(character.inventory);
  const lootWeight = lootItems.reduce((sum, loot) => sum + loot.weightTotal, 0);

  return currentCapacity + lootWeight <= character.capacityMax;
}
