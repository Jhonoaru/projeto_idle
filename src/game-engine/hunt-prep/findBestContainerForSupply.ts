import { canMoveItemToContainer } from "../container/canMoveItemToContainer";
import type { ContainerType, InventoryItem } from "../../shared/types";

export function findBestContainerForSupply(
  inventory: InventoryItem[],
  itemToMove: InventoryItem,
  targetContainerType?: ContainerType,
) {
  if (!targetContainerType) return undefined;

  return inventory.find(
    (candidate) =>
      candidate.item.containerType === targetContainerType &&
      canMoveItemToContainer(itemToMove, candidate, inventory).canMove,
  );
}
