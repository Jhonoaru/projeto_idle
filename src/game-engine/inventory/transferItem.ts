import { calculateCapacityUsed } from "./calculateCapacityUsed";
import { mergeStackableItems } from "./mergeStackableItems";
import type { Character, GuildDepot, InventoryItem } from "../../shared/types";

export type TransferDirection = "characterToDepot" | "depotToCharacter";

export function transferItem(
  character: Character,
  depot: GuildDepot,
  inventoryItemId: string,
  quantity: number,
  direction: TransferDirection,
) {
  if (direction === "characterToDepot") {
    const sourceItem = character.inventory.find((item) => item.id === inventoryItemId);

    if (!sourceItem) {
      return { character, depot, movedQuantity: 0, rejectedReason: "Item not found." };
    }

    const movedQuantity = Math.min(quantity, sourceItem.quantity);
    const movedItem: InventoryItem = {
      ...sourceItem,
      id: `${sourceItem.id}-depot-${Date.now()}`,
      quantity: movedQuantity,
      ownerCharacterId: undefined,
      location: "guildDepot",
      parentContainerId: null,
    };
    const characterInventory = removeQuantity(character.inventory, inventoryItemId, movedQuantity);
    const depotItems = mergeStackableItems([...depot.items, movedItem]);

    return {
      character: {
        ...character,
        inventory: characterInventory,
        capacityUsed: calculateCapacityUsed(characterInventory),
      },
      depot: {
        ...depot,
        items: depotItems,
        capacityUsed: calculateCapacityUsed(depotItems),
      },
      movedQuantity,
    };
  }

  const sourceItem = depot.items.find((item) => item.id === inventoryItemId);

  if (!sourceItem) {
    return { character, depot, movedQuantity: 0, rejectedReason: "Depot item not found." };
  }

  const movedQuantity = Math.min(quantity, sourceItem.quantity);
  const movedWeight = sourceItem.item.weight * movedQuantity;
  const freeCapacity = character.capacityMax - calculateCapacityUsed(character.inventory);

  if (movedWeight > freeCapacity) {
    return {
      character,
      depot,
      movedQuantity: 0,
      rejectedReason: `${character.name} cannot carry ${sourceItem.item.name}.`,
    };
  }

  const movedItem: InventoryItem = {
    ...sourceItem,
    id: `${sourceItem.id}-character-${Date.now()}`,
    quantity: movedQuantity,
    ownerCharacterId: character.id,
    location: "character",
    parentContainerId: null,
  };
  const depotItems = removeQuantity(depot.items, inventoryItemId, movedQuantity);
  const characterInventory = mergeStackableItems([...character.inventory, movedItem]);

  return {
    character: {
      ...character,
      inventory: characterInventory,
      capacityUsed: calculateCapacityUsed(characterInventory),
    },
    depot: {
      ...depot,
      items: depotItems,
      capacityUsed: calculateCapacityUsed(depotItems),
    },
    movedQuantity,
  };
}

function removeQuantity(
  items: InventoryItem[],
  inventoryItemId: string,
  quantity: number,
) {
  return items.flatMap((item) => {
    if (item.id !== inventoryItemId) {
      return [item];
    }

    const remaining = item.quantity - quantity;

    return remaining > 0 ? [{ ...item, quantity: remaining }] : [];
  });
}
