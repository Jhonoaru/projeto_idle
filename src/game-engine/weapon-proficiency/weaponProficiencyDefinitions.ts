import type {
  WeaponProficiencyPerk,
  WeaponProficiencyType,
} from "../../shared/types";

export const WEAPON_PROFICIENCY_TYPES: WeaponProficiencyType[] = [
  "sword",
  "axe",
  "club",
  "bow",
  "wand",
  "staff",
  "fist",
  "shield",
];

export const WEAPON_PROFICIENCY_MAX_LEVEL = 20;

export const WEAPON_PROFICIENCY_LABELS: Record<WeaponProficiencyType, string> = {
  sword: "Sword Mastery",
  axe: "Axe Mastery",
  club: "Club Mastery",
  bow: "Bow Mastery",
  wand: "Wand Mastery",
  staff: "Staff Mastery",
  fist: "Fist Mastery",
  shield: "Shield Mastery",
};

export const WEAPON_PROFICIENCY_PERKS: Record<WeaponProficiencyType, WeaponProficiencyPerk[]> = {
  sword: [
    perk("sword-balanced-edge", "Balanced Edge", 2, "+2% attack with swords.", { attackPowerPercent: 2 }),
    perk("sword-precise-cuts", "Precise Cuts", 5, "+2% crit chance with swords.", { critChancePercent: 2 }),
    perk("sword-duelist-rhythm", "Duelist Rhythm", 10, "+3% XP with swords.", { xpBonusPercent: 3 }),
  ],
  axe: [
    perk("axe-heavy-swings", "Heavy Swings", 2, "+3% attack with axes.", { attackPowerPercent: 3 }),
    perk("axe-armor-breaker", "Armor Breaker", 5, "+3% crit damage with axes.", { critDamagePercent: 3 }),
    perk("axe-brutal-arc", "Brutal Arc", 10, "+2% XP with axes.", { xpBonusPercent: 2 }),
  ],
  club: [
    perk("club-crushing-blows", "Crushing Blows", 2, "+2% attack with clubs.", { attackPowerPercent: 2 }),
    perk("club-staggering-impact", "Staggering Impact", 5, "+2% defense with clubs.", { defensePowerPercent: 2 }),
    perk("club-heavy-control", "Heavy Control", 10, "+3% crit damage with clubs.", { critDamagePercent: 3 }),
  ],
  bow: [
    perk("bow-steady-aim", "Steady Aim", 2, "+2% distance power with bows.", { distancePowerPercent: 2 }),
    perk("bow-arrow-economy", "Arrow Economy", 5, "-3% ammo consumed with bows.", { supplyReductionPercent: 3 }),
    perk("bow-longshot", "Longshot", 10, "+2% crit chance with bows.", { critChancePercent: 2 }),
  ],
  wand: [
    perk("wand-arcane-spark", "Arcane Spark", 2, "+2% magic power with wands.", { magicPowerPercent: 2 }),
    perk("wand-mana-flow", "Mana Flow", 5, "-3% mana potion consumed with wands.", { supplyReductionPercent: 3 }),
    perk("wand-spell-surge", "Spell Surge", 10, "+3% crit damage with wands.", { critDamagePercent: 3 }),
  ],
  staff: [
    perk("staff-focused-channeling", "Focused Channeling", 2, "+3% magic power with staves.", { magicPowerPercent: 3 }),
    perk("staff-rune-efficiency", "Rune Efficiency", 5, "-3% rune consumed with staves.", { supplyReductionPercent: 3 }),
    perk("staff-deep-channel", "Deep Channel", 10, "+2% XP with staves.", { xpBonusPercent: 2 }),
  ],
  fist: [
    perk("fist-iron-knuckles", "Iron Knuckles", 2, "+2% fist power.", { fistPowerPercent: 2 }),
    perk("fist-flowing-guard", "Flowing Guard", 5, "+2% defense with fist weapons.", { defensePowerPercent: 2 }),
    perk("fist-inner-force", "Inner Force", 10, "+3% XP with fist weapons.", { xpBonusPercent: 3 }),
  ],
  shield: [
    perk("shield-guard-stance", "Guard Stance", 2, "+2% defense with shields.", { defensePowerPercent: 2 }),
    perk("shield-shield-discipline", "Shield Discipline", 5, "-2% supplies consumed while shielded.", { supplyReductionPercent: 2 }),
    perk("shield-last-stand", "Last Stand", 10, "+3% defense with shields.", { defensePowerPercent: 3 }),
  ],
};

function perk(
  id: string,
  name: string,
  requiredLevel: number,
  description: string,
  bonus: WeaponProficiencyPerk["bonus"],
): WeaponProficiencyPerk {
  return { id, name, requiredLevel, description, bonus };
}
