import type { InventoryItem } from "../../shared/types";
import { getImbuementById } from "../../data/imbuements";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";

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
  const sellStatus = canSellItem(inventoryItem);

  return (
    <article className={`inventory-row rarity-${inventoryItem.item.rarity} ${inventoryItem.locked ? "is-locked" : ""}`.trim()}>
      <div className="inventory-row-icon">
        <ItemIcon inventoryItem={inventoryItem} />
        <ItemTooltip inventoryItem={inventoryItem} sellReason={sellStatus.reason} />
      </div>
      <div>
        <h3>{formatEnhancedName(inventoryItem)}</h3>
        <p>
          {inventoryItem.item.type} / {inventoryItem.item.rarity}
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
        <span>x{inventoryItem.quantity}</span>
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

function formatEnhancedName(inventoryItem: InventoryItem) {
  const upgrade = inventoryItem.upgradeLevel ? ` +${inventoryItem.upgradeLevel}` : "";
  const tier = inventoryItem.tier ? ` [T${inventoryItem.tier}]` : "";
  return `${inventoryItem.item.name}${upgrade}${tier}`;
}
