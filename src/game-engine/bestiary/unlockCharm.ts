import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

export function unlockCharm(bestiary: GuildBestiaryState | undefined, charmId: string) {
  const state = normalizeBestiaryState(bestiary);
  const charm = getCharmById(charmId);

  if (!charm) throw new Error("Charm not found.");
  if (state.unlockedCharmIds.includes(charmId)) throw new Error(`${charm.name} already unlocked.`);
  if (state.charmPoints < charm.unlockCost) throw new Error("Not enough charm points.");

  return {
    bestiary: {
      ...state,
      charmPoints: state.charmPoints - charm.unlockCost,
      unlockedCharmIds: [...state.unlockedCharmIds, charmId],
    },
    logs: [`${charm.name} unlocked.`],
  };
}
