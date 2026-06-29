import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import type { Character, HuntSupplyUsage, InventoryItem } from "../../shared/types";
import { findSupplyItemsInInventory } from "./findSupplyItemsInInventory";

export function consumeSupplies(
  character: Character,
  supplyUsage: HuntSupplyUsage[],
) {
  let inventory = character.inventory;
  const consumed: HuntSupplyUsage[] = [];
  const logs: string[] = [];

  for (const usage of supplyUsage) {
    let remaining = usage.quantityUsed;
    let valueUsed = 0;
    const stacks = findSupplyItemsInInventory({ ...character, inventory }, usage.itemId);

    for (const stack of stacks) {
      if (remaining <= 0) break;

      const quantityFromStack = Math.min(stack.quantity, remaining);
      remaining -= quantityFromStack;
      valueUsed += quantityFromStack * stack.item.value;
      inventory = removeQuantity(inventory, stack.id, quantityFromStack);
    }

    const quantityUsed = usage.quantityUsed - remaining;

    if (quantityUsed > 0) {
      consumed.push({ ...usage, quantityUsed, valueUsed });
      logs.push(`${usage.itemName} x${quantityUsed}`);
    }
  }

  return {
    character: {
      ...character,
      inventory,
      capacityUsed: calculateCapacityUsed(inventory),
    },
    suppliesUsed: consumed,
    logs:
      logs.length > 0
        ? [`${character.name} consumiu ${logs.join(", ")}.`]
        : [],
  };
}

function removeQuantity(
  items: InventoryItem[],
  inventoryItemId: string,
  quantity: number,
) {
  return items.flatMap((item) => {
    if (item.id !== inventoryItemId) return [item];

    const remaining = item.quantity - quantity;

    return remaining > 0 ? [{ ...item, quantity: remaining }] : [];
  });
}
