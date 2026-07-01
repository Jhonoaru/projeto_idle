import { getImbuementById } from "../../data/imbuements";
import type { InventoryItem } from "../../shared/types";

export function calculateEnhancedItemBonuses(inventoryItem: InventoryItem) {
  const item = inventoryItem.item;
  const upgradeLevel = Math.min(5, Math.max(0, inventoryItem.upgradeLevel ?? 0));
  const tier = Math.min(3, Math.max(0, inventoryItem.tier ?? 0));
  const upgradeMultiplier = 1 + upgradeLevel * getUpgradePercent(item.equipmentSlot);
  const tierMultiplier = 1 + tier * 0.05;
  const multiplier = upgradeMultiplier * tierMultiplier;
  const bonuses = {
    attack: Math.round((item.attack ?? 0) * multiplier),
    defense: Math.round((item.defense ?? 0) * multiplier),
    armor: Math.round((item.armor ?? 0) * multiplier),
    magicPower: Math.round((item.magicPower ?? 0) * multiplier),
    distancePower: Math.round((item.distancePower ?? 0) * multiplier),
    fistPower: Math.round((item.fistPower ?? 0) * multiplier),
    capacityBonus: Math.round((item.capacityBonus ?? 0) * multiplier) + upgradeLevel * (item.equipmentSlot === "backpack" ? 10 : 0),
    healthBonus: Math.round((item.healthBonus ?? 0) * multiplier),
    manaBonus: Math.round((item.manaBonus ?? 0) * multiplier),
    speedBonus: item.speedBonus ?? 0,
    xpBonusPercent: 0,
    supplyReductionPercent: 0,
  };

  for (const active of inventoryItem.imbuements ?? []) {
    const imbuement = getImbuementById(active.imbuementId);
    if (!imbuement) continue;

    bonuses.attack += Math.round(bonuses.attack * ((imbuement.bonus.attackPowerPercent ?? 0) / 100));
    bonuses.defense += Math.round(bonuses.defense * ((imbuement.bonus.defensePowerPercent ?? 0) / 100));
    bonuses.magicPower += Math.round(bonuses.magicPower * ((imbuement.bonus.magicPowerPercent ?? 0) / 100));
    bonuses.distancePower += Math.round(bonuses.distancePower * ((imbuement.bonus.distancePowerPercent ?? 0) / 100));
    bonuses.fistPower += Math.round(bonuses.fistPower * ((imbuement.bonus.fistPowerPercent ?? 0) / 100));
    bonuses.healthBonus += imbuement.bonus.maxHealthPercent ? Math.round((item.healthBonus ?? 0) * (imbuement.bonus.maxHealthPercent / 100)) : 0;
    bonuses.manaBonus += imbuement.bonus.maxManaPercent ? Math.round((item.manaBonus ?? 0) * (imbuement.bonus.maxManaPercent / 100)) : 0;
    bonuses.capacityBonus += imbuement.bonus.capacityFlat ?? 0;
    bonuses.speedBonus += imbuement.bonus.speedFlat ?? 0;
    bonuses.xpBonusPercent += imbuement.bonus.xpBonusPercent ?? 0;
    bonuses.supplyReductionPercent += imbuement.bonus.supplyReductionPercent ?? 0;
  }

  return bonuses;
}

function getUpgradePercent(slot?: string) {
  if (slot === "ring" || slot === "amulet") return 0.02;
  return 0.03;
}
