import { createDefaultDailyRewardState } from "../game-engine/daily-reward/createDefaultDailyRewardState";
import type { Guild } from "../shared/types";

export const mockGuild: Guild = {
  id: "guild-aurora",
  name: "Aurora",
  gold: 420,
  renown: 12,
  rank: "E",
  level: 1,
  bestiary: {
    progress: [],
    charmPoints: 0,
    unlockedCharmIds: [],
    activeCharms: [],
  },
  huntPresets: [],
  collections: {
    unlockedCollectionItemIds: [
      "outfit-wanderer",
      "outfit-field-hunter",
      "outfit-apprentice-mystic",
      "outfit-iron-guard",
      "outfit-road-monk",
      "mount-none",
      "mount-old-mule",
      "mount-brown-pony",
      "avatar-recruit-emblem",
      "avatar-sword-emblem",
      "avatar-shield-emblem",
      "avatar-bow-emblem",
      "avatar-arcane-emblem",
      "avatar-monk-emblem",
    ],
    newlyUnlockedCollectionItemIds: [],
  },
  dailyReward: createDefaultDailyRewardState(),
};
