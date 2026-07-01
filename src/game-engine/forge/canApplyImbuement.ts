import { getImbuementApplicationStatus } from "./getImbuementApplicationStatus";
import type { Character, EquipmentSlot, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function canApplyImbuement(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
  equipmentSlot: EquipmentSlot | undefined,
  imbuementId: string,
) {
  const check = getImbuementApplicationStatus(
    character,
    guild,
    guildDepot,
    inventoryItem,
    equipmentSlot,
    imbuementId,
  );

  return {
    canApply: check.canApply,
    reason: check.reason,
    imbuement: check.imbuement,
    slot: check.slot,
    status: check.status,
    willReplaceImbuementId: check.willReplaceImbuementId,
  };
}
