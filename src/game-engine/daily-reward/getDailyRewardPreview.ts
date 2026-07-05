import { getCollectionItemById } from "../../data/collections";
import { getItemById } from "../../data/items";
import type { DailyRewardDefinition } from "../../shared/types";

export function getDailyRewardPreview(reward: DailyRewardDefinition | undefined) {
  if (!reward) return "Gold fallback";
  if (reward.previewValue) return reward.previewValue;
  if (reward.goldAmount) return `${reward.goldAmount}g`;
  if (reward.itemId) {
    try {
      return `${getItemById(reward.itemId).name} x${reward.quantity ?? 1}`;
    } catch {
      return "Gold fallback";
    }
  }
  if (reward.collectionItemId) {
    return getCollectionItemById(reward.collectionItemId)?.previewValue ?? "Gold fallback";
  }

  return "Gold fallback";
}
