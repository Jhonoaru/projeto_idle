import { bazaarEquipmentItemIds, bazaarOfferPools } from "../../data/bazaarCatalog";
import { getItemById } from "../../data/items";
import type { BazaarOffer, BazaarOfferGrade, Item } from "../../shared/types";

export function generateBazaarOffers(guildId: string, rotationKey: string): BazaarOffer[] {
  const random = createSeededRandom(`${guildId}:${rotationKey}`);
  const selectedItemIds = new Set<string>();

  return bazaarOfferPools.map((pool, index) => {
    const grade = rollOfferGrade(random());
    const effectivePool = grade === "relic" ? bazaarEquipmentItemIds : pool;
    const itemId = pickUniqueItemId(effectivePool, selectedItemIds, random);
    const item = getItemById(itemId);
    const quantity = getOfferQuantity(item, random);
    const enhancements = getOfferEnhancements(item, grade);

    selectedItemIds.add(itemId);

    return {
      id: `bazaar-${rotationKey}-${index}-${itemId}`,
      itemId,
      quantity,
      price: getOfferPrice(item, quantity, grade, enhancements.upgradeLevel, enhancements.tier),
      grade,
      upgradeLevel: enhancements.upgradeLevel,
      tier: enhancements.tier,
    };
  });
}

export function rollOfferGrade(roll: number): BazaarOfferGrade {
  const normalizedRoll = Number.isFinite(roll) ? Math.min(0.999999, Math.max(0, roll)) : 0.999999;
  if (normalizedRoll < 0.0001) return "relic";
  if (normalizedRoll < 0.03) return "rare";
  if (normalizedRoll < 0.22) return "uncommon";
  return "standard";
}

function pickUniqueItemId(pool: readonly string[], selectedIds: Set<string>, random: () => number) {
  const available = pool.filter((itemId) => !selectedIds.has(itemId));
  const candidates = available.length > 0 ? available : pool;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[Math.max(0, index)];
}

function getOfferQuantity(item: Item, random: () => number) {
  if (!item.stackable) return 1;
  if (item.type === "consumable") return random() < 0.5 ? 5 : 10;
  if (item.type === "material") return 2 + Math.floor(random() * 4);
  return 1 + Math.floor(random() * 3);
}

function getOfferEnhancements(item: Item, grade: BazaarOfferGrade) {
  if (item.type !== "equipment") return { upgradeLevel: 0, tier: 0 };
  if (grade === "relic") return { upgradeLevel: 5, tier: 3 };
  if (grade === "rare") return { upgradeLevel: 2, tier: 1 };
  if (grade === "uncommon") return { upgradeLevel: 1, tier: 0 };
  return { upgradeLevel: 0, tier: 0 };
}

function getOfferPrice(item: Item, quantity: number, grade: BazaarOfferGrade, upgradeLevel: number, tier: number) {
  const multiplier = grade === "relic" ? 14 : grade === "rare" ? 4 : grade === "uncommon" ? 2.1 : 1.45;
  const enhancementPremium = upgradeLevel * 900 + tier * 7_500;
  const calculated = Math.ceil(Math.max(1, item.value) * quantity * multiplier + enhancementPremium);
  return grade === "relic" ? Math.max(60_000, calculated) : Math.max(1, calculated);
}

function createSeededRandom(seed: string) {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hashSeed(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
