import { useState } from "react";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { canSellItem } from "../../game-engine/market/canSellItem";
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
  const hoveredItem = items.find((item) => item.id === hoveredItemId);
  const slots = Math.max(emptySlots, Math.ceil(items.length / 8) * 8) || 8;

  return (
    <div className="inventory-grid-wrap">
      <div className="inventory-grid">
        {items.map((inventoryItem) => {
          const sellStatus = canSellItem(inventoryItem, items);
          const equipped = equippedItemIds.has(inventoryItem.id);

          return (
            <button
              className={selectedItemId === inventoryItem.id ? "item-slot is-selected" : "item-slot"}
              key={inventoryItem.id}
              onClick={() => {
                onSelectItem?.(inventoryItem);
                if (inventoryItem.item.isContainer) onOpenContainer?.(inventoryItem);
              }}
              onMouseEnter={() => setHoveredItemId(inventoryItem.id)}
              onMouseLeave={() => setHoveredItemId(undefined)}
              type="button"
            >
              <ItemIcon
                equipped={equipped}
                inventoryItem={inventoryItem}
                selected={selectedItemId === inventoryItem.id}
                size="medium"
              />
              <span>{inventoryItem.item.name}</span>
              {hoveredItemId === inventoryItem.id ? (
                <ItemTooltip
                  equipped={equipped}
                  inventoryItem={inventoryItem}
                  sellReason={sellStatus.reason}
                />
              ) : null}
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, slots - items.length) }).map((_, index) => (
          <div className="item-slot is-empty" key={`empty-${index}`}>
            <ItemIcon showBadges={false} showQuantity={false} showRarity={false} size="medium" />
          </div>
        ))}
      </div>
      {hoveredItem && (
        <div className="inventory-grid-active-tooltip">
          <ItemTooltip
            equipped={equippedItemIds.has(hoveredItem.id)}
            inventoryItem={hoveredItem}
            sellReason={canSellItem(hoveredItem, items).reason}
          />
        </div>
      )}
    </div>
  );
}
