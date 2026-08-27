export interface BossExecutionMasteryMilestone {
  id: string;
  label: string;
  description: string;
  requiredBestPerfectChain: number;
  requiredTotalPerfectReactions: number;
  collectionItemId: string;
}

export const bossExecutionMasteryMilestones: BossExecutionMasteryMilestone[] = [
  {
    id: "execution-precision-mark",
    label: "Precision Mark",
    description: "Complete a victorious Boss operation with a Perfect chain of at least x2.",
    requiredBestPerfectChain: 2,
    requiredTotalPerfectReactions: 2,
    collectionItemId: "avatar-perfect-execution-sigil",
  },
  {
    id: "execution-raid-tactician",
    label: "Raid Tactician",
    description: "Reach a Perfect chain of x4 and record 12 Perfect Boss reactions.",
    requiredBestPerfectChain: 4,
    requiredTotalPerfectReactions: 12,
    collectionItemId: "outfit-raid-tactician",
  },
  {
    id: "execution-flawless-vanguard",
    label: "Flawless Vanguard",
    description: "Reach a Perfect chain of x6 and record 30 Perfect Boss reactions.",
    requiredBestPerfectChain: 6,
    requiredTotalPerfectReactions: 30,
    collectionItemId: "mount-battle-ram",
  },
];

export function getBossExecutionMasteryMilestone(id: string) {
  return bossExecutionMasteryMilestones.find((milestone) => milestone.id === id);
}
