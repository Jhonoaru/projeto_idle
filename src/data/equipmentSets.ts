import type { EquipmentSetId } from "../shared/types";

export interface EquipmentSetStatBonus {
  attackPowerPercent?: number;
  defensePowerPercent?: number;
  maxHealthFlat?: number;
  maxManaFlat?: number;
  capacityFlat?: number;
  speedFlat?: number;
  critChancePercent?: number;
}

export interface EquipmentSetPieceGroup {
  id: string;
  label: string;
  itemIds: string[];
}

export interface EquipmentSetThreshold {
  pieces: number;
  label: string;
  bonuses: EquipmentSetStatBonus;
}

export interface EquipmentSetDefinition {
  id: EquipmentSetId;
  name: string;
  code: string;
  campaignBand: string;
  description: string;
  pieceGroups: EquipmentSetPieceGroup[];
  thresholds: EquipmentSetThreshold[];
}

export const equipmentSets: Record<EquipmentSetId, EquipmentSetDefinition> = {
  "iron-expedition": {
    id: "iron-expedition",
    name: "Iron Expedition",
    code: "IE",
    campaignBand: "Adventurer",
    description: "A practical field kit pairing an Adventurer weapon with Iron Cuirass.",
    pieceGroups: [
      { id: "weapon", label: "Expedition weapon", itemIds: ["iron-longsword", "ironwood-bow", "runed-wand", "iron-handwraps"] },
      { id: "armor", label: "Iron Cuirass", itemIds: ["iron-cuirass"] },
    ],
    thresholds: [
      { pieces: 2, label: "Field Formation", bonuses: { attackPowerPercent: 2, defensePowerPercent: 2, maxHealthFlat: 15 } },
    ],
  },
  cryptwarden: {
    id: "cryptwarden",
    name: "Cryptwarden",
    code: "CW",
    campaignBand: "Veteran",
    description: "Recovered crypt equipment that rewards a complete Veteran loadout.",
    pieceGroups: [
      { id: "weapon", label: "Crypt weapon", itemIds: ["cryptsteel-blade", "gravewood-bow", "crypt-scepter", "boneweave-wraps"] },
      { id: "armor", label: "Cryptguard Armor", itemIds: ["cryptguard-armor"] },
    ],
    thresholds: [
      { pieces: 2, label: "Ancient Watch", bonuses: { attackPowerPercent: 3, defensePowerPercent: 3, maxHealthFlat: 30, maxManaFlat: 15 } },
    ],
  },
  emberforged: {
    id: "emberforged",
    name: "Emberforged",
    code: "EF",
    campaignBand: "Elite / Mythic",
    description: "Dragon-forged equipment completed by the Emberheart Artifact.",
    pieceGroups: [
      { id: "weapon", label: "Ember weapon", itemIds: ["ember-blade", "wyvern-bow", "ember-staff", "dragon-wraps"] },
      { id: "armor", label: "Dragonscale Armor", itemIds: ["dragonscale-armor"] },
      { id: "artifact", label: "Emberheart Amulet", itemIds: ["emberheart-amulet"] },
    ],
    thresholds: [
      { pieces: 2, label: "Dragon Temper", bonuses: { attackPowerPercent: 4, defensePowerPercent: 4, maxHealthFlat: 50, maxManaFlat: 25 } },
      { pieces: 3, label: "Heart of the Matriarch", bonuses: { critChancePercent: 2, capacityFlat: 40, speedFlat: 3 } },
    ],
  },
};

export const equipmentSetOrder: EquipmentSetId[] = ["iron-expedition", "cryptwarden", "emberforged"];
