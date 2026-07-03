import { monsters } from "../../data/monsters";
import { normalizeBestiaryState } from "../bestiary/getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

export function getAvailableFocusMonsters(bestiary?: GuildBestiaryState) {
  const catalogMonsterIds = new Set(
    Object.values(monsters).map((monster) => monster.id),
  );

  return normalizeBestiaryState(bestiary)
    .progress
    .filter((progress) =>
      ["started", "revealed", "completed"].includes(progress.stage),
    )
    .filter((progress) => catalogMonsterIds.has(progress.monsterId))
    .sort((a, b) => a.monsterName.localeCompare(b.monsterName));
}

export function isKnownFocusMonster(
  monsterId: string | undefined,
  bestiary?: GuildBestiaryState,
) {
  if (!monsterId) return false;

  return getAvailableFocusMonsters(bestiary).some(
    (monster) => monster.monsterId === monsterId,
  );
}
