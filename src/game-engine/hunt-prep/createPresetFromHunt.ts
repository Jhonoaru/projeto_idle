import type { Character, HuntArea, HuntSupplyPreset, HuntSupplyPresetItem } from "../../shared/types";

export function createPresetFromHunt(
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
): HuntSupplyPreset {
  const durationFactor = durationMinutes / 60;
  const now = new Date().toISOString();
  const items: HuntSupplyPresetItem[] = (hunt.supplies ?? [])
    .filter(
      (supply) =>
        !supply.requiredForVocation || supply.requiredForVocation.includes(character.vocation),
    )
    .map((supply) => ({
      itemId: supply.itemId,
      quantity: Math.ceil(supply.recommendedQuantityPerHour * durationFactor),
      targetContainerType: getTargetContainerType(supply.supplyType),
    }))
    .filter((item) => item.quantity > 0);

  return {
    id: `preset-${hunt.id}-${character.id}-${Date.now()}`,
    name: `${hunt.name} ${durationMinutes}min`,
    huntId: hunt.id,
    characterId: character.id,
    vocation: character.vocation,
    durationMinutes,
    items,
    createdAt: now,
    updatedAt: now,
  };
}

function getTargetContainerType(supplyType: string) {
  if (supplyType === "rune") return "rune_pouch" as const;
  if (supplyType === "ammo") return "quiver" as const;
  if (supplyType === "health_potion" || supplyType === "mana_potion" || supplyType === "utility") {
    return "supply_bag" as const;
  }
  return undefined;
}
