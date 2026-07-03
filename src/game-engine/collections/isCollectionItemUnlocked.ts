import { normalizeCollectionsState } from "./normalizeCollectionsState";
import type { GuildCollectionsState } from "../../shared/types";

export function isCollectionItemUnlocked(
  collections: GuildCollectionsState | undefined,
  itemId: string,
) {
  return normalizeCollectionsState(collections).unlockedCollectionItemIds.includes(itemId);
}
