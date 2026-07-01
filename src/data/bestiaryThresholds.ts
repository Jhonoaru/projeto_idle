import type { BestiaryThreshold, Monster } from "../shared/types";

export function getBestiaryThreshold(monster: Pick<Monster, "level">): BestiaryThreshold {
  if (monster.level <= 10) {
    return { revealKills: 25, completeKills: 100, charmPointsReward: 5 };
  }

  if (monster.level <= 25) {
    return { revealKills: 50, completeKills: 250, charmPointsReward: 10 };
  }

  if (monster.level <= 50) {
    return { revealKills: 100, completeKills: 500, charmPointsReward: 20 };
  }

  return { revealKills: 250, completeKills: 1000, charmPointsReward: 35 };
}
