import { guildFacilities } from "../../data/guildFacilities";
import { hunts } from "../../data/hunts";
import { items } from "../../data/items";
import type { Character, GuildDepot, HuntArea } from "../../shared/types";
import { normalizeGuildHeadquarters } from "./normalizeGuildHeadquarters";
import { getAvailableGuildDepotMaterialQuantity } from "./upgradeGuildFacility";

export type HeadquartersResourcePlanMode = "next" | "completion";

export interface HeadquartersResourceSource {
  hunt: HuntArea;
  monsterNames: string[];
  bestDropChance: number;
  quantityRange: string;
  readyCharacterNames: string[];
  status: "ready" | "busy" | "level" | "access";
  statusLabel: string;
}

export interface HeadquartersResourcePlanEntry {
  itemId: string;
  name: string;
  required: number;
  available: number;
  missing: number;
  sources: HeadquartersResourceSource[];
}

export interface HeadquartersResourcePlan {
  mode: HeadquartersResourcePlanMode;
  targetLevels: number;
  requiredMaterials: number;
  coveredMaterials: number;
  missingMaterials: number;
  entries: HeadquartersResourcePlanEntry[];
}

export function buildHeadquartersResourcePlan(
  headquartersValue: unknown,
  depot: GuildDepot,
  characters: Character[],
  mode: HeadquartersResourcePlanMode,
): HeadquartersResourcePlan {
  const headquarters = normalizeGuildHeadquarters(headquartersValue);
  const requirements = new Map<string, number>();
  let targetLevels = 0;

  for (const facility of guildFacilities) {
    const currentLevel = headquarters.facilityLevels[facility.id];
    const levels = mode === "next"
      ? currentLevel < 3 ? [currentLevel] : []
      : Array.from({ length: Math.max(0, 3 - currentLevel) }, (_, index) => currentLevel + index);

    targetLevels += levels.length;
    for (const levelIndex of levels) {
      for (const requirement of facility.materialRequirements[levelIndex] ?? []) {
        requirements.set(requirement.itemId, safeAdd(requirements.get(requirement.itemId) ?? 0, requirement.quantity));
      }
    }
  }

  const entries = [...requirements.entries()]
    .map(([itemId, required]) => {
      const available = getAvailableGuildDepotMaterialQuantity(depot, itemId);
      return {
        itemId,
        name: items[itemId]?.name ?? itemId,
        required,
        available,
        missing: Math.max(0, required - available),
        sources: getResourceSources(itemId, characters),
      };
    })
    .sort((left, right) => Number(right.missing > 0) - Number(left.missing > 0) || left.name.localeCompare(right.name));

  const requiredMaterials = entries.reduce((sum, entry) => safeAdd(sum, entry.required), 0);
  const coveredMaterials = entries.reduce((sum, entry) => safeAdd(sum, Math.min(entry.available, entry.required)), 0);

  return {
    mode,
    targetLevels,
    requiredMaterials,
    coveredMaterials,
    missingMaterials: Math.max(0, requiredMaterials - coveredMaterials),
    entries,
  };
}

function getResourceSources(itemId: string, characters: Character[]): HeadquartersResourceSource[] {
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
    const status: HeadquartersResourceSource["status"] = readyCharacters.length > 0
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

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
