import type { InventoryItem } from "../../shared/types";
import { canMoveItemToContainer } from "./canMoveItemToContainer";

export function moveItemToContainer(
  allItems: InventoryItem[],
  itemToMoveId: string,
  containerInventoryItemId: string,
  externalContainer?: InventoryItem,
) {
  const itemToMove = allItems.find((inventoryItem) => inventoryItem.id === itemToMoveId);
  const container =
    allItems.find((inventoryItem) => inventoryItem.id === containerInventoryItemId) ??
    externalContainer;

  if (!itemToMove || !container) {
    return { moved: false, items: allItems, reason: "Item ou container nao encontrado." };
  }

  const validation = canMoveItemToContainer(itemToMove, container, allItems);

  if (!validation.canMove) {
    return { moved: false, items: allItems, reason: validation.reason };
  }

  return {
    moved: true,
    items: allItems.map((inventoryItem) =>
      inventoryItem.id === itemToMoveId
        ? { ...inventoryItem, parentContainerId: containerInventoryItemId }
        : inventoryItem,
    ),
  };
}
