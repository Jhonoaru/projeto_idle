import type { Blessing } from "../shared/types";

export const blessings: Blessing[] = [
  {
    id: "dawns-insight",
    name: "Dawn's Insight",
    sigil: "DI",
    domain: "Wisdom",
    description: "The first light guards hard-earned experience.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "phoenix-ember",
    name: "Phoenix Ember",
    sigil: "PE",
    domain: "Renewal",
    description: "A living ember softens the price of defeat.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "solar-covenant",
    name: "Solar Covenant",
    sigil: "SC",
    domain: "Valor",
    description: "The sun's oath shelters those who face danger.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "spirit-ward",
    name: "Spirit Ward",
    sigil: "SW",
    domain: "Spirit",
    description: "An ancestral ward protects the fallen soul.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "aether-embrace",
    name: "Aether Embrace",
    sigil: "AE",
    domain: "Aether",
    description: "Arcane currents carry loss away from the fallen.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "mountain-heart",
    name: "Mountain Heart",
    sigil: "MH",
    domain: "Endurance",
    description: "Stonebound resolve preserves the adventurer's gains.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
  {
    id: "vanguard-blood",
    name: "Vanguard Blood",
    sigil: "VB",
    domain: "Sacrifice",
    description: "The old guard pays part of the final toll.",
    price: 2_000,
    protectionPercent: 10,
    consumedOnDeath: true,
  },
];

const legacyBlessings: Blessing[] = [
  {
    id: "adventurers-blessing",
    name: "Adventurer's Blessing",
    sigil: "AB",
    domain: "Legacy",
    description: "A legacy temple blessing preserved from an older save.",
    price: 2_000,
    protectionPercent: 30,
    consumedOnDeath: true,
  },
  {
    id: "guardian-spirit",
    name: "Guardian Spirit",
    sigil: "GS",
    domain: "Legacy",
    description: "A legacy temple blessing preserved from an older save.",
    price: 7_500,
    protectionPercent: 50,
    consumedOnDeath: true,
  },
  {
    id: "temple-pact",
    name: "Temple Pact",
    sigil: "TP",
    domain: "Legacy",
    description: "A legacy temple blessing preserved from an older save.",
    price: 20_000,
    protectionPercent: 70,
    consumedOnDeath: true,
  },
];

export function getBlessingById(blessingId?: string) {
  return [...blessings, ...legacyBlessings].find((blessing) => blessing.id === blessingId);
}

export function getActiveBlessings(blessingIds: string[] = []) {
  const seenIds = new Set<string>();

  return blessingIds.flatMap((blessingId) => {
    if (seenIds.has(blessingId)) return [];
    seenIds.add(blessingId);
    const blessing = getBlessingById(blessingId);
    return blessing ? [blessing] : [];
  });
}
