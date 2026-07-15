import { getGuildCareer } from "../achievements/getGuildCareer";
import { getHeadquartersRank } from "../headquarters/getHeadquartersBonuses";
import type { Character, Guild, GuildContractDefinition } from "../../shared/types";

export function getGuildContractAvailability(contract: GuildContractDefinition, guild: Guild, characters: Character[]) {
  const careerPoints = getGuildCareer(guild, characters).points;
  const headquartersLevels = getHeadquartersRank(guild.headquarters).totalLevels;
  const reasons: string[] = [];
  if (careerPoints < contract.minimumCareerPoints) reasons.push(`Requires ${contract.minimumCareerPoints} Career Points`);
  if (headquartersLevels < contract.minimumHeadquartersLevels) reasons.push(`Requires ${contract.minimumHeadquartersLevels} Headquarters Level${contract.minimumHeadquartersLevels === 1 ? "" : "s"}`);
  return { available: reasons.length === 0, reasons, careerPoints, headquartersLevels };
}

export function calculateExpeditionTeamPower(characters: Character[], assignedCharacterIds: string[]) {
  const assigned = new Set(assignedCharacterIds);
  return characters
    .filter((character) => assigned.has(character.id) && character.status !== "dead")
    .reduce((total, character) => total + Math.max(1, safeNumber(character.level)) * 4 + safeNumber(character.attributes.attackPower) + safeNumber(character.attributes.defensePower), 0);
}

export function calculateExpeditionSuccessChance(teamPower: number, recommendedPower: number) {
  const safeRecommended = Math.max(1, safeNumber(recommendedPower));
  const powerRatio = safeNumber(teamPower) / safeRecommended;
  return Math.min(95, Math.max(35, Math.round(45 + powerRatio * 40)));
}

function safeNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
