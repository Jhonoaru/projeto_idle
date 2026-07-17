import { getCollectionItemById } from "../../data/collections";
import { getCosmeticExchange } from "../../data/cosmeticExchanges";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { getCosmeticExchangeAvailability } from "./getCosmeticExchangeAvailability";

export function exchangeCosmetic(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
  collectionItemId: string,
) {
  const exchange = getCosmeticExchange(collectionItemId);
  if (!exchange) return blocked(guild, depot, "This cosmetic has no local exchange.");

  const availability = getCosmeticExchangeAvailability(exchange, guild, depot, characters);
  if (!availability.available) return blocked(guild, depot, availability.reasons[0] ?? "Cosmetic exchange is unavailable.");

  let items = Array.isArray(depot.items) ? depot.items : [];
  for (const material of exchange.materials) items = consume(items, material.itemId, material.quantity);

  const paidGuild = { ...guild, gold: normalizeInteger(guild.gold) - exchange.goldCost };
  const unlocked = unlockCollectionItem(paidGuild, collectionItemId);
  const collectionItem = getCollectionItemById(collectionItemId);

  return {
    success: true,
    guild: unlocked.guild,
    depot: { ...depot, items, capacityUsed: calculateCapacityUsed(items) },
    message: `${collectionItem?.name ?? collectionItemId} unlocked through ${exchange.label}.`,
  };
}

function consume(items: InventoryItem[], itemId: string, quantity: number) {
  let remaining = quantity;
  return items.flatMap((item) => {
    if (remaining <= 0 || item.itemId !== itemId || item.locked) return [item];
    const used = Math.min(remaining, normalizeInteger(item.quantity));
    remaining -= used;
    return item.quantity > used ? [{ ...item, quantity: item.quantity - used }] : [];
  });
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, guild, depot, message };
}
