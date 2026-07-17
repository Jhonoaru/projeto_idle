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
    materialRequirements: [
      [{ itemId: "rat-tail", quantity: 6 }, { itemId: "spider-silk", quantity: 2 }],
      [{ itemId: "broken-fang", quantity: 8 }, { itemId: "iron-ore", quantity: 6 }],
      [{ itemId: "ancient-bone", quantity: 10 }, { itemId: "enchanted-dust", quantity: 3 }],
    ],
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
    materialRequirements: [
      [{ itemId: "old-cloth", quantity: 8 }, { itemId: "rat-tail", quantity: 4 }],
      [{ itemId: "spider-silk", quantity: 8 }, { itemId: "iron-ore", quantity: 5 }],
      [{ itemId: "wyvern-scale", quantity: 8 }, { itemId: "enchanted-dust", quantity: 4 }],
    ],
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
    materialRequirements: [
      [{ itemId: "rat-tail", quantity: 5 }, { itemId: "old-cloth", quantity: 6 }],
      [{ itemId: "broken-fang", quantity: 6 }, { itemId: "iron-ore", quantity: 4 }],
      [{ itemId: "cultist-charm", quantity: 6 }, { itemId: "enchanted-dust", quantity: 3 }],
    ],
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
    materialRequirements: [
      [{ itemId: "old-cloth", quantity: 8 }, { itemId: "spider-silk", quantity: 3 }],
      [{ itemId: "ancient-bone", quantity: 6 }, { itemId: "broken-fang", quantity: 6 }],
      [{ itemId: "cultist-charm", quantity: 8 }, { itemId: "enchanted-dust", quantity: 5 }],
    ],
  },
];

export function getGuildFacility(facilityId: string) {
  return guildFacilities.find((facility) => facility.id === facilityId);
}
