import { getCollectionItemById } from "../../data/collections";
import type { CosmeticExchangeDefinition } from "../../data/cosmeticExchanges";
import { getItemById } from "../../data/items";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { isCollectionItemUnlocked } from "../collections/isCollectionItemUnlocked";
import { getAvailableGuildDepotMaterialQuantity } from "../inventory/guildDepotMaterials";

export function getCosmeticExchangeAvailability(
  exchange: CosmeticExchangeDefinition,
  guild: Guild,
  depot: GuildDepot,
  characters: Character[],
) {
  const reasons: string[] = [];
  const collectionItem = getCollectionItemById(exchange.collectionItemId);
  const alreadyUnlocked = isCollectionItemUnlocked(guild.collections, exchange.collectionItemId);
  const safeGold = normalizeInteger(guild.gold);
  const materialBalances = exchange.materials.map((requirement) => {
    const available = getAvailableGuildDepotMaterialQuantity(depot, requirement.itemId);
    return {
      ...requirement,
      name: getItemById(requirement.itemId)?.name ?? requirement.itemId,
      available,
      missing: Math.max(0, requirement.quantity - available),
    };
  });
  const questComplete = !exchange.requiredQuestId || characters.some((character) =>
    Array.isArray(character.completedQuestIds) && character.completedQuestIds.includes(exchange.requiredQuestId!),
  );

  if (!collectionItem) reasons.push("Cosmetic record is invalid.");
  if (alreadyUnlocked) reasons.push("Cosmetic already unlocked.");
  if (safeGold < exchange.goldCost) reasons.push(`Requires ${exchange.goldCost.toLocaleString("en-US")}g.`);
  if (materialBalances.some((material) => material.missing > 0)) reasons.push("Missing Guild Depot trophies.");
  if (!questComplete) reasons.push("Required guild quest is not complete.");

  return {
    available: reasons.length === 0,
    reasons,
    alreadyUnlocked,
    questComplete,
    materialBalances,
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}
