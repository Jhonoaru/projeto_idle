import type { Blessing } from "../shared/types";

export const blessings: Blessing[] = [
  {
    id: "adventurers-blessing",
    name: "Adventurer's Blessing",
    description: "Reduz penalidades de morte em 30%.",
    price: 2_000,
    protectionPercent: 30,
    consumedOnDeath: true,
  },
  {
    id: "guardian-spirit",
    name: "Guardian Spirit",
    description: "Reduz penalidades de morte em 50%.",
    price: 7_500,
    protectionPercent: 50,
    consumedOnDeath: true,
  },
  {
    id: "temple-pact",
    name: "Temple Pact",
    description: "Reduz penalidades de morte em 70%.",
    price: 20_000,
    protectionPercent: 70,
    consumedOnDeath: true,
  },
];

export function getBlessingById(blessingId?: string) {
  return blessings.find((blessing) => blessing.id === blessingId);
}
