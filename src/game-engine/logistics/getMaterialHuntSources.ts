import { hunts } from "../../data/hunts";
import type { Character, HuntArea } from "../../shared/types";

export interface MaterialHuntSource {
  hunt: HuntArea;
  monsterNames: string[];
  bestDropChance: number;
  quantityRange: string;
  readyCharacterNames: string[];
  status: "ready" | "busy" | "level" | "access";
  statusLabel: string;
}

export function getMaterialHuntSources(itemId: string, characters: Character[]): MaterialHuntSource[] {
  return hunts.flatMap((hunt) => {
    const drops = hunt.monsters.flatMap((monster) => monster.lootTable
      .filter((drop) => drop.itemId === itemId)
      .map((drop) => ({ monster, drop })));
    if (drops.length === 0) return [];

    const eligibleCharacters = characters.filter((character) => (
      character.level >= hunt.minLevel
      && (!hunt.requiredAccess || character.accessIds.includes(hunt.requiredAccess))
    ));
    const readyCharacters = eligibleCharacters.filter((character) => character.status === "idle" && !character.currentAction);
    const hasLevel = characters.some((character) => character.level >= hunt.minLevel);
    const status: MaterialHuntSource["status"] = readyCharacters.length > 0
      ? "ready"
      : eligibleCharacters.length > 0
        ? "busy"
        : hasLevel && hunt.requiredAccess ? "access" : "level";
    const minimum = Math.min(...drops.map(({ drop }) => drop.minQuantity));
    const maximum = Math.max(...drops.map(({ drop }) => drop.maxQuantity));

    return [{
      hunt,
      monsterNames: [...new Set(drops.map(({ monster }) => monster.name))],
      bestDropChance: Math.max(...drops.map(({ drop }) => normalizeChance(drop.chance))),
      quantityRange: minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`,
      readyCharacterNames: readyCharacters.map((character) => character.name),
      status,
      statusLabel: status === "ready"
        ? `Ready: ${readyCharacters.map((character) => character.name).join(", ")}`
        : status === "busy"
          ? "Eligible adventurers are busy"
          : status === "access"
            ? "Access required"
            : `Requires level ${hunt.minLevel}`,
    }];
  }).sort((left, right) => (
    Number(right.status === "ready") - Number(left.status === "ready")
    || right.bestDropChance - left.bestDropChance
    || left.hunt.minLevel - right.hunt.minLevel
  ));
}

function normalizeChance(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
}
