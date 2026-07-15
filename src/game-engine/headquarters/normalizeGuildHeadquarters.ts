import { guildFacilities } from "../../data/guildFacilities";
import type { GuildFacilityId, GuildHeadquartersState } from "../../shared/types";

export function createDefaultGuildHeadquarters(): GuildHeadquartersState {
  return {
    facilityLevels: {
      war_room: 0,
      training_yard: 0,
      quartermaster: 0,
      contract_archive: 0,
    },
    totalInvestedGold: 0,
  };
}

export function normalizeGuildHeadquarters(value: unknown): GuildHeadquartersState {
  const defaults = createDefaultGuildHeadquarters();
  if (!value || typeof value !== "object") return defaults;
  const candidate = value as Partial<GuildHeadquartersState>;
  const sourceLevels: Partial<Record<GuildFacilityId, unknown>> =
    candidate.facilityLevels && typeof candidate.facilityLevels === "object"
      ? candidate.facilityLevels
      : {};
  const facilityLevels = { ...defaults.facilityLevels };

  for (const facility of guildFacilities) {
    facilityLevels[facility.id] = normalizeLevel(sourceLevels[facility.id]);
  }

  return {
    facilityLevels,
    totalInvestedGold: normalizeGold(candidate.totalInvestedGold),
  };
}

function normalizeLevel(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(3, Math.max(0, Math.floor(parsed))) : 0;
}

function normalizeGold(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
