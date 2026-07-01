import type { ImbuementDefinition } from "../shared/types";

export const imbuements: ImbuementDefinition[] = [
  {
    id: "imbuement-minor-strike",
    name: "Minor Strike",
    description: "+5% attack power.",
    type: "strike",
    allowedEquipmentSlots: ["weapon"],
    goldCost: 2_000,
    requiredMaterials: [
      { itemId: "iron-ore", quantity: 5 },
      { itemId: "enchanted-dust", quantity: 2 },
    ],
    bonus: { attackPowerPercent: 5 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-focus",
    name: "Minor Focus",
    description: "+5% magic power.",
    type: "wisdom",
    allowedEquipmentSlots: ["weapon", "offhand"],
    goldCost: 2_500,
    requiredMaterials: [{ itemId: "enchanted-dust", quantity: 4 }],
    bonus: { magicPowerPercent: 5 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-precision",
    name: "Minor Precision",
    description: "+5% distance power.",
    type: "strike",
    allowedEquipmentSlots: ["weapon", "offhand"],
    goldCost: 2_500,
    requiredMaterials: [
      { itemId: "wyvern-scale", quantity: 2 },
      { itemId: "enchanted-dust", quantity: 2 },
    ],
    bonus: { distancePowerPercent: 5 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-fortification",
    name: "Minor Fortification",
    description: "+5% defense power.",
    type: "protection",
    allowedEquipmentSlots: ["armor", "helmet", "legs", "boots"],
    goldCost: 3_000,
    requiredMaterials: [
      { itemId: "iron-ore", quantity: 8 },
      { itemId: "wyvern-scale", quantity: 4 },
    ],
    bonus: { defensePowerPercent: 5 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-wisdom",
    name: "Minor Wisdom",
    description: "+3% XP from hunts.",
    type: "wisdom",
    allowedEquipmentSlots: ["helmet", "amulet"],
    goldCost: 4_000,
    requiredMaterials: [{ itemId: "enchanted-dust", quantity: 6 }],
    bonus: { xpBonusPercent: 3 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-capacity",
    name: "Minor Capacity",
    description: "+50 capacity.",
    type: "capacity",
    allowedEquipmentSlots: ["backpack"],
    goldCost: 2_000,
    requiredMaterials: [
      { itemId: "old-cloth", quantity: 10 },
      { itemId: "iron-ore", quantity: 3 },
    ],
    bonus: { capacityFlat: 50 },
    durationHunts: 20,
  },
  {
    id: "imbuement-minor-efficiency",
    name: "Minor Efficiency",
    description: "-5% supplies consumed.",
    type: "efficiency",
    allowedEquipmentSlots: ["backpack", "offhand"],
    goldCost: 4_500,
    requiredMaterials: [{ itemId: "enchanted-dust", quantity: 5 }],
    bonus: { supplyReductionPercent: 5 },
    durationHunts: 20,
  },
];

export function getImbuementById(imbuementId?: string) {
  return imbuements.find((imbuement) => imbuement.id === imbuementId);
}
