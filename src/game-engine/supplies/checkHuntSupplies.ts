import type {
  Character,
  HuntArea,
  SupplyCheckEntry,
  SupplyCheckResult,
} from "../../shared/types";
import { getAvailableSupplies } from "./getAvailableSupplies";

export function checkHuntSupplies(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
): SupplyCheckResult {
  const available = getAvailableSupplies(character);
  const durationFactor = durationMinutes / 60;
  const entries: SupplyCheckEntry[] = (hunt.supplies ?? [])
    .filter(
      (requirement) =>
        !requirement.requiredForVocation ||
        requirement.requiredForVocation.includes(character.vocation),
    )
    .map((requirement) => {
      const requiredQuantity = Math.ceil(
        requirement.recommendedQuantityPerHour * durationFactor,
      );
      const availableQuantity = available.get(requirement.itemId) ?? 0;

      return {
        itemId: requirement.itemId,
        itemName: requirement.itemName,
        supplyType: requirement.supplyType,
        requiredQuantity,
        availableQuantity,
        missingQuantity: Math.max(0, requiredQuantity - availableQuantity),
        optional: requirement.optional === true,
      };
    });
  const missingSupplies = entries.filter(
    (entry) => entry.missingQuantity > 0 && !entry.optional,
  );
  const optionalMissing = entries.filter(
    (entry) => entry.missingQuantity > 0 && entry.optional,
  );

  return {
    hasRequiredSupplies: missingSupplies.length === 0,
    missingSupplies,
    availableSupplies: entries,
    warnings: optionalMissing.map(
      (entry) => `Faltam ${entry.missingQuantity} ${entry.itemName}.`,
    ),
  };
}
