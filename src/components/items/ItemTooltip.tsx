import { getImbuementById } from "../../data/imbuements";
import { calculateInventoryItemSellValue } from "../../game-engine/market/calculateSellValue";
import { formatEnhancedItemName, getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { InventoryItem } from "../../shared/types";
import { ItemQualityBadge } from "./ItemQualityBadge";
import { ItemProgressionBadge } from "./ItemProgressionBadge";
import { getEquipmentProgression } from "../../game-engine/items/getEquipmentProgression";

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
  const identity = getItemVisualIdentity(item, inventoryItem);
  const progression = item.type === "equipment" ? getEquipmentProgression(item) : undefined;

  return (
    <div className={`item-tooltip ${identity.surfaceClassName}`}>
      <strong>{formatEnhancedItemName(inventoryItem)}</strong>
      <ItemQualityBadge inventoryItem={inventoryItem} />
      <ItemProgressionBadge item={item} />
      <span>{item.type}</span>
      <p>{item.description}</p>
      <div className="item-tooltip-grid">
        <TooltipLine label="Quantity" value={`x${normalizeQuantity(inventoryItem.quantity)}`} />
        <TooltipLine label="Sell Value" value={`${sellValue.totalValue.toLocaleString("en-US")}g`} />
        <TooltipLine label="Weight" value={`${(item.weight * normalizeQuantity(inventoryItem.quantity)).toFixed(2)} cap`} />
        {item.equipmentSlot ? <TooltipLine label="Slot" value={item.equipmentSlot} /> : null}
        {item.levelRequirement ? <TooltipLine label="Level" value={item.levelRequirement} /> : null}
        {item.vocationRestriction ? <TooltipLine label="Vocation" value={item.vocationRestriction.join(", ")} /> : null}
        {progression ? <TooltipLine label="Family" value={progression.family.label} /> : null}
        {progression ? <TooltipLine label="Gear band" value={progression.band.label} /> : null}
        <TooltipLine label="Upgrade" value={identity.upgradeLabel} />
        <TooltipLine label="Forge rank" value={identity.tierLabel} />
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
