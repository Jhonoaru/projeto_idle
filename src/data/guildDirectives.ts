import type { GuildDirectiveId } from "../shared/types";

export interface GuildDirectiveBonuses {
  huntXpBonusPercent: number;
  trainingProgressBonusPercent: number;
  questXpBonusPercent: number;
  npcPriceDiscountPercent: number;
  expeditionSuccessChancePoints: number;
}

export interface GuildDirectiveDefinition {
  id: GuildDirectiveId;
  sigil: string;
  name: string;
  description: string;
  minimumGuildLevel: number;
  bonusLabel: string;
  bonuses: GuildDirectiveBonuses;
}

const noBonuses: GuildDirectiveBonuses = {
  huntXpBonusPercent: 0,
  trainingProgressBonusPercent: 0,
  questXpBonusPercent: 0,
  npcPriceDiscountPercent: 0,
  expeditionSuccessChancePoints: 0,
};

export const guildDirectives: readonly GuildDirectiveDefinition[] = [
  {
    id: "vanguard-orders",
    sigil: "VO",
    name: "Vanguard Orders",
    description: "Field reports prioritize disciplined hunting routes and practical combat experience.",
    minimumGuildLevel: 1,
    bonusLabel: "+2% Hunt XP",
    bonuses: { ...noBonuses, huntXpBonusPercent: 2 },
  },
  {
    id: "training-charter",
    sigil: "TC",
    name: "Training Charter",
    description: "The hall reserves instructors, practice space and a fixed schedule for every adventurer.",
    minimumGuildLevel: 2,
    bonusLabel: "+5% Training progress",
    bonuses: { ...noBonuses, trainingProgressBonusPercent: 5 },
  },
  {
    id: "contract-mandate",
    sigil: "CM",
    name: "Contract Mandate",
    description: "Quest records and debriefings are standardized to improve lessons learned in the field.",
    minimumGuildLevel: 3,
    bonusLabel: "+3% Quest XP",
    bonuses: { ...noBonuses, questXpBonusPercent: 3 },
  },
  {
    id: "merchant-compact",
    sigil: "MC",
    name: "Merchant Compact",
    description: "Local suppliers honor the guild charter with a modest discount at the fixed NPC shop.",
    minimumGuildLevel: 4,
    bonusLabel: "-4% NPC prices",
    bonuses: { ...noBonuses, npcPriceDiscountPercent: 4 },
  },
  {
    id: "expedition-standard",
    sigil: "ES",
    name: "Expedition Standard",
    description: "Support teams follow shared maps, signals and fallback plans before leaving the guild hall.",
    minimumGuildLevel: 5,
    bonusLabel: "+4 expedition success",
    bonuses: { ...noBonuses, expeditionSuccessChancePoints: 4 },
  },
  {
    id: "grand-strategy",
    sigil: "GS",
    name: "Grand Strategy",
    description: "A balanced command doctrine coordinates fieldwork, study, contracts, trade and support teams.",
    minimumGuildLevel: 6,
    bonusLabel: "+2 to all directives",
    bonuses: {
      huntXpBonusPercent: 2,
      trainingProgressBonusPercent: 2,
      questXpBonusPercent: 2,
      npcPriceDiscountPercent: 2,
      expeditionSuccessChancePoints: 2,
    },
  },
];

export function getGuildDirective(directiveId: string | null | undefined) {
  return guildDirectives.find((directive) => directive.id === directiveId);
}

export function createEmptyGuildDirectiveBonuses(): GuildDirectiveBonuses {
  return { ...noBonuses };
}
