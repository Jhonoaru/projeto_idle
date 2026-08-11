import { VOCATION_CONFIGS } from "../../data/vocations";
import { calculateDestinyBonuses } from "../destiny/calculateDestinyBonuses";
import { calculateEquipmentBonuses } from "../equipment/calculateEquipmentBonuses";
import { calculateEquipmentSetBonuses } from "../equipment/calculateEquipmentSetBonuses";
import { calculateWeaponProficiencyBonuses } from "../weapon-proficiency/calculateWeaponProficiencyBonuses";
import { getEquippedWeaponProficiencyType } from "../weapon-proficiency/getEquippedWeaponProficiencyType";
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
  const accuracyVocationBonus = {
    Guardian: 0,
    Ranger: 2,
    Arcanist: 1,
    Warden: 1,
    Monk: 1.5,
  }[character.vocation];
  const dodgeVocationBonus = {
    Guardian: 0,
    Ranger: 2,
    Arcanist: 0.5,
    Warden: 1,
    Monk: 3,
  }[character.vocation];
  const armorPenetrationVocationBonus = {
    Guardian: 3,
    Ranger: 5,
    Arcanist: 7,
    Warden: 6,
    Monk: 4,
  }[character.vocation];
  const blockChanceVocationBonus = {
    Guardian: 4,
    Ranger: 1,
    Arcanist: 0,
    Warden: 2,
    Monk: 3,
  }[character.vocation];
  const blockMitigationVocationBonus = {
    Guardian: 5,
    Ranger: 1,
    Arcanist: 0,
    Warden: 2,
    Monk: 4,
  }[character.vocation];
  const hasShield = getEquippedWeaponProficiencyType(character.equipment?.offhand) === "shield";
  const accuracyPercent = rounded(clamp(
    88 + character.level * 0.04 + mainSkill.level * 0.08 + Math.max(0, speed - 210) * 0.015 + accuracyVocationBonus,
    80,
    98,
  ));
  const dodgePercent = rounded(clamp(
    1 + character.level * 0.03 + Math.max(0, speed - 210) * 0.025 + dodgeVocationBonus,
    0,
    18,
  ));
  const armorPenetrationPercent = rounded(clamp(
    2 + character.level * 0.025 + mainSkill.level * 0.05 + armorPenetrationVocationBonus,
    0,
    25,
  ));
  const blockChancePercent = rounded(clamp(
    2 + shielding * 0.12 + character.level * 0.02 + blockChanceVocationBonus + (hasShield ? 8 : 0),
    0,
    35,
  ));
  const blockMitigationPercent = rounded(clamp(
    20 + shielding * 0.25 + armor * 0.6 + blockMitigationVocationBonus + (hasShield ? 8 : 0),
    20,
    55,
  ));

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
    accuracyPercent,
    dodgePercent,
    armorPenetrationPercent,
    blockChancePercent,
    blockMitigationPercent,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

function rounded(value: number) {
  return Number(value.toFixed(2));
}
