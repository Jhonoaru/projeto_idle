import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import type { Character, EquipmentSlot, GuildDepot, InventoryItem } from "../../shared/types";

export function isForgeEligibleItem(inventoryItem: InventoryItem) {
  return inventoryItem.item.type === "equipment" && !inventoryItem.item.stackable;
}

export function getForgeableItems(character: Character) {
  const equipped = Object.values(character.equipment).filter(Boolean) as InventoryItem[];
  return [...character.inventory, ...equipped].filter(isForgeEligibleItem);
}

export function updateCharacterItem(
  character: Character,
  inventoryItemId: string,
  updater: (item: InventoryItem) => InventoryItem,
): Character {
  let changedInventory = false;
  const inventory = character.inventory.map((item) => {
    if (item.id !== inventoryItemId) return item;
    changedInventory = true;
    return updater(item);
  });

  const equipment = Object.fromEntries(
    Object.entries(character.equipment).map(([slot, item]) => [
      slot,
      item?.id === inventoryItemId ? updater(item) : item,
    ]),
  ) as Character["equipment"];

  return {
    ...character,
    inventory,
    equipment,
    capacityUsed: changedInventory ? calculateCapacityUsed(inventory) : character.capacityUsed,
  };
}

export function findCharacterItem(character: Character, inventoryItemId: string) {
  const inventoryItem = character.inventory.find((item) => item.id === inventoryItemId);
  if (inventoryItem) return { item: inventoryItem, slot: undefined as EquipmentSlot | undefined };

  const equipped = Object.entries(character.equipment).find(([, item]) => item?.id === inventoryItemId);
  return equipped?.[1] ? { item: equipped[1], slot: equipped[0] as EquipmentSlot } : undefined;
}

export function updateGuildDepotItem(
  depot: GuildDepot,
  inventoryItemId: string,
  updater: (item: InventoryItem) => InventoryItem,
): GuildDepot {
  const items = depot.items.map((item) => (item.id === inventoryItemId ? updater(item) : item));
  return { ...depot, items, capacityUsed: calculateCapacityUsed(items) };
}
