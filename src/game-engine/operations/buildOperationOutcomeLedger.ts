import { bosses } from "../../data/bosses";
import { getGuildContract } from "../../data/guildContracts";
import { items } from "../../data/items";
import type { Character, Guild } from "../../shared/types";
import { normalizeGuildExpeditionState } from "../expeditions/normalizeGuildExpeditionState";
import { normalizeGuildOperationOutcomes } from "./normalizeGuildOperationOutcomes";

export type OperationOutcomeKind = "boss" | "contract";

export function buildOperationOutcomeLedger(guild: Guild, characters: Character[]) {
  const characterNames = new Map((Array.isArray(characters) ? characters : [])
    .filter((character) => character && typeof character.id === "string")
    .map((character) => [character.id, character.name]));
  const bossEntries = normalizeGuildOperationOutcomes(guild.operationOutcomes).bossHistory.map((entry) => {
    const boss = bosses.find((candidate) => candidate.id === entry.bossId)!;
    const loot = entry.loot.map((loot) => ({
      itemId: loot.itemId,
      name: items[loot.itemId]?.name ?? loot.itemId,
      quantity: loot.quantity,
    }));
    return {
      id: `boss:${entry.id}`,
      sourceId: entry.id,
      kind: "boss" as const,
      targetId: boss.id,
      targetName: boss.name,
      region: boss.city,
      completedAt: entry.completedAt,
      success: entry.defeated,
      participantIds: entry.participantCharacterIds,
      participantNames: getNames(entry.participantCharacterIds, characterNames),
      cost: entry.entryCost + entry.goldLost,
      entryCost: entry.entryCost,
      penaltyCost: entry.goldLost,
      goldGained: entry.goldGained,
      netGold: entry.goldGained - entry.entryCost - entry.goldLost,
      renownGained: entry.renownGained,
      experienceGained: entry.experienceGained,
      loot,
      itemCount: loot.reduce((total, item) => total + item.quantity, 0),
    };
  });
  const contractEntries = normalizeGuildExpeditionState(guild.expeditions).history.map((entry) => {
    const contract = getGuildContract(entry.contractId)!;
    const loot = entry.itemId && entry.itemQuantity
      ? [{ itemId: entry.itemId, name: items[entry.itemId]?.name ?? entry.itemId, quantity: entry.itemQuantity }]
      : [];
    const cost = normalizeInteger(entry.dispatchCost ?? contract.dispatchCost);
    return {
      id: `contract:${entry.id}`,
      sourceId: entry.id,
      kind: "contract" as const,
      targetId: contract.id,
      targetName: contract.name,
      region: contract.region,
      completedAt: entry.completedAt,
      success: entry.success,
      participantIds: entry.assignedCharacterIds,
      participantNames: getNames(entry.assignedCharacterIds, characterNames),
      cost,
      entryCost: cost,
      penaltyCost: 0,
      goldGained: entry.goldGained,
      netGold: entry.goldGained - cost,
      renownGained: entry.renownGained,
      experienceGained: 0,
      loot,
      itemCount: loot.reduce((total, item) => total + item.quantity, 0),
    };
  });
  const entries = [...bossEntries, ...contractEntries]
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))
    .slice(0, 24);
  const successes = entries.filter((entry) => entry.success);
  return {
    entries,
    summary: {
      recorded: entries.length,
      successes: successes.length,
      bosses: entries.filter((entry) => entry.kind === "boss").length,
      contracts: entries.filter((entry) => entry.kind === "contract").length,
      goldGained: entries.reduce((total, entry) => total + entry.goldGained, 0),
      costs: entries.reduce((total, entry) => total + entry.cost, 0),
      netGold: entries.reduce((total, entry) => total + entry.netGold, 0),
      renownGained: entries.reduce((total, entry) => total + entry.renownGained, 0),
      lootItems: entries.reduce((total, entry) => total + entry.itemCount, 0),
    },
  };
}

export type OperationOutcomeLedger = ReturnType<typeof buildOperationOutcomeLedger>;
export type OperationOutcomeLedgerEntry = OperationOutcomeLedger["entries"][number];

function getNames(ids: string[], names: Map<string, string>) {
  return ids.map((id) => names.get(id) ?? "Retired adventurer");
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed)))
    : 0;
}
