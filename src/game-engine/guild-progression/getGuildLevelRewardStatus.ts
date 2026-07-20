import { guildLevelRewards } from "../../data/guildLevelRewards";
import type { Guild } from "../../shared/types";
import { getGuildProgression } from "./getGuildProgression";
import { normalizeGuildProgressionRewardState } from "./normalizeGuildProgressionRewardState";

export function getGuildLevelRewardStatus(guild: Guild) {
  const progression = getGuildProgression(guild);
  const state = normalizeGuildProgressionRewardState(guild.progressionRewards);
  const rewards = guildLevelRewards.map((reward) => ({
    reward,
    reached: progression.level >= reward.level,
    claimed: state.claimedLevels.includes(reward.level),
    claimable: progression.level >= reward.level && !state.claimedLevels.includes(reward.level),
  }));

  return {
    progression,
    state,
    rewards,
    claimedCount: rewards.filter((entry) => entry.claimed).length,
    claimableCount: rewards.filter((entry) => entry.claimable).length,
  };
}
