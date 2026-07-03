import { getCollectionItemById } from "../../data/collections";
import type { Guild } from "../../shared/types";
import { normalizeCollectionsState } from "./normalizeCollectionsState";

export function unlockCollectionItem(guild: Guild, itemId: string) {
  const item = getCollectionItemById(itemId);
  if (!item) throw new Error("Collection item not found.");

  const collections = normalizeCollectionsState(guild.collections);
  if (collections.unlockedCollectionItemIds.includes(item.id)) {
    return { guild: { ...guild, collections }, unlocked: false, logs: [] as string[] };
  }

  const updatedCollections = {
    unlockedCollectionItemIds: [...collections.unlockedCollectionItemIds, item.id],
    newlyUnlockedCollectionItemIds: [
      ...collections.newlyUnlockedCollectionItemIds.filter((newItemId) => newItemId !== item.id),
      item.id,
    ],
  };

  return {
    guild: {
      ...guild,
      collections: normalizeCollectionsState(updatedCollections),
    },
    unlocked: true,
    logs: [`Collection unlocked: ${item.name}.`],
  };
}
