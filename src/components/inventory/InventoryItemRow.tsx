import type { InventoryItem } from "../../shared/types";

interface InventoryItemRowProps {
  inventoryItem: InventoryItem;
  actionLabel?: string;
  onAction?: (inventoryItem: InventoryItem) => void;
  onEquip?: (inventoryItem: InventoryItem) => void;
}

export function InventoryItemRow({
  inventoryItem,
  actionLabel,
  onAction,
  onEquip,
}: InventoryItemRowProps) {
  const totalWeight = inventoryItem.item.weight * inventoryItem.quantity;
  const totalValue = inventoryItem.item.value * inventoryItem.quantity;

  return (
    <article className={`inventory-row rarity-${inventoryItem.item.rarity}`}>
      <div>
        <h3>{inventoryItem.item.name}</h3>
        <p>
          {inventoryItem.item.type} / {inventoryItem.item.rarity}
        </p>
      </div>
      <div className="inventory-numbers">
        <span>x{inventoryItem.quantity}</span>
        <span>{totalWeight.toFixed(2)} cap</span>
        <strong>{totalValue.toLocaleString("en-US")}g</strong>
      </div>
      <div className="inventory-actions">
        {inventoryItem.item.type === "equipment" && onEquip ? (
          <button onClick={() => onEquip(inventoryItem)} type="button">
            Equipar
          </button>
        ) : null}
        {actionLabel && onAction ? (
          <button onClick={() => onAction(inventoryItem)} type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
