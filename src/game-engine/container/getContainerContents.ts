import type { InventoryItem } from "../../shared/types";

export function getContainerContents(
  allItems: InventoryItem[],
  containerInventoryItemId: string,
) {
  return allItems.filter(
    (inventoryItem) => inventoryItem.parentContainerId === containerInventoryItemId,
  );
}
