import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { InventoryItem, Item } from "../../shared/types";

interface ItemQualityBadgeProps {
  item?: Item;
  inventoryItem?: InventoryItem;
  compact?: boolean;
}

export function ItemQualityBadge({ item, inventoryItem, compact = false }: ItemQualityBadgeProps) {
  const identity = getItemVisualIdentity(inventoryItem?.item ?? item, inventoryItem);

  return (
    <span className={`item-quality-badge ${identity.className} ${compact ? "is-compact" : ""}`}>
      <i aria-hidden="true" />
      <strong>{identity.rarityLabel}</strong>
      <em>{identity.tierLabel}</em>
    </span>
  );
}
