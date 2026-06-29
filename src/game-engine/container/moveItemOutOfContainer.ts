import type { InventoryItem } from "../../shared/types";

export function moveItemOutOfContainer(
  allItems: InventoryItem[],
  itemToMoveId: string,
) {
  const itemToMove = allItems.find((inventoryItem) => inventoryItem.id === itemToMoveId);

  if (!itemToMove) {
    return { moved: false, items: allItems, reason: "Item nao encontrado." };
  }

  if (!itemToMove.parentContainerId) {
    return { moved: false, items: allItems, reason: "Item ja esta na raiz." };
  }

  return {
    moved: true,
    items: allItems.map((inventoryItem) =>
      inventoryItem.id === itemToMoveId
        ? { ...inventoryItem, parentContainerId: null }
        : inventoryItem,
    ),
  };
}
