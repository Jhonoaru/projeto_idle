import type { CombatConditionDefinition, DamageType, Vocation } from "../shared/types";

export type CombatSkillCategory = "attack" | "support";
export type CombatSkillVisual = "slash" | "projectile" | "burst" | "ward" | "nature" | "spirit";

export interface CombatSkillDefinition {
  id: string;
  vocation: Vocation;
  category: CombatSkillCategory;
  name: string;
  code: string;
  description: string;
  levelRequired: number;
  manaCost: number;
  cooldownSeconds: number;
  visual: CombatSkillVisual;
  damageType?: DamageType;
  condition?: CombatConditionDefinition;
  effect: {
    attack: number;
    survival: number;
    supply: number;
    damage: number;
    healing: number;
    mitigation: number;
    armorPenetration: number;
    conditionResistancePenetration: number;
  };
}

const skill = (
  vocation: Vocation,
  category: CombatSkillCategory,
  id: string,
  name: string,
  code: string,
  description: string,
  levelRequired: number,
  manaCost: number,
  cooldownSeconds: number,
  visual: CombatSkillVisual,
  effect: Partial<CombatSkillDefinition["effect"]>,
  damageType?: DamageType,
  condition?: CombatConditionDefinition,
): CombatSkillDefinition => ({
  id,
  vocation,
  category,
  name,
  code,
  description,
  levelRequired,
  manaCost,
  cooldownSeconds,
  visual,
  damageType,
  condition,
  effect: {
    attack: effect.attack ?? 0,
    survival: effect.survival ?? 0,
    supply: effect.supply ?? 0,
    damage: effect.damage ?? (category === "attack" ? effect.attack ?? 0 : 0),
    healing: effect.healing ?? 0,
    mitigation: effect.mitigation ?? 0,
    armorPenetration: effect.armorPenetration ?? 0,
    conditionResistancePenetration: effect.conditionResistancePenetration ?? 0,
  },
});

