import type { GuildDepot } from "../../shared/types";
import { getSalvageYield } from "./getSalvageYield";

export function getSalvageAvailability(depot: GuildDepot, inventoryItemId: string) {
  const inventoryItem = depot.items.find((entry) => entry.id === inventoryItemId);
  if (!inventoryItem) return { available: false, reason: "Equipment not found in the Guild Depot.", inventoryItem: undefined, recoveredMaterials: [] };
  if (inventoryItem.item.type !== "equipment") return blocked(inventoryItem, "Only equipment can be salvaged.");
  if (inventoryItem.locked) return blocked(inventoryItem, "Unlock this equipment before salvage.");
  if (inventoryItem.parentContainerId) return blocked(inventoryItem, "Move this equipment out of its container first.");
  if (inventoryItem.item.isContainer) return blocked(inventoryItem, "Containers cannot be salvaged.");
  const upgradeLevel = inventoryItem.upgradeLevel ?? 0;
  const tier = inventoryItem.tier ?? 0;
  if (!Number.isSafeInteger(upgradeLevel) || upgradeLevel < 0) return blocked(inventoryItem, "Equipment upgrade data is invalid.");
  if (!Number.isSafeInteger(tier) || tier < 0) return blocked(inventoryItem, "Equipment tier data is invalid.");
  if (inventoryItem.imbuements !== undefined && !Array.isArray(inventoryItem.imbuements)) return blocked(inventoryItem, "Equipment imbuement data is invalid.");
  if (upgradeLevel > 0) return blocked(inventoryItem, "Upgraded equipment is protected from salvage.");
  if (tier > 0) return blocked(inventoryItem, "Tiered equipment is protected from salvage.");
  if ((inventoryItem.imbuements?.length ?? 0) > 0) return blocked(inventoryItem, "Remove imbuements before salvage.");
  if (inventoryItem.item.rarity === "legendary" || inventoryItem.item.equipmentFamily === "artifact") {
    return blocked(inventoryItem, "Legendary Artifacts cannot be salvaged.");
  }
  if (!Number.isSafeInteger(inventoryItem.quantity) || inventoryItem.quantity < 1) return blocked(inventoryItem, "Equipment quantity is invalid.");

  const recoveredMaterials = getSalvageYield(inventoryItem);
  if (recoveredMaterials.length === 0) return blocked(inventoryItem, "This equipment has no safe salvage yield.");
  return { available: true, reason: undefined, inventoryItem, recoveredMaterials };
}

function blocked(inventoryItem: GuildDepot["items"][number], reason: string) {
  return { available: false, reason, inventoryItem, recoveredMaterials: [] };
}
