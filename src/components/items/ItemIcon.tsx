import { getInventoryItemBadges, getItemIconMeta } from "./itemIconMeta";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import { getEquipmentProgression } from "../../game-engine/items/getEquipmentProgression";
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
  const identity = getItemVisualIdentity(iconItem, inventoryItem);
  const progression = iconItem?.type === "equipment" ? getEquipmentProgression(iconItem) : undefined;
  const badges = showBadges ? getInventoryItemBadges(inventoryItem, equipped) : [];

  return (
    <div
      aria-label={iconItem?.name ?? "Empty item slot"}
      className={[
        "item-icon",
        `item-icon-${size}`,
        `item-icon-tone-${meta.tone}`,
        showRarity ? identity.className : "",
        inventoryItem?.locked ? "is-locked" : "",
        equipped ? "is-equipped" : "",
        selected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      title={iconItem ? `${iconItem.name} / ${identity.combinedLabel}${progression ? ` / ${progression.family.label} / ${progression.band.label}` : ""} / ${meta.label}` : "Empty"}
    >
      <strong>{meta.symbol}</strong>
      {showQuantity && iconQuantity && iconQuantity > 1 ? (
        <span className="item-quantity">x{iconQuantity}</span>
      ) : null}
      {showRarity && identity.tier > 0 ? <span className="item-tier-mark">T{identity.tier}</span> : null}
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
