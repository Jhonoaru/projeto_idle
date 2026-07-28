import type { GuildRegionalOrderObjective } from "../shared/types";

export interface RegionalCampaignOrderVariant {
  target: number;
  rewardGold: number;
}

export const regionalCampaignOrderObjectives: GuildRegionalOrderObjective[] = [
  "hunt_minutes",
  "boss_defeats",
  "contract_successes",
];

export const regionalCampaignOrderVariants: Record<GuildRegionalOrderObjective, RegionalCampaignOrderVariant[]> = {
  hunt_minutes: [
    { target: 30, rewardGold: 180 },
    { target: 45, rewardGold: 240 },
    { target: 60, rewardGold: 300 },
  ],
  boss_defeats: [
    { target: 1, rewardGold: 320 },
    { target: 1, rewardGold: 350 },
    { target: 1, rewardGold: 380 },
  ],
  contract_successes: [
    { target: 1, rewardGold: 240 },
    { target: 1, rewardGold: 280 },
    { target: 1, rewardGold: 320 },
  ],
};

export function getRegionalCampaignOrderVariant(objective: GuildRegionalOrderObjective, variant: number) {
  return regionalCampaignOrderVariants[objective][variant];
}
