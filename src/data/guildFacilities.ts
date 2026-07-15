import type { GuildFacilityDefinition } from "../shared/types";

export const guildFacilities: GuildFacilityDefinition[] = [
  {
    id: "war_room",
    name: "War Room",
    description: "Maps, reports and field plans improve experience earned from completed hunts.",
    sigil: "WR",
    bonusLabel: "Hunt XP",
    bonusPerLevel: 1,
    upgradeCosts: [250, 1_000, 5_000],
    careerPointRequirements: [0, 150, 350],
  },
  {
    id: "training_yard",
    name: "Training Yard",
    description: "Permanent practice grounds improve progress from every training program.",
    sigil: "TY",
    bonusLabel: "Training progress",
    bonusPerLevel: 2,
    upgradeCosts: [200, 900, 4_500],
    careerPointRequirements: [0, 150, 350],
  },
  {
    id: "quartermaster",
    name: "Quartermaster",
    description: "Organized local procurement reduces prices paid to the guild Market NPC.",
    sigil: "QM",
    bonusLabel: "NPC prices",
    bonusPerLevel: 2,
    upgradeCosts: [150, 750, 3_500],
    careerPointRequirements: [0, 150, 350],
  },
  {
    id: "contract_archive",
    name: "Contract Archive",
    description: "Filed routes and mission notes improve experience earned from successful quests.",
    sigil: "CA",
    bonusLabel: "Quest XP",
    bonusPerLevel: 1,
    upgradeCosts: [200, 900, 4_500],
    careerPointRequirements: [0, 150, 350],
  },
];

export function getGuildFacility(facilityId: string) {
  return guildFacilities.find((facility) => facility.id === facilityId);
}
