import { getImbuementById } from "../../data/imbuements";
import { calculateInventoryItemSellValue } from "../../game-engine/market/calculateSellValue";
import type { InventoryItem } from "../../shared/types";

interface ItemTooltipProps {
  inventoryItem?: InventoryItem;
  equipped?: boolean;
  sellReason?: string;
}

export function ItemTooltip({ inventoryItem, equipped = false, sellReason }: ItemTooltipProps) {
  if (!inventoryItem) {
    return (
      <div className="item-tooltip">
        <strong>Empty Slot</strong>
        <p>No item here.</p>
      </div>
    );
  }

  const item = inventoryItem.item;
  const sellValue = calculateInventoryItemSellValue(inventoryItem);
  const imbuements = inventoryItem.imbuements ?? [];

  return (
    <div className={`item-tooltip rarity-${item.rarity}`}>
      <strong>{formatEnhancedName(inventoryItem)}</strong>
      <span>{item.type} / {item.rarity}</span>
      <p>{item.description}</p>
      <div className="item-tooltip-grid">
        <TooltipLine label="Quantity" value={`x${normalizeQuantity(inventoryItem.quantity)}`} />
        <TooltipLine label="Sell Value" value={`${sellValue.totalValue.toLocaleString("en-US")}g`} />
        <TooltipLine label="Weight" value={`${(item.weight * normalizeQuantity(inventoryItem.quantity)).toFixed(2)} cap`} />
        {item.equipmentSlot ? <TooltipLine label="Slot" value={item.equipmentSlot} /> : null}
        {item.levelRequirement ? <TooltipLine label="Level" value={item.levelRequirement} /> : null}
        {item.vocationRestriction ? <TooltipLine label="Vocation" value={item.vocationRestriction.join(", ")} /> : null}
        {inventoryItem.upgradeLevel ? <TooltipLine label="Upgrade" value={`+${inventoryItem.upgradeLevel}`} /> : null}
        {inventoryItem.tier ? <TooltipLine label="Tier" value={`T${inventoryItem.tier}`} /> : null}
        {item.isContainer ? <TooltipLine label="Container" value={item.containerType ?? "generic"} /> : null}
      </div>
      <div className="item-tooltip-status">
        {equipped ? <em>Equipped</em> : null}
        {inventoryItem.locked ? <em>Locked</em> : null}
        {item.type === "quest" ? <em>Quest item</em> : null}
        {item.isContainer ? <em>Container</em> : null}
      </div>
      {imbuements.length > 0 ? (
        <div className="item-tooltip-imbuements">
          <span>Imbuements</span>
          {imbuements.map((active) => {
            const definition = getImbuementById(active.imbuementId);
            return (
              <small key={`${active.imbuementId}-${active.appliedAt}`}>
                {definition?.name ?? active.imbuementId}: {active.remainingHunts ?? 0} hunts
              </small>
            );
          })}
        </div>
      ) : null}
      {sellReason ? <p className="item-tooltip-warning">{sellReason}</p> : null}
    </div>
  );
}

function TooltipLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function formatEnhancedName(inventoryItem: InventoryItem) {
  const upgrade = inventoryItem.upgradeLevel ? ` +${inventoryItem.upgradeLevel}` : "";
  const tier = inventoryItem.tier ? ` [T${inventoryItem.tier}]` : "";
  return `${inventoryItem.item.name}${upgrade}${tier}`;
}
