import { calculateInventoryItemSellValue } from "../../game-engine/market/calculateSellValue";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { ItemQualityBadge } from "../items/ItemQualityBadge";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { InventoryItem, SellSource } from "../../shared/types";

interface MarketItemRowProps {
  inventoryItem: InventoryItem;
  sourceItems: InventoryItem[];
  source: SellSource;
  selected: boolean;
  actionsDisabled?: boolean;
  onToggleSelected: (inventoryItemId: string) => void;
  onSellOne: (inventoryItemId: string) => void;
  onToggleLock: (inventoryItemId: string) => void;
}

export function MarketItemRow({
  inventoryItem,
  sourceItems,
  source,
  selected,
  actionsDisabled = false,
  onToggleSelected,
  onSellOne,
  onToggleLock,
}: MarketItemRowProps) {
  const value = calculateInventoryItemSellValue(inventoryItem);
  const sellStatus = canSellItem(inventoryItem, sourceItems);
  const disabled = !sellStatus.canSell;
  const identity = getItemVisualIdentity(inventoryItem.item, inventoryItem);

  return (
    <article className={`market-row ${identity.surfaceClassName} ${disabled ? "is-locked" : ""} is-${sellStatus.warningLevel}`.trim()}>
      <div className="market-row-icon">
        <ItemIcon inventoryItem={inventoryItem} size="small" />
        <ItemTooltip inventoryItem={inventoryItem} sellReason={sellStatus.reason} />
      </div>
      <label>
        <input
          checked={selected}
          disabled={disabled || actionsDisabled}
          onChange={() => onToggleSelected(inventoryItem.id)}
          type="checkbox"
        />
        <span>{inventoryItem.item.name}</span>
      </label>
      <div className="market-row-meta">
        <span>{inventoryItem.item.type}</span>
        <ItemQualityBadge compact inventoryItem={inventoryItem} />
        <span>x{inventoryItem.quantity}</span>
        <span>{sourceLabel(source)}</span>
        {sellStatus.reason ? <span className={`sell-warning is-${sellStatus.warningLevel}`}>{sellStatus.reason}</span> : null}
      </div>
      <div className="market-row-value">
        <span>{value.unitValue.toLocaleString("en-US")}g cada</span>
        <strong>{value.totalValue.toLocaleString("en-US")}g</strong>
      </div>
      <div className="market-row-actions">
        <button disabled={actionsDisabled} onClick={() => onToggleLock(inventoryItem.id)} type="button">
          {inventoryItem.locked ? "Destravar" : "Travar"}
        </button>
        <button disabled={disabled || actionsDisabled} onClick={() => onSellOne(inventoryItem.id)} type="button">
          Vender
        </button>
      </div>
    </article>
  );
}

function sourceLabel(source: SellSource) {
  if (source === "character_inventory") return "Inventário";
  if (source === "character_depot") return "Depot Personagem";
  return "Guild Depot";
}
