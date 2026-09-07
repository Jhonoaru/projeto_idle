import { useState } from "react";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { InventoryItem } from "../../shared/types";

interface InventoryGridProps {
  items: InventoryItem[];
  emptySlots?: number;
  equippedItemIds?: Set<string>;
  selectedItemId?: string;
  onSelectItem?: (inventoryItem: InventoryItem) => void;
  onOpenContainer?: (inventoryItem: InventoryItem) => void;
}

export function InventoryGrid({
  items,
  emptySlots = 0,
  equippedItemIds = new Set(),
  selectedItemId,
  onSelectItem,
  onOpenContainer,
}: InventoryGridProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string | undefined>();
  const [focusedItemId, setFocusedItemId] = useState<string>();
  const inspectedItem = items.find((item) => item.id === hoveredItemId)
    ?? items.find((item) => item.id === focusedItemId)
    ?? items.find((item) => item.id === selectedItemId);
  const slots = Math.max(emptySlots, Math.ceil(items.length / 8) * 8) || 8;

  return (
    <div className="inventory-grid-wrap">
      <div className="inventory-grid">
        {items.map((inventoryItem) => {
          const identity = getItemVisualIdentity(inventoryItem.item, inventoryItem);
          const equipped = equippedItemIds.has(inventoryItem.id);

          return (
            <button
              className={`item-slot ${identity.surfaceClassName} ${selectedItemId === inventoryItem.id ? "is-selected" : ""}`}
              aria-label={`${inventoryItem.item.name}, ${identity.combinedLabel}, x${inventoryItem.quantity}${equipped ? ", equipped" : ""}`}
              aria-pressed={selectedItemId === inventoryItem.id}
              key={inventoryItem.id}
              onClick={() => {
                onSelectItem?.(inventoryItem);
                if (inventoryItem.item.isContainer) onOpenContainer?.(inventoryItem);
              }}
              onMouseEnter={() => setHoveredItemId(inventoryItem.id)}
              onMouseLeave={() => setHoveredItemId(undefined)}
              onFocus={() => setFocusedItemId(inventoryItem.id)}
              onBlur={() => setFocusedItemId(undefined)}
              type="button"
            >
              <ItemIcon
                equipped={equipped}
                inventoryItem={inventoryItem}
                selected={selectedItemId === inventoryItem.id}
                size="medium"
              />
              <span>{inventoryItem.item.name}</span>
              <small className="inventory-rarity-label">{identity.rarityLabel}</small>
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, slots - items.length) }).map((_, index) => (
          <div className="item-slot is-empty" key={`empty-${index}`}>
            <ItemIcon showBadges={false} showQuantity={false} showRarity={false} size="medium" />
          </div>
        ))}
      </div>
        <aside className="inventory-grid-active-tooltip" aria-label="Item details">
          {inspectedItem ? (
          <ItemTooltip
            equipped={equippedItemIds.has(inspectedItem.id)}
            inventoryItem={inspectedItem}
            sellReason={canSellItem(inspectedItem, items).reason}
          />
          ) : <div className="inventory-inspection-empty">Nenhum item selecionado</div>}
        </aside>
    </div>
  );
}
