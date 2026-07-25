import { guildRecruitCandidates } from "../../data/guildRecruitCandidates";
import {
  guildRenownObjectives,
  type GuildRenownObjectiveDefinition,
  type GuildRenownObjectiveMetric,
} from "../../data/guildRenownObjectives";
import type { Character, Guild } from "../../shared/types";
import { normalizeBestiaryState } from "../bestiary/getBestiaryProgress";
import { normalizeGuildExpeditionState } from "../expeditions/normalizeGuildExpeditionState";
import { normalizeGuildHeadquarters } from "../headquarters/normalizeGuildHeadquarters";
import { normalizeGuildOperationOutcomes } from "../operations/normalizeGuildOperationOutcomes";
import { normalizeGuildProjectsState } from "../projects/normalizeGuildProjectsState";
import { normalizeGuildRenownObjectivesState } from "./normalizeGuildRenownObjectivesState";

export function getGuildRenownObjectiveStatus(guild: Guild, characters: Character[]) {
  const state = normalizeGuildRenownObjectivesState(guild.renownObjectives);
  const metrics = getMetrics(guild, characters);
  const objectives = guildRenownObjectives.map((definition) => {
    const current = metrics[definition.metric];
    const claimed = state.claimedObjectiveIds.includes(definition.id);
    return {
      definition,
      current,
      progressPercent: Math.min(100, Math.floor((current / definition.target) * 100)),
      completed: current >= definition.target,
      claimed,
      claimable: current >= definition.target && !claimed,
    };
  });
  const foundationObjectives = objectives.filter((objective) => objective.definition.group === "foundation");
  const campaignMilestones = objectives.filter((objective) => objective.definition.group === "campaign");

  return {
    state,
    metrics,
    objectives,
    completedCount: objectives.filter((objective) => objective.completed).length,
    claimedCount: objectives.filter((objective) => objective.claimed).length,
    claimableCount: objectives.filter((objective) => objective.claimable).length,
    totalRenownAvailable: objectives.reduce((total, objective) => total + objective.definition.rewardRenown, 0),
    unclaimedRenown: objectives.filter((objective) => objective.claimable).reduce((total, objective) => total + objective.definition.rewardRenown, 0),
    groups: {
      foundation: summarizeGroup(foundationObjectives),
      campaign: summarizeGroup(campaignMilestones),
    },
  };
}

function getMetrics(guild: Guild, characters: Character[]): Record<GuildRenownObjectiveMetric, number> {
  const safeCharacters = (Array.isArray(characters) ? characters : [])
    .filter((character): character is Character => Boolean(character && typeof character === "object"));
  const bestiary = normalizeBestiaryState(guild.bestiary);
  const expeditions = normalizeGuildExpeditionState(guild.expeditions);
  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  const operationOutcomes = normalizeGuildOperationOutcomes(guild.operationOutcomes);
  const projects = normalizeGuildProjectsState(guild.projects);
  const candidateCharacterIds = new Set(guildRecruitCandidates.map((candidate) => candidate.characterId));
  const completedQuestIds = safeCharacters.flatMap((character) =>
    Array.isArray(character.completedQuestIds)
      ? character.completedQuestIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0)
      : [],
  );
  const totalOperations = safeAdd(operationOutcomes.totalBossAttempts, expeditions.totalCompleted);
  const successfulOperations = safeAdd(operationOutcomes.totalBossDefeats, expeditions.totalSucceeded);

  return {
    completed_quests: new Set(completedQuestIds).size,
    monster_kills: bestiary.progress.reduce((total, entry) => total + normalizeInteger(entry.kills), 0),
    successful_expeditions: expeditions.totalSucceeded,
    facility_upgrades: Object.values(headquarters.facilityLevels).reduce((total, level) => total + normalizeInteger(level), 0),
    completed_projects: projects.totalCompleted,
    recruited_adventurers: new Set(safeCharacters.filter((character) => candidateCharacterIds.has(character.id)).map((character) => character.id)).size,
    total_operations: totalOperations,
    successful_operations: Math.min(totalOperations, successfulOperations),
    boss_defeats: operationOutcomes.totalBossDefeats,
  };
}

interface GuildRenownObjectiveStatusEntry {
  definition: GuildRenownObjectiveDefinition;
  current: number;
  progressPercent: number;
  completed: boolean;
  claimed: boolean;
  claimable: boolean;
}

function summarizeGroup(objectives: GuildRenownObjectiveStatusEntry[]) {
  return {
    objectives,
    completedCount: objectives.filter((objective) => objective.completed).length,
    claimedCount: objectives.filter((objective) => objective.claimed).length,
    claimableCount: objectives.filter((objective) => objective.claimable).length,
    totalRenownAvailable: objectives.reduce((total, objective) => total + objective.definition.rewardRenown, 0),
    unclaimedRenown: objectives.filter((objective) => objective.claimable)
      .reduce((total, objective) => total + objective.definition.rewardRenown, 0),
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function safeAdd(left: number, right: number) {
  return Math.min(Number.MAX_SAFE_INTEGER, left + right);
}
