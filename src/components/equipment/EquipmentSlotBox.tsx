import type { EquipmentSlot, InventoryItem } from "../../shared/types";
import { getImbuementById } from "../../data/imbuements";
import { formatEnhancedItemName, getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import { ItemQualityBadge } from "../items/ItemQualityBadge";

interface EquipmentSlotBoxProps {
  slot: EquipmentSlot;
  label: string;
  item?: InventoryItem;
  onUnequip: (slot: EquipmentSlot) => void;
}

export function EquipmentSlotBox({ slot, label, item, onUnequip }: EquipmentSlotBoxProps) {
  const identity = item ? getItemVisualIdentity(item.item, item) : undefined;
  return (
    <article className={`equipment-slot equipment-slot-${slot} ${identity?.surfaceClassName ?? ""}`.trim()}>
      <span className="equipment-slot-name">{label}</span>
      {item ? (
        <>
          <strong>{formatEnhancedItemName(item)}</strong>
          <ItemQualityBadge compact inventoryItem={item} />
          <small>{formatItemStats(item)}</small>
          {item.imbuements?.length ? (
            <small>
              {item.imbuements.map((active) => {
                const definition = getImbuementById(active.imbuementId);
                return `${definition?.name ?? active.imbuementId}: ${active.remainingHunts ?? 0} hunts`;
              }).join(" / ")}
            </small>
          ) : null}
          <button onClick={() => onUnequip(slot)} type="button">
            Remover
          </button>
        </>
      ) : (
        <em>vazio</em>
      )}
    </article>
  );
}

function formatItemStats(inventoryItem: InventoryItem) {
  const item = inventoryItem.item;
  const stats = [
    item.attack ? `Atk ${item.attack}` : undefined,
    item.defense ? `Def ${item.defense}` : undefined,
    item.armor ? `Arm ${item.armor}` : undefined,
    item.magicPower ? `Magic ${item.magicPower}` : undefined,
    item.distancePower ? `Dist ${item.distancePower}` : undefined,
    item.fistPower ? `Fist ${item.fistPower}` : undefined,
    item.capacityBonus ? `Cap +${item.capacityBonus}` : undefined,
  ].filter(Boolean);

  return stats.length > 0 ? stats.join(" / ") : item.rarity;
}
