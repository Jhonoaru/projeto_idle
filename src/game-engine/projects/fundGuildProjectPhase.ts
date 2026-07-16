import { getCollectionItemById } from "../../data/collections";
import { getGuildProject } from "../../data/guildProjects";
import { getGuildCareer } from "../achievements/getGuildCareer";
import { unlockCollectionItem } from "../collections/unlockCollectionItem";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import type { Character, Guild, GuildDepot, GuildProjectMaterialRequirement, InventoryItem } from "../../shared/types";
import { normalizeGuildProjectsState } from "./normalizeGuildProjectsState";

export function fundGuildProjectPhase(guild: Guild, depot: GuildDepot, characters: Character[], projectId: string, now = new Date()) {
  const project = getGuildProject(projectId);
  const projects = normalizeGuildProjectsState(guild.projects);
  if (!project) return blocked(guild, depot, "Guild project definition not found.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, depot, "Project timestamp is invalid.");
  const current = projects.progress.find((entry) => entry.projectId === project.id);
  const completedPhases = current?.completedPhases ?? 0;
  if (completedPhases >= project.phases.length) return blocked(guild, depot, `${project.name} is already complete.`);
  if (project.prerequisiteProjectId && !isProjectComplete(projects, project.prerequisiteProjectId)) {
    return blocked(guild, depot, `${getGuildProject(project.prerequisiteProjectId)?.name ?? "The prerequisite project"} must be completed first.`);
  }
  const careerPoints = getGuildCareer(guild, characters).points;
  if (careerPoints < project.minimumCareerPoints) return blocked(guild, depot, `${project.name} requires ${project.minimumCareerPoints} Career Points.`);

  const phase = project.phases[completedPhases];
  const currentGold = normalizeInteger(guild.gold);
  if (currentGold < phase.goldCost) return blocked(guild, depot, `${phase.name} requires ${phase.goldCost.toLocaleString("en-US")}g.`);
  const missing = getMissingMaterials(depot, phase.materials);
  if (missing.length > 0) return blocked(guild, depot, `Missing ${missing.map((entry) => `${entry.name} x${entry.quantity}`).join(", ")} in the Guild Depot.`);

  const nextCompletedPhases = completedPhases + 1;
  const completed = nextCompletedPhases === project.phases.length;
  const nextProgress = {
    projectId: project.id,
    completedPhases: nextCompletedPhases,
    completedAt: completed ? now.toISOString() : undefined,
  };
  const progress = [...projects.progress.filter((entry) => entry.projectId !== project.id), nextProgress];
  let nextGuild: Guild = {
    ...guild,
    gold: currentGold - phase.goldCost,
    projects: {
      progress,
      totalCompleted: progress.filter((entry) => entry.completedAt).length,
      totalInvestedGold: Math.min(Number.MAX_SAFE_INTEGER, projects.totalInvestedGold + phase.goldCost),
      totalDonatedMaterials: Math.min(Number.MAX_SAFE_INTEGER, projects.totalDonatedMaterials + phase.materials.reduce((sum, entry) => sum + entry.quantity, 0)),
    },
  };
  let collectionUnlockedName: string | undefined;
  let bonusRenown = 0;
  if (completed) {
    nextGuild = { ...nextGuild, renown: safeAdd(normalizeInteger(guild.renown), project.rewardRenown) };
    const unlocked = unlockCollectionItem(nextGuild, project.rewardCollectionItemId);
    nextGuild = unlocked.guild;
    if (unlocked.unlocked) collectionUnlockedName = getCollectionItemById(project.rewardCollectionItemId)?.name;
    else {
      bonusRenown = 2;
      nextGuild = { ...nextGuild, renown: safeAdd(normalizeInteger(nextGuild.renown), bonusRenown) };
    }
  }
  return {
    success: true,
    guild: nextGuild,
    depot: consumeDepotMaterials(depot, phase.materials),
    message: completed
      ? `${project.name} completed. +${project.rewardRenown + bonusRenown} renown${collectionUnlockedName ? ` and ${collectionUnlockedName} unlocked` : ""}.`
      : `${project.name}: ${phase.name} funded (${nextCompletedPhases}/${project.phases.length}).`,
    projectId: project.id,
    completed,
    collectionUnlockedName,
  };
}

export function getGuildProjectAvailability(guild: Guild, depot: GuildDepot, characters: Character[], projectId: string) {
  const project = getGuildProject(projectId);
  const projects = normalizeGuildProjectsState(guild.projects);
  if (!project) return { available: false, reasons: ["Project not found."], completedPhases: 0, missingMaterials: [] };
  const completedPhases = projects.progress.find((entry) => entry.projectId === project.id)?.completedPhases ?? 0;
  if (completedPhases >= project.phases.length) return { available: false, reasons: ["Project complete."], completedPhases, missingMaterials: [] };
  const phase = project.phases[completedPhases];
  const reasons: string[] = [];
  if (project.prerequisiteProjectId && !isProjectComplete(projects, project.prerequisiteProjectId)) reasons.push(`Complete ${getGuildProject(project.prerequisiteProjectId)?.name}.`);
  const careerPoints = getGuildCareer(guild, characters).points;
  if (careerPoints < project.minimumCareerPoints) reasons.push(`Requires ${project.minimumCareerPoints} Career Points.`);
  if (normalizeInteger(guild.gold) < phase.goldCost) reasons.push(`Requires ${phase.goldCost.toLocaleString("en-US")}g.`);
  const missingMaterials = getMissingMaterials(depot, phase.materials);
  if (missingMaterials.length > 0) reasons.push("Missing Guild Depot materials.");
  return { available: reasons.length === 0, reasons, completedPhases, missingMaterials };
}

function isProjectComplete(state: ReturnType<typeof normalizeGuildProjectsState>, projectId: string) {
  return Boolean(state.progress.find((entry) => entry.projectId === projectId)?.completedAt);
}

function getMissingMaterials(depot: GuildDepot, requirements: GuildProjectMaterialRequirement[]) {
  return requirements.flatMap((requirement) => {
    const available = depot.items.filter((item) => item.itemId === requirement.itemId && !item.locked && item.item.type !== "quest").reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
    const missing = Math.max(0, requirement.quantity - available);
    const name = depot.items.find((item) => item.itemId === requirement.itemId)?.item.name ?? requirement.itemId;
    return missing > 0 ? [{ itemId: requirement.itemId, name, quantity: missing, available }] : [];
  });
}

function consumeDepotMaterials(depot: GuildDepot, requirements: GuildProjectMaterialRequirement[]): GuildDepot {
  let items = depot.items;
  for (const requirement of requirements) items = consume(items, requirement.itemId, requirement.quantity);
  return { ...depot, items, capacityUsed: calculateCapacityUsed(items) };
}

function consume(items: InventoryItem[], itemId: string, quantity: number) {
  let remaining = quantity;
  return items.flatMap((item) => {
    if (remaining <= 0 || item.itemId !== itemId || item.locked || item.item.type === "quest") return [item];
    const used = Math.min(remaining, Math.max(0, item.quantity));
    remaining -= used;
    return item.quantity > used ? [{ ...item, quantity: item.quantity - used }] : [];
  });
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}

function blocked(guild: Guild, depot: GuildDepot, message: string) {
  return { success: false, guild, depot, message, projectId: undefined, completed: false, collectionUnlockedName: undefined };
}
