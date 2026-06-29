import { CapacityBar } from "./CapacityBar";
import { InventoryItemRow } from "./InventoryItemRow";
import type { Character, InventoryItem } from "../../shared/types";

interface InventoryPanelProps {
  character: Character;
  onSendToDepot: (inventoryItem: InventoryItem) => void;
  onEquipItem: (inventoryItem: InventoryItem) => void;
}

export function InventoryPanel({
  character,
  onEquipItem,
  onSendToDepot,
}: InventoryPanelProps) {
  return (
    <div className="inventory-panel">
      <CapacityBar used={character.capacityUsed} max={character.capacityMax} />
      <div className="inventory-list">
        {character.inventory.length > 0 ? (
          character.inventory.map((inventoryItem) => (
            <InventoryItemRow
              actionLabel="Enviar para Depot"
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onEquip={onEquipItem}
              onAction={onSendToDepot}
            />
          ))
        ) : (
          <div className="empty-list">Inventory is empty.</div>
        )}
      </div>
    </div>
  );
}
