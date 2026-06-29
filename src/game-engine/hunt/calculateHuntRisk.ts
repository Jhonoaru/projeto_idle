import { calculateHuntPower } from "./calculateHuntPower";
import type { Character, HuntArea, HuntRisk } from "../../shared/types";

const riskBase: Record<HuntRisk, number> = {
  safe: 0.005,
  low: 0.025,
  medium: 0.07,
  high: 0.16,
  deadly: 0.32,
};

export function calculateHuntRisk(character: Character, hunt: HuntArea) {
  const power = calculateHuntPower(character);
  const averageMonsterDamage =
    hunt.monsters.reduce(
      (sum, monster) => sum + (monster.minDamage + monster.maxDamage) / 2,
      0,
    ) / hunt.monsters.length;
  const levelGap = hunt.recommendedLevel - character.level;
  const vocationFit = hunt.recommendedVocations?.includes(character.vocation)
    ? -0.025
    : 0.035;
  const defensePressure = Math.max(
    0,
    averageMonsterDamage / Math.max(1, power.defensivePower) - 0.32,
  );
  const underLevelPenalty = levelGap > 0 ? levelGap * 0.025 : levelGap * 0.004;
  const staminaPenalty = character.staminaHours < 14 ? 0.04 : 0;

  const deathChance = clamp(
    riskBase[hunt.risk] +
      vocationFit +
      defensePressure +
      underLevelPenalty +
      staminaPenalty,
    0.001,
    0.92,
  );

  return {
    deathChance,
    label: formatRiskLabel(deathChance),
    power,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatRiskLabel(chance: number) {
  if (chance < 0.02) return "Very Safe";
  if (chance < 0.06) return "Low";
  if (chance < 0.14) return "Medium";
  if (chance < 0.28) return "High";
  return "Deadly";
}
