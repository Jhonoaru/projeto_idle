import { getCollectionItemById } from "../../data/collections";
import { cosmeticExchanges } from "../../data/cosmeticExchanges";
import { guildFacilities } from "../../data/guildFacilities";
import { guildProjects } from "../../data/guildProjects";
import { items } from "../../data/items";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { getCosmeticExchangeAvailability } from "../cosmetic-exchange/getCosmeticExchangeAvailability";
import { normalizeGuildHeadquarters } from "../headquarters/normalizeGuildHeadquarters";
import { getGuildFacilityUpgradeAvailability } from "../headquarters/upgradeGuildFacility";
import { getAvailableGuildDepotMaterialQuantity } from "../inventory/guildDepotMaterials";
import { getGuildProjectAvailability } from "../projects/fundGuildProjectPhase";
import { normalizeGuildProjectsState } from "../projects/normalizeGuildProjectsState";
import { getMaterialHuntSources, type MaterialHuntSource } from "./getMaterialHuntSources";

export type GuildLogisticsCategory = "headquarters" | "projects" | "wardrobe";
export type GuildLogisticsStatus = "ready" | "materials" | "gold" | "locked";
export type GuildLogisticsDestination = "headquarters" | "projects" | "store";

export interface GuildLogisticsMaterial {
  itemId: string;
  name: string;
  required: number;
  available: number;
  missing: number;
  sources: MaterialHuntSource[];
}

export interface GuildLogisticsObjective {
  id: string;
  category: GuildLogisticsCategory;
  destination: GuildLogisticsDestination;
  title: string;
  subtitle: string;
  description: string;
  targetLabel: string;
  goldRequired: number;
  materials: GuildLogisticsMaterial[];
  blockers: string[];
  status: GuildLogisticsStatus;
}

export interface GuildLogisticsPlan {
  objectives: GuildLogisticsObjective[];
  readyObjectives: number;
  listedGoldCosts: number;
  requiredMaterials: number;
  coveredMaterials: number;
  missingMaterials: number;
  materialTotals: GuildLogisticsMaterial[];
}

export function buildGuildLogisticsPlan(guild: Guild, depot: GuildDepot, characters: Character[]): GuildLogisticsPlan {
  const objectives = [
    ...buildHeadquartersObjectives(guild, depot, characters),
    ...buildProjectObjectives(guild, depot, characters),
    ...buildWardrobeObjectives(guild, depot, characters),
  ].sort((left, right) => statusOrder(left.status) - statusOrder(right.status) || left.title.localeCompare(right.title));
  const requirements = new Map<string, number>();
  for (const objective of objectives) {
    for (const material of objective.materials) {
      requirements.set(material.itemId, safeAdd(requirements.get(material.itemId) ?? 0, material.required));
    }
  }
  const materialTotals = [...requirements.entries()]
    .map(([itemId, required]) => createMaterial(itemId, required, depot, characters))
    .sort((left, right) => Number(right.missing > 0) - Number(left.missing > 0) || left.name.localeCompare(right.name));
  const requiredMaterials = sum(materialTotals.map((entry) => entry.required));
  const coveredMaterials = sum(materialTotals.map((entry) => Math.min(entry.required, entry.available)));

  return {
    objectives,
    readyObjectives: objectives.filter((objective) => objective.status === "ready").length,
    listedGoldCosts: sum(objectives.map((objective) => objective.goldRequired)),
    requiredMaterials,
    coveredMaterials,
    missingMaterials: Math.max(0, requiredMaterials - coveredMaterials),
    materialTotals,
  };
}

