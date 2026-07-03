import { VOCATION_CONFIGS } from "../../data/vocations";
import { calculateEquipmentBonuses } from "../equipment/calculateEquipmentBonuses";
import { calculateWeaponProficiencyBonuses } from "../weapon-proficiency/calculateWeaponProficiencyBonuses";
import { getMainSkill } from "./getMainSkill";
import type { Character, CharacterAttributes, EquippedItems } from "../../shared/types";

export function calculateCharacterAttributes(
  character: Pick<Character, "level" | "vocation" | "skills"> & {
    equipment?: EquippedItems;
    weaponProficiencies?: Character["weaponProficiencies"];
  },
): CharacterAttributes {
  const config = VOCATION_CONFIGS[character.vocation];
  const mainSkill = getMainSkill(character);
  const magicLevel = character.skills.magic.level;
  const shielding = character.skills.shielding.level;
  const equipmentBonuses = calculateEquipmentBonuses(character.equipment);
  const proficiencyBonuses = calculateWeaponProficiencyBonuses(character).bonus;

  const maxHealth = Math.round(
    145 + character.level * config.healthPerLevel + equipmentBonuses.healthBonus,
  );
  const maxMana = Math.round(
    45 + character.level * config.manaPerLevel + equipmentBonuses.manaBonus,
  );
  const capacity = Math.round(
    420 + character.level * config.capacityPerLevel + equipmentBonuses.capacityBonus,
  );
  const speed = Math.round(
    210 + character.level * config.speedPerLevel + equipmentBonuses.speedBonus,
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
    proficiencyBonuses.fistPowerPercent;
  const attackPower = Math.round(
    baseAttackPower * (1 + attackBonusPercent / 100),
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
    baseDefensePower * (1 + proficiencyBonuses.defensePowerPercent / 100),
  );

  return {
    maxHealth,
    maxMana,
    capacity,
    speed,
    attackPower,
    defensePower,
    armor,
    critChancePercent: proficiencyBonuses.critChancePercent,
    critDamagePercent: proficiencyBonuses.critDamagePercent,
  };
}
