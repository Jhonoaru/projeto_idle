import { getGuildContract } from "../../data/guildContracts";
import type { Character, Guild } from "../../shared/types";
import { calculateExpeditionSuccessChance, calculateExpeditionTeamPower, getGuildContractAvailability } from "./getGuildContractAvailability";
import { normalizeGuildExpeditionState } from "./normalizeGuildExpeditionState";

export function startGuildExpedition(guild: Guild, characters: Character[], contractId: string, assignedCharacterIds: string[], now = new Date()) {
  const contract = getGuildContract(contractId);
  if (!contract) return blocked(guild, "Guild contract not found.");
  const expeditions = normalizeGuildExpeditionState(guild.expeditions);
  if (expeditions.activeExpedition) return blocked(guild, "The guild already has an active expedition.");
  const availability = getGuildContractAvailability(contract, guild, characters);
  if (!availability.available) return blocked(guild, availability.reasons[0]);

  const uniqueIds = [...new Set(assignedCharacterIds)].filter((characterId) => {
    const character = characters.find((entry) => entry.id === characterId);
    return character && character.status !== "dead";
  });
  if (uniqueIds.length < contract.minimumTeamSize) return blocked(guild, `${contract.name} requires at least ${contract.minimumTeamSize} support adventurer${contract.minimumTeamSize === 1 ? "" : "s"}.`);
  if (uniqueIds.length > contract.maximumTeamSize) return blocked(guild, `${contract.name} accepts at most ${contract.maximumTeamSize} support adventurers.`);

  const currentGold = Number.isFinite(guild.gold) ? Math.max(0, Math.floor(guild.gold)) : 0;
  if (currentGold < contract.dispatchCost) return blocked(guild, `${contract.name} requires ${contract.dispatchCost.toLocaleString("en-US")}g to dispatch.`);
  const startedAt = new Date(now);
  if (!Number.isFinite(startedAt.getTime())) return blocked(guild, "Invalid expedition start time.");
  const endsAt = new Date(startedAt.getTime() + contract.durationMinutes * 60_000);
  const teamPower = calculateExpeditionTeamPower(characters, uniqueIds);
  const successChance = calculateExpeditionSuccessChance(teamPower, contract.recommendedPower);
  const id = `expedition-${contract.id}-${startedAt.getTime()}`;
  const activeExpedition = {
    id,
    contractId: contract.id,
    startedAt: startedAt.toISOString(),
    endsAt: endsAt.toISOString(),
    assignedCharacterIds: uniqueIds,
    teamPower,
    successChance,
    outcomeRoll: deterministicRoll(`${guild.id}-${id}-${uniqueIds.slice().sort().join("-")}`),
    dispatchCost: contract.dispatchCost,
  };

  return {
    success: true,
    guild: { ...guild, gold: currentGold - contract.dispatchCost, expeditions: { ...expeditions, activeExpedition } },
    activeExpedition,
    message: `${contract.name} dispatched for ${contract.dispatchCost.toLocaleString("en-US")}g with ${successChance}% success chance.`,
  };
}

function deterministicRoll(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4_294_967_296;
}

function blocked(guild: Guild, message: string) {
  return { success: false, guild, activeExpedition: undefined, message };
}
