import type { Character, Quest, QuestRisk } from "../../shared/types";

const baseRisk: Record<QuestRisk, number> = {
  safe: 0.005,
  low: 0.03,
  medium: 0.09,
  high: 0.18,
  deadly: 0.34,
};

export function calculateQuestRisk(character: Character, quest: Quest) {
  const levelGap = quest.requiredLevel - character.level;
  const vocationFit = quest.recommendedVocations?.includes(character.vocation)
    ? -0.025
    : 0.025;
  const defenseBonus = Math.min(0.08, character.attributes.defensePower / 2000);
  const chance = clamp(
    baseRisk[quest.risk] + (levelGap > 0 ? levelGap * 0.025 : levelGap * 0.004) + vocationFit - defenseBonus,
    0.001,
    0.85,
  );

  return {
    failChance: chance,
    deathChance: chance * (quest.risk === "deadly" ? 0.55 : 0.22),
    label: chance < 0.04 ? "Low" : chance < 0.12 ? "Medium" : chance < 0.25 ? "High" : "Deadly",
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
