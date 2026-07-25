import type { Character, Guild, GuildDepot } from "../../shared/types";
import {
  fulfillGuildLoadoutProcurementReservation,
  type GuildLoadoutProcurementFulfillmentRequest,
} from "./fulfillGuildLoadoutProcurementReservation";

export interface GuildLoadoutProcurementBatchEntry {
  characterName: string;
  itemName: string;
  previousItemName?: string;
}

export interface GuildLoadoutProcurementBatchResult {
  success: boolean;
  guild: Guild;
  characters: Character[];
  depot: GuildDepot;
  message: string;
  completed: number;
  entries: GuildLoadoutProcurementBatchEntry[];
}

const MAX_BATCH_SIZE = 5;

export function fulfillGuildLoadoutProcurementBatch(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  requests: GuildLoadoutProcurementFulfillmentRequest[],
  now = new Date(),
): GuildLoadoutProcurementBatchResult {
  if (!Array.isArray(requests) || requests.length < 1 || requests.length > MAX_BATCH_SIZE) {
    return blocked(guild, characters, depot, "A reserved dispatch must contain between 1 and 5 pieces.");
  }
  if (!Number.isFinite(now.getTime())) {
    return blocked(guild, characters, depot, "The batch dispatch timestamp is invalid.");
  }

  const orderKeys = new Set<string>();
  const inventoryItemIds = new Set<string>();
  for (const request of requests) {
    const orderKey = requestKey(request);
    if (!orderKey || orderKeys.has(orderKey)) {
      return blocked(guild, characters, depot, "The batch contains an invalid or duplicated procurement order.");
    }
    if (
      !request
      || typeof request.inventoryItemId !== "string"
      || !request.inventoryItemId
      || inventoryItemIds.has(request.inventoryItemId)
    ) {
      return blocked(guild, characters, depot, "The batch contains an invalid or duplicated reserved copy.");
    }
    orderKeys.add(orderKey);
    inventoryItemIds.add(request.inventoryItemId);
  }

  let workingGuild = guild;
  let workingCharacters = characters;
  let workingDepot = depot;
  const entries: GuildLoadoutProcurementBatchEntry[] = [];

  for (const [index, request] of requests.entries()) {
    const result = fulfillGuildLoadoutProcurementReservation(
      workingGuild,
      workingCharacters,
      workingDepot,
      request,
      now,
    );
    if (!result.success) {
      return blocked(
        guild,
        characters,
        depot,
        `Batch dispatch cancelled at item ${index + 1} of ${requests.length}: ${result.message}`,
      );
    }
    workingGuild = result.guild;
    workingCharacters = result.characters;
    workingDepot = result.depot;
    entries.push({
      characterName: result.characterName ?? "Adventurer",
      itemName: result.itemName ?? request.itemId,
      previousItemName: result.previousItemName,
    });
  }

  return {
    success: true,
    guild: workingGuild,
    characters: workingCharacters,
    depot: workingDepot,
    message: `${entries.length} reserved gear piece${entries.length === 1 ? "" : "s"} issued and equipped.`,
    completed: entries.length,
    entries,
  };
}

function requestKey(request: GuildLoadoutProcurementFulfillmentRequest) {
  if (
    !request
    || typeof request.characterId !== "string"
    || !request.characterId
    || typeof request.templateId !== "string"
    || !request.templateId
    || typeof request.slot !== "string"
    || !request.slot
    || typeof request.itemId !== "string"
    || !request.itemId
  ) return "";
  return `${request.characterId}:${request.templateId}:${request.slot}:${request.itemId}`;
}

function blocked(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  message: string,
): GuildLoadoutProcurementBatchResult {
  return { success: false, guild, characters, depot, message, completed: 0, entries: [] };
}
