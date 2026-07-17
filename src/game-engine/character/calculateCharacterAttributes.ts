import { VOCATION_CONFIGS } from "../../data/vocations";
import { calculateDestinyBonuses } from "../destiny/calculateDestinyBonuses";
import { calculateEquipmentBonuses } from "../equipment/calculateEquipmentBonuses";
import { calculateEquipmentSetBonuses } from "../equipment/calculateEquipmentSetBonuses";
import { calculateWeaponProficiencyBonuses } from "../weapon-proficiency/calculateWeaponProficiencyBonuses";
import { getMainSkill } from "./getMainSkill";
import type { Character, CharacterAttributes, EquippedItems } from "../../shared/types";

export function calculateCharacterAttributes(
  character: Pick<Character, "level" | "vocation" | "skills"> & {
    equipment?: EquippedItems;
    weaponProficiencies?: Character["weaponProficiencies"];
    destiny?: Character["destiny"];
  },
): CharacterAttributes {
  const config = VOCATION_CONFIGS[character.vocation];
  const mainSkill = getMainSkill(character);
  const magicLevel = character.skills.magic.level;
  const shielding = character.skills.shielding.level;
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const equipmentSetBonuses = calculateEquipmentSetBonuses(character.equipment);
  const proficiencyBonuses = calculateWeaponProficiencyBonuses(character).bonus;
  const destinyBonuses = calculateDestinyBonuses(character);

  const maxHealth = Math.round(
    (145 + character.level * config.healthPerLevel + equipmentBonuses.healthBonus + equipmentSetBonuses.maxHealthFlat) *
      (1 + (destinyBonuses.maxHealthPercent ?? 0) / 100),
  );
  const maxMana = Math.round(
    45 + character.level * config.manaPerLevel + equipmentBonuses.manaBonus + equipmentSetBonuses.maxManaFlat,
  );
  const capacity = Math.round(
    420 +
      character.level * config.capacityPerLevel +
      equipmentBonuses.capacityBonus +
      equipmentSetBonuses.capacityFlat +
      (destinyBonuses.capacityBonusFlat ?? 0),
  );
  const speed = Math.round(
    210 + character.level * config.speedPerLevel + equipmentBonuses.speedBonus + equipmentSetBonuses.speedFlat,
  );

  const magicAttackBonus =
    character.vocation === "Arcanist" || character.vocation === "Warden"
      ? magicLevel * 2.4 + equipmentBonuses.magicPower * 2.1
      : magicLevel * 0.8 + equipmentBonuses.magicPower * 0.8;
  const vocationWeaponBonus =
    character.vocation === "Ranger"
      ? equipmentBonuses.distancePower * 1.8
      : character.vocation === "Monk"
        ? equipmentBonuses.fistPower * 1.8
        : 0;

  const baseAttackPower =
    (character.level * 1.8 +
      mainSkill.level * 2.2 +
      magicAttackBonus +
      vocationWeaponBonus +
      equipmentBonuses.attack) *
      config.attackMultiplier;
  const attackBonusPercent =
    proficiencyBonuses.attackPowerPercent +
    proficiencyBonuses.magicPowerPercent +
    proficiencyBonuses.distancePowerPercent +
    proficiencyBonuses.fistPowerPercent +
    (destinyBonuses.attackPowerPercent ?? 0) +
    (character.vocation === "Arcanist" || character.vocation === "Warden"
      ? destinyBonuses.magicPowerPercent ?? 0
      : 0) +
    (character.vocation === "Ranger" ? destinyBonuses.distancePowerPercent ?? 0 : 0) +
    (character.vocation === "Monk" ? destinyBonuses.fistPowerPercent ?? 0 : 0);
  const totalAttackBonusPercent = attackBonusPercent + equipmentSetBonuses.attackPowerPercent;
  const attackPower = Math.round(
    baseAttackPower * (1 + totalAttackBonusPercent / 100),
  );

  const armor = Math.round(equipmentBonuses.armor);
  const baseDefensePower =
    (character.level * 1.4 +
      shielding * 2.1 +
      mainSkill.level * 0.45 +
      equipmentBonuses.defense +
      armor * 2.5) *
      config.defenseMultiplier;
  const defensePower = Math.round(
    baseDefensePower *
      (1 + (proficiencyBonuses.defensePowerPercent + (destinyBonuses.defensePowerPercent ?? 0) + equipmentSetBonuses.defensePowerPercent) / 100),
  );

  return {
    maxHealth,
    maxMana,
    capacity,
    speed,
    attackPower,
    defensePower,
    armor,
    critChancePercent: proficiencyBonuses.critChancePercent + (destinyBonuses.critChancePercent ?? 0) + equipmentSetBonuses.critChancePercent,
    critDamagePercent: proficiencyBonuses.critDamagePercent + (destinyBonuses.critDamagePercent ?? 0),
  };
}
