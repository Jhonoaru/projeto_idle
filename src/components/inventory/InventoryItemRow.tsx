import type { InventoryItem } from "../../shared/types";
import { getImbuementById } from "../../data/imbuements";
import { calculateInventoryItemSellValue } from "../../game-engine/market/calculateSellValue";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { ItemQualityBadge } from "../items/ItemQualityBadge";
import { formatEnhancedItemName, getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";

interface InventoryItemRowProps {
  inventoryItem: InventoryItem;
  sourceItems?: InventoryItem[];
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
  sourceItems,
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
  const quantity = normalizeQuantity(inventoryItem.quantity);
  const totalWeight = inventoryItem.item.weight * quantity;
  const totalValue = calculateInventoryItemSellValue(inventoryItem).totalValue;
  const sellStatus = canSellItem(inventoryItem, sourceItems);
  const identity = getItemVisualIdentity(inventoryItem.item, inventoryItem);

  return (
    <article className={`inventory-row ${identity.surfaceClassName} ${inventoryItem.locked ? "is-locked" : ""}`.trim()}>
      <div className="inventory-row-icon">
        <ItemIcon inventoryItem={inventoryItem} />
        <ItemTooltip inventoryItem={inventoryItem} sellReason={sellStatus.reason} />
      </div>
      <div>
        <h3>{formatEnhancedItemName(inventoryItem)}</h3>
        <ItemQualityBadge compact inventoryItem={inventoryItem} />
        <p>
          {inventoryItem.item.type}
          {inventoryItem.locked ? " / Travado" : ""}
          {inventoryItem.imbuements?.length ? ` / ${inventoryItem.imbuements.length} imbuement(s)` : ""}
        </p>
        {inventoryItem.imbuements?.length ? (
          <p>
            {inventoryItem.imbuements.map((active) => {
              const definition = getImbuementById(active.imbuementId);
              return `${definition?.name ?? active.imbuementId}: ${active.remainingHunts ?? 0} hunts`;
            }).join(" / ")}
          </p>
        ) : null}
      </div>
      <div className="inventory-numbers">
        <span>x{quantity}</span>
        <span>{totalWeight.toFixed(2)} cap</span>
        <strong>{totalValue.toLocaleString("en-US")}g</strong>
        {sellStatus.reason ? <em className={`sell-warning is-${sellStatus.warningLevel}`}>{sellStatus.reason}</em> : null}
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

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}
