import type { Character } from "../../shared/types";

export function findSupplyItemsInInventory(character: Character, itemId: string) {
  return [...character.inventory]
    .filter((inventoryItem) => inventoryItem.itemId === itemId)
    .sort((a, b) => {
      if (!a.parentContainerId && b.parentContainerId) return -1;
      if (a.parentContainerId && !b.parentContainerId) return 1;
      return 0;
    });
}
