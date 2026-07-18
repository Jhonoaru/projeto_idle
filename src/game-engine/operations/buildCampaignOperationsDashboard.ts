import { getGuildContract, guildContracts } from "../../data/guildContracts";
import { guildRecruitCandidates } from "../../data/guildRecruitCandidates";
import type { Character, CharacterStatus, Guild, GuildDepot } from "../../shared/types";
import { getGuildContractAvailability } from "../expeditions/getGuildContractAvailability";
import { normalizeGuildExpeditionState } from "../expeditions/normalizeGuildExpeditionState";
import { getHeadquartersRank } from "../headquarters/getHeadquartersBonuses";
import { buildGuildLogisticsPlan, type GuildLogisticsStatus } from "../logistics/buildGuildLogisticsPlan";
import { getGuildLogisticsUnreadCount } from "../logistics/syncGuildLogisticsAlerts";
import { normalizeGuildProjectsState } from "../projects/normalizeGuildProjectsState";
import { getGuildRecruitmentAvailability } from "../recruitment/recruitGuildCandidate";

export type CampaignOperationsDestination =
  | "action"
  | "contracts"
  | "headquarters"
  | "hunts"
  | "logistics"
  | "projects"
  | "recruitment"
  | "store";

export type CampaignOperationTone = "ready" | "active" | "idle" | "blocked";

export interface CampaignRosterOperation {
  characterId: string;
  name: string;
  vocation: string;
  level: number;
  city: string;
  status: CharacterStatus | "ready";
  tone: CampaignOperationTone;
  label: string;
  target?: string;
  remainingMs: number;
  progressPercent: number;
  isReady: boolean;
  destination: "action" | "hunts";
}

export interface CampaignExpeditionOperation {
  status: "idle" | "active" | "ready";
  tone: CampaignOperationTone;
  contractName: string;
  region?: string;
  teamNames: string[];
  remainingMs: number;
  progressPercent: number;
  successChance?: number;
}

export interface CampaignPriorityOperation {
  id: string;
  title: string;
  category: string;
  targetLabel: string;
  status: GuildLogisticsStatus;
  requiredMaterials: number;
  coveredMaterials: number;
  missingMaterials: number;
  destination: CampaignOperationsDestination;
}

export interface CampaignOperationsRecommendation {
  id: string;
  title: string;
  description: string;
  destination: CampaignOperationsDestination;
  tone: CampaignOperationTone;
}

export interface CampaignOperationsDashboard {
  roster: CampaignRosterOperation[];
  expedition: CampaignExpeditionOperation;
  priorities: CampaignPriorityOperation[];
  recommendations: CampaignOperationsRecommendation[];
  summary: {
    idleAdventurers: number;
    activeAdventurers: number;
    deadAdventurers: number;
    readyReports: number;
    pinnedPriorities: number;
    unreadLogisticsAlerts: number;
    missingPriorityMaterials: number;
    availableContracts: number;
    availableRecruits: number;
    completedProjects: number;
    headquartersLevels: number;
  };
}

