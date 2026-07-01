import type { EquipmentBonuses, EquippedItems, InventoryItem } from "../../shared/types";
import { calculateEnhancedItemBonuses } from "../forge/calculateEnhancedItemBonuses";

export function calculateEquipmentBonuses(
  equipment: EquippedItems = {},
): EquipmentBonuses {
  const bonuses: EquipmentBonuses = {
    attack: 0,
    defense: 0,
    armor: 0,
    magicPower: 0,
    distancePower: 0,
    fistPower: 0,
    capacityBonus: 0,
    healthBonus: 0,
    manaBonus: 0,
    speedBonus: 0,
  };

  for (const equippedItem of Object.values(equipment).filter(Boolean) as InventoryItem[]) {
    const enhanced = calculateEnhancedItemBonuses(equippedItem);
    bonuses.attack += enhanced.attack;
    bonuses.defense += enhanced.defense;
    bonuses.armor += enhanced.armor;
    bonuses.magicPower += enhanced.magicPower;
    bonuses.distancePower += enhanced.distancePower;
    bonuses.fistPower += enhanced.fistPower;
    bonuses.capacityBonus += enhanced.capacityBonus;
    bonuses.healthBonus += enhanced.healthBonus;
    bonuses.manaBonus += enhanced.manaBonus;
    bonuses.speedBonus += enhanced.speedBonus;
  }

  return bonuses;
}
