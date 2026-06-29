import { CapacityBar } from "./CapacityBar";
import { InventoryItemRow } from "./InventoryItemRow";
import type { Character, InventoryItem } from "../../shared/types";

interface InventoryPanelProps {
  character: Character;
  onSendToDepot: (inventoryItem: InventoryItem) => void;
  onSendToGuildDepot?: (inventoryItem: InventoryItem) => void;
  onEquipItem: (inventoryItem: InventoryItem) => void;
  onToggleLock?: (inventoryItem: InventoryItem) => void;
}

export function InventoryPanel({
  character,
  onEquipItem,
  onSendToDepot,
  onSendToGuildDepot,
  onToggleLock,
}: InventoryPanelProps) {
  return (
    <div className="inventory-panel">
      <CapacityBar used={character.capacityUsed} max={character.capacityMax} />
      <div className="inventory-list">
        {character.inventory.length > 0 ? (
          character.inventory.map((inventoryItem) => (
            <InventoryItemRow
              actionLabel="Enviar para Depot Pessoal"
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onEquip={onEquipItem}
              onAction={onSendToDepot}
              onSecondaryAction={onSendToGuildDepot}
              onToggleLock={onToggleLock}
              secondaryActionLabel={onSendToGuildDepot ? "Enviar para Guild Depot" : undefined}
            />
          ))
        ) : (
          <div className="empty-list">Inventory is empty.</div>
        )}
      </div>
    </div>
  );
}
