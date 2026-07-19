import { guildProgressionMilestones } from "../../data/guildProgression";
import type { Guild } from "../../shared/types";

export function getGuildProgression(guild: Pick<Guild, "renown">) {
  const renown = normalizeRenown(guild.renown);
  const current = [...guildProgressionMilestones]
    .reverse()
    .find((milestone) => renown >= milestone.requiredRenown)
    ?? guildProgressionMilestones[0];
  const next = guildProgressionMilestones.find((milestone) => milestone.level === current.level + 1);
  const range = next ? next.requiredRenown - current.requiredRenown : 0;
  const progressPercent = next && range > 0
    ? Math.min(100, Math.max(0, Math.floor(((renown - current.requiredRenown) / range) * 100)))
    : 100;

  return {
    renown,
    level: current.level,
    rank: current.rank,
    title: current.title,
    rosterCapacity: current.rosterCapacity,
    current,
    next,
    renownToNext: next ? Math.max(0, next.requiredRenown - renown) : 0,
    progressPercent,
    maxLevel: guildProgressionMilestones.length,
  };
}

export function normalizeGuildProgression(guild: Guild): Guild {
  const progression = getGuildProgression(guild);
  return {
    ...guild,
    renown: progression.renown,
    level: progression.level,
    rank: progression.rank,
  };
}

export function getGuildRosterCapacity(guild: Pick<Guild, "renown">) {
  return getGuildProgression(guild).rosterCapacity;
}

function normalizeRenown(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}
