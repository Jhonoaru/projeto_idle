import { getDestinyNodeById } from "../../data/destinyNodes";
import type { Character, DestinyBonus } from "../../shared/types";
import { normalizeDestinyState } from "./normalizeDestinyState";

const bonusKeys: Array<keyof DestinyBonus> = [
  "maxHealthPercent",
  "attackPowerPercent",
  "magicPowerPercent",
  "distancePowerPercent",
  "fistPowerPercent",
  "defensePowerPercent",
  "xpBonusPercent",
  "goldBonusPercent",
  "supplyReductionPercent",
  "capacityBonusFlat",
  "deathRiskReductionPercent",
  "lootBonusPercent",
  "critChancePercent",
  "critDamagePercent",
];

export function calculateDestinyBonuses(character: Pick<Character, "level" | "vocation" | "destiny">): DestinyBonus {
  const destiny = normalizeDestinyState(character);
  const bonus: DestinyBonus = {};

  for (const nodeId of destiny.unlockedNodeIds) {
    const node = getDestinyNodeById(nodeId);
    if (!node || (node.allowedVocations && !node.allowedVocations.includes(character.vocation))) continue;

    for (const key of bonusKeys) {
      const value = node.bonus[key];
      if (!Number.isFinite(value)) continue;
      bonus[key] = (bonus[key] ?? 0) + (value ?? 0);
    }
  }

  return {
    ...bonus,
    supplyReductionPercent: Math.min(20, Math.max(0, bonus.supplyReductionPercent ?? 0)),
    deathRiskReductionPercent: Math.min(30, Math.max(0, bonus.deathRiskReductionPercent ?? 0)),
  };
}

export function formatDestinyBonusSummary(bonus: DestinyBonus) {
  const entries = [
    bonus.maxHealthPercent ? `Health +${bonus.maxHealthPercent}%` : undefined,
    bonus.attackPowerPercent ? `Attack +${bonus.attackPowerPercent}%` : undefined,
    bonus.magicPowerPercent ? `Magic +${bonus.magicPowerPercent}%` : undefined,
    bonus.distancePowerPercent ? `Distance +${bonus.distancePowerPercent}%` : undefined,
    bonus.fistPowerPercent ? `Fist +${bonus.fistPowerPercent}%` : undefined,
    bonus.defensePowerPercent ? `Defense +${bonus.defensePowerPercent}%` : undefined,
    bonus.xpBonusPercent ? `XP +${bonus.xpBonusPercent}%` : undefined,
    bonus.goldBonusPercent ? `Gold +${bonus.goldBonusPercent}%` : undefined,
    bonus.lootBonusPercent ? `Loot +${bonus.lootBonusPercent}%` : undefined,
    bonus.supplyReductionPercent ? `Supplies -${bonus.supplyReductionPercent}%` : undefined,
    bonus.capacityBonusFlat ? `Capacity +${bonus.capacityBonusFlat}` : undefined,
    bonus.deathRiskReductionPercent ? `Risk -${bonus.deathRiskReductionPercent}%` : undefined,
    bonus.critChancePercent ? `Crit +${bonus.critChancePercent}%` : undefined,
    bonus.critDamagePercent ? `Crit dmg +${bonus.critDamagePercent}%` : undefined,
  ].filter(Boolean);

  return entries.length > 0 ? entries.join(" / ") : "No active bonuses";
}
