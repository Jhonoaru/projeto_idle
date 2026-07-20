import { guildRecruitCandidates } from "../../data/guildRecruitCandidates";
import { guildRenownObjectives, type GuildRenownObjectiveMetric } from "../../data/guildRenownObjectives";
import type { Character, Guild } from "../../shared/types";
import { normalizeBestiaryState } from "../bestiary/getBestiaryProgress";
import { normalizeGuildExpeditionState } from "../expeditions/normalizeGuildExpeditionState";
import { normalizeGuildHeadquarters } from "../headquarters/normalizeGuildHeadquarters";
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

  return {
    state,
    metrics,
    objectives,
    completedCount: objectives.filter((objective) => objective.completed).length,
    claimedCount: objectives.filter((objective) => objective.claimed).length,
    claimableCount: objectives.filter((objective) => objective.claimable).length,
    totalRenownAvailable: objectives.reduce((total, objective) => total + objective.definition.rewardRenown, 0),
    unclaimedRenown: objectives.filter((objective) => objective.claimable).reduce((total, objective) => total + objective.definition.rewardRenown, 0),
  };
}

function getMetrics(guild: Guild, characters: Character[]): Record<GuildRenownObjectiveMetric, number> {
  const bestiary = normalizeBestiaryState(guild.bestiary);
  const expeditions = normalizeGuildExpeditionState(guild.expeditions);
  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  const projects = normalizeGuildProjectsState(guild.projects);
  const candidateCharacterIds = new Set(guildRecruitCandidates.map((candidate) => candidate.characterId));
  const completedQuestIds = characters.flatMap((character) =>
    Array.isArray(character.completedQuestIds)
      ? character.completedQuestIds.filter((questId): questId is string => typeof questId === "string" && questId.length > 0)
      : [],
  );

  return {
    completed_quests: new Set(completedQuestIds).size,
    monster_kills: bestiary.progress.reduce((total, entry) => total + normalizeInteger(entry.kills), 0),
    successful_expeditions: expeditions.totalSucceeded,
    facility_upgrades: Object.values(headquarters.facilityLevels).reduce((total, level) => total + normalizeInteger(level), 0),
    completed_projects: projects.totalCompleted,
    recruited_adventurers: new Set(characters.filter((character) => candidateCharacterIds.has(character.id)).map((character) => character.id)).size,
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
