import { createInventoryItem } from "../../data/inventoryFactory";
import { items as itemCatalog } from "../../data/items";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import type { Guild, GuildDepot, InventoryItem } from "../../shared/types";
import { getSalvageAvailability } from "./getSalvageAvailability";
import { normalizeGuildCraftingState } from "./normalizeGuildCraftingState";

export function salvageEquipment(guild: Guild, depot: GuildDepot, inventoryItemId: string, now = new Date()) {
  const availability = getSalvageAvailability(depot, inventoryItemId);
  if (!Number.isFinite(now.getTime())) return blocked(guild, depot, "Salvage timestamp is invalid.");
  if (!availability.available || !availability.inventoryItem) {
    return blocked(guild, depot, availability.reason ?? "Salvage requirements are not met.");
  }

  const source = availability.inventoryItem;
  let items = depot.items.flatMap((entry) => {
    if (entry.id !== source.id) return [entry];
    return entry.quantity > 1 ? [{ ...entry, quantity: entry.quantity - 1 }] : [];
  });
  for (const material of availability.recoveredMaterials) {
    items = addRecoveredMaterial(items, material.itemId, material.quantity);
  }

  const crafting = normalizeGuildCraftingState(guild.crafting);
  const recoveredTotal = availability.recoveredMaterials.reduce((sum, entry) => sum + entry.quantity, 0);
  const salvagedAt = now.toISOString();
  const historyEntry = {
    id: `salvage-history-${now.getTime()}-${source.id}-${crafting.totalSalvages}`,
    sourceInventoryItemId: source.id,
    itemId: source.itemId,
    itemName: source.item.name,
    recoveredMaterials: availability.recoveredMaterials,
    salvagedAt,
  };
  const nextGuild: Guild = {
    ...guild,
    crafting: {
      ...crafting,
      totalSalvages: safeAdd(crafting.totalSalvages, 1),
      totalRecoveredMaterials: safeAdd(crafting.totalRecoveredMaterials, recoveredTotal),
      salvageHistory: [historyEntry, ...crafting.salvageHistory].slice(0, 20),
    },
  };

  return {
    success: true,
    guild: nextGuild,
    depot: { ...depot, items, capacityUsed: calculateCapacityUsed(items) },
    salvagedItem: source,
    recoveredMaterials: availability.recoveredMaterials,
    message: `${source.item.name} salvaged into ${availability.recoveredMaterials.map((entry) => `${itemCatalog[entry.itemId]?.name ?? entry.itemId} x${entry.quantity}`).join(", ")}.`,
  };
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}

function addRecoveredMaterial(items: InventoryItem[], itemId: string, quantity: number) {
  const stackIndex = items.findIndex((entry) => (
    entry.itemId === itemId
    && entry.item.stackable
    && entry.location === "guildDepot"
    && !entry.ownerCharacterId
    && !entry.parentContainerId
    && !entry.locked
  ));
  if (stackIndex < 0) return [...items, createInventoryItem(itemId, quantity, "guildDepot")];

  return items.map((entry, index) => index === stackIndex
    ? { ...entry, quantity: safeAdd(entry.quantity, quantity) }
    : entry);
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, guild, depot, salvagedItem: undefined, recoveredMaterials: [], message };
}
