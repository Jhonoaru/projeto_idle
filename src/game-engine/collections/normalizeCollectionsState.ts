import { collectionItems, getStarterCollectionItems } from "../../data/collections";
import type { GuildCollectionsState } from "../../shared/types";
import { createDefaultCollectionsState } from "./createDefaultCollectionsState";

export function normalizeCollectionsState(
  collections?: Partial<GuildCollectionsState> | null,
): GuildCollectionsState {
  const validIds = new Set(collectionItems.map((item) => item.id));
  const starterIds = getStarterCollectionItems().map((item) => item.id);
  const unlockedCollectionItemIds = unique([
    ...starterIds,
    ...(Array.isArray(collections?.unlockedCollectionItemIds)
      ? collections?.unlockedCollectionItemIds ?? []
      : []),
  ]).filter((itemId) => validIds.has(itemId));
  const unlockedSet = new Set(unlockedCollectionItemIds);
  const newlyUnlockedCollectionItemIds = unique(
    Array.isArray(collections?.newlyUnlockedCollectionItemIds)
      ? collections?.newlyUnlockedCollectionItemIds ?? []
      : [],
  ).filter((itemId) => validIds.has(itemId) && unlockedSet.has(itemId));

  return {
    ...createDefaultCollectionsState(),
    unlockedCollectionItemIds,
    newlyUnlockedCollectionItemIds,
  };
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean).map(String))];
}
