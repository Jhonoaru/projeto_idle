import type { EquipmentBonuses, EquippedItems, InventoryItem } from "../../shared/types";

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
    bonuses.attack += equippedItem.item.attack ?? 0;
    bonuses.defense += equippedItem.item.defense ?? 0;
    bonuses.armor += equippedItem.item.armor ?? 0;
    bonuses.magicPower += equippedItem.item.magicPower ?? 0;
    bonuses.distancePower += equippedItem.item.distancePower ?? 0;
    bonuses.fistPower += equippedItem.item.fistPower ?? 0;
    bonuses.capacityBonus += equippedItem.item.capacityBonus ?? 0;
    bonuses.healthBonus += equippedItem.item.healthBonus ?? 0;
    bonuses.manaBonus += equippedItem.item.manaBonus ?? 0;
    bonuses.speedBonus += equippedItem.item.speedBonus ?? 0;
  }

  return bonuses;
}
