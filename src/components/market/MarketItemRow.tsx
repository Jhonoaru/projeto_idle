import { calculateSellValue } from "../../game-engine/market/calculateSellValue";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import type { InventoryItem, SellSource } from "../../shared/types";

interface MarketItemRowProps {
  inventoryItem: InventoryItem;
  source: SellSource;
  selected: boolean;
  onToggleSelected: (inventoryItemId: string) => void;
  onSellOne: (inventoryItemId: string) => void;
  onToggleLock: (inventoryItemId: string) => void;
}

export function MarketItemRow({
  inventoryItem,
  source,
  selected,
  onToggleSelected,
  onSellOne,
  onToggleLock,
}: MarketItemRowProps) {
  const value = calculateSellValue(inventoryItem.item, inventoryItem.quantity);
  const sellStatus = canSellItem(inventoryItem);
  const disabled = !sellStatus.canSell;

  return (
    <article className={`market-row rarity-${inventoryItem.item.rarity} ${disabled ? "is-locked" : ""} is-${sellStatus.warningLevel}`.trim()}>
      <div className="market-row-icon">
        <ItemIcon inventoryItem={inventoryItem} size="small" />
        <ItemTooltip inventoryItem={inventoryItem} sellReason={sellStatus.reason} />
      </div>
      <label>
        <input
          checked={selected}
          disabled={disabled}
          onChange={() => onToggleSelected(inventoryItem.id)}
          type="checkbox"
        />
        <span>{inventoryItem.item.name}</span>
      </label>
      <div className="market-row-meta">
        <span>{inventoryItem.item.type}</span>
        <span>{inventoryItem.item.rarity}</span>
        <span>x{inventoryItem.quantity}</span>
        <span>{sourceLabel(source)}</span>
        {sellStatus.reason ? <span className={`sell-warning is-${sellStatus.warningLevel}`}>{sellStatus.reason}</span> : null}
      </div>
      <div className="market-row-value">
        <span>{value.unitValue.toLocaleString("en-US")}g cada</span>
        <strong>{value.totalValue.toLocaleString("en-US")}g</strong>
      </div>
      <div className="market-row-actions">
        <button onClick={() => onToggleLock(inventoryItem.id)} type="button">
          {inventoryItem.locked ? "Destravar" : "Travar"}
        </button>
        <button disabled={disabled} onClick={() => onSellOne(inventoryItem.id)} type="button">
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
