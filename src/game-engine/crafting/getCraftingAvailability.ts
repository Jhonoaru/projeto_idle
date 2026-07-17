import { getCraftingRecipe } from "../../data/craftingRecipes";
import { items } from "../../data/items";
import type { Guild, GuildDepot } from "../../shared/types";
import { getWorkshopRank } from "./getWorkshopRank";

export function getCraftingAvailability(guild: Guild, depot: GuildDepot, recipeId: string) {
  const recipe = getCraftingRecipe(recipeId);
  if (!recipe) return { available: false, reason: "Recipe not found.", recipe: undefined, missingMaterials: [] };

  const output = items[recipe.outputItemId];
  if (!output || output.type !== "equipment") {
    return { available: false, reason: "Recipe output is invalid.", recipe, missingMaterials: [] };
  }

  const workshop = getWorkshopRank(guild.crafting);
  const materialCounts = new Map<string, number>();
  for (const item of depot.items) {
    if (item.locked || item.item.type === "quest") continue;
    materialCounts.set(item.itemId, (materialCounts.get(item.itemId) ?? 0) + Math.max(0, Math.floor(item.quantity)));
  }
  const missingMaterials = recipe.materials.flatMap((requirement) => {
    const available = materialCounts.get(requirement.itemId) ?? 0;
    const definition = items[requirement.itemId];
    return available < requirement.quantity
      ? [{ ...requirement, available, name: definition?.name ?? requirement.itemId }]
      : [];
  });

  const gold = normalizeInteger(guild.gold);
  const reason = workshop.rank < recipe.requiredWorkshopRank
    ? `Requires Workshop Rank ${recipe.requiredWorkshopRank}.`
    : gold < recipe.goldCost
      ? `Requires ${recipe.goldCost.toLocaleString("en-US")}g.`
      : missingMaterials.length > 0
        ? "Missing unlocked materials in the Guild Depot."
        : undefined;

  return { available: !reason, reason, recipe, output, missingMaterials, workshop, gold };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}
