import { cosmeticExchanges } from "../../data/cosmeticExchanges";
import { craftingRecipes } from "../../data/craftingRecipes";
import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { guildFacilities } from "../../data/guildFacilities";
import { guildProjects } from "../../data/guildProjects";
import { getItemById } from "../../data/items";
import { regionalCampaignRewardTables } from "../../data/regionalCampaignOrders";
import type { GuildDepot, GuildRegionalOrderObjective, Item } from "../../shared/types";
import { getItemTierCost } from "../forge/getItemTierCost";
import { getItemUpgradeCost } from "../forge/getItemUpgradeCost";

export interface RegionalRewardCompendiumMaterial {
  item: Item;
  quantity: number;
  owned: number;
  useLabels: string[];
}

export interface RegionalRewardCompendiumRoute {
  objective: GuildRegionalOrderObjective;
  label: string;
  shortLabel: string;
  sigil: string;
  description: string;
  veteran: RegionalRewardCompendiumMaterial;
  elite: RegionalRewardCompendiumMaterial;
}

export interface RegionalRewardCompendiumRegion {
  regionId: string;
  regionName: string;
  regionSigil: string;
  tableLabel: string;
  tableShortLabel: string;
  description: string;
  stockedMaterials: number;
  routes: RegionalRewardCompendiumRoute[];
}

export interface RegionalRewardCompendium {
  regions: RegionalRewardCompendiumRegion[];
  routeCount: number;
  uniqueMaterialCount: number;
  stockedMaterials: number;
}

const routePresentation: Record<GuildRegionalOrderObjective, Pick<RegionalRewardCompendiumRoute, "label" | "shortLabel" | "sigil" | "description">> = {
  hunt_minutes: { label: "Hunt Route", shortLabel: "Hunts", sigil: "H", description: "Sustained field patrols and successful regional Hunt time." },
  boss_defeats: { label: "Boss Route", shortLabel: "Bosses", sigil: "B", description: "Priority threats defeated through the regional Boss roster." },
  contract_successes: { label: "Contract Route", shortLabel: "Contracts", sigil: "C", description: "Successful support contracts assigned to the region." },
};

export function buildRegionalRewardCompendium(depot: GuildDepot): RegionalRewardCompendium {
  const ownedByItem = buildOwnedItemMap(depot);
  const relevantItemIds = new Set<string>();
  const regions = regionalCampaignRewardTables.map((table) => {
    const region = guildCampaignRegions.find((entry) => entry.id === table.regionId);
    const routes = (Object.keys(table.routes) as GuildRegionalOrderObjective[]).map((objective) => {
      const route = table.routes[objective];
      relevantItemIds.add(route.veteran.itemId);
      relevantItemIds.add(route.elite.itemId);
      return {
        objective,
        ...routePresentation[objective],
        veteran: buildMaterial(route.veteran.itemId, route.veteran.quantity, ownedByItem),
        elite: buildMaterial(route.elite.itemId, route.elite.quantity, ownedByItem),
      };
    });
    const regionItemIds = new Set(routes.flatMap((route) => [route.veteran.item.id, route.elite.item.id]));
    return {
      regionId: table.regionId,
      regionName: region?.name ?? table.label,
      regionSigil: region?.sigil ?? "?",
      tableLabel: table.label,
      tableShortLabel: table.shortLabel,
      description: table.description,
      stockedMaterials: [...regionItemIds].reduce((total, itemId) => safeAdd(total, ownedByItem.get(itemId) ?? 0), 0),
      routes,
    };
  });
  return {
    regions,
    routeCount: regions.reduce((total, region) => total + region.routes.length, 0),
    uniqueMaterialCount: relevantItemIds.size,
    stockedMaterials: [...relevantItemIds].reduce((total, itemId) => safeAdd(total, ownedByItem.get(itemId) ?? 0), 0),
  };
}

function buildMaterial(itemId: string, quantity: number, ownedByItem: Map<string, number>): RegionalRewardCompendiumMaterial {
  return {
    item: getItemById(itemId),
    quantity,
    owned: ownedByItem.get(itemId) ?? 0,
    useLabels: getMaterialUseLabels(itemId),
  };
}

function buildOwnedItemMap(depot: GuildDepot) {
  const owned = new Map<string, number>();
  if (!depot || !Array.isArray(depot.items)) return owned;
  for (const entry of depot.items) {
    if (!entry || typeof entry.itemId !== "string" || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1) continue;
    owned.set(entry.itemId, safeAdd(owned.get(entry.itemId) ?? 0, entry.quantity));
  }
  return owned;
}

function getMaterialUseLabels(itemId: string) {
  const labels: string[] = [];
  const recipes = craftingRecipes.filter((recipe) => recipe.materials.some((material) => material.itemId === itemId)).length;
  const facilities = guildFacilities.filter((facility) => facility.materialRequirements.some((level) => level.some((material) => material.itemId === itemId))).length;
  const projects = guildProjects.filter((project) => project.phases.some((phase) => phase.materials.some((material) => material.itemId === itemId))).length;
  const forgeCosts = [0, 1, 2, 3, 4].flatMap((level) => getItemUpgradeCost(level)?.requiredMaterials ?? [])
    .concat([0, 1, 2].flatMap((tier) => getItemTierCost(tier)?.requiredMaterials ?? []));
  const exchanges = cosmeticExchanges.filter((exchange) => exchange.materials.some((material) => material.itemId === itemId)).length;
  if (recipes > 0) labels.push(`${recipes} crafting ${recipes === 1 ? "recipe" : "recipes"}`);
  if (forgeCosts.some((material) => material.itemId === itemId)) labels.push("Forge progression");
  if (facilities > 0) labels.push(`${facilities} guild ${facilities === 1 ? "facility" : "facilities"}`);
  if (projects > 0) labels.push(`${projects} guild ${projects === 1 ? "project" : "projects"}`);
  if (exchanges > 0) labels.push(`${exchanges} cosmetic exchange`);
  return labels.length > 0 ? labels : ["Trade material"];
}

function safeAdd(left: number, right: number) {
  return left > Number.MAX_SAFE_INTEGER - right ? Number.MAX_SAFE_INTEGER : left + right;
}
