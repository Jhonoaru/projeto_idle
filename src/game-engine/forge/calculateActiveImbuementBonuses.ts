import { calculateEnhancedItemBonuses } from "./calculateEnhancedItemBonuses";
import type { Character, InventoryItem } from "../../shared/types";

export function calculateActiveImbuementBonuses(character: Character) {
  const equipped = Object.values(character.equipment).filter(Boolean) as InventoryItem[];
  return equipped.reduce(
    (totals, item) => {
      const bonuses = calculateEnhancedItemBonuses(item);
      return {
        xpBonusPercent: totals.xpBonusPercent + bonuses.xpBonusPercent,
        supplyReductionPercent: totals.supplyReductionPercent + bonuses.supplyReductionPercent,
      };
    },
    { xpBonusPercent: 0, supplyReductionPercent: 0 },
  );
}
