import type { InventoryItem } from "../../shared/types";
import { calculateContainerUsedSlots } from "./calculateContainerUsedSlots";
import { isContainerItem } from "./isContainerItem";

export function canMoveItemToContainer(
  itemToMove: InventoryItem,
  container: InventoryItem,
  allItems: InventoryItem[],
) {
  if (!isContainerItem(container)) {
    return { canMove: false, reason: `${container.item.name} nao e um container.` };
  }

  if (itemToMove.id === container.id) {
    return { canMove: false, reason: "Item nao pode ser movido para dentro dele mesmo." };
  }

  if (isContainerItem(itemToMove)) {
    return {
      canMove: false,
      reason: "Mover container para dentro de outro container fica para uma etapa futura.",
    };
  }

  if (itemToMove.parentContainerId === container.id) {
    return { canMove: false, reason: `${itemToMove.item.name} ja esta neste container.` };
  }

  if (container.parentContainerId === itemToMove.id) {
    return { canMove: false, reason: "Movimento criaria ciclo de containers." };
  }

  const usedSlots = calculateContainerUsedSlots(allItems, container.id);
  const maxSlots = container.item.containerSlots ?? 0;

  if (usedSlots >= maxSlots) {
    return { canMove: false, reason: `${container.item.name} esta cheio.` };
  }

  if (
    container.item.allowedItemTypes?.length &&
    !container.item.allowedItemTypes.includes(itemToMove.item.type)
  ) {
    return {
      canMove: false,
      reason: `${itemToMove.item.name} nao pode ser guardado em ${container.item.name}.`,
    };
  }

  return { canMove: true };
}
