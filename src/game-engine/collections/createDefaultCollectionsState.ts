import { getStarterCollectionItems } from "../../data/collections";
import type { GuildCollectionsState } from "../../shared/types";

export function createDefaultCollectionsState(): GuildCollectionsState {
  return {
    unlockedCollectionItemIds: getStarterCollectionItems().map((item) => item.id),
    newlyUnlockedCollectionItemIds: [],
  };
}
