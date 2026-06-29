import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import type { Character, EquipmentSlot } from "../../shared/types";

export function unequipItem(character: Character, slot: EquipmentSlot) {
  const equippedItem = character.equipment[slot];

  if (!equippedItem) {
    return { character, unequipped: false, reason: "slot is already empty." };
  }

  const equipment = { ...character.equipment };
  delete equipment[slot];
  const inventory = mergeStackableItems([
    ...character.inventory,
    {
      ...equippedItem,
      id: `${equippedItem.id}-unequipped-${Date.now()}`,
      location: "character" as const,
      ownerCharacterId: character.id,
    },
  ]);
  const capacityUsed = calculateCapacityUsed(inventory);
  const attributesAfterUnequip = calculateCharacterAttributes({
    ...character,
    equipment,
  });

  if (capacityUsed > attributesAfterUnequip.capacity) {
    return {
      character,
      unequipped: false,
      reason: `${character.name} does not have enough capacity to unequip ${equippedItem.item.name}.`,
    };
  }
  const characterWithoutEquipment = {
    ...character,
    equipment,
    inventory,
    capacityUsed,
  };

  return {
    character: {
      ...characterWithoutEquipment,
      attributes: attributesAfterUnequip,
      capacityMax: attributesAfterUnequip.capacity,
    },
    unequipped: true,
    itemName: equippedItem.item.name,
  };
}
