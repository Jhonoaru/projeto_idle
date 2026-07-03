import type { HuntArea, HuntSimulationResult } from "../../shared/types";

export function getMonsterFocusMatchRatio(
  hunt: HuntArea,
  monsterId: string | undefined,
  result?: Pick<HuntSimulationResult, "monsterKills" | "killedMonsters">,
) {
  if (!monsterId) return 0;

  const huntHasMonster = hunt.monsters.some((monster) => monster.id === monsterId);
  if (!huntHasMonster) return 0;

  if (result?.monsterKills && result.monsterKills.length > 0) {
    const totalKills =
      result.killedMonsters ??
      result.monsterKills.reduce((sum, entry) => sum + entry.kills, 0);
    const focusKills =
      result.monsterKills.find((entry) => entry.monsterId === monsterId)?.kills ?? 0;

    return Math.min(1, Math.max(0, focusKills / Math.max(1, totalKills)));
  }

  return 1;
}
