import type {
  GuildRegionalOrderDifficulty,
  GuildRegionalOrderObjective,
  GuildRegionalOrderRewardItem,
  GuildRegionalOrderRewardTier,
} from "../shared/types";

export interface RegionalCampaignOrderVariant {
  target: number;
  rewardGold: number;
  intensityLabel: string;
}

export interface RegionalCampaignOrderPresentation {
  assignmentLabel: string;
  title: string;
  description: string;
}

export interface RegionalCampaignDifficultyBand {
  id: GuildRegionalOrderDifficulty;
  label: string;
  commandLabel: string;
  description: string;
  requiredGuildLevel: number;
  targetMultiplier: number;
  minimumTarget: number;
  rewardMultiplier: number;
}

export interface RegionalCampaignRewardTierDefinition {
  id: GuildRegionalOrderRewardTier;
  difficulty: GuildRegionalOrderDifficulty;
  label: string;
  shortLabel: string;
  description: string;
  bonusItem?: GuildRegionalOrderRewardItem;
}

export const regionalCampaignOrderClaimLedgerLimit = 192;

export const regionalCampaignDifficultyBands: RegionalCampaignDifficultyBand[] = [
  {
    id: "standard",
    label: "Standard",
    commandLabel: "Field order",
    description: "The regular objective and treasury reward.",
    requiredGuildLevel: 1,
    targetMultiplier: 1,
    minimumTarget: 1,
    rewardMultiplier: 1,
  },
  {
    id: "veteran",
    label: "Veteran",
    commandLabel: "Veteran command",
    description: "A longer assignment with a stronger treasury return.",
    requiredGuildLevel: 3,
    targetMultiplier: 1.5,
    minimumTarget: 2,
    rewardMultiplier: 1.6,
  },
  {
    id: "elite",
    label: "Elite",
    commandLabel: "Elite mandate",
    description: "The hardest regional mandate and its highest local reward.",
    requiredGuildLevel: 5,
    targetMultiplier: 2,
    minimumTarget: 3,
    rewardMultiplier: 2.25,
  },
];

export const regionalCampaignRewardTiers: RegionalCampaignRewardTierDefinition[] = [
  {
    id: "field",
    difficulty: "standard",
    label: "Field Purse",
    shortLabel: "Field",
    description: "A direct guild treasury payment with no bonus material.",
  },
  {
    id: "quartermaster",
    difficulty: "veteran",
    label: "Quartermaster Cache",
    shortLabel: "Quartermaster",
    description: "A stronger treasury payment with basic forge stock for the Guild Depot.",
    bonusItem: { itemId: "iron-ore", quantity: 2 },
  },
  {
    id: "command",
    difficulty: "elite",
    label: "Command Cache",
    shortLabel: "Command",
    description: "The highest daily treasury payment with one rare forge reagent for the Guild Depot.",
    bonusItem: { itemId: "enchanted-dust", quantity: 1 },
  },
];

export const regionalCampaignOrderObjectives: GuildRegionalOrderObjective[] = [
  "hunt_minutes",
  "boss_defeats",
  "contract_successes",
];

export const regionalCampaignOrderVariants: Record<GuildRegionalOrderObjective, RegionalCampaignOrderVariant[]> = {
  hunt_minutes: [
    { target: 30, rewardGold: 180, intensityLabel: "Routine" },
    { target: 45, rewardGold: 240, intensityLabel: "Priority" },
    { target: 60, rewardGold: 300, intensityLabel: "Extended" },
  ],
  boss_defeats: [
    { target: 1, rewardGold: 320, intensityLabel: "Routine" },
    { target: 1, rewardGold: 350, intensityLabel: "Priority" },
    { target: 1, rewardGold: 380, intensityLabel: "Critical" },
  ],
  contract_successes: [
    { target: 1, rewardGold: 240, intensityLabel: "Routine" },
    { target: 1, rewardGold: 280, intensityLabel: "Priority" },
    { target: 1, rewardGold: 320, intensityLabel: "Critical" },
  ],
};

export const regionalCampaignOrderPresentations: Record<GuildRegionalOrderObjective, RegionalCampaignOrderPresentation[]> = {
  hunt_minutes: [
    { assignmentLabel: "Route patrol", title: "Map the Outer Routes", description: "Complete successful Hunt time while charting the active approaches through this region." },
    { assignmentLabel: "Field suppression", title: "Suppress the Hunting Grounds", description: "Complete successful Hunt time while reducing creature pressure across this region." },
    { assignmentLabel: "Long watch", title: "Hold the Regional Watch", description: "Complete successful Hunt time while maintaining a sustained guild presence in this region." },
  ],
  boss_defeats: [
    { assignmentLabel: "Threat intercept", title: "Intercept the Regional Threat", description: "Defeat a Boss tied to this region before its influence reaches the guild routes." },
    { assignmentLabel: "Priority bounty", title: "Issue a Priority Bounty", description: "Defeat a Boss tied to this region under a priority command bounty." },
    { assignmentLabel: "Apex response", title: "Break the Apex Threat", description: "Defeat a Boss tied to this region during a critical command response." },
  ],
  contract_successes: [
    { assignmentLabel: "Supply escort", title: "Reinforce the Supply Route", description: "Complete a successful Contract tied to this region to reinforce local supply lines." },
    { assignmentLabel: "Field recovery", title: "Recover the Field Network", description: "Complete a successful Contract tied to this region to restore an exposed guild route." },
    { assignmentLabel: "Frontier relief", title: "Secure Frontier Relief", description: "Complete a successful Contract tied to this region under a critical relief mandate." },
  ],
};

export function getRegionalCampaignOrderVariant(objective: GuildRegionalOrderObjective, variant: number) {
  return regionalCampaignOrderVariants[objective][variant];
}

export function getRegionalCampaignOrderPresentation(objective: GuildRegionalOrderObjective, presentation: number) {
  return regionalCampaignOrderPresentations[objective][presentation];
}

export function getRegionalCampaignDifficultyBand(difficulty: GuildRegionalOrderDifficulty) {
  return regionalCampaignDifficultyBands.find((band) => band.id === difficulty) ?? regionalCampaignDifficultyBands[0];
}

export function getRegionalCampaignRewardTier(difficulty: GuildRegionalOrderDifficulty) {
  return regionalCampaignRewardTiers.find((tier) => tier.difficulty === difficulty) ?? regionalCampaignRewardTiers[0];
}

export function getRegionalCampaignRewardTierById(rewardTier: GuildRegionalOrderRewardTier | undefined) {
  return regionalCampaignRewardTiers.find((tier) => tier.id === rewardTier) ?? regionalCampaignRewardTiers[0];
}

export function getRegionalCampaignDifficultyValues(
  objective: GuildRegionalOrderObjective,
  variant: number,
  difficulty: GuildRegionalOrderDifficulty,
) {
  const base = getRegionalCampaignOrderVariant(objective, variant);
  const band = getRegionalCampaignDifficultyBand(difficulty);
  const rewardTier = getRegionalCampaignRewardTier(band.id);
  return {
    target: Math.max(band.minimumTarget, Math.ceil(base.target * band.targetMultiplier)),
    rewardGold: Math.max(1, Math.round(base.rewardGold * band.rewardMultiplier)),
    intensityLabel: base.intensityLabel,
    difficultyBand: band,
    rewardTier,
  };
}
