import { guildFacilities } from "../../data/guildFacilities";
import { items } from "../../data/items";
import type { Character, GuildDepot } from "../../shared/types";
import { getAvailableGuildDepotMaterialQuantity } from "../inventory/guildDepotMaterials";
import { getMaterialHuntSources, type MaterialHuntSource } from "../logistics/getMaterialHuntSources";
import { normalizeGuildHeadquarters } from "./normalizeGuildHeadquarters";

export type HeadquartersResourcePlanMode = "next" | "completion";

export type HeadquartersResourceSource = MaterialHuntSource;

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
        sources: getMaterialHuntSources(itemId, characters),
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

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
