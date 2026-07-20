import { guildDirectives } from "../../data/guildDirectives";
import type { GuildDirectiveActivation, GuildDirectiveId, GuildDirectivesState } from "../../shared/types";

const validDirectiveIds = new Set<GuildDirectiveId>(guildDirectives.map((directive) => directive.id));

export function normalizeGuildDirectivesState(value: unknown): GuildDirectivesState {
  if (!value || typeof value !== "object") return { activeDirectiveId: null, activationHistory: [] };
  const candidate = value as Partial<GuildDirectivesState>;
  const activeDirectiveId = isDirectiveId(candidate.activeDirectiveId) ? candidate.activeDirectiveId : null;
  const activationHistory = (Array.isArray(candidate.activationHistory) ? candidate.activationHistory : [])
    .map(normalizeActivation)
    .filter((entry): entry is GuildDirectiveActivation => Boolean(entry))
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
