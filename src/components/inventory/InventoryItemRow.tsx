import type { InventoryItem } from "../../shared/types";

interface InventoryItemRowProps {
  inventoryItem: InventoryItem;
  actionLabel?: string;
  onAction?: (inventoryItem: InventoryItem) => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: (inventoryItem: InventoryItem) => void;
  onEquip?: (inventoryItem: InventoryItem) => void;
  onToggleLock?: (inventoryItem: InventoryItem) => void;
  onOpenContainer?: (inventoryItem: InventoryItem) => void;
  onMoveOutOfContainer?: (inventoryItem: InventoryItem) => void;
  moveToContainerTargets?: InventoryItem[];
  onMoveToContainer?: (inventoryItem: InventoryItem, container: InventoryItem) => void;
}

export function InventoryItemRow({
  inventoryItem,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onEquip,
  onToggleLock,
  onOpenContainer,
  onMoveOutOfContainer,
  moveToContainerTargets = [],
  onMoveToContainer,
}: InventoryItemRowProps) {
  const totalWeight = inventoryItem.item.weight * inventoryItem.quantity;
  const totalValue = inventoryItem.item.value * inventoryItem.quantity;

  return (
    <article className={`inventory-row rarity-${inventoryItem.item.rarity} ${inventoryItem.locked ? "is-locked" : ""}`.trim()}>
      <div>
        <h3>{inventoryItem.item.name}</h3>
        <p>
          {inventoryItem.item.type} / {inventoryItem.item.rarity}
          {inventoryItem.locked ? " / Travado" : ""}
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
        {inventoryItem.item.isContainer && onOpenContainer ? (
          <button onClick={() => onOpenContainer(inventoryItem)} type="button">
            Abrir
          </button>
        ) : null}
        {moveToContainerTargets.map((container) => (
          <button
            key={container.id}
            onClick={() => onMoveToContainer?.(inventoryItem, container)}
            type="button"
          >
            Mover para {container.item.name}
          </button>
        ))}
        {inventoryItem.parentContainerId && onMoveOutOfContainer ? (
          <button onClick={() => onMoveOutOfContainer(inventoryItem)} type="button">
            Tirar da mochila
          </button>
        ) : null}
        {actionLabel && onAction ? (
          <button onClick={() => onAction(inventoryItem)} type="button">
            {actionLabel}
          </button>
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <button onClick={() => onSecondaryAction(inventoryItem)} type="button">
            {secondaryActionLabel}
          </button>
        ) : null}
        {onToggleLock ? (
          <button onClick={() => onToggleLock(inventoryItem)} type="button">
            {inventoryItem.locked ? "Destravar" : "Travar"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
