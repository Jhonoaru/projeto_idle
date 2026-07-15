import { guildTitles } from "../../data/guildTitles";
import type { Character, Guild, GuildCareerIdentity, GuildTitleProgress } from "../../shared/types";
import { getGuildCareer } from "./getGuildCareer";

export function createDefaultGuildCareerIdentity(): GuildCareerIdentity {
  return { activeTitleId: null };
}

export function normalizeGuildCareerIdentity(value: unknown): GuildCareerIdentity {
  if (!value || typeof value !== "object") return createDefaultGuildCareerIdentity();
  const activeTitleId = (value as Partial<GuildCareerIdentity>).activeTitleId;
  return {
    activeTitleId: typeof activeTitleId === "string"
      && guildTitles.some((title) => title.id === activeTitleId)
      ? activeTitleId
      : null,
  };
}

export function getGuildIdentity(guild: Guild, characters: Character[]) {
  const career = getGuildCareer(guild, characters);
  const unlockedAchievementIds = new Set(
    career.achievements
      .filter((entry) => entry.unlocked)
      .map((entry) => entry.definition.id),
  );
  const titles: GuildTitleProgress[] = guildTitles.map((definition) => {
    const unlocked = definition.requiredAchievementId
      ? unlockedAchievementIds.has(definition.requiredAchievementId)
      : career.points >= (definition.minimumCareerPoints ?? Number.POSITIVE_INFINITY);
    const achievement = definition.requiredAchievementId
      ? career.achievements.find((entry) => entry.definition.id === definition.requiredAchievementId)
      : undefined;

    return {
      definition,
      unlocked,
      requirementLabel: achievement
        ? `Record: ${achievement.definition.title}`
        : `${definition.minimumCareerPoints ?? 0} career points`,
    };
  });
  const normalized = normalizeGuildCareerIdentity(guild.careerIdentity);
  const activeTitle = titles.find(
    (entry) => entry.unlocked && entry.definition.id === normalized.activeTitleId,
  );

  return {
    career,
    titles,
    activeTitle,
    unlockedCount: titles.filter((entry) => entry.unlocked).length,
    totalCount: titles.length,
  };
}

export function equipGuildTitle(guild: Guild, characters: Character[], titleId: string | null) {
  if (titleId === null) {
    return { ...guild, careerIdentity: createDefaultGuildCareerIdentity() };
  }

  const identity = getGuildIdentity(guild, characters);
  const title = identity.titles.find(
    (entry) => entry.definition.id === titleId && entry.unlocked,
  );
  if (!title) return guild;

  return { ...guild, careerIdentity: { activeTitleId: titleId } };
}

export function getPersistedGuildTitle(guild: Guild) {
  const activeTitleId = normalizeGuildCareerIdentity(guild.careerIdentity).activeTitleId;
  return guildTitles.find((title) => title.id === activeTitleId);
}
