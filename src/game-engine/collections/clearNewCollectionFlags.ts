import type { Guild } from "../../shared/types";
import { normalizeCollectionsState } from "./normalizeCollectionsState";

export function clearNewCollectionFlags(guild: Guild): Guild {
  const collections = normalizeCollectionsState(guild.collections);
  if (collections.newlyUnlockedCollectionItemIds.length === 0) return { ...guild, collections };

  return {
    ...guild,
    collections: {
      ...collections,
      newlyUnlockedCollectionItemIds: [],
    },
  };
}
