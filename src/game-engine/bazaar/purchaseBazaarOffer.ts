import { createInventoryItem } from "../../data/inventoryFactory";
import { getItemById } from "../../data/items";
import { calculateCapacityUsed } from "../inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../inventory/mergeStackableItems";
import type { Character, Guild, GuildDepot, ShopDeliveryTarget } from "../../shared/types";
import { normalizeGuildBazaarState } from "./normalizeGuildBazaarState";

interface PurchaseBazaarOfferInput {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  offerId: string;
  deliveryTarget: ShopDeliveryTarget;
  now?: Date;
}

export function purchaseBazaarOffer({
  character,
  guild,
  guildDepot,
  offerId,
  deliveryTarget,
  now = new Date(),
}: PurchaseBazaarOfferInput) {
  const bazaar = normalizeGuildBazaarState(guild.bazaar, guild.id, now);
  const safeGuild = {
    ...guild,
    gold: normalizeGold(guild.gold),
    bazaar,
  };
  const safeGuildDepot = {
    ...guildDepot,
    items: Array.isArray(guildDepot.items) ? guildDepot.items : [],
  };
  const offer = bazaar.offers.find((entry) => entry.id === offerId);

  if (!offer) {
    return blocked(character, safeGuild, safeGuildDepot, "Compra bloqueada: a rotacao do Bazar mudou.");
  }

  if (offer.purchasedAt) {
    return blocked(character, safeGuild, safeGuildDepot, "Compra bloqueada: esta oferta ja foi adquirida.");
  }

  if (safeGuild.gold < offer.price) {
    return blocked(character, safeGuild, safeGuildDepot, "Compra bloqueada: guild.gold insuficiente para esta oferta.");
  }

  let item;
  try {
    item = getItemById(offer.itemId);
  } catch {
    return blocked(character, safeGuild, safeGuildDepot, "Compra bloqueada: item invalido na oferta local.");
  }

  const safeDeliveryTarget = normalizeDeliveryTarget(deliveryTarget);
  const inventoryItem = {
    ...createInventoryItem(
      item.id,
      offer.quantity,
      safeDeliveryTarget === "guild_depot" ? "guildDepot" : "character",
      safeDeliveryTarget === "guild_depot" ? undefined : character.id,
    ),
    upgradeLevel: offer.upgradeLevel,
    tier: offer.tier,
  };
  let nextCharacter = character;
  let nextGuildDepot = safeGuildDepot;

  if (safeDeliveryTarget === "character_inventory") {
    const inventory = mergeStackableItems([...character.inventory, inventoryItem]);
    const capacityUsed = calculateCapacityUsed(inventory);
    if (capacityUsed > character.capacityMax) {
      return blocked(character, safeGuild, safeGuildDepot, `Compra bloqueada: ${character.name} nao tem capacity para ${item.name}.`);
    }
    nextCharacter = { ...character, inventory, capacityUsed };
  } else if (safeDeliveryTarget === "character_depot") {
    nextCharacter = {
      ...character,
      characterDepot: mergeStackableItems([...character.characterDepot, inventoryItem]),
    };
  } else {
    const items = mergeStackableItems([...safeGuildDepot.items, inventoryItem]);
    nextGuildDepot = {
      ...safeGuildDepot,
      items,
      capacityUsed: calculateCapacityUsed(items),
    };
  }

  const purchasedAt = (Number.isFinite(now.getTime()) ? now : new Date()).toISOString();
  const purchaseRecord = {
    offerId: offer.id,
    rotationKey: bazaar.rotationKey,
    itemId: offer.itemId,
    quantity: offer.quantity,
    totalCost: offer.price,
    purchasedAt,
  };
  const nextBazaar = {
    ...bazaar,
    offers: bazaar.offers.map((entry) => entry.id === offer.id ? { ...entry, purchasedAt } : entry),
    purchaseHistory: [purchaseRecord, ...bazaar.purchaseHistory].slice(0, 40),
    totalPurchases: bazaar.totalPurchases + 1,
    totalSpentGold: bazaar.totalSpentGold + offer.price,
  };
  const enhancementLabel = offer.upgradeLevel > 0 || offer.tier > 0
    ? ` +${offer.upgradeLevel} [T${offer.tier}]`
    : "";

  return {
    character: nextCharacter,
    guild: {
      ...safeGuild,
      gold: safeGuild.gold - offer.price,
      bazaar: nextBazaar,
    },
    guildDepot: nextGuildDepot,
    success: true,
    logs: [
      `Bazar Rotativo: ${item.name}${enhancementLabel} x${offer.quantity} adquirido por ${offer.price.toLocaleString("en-US")}g.`,
    ],
  };
}

function blocked(character: Character, guild: Guild, guildDepot: GuildDepot, message: string) {
  return { character, guild, guildDepot, success: false, logs: [message] };
}

function normalizeDeliveryTarget(target: ShopDeliveryTarget): ShopDeliveryTarget {
  return target === "character_inventory" || target === "character_depot" || target === "guild_depot"
    ? target
    : "guild_depot";
}

function normalizeGold(value: number) {
  const gold = Math.floor(Number(value));
  return Number.isFinite(gold) && gold > 0 ? gold : 0;
}
