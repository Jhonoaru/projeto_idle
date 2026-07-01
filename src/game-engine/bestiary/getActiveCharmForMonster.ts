import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

export function getActiveCharmForMonster(
  bestiary: GuildBestiaryState | undefined,
  monsterId: string,
) {
  const assignment = normalizeBestiaryState(bestiary).activeCharms.find(
    (entry) => entry.monsterId === monsterId,
  );

  if (!assignment) return undefined;

  const charm = getCharmById(assignment.charmId);
  return charm ? { assignment, charm } : undefined;
}