export function buildCampaignOperationsDashboard(
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
  now = new Date(),
): CampaignOperationsDashboard {
  const nowMs = Number.isFinite(now.getTime()) ? now.getTime() : 0;
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const roster = safeCharacters.map((character) => buildRosterOperation(character, nowMs));
  const expedition = buildExpeditionOperation(guild, safeCharacters, nowMs);
  const logistics = buildGuildLogisticsPlan(guild, depot, safeCharacters);
  const priorities = logistics.pinnedObjectives.map((objective) => {
    const requiredMaterials = sum(objective.materials.map((material) => material.required));
    const coveredMaterials = sum(objective.materials.map((material) => Math.min(material.required, material.available)));
    return {
      id: objective.id,
      title: objective.title,
      category: objective.category,
      targetLabel: objective.targetLabel,
      status: objective.status,
      requiredMaterials,
      coveredMaterials,
      missingMaterials: Math.max(0, requiredMaterials - coveredMaterials),
      destination: objective.destination,
    };
  });
  const unreadLogisticsAlerts = getGuildLogisticsUnreadCount(guild);
  const readyCharacterReports = roster.filter((entry) => entry.isReady).length;
  const availableContracts = guildContracts.filter((contract) => {
    const availability = getGuildContractAvailability(contract, guild, safeCharacters);
    const livingCharacters = safeCharacters.filter((character) => character.status !== "dead").length;
    return availability.available && livingCharacters >= contract.minimumTeamSize && safeGold(guild.gold) >= contract.dispatchCost;
  }).length;
  const availableRecruits = guildRecruitCandidates.filter(
    (candidate) => getGuildRecruitmentAvailability(guild, safeCharacters, candidate.id).available,
  ).length;
  const projects = normalizeGuildProjectsState(guild.projects);
  const headquarters = getHeadquartersRank(guild.headquarters);
  const summary = {
    idleAdventurers: roster.filter((entry) => entry.status === "idle").length,
    activeAdventurers: roster.filter((entry) => entry.tone === "active").length,
    deadAdventurers: roster.filter((entry) => entry.status === "dead").length,
    readyReports: readyCharacterReports + Number(expedition.status === "ready"),
    pinnedPriorities: priorities.length,
    unreadLogisticsAlerts,
    missingPriorityMaterials: sum(priorities.map((entry) => entry.missingMaterials)),
    availableContracts,
    availableRecruits,
    completedProjects: projects.totalCompleted,
    headquartersLevels: headquarters.totalLevels,
  };

  return {
    roster,
    expedition,
    priorities,
    recommendations: buildRecommendations(summary, expedition, priorities),
    summary,
  };
}

function buildRosterOperation(character: Character, nowMs: number): CampaignRosterOperation {
  const action = character.currentAction;
  const startedAt = parseTime(action?.startedAt);
  const endsAt = parseTime(action?.endsAt);
  const hasTimer = startedAt !== undefined && endsAt !== undefined && endsAt > startedAt;
  const remainingMs = hasTimer ? Math.max(0, endsAt - nowMs) : 0;
  const isReady = Boolean(action && (action.readyToResolve || (hasTimer && endsAt <= nowMs)));
  const progressPercent = hasTimer
    ? clampPercent(((Math.min(Math.max(nowMs, startedAt), endsAt) - startedAt) / (endsAt - startedAt)) * 100)
    : isReady ? 100 : 0;

  if (character.status === "dead") {
    return rosterEntry(character, "dead", "blocked", "Temple recovery required", undefined, remainingMs, progressPercent, false, "action");
  }
  if (isReady) {
    return rosterEntry(character, "ready", "ready", action?.label || "Action report ready", action?.targetName, 0, 100, true, "action");
  }
  if (action || character.status !== "idle") {
    return rosterEntry(
      character,
      character.status,
      "active",
      action?.label || formatStatus(character.status),
      action?.targetName,
      remainingMs,
      progressPercent,
      false,
      "action",
    );
  }
  return rosterEntry(character, "idle", "idle", "Available for assignment", undefined, 0, 0, false, "hunts");
}

function rosterEntry(
  character: Character,
  status: CampaignRosterOperation["status"],
  tone: CampaignOperationTone,
  label: string,
  target: string | undefined,
  remainingMs: number,
  progressPercent: number,
  isReady: boolean,
  destination: CampaignRosterOperation["destination"],
): CampaignRosterOperation {
  return {
    characterId: character.id,
    name: character.name,
    vocation: character.vocation,
    level: safeInteger(character.level),
    city: character.city,
    status,
    tone,
    label,
    target,
    remainingMs,
    progressPercent,
    isReady,
    destination,
  };
}

