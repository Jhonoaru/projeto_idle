import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

export function removeCharmFromMonster(
  bestiary: GuildBestiaryState | undefined,
  monsterId: string,
) {
  const state = normalizeBestiaryState(bestiary);
  const assignment = state.activeCharms.find((entry) => entry.monsterId === monsterId);

  if (!assignment) throw new Error("No charm assigned to this creature.");

  const charm = getCharmById(assignment.charmId);
  const progress = state.progress.find((entry) => entry.monsterId === monsterId);

  return {
    bestiary: {
      ...state,
      activeCharms: state.activeCharms.filter((entry) => entry.monsterId !== monsterId),
    },
    logs: [`${charm?.name ?? "Charm"} removed from ${progress?.monsterName ?? "creature"}.`],
  };
}