function buildHeadquartersObjectives(guild: Guild, depot: GuildDepot, characters: Character[]): GuildLogisticsObjective[] {
  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  return guildFacilities.flatMap((facility) => {
    const currentLevel = headquarters.facilityLevels[facility.id];
    if (currentLevel >= 3) return [];
    const availability = getGuildFacilityUpgradeAvailability(guild, depot, characters, facility.id);
    const materials = availability.materials.map((entry) => createMaterial(entry.itemId, entry.quantity, depot, characters));
    return [{
      id: `headquarters-${facility.id}-${currentLevel + 1}`,
      category: "headquarters" as const,
      destination: "headquarters" as const,
      title: facility.name,
      subtitle: "Headquarters facility",
      description: facility.description,
      targetLabel: `Level ${currentLevel + 1} of 3`,
      goldRequired: availability.cost,
      materials,
      blockers: availability.reasons,
      status: getStatus(availability.available, availability.reasons, materials),
    }];
  });
}

function buildProjectObjectives(guild: Guild, depot: GuildDepot, characters: Character[]): GuildLogisticsObjective[] {
  const state = normalizeGuildProjectsState(guild.projects);
  return guildProjects.flatMap((project) => {
    const completedPhases = state.progress.find((entry) => entry.projectId === project.id)?.completedPhases ?? 0;
    const phase = project.phases[completedPhases];
    if (!phase) return [];
    const availability = getGuildProjectAvailability(guild, depot, characters, project.id);
    const materials = phase.materials.map((entry) => createMaterial(entry.itemId, entry.quantity, depot, characters));
    return [{
      id: `project-${project.id}-${completedPhases + 1}`,
      category: "projects" as const,
      destination: "projects" as const,
      title: project.name,
      subtitle: phase.name,
      description: phase.description,
      targetLabel: `Phase ${completedPhases + 1} of ${project.phases.length}`,
      goldRequired: phase.goldCost,
      materials,
      blockers: availability.reasons,
      status: getStatus(availability.available, availability.reasons, materials),
    }];
  });
}

function buildWardrobeObjectives(guild: Guild, depot: GuildDepot, characters: Character[]): GuildLogisticsObjective[] {
  return cosmeticExchanges.flatMap((exchange) => {
    const availability = getCosmeticExchangeAvailability(exchange, guild, depot, characters);
    if (availability.alreadyUnlocked) return [];
    const collectionItem = getCollectionItemById(exchange.collectionItemId);
    const materials = exchange.materials.map((entry) => createMaterial(entry.itemId, entry.quantity, depot, characters));
    return [{
      id: `wardrobe-${exchange.collectionItemId}`,
      category: "wardrobe" as const,
      destination: "store" as const,
      title: collectionItem?.name ?? exchange.collectionItemId,
      subtitle: exchange.label,
      description: collectionItem?.description ?? "Permanent local cosmetic exchange.",
      targetLabel: "Collection unlock",
      goldRequired: exchange.goldCost,
      materials,
      blockers: availability.reasons,
      status: getStatus(availability.available, availability.reasons, materials),
    }];
  });
}

function createMaterial(itemId: string, required: number, depot: GuildDepot, characters: Character[]): GuildLogisticsMaterial {
  const available = getAvailableGuildDepotMaterialQuantity(depot, itemId);
  return {
    itemId,
    name: items[itemId]?.name ?? itemId,
    required,
    available,
    missing: Math.max(0, required - available),
    sources: getMaterialHuntSources(itemId, characters),
  };
}

function getStatus(available: boolean, reasons: string[], materials: GuildLogisticsMaterial[]): GuildLogisticsStatus {
  if (available) return "ready";
  if (reasons.some((reason) => /career|complete|required guild quest|already/i.test(reason))) return "locked";
  if (materials.some((material) => material.missing > 0)) return "materials";
  if (reasons.some((reason) => /requires .*g\./i.test(reason))) return "gold";
  return "locked";
}

function statusOrder(status: GuildLogisticsStatus) {
  return { ready: 0, materials: 1, gold: 2, locked: 3 }[status];
}

function sum(values: number[]) {
  return values.reduce((total, value) => safeAdd(total, value), 0);
}

function safeAdd(left: number, right: number) {
  const safeRight = Number.isSafeInteger(right) ? Math.max(0, right) : 0;
  return Math.min(Number.MAX_SAFE_INTEGER, left + safeRight);
}
