import { getGuildFacility } from "../../data/guildFacilities";
import { getGuildCareer } from "../achievements/getGuildCareer";
import type { Character, Guild, GuildFacilityId } from "../../shared/types";
import { normalizeGuildHeadquarters } from "./normalizeGuildHeadquarters";

export function upgradeGuildFacility(guild: Guild, characters: Character[], facilityId: GuildFacilityId) {
  const definition = getGuildFacility(facilityId);
  const headquarters = normalizeGuildHeadquarters(guild.headquarters);
  if (!definition) return blocked(guild, "Facility definition not found.");

  const currentLevel = headquarters.facilityLevels[facilityId];
  if (currentLevel >= 3) return blocked(guild, `${definition.name} is already at maximum level.`);

  const cost = definition.upgradeCosts[currentLevel] ?? Number.POSITIVE_INFINITY;
  const requiredCareerPoints = definition.careerPointRequirements[currentLevel] ?? Number.POSITIVE_INFINITY;
  const careerPoints = getGuildCareer(guild, characters).points;
  if (careerPoints < requiredCareerPoints) {
    return blocked(guild, `${definition.name} requires ${requiredCareerPoints} career points for level ${currentLevel + 1}.`);
  }

  const currentGold = Number.isFinite(guild.gold) ? Math.max(0, Math.floor(guild.gold)) : 0;
  if (currentGold < cost) return blocked(guild, `${definition.name} requires ${cost.toLocaleString("en-US")}g.`);

  const nextLevel = currentLevel + 1;
  return {
    success: true,
    guild: {
      ...guild,
      gold: currentGold - cost,
      headquarters: {
        facilityLevels: { ...headquarters.facilityLevels, [facilityId]: nextLevel },
        totalInvestedGold: headquarters.totalInvestedGold + cost,
      },
    },
    message: `${definition.name} upgraded to level ${nextLevel} for ${cost.toLocaleString("en-US")}g.`,
    cost,
    facilityId,
    level: nextLevel,
  };
}

function blocked(guild: Guild, message: string) {
  return { success: false, guild, message, cost: 0, facilityId: undefined, level: undefined };
}
