import { calculateBossPower } from "./calculateBossPower";
import type { Boss, BossParty, Character } from "../../shared/types";

const baseRisk = {
  safe: { death: 0.01, success: 0.92 },
  low: { death: 0.04, success: 0.84 },
  medium: { death: 0.1, success: 0.72 },
  high: { death: 0.2, success: 0.58 },
  deadly: { death: 0.34, success: 0.42 },
};

export function calculateBossRisk(
  characters: Character[],
  party: BossParty,
  boss: Boss,
) {
  const power = calculateBossPower(characters, party, boss);
  const baseline = baseRisk[boss.risk];
  const powerRatio = power.targetPower > 0 ? power.totalPower / power.targetPower : 1;
  const warnings: string[] = [];
  let deathChance = baseline.death;
  let successChance = baseline.success;

  if (powerRatio >= 1.35) {
    deathChance *= 0.45;
    successChance += 0.18;
  } else if (powerRatio >= 1) {
    deathChance *= 0.75;
    successChance += 0.08;
  } else if (powerRatio < 0.75) {
    deathChance *= 1.9;
    successChance -= 0.25;
    warnings.push("Party power is low for this boss.");
  } else {
    deathChance *= 1.25;
    successChance -= 0.08;
  }

  if ((boss.risk === "high" || boss.risk === "deadly") && !power.hasHealer) {
    deathChance += 0.12;
    successChance -= 0.08;
    warnings.push("High-risk boss without healer.");
  }

  if (
    boss.id === "boss-novice-arena-champion" &&
    !party.members.some((member) => member.role === "healer")
  ) {
    deathChance += 0.04;
    warnings.push("Healer reduces risk in the Novice Arena Champion fight.");
  }

  return {
    deathChance: clamp(deathChance, 0.01, 0.85),
    successChance: clamp(successChance, 0.05, 0.98),
    riskLabel: boss.risk,
    warnings,
    power,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
