import type { InventoryItem } from "../../shared/types";

export interface SellItemStatus {
  canSell: boolean;
  reason?: string;
  warningLevel: "none" | "warning" | "danger";
}

export function canSellItem(
  inventoryItem: InventoryItem | undefined,
  sourceItems: InventoryItem[] = [],
): SellItemStatus {
  if (!inventoryItem || !inventoryItem.item) {
    return blocked("Item invalido.");
  }

  const item = inventoryItem.item;
  const quantity = Number.isFinite(inventoryItem.quantity) ? inventoryItem.quantity : 0;

  if (quantity <= 0) return blocked(`${item.name} nao possui quantidade valida.`);
  if (inventoryItem.locked) return blocked(`${item.name} esta travado contra venda.`);
  if (inventoryItem.parentContainerId) return blocked(`${item.name} esta dentro de um container. Tire da mochila antes de vender.`);
  if (item.type === "quest") return blocked(`${item.name} e item de quest.`);
  if ((inventoryItem.imbuements ?? []).length > 0) return blocked(`${item.name} possui imbuement ativo.`);
  if (item.isContainer && sourceItems.some((entry) => entry.parentContainerId === inventoryItem.id)) {
    return blocked("Esvazie esta mochila antes de vender.");
  }
  if (!Number.isFinite(item.value) || item.value <= 0) return blocked(`${item.name} nao possui valor de venda.`);

  const warnings = [
    inventoryItem.upgradeLevel && inventoryItem.upgradeLevel > 0 ? `+${inventoryItem.upgradeLevel}` : undefined,
    inventoryItem.tier && inventoryItem.tier > 0 ? `tier ${inventoryItem.tier}` : undefined,
    item.type === "equipment" ? "equipamento" : undefined,
    item.type === "consumable" ? "supply util" : undefined,
    item.rarity !== "common" ? `${item.rarity}` : undefined,
  ].filter(Boolean);

  if (warnings.length > 0) {
    return {
      canSell: true,
      reason: `Cuidado: ${item.name} e ${warnings.join(", ")}.`,
      warningLevel: "warning",
    };
  }

  return { canSell: true, warningLevel: "none" };
}

function blocked(reason: string): SellItemStatus {
  return { canSell: false, reason, warningLevel: "danger" };
}
