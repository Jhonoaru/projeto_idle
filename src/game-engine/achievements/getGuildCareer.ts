import { guildAchievements } from "../../data/guildAchievements";
import { normalizeBestiaryState } from "../bestiary/getBestiaryProgress";
import { normalizeCollectionsState } from "../collections/normalizeCollectionsState";
import { normalizeDailyRewardState } from "../daily-reward/normalizeDailyRewardState";
import type {
  Character,
  Guild,
  GuildAchievementCategory,
  GuildAchievementMetric,
  GuildAchievementProgress,
  Skill,
} from "../../shared/types";

export const guildCareerRanks = [
  { title: "Apprentice Company", minimumPoints: 0 },
  { title: "Chartered Guild", minimumPoints: 150 },
  { title: "Proven Vanguard", minimumPoints: 350 },
  { title: "Renowned Banner", minimumPoints: 600 },
  { title: "Legendary Company", minimumPoints: 850 },
] as const;

export function getGuildCareer(guild: Guild, characters: Character[]) {
  const metrics = getGuildCareerMetrics(guild, characters);
  const achievements: GuildAchievementProgress[] = guildAchievements.map((definition) => {
    const current = metrics[definition.metric];
    return {
      definition,
      current,
      progressPercent: Math.min(100, Math.round((current / Math.max(1, definition.target)) * 100)),
      unlocked: current >= definition.target,
    };
  });
  const unlocked = achievements.filter((entry) => entry.unlocked);
  const points = unlocked.reduce((total, entry) => total + entry.definition.points, 0);
  const maxPoints = achievements.reduce((total, entry) => total + entry.definition.points, 0);
  const rankIndex = findRankIndex(points);
  const rank = guildCareerRanks[rankIndex];
  const nextRank = guildCareerRanks[rankIndex + 1];
  const rankProgressPercent = nextRank
    ? Math.round(((points - rank.minimumPoints) / (nextRank.minimumPoints - rank.minimumPoints)) * 100)
    : 100;

  return {
    achievements,
    metrics,
    unlockedCount: unlocked.length,
    totalCount: achievements.length,
    points,
    maxPoints,
    rank,
    nextRank,
    rankProgressPercent: Math.min(100, Math.max(0, rankProgressPercent)),
    categorySummaries: getCategorySummaries(achievements),
  };
}

export function formatAchievementMetric(metric: GuildAchievementMetric, value: number) {
  const safeValue = normalizeMetric(value);
  if (metric === "combined_experience") return `${safeValue.toLocaleString("en-US")} XP`;
  if (metric === "guild_gold") return `${safeValue.toLocaleString("en-US")}g`;
  return safeValue.toLocaleString("en-US");
}

export function formatAchievementCategory(category: GuildAchievementCategory) {
  const labels: Record<GuildAchievementCategory, string> = {
    growth: "Guild Growth",
    contracts: "Contracts",
    hunting: "Hunting",
    mastery: "Mastery",
    collections: "Collections",
    legacy: "Legacy",
  };
  return labels[category];
}

function getGuildCareerMetrics(guild: Guild, characters: Character[]): Record<GuildAchievementMetric, number> {
  const bestiary = normalizeBestiaryState(guild.bestiary);
  const collections = normalizeCollectionsState(guild.collections);
  const dailyReward = normalizeDailyRewardState(guild.dailyReward);
  const completedContracts = new Set(characters.flatMap((character) => character.completedQuestIds));
  const unlockedAccesses = new Set(characters.flatMap((character) => character.accessIds));
  const skills = characters.flatMap((character) => Object.values(character.skills) as Skill[]);

  return {
    roster_size: characters.length,
    combined_level: sum(characters.map((character) => character.level)),
    combined_experience: sum(characters.map((character) => character.experience)),
    completed_contracts: completedContracts.size,
    unlocked_accesses: unlockedAccesses.size,
    monster_kills: sum(bestiary.progress.map((entry) => entry.kills)),
    completed_bestiary_entries: bestiary.progress.filter((entry) => entry.stage === "completed").length,
    highest_skill: skills.reduce((highest, skill) => Math.max(highest, normalizeMetric(skill.level)), 0),
    collection_unlocks: collections.unlockedCollectionItemIds.length,
    daily_claims: dailyReward.totalClaims,
    guild_renown: normalizeMetric(guild.renown),
    guild_gold: normalizeMetric(guild.gold),
  };
}

function getCategorySummaries(achievements: GuildAchievementProgress[]) {
  const categories: GuildAchievementCategory[] = [
    "growth",
    "contracts",
    "hunting",
    "mastery",
    "collections",
    "legacy",
  ];

  return categories.map((category) => {
    const entries = achievements.filter((entry) => entry.definition.category === category);
    return {
      category,
      unlockedCount: entries.filter((entry) => entry.unlocked).length,
      totalCount: entries.length,
    };
  });
}

function findRankIndex(points: number) {
  for (let index = guildCareerRanks.length - 1; index >= 0; index -= 1) {
    if (points >= guildCareerRanks[index].minimumPoints) return index;
  }
  return 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + normalizeMetric(value), 0);
}

function normalizeMetric(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