function buildExpeditionOperation(guild: Guild, characters: Character[], nowMs: number): CampaignExpeditionOperation {
  const active = normalizeGuildExpeditionState(guild.expeditions).activeExpedition;
  if (!active) {
    return {
      status: "idle",
      tone: "idle",
      contractName: "No support expedition active",
      teamNames: [],
      remainingMs: 0,
      progressPercent: 0,
    };
  }
  const contract = getGuildContract(active.contractId);
  const startedAt = Date.parse(active.startedAt);
  const endsAt = Date.parse(active.endsAt);
  const remainingMs = Math.max(0, endsAt - nowMs);
  const ready = remainingMs === 0;
  return {
    status: ready ? "ready" : "active",
    tone: ready ? "ready" : "active",
    contractName: contract?.name ?? "Unknown expedition",
    region: contract?.region,
    teamNames: active.assignedCharacterIds.map(
      (characterId) => characters.find((character) => character.id === characterId)?.name ?? "Unknown",
    ),
    remainingMs,
    progressPercent: clampPercent(((Math.min(Math.max(nowMs, startedAt), endsAt) - startedAt) / Math.max(1, endsAt - startedAt)) * 100),
    successChance: active.successChance,
  };
}

function buildRecommendations(
  summary: CampaignOperationsDashboard["summary"],
  expedition: CampaignExpeditionOperation,
  priorities: CampaignPriorityOperation[],
) {
  const entries: CampaignOperationsRecommendation[] = [];
  if (summary.readyReports > Number(expedition.status === "ready")) {
    entries.push(recommendation("character-reports", "Collect adventurer reports", `${summary.readyReports - Number(expedition.status === "ready")} personal action report(s) are ready.`, "action", "ready"));
  }
  if (expedition.status === "ready") {
    entries.push(recommendation("expedition-report", "Collect expedition report", `${expedition.contractName} has returned to the guild.`, "contracts", "ready"));
  }
  if (summary.unreadLogisticsAlerts > 0) {
    entries.push(recommendation("logistics-alerts", "Review logistics alerts", `${summary.unreadLogisticsAlerts} pinned campaign priority update(s) need review.`, "logistics", "ready"));
  } else {
    const readyPriorities = priorities.filter((entry) => entry.status === "ready");
    if (readyPriorities.length > 0) entries.push(recommendation("ready-priorities", "Advance a campaign priority", `${readyPriorities.map((entry) => entry.title).join(" / ")} can be funded now.`, "logistics", "ready"));
  }
  if (expedition.status === "active") {
    entries.push(recommendation("active-expedition", "Monitor support expedition", `${expedition.contractName} is still underway.`, "contracts", "active"));
  } else if (expedition.status === "idle" && summary.availableContracts > 0) {
    entries.push(recommendation("dispatch-expedition", "Dispatch a support expedition", `${summary.availableContracts} contract(s) can be funded with the current roster.`, "contracts", "idle"));
  }
  if (summary.missingPriorityMaterials > 0) {
    entries.push(recommendation("priority-materials", "Recover priority materials", `${summary.missingPriorityMaterials} material unit(s) are still missing from pinned orders.`, "logistics", "blocked"));
  }
  if (summary.availableRecruits > 0) {
    entries.push(recommendation("available-recruits", "Review recruitment contracts", `${summary.availableRecruits} candidate(s) can join the current roster.`, "recruitment", "idle"));
  }
  if (summary.idleAdventurers > 0) {
    entries.push(recommendation("idle-adventurers", "Assign idle adventurers", `${summary.idleAdventurers} adventurer(s) are available for hunts, quests or training.`, "hunts", "idle"));
  }
  return entries.slice(0, 5);
}

function recommendation(
  id: string,
  title: string,
  description: string,
  destination: CampaignOperationsDestination,
  tone: CampaignOperationTone,
): CampaignOperationsRecommendation {
  return { id, title, description, destination, tone };
}

function parseTime(value: unknown) {
  if (typeof value !== "string") return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatStatus(status: CharacterStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function clampPercent(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;
}

function safeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function safeGold(value: unknown) {
  return safeInteger(value);
}

function sum(values: number[]) {
  return values.reduce((total, value) => Math.min(Number.MAX_SAFE_INTEGER, total + safeInteger(value)), 0);
}
