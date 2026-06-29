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

  if (item.equipmentSlot === "offhand") {
    if (item.offhandType === "quiver" && character.vocation !== "Ranger") {
      return { canEquip: false, reason: "only Rangers can equip quivers." };
    }

    if (item.offhandType === "shield" && character.vocation === "Ranger") {
      return { canEquip: false, reason: "Rangers use quivers in the offhand slot." };
    }

    if (
      item.offhandType === "shield" &&
      !["Guardian", "Monk", "Warden"].includes(character.vocation)
    ) {
      return { canEquip: false, reason: "this vocation cannot equip shields yet." };
    }
  }

  return { canEquip: true };
}
