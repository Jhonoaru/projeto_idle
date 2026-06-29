import type { Character, InventoryItem } from "../../shared/types";

export function canEquipItem(character: Character, inventoryItem: InventoryItem) {
  const item = inventoryItem.item;

  if (item.type !== "equipment") {
    return { canEquip: false, reason: "item is not equipment." };
  }

  if (!item.equipmentSlot) {
    return { canEquip: false, reason: "item has no equipment slot." };
  }

  if (item.stackable) {
    return { canEquip: false, reason: "stackable items cannot be equipped." };
  }

  if (item.levelRequirement && character.level < item.levelRequirement) {
    return {
      canEquip: false,
      reason: `requires level ${item.levelRequirement}.`,
    };
  }

  if (
    item.vocationRestriction &&
    !item.vocationRestriction.includes(character.vocation)
  ) {
    return { canEquip: false, reason: "vocation incompatible." };
  }

  return { canEquip: true };
}
