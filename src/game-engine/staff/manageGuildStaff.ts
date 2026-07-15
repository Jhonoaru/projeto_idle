import { getGuildSpecialist } from "../../data/guildSpecialists";
import { getGuildCareer } from "../achievements/getGuildCareer";
import { normalizeGuildHeadquarters } from "../headquarters/normalizeGuildHeadquarters";
import type { Character, Guild, GuildSpecialistId } from "../../shared/types";
import { normalizeGuildStaffState } from "./normalizeGuildStaffState";

export function hireGuildSpecialist(guild: Guild, characters: Character[], specialistId: GuildSpecialistId) {
  const definition = getGuildSpecialist(specialistId);
  const staff = normalizeGuildStaffState(guild.staff);
  if (!definition) return blocked(guild, "Specialist definition not found.");
  if (staff.hiredSpecialistIds.includes(definition.id)) return blocked(guild, `${definition.name} already serves the guild.`);

  const facilityLevel = normalizeGuildHeadquarters(guild.headquarters).facilityLevels[definition.requiredFacilityId];
  if (facilityLevel < definition.requiredFacilityLevel) {
    return blocked(guild, `${definition.title} requires ${formatFacility(definition.requiredFacilityId)} level ${definition.requiredFacilityLevel}.`);
  }
  const careerPoints = getGuildCareer(guild, characters).points;
  if (careerPoints < definition.minimumCareerPoints) {
    return blocked(guild, `${definition.title} requires ${definition.minimumCareerPoints} Career Points.`);
  }
  const currentGold = Number.isFinite(guild.gold) ? Math.max(0, Math.floor(guild.gold)) : 0;
  if (currentGold < definition.hireCost) return blocked(guild, `${definition.title} requires ${definition.hireCost.toLocaleString("en-US")}g.`);

  const nextStaff = {
    hiredSpecialistIds: [...staff.hiredSpecialistIds, definition.id],
    activeSpecialistId: staff.activeSpecialistId ?? definition.id,
    totalSpentGold: staff.totalSpentGold + definition.hireCost,
  };
  return {
    success: true,
    guild: { ...guild, gold: currentGold - definition.hireCost, staff: nextStaff },
    message: `${definition.name}, ${definition.title}, joined the guild for ${definition.hireCost.toLocaleString("en-US")}g.`,
    specialistId: definition.id,
  };
}

export function getGuildSpecialistAvailability(guild: Guild, characters: Character[], specialistId: GuildSpecialistId) {
  const definition = getGuildSpecialist(specialistId);
  if (!definition) return { available: false, hired: false, reasons: ["Specialist definition not found."], careerPoints: 0, facilityLevel: 0 };
  const staff = normalizeGuildStaffState(guild.staff);
  const careerPoints = getGuildCareer(guild, characters).points;
  const facilityLevel = normalizeGuildHeadquarters(guild.headquarters).facilityLevels[definition.requiredFacilityId];
  const reasons: string[] = [];
  if (facilityLevel < definition.requiredFacilityLevel) reasons.push(`Requires ${formatFacility(definition.requiredFacilityId)} level ${definition.requiredFacilityLevel}`);
  if (careerPoints < definition.minimumCareerPoints) reasons.push(`Requires ${definition.minimumCareerPoints} Career Points`);
  const currentGold = Number.isFinite(guild.gold) ? Math.max(0, Math.floor(guild.gold)) : 0;
  if (currentGold < definition.hireCost) reasons.push(`Requires ${definition.hireCost.toLocaleString("en-US")}g`);
  return { available: reasons.length === 0, hired: staff.hiredSpecialistIds.includes(specialistId), reasons, careerPoints, facilityLevel };
}

export function assignGuildSpecialist(guild: Guild, specialistId: GuildSpecialistId | null) {
  const staff = normalizeGuildStaffState(guild.staff);
  if (specialistId === null) {
    if (staff.activeSpecialistId === null) return blocked(guild, "No specialist is currently on duty.");
    return { success: true, guild: { ...guild, staff: { ...staff, activeSpecialistId: null } }, message: "The specialist post is now unassigned.", specialistId: null };
  }
  const definition = getGuildSpecialist(specialistId);
  if (!definition || !staff.hiredSpecialistIds.includes(specialistId)) return blocked(guild, "This specialist has not joined the guild.");
  if (staff.activeSpecialistId === specialistId) return blocked(guild, `${definition.name} is already on duty.`);
  return {
    success: true,
    guild: { ...guild, staff: { ...staff, activeSpecialistId: specialistId } },
    message: `${definition.name} is now on duty: ${definition.bonusLabel}.`,
    specialistId,
  };
}

function blocked(guild: Guild, message: string) {
  return { success: false, guild, message, specialistId: undefined };
}

function formatFacility(facilityId: string) {
  return facilityId.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
