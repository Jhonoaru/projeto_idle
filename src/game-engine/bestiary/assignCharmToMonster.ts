import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState } from "../../shared/types";

export function assignCharmToMonster(
  bestiary: GuildBestiaryState | undefined,
  charmId: string,
  monsterId: string,
) {
  const state = normalizeBestiaryState(bestiary);
  const charm = getCharmById(charmId);
  const progress = state.progress.find((entry) => entry.monsterId === monsterId);

  if (!charm) throw new Error("Charm not found.");
  if (!state.unlockedCharmIds.includes(charmId)) throw new Error("Unlock this charm first.");
  if (!progress || progress.stage !== "completed") throw new Error("Complete this creature first.");

  return {
    bestiary: {
      ...state,
      activeCharms: [
        ...state.activeCharms.filter(
          (assignment) => assignment.charmId !== charmId && assignment.monsterId !== monsterId,
        ),
        { charmId, monsterId, assignedAt: new Date().toISOString() },
      ],
    },
    logs: [`${charm.name} assigned to ${progress.monsterName}.`],
  };
}
