import type { ForgeMaterialRequirement } from "../../shared/types";

const upgradeCosts: Record<number, { goldCost: number; requiredMaterials: ForgeMaterialRequirement[] }> = {
  1: { goldCost: 500, requiredMaterials: [{ itemId: "iron-ore", quantity: 2 }] },
  2: { goldCost: 1_500, requiredMaterials: [{ itemId: "iron-ore", quantity: 5 }] },
  3: {
    goldCost: 4_000,
    requiredMaterials: [
      { itemId: "iron-ore", quantity: 10 },
      { itemId: "enchanted-dust", quantity: 2 },
    ],
  },
  4: {
    goldCost: 10_000,
    requiredMaterials: [
      { itemId: "iron-ore", quantity: 15 },
      { itemId: "enchanted-dust", quantity: 5 },
    ],
  },
  5: {
    goldCost: 25_000,
    requiredMaterials: [
      { itemId: "iron-ore", quantity: 25 },
      { itemId: "enchanted-dust", quantity: 10 },
    ],
  },
};

export function getItemUpgradeCost(currentLevel = 0) {
  return upgradeCosts[currentLevel + 1];
}
