import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { getItemById } from "../../data/items";
import {
  getRegionalCampaignDifficultyBand,
  regionalCampaignRewardTables,
} from "../../data/regionalCampaignOrders";
import type {
  Character,
  Guild,
  GuildDepot,
  GuildRegionalOrderDifficulty,
  GuildRegionalOrderObjective,
  Item,
} from "../../shared/types";
import { getAvailableGuildDepotMaterialQuantity } from "../inventory/guildDepotMaterials";
import { buildGuildLogisticsPlan } from "../logistics/buildGuildLogisticsPlan";

export type RegionalMaterialPlanScope = "priorities" | "all";

export interface RegionalMaterialDemandSource {
  id: string;
  title: string;
  targetLabel: string;
}

export interface RegionalMaterialAcquisitionRoute {
  id: string;
  regionId: string;
  regionName: string;
  regionSigil: string;
  tableLabel: string;
  objective: GuildRegionalOrderObjective;
  objectiveLabel: string;
  difficulty: Exclude<GuildRegionalOrderDifficulty, "standard">;
  difficultyLabel: string;
  quantity: number;
  claimsNeeded: number;
  requiredGuildLevel: number;
  unlocked: boolean;
  recommended: boolean;
  nextUnlock: boolean;
}

export interface RegionalMaterialAcquisitionEntry {
  item: Item;
  required: number;
  available: number;
  missing: number;
  sources: RegionalMaterialDemandSource[];
  routes: RegionalMaterialAcquisitionRoute[];
}

export interface RegionalMaterialAcquisitionPlan {
  scope: RegionalMaterialPlanScope;
  scopeLabel: string;
  objectiveCount: number;
  materialCount: number;
  routedMaterialCount: number;
  missingMaterials: number;
  entries: RegionalMaterialAcquisitionEntry[];
}

const objectiveLabels: Record<GuildRegionalOrderObjective, string> = {
  hunt_minutes: "Hunt Route",
  boss_defeats: "Boss Route",
  contract_successes: "Contract Route",
};

export function buildRegionalMaterialAcquisitionPlan(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
): RegionalMaterialAcquisitionPlan {
  const logistics = buildGuildLogisticsPlan(guild, depot, characters);
  const scope: RegionalMaterialPlanScope = logistics.pinnedObjectives.length > 0 ? "priorities" : "all";
  const objectives = scope === "priorities" ? logistics.pinnedObjectives : logistics.objectives;
  const requirements = new Map<string, { required: number; sources: RegionalMaterialDemandSource[] }>();

  for (const objective of objectives) {
    for (const material of objective.materials) {
      const current = requirements.get(material.itemId) ?? { required: 0, sources: [] };
      current.required = safeAdd(current.required, material.required);
      if (!current.sources.some((source) => source.id === objective.id)) {
        current.sources.push({ id: objective.id, title: objective.title, targetLabel: objective.targetLabel });
      }
      requirements.set(material.itemId, current);
    }
  }

  const guildLevel = safeInteger(guild.level);
  const entries = [...requirements.entries()].flatMap(([itemId, demand]) => {
    const available = getAvailableGuildDepotMaterialQuantity(depot, itemId);
    const missing = Math.max(0, demand.required - available);
    if (missing === 0) return [];
    return [{
      item: getItemById(itemId),
      required: demand.required,
      available,
      missing,
      sources: demand.sources,
      routes: buildRoutes(itemId, missing, guildLevel),
    }];
  }).sort((left, right) =>
    Number(right.routes.length > 0) - Number(left.routes.length > 0)
      || right.missing - left.missing
      || left.item.name.localeCompare(right.item.name));

  return {
    scope,
    scopeLabel: scope === "priorities" ? "Pinned logistics priorities" : "All active logistics objectives",
    objectiveCount: objectives.length,
    materialCount: entries.length,
    routedMaterialCount: entries.filter((entry) => entry.routes.length > 0).length,
    missingMaterials: entries.reduce((total, entry) => safeAdd(total, entry.missing), 0),
    entries,
  };
}

function buildRoutes(itemId: string, missing: number, guildLevel: number) {
  const routes: RegionalMaterialAcquisitionRoute[] = [];
  for (const table of regionalCampaignRewardTables) {
    const region = guildCampaignRegions.find((entry) => entry.id === table.regionId);
    for (const objective of Object.keys(table.routes) as GuildRegionalOrderObjective[]) {
      for (const difficulty of ["veteran", "elite"] as const) {
        const reward = table.routes[objective][difficulty];
        if (reward.itemId !== itemId || !Number.isSafeInteger(reward.quantity) || reward.quantity < 1) continue;
        const band = getRegionalCampaignDifficultyBand(difficulty);
        routes.push({
          id: `${table.regionId}-${objective}-${difficulty}`,
          regionId: table.regionId,
          regionName: region?.name ?? table.label,
          regionSigil: region?.sigil ?? "?",
          tableLabel: table.shortLabel,
          objective,
          objectiveLabel: objectiveLabels[objective],
          difficulty,
          difficultyLabel: band.label,
          quantity: reward.quantity,
          claimsNeeded: Math.ceil(missing / reward.quantity),
          requiredGuildLevel: band.requiredGuildLevel,
          unlocked: guildLevel >= band.requiredGuildLevel,
          recommended: false,
          nextUnlock: false,
        });
      }
    }
  }
  routes.sort((left, right) =>
    Number(right.unlocked) - Number(left.unlocked)
      || (!left.unlocked && !right.unlocked ? left.requiredGuildLevel - right.requiredGuildLevel : 0)
      || left.claimsNeeded - right.claimsNeeded
      || right.quantity - left.quantity
      || left.requiredGuildLevel - right.requiredGuildLevel
      || left.regionName.localeCompare(right.regionName)
      || left.objectiveLabel.localeCompare(right.objectiveLabel));
  const recommendedIndex = routes.findIndex((route) => route.unlocked);
  const nextUnlockIndex = recommendedIndex < 0 && routes.length > 0 ? 0 : -1;
  return routes.map((route, index) => ({
    ...route,
    recommended: index === recommendedIndex,
    nextUnlock: index === nextUnlockIndex,
  }));
}

function safeAdd(left: number, right: number) {
  const safeRight = Number.isSafeInteger(right) ? Math.max(0, right) : 0;
  return left > Number.MAX_SAFE_INTEGER - safeRight ? Number.MAX_SAFE_INTEGER : left + safeRight;
}

function safeInteger(value: unknown) {
  return Number.isSafeInteger(value) ? Math.max(0, value as number) : 0;
}
