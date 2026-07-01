import { experienceForLevel } from "../progression/experienceTable";
import { calculateBlessProtection } from "./calculateBlessProtection";
import type { Blessing, Character, DeathPenalty, HuntRisk } from "../../shared/types";

type DeathRisk = HuntRisk;

const penaltyByRisk: Record<DeathRisk, { xpPercent: number; goldPercent: number; recoverySeconds: number }> = {
  safe: { xpPercent: 0, goldPercent: 0, recoverySeconds: 10 },
  low: { xpPercent: 0.005, goldPercent: 0.01, recoverySeconds: 20 },
  medium: { xpPercent: 0.01, goldPercent: 0.02, recoverySeconds: 45 },
  high: { xpPercent: 0.02, goldPercent: 0.03, recoverySeconds: 90 },
  deadly: { xpPercent: 0.04, goldPercent: 0.05, recoverySeconds: 180 },
};

export function calculateDeathPenalty(
  character: Character,
  guildGold: number,
  risk: DeathRisk,
  blessing?: Blessing,
): { penalty: DeathPenalty; recoverySeconds: number } {
  const rule = penaltyByRisk[risk] ?? penaltyByRisk.medium;
  const protection = calculateBlessProtection(blessing);
  const penaltyMultiplier = 1 - protection;
  const levelFloor = experienceForLevel(character.level);
  const rawExperienceLost = Math.floor(character.experience * rule.xpPercent);
  const protectedExperienceLost = Math.floor(rawExperienceLost * penaltyMultiplier);
  const experienceLost = Math.min(
    Math.max(0, character.experience - levelFloor),
    protectedExperienceLost,
  );
  const rawGoldLost = Math.floor(guildGold * rule.goldPercent);
  const lowRiskGoldLost = risk === "low" ? Math.min(rawGoldLost, 500) : rawGoldLost;
  const goldLost = Math.max(0, Math.floor(lowRiskGoldLost * penaltyMultiplier));

  return {
    penalty: {
      experienceLost,
      goldLost,
      itemsLostValue: 0,
      blessProtected: Boolean(blessing),
      lostItems: [],
    },
    recoverySeconds: rule.recoverySeconds,
  };
}
