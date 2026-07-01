import { getItemTierCost } from "./getItemTierCost";
import { hasForgeMaterials } from "./consumeForgeMaterials";
import { isForgeEligibleItem } from "./forgeInventoryHelpers";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function canIncreaseItemTier(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
) {
  if (!isForgeEligibleItem(inventoryItem)) return { canIncrease: false, reason: "Item nao pode receber tier." };
  if ((inventoryItem.tier ?? 0) >= 3) return { canIncrease: false, reason: "Item ja esta no tier maximo." };

  const cost = getItemTierCost(inventoryItem.tier ?? 0);
  if (!cost) return { canIncrease: false, reason: "Custo de tier nao encontrado." };
  if (guild.gold < cost.goldCost) return { canIncrease: false, reason: "Gold insuficiente." };

  const materials = hasForgeMaterials(character, guildDepot, cost.requiredMaterials);
  if (!materials.hasMaterials) {
    const missing = materials.missing[0];
    return { canIncrease: false, reason: `Material insuficiente: ${missing.itemId} x${missing.quantity - missing.available}.` };
  }

  return { canIncrease: true, cost };
}
