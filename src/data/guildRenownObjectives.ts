export type GuildRenownObjectiveMetric =
  | "completed_quests"
  | "monster_kills"
  | "successful_expeditions"
  | "facility_upgrades"
  | "completed_projects"
  | "recruited_adventurers";

export interface GuildRenownObjectiveDefinition {
  id: string;
  sigil: string;
  title: string;
  description: string;
  metric: GuildRenownObjectiveMetric;
  target: number;
  rewardRenown: number;
  destination: "quests" | "bestiary" | "contracts" | "headquarters" | "projects" | "recruitment";
}

export const guildRenownObjectives: readonly GuildRenownObjectiveDefinition[] = [
  {
    id: "first-chartered-deed",
    sigil: "QD",
    title: "First Chartered Deed",
    description: "Complete one quest with any adventurer in the guild roster.",
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
    metric: "recruited_adventurers",
    target: 1,
    rewardRenown: 5,
    destination: "recruitment",
  },
];

export function getGuildRenownObjective(objectiveId: string | undefined) {
  return guildRenownObjectives.find((objective) => objective.id === objectiveId);
}
