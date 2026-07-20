import { guildDirectives } from "../../data/guildDirectives";
import type { GuildDirectiveActivation, GuildDirectiveId, GuildDirectivesState } from "../../shared/types";

const validDirectiveIds = new Set<GuildDirectiveId>(guildDirectives.map((directive) => directive.id));

export function normalizeGuildDirectivesState(value: unknown, guildLevel?: number): GuildDirectivesState {
  if (!value || typeof value !== "object") return { activeDirectiveId: null, activationHistory: [] };
  const candidate = value as Partial<GuildDirectivesState>;
  const maximumLevel = normalizeGuildLevel(guildLevel);
  const configuredActiveId = isDirectiveId(candidate.activeDirectiveId) ? candidate.activeDirectiveId : null;
  const activeDirectiveId = configuredActiveId && isUnlockedAtLevel(configuredActiveId, maximumLevel)
    ? configuredActiveId
    : null;
  const activationHistory = (Array.isArray(candidate.activationHistory) ? candidate.activationHistory : [])
    .map(normalizeActivation)
    .filter((entry): entry is GuildDirectiveActivation => Boolean(entry))
    .filter((entry) => isUnlockedAtLevel(entry.directiveId, maximumLevel))
    .slice(0, 12);
  return { activeDirectiveId, activationHistory };
}

function normalizeActivation(value: unknown): GuildDirectiveActivation | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildDirectiveActivation>;
  if (!isDirectiveId(candidate.directiveId) || typeof candidate.activatedAt !== "string") return undefined;
  const timestamp = new Date(candidate.activatedAt);
  if (!Number.isFinite(timestamp.getTime())) return undefined;
  return { directiveId: candidate.directiveId, activatedAt: timestamp.toISOString() };
}

function isDirectiveId(value: unknown): value is GuildDirectiveId {
  return typeof value === "string" && validDirectiveIds.has(value as GuildDirectiveId);
}

function isUnlockedAtLevel(directiveId: GuildDirectiveId, maximumLevel: number) {
  return (guildDirectives.find((directive) => directive.id === directiveId)?.minimumGuildLevel ?? Number.POSITIVE_INFINITY) <= maximumLevel;
}

function normalizeGuildLevel(value: number | undefined) {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
