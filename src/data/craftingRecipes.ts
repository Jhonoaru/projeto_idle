import type { CraftingRecipeDefinition, GuildWorkshopRank } from "../shared/types";

export const workshopRankNames: Record<GuildWorkshopRank, string> = {
  1: "Apprentice",
  2: "Journeyman",
  3: "Master",
  4: "Grandmaster",
};

export const craftingRecipes: CraftingRecipeDefinition[] = [
  recipe("worn-sword", "Field Sword", "A dependable starter blade assembled from local iron.", "weapon", "worn-sword", 40, 1, [["iron-ore", 2]]),
  recipe("simple-bow", "Field Bow", "A light bow rebuilt from cloth bindings and creature sinew.", "weapon", "simple-bow", 50, 1, [["old-cloth", 4], ["broken-fang", 2]]),
  recipe("novice-wand", "Apprentice Focus", "A basic magical focus stabilized with enchanted dust.", "weapon", "novice-wand", 80, 1, [["old-cloth", 3], ["enchanted-dust", 1]]),
  recipe("leather-armor", "Field Leather", "Flexible armor repaired for new guild recruits.", "armor", "leather-armor", 60, 1, [["old-cloth", 6]]),

  recipe("iron-longsword", "Iron Longsword", "The Vanguard weapon of the Iron Expedition set.", "weapon", "iron-longsword", 220, 2, [["iron-ore", 8], ["broken-fang", 3]]),
  recipe("ironwood-bow", "Ironwood Bow", "The Pathfinder weapon of the Iron Expedition set.", "weapon", "ironwood-bow", 260, 2, [["iron-ore", 3], ["old-cloth", 6], ["broken-fang", 4]]),
  recipe("runed-wand", "Runed Wand", "The Arcanum weapon of the Iron Expedition set.", "weapon", "runed-wand", 300, 2, [["iron-ore", 2], ["old-cloth", 5], ["enchanted-dust", 1]]),
  recipe("iron-handwraps", "Iron Handwraps", "The Discipline weapon of the Iron Expedition set.", "weapon", "iron-handwraps", 220, 2, [["iron-ore", 4], ["old-cloth", 7]]),
  recipe("iron-cuirass", "Iron Cuirass", "The Field Kit armor of the Iron Expedition set.", "armor", "iron-cuirass", 350, 2, [["iron-ore", 12], ["old-cloth", 5]]),

  recipe("cryptsteel-blade", "Cryptsteel Blade", "A veteran blade forged around relics recovered from sealed crypts.", "weapon", "cryptsteel-blade", 1_500, 3, [["iron-ore", 10], ["ancient-bone", 8], ["enchanted-dust", 2]]),
  recipe("gravewood-bow", "Gravewood Bow", "A veteran bow reinforced with preserved bone and wyvern scale.", "weapon", "gravewood-bow", 1_600, 3, [["old-cloth", 10], ["ancient-bone", 6], ["wyvern-scale", 2], ["enchanted-dust", 2]]),
  recipe("crypt-scepter", "Crypt Scepter", "A ritual focus shaped from cultist charms and ancient remains.", "weapon", "crypt-scepter", 1_700, 3, [["cultist-charm", 6], ["ancient-bone", 5], ["enchanted-dust", 3]]),
  recipe("boneweave-wraps", "Boneweave Wraps", "Veteran handwraps woven from old cloth and polished bone.", "weapon", "boneweave-wraps", 1_550, 3, [["old-cloth", 12], ["ancient-bone", 8], ["enchanted-dust", 2]]),
  recipe("cryptguard-armor", "Cryptguard Armor", "Heavy veteran armor sealed with crypt relics.", "armor", "cryptguard-armor", 1_900, 3, [["iron-ore", 16], ["ancient-bone", 10], ["enchanted-dust", 3]]),

  recipe("ember-blade", "Ember Blade", "An elite blade tempered with trophies from the Ember Nest.", "weapon", "ember-blade", 7_500, 4, [["iron-ore", 20], ["dragon-ember", 4], ["wyvern-scale", 5], ["enchanted-dust", 6]]),
  recipe("wyvern-bow", "Wyvern Bow", "An elite bow layered with heat-resistant scales.", "weapon", "wyvern-bow", 7_800, 4, [["old-cloth", 18], ["dragon-ember", 3], ["wyvern-scale", 8], ["enchanted-dust", 6]]),
  recipe("ember-staff", "Ember Staff", "An elite magical focus built around a controlled dragon ember.", "weapon", "ember-staff", 8_200, 4, [["cultist-charm", 8], ["dragon-ember", 5], ["wyvern-scale", 4], ["enchanted-dust", 8]]),
  recipe("dragon-wraps", "Dragon Wraps", "Elite handwraps reinforced with narrow wyvern scales.", "weapon", "dragon-wraps", 7_600, 4, [["old-cloth", 20], ["dragon-ember", 3], ["wyvern-scale", 7], ["enchanted-dust", 5]]),
  recipe("dragonscale-armor", "Dragonscale Armor", "Elite armor assembled from the guild's rarest hunt trophies.", "armor", "dragonscale-armor", 9_000, 4, [["iron-ore", 24], ["dragon-ember", 6], ["wyvern-scale", 10], ["enchanted-dust", 8]]),
];

export function getCraftingRecipe(recipeId: string) {
  return craftingRecipes.find((recipeEntry) => recipeEntry.id === recipeId);
}

function recipe(
  id: string,
  name: string,
  description: string,
  category: CraftingRecipeDefinition["category"],
  outputItemId: string,
  goldCost: number,
  requiredWorkshopRank: GuildWorkshopRank,
  materials: Array<[string, number]>,
): CraftingRecipeDefinition {
  return {
    id: `craft-${id}`,
    name,
    description,
    category,
    outputItemId,
    outputQuantity: 1,
    goldCost,
    requiredWorkshopRank,
    materials: materials.map(([itemId, quantity]) => ({ itemId, quantity })),
  };
}
