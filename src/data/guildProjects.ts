import type { GuildProjectDefinition } from "../shared/types";

export const guildProjects: GuildProjectDefinition[] = [
  {
    id: "field-supply-station",
    name: "Field Supply Station",
    description: "Build a modest depot counter where returning parties can sort basic field supplies.",
    sigil: "FS",
    minimumCareerPoints: 0,
    phases: [
      phase("Clear the Annex", "Prepare a dry corner of the guild hall.", 100, [["old-cloth", 2]]),
      phase("Reinforce the Shelves", "Fit iron braces for heavy supply crates.", 150, [["iron-ore", 2]]),
      phase("Raise the Station", "Finish the counter and mark the quartermaster seal.", 250, [["old-cloth", 4], ["iron-ore", 2]]),
    ],
    rewardRenown: 5,
    rewardCollectionItemId: "avatar-quartermaster-seal",
  },
  {
    id: "cartographers-archive",
    name: "Cartographers' Archive",
    description: "Preserve expedition maps and field notes in a permanent guild archive.",
    sigil: "CA",
    minimumCareerPoints: 100,
    prerequisiteProjectId: "field-supply-station",
    phases: [
      phase("Bind Field Journals", "Restore damaged notes gathered from local routes.", 200, [["old-cloth", 5]]),
      phase("Build Map Cabinets", "Protect regional charts behind reinforced fittings.", 300, [["iron-ore", 5]]),
      phase("Seal the Archive", "Use enchanted dust to preserve the oldest records.", 450, [["old-cloth", 5], ["enchanted-dust", 1]]),
    ],
    rewardRenown: 8,
    rewardCollectionItemId: "outfit-guild-cartographer",
  },
  {
    id: "founders-monument",
    name: "Founders' Monument",
    description: "Commission a restrained memorial recording the guild's first lasting achievements.",
    sigil: "FM",
    minimumCareerPoints: 250,
    prerequisiteProjectId: "cartographers-archive",
    phases: [
      phase("Lay the Foundation", "Set a strong iron base in the central hall.", 400, [["iron-ore", 8]]),
      phase("Engrave the Record", "Prepare cloth rubbings for the names and milestones.", 600, [["old-cloth", 10], ["enchanted-dust", 1]]),
      phase("Dedicate the Monument", "Complete the seal without turning it into a source of power.", 900, [["iron-ore", 10], ["enchanted-dust", 2]]),
    ],
    rewardRenown: 12,
    rewardCollectionItemId: "avatar-founders-mark",
  },
];

export function getGuildProject(projectId?: string) {
  return guildProjects.find((project) => project.id === projectId);
}

function phase(name: string, description: string, goldCost: number, materials: Array<[string, number]>) {
  return { name, description, goldCost, materials: materials.map(([itemId, quantity]) => ({ itemId, quantity })) };
}
