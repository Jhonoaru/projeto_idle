import type { GuildDepot, InventoryItem } from "../../shared/types";

export function getAvailableGuildDepotMaterialQuantity(depot: GuildDepot, itemId: string) {
  return (Array.isArray(depot?.items) ? depot.items : [])
    .filter((entry) => isEligibleGuildDepotMaterial(entry, itemId))
    .reduce((sum, entry) => safeAdd(sum, normalizeQuantity(entry.quantity)), 0);
}

export function consumeGuildDepotMaterialItems(items: InventoryItem[], itemId: string, quantity: number) {
  let remaining = normalizeQuantity(quantity);
  return items.flatMap((entry) => {
    if (remaining <= 0 || !isEligibleGuildDepotMaterial(entry, itemId)) return [entry];
    const available = normalizeQuantity(entry.quantity);
    const consumed = Math.min(remaining, available);
    remaining -= consumed;
    return available > consumed ? [{ ...entry, quantity: available - consumed }] : [];
  });
}

export function isEligibleGuildDepotMaterial(entry: InventoryItem, itemId: string) {
  return Boolean(entry?.item)
    && entry.itemId === itemId
    && entry.location === "guildDepot"
    && !entry.ownerCharacterId
    && !entry.parentContainerId
    && !entry.locked
    && entry.item.type !== "quest";
}

function normalizeQuantity(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) ? Math.max(0, parsed) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
