import type { BazaarPurchaseRecord, GuildBazaarState } from "../../shared/types";
import { generateBazaarOffers } from "./generateBazaarOffers";
import { getBazaarRotationBounds, getBazaarRotationKey } from "./getBazaarRotationKey";

const MAX_PURCHASE_HISTORY = 40;

export function normalizeGuildBazaarState(
  state: GuildBazaarState | null | undefined,
  guildId: string,
  now = new Date(),
): GuildBazaarState {
  const safeNow = Number.isFinite(now.getTime()) ? now : new Date();
  const rotationKey = getBazaarRotationKey(safeNow);
  const bounds = getBazaarRotationBounds(rotationKey);
  const purchaseHistory = normalizePurchaseHistory(state?.purchaseHistory);
  const purchasesByOfferId = new Map(
    purchaseHistory
      .filter((purchase) => purchase.rotationKey === rotationKey)
      .map((purchase) => [purchase.offerId, purchase]),
  );
  const offers = generateBazaarOffers(guildId || "local-guild", rotationKey).map((offer) => ({
    ...offer,
    purchasedAt: purchasesByOfferId.get(offer.id)?.purchasedAt,
  }));

  return {
    rotationKey,
    generatedAt: bounds.generatedAt,
    expiresAt: bounds.expiresAt,
    offers,
    purchaseHistory,
    totalPurchases: normalizeNonNegativeInteger(state?.totalPurchases),
    totalSpentGold: normalizeNonNegativeInteger(state?.totalSpentGold),
  };
}

function normalizePurchaseHistory(history: BazaarPurchaseRecord[] | undefined) {
  if (!Array.isArray(history)) return [];

  const seen = new Set<string>();
  const normalized: BazaarPurchaseRecord[] = [];

  for (const purchase of history) {
    if (!purchase || typeof purchase !== "object") continue;
    if (!purchase.offerId || !purchase.rotationKey || !purchase.itemId) continue;
    const key = `${purchase.rotationKey}:${purchase.offerId}`;
    if (seen.has(key)) continue;
    const purchasedAt = Number.isFinite(Date.parse(purchase.purchasedAt))
      ? purchase.purchasedAt
      : new Date(0).toISOString();

    seen.add(key);
    normalized.push({
      offerId: purchase.offerId,
      rotationKey: purchase.rotationKey,
      itemId: purchase.itemId,
      quantity: Math.max(1, normalizeNonNegativeInteger(purchase.quantity)),
      totalCost: normalizeNonNegativeInteger(purchase.totalCost),
      purchasedAt,
    });

    if (normalized.length >= MAX_PURCHASE_HISTORY) break;
  }

  return normalized;
}

function normalizeNonNegativeInteger(value: number | undefined) {
  const normalized = Math.floor(Number(value));
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : 0;
}