export const combatSkills: readonly CombatSkillDefinition[] = [
  skill("Guardian", "attack", "guardian-vanguard-slash", "Vanguard Slash", "VS", "A measured frontline weapon cut.", 1, 6, 6, "slash", { attack: 1 }, "physical"),
  skill("Guardian", "attack", "guardian-shield-break", "Shield Break", "SB", "A crushing blow that opens armored targets.", 12, 18, 8, "burst", { attack: 1.4, armorPenetration: 14 }, "physical"),
  skill("Guardian", "attack", "guardian-iron-cyclone", "Iron Cyclone", "IC", "A broad sweep through nearby enemies.", 28, 32, 10, "slash", { attack: 1.9 }, "physical"),
  skill("Guardian", "attack", "guardian-bastion-crash", "Bastion Crash", "BC", "A heavy finishing strike backed by the shield.", 50, 48, 14, "burst", { attack: 2.6, armorPenetration: 8 }, "physical"),
  skill("Guardian", "support", "guardian-guard-stance", "Guard Stance", "GS", "A defensive posture for the next exchange.", 18, 20, 18, "ward", { survival: 2.2, mitigation: 2.2 }),
  skill("Guardian", "support", "guardian-rallying-standard", "Rallying Standard", "RS", "A party-wide resolve signal.", 45, 55, 35, "ward", { attack: 0.8, survival: 3, mitigation: 3 }),

  skill("Ranger", "attack", "ranger-quickshot", "Quickshot", "QS", "A fast and reliable opening arrow.", 1, 4, 4, "projectile", { attack: 0.8 }, "physical"),
  skill("Ranger", "attack", "ranger-piercing-arrow", "Piercing Arrow", "PA", "A focused shot against a lined target.", 14, 16, 7, "projectile", { attack: 1.35, armorPenetration: 12 }, "physical"),
  skill("Ranger", "attack", "ranger-feather-fan", "Feather Fan", "FF", "A short volley across the hunting ground.", 26, 28, 10, "projectile", { attack: 1.85 }, "physical"),
  skill("Ranger", "attack", "ranger-falcon-mark", "Falcon Mark", "FM", "A patient high-damage execution shot.", 48, 42, 14, "projectile", { attack: 2.55, armorPenetration: 10 }, "physical"),
  skill("Ranger", "support", "ranger-trailstep", "Trailstep", "TS", "A quick reposition before the next volley.", 16, 14, 16, "ward", { attack: 0.5, survival: 1, mitigation: 1 }),
  skill("Ranger", "support", "ranger-wind-veil", "Wind Veil", "WV", "A protective current around the party.", 40, 44, 32, "ward", { survival: 2.6, mitigation: 2.6 }),

  skill("Arcanist", "attack", "arcanist-arc-spark", "Arc Spark", "AS", "A compact bolt of unstable arcane force.", 1, 8, 5, "burst", { attack: 1.15 }, "energy"),
  skill("Arcanist", "attack", "arcanist-frost-lance", "Frost Lance", "FL", "A precise shard formed from condensed mana that slows its target.", 12, 22, 7, "projectile", { attack: 1.55, conditionResistancePenetration: 6 }, "ice", { type: "slow", applicationChancePercent: 75, durationSeconds: 5, potencyPercent: 20 }),
  skill("Arcanist", "attack", "arcanist-astral-burst", "Astral Burst", "AB", "A circular detonation around the target.", 24, 38, 10, "burst", { attack: 2.1 }, "energy"),
  skill("Arcanist", "attack", "arcanist-meteor-sigil", "Meteor Sigil", "MS", "A delayed high-energy rune that leaves the target burning.", 46, 64, 15, "burst", { attack: 2.9, conditionResistancePenetration: 12 }, "fire", { type: "burn", applicationChancePercent: 85, durationSeconds: 8, tickIntervalSeconds: 2, damagePercentPerTick: 4 }),
  skill("Arcanist", "support", "arcanist-mana-ward", "Mana Ward", "MW", "Mana forms a temporary defensive shell.", 18, 32, 20, "ward", { survival: 1.8, supply: 0.4, mitigation: 1.8 }),
  skill("Arcanist", "support", "arcanist-chrono-veil", "Chrono Veil", "CV", "A brief field of slowed hostile motion.", 42, 70, 36, "ward", { attack: 0.8, survival: 2.2, mitigation: 2.2 }),

  skill("Warden", "attack", "warden-thorn-bolt", "Thorn Bolt", "TB", "A poisoned thorn propelled by nature magic.", 1, 7, 5, "nature", { attack: 1, conditionResistancePenetration: 4 }, "earth", { type: "poison", applicationChancePercent: 35, durationSeconds: 9, tickIntervalSeconds: 3, damagePercentPerTick: 4 }),
  skill("Warden", "attack", "warden-verdant-wave", "Verdant Wave", "VW", "A sweeping pulse of living energy.", 13, 20, 7, "nature", { attack: 1.45 }, "earth"),
  skill("Warden", "attack", "warden-rootfall", "Rootfall", "RF", "Roots erupt beneath the current target and slow its advance.", 25, 34, 10, "nature", { attack: 1.95, conditionResistancePenetration: 8 }, "earth", { type: "slow", applicationChancePercent: 70, durationSeconds: 6, potencyPercent: 18 }),
  skill("Warden", "attack", "warden-grove-wrath", "Grove Wrath", "GW", "The hunting ground answers with force.", 47, 58, 15, "nature", { attack: 2.7 }, "earth"),
  skill("Warden", "support", "warden-renew", "Renew", "RN", "A steady restorative pulse for an ally.", 10, 18, 14, "nature", { survival: 1.2, supply: 2, healing: 2 }),
  skill("Warden", "support", "warden-barkskin-circle", "Barkskin Circle", "BC", "A protective living ring around the party.", 34, 46, 30, "ward", { survival: 2.5, supply: 1, healing: 0.5, mitigation: 2.5 }),

  skill("Monk", "attack", "monk-palm-strike", "Palm Strike", "PS", "A direct spirit-backed close-range hit.", 1, 4, 4, "spirit", { attack: 0.8, armorPenetration: 5 }, "physical"),
  skill("Monk", "attack", "monk-crescent-kick", "Crescent Kick", "CK", "A turning kick that catches nearby enemies.", 12, 14, 6, "slash", { attack: 1.3 }, "physical"),
  skill("Monk", "attack", "monk-spirit-flurry", "Spirit Flurry", "SF", "A rapid sequence of focused impacts.", 24, 26, 9, "spirit", { attack: 1.85 }, "holy"),
  skill("Monk", "attack", "monk-inner-tempest", "Inner Tempest", "IT", "Stored momentum released in every direction.", 44, 44, 14, "spirit", { attack: 2.55 }, "holy"),
  skill("Monk", "support", "monk-centering-breath", "Centering Breath", "CB", "A calm recovery between attack cycles.", 14, 12, 16, "spirit", { survival: 0.8, supply: 2, healing: 1.6 }),
  skill("Monk", "support", "monk-guardian-mantra", "Guardian Mantra", "GM", "A disciplined protective chant for the party.", 38, 38, 32, "ward", { survival: 2.5, supply: 1, healing: 0.4, mitigation: 2.5 }),
];

export function getCombatSkills(vocation: Vocation, category?: CombatSkillCategory) {
  return combatSkills.filter((entry) => (
    entry.vocation === vocation && (!category || entry.category === category)
  ));
}

export function getUnlockedCombatSkills(vocation: Vocation, level: number, category?: CombatSkillCategory) {
  return getCombatSkills(vocation, category).filter((entry) => level >= entry.levelRequired);
}

export function getPrimaryCombatSkill(vocation: Vocation, level: number, category: CombatSkillCategory) {
  const unlocked = getUnlockedCombatSkills(vocation, level, category);
  return unlocked.at(-1) ?? getCombatSkills(vocation, category)[0];
}
