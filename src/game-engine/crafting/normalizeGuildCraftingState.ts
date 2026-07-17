import type { GuildCraftingHistoryEntry, GuildCraftingState } from "../../shared/types";

export function normalizeGuildCraftingState(value: unknown): GuildCraftingState {
  const source = isRecord(value) ? value : {};
  const history = Array.isArray(source.history)
    ? source.history.flatMap(normalizeHistoryEntry).slice(0, 20)
    : [];

  return {
    totalCrafts: normalizeInteger(source.totalCrafts),
    totalGoldSpent: normalizeInteger(source.totalGoldSpent),
    totalMaterialsConsumed: normalizeInteger(source.totalMaterialsConsumed),
    history,
  };
}

function normalizeHistoryEntry(value: unknown): GuildCraftingHistoryEntry[] {
  if (!isRecord(value)) return [];
  const craftedAt = typeof value.craftedAt === "string" && Number.isFinite(Date.parse(value.craftedAt))
    ? value.craftedAt
    : undefined;
  if (!craftedAt || typeof value.recipeId !== "string" || typeof value.itemId !== "string") return [];

  return [{
    id: typeof value.id === "string" && value.id ? value.id : `craft-history-${craftedAt}-${value.recipeId}`,
    recipeId: value.recipeId,
    itemId: value.itemId,
    itemName: typeof value.itemName === "string" && value.itemName ? value.itemName : value.itemId,
    quantity: Math.max(1, normalizeInteger(value.quantity)),
    goldSpent: normalizeInteger(value.goldSpent),
    materialsConsumed: normalizeInteger(value.materialsConsumed),
    craftedAt,
  }];
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
