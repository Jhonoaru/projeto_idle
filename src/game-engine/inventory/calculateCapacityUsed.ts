import type { InventoryItem } from "../../shared/types";

export function calculateCapacityUsed(items: InventoryItem[]) {
  return Number(
    items
      .reduce((sum, inventoryItem) => {
        return sum + inventoryItem.item.weight * inventoryItem.quantity;
      }, 0)
      .toFixed(2),
  );
}
