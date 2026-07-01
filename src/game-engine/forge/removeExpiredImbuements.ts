import { getImbuementById } from "../../data/imbuements";
import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import type { Character, InventoryItem } from "../../shared/types";

export function decrementHuntImbuements(character: Character) {
  const logs: string[] = [];
  const updateItem = (item?: InventoryItem) => {
    if (!item?.imbuements?.length) return item;

    const active = item.imbuements.flatMap((imbuement) => {
      const remaining = (imbuement.remainingHunts ?? 0) - 1;
      const definition = getImbuementById(imbuement.imbuementId);

      if (remaining <= 0) {
        logs.push(`${definition?.name ?? "Imbuement"} expirou em ${item.item.name}.`);
        return [];
      }

      if (definition) {
        logs.push(`${definition.name}: ${remaining} hunts restantes em ${item.item.name}.`);
      }

      return [{ ...imbuement, remainingHunts: remaining }];
    });

    return { ...item, imbuements: active };
  };

  const equipment = Object.fromEntries(
    Object.entries(character.equipment).map(([slot, item]) => [slot, updateItem(item)]),
  ) as Character["equipment"];
  const updatedCharacter = { ...character, equipment };
  const attributes = calculateCharacterAttributes(updatedCharacter);

  return {
    character: { ...updatedCharacter, attributes, capacityMax: attributes.capacity },
    logs,
  };
}
