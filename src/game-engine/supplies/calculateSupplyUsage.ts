import { getItemById } from "../../data/items";
import type { Character, HuntArea, HuntSupplyUsage } from "../../shared/types";
import { getAvailableSupplies } from "./getAvailableSupplies";

export function calculateSupplyUsage(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
) {
  const available = getAvailableSupplies(character);
  const durationFactor = durationMinutes / 60;

  return (hunt.supplies ?? [])
    .filter(
      (requirement) =>
        !requirement.requiredForVocation ||
        requirement.requiredForVocation.includes(character.vocation),
    )
    .map((requirement): HuntSupplyUsage => {
      const requiredQuantity = Math.ceil(
        requirement.recommendedQuantityPerHour * durationFactor,
      );
      const availableQuantity = available.get(requirement.itemId) ?? 0;
      const quantityUsed = requirement.optional
        ? Math.min(requiredQuantity, availableQuantity)
        : requiredQuantity;
      const item = getItemById(requirement.itemId);

      return {
        itemId: requirement.itemId,
        itemName: requirement.itemName,
        quantityUsed,
        valueUsed: quantityUsed * item.value,
        supplyType: requirement.supplyType,
      };
    })
    .filter((usage) => usage.quantityUsed > 0);
}
