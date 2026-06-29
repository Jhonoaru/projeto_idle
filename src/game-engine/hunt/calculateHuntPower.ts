import { getMainSkill } from "../character/getMainSkill";
import { calculateEquipmentBonuses } from "../equipment/calculateEquipmentBonuses";
import type { Character } from "../../shared/types";

export interface HuntPower {
  offensivePower: number;
  defensivePower: number;
  sustainPower: number;
  clearSpeed: number;
}

export function calculateHuntPower(character: Character): HuntPower {
  const mainSkill = getMainSkill(character);
  const magicLevel = character.skills.magic.level;
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const vocationMagicBonus =
    character.vocation === "Arcanist" || character.vocation === "Warden"
      ? magicLevel * 2.2 + equipmentBonuses.magicPower * 2
      : magicLevel * 0.7;
  const vocationGearBonus =
    character.vocation === "Ranger"
      ? equipmentBonuses.distancePower * 2
      : character.vocation === "Monk"
        ? equipmentBonuses.fistPower * 2
        : 0;

  const offensivePower =
    character.attributes.attackPower +
    character.level * 1.5 +
    mainSkill.level * 1.8 +
    vocationMagicBonus +
    vocationGearBonus;

  const defensivePower =
    character.attributes.defensePower +
    character.attributes.maxHealth / 18 +
    character.skills.shielding.level * 1.4 +
    character.attributes.armor * 4;

  const sustainPower =
    character.attributes.maxMana / 32 +
    character.staminaHours * 1.6 +
    (character.vocation === "Warden" ? magicLevel * 1.8 : 0) +
    (character.vocation === "Monk" ? mainSkill.level * 1.2 : 0);

  const clearSpeed = Math.max(0.45, offensivePower / 100);

  return {
    offensivePower: Math.round(offensivePower),
    defensivePower: Math.round(defensivePower),
    sustainPower: Math.round(sustainPower),
    clearSpeed,
  };
}
