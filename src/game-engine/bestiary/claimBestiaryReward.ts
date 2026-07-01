import { monsters } from "../../data/monsters";
import { getBestiaryThreshold } from "../../data/bestiaryThresholds";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

const monsterList = Object.values(monsters);

export function claimBestiaryReward(
  bestiary: GuildBestiaryState | undefined,
  monsterId: string,
) {
  const state = normalizeBestiaryState(bestiary);
  const progress = state.progress.map((entry) => ({ ...entry }));
  const entry = progress.find((candidate) => candidate.monsterId === monsterId);

  if (!entry || entry.stage !== "completed") {
    throw new Error("Complete this creature first.");
  }
  if (entry.charmPointsClaimed) {
    throw new Error("Bestiary reward already claimed.");
  }

  const monster = monsterList.find((candidate) => candidate.id === monsterId);
  if (!monster) {
    throw new Error("Creature not found.");
  }

  const reward = getBestiaryThreshold(monster).charmPointsReward;
  entry.charmPointsClaimed = true;

  return {
    bestiary: {
      ...state,
      progress,
      charmPoints: state.charmPoints + reward,
    },
    logs: [`Guild gained ${reward} charm points from ${entry.monsterName}.`],
  };
}
