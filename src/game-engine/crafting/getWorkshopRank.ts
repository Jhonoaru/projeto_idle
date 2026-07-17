import { workshopRankNames } from "../../data/craftingRecipes";
import type { GuildCraftingState, GuildWorkshopRank } from "../../shared/types";
import { normalizeGuildCraftingState } from "./normalizeGuildCraftingState";

const rankThresholds: Record<GuildWorkshopRank, number> = { 1: 0, 2: 3, 3: 8, 4: 15 };

export function getWorkshopRank(state: GuildCraftingState | undefined) {
  const totalCrafts = normalizeGuildCraftingState(state).totalCrafts;
  const rank: GuildWorkshopRank = totalCrafts >= 15 ? 4 : totalCrafts >= 8 ? 3 : totalCrafts >= 3 ? 2 : 1;
  const nextRank = rank < 4 ? ((rank + 1) as GuildWorkshopRank) : undefined;

  return {
    rank,
    name: workshopRankNames[rank],
    totalCrafts,
    nextRank,
    nextRankName: nextRank ? workshopRankNames[nextRank] : undefined,
    craftsToNextRank: nextRank ? Math.max(0, rankThresholds[nextRank] - totalCrafts) : 0,
  };
}
