import { getItemUpgradeCost } from "./getItemUpgradeCost";
import { hasForgeMaterials } from "./consumeForgeMaterials";
import { findCharacterItem, isForgeEligibleItem } from "./forgeInventoryHelpers";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";

export function canUpgradeItem(
  character: Character,
  guild: Guild,
  guildDepot: GuildDepot,
  inventoryItem: InventoryItem,
) {
  const current = findCharacterItem(character, inventoryItem.id)?.item;
  if (!current) return { canUpgrade: false, reason: "Item nao pertence ao personagem." };
  inventoryItem = current;
  if (!isForgeEligibleItem(inventoryItem)) return { canUpgrade: false, reason: "Item nao pode receber upgrade." };
  if ((inventoryItem.upgradeLevel ?? 0) >= 5) return { canUpgrade: false, reason: "Item ja esta no nivel maximo." };

  const cost = getItemUpgradeCost(inventoryItem.upgradeLevel ?? 0);
  if (!cost) return { canUpgrade: false, reason: "Custo de upgrade nao encontrado." };
  if (!Number.isFinite(guild.gold) || guild.gold < cost.goldCost) return { canUpgrade: false, reason: "Gold insuficiente ou invalido." };

  const materials = hasForgeMaterials(character, guildDepot, cost.requiredMaterials);
  if (!materials.hasMaterials) {
    const missing = materials.missing[0];
    return { canUpgrade: false, reason: `Material insuficiente: ${missing.itemId} x${missing.quantity - missing.available}.` };
  }

  return { canUpgrade: true, cost };
}
