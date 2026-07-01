import type { EquipmentSlot, InventoryItem } from "../../shared/types";
import { getImbuementById } from "../../data/imbuements";

interface EquipmentSlotBoxProps {
  slot: EquipmentSlot;
  label: string;
  item?: InventoryItem;
  onUnequip: (slot: EquipmentSlot) => void;
}

export function EquipmentSlotBox({ slot, label, item, onUnequip }: EquipmentSlotBoxProps) {
  return (
    <article className={`equipment-slot equipment-slot-${slot} ${item ? `rarity-${item.item.rarity}` : ""}`.trim()}>
      <span className="equipment-slot-name">{label}</span>
      {item ? (
        <>
          <strong>{formatEnhancedName(item)}</strong>
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

function formatEnhancedName(inventoryItem: InventoryItem) {
  const upgrade = inventoryItem.upgradeLevel ? ` +${inventoryItem.upgradeLevel}` : "";
  const tier = inventoryItem.tier ? ` [T${inventoryItem.tier}]` : "";
  return `${inventoryItem.item.name}${upgrade}${tier}`;
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
