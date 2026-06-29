import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import { canEquipItem } from "./canEquipItem";
import type { Character, EquipmentSlot, InventoryItem } from "../../shared/types";

export function equipItem(character: Character, inventoryItem: InventoryItem) {
  const validation = canEquipItem(character, inventoryItem);

  if (!validation.canEquip || !inventoryItem.item.equipmentSlot) {
    return {
      character,
      equipped: false,
      reason: validation.reason ?? "cannot equip item.",
    };
  }

  const slot = inventoryItem.item.equipmentSlot;
  const previousEquipped = character.equipment[slot];
  const inventoryWithoutEquippedItem = removeOneItem(
    character.inventory,
    inventoryItem.id,
  );
  const returnedPrevious = previousEquipped
    ? [{ ...previousEquipped, location: "character" as const, ownerCharacterId: character.id }]
    : [];
  const inventory = mergeStackableItems([
    ...inventoryWithoutEquippedItem,
    ...returnedPrevious,
  ]);
  const equipment = {
    ...character.equipment,
    [slot]: {
      ...inventoryItem,
      quantity: 1,
      location: "character" as const,
      ownerCharacterId: character.id,
    },
  };
  const characterWithEquipment = {
    ...character,
    inventory,
    equipment,
    capacityUsed: calculateCapacityUsed(inventory),
  };
  const attributes = calculateCharacterAttributes(characterWithEquipment);

  if (characterWithEquipment.capacityUsed > attributes.capacity) {
    return {
      character,
      equipped: false,
      reason: "not enough capacity after changing equipment.",
    };
  }

  return {
    character: {
      ...characterWithEquipment,
      attributes,
      capacityMax: attributes.capacity,
    },
    equipped: true,
    slot,
  };
}

function removeOneItem(items: InventoryItem[], inventoryItemId: string) {
  return items.flatMap((item) => {
    if (item.id !== inventoryItemId) {
      return [item];
    }

    return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
  });
}

export type EquipItemResult = ReturnType<typeof equipItem> & {
  slot?: EquipmentSlot;
};
