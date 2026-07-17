import type { EquipmentFamilyId, EquipmentProgressionBandId, ItemRarity } from "../shared/types";

export interface EquipmentFamilyDefinition {
  id: EquipmentFamilyId;
  label: string;
  code: string;
  description: string;
}

export interface EquipmentProgressionBandDefinition {
  id: EquipmentProgressionBandId;
  label: string;
  code: string;
  minLevel: number;
  maxLevel?: number;
  expectedRarities: ItemRarity[];
}

export const equipmentFamilies: Record<EquipmentFamilyId, EquipmentFamilyDefinition> = {
  "field-kit": { id: "field-kit", label: "Field Kit", code: "FK", description: "Universal equipment for contracts and travel." },
  vanguard: { id: "vanguard", label: "Vanguard", code: "VG", description: "Melee weapons, shields and durable frontline gear." },
  pathfinder: { id: "pathfinder", label: "Pathfinder", code: "PF", description: "Bows, quivers and mobile ranged equipment." },
  arcanum: { id: "arcanum", label: "Arcanum", code: "AR", description: "Wands, robes and mana-focused equipment." },
  discipline: { id: "discipline", label: "Discipline", code: "DS", description: "Fist weapons and balanced monk equipment." },
  artifact: { id: "artifact", label: "Artifact", code: "AF", description: "Boss artifacts intended for late guild progression." },
};

export const equipmentProgressionBands: Record<EquipmentProgressionBandId, EquipmentProgressionBandDefinition> = {
  novice: { id: "novice", label: "Novice", code: "N", minLevel: 1, maxLevel: 9, expectedRarities: ["common"] },
  adventurer: { id: "adventurer", label: "Adventurer", code: "A", minLevel: 10, maxLevel: 24, expectedRarities: ["common", "uncommon"] },
  veteran: { id: "veteran", label: "Veteran", code: "V", minLevel: 25, maxLevel: 44, expectedRarities: ["uncommon", "rare"] },
  elite: { id: "elite", label: "Elite", code: "E", minLevel: 45, maxLevel: 59, expectedRarities: ["rare", "epic"] },
  mythic: { id: "mythic", label: "Mythic", code: "M", minLevel: 60, expectedRarities: ["epic", "legendary"] },
};

export const equipmentProgressionOrder: EquipmentProgressionBandId[] = ["novice", "adventurer", "veteran", "elite", "mythic"];
