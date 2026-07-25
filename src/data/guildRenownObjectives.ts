export type GuildRenownObjectiveMetric =
  | "completed_quests"
  | "monster_kills"
  | "successful_expeditions"
  | "facility_upgrades"
  | "completed_projects"
  | "recruited_adventurers"
  | "total_operations"
  | "successful_operations"
  | "boss_defeats";

export type GuildRenownObjectiveGroup = "foundation" | "campaign";

export interface GuildRenownObjectiveDefinition {
  id: string;
  sigil: string;
  title: string;
  description: string;
  group: GuildRenownObjectiveGroup;
  metric: GuildRenownObjectiveMetric;
  target: number;
  rewardRenown: number;
  destination: "quests" | "bestiary" | "contracts" | "headquarters" | "projects" | "recruitment" | "bosses" | "operations";
}

export const guildRenownObjectives: readonly GuildRenownObjectiveDefinition[] = [
  {
    id: "first-chartered-deed",
    sigil: "QD",
    title: "First Chartered Deed",
    description: "Complete one quest with any adventurer in the guild roster.",
    group: "foundation",
    metric: "completed_quests",
    target: 1,
    rewardRenown: 2,
    destination: "quests",
  },
  {
    id: "field-research-ledger",
    sigil: "BR",
    title: "Field Research Ledger",
    description: "Record twenty-five creature kills in the guild Bestiary.",
    group: "foundation",
    metric: "monster_kills",
    target: 25,
    rewardRenown: 3,
    destination: "bestiary",
  },
  {
    id: "reliable-contractors",
    sigil: "CT",
    title: "Reliable Contractors",
    description: "Finish two successful support expeditions from the Contracts Board.",
    group: "foundation",
    metric: "successful_expeditions",
    target: 2,
    rewardRenown: 4,
    destination: "contracts",
  },
  {
    id: "hall-under-arms",
    sigil: "HQ",
    title: "Hall Under Arms",
    description: "Complete two facility upgrades across the Guild Headquarters.",
    group: "foundation",
    metric: "facility_upgrades",
    target: 2,
    rewardRenown: 4,
    destination: "headquarters",
  },
  {
    id: "lasting-guild-work",
    sigil: "PW",
    title: "Lasting Guild Work",
    description: "Complete one permanent Guild Project.",
    group: "foundation",
    metric: "completed_projects",
    target: 1,
    rewardRenown: 5,
    destination: "projects",
  },
  {
    id: "expanded-company",
    sigil: "RC",
    title: "Expanded Company",
    description: "Recruit one permanent applicant into the guild roster.",
    group: "foundation",
    metric: "recruited_adventurers",
    target: 1,
    rewardRenown: 5,
    destination: "recruitment",
  },
  {
    id: "campaign-first-report",
    sigil: "I",
    title: "First After-Action Report",
    description: "Complete the guild's first recorded Boss or support Contract operation.",
    group: "campaign",
    metric: "total_operations",
    target: 1,
    rewardRenown: 2,
    destination: "operations",
  },
  {
    id: "campaign-boss-line",
    sigil: "II",
    title: "Break the Boss Line",
    description: "Defeat three Bosses across the permanent guild campaign.",
    group: "campaign",
    metric: "boss_defeats",
    target: 3,
    rewardRenown: 3,
    destination: "bosses",
  },
  {
    id: "campaign-contract-network",
    sigil: "III",
    title: "Reliable Contract Network",
    description: "Complete five successful support Contracts for the guild.",
    group: "campaign",
    metric: "successful_expeditions",
    target: 5,
    rewardRenown: 3,
    destination: "contracts",
  },
  {
    id: "campaign-seasoned-command",
    sigil: "IV",
    title: "Seasoned Command",
    description: "Complete ten recorded operations of either kind.",
    group: "campaign",
    metric: "total_operations",
    target: 10,
    rewardRenown: 4,
    destination: "operations",
  },
  {
    id: "campaign-proven-command",
    sigil: "V",
    title: "Proven Field Command",
    description: "Secure ten successful Boss or Contract outcomes.",
    group: "campaign",
    metric: "successful_operations",
    target: 10,
    rewardRenown: 5,
    destination: "operations",
  },
  {
    id: "campaign-veteran-command",
    sigil: "VI",
    title: "Veteran Campaign Office",
    description: "Complete twenty-five recorded operations across the local campaign.",
    group: "campaign",
    metric: "total_operations",
    target: 25,
    rewardRenown: 6,
    destination: "operations",
  },
];

export function getGuildRenownObjective(objectiveId: string | undefined) {
  return guildRenownObjectives.find((objective) => objective.id === objectiveId);
}
