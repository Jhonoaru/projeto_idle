import { createInventoryItem } from "../../data/inventoryFactory";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import type { Guild, GuildDepot, InventoryItem } from "../../shared/types";
import { getCraftingAvailability } from "./getCraftingAvailability";
import { normalizeGuildCraftingState } from "./normalizeGuildCraftingState";

export function craftEquipment(guild: Guild, depot: GuildDepot, recipeId: string, now = new Date()) {
  const availability = getCraftingAvailability(guild, depot, recipeId);
  if (!Number.isFinite(now.getTime())) return blocked(guild, depot, "Crafting timestamp is invalid.");
  if (!availability.available || !availability.recipe || !availability.output) {
    return blocked(guild, depot, availability.reason ?? "Crafting requirements are not met.");
  }

  let depotItems = depot.items;
  for (const requirement of availability.recipe.materials) {
    depotItems = consumeDepotItem(depotItems, requirement.itemId, requirement.quantity);
  }

  const output = createInventoryItem(
    availability.recipe.outputItemId,
    availability.recipe.outputQuantity,
    "guildDepot",
  );
  depotItems = mergeStackableItems([...depotItems, output]);
  const crafting = normalizeGuildCraftingState(guild.crafting);
  const materialsConsumed = availability.recipe.materials.reduce((sum, entry) => sum + entry.quantity, 0);
  const craftedAt = now.toISOString();
  const historyEntry = {
    id: `craft-history-${output.id}`,
    recipeId: availability.recipe.id,
    itemId: availability.output.id,
    itemName: availability.output.name,
    quantity: availability.recipe.outputQuantity,
    goldSpent: availability.recipe.goldCost,
    materialsConsumed,
    craftedAt,
  };
  const nextGuild: Guild = {
    ...guild,
    gold: availability.gold - availability.recipe.goldCost,
    crafting: {
      ...crafting,
      totalCrafts: safeAdd(crafting.totalCrafts, 1),
      totalGoldSpent: safeAdd(crafting.totalGoldSpent, availability.recipe.goldCost),
      totalMaterialsConsumed: safeAdd(crafting.totalMaterialsConsumed, materialsConsumed),
      history: [historyEntry, ...crafting.history].slice(0, 20),
    },
  };

  return {
    success: true,
    guild: nextGuild,
    depot: { ...depot, items: depotItems, capacityUsed: calculateCapacityUsed(depotItems) },
    craftedItem: output,
    message: `${availability.output.name} crafted and delivered to the Guild Depot.`,
  };
}

function consumeDepotItem(items: InventoryItem[], itemId: string, quantity: number) {
  let remaining = quantity;
  return items.flatMap((item) => {
    if (remaining <= 0 || item.itemId !== itemId || item.locked || item.item.type === "quest") return [item];
    const consumed = Math.min(remaining, Math.max(0, Math.floor(item.quantity)));
    remaining -= consumed;
    return item.quantity > consumed ? [{ ...item, quantity: item.quantity - consumed }] : [];
  });
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, guild, depot, craftedItem: undefined, message };
}
