import type { ForgeMaterialRequirement } from "../../shared/types";

const tierCosts: Record<number, { goldCost: number; requiredMaterials: ForgeMaterialRequirement[] }> = {
  1: {
    goldCost: 10_000,
    requiredMaterials: [
      { itemId: "enchanted-dust", quantity: 10 },
      { itemId: "wyvern-scale", quantity: 5 },
    ],
  },
  2: {
    goldCost: 35_000,
    requiredMaterials: [
      { itemId: "enchanted-dust", quantity: 25 },
      { itemId: "wyvern-scale", quantity: 15 },
    ],
  },
  3: {
    goldCost: 100_000,
    requiredMaterials: [
      { itemId: "enchanted-dust", quantity: 60 },
      { itemId: "wyvern-scale", quantity: 30 },
    ],
  },
};

export function getItemTierCost(currentTier = 0) {
  return tierCosts[currentTier + 1];
}
