import { calculateCapacityUsed } from "../../game-engine/inventory/calculateCapacityUsed";
import { InventoryGrid } from "./InventoryGrid";
import { InventoryItemRow } from "./InventoryItemRow";
import type { GuildDepot, InventoryItem } from "../../shared/types";

interface GuildDepotPanelProps {
  depot: GuildDepot;
  onSendToCharacter: (inventoryItem: InventoryItem) => void;
  onToggleLock?: (inventoryItem: InventoryItem) => void;
}

export function GuildDepotPanel({
  depot,
  onSendToCharacter,
  onToggleLock,
}: GuildDepotPanelProps) {
  const capacityUsed = depot.capacityUsed ?? calculateCapacityUsed(depot.items);

  return (
    <div className="inventory-panel">
      <div className="depot-summary">
        <div>
          <span>Stored Gold</span>
          <strong>{depot.goldStored.toLocaleString("en-US")}g</strong>
        </div>
        <div>
          <span>Stored Weight</span>
          <strong>{capacityUsed.toFixed(2)} cap</strong>
        </div>
      </div>
      <InventoryGrid emptySlots={24} items={depot.items} />
      <div className="inventory-list">
        {depot.items.length > 0 ? (
          depot.items.map((inventoryItem) => (
            <InventoryItemRow
              actionLabel="Enviar para Personagem"
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onAction={onSendToCharacter}
              onToggleLock={onToggleLock}
            />
          ))
        ) : (
          <div className="empty-list">Guild Depot is empty.</div>
        )}
      </div>
    </div>
  );
}
