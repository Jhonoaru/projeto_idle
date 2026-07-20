import { getGuildSquadSlot, guildSquadSlots } from "../../data/guildSquads";
import type { GuildSquadMember, GuildSquadPreset, GuildSquadsState, PartyRole } from "../../shared/types";

const roles = new Set<PartyRole>(["tank", "healer", "damage", "support"]);

export function normalizeGuildSquadsState(
  value: unknown,
  guildLevel?: number,
  validCharacterIds?: readonly string[],
): GuildSquadsState {
  if (!value || typeof value !== "object") return { squads: [] };
  const candidate = value as Partial<GuildSquadsState>;
  const maximumLevel = normalizeGuildLevel(guildLevel);
  const characterIds = validCharacterIds ? new Set(validCharacterIds) : undefined;
  const seenSlots = new Set<string>();
  const squads = (Array.isArray(candidate.squads) ? candidate.squads : [])
    .map((entry) => normalizeSquad(entry, maximumLevel, characterIds))
    .filter((entry): entry is GuildSquadPreset => Boolean(entry))
    .filter((entry) => {
      if (seenSlots.has(entry.id)) return false;
      seenSlots.add(entry.id);
      return true;
    })
    .slice(0, guildSquadSlots.length);
  return { squads };
}

function normalizeSquad(value: unknown, guildLevel: number, validCharacterIds?: Set<string>) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildSquadPreset>;
  const slot = getGuildSquadSlot(candidate.id);
  if (!slot || slot.minimumGuildLevel > guildLevel) return undefined;
  const seenMembers = new Set<string>();
  const members = (Array.isArray(candidate.members) ? candidate.members : [])
    .map(normalizeMember)
    .filter((entry): entry is GuildSquadMember => Boolean(entry))
    .filter((entry) => {
      if (seenMembers.has(entry.characterId) || (validCharacterIds && !validCharacterIds.has(entry.characterId))) return false;
      seenMembers.add(entry.characterId);
      return true;
    })
    .slice(0, 5);
  const updatedAt = normalizeTimestamp(candidate.updatedAt);
  return {
    id: slot.id,
    name: normalizeName(candidate.name, slot.defaultName),
    members,
    updatedAt,
  } satisfies GuildSquadPreset;
}

function normalizeMember(value: unknown): GuildSquadMember | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildSquadMember>;
  if (typeof candidate.characterId !== "string" || !candidate.characterId.trim()) return undefined;
  if (!roles.has(candidate.role as PartyRole)) return undefined;
  return { characterId: candidate.characterId, role: candidate.role as PartyRole };
}

function normalizeName(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/\s+/g, " ").trim().slice(0, 24);
  return clean || fallback;
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return new Date(0).toISOString();
  return new Date(value).toISOString();
}

function normalizeGuildLevel(value: number | undefined) {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
