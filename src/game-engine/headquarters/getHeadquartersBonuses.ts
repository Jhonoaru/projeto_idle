import { normalizeGuildHeadquarters } from "./normalizeGuildHeadquarters";
import type { GuildHeadquartersState } from "../../shared/types";

export function getHeadquartersBonuses(state: GuildHeadquartersState | undefined) {
  const headquarters = normalizeGuildHeadquarters(state);
  return {
    huntXpBonusPercent: headquarters.facilityLevels.war_room,
    trainingProgressBonusPercent: headquarters.facilityLevels.training_yard * 2,
    npcPriceDiscountPercent: headquarters.facilityLevels.quartermaster * 2,
    questXpBonusPercent: headquarters.facilityLevels.contract_archive,
  };
}

export function getHeadquartersRank(state: GuildHeadquartersState | undefined) {
  const headquarters = normalizeGuildHeadquarters(state);
  const totalLevels = Object.values(headquarters.facilityLevels).reduce((total, level) => total + level, 0);
  if (totalLevels >= 12) return { title: "Grand Headquarters", totalLevels };
  if (totalLevels >= 8) return { title: "Guild Stronghold", totalLevels };
  if (totalLevels >= 4) return { title: "Established Hall", totalLevels };
  if (totalLevels >= 1) return { title: "Guild Outpost", totalLevels };
  return { title: "Founding Lodge", totalLevels };
}
