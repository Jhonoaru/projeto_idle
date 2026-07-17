import { getGuildFacility } from "../../data/guildFacilities";
import { items as itemCatalog } from "../../data/items";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { getGuildCareer } from "../achievements/getGuildCareer";
import type { Character, Guild, GuildDepot, GuildFacilityId, GuildFacilityMaterialRequirement, InventoryItem } from "../../shared/types";
import { normalizeGuildHeadquarters } from "./normalizeGuildHeadquarters";

export function getGuildFacilityUpgradeAvailability(guild: Guild, depot: GuildDepot, characters: Character[], facilityId: GuildFacilityId) {
  const definition = getGuildFacility(facilityId);
  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  if (!definition) return unavailable("Facility definition not found.");

  const currentLevel = headquarters.facilityLevels[facilityId];
  if (currentLevel >= 3) return unavailable(`${definition.name} is already at maximum level.`, definition, currentLevel);

  const cost = definition.upgradeCosts[currentLevel];
  const requiredCareerPoints = definition.careerPointRequirements[currentLevel];
  const requirements = definition.materialRequirements[currentLevel] ?? [];
  if (!Number.isSafeInteger(cost) || cost < 0 || !Number.isSafeInteger(requiredCareerPoints) || requiredCareerPoints < 0 || requirements.length === 0) {
    return unavailable(`${definition.name} has invalid upgrade requirements.`, definition, currentLevel);
  }

  const careerPoints = getGuildCareer(guild, characters).points;
  const currentGold = normalizeInteger(guild.gold);
  const materials = requirements.map((requirement) => {
    const available = countAvailableMaterial(depot, requirement.itemId);
    return {
      ...requirement,
      name: itemCatalog[requirement.itemId]?.name ?? requirement.itemId,
      available,
      missing: Math.max(0, requirement.quantity - available),
    };
  });
  const reasons: string[] = [];
  if (careerPoints < requiredCareerPoints) reasons.push(`Requires ${requiredCareerPoints} Career Points.`);
  if (currentGold < cost) reasons.push(`Requires ${cost.toLocaleString("en-US")}g.`);
  if (materials.some((entry) => entry.missing > 0)) reasons.push("Missing Guild Depot materials.");

  return {
    available: reasons.length === 0,
    reason: reasons[0],
    reasons,
    definition,
    currentLevel,
    nextLevel: currentLevel + 1,
    cost,
    requiredCareerPoints,
    careerPoints,
    currentGold,
    materials,
  };
}

export function upgradeGuildFacility(guild: Guild, depot: GuildDepot, characters: Character[], facilityId: GuildFacilityId) {
  const availability = getGuildFacilityUpgradeAvailability(guild, depot, characters, facilityId);
  if (!availability.available || !availability.definition || availability.currentLevel === undefined || availability.nextLevel === undefined) {
    return blocked(guild, depot, availability.reason ?? "Headquarters upgrade requirements are not met.");
  }

  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  const materialCount = availability.materials.reduce((sum, entry) => sum + entry.quantity, 0);
  const nextGuild: Guild = {
    ...guild,
    gold: availability.currentGold - availability.cost,
    headquarters: {
      facilityLevels: { ...headquarters.facilityLevels, [facilityId]: availability.nextLevel },
      totalInvestedGold: safeAdd(headquarters.totalInvestedGold, availability.cost),
      totalInvestedMaterials: safeAdd(headquarters.totalInvestedMaterials, materialCount),
    },
  };
  const nextDepot = consumeMaterials(depot, availability.materials);
  const materialSummary = availability.materials.map((entry) => `${entry.name} x${entry.quantity}`).join(", ");

  return {
    success: true,
    guild: nextGuild,
    depot: nextDepot,
    message: `${availability.definition.name} upgraded to level ${availability.nextLevel} for ${availability.cost.toLocaleString("en-US")}g and ${materialSummary}.`,
    cost: availability.cost,
    materialsConsumed: materialCount,
    facilityId,
    level: availability.nextLevel,
  };
}

function countAvailableMaterial(depot: GuildDepot, itemId: string) {
  return depot.items
    .filter((entry) => isConsumableRootMaterial(entry, itemId))
    .reduce((sum, entry) => safeAdd(sum, normalizeInteger(entry.quantity)), 0);
}

function consumeMaterials(depot: GuildDepot, requirements: readonly GuildFacilityMaterialRequirement[]) {
  let items = depot.items;
  for (const requirement of requirements) items = consumeMaterial(items, requirement.itemId, requirement.quantity);
  return { ...depot, items, capacityUsed: calculateCapacityUsed(items) };
}

function consumeMaterial(items: InventoryItem[], itemId: string, quantity: number) {
  let remaining = quantity;
  return items.flatMap((entry) => {
    if (remaining <= 0 || !isConsumableRootMaterial(entry, itemId)) return [entry];
    const available = normalizeInteger(entry.quantity);
    const consumed = Math.min(remaining, available);
    remaining -= consumed;
    return available > consumed ? [{ ...entry, quantity: available - consumed }] : [];
  });
}

function isConsumableRootMaterial(entry: InventoryItem, itemId: string) {
  return entry.itemId === itemId
    && entry.location === "guildDepot"
    && !entry.ownerCharacterId
    && !entry.parentContainerId
    && !entry.locked
    && entry.item.type !== "quest";
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) ? Math.max(0, parsed) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}

function unavailable(reason: string, definition?: ReturnType<typeof getGuildFacility>, currentLevel?: number) {
  return { available: false, reason, reasons: [reason], definition, currentLevel, nextLevel: undefined, cost: 0, requiredCareerPoints: 0, careerPoints: 0, currentGold: 0, materials: [] };
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, guild, depot, message, cost: 0, materialsConsumed: 0, facilityId: undefined, level: undefined };
}
