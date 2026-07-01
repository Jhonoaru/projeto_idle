import type { CharmDefinition } from "../shared/types";

export const charms: CharmDefinition[] = [
  {
    id: "charm-scholar",
    name: "Scholar",
    description: "+5% XP contra a criatura marcada.",
    type: "xp",
    unlockCost: 20,
    effectPercent: 5,
  },
  {
    id: "charm-greed",
    name: "Greed",
    description: "+5% gold contra a criatura marcada.",
    type: "gold",
    unlockCost: 20,
    effectPercent: 5,
  },
  {
    id: "charm-scavenger",
    name: "Scavenger",
    description: "+5% valor de loot contra a criatura marcada.",
    type: "loot",
    unlockCost: 35,
    effectPercent: 5,
  },
  {
    id: "charm-fortify",
    name: "Fortify",
    description: "-5% risco de morte contra a criatura marcada.",
    type: "defense",
    unlockCost: 35,
    effectPercent: 5,
  },
  {
    id: "charm-conservation",
    name: "Conservation",
    description: "-5% supplies consumidos contra a criatura marcada.",
    type: "supply",
    unlockCost: 50,
    effectPercent: 5,
  },
];

export function getCharmById(charmId?: string) {
  return charms.find((charm) => charm.id === charmId);
}
