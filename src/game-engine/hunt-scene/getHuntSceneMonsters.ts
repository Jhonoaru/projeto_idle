import type { HuntArea, Monster } from "../../shared/types";

const fallbackMonsters: Monster[] = [
  {
    id: "scene-unknown-creature",
    name: "Unknown Creature",
    level: 1,
    health: 50,
    experience: 0,
    minDamage: 0,
    maxDamage: 0,
    armor: 0,
    defense: 0,
    goldMin: 0,
    goldMax: 0,
    lootTable: [],
  },
];

export function getHuntSceneMonsters(hunt?: HuntArea) {
  const monsters = hunt?.monsters?.filter(Boolean);
  return monsters && monsters.length > 0 ? monsters : fallbackMonsters;
}
