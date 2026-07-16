import { getGuildCareer } from "../achievements/getGuildCareer";
import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { experienceForLevel } from "../progression/experienceTable";
import { createInventoryItem } from "../../data/inventoryFactory";
import {
  getGuildRecruitCandidate,
  MAX_GUILD_ROSTER_SIZE,
  type GuildRecruitCandidateDefinition,
} from "../../data/guildRecruitCandidates";
import type { Character, EquippedItems, Guild, SkillName, SkillSet } from "../../shared/types";

export function recruitGuildCandidate(
  guild: Guild,
  characters: Character[],
  candidateId: string,
  now = new Date(),
) {
  const availability = getGuildRecruitmentAvailability(guild, characters, candidateId);
  if (!availability.available || !availability.candidate) {
    return blocked(guild, characters, availability.reasons[0] ?? "Candidate is not available.");
  }
  if (!Number.isFinite(now.getTime())) return blocked(guild, characters, "Recruitment timestamp is invalid.");

  const character = createRecruitedCharacter(availability.candidate, now);
  const currentGold = normalizeInteger(guild.gold);
  return {
    success: true,
    guild: { ...guild, gold: currentGold - availability.candidate.hireCost },
    characters: [...characters, character],
    character,
    message: `${character.name} joined the guild as a level ${character.level} ${character.vocation}.`,
  };
}

export function getGuildRecruitmentAvailability(guild: Guild, characters: Character[], candidateId: string) {
  const candidate = getGuildRecruitCandidate(candidateId);
  if (!candidate) return { available: false, reasons: ["Candidate not found."], candidate: undefined };

  const reasons: string[] = [];
  if (characters.some((character) => character.id === candidate.characterId)) reasons.push("Already recruited.");
  if (characters.length >= MAX_GUILD_ROSTER_SIZE) reasons.push(`Guild roster is full (${MAX_GUILD_ROSTER_SIZE}/${MAX_GUILD_ROSTER_SIZE}).`);
  const careerPoints = getGuildCareer(guild, characters).points;
  if (careerPoints < candidate.minimumCareerPoints) reasons.push(`Requires ${candidate.minimumCareerPoints} Career Points.`);
  if (normalizeInteger(guild.gold) < candidate.hireCost) reasons.push(`Requires ${candidate.hireCost.toLocaleString("en-US")}g.`);
  return { available: reasons.length === 0, reasons, candidate };
}

function createRecruitedCharacter(candidate: GuildRecruitCandidateDefinition, now: Date): Character {
  const skills = createSkills(candidate.skills);
  const equipment = Object.fromEntries(
    Object.entries(candidate.equipment).map(([slot, itemId]) => [
      slot,
      createInventoryItem(itemId, 1, "character", candidate.characterId),
    ]),
  ) as EquippedItems;
  const inventory = candidate.inventory.map((entry) =>
    createInventoryItem(entry.itemId, entry.quantity, "character", candidate.characterId),
  );
  const base = {
    level: candidate.level,
    vocation: candidate.vocation,
    skills,
    equipment,
  };
  const attributes = calculateCharacterAttributes(base);
  const experience = experienceForLevel(candidate.level);

  return {
    id: candidate.characterId,
    name: candidate.name,
    vocation: candidate.vocation,
    level: candidate.level,
    experience,
    experienceToNextLevel: experienceForLevel(candidate.level + 1) - experience,
    status: "idle",
    city: candidate.city,
    staminaHours: 42,
    gold: 0,
    inventory,
    characterDepot: [],
    equipment,
    capacityUsed: calculateCapacityUsed(inventory),
    capacityMax: attributes.capacity,
    completedQuestIds: [],
    accessIds: [],
    bossCooldowns: [],
    questProgress: [],
    skills,
    attributes,
    blessings: [],
    deathCount: 0,
    createdAt: now.toISOString(),
  };
}

function createSkills(levels: Record<SkillName, number>): SkillSet {
  return {
    sword: { name: "sword", level: levels.sword, progressPercent: 0 },
    axe: { name: "axe", level: levels.axe, progressPercent: 0 },
    club: { name: "club", level: levels.club, progressPercent: 0 },
    distance: { name: "distance", level: levels.distance, progressPercent: 0 },
    fist: { name: "fist", level: levels.fist, progressPercent: 0 },
    shielding: { name: "shielding", level: levels.shielding, progressPercent: 0 },
    magic: { name: "magic", level: levels.magic, progressPercent: 0 },
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function blocked(guild: Guild, characters: Character[], message: string) {
  return { success: false, guild, characters, character: undefined, message };
}
