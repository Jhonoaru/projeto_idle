import { createInventoryItem } from "../../data/inventoryFactory";
import { calculateCapacityUsed } from "./calculateCapacityUsed";
import { mergeStackableItems } from "./mergeStackableItems";
import type { Character, HuntLootResult, InventoryItem } from "../../shared/types";

export function addLootToInventory(
  character: Character,
  lootItems: HuntLootResult[],
) {
  const acceptedItems: InventoryItem[] = [];
  const rejectedLoot: HuntLootResult[] = [];
  let capacityUsed = calculateCapacityUsed(character.inventory);

  for (const loot of lootItems) {
    const unitWeight = loot.item.weight;
    const freeCapacity = Math.max(0, character.capacityMax - capacityUsed);
    const maxQuantityByCapacity =
      unitWeight <= 0 ? loot.quantity : Math.floor(freeCapacity / unitWeight);
    const acceptedQuantity = Math.min(loot.quantity, maxQuantityByCapacity);
    const rejectedQuantity = loot.quantity - acceptedQuantity;

    if (acceptedQuantity > 0) {
      acceptedItems.push(
        createInventoryItem(
          loot.itemId,
          acceptedQuantity,
          "character",
          character.id,
        ),
      );
      capacityUsed += acceptedQuantity * unitWeight;
    }

    if (rejectedQuantity > 0) {
      rejectedLoot.push({
        ...loot,
        quantity: rejectedQuantity,
        totalValue: rejectedQuantity * loot.item.value,
        weightTotal: Number((rejectedQuantity * unitWeight).toFixed(2)),
      });
    }
  }

  const inventory = mergeStackableItems([...character.inventory, ...acceptedItems]);
  const updatedCharacter = {
    ...character,
    inventory,
    capacityUsed: calculateCapacityUsed(inventory),
  };

  return {
    character: updatedCharacter,
    rejectedLoot,
  };
}
