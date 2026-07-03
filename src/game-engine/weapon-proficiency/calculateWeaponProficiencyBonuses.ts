import type {
  Character,
  EquippedItems,
  WeaponProficiencyBonus,
  WeaponProficiencyState,
  WeaponProficiencyType,
} from "../../shared/types";
import { getEquippedWeaponProficiencyType } from "./getEquippedWeaponProficiencyType";
import {
  WEAPON_PROFICIENCY_PERKS,
} from "./weaponProficiencyDefinitions";
import { normalizeWeaponProficiencies } from "./weaponProficiencyProgression";

export function calculateWeaponProficiencyBonuses(character: {
  equipment?: EquippedItems;
  weaponProficiencies?: WeaponProficiencyState;
}) {
  const mainType = getEquippedWeaponProficiencyType(character.equipment?.weapon);
  const shieldType = getEquippedWeaponProficiencyType(character.equipment?.offhand);
  const activeTypes = [mainType, shieldType].filter(Boolean) as WeaponProficiencyType[];
  const state = normalizeWeaponProficiencies(character.weaponProficiencies);
  const bonus: Required<WeaponProficiencyBonus> = {
    attackPowerPercent: 0,
    defensePowerPercent: 0,
    magicPowerPercent: 0,
    distancePowerPercent: 0,
    fistPowerPercent: 0,
    critChancePercent: 0,
    critDamagePercent: 0,
    supplyReductionPercent: 0,
    xpBonusPercent: 0,
  };
  const activePerks: string[] = [];

  for (const type of activeTypes) {
    const progress = state[type];
    const unlockedPerks = new Set(progress.unlockedPerkIds);

    for (const perk of WEAPON_PROFICIENCY_PERKS[type]) {
      if (perk.requiredLevel > progress.level || !unlockedPerks.has(perk.id)) continue;

      activePerks.push(perk.name);
      for (const [key, value] of Object.entries(perk.bonus)) {
        bonus[key as keyof WeaponProficiencyBonus] += value ?? 0;
      }
    }
  }

  return {
    bonus,
    activeTypes,
    activePerks,
  };
}

export function getSupplyReductionForUsage(
  character: Character,
  supplyType: string,
) {
  const mainType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const shieldType = getEquippedWeaponProficiencyType(character.equipment.offhand);
  const state = normalizeWeaponProficiencies(character.weaponProficiencies);
  let reduction = 0;

  if (mainType === "bow" && supplyType === "ammo") {
    reduction += getPerkReduction(state.bow, "bow-arrow-economy", "bow");
  }

  if (mainType === "wand" && supplyType === "mana_potion") {
    reduction += getPerkReduction(state.wand, "wand-mana-flow", "wand");
  }

  if (mainType === "staff" && supplyType === "rune") {
    reduction += getPerkReduction(state.staff, "staff-rune-efficiency", "staff");
  }

  if (shieldType === "shield") {
    reduction += getPerkReduction(
      state.shield,
      "shield-shield-discipline",
      "shield",
    );
  }

  return Math.min(20, Math.max(0, reduction));
}

function getPerkReduction(
  progress: ReturnType<typeof normalizeWeaponProficiencies>[WeaponProficiencyType],
  perkId: string,
  type: WeaponProficiencyType,
) {
  if (!progress.unlockedPerkIds.includes(perkId)) return 0;

  return WEAPON_PROFICIENCY_PERKS[type].find((perk) => perk.id === perkId)
    ?.bonus.supplyReductionPercent ?? 0;
}
