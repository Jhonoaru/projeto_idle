import type { EquipmentSlot, ImbuementDefinition, ImbuementPowerLevel, ImbuementType } from "../shared/types";

const durationHunts = 20;

const levelRules: Record<ImbuementPowerLevel, { characterLevel?: number; forgeTier?: number }> = {
  basic: {},
  intricate: { characterLevel: 30, forgeTier: 1 },
  powerful: { characterLevel: 60, forgeTier: 2 },
};

const familyLabels: Record<ImbuementType, string> = {
  strike: "Strike",
  focus: "Focus",
  precision: "Precision",
  fortification: "Fortification",
  wisdom: "Wisdom",
  efficiency: "Efficiency",
  capacity: "Capacity",
};

const powerLabels: Record<ImbuementPowerLevel, string> = {
  basic: "Basic",
  intricate: "Intricate",
  powerful: "Powerful",
};

export const imbuementFamilies = Object.entries(familyLabels).map(([id, label]) => ({
  id: id as ImbuementType,
  label,
}));

export const imbuements: ImbuementDefinition[] = [
  createImbuement("strike", "basic", ["weapon"], 2_000, [
    ["iron-ore", 5],
    ["enchanted-dust", 1],
  ], "+3% attack power.", { attackPowerPercent: 3 }),
  createImbuement("strike", "intricate", ["weapon"], 8_000, [
    ["iron-ore", 12],
    ["enchanted-dust", 4],
  ], "+6% attack power.", { attackPowerPercent: 6 }),
  createImbuement("strike", "powerful", ["weapon"], 25_000, [
    ["iron-ore", 25],
    ["dragon-ember", 4],
    ["enchanted-dust", 10],
  ], "+10% attack power.", { attackPowerPercent: 10 }),

  createImbuement("focus", "basic", ["weapon", "offhand"], 2_500, [
    ["enchanted-dust", 2],
    ["old-cloth", 6],
  ], "+3% magic power.", { magicPowerPercent: 3 }),
  createImbuement("focus", "intricate", ["weapon", "offhand"], 9_000, [
    ["enchanted-dust", 6],
    ["cultist-charm", 2],
  ], "+6% magic power.", { magicPowerPercent: 6 }),
  createImbuement("focus", "powerful", ["weapon", "offhand"], 28_000, [
    ["enchanted-dust", 14],
    ["cultist-charm", 6],
    ["dragon-ember", 3],
  ], "+10% magic power.", { magicPowerPercent: 10 }),

  createImbuement("precision", "basic", ["weapon", "offhand"], 2_500, [
    ["broken-fang", 6],
    ["enchanted-dust", 1],
  ], "+3% distance power.", { distancePowerPercent: 3 }),
  createImbuement("precision", "intricate", ["weapon", "offhand"], 9_000, [
    ["wyvern-scale", 4],
    ["broken-fang", 12],
  ], "+6% distance power.", { distancePowerPercent: 6 }),
  createImbuement("precision", "powerful", ["weapon", "offhand"], 28_000, [
    ["wyvern-scale", 10],
    ["dragon-ember", 3],
    ["enchanted-dust", 8],
  ], "+10% distance power.", { distancePowerPercent: 10 }),

  createImbuement("fortification", "basic", ["armor", "helmet", "legs", "boots", "offhand"], 3_000, [
    ["iron-ore", 8],
    ["old-cloth", 6],
  ], "+3% defense and armor.", { defensePowerPercent: 3 }),
  createImbuement("fortification", "intricate", ["armor", "helmet", "legs", "boots", "offhand"], 10_000, [
    ["iron-ore", 18],
    ["wyvern-scale", 4],
  ], "+6% defense and armor.", { defensePowerPercent: 6 }),
  createImbuement("fortification", "powerful", ["armor", "helmet", "legs", "boots", "offhand"], 30_000, [
    ["iron-ore", 30],
    ["wyvern-scale", 10],
    ["dragon-ember", 3],
  ], "+10% defense and armor.", { defensePowerPercent: 10 }),

  createImbuement("wisdom", "basic", ["helmet", "amulet"], 4_000, [
    ["enchanted-dust", 4],
  ], "+2% XP from hunts.", { xpBonusPercent: 2 }),
  createImbuement("wisdom", "intricate", ["helmet", "amulet"], 12_000, [
    ["enchanted-dust", 9],
    ["cultist-charm", 3],
  ], "+4% XP from hunts.", { xpBonusPercent: 4 }),
  createImbuement("wisdom", "powerful", ["helmet", "amulet"], 35_000, [
    ["enchanted-dust", 18],
    ["cultist-charm", 8],
    ["dragon-ember", 4],
  ], "+7% XP from hunts.", { xpBonusPercent: 7 }),

  createImbuement("efficiency", "basic", ["backpack", "offhand"], 4_000, [
    ["old-cloth", 10],
    ["enchanted-dust", 2],
  ], "-3% supplies consumed.", { supplyReductionPercent: 3 }),
  createImbuement("efficiency", "intricate", ["backpack", "offhand"], 12_000, [
    ["old-cloth", 22],
    ["enchanted-dust", 7],
  ], "-6% supplies consumed.", { supplyReductionPercent: 6 }),
  createImbuement("efficiency", "powerful", ["backpack", "offhand"], 35_000, [
    ["old-cloth", 40],
    ["enchanted-dust", 15],
    ["cultist-charm", 5],
  ], "-10% supplies consumed.", { supplyReductionPercent: 10 }),

  createImbuement("capacity", "basic", ["backpack"], 2_000, [
    ["old-cloth", 12],
    ["iron-ore", 3],
  ], "+25 capacity.", { capacityFlat: 25 }),
  createImbuement("capacity", "intricate", ["backpack"], 8_000, [
    ["old-cloth", 25],
    ["iron-ore", 8],
    ["enchanted-dust", 3],
  ], "+50 capacity.", { capacityFlat: 50 }),
  createImbuement("capacity", "powerful", ["backpack"], 22_000, [
    ["old-cloth", 45],
    ["iron-ore", 18],
    ["wyvern-scale", 5],
  ], "+100 capacity.", { capacityFlat: 100 }),
];

export function getImbuementById(imbuementId?: string) {
  return imbuements.find((imbuement) => imbuement.id === imbuementId);
}

export function getImbuementFamilyLabel(familyId: ImbuementType) {
  return familyLabels[familyId] ?? familyId;
}

export function getImbuementPowerLabel(powerLevel: ImbuementPowerLevel) {
  return powerLabels[powerLevel] ?? powerLevel;
}

function createImbuement(
  familyId: ImbuementType,
  powerLevel: ImbuementPowerLevel,
  allowedEquipmentSlots: EquipmentSlot[],
  goldCost: number,
  requiredMaterials: Array<[string, number]>,
  description: string,
  bonus: ImbuementDefinition["bonus"],
): ImbuementDefinition {
  const rules = levelRules[powerLevel];
  return {
    id: `imbuement-${powerLevel}-${familyId}`,
    familyId,
    name: `${powerLabels[powerLevel]} ${familyLabels[familyId]}`,
    powerLevel,
    description,
    type: familyId,
    allowedEquipmentSlots,
    goldCost,
    requiredMaterials: requiredMaterials.map(([itemId, quantity]) => ({ itemId, quantity })),
    bonus,
    durationHunts,
    requiredCharacterLevel: rules.characterLevel,
    requiredForgeTier: rules.forgeTier,
  };
}
