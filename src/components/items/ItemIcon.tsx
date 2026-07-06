import { getInventoryItemBadges, getItemIconMeta } from "./itemIconMeta";
import type { InventoryItem, Item } from "../../shared/types";

interface ItemIconProps {
  item?: Item;
  inventoryItem?: InventoryItem;
  quantity?: number;
  size?: "small" | "medium" | "large";
  equipped?: boolean;
  selected?: boolean;
  showQuantity?: boolean;
  showRarity?: boolean;
  showBadges?: boolean;
}

export function ItemIcon({
  item,
  inventoryItem,
  quantity,
  size = "medium",
  equipped = false,
  selected = false,
  showQuantity = true,
  showRarity = true,
  showBadges = true,
}: ItemIconProps) {
  const iconItem = inventoryItem?.item ?? item;
  const iconQuantity = quantity ?? inventoryItem?.quantity;
  const meta = getItemIconMeta(iconItem);
  const rarity = iconItem?.rarity ?? "common";
  const badges = showBadges ? getInventoryItemBadges(inventoryItem, equipped) : [];

  return (
    <div
      aria-label={iconItem?.name ?? "Empty item slot"}
      className={[
        "item-icon",
        `item-icon-${size}`,
        `item-icon-tone-${meta.tone}`,
        showRarity ? `item-rarity-${rarity}` : "",
        inventoryItem?.locked ? "is-locked" : "",
        equipped ? "is-equipped" : "",
        selected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      title={iconItem ? `${iconItem.name} / ${meta.label}` : "Empty"}
    >
      <strong>{meta.symbol}</strong>
      {showQuantity && iconQuantity && iconQuantity > 1 ? (
        <span className="item-quantity">x{iconQuantity}</span>
      ) : null}
      {badges.length > 0 ? (
        <div className="item-badge-row">
          {badges.slice(0, 3).map((badge) => (
            <em className="item-badge" key={badge}>{badge}</em>
          ))}
        </div>
      ) : null}
    </div>
  );
}
